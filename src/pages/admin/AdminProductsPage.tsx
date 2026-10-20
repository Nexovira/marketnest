/**
 * @file src/pages/admin/AdminProductsPage.tsx
 * Authoritative Product Catalog Governance Portal for MarketNest Administrators.
 * Displays every product record regardless of publication status with complete
 * moderation controls: View details, Publish/Approve, Unpublish, Suspend, Archive, and Delete.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Archive,
  Trash2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Layers,
  X,
  RotateCcw
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts(search, undefined, statusFilter);
      setProducts(data || []);
    } catch (err) {
      console.warn('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleModerate = (
    product: any,
    action: 'approve' | 'publish' | 'reject' | 'unpublish' | 'hide' | 'suspend' | 'archive' | 'flag'
  ) => {
    const isDestructive = ['reject', 'unpublish', 'hide', 'suspend', 'archive', 'flag'].includes(action);

    requestConfirm({
      title: `${action.toUpperCase()} Product: ${product.title || product.name}`,
      description: isDestructive
        ? `Are you sure you want to ${action} this product? It will immediately change its status in the database and remove it from public marketplace listings.`
        : `Approve and publish this product? It will become publicly visible and searchable on MarketNest.`,
      confirmText: `Confirm ${action}`,
      danger: isDestructive,
      requireReason: isDestructive,
      onConfirm: async (reason) => {
        await adminService.moderateProduct(product.id, action, reason, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadProducts();
        if (selectedProduct?.id === product.id) {
          setSelectedProduct(null);
        }
      }
    });
  };

  const handleDelete = (product: any) => {
    requestConfirm({
      title: `DELETE Product: ${product.title || product.name}`,
      description: `This action will permanently delete "${product.title || product.name}" (ID: ${product.id}) from the database. It cannot be recovered and will not return after refresh.`,
      confirmText: 'Delete Permanently',
      danger: true,
      requireReason: true,
      onConfirm: async (reason) => {
        await adminService.deleteProduct(product.id, true, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadProducts();
        if (selectedProduct?.id === product.id) {
          setSelectedProduct(null);
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">
            Authoritative Product Catalog Governance
          </h2>
          <p className="text-xs text-[#6B726E]">
            Admin oversight for all inventory records: drafts, pending reviews, active listings, and archived products.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, SKU, seller, or ID..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-white focus:outline-hidden focus:border-[#101413] w-56 sm:w-64"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => loadProducts()}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-[#E4E7E5]">
        {[
          { id: 'all', label: 'All Listings' },
          { id: 'published', label: 'Published / Active' },
          { id: 'pending_review', label: 'Pending Review' },
          { id: 'draft', label: 'Drafts' },
          { id: 'suspended', label: 'Suspended' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'archived', label: 'Archived' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-[#101413] text-white shadow-xs'
                : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Listing</th>
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying persisted database records...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-[#6B726E] space-y-2">
                    <Package className="w-8 h-8 text-[#6B726E] mx-auto opacity-40" />
                    <p className="font-bold text-sm text-[#101413]">No Products in Database</p>
                    <p>No products match the selected status filter in the authoritative catalog.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const status = (p.status || 'draft').toLowerCase();
                  const isLive = status === 'published' || status === 'active';
                  const isSuspended = status === 'suspended';
                  const isRejected = status === 'rejected';
                  const isPending = status === 'pending_review' || status === 'pending';
                  const isArchived = status === 'archived';
                  const stockNum = p.stockCount !== undefined ? p.stockCount : p.stock || 0;

                  const imagesList: string[] = Array.isArray(p.images) && p.images.length > 0
                    ? p.images
                    : p.imageUrl
                    ? [p.imageUrl]
                    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'];

                  return (
                    <tr key={p.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imagesList[0]}
                            alt={p.title || p.name}
                            className="w-11 h-11 rounded-lg object-cover border border-[#E4E7E5] shrink-0 bg-neutral-100"
                          />
                          <div className="min-w-0 max-w-[220px]">
                            <span className="font-bold text-[#101413] block truncate text-xs">
                              {p.title || p.name || 'Untitled'}
                            </span>
                            <span className="text-[10px] text-[#6B726E] font-mono block truncate">
                              ID: {p.id}
                            </span>
                            {imagesList.length > 1 && (
                              <span className="text-[9px] font-bold text-[#0E8F5A] bg-[#E8F5EF] px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                                {imagesList.length} photos
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#101413]">
                        <span className="block truncate max-w-[140px]">
                          {p.sellerName || p.seller?.name || p.storeName || 'Merchant'}
                        </span>
                        <span className="text-[10px] text-[#6B726E] block truncate">
                          {p.sellerId ? `ID: ${p.sellerId.slice(0, 8)}...` : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E] uppercase font-bold text-[10px]">
                        {p.category || 'General'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413] tabular-nums">
                        {formatCurrency(p.price || 0)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded text-[11px] ${
                            stockNum === 0
                              ? 'bg-rose-100 text-rose-700'
                              : stockNum <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'text-[#101413] bg-neutral-100'
                          }`}
                        >
                          {stockNum}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isLive
                              ? 'bg-[#E8F5EF] text-[#0E8F5A] border border-[#0E8F5A]/20'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isSuspended
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : isArchived
                              ? 'bg-neutral-100 text-neutral-600'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E] text-[11px] tabular-nums">
                        {p.createdAt ? formatCustomerDate(p.createdAt) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(p);
                              setActiveImageIdx(0);
                            }}
                            title="Inspect product details and images"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {hasPermission('products.moderate') && (
                            <>
                              {!isLive ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleModerate(p, 'publish')}
                                  title="Approve and publish to public marketplace"
                                >
                                  Publish
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleModerate(p, 'unpublish')}
                                  title="Unpublish from public catalog"
                                >
                                  Unpublish
                                </Button>
                              )}

                              {!isSuspended && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleModerate(p, 'suspend')}
                                  title="Suspend listing"
                                  className="text-amber-700 hover:bg-amber-50"
                                >
                                  Suspend
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(p)}
                                title="Permanently delete from database"
                                className="text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E4E7E5] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded-full">
                  Product ID: {selectedProduct.id}
                </span>
                <h3 className="text-lg font-black text-[#101413] mt-1">
                  {selectedProduct.title || selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg hover:bg-[#F7F5F0] text-[#6B726E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery */}
            {(() => {
              const gallery: string[] = Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
                ? selectedProduct.images
                : selectedProduct.imageUrl
                ? [selectedProduct.imageUrl]
                : [];

              return (
                <div className="space-y-3">
                  <div className="relative aspect-video sm:aspect-2/1 bg-neutral-100 rounded-xl overflow-hidden border border-[#E4E7E5]">
                    <img
                      src={gallery[activeImageIdx] || gallery[0]}
                      alt={selectedProduct.title}
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute top-3 left-3 bg-[#101413]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Photo {activeImageIdx + 1} of {gallery.length}
                    </span>
                  </div>

                  {gallery.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {gallery.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIdx(i)}
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                            activeImageIdx === i ? 'border-[#0E8F5A]' : 'border-[#E4E7E5] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FBFBFA] p-4 rounded-xl border border-[#E4E7E5] text-xs">
              <div>
                <span className="text-[#6B726E] text-[10px] uppercase font-bold block">Price</span>
                <span className="font-mono font-bold text-sm text-[#101413]">
                  {formatCurrency(selectedProduct.price || 0)}
                </span>
              </div>
              <div>
                <span className="text-[#6B726E] text-[10px] uppercase font-bold block">Stock Available</span>
                <span className="font-mono font-bold text-sm text-[#101413]">
                  {selectedProduct.stockCount ?? selectedProduct.stock ?? 0} units
                </span>
              </div>
              <div>
                <span className="text-[#6B726E] text-[10px] uppercase font-bold block">Category</span>
                <span className="font-bold text-[#101413] capitalize">
                  {selectedProduct.category || 'General'}
                </span>
              </div>
              <div>
                <span className="text-[#6B726E] text-[10px] uppercase font-bold block">Current Status</span>
                <span className="font-bold text-[#0E8F5A] capitalize">
                  {selectedProduct.status || 'Draft'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1 text-xs">
              <span className="text-[#6B726E] font-bold uppercase text-[10px]">Description</span>
              <p className="text-[#101413] leading-relaxed bg-white p-3 rounded-lg border border-[#E4E7E5]">
                {selectedProduct.description || selectedProduct.shortDescription || 'No description provided.'}
              </p>
            </div>

            {/* Seller Information */}
            <div className="bg-[#F7F5F0] p-4 rounded-xl border border-[#E4E7E5] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#6B726E] uppercase font-bold block">Merchant Seller</span>
                <span className="font-bold text-[#101413]">
                  {selectedProduct.seller?.name || selectedProduct.sellerName || 'Verified Merchant'}
                </span>
                <span className="text-[10px] text-[#6B726E] block font-mono">
                  Owner ID: {selectedProduct.sellerId}
                </span>
              </div>
              <div className="text-right text-[11px] text-[#6B726E]">
                <span>Created: {formatCustomerDate(selectedProduct.createdAt)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E7E5]">
              <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
              {selectedProduct.status !== 'published' && selectedProduct.status !== 'active' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleModerate(selectedProduct, 'publish')}
                >
                  Approve & Publish to Marketplace
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerate(selectedProduct, 'unpublish')}
                >
                  Unpublish
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(selectedProduct)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
