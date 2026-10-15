/**
 * @file src/pages/admin/AdminProductsPage.tsx
 * Product moderation and catalog governance portal for MarketNest Administrators.
 * Displays inventory listings, price enforcement, and moderation reason logging.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { Button } from '../../components/ui/Button';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  EyeOff,
  Archive,
  Flag,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts(search, undefined, statusFilter);
      setProducts(data);
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

  const handleModerate = (product: any, action: 'approve' | 'reject' | 'hide' | 'archive' | 'flag') => {
    const isDestructive = ['hide', 'reject', 'flag', 'archive'].includes(action);

    requestConfirm({
      title: `${action.toUpperCase()} Product: ${product.title}`,
      description: `Apply moderation action "${action}" to this product? It will update catalog visibility immediately and record an audit log.`,
      confirmText: `Confirm ${action}`,
      danger: isDestructive,
      requireReason: isDestructive,
      onConfirm: async (reason) => {
        await adminService.moderateProduct(product.id, action, reason, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadProducts();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">Product Catalog Moderation</h2>
          <p className="text-xs text-[#6B726E]">
            Verify merchandise quality, inventory thresholds, and catalog compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, seller, or SKU..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-white focus:outline-hidden focus:border-[#101413] w-56 sm:w-64"
            />
          </div>

          <div className="inline-flex rounded-lg border border-[#E4E7E5] bg-white p-0.5 text-xs">
            {['all', 'active', 'flagged', 'hidden', 'archived'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-md font-medium uppercase text-[11px] transition-colors cursor-pointer ${
                  statusFilter === f ? 'bg-[#101413] text-white font-bold' : 'text-[#6B726E]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Item</th>
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B726E]">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isFlagged = p.status === 'flagged';
                  const isHidden = p.status === 'hidden';
                  const stockNum = p.stockCount !== undefined ? p.stockCount : p.stock || 10;

                  return (
                    <tr key={p.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80'}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover border border-[#E4E7E5] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-[#101413] block truncate max-w-[220px]">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-[#6B726E] font-mono">{p.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#101413]">
                        {p.sellerName || p.seller?.name || 'Merchant'}
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E] uppercase font-bold text-[10px]">
                        {p.category}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413] tabular-nums">
                        {formatCurrency(p.price)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded text-[11px] ${
                            stockNum <= 2
                              ? 'bg-rose-100 text-rose-700'
                              : stockNum <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'text-[#101413]'
                          }`}
                        >
                          {stockNum}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isFlagged
                              ? 'bg-rose-100 text-rose-700'
                              : isHidden
                              ? 'bg-neutral-200 text-neutral-700'
                              : 'bg-[#E8F5EF] text-[#0E8F5A]'
                          }`}
                        >
                          {p.status || 'active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {hasPermission('products.moderate') && (
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status === 'hidden' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleModerate(p, 'approve')}
                              >
                                Unhide
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleModerate(p, 'hide')}
                              >
                                Hide
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleModerate(p, 'flag')}
                            >
                              Flag
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
