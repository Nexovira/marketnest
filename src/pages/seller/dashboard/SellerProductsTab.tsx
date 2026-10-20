/**
 * @file src/pages/seller/dashboard/SellerProductsTab.tsx
 * Product management table and mobile cards with filtering, search, and status controls.
 */

import React, { useState } from 'react';
import { useSeller } from '../../../context/SellerContext';
import { useMarket } from '../../../context/MarketContext';
import { formatNaira } from '../../../components/ui/PriceDisplay';
import { Button } from '../../../components/ui/Button';
import { Product, ProductStatus } from '../../../types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Archive,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const SellerProductsTab: React.FC = () => {
  const { sellerProducts, archiveProductById, deleteProductById, setActiveEditProductId } = useSeller();
  const { navigateTo, showToast } = useMarket();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const filteredProducts = sellerProducts.filter((p) => {
    if (search.trim()) {
      const match = (p.title || p.name || '').toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
    }
    if (statusFilter !== 'all') {
      const currentStatus = p.status || 'active';
      if (currentStatus !== statusFilter) return false;
    }
    return true;
  });

  const handleEdit = (product: Product) => {
    setActiveEditProductId(product.id);
    navigateTo('seller-product-edit');
  };

  const handleArchive = async (productId: string) => {
    setArchivingId(productId);
    try {
      await archiveProductById(productId);
      showToast('Product Archived', 'The product has been moved to your archives.', 'info');
    } catch {
      showToast('Error', 'Could not archive product.', 'error');
    } finally {
      setArchivingId(null);
    }
  };

  const handleView = (productId: string) => {
    navigateTo('product', { productId });
  };

  const handleAddNew = () => {
    setActiveEditProductId(null);
    navigateTo('seller-product-new');
  };

  return (
    <div className="space-y-6">
      {/* Header & New Product CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Product Catalog</h2>
          <p className="text-xs text-[#6B726E]">
            Manage prices, inventory counts, and publishing status for your storefront.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNew}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name..."
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {(['all', 'active', 'draft', 'outOfStock', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`py-1.5 px-3 rounded-md font-semibold transition-colors cursor-pointer capitalize whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-[#101413] text-white'
                  : 'bg-white text-[#6B726E] hover:bg-[#F7F5F0]'
              }`}
            >
              {s === 'all' ? 'All Products' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table / Cards */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#101413]">
            {search ? 'No matching products found' : 'Your store is waiting for its first product'}
          </h3>
          <p className="text-xs text-[#6B726E] mt-1.5 leading-relaxed">
            {search
              ? 'Try adjusting your search keywords or resetting filters.'
              : 'Add your handcrafted or curated items with Nigerian Naira pricing and high-res imagery.'}
          </p>
          <div className="mt-6">
            {search ? (
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleAddNew}>
                Add Your First Product
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E] font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Inventory</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7E5]">
                {filteredProducts.map((p) => {
                  const status = p.status || 'active';
                  const stock = p.stockCount !== undefined ? p.stockCount : p.stock !== undefined ? p.stock : 10;
                  const isLow = stock <= 5 && stock > 0;
                  const isOut = stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#F7F5F0]/50 transition-colors">
                      {/* Product Thumbnail + Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || p.imageUrl || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=80'}
                            alt={p.title}
                            className="w-12 h-12 rounded object-cover border border-[#E4E7E5] bg-[#F7F5F0] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#101413] truncate max-w-xs">{p.title || p.name}</p>
                            <p className="text-[11px] text-[#6B726E] truncate">SKU: {p.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#6B726E] capitalize">
                        {p.category || 'General'}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-[#101413] tabular-nums">
                        {formatNaira(p.price)}
                      </td>

                      {/* Inventory */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`tabular-nums font-semibold ${
                            isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-[#101413]'
                          }`}
                        >
                          {stock} in stock
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {status === 'active' && (
                          <span className="text-[11px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                        {status === 'draft' && (
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            Draft
                          </span>
                        )}
                        {status === 'outOfStock' && (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        )}
                        {status === 'archived' && (
                          <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleView(p.id)}
                            className="p-1 text-[#6B726E] hover:text-[#101413] cursor-pointer"
                            title="View product"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="p-1 text-[#6B726E] hover:text-[#0E8F5A] cursor-pointer"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => handleArchive(p.id)}
                              disabled={archivingId === p.id}
                              className="p-1 text-[#6B726E] hover:text-amber-600 cursor-pointer disabled:opacity-50"
                              title="Archive product"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm?.(`Are you sure you want to delete "${p.title || p.name}"?`)) {
                                try {
                                  await deleteProductById(p.id);
                                  showToast('Product Deleted', 'Item removed from your catalog.', 'info');
                                } catch {
                                  showToast('Error', 'Unable to delete product.', 'error');
                                }
                              }
                            }}
                            className="p-1 text-[#6B726E] hover:text-rose-600 cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Product Cards */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((p) => {
              const status = p.status || 'active';
              const stock = p.stockCount !== undefined ? p.stockCount : p.stock !== undefined ? p.stock : 10;

              return (
                <div key={p.id} className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={p.images?.[0] || p.imageUrl || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=200&q=80'}
                      alt={p.title}
                      className="w-16 h-16 rounded object-cover border border-[#E4E7E5] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#101413] truncate">{p.title || p.name}</h4>
                      <p className="text-xs font-semibold text-[#0E8F5A] tabular-nums mt-0.5">
                        {formatNaira(p.price)}
                      </p>
                      <p className="text-[11px] text-[#6B726E] mt-0.5">
                        Stock: {stock} units · Status: {status}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(p)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>

                    <button
                      type="button"
                      onClick={() => handleView(p.id)}
                      className="text-xs text-[#0E8F5A] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Preview</span>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
