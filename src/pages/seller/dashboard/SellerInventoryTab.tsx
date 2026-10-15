/**
 * @file src/pages/seller/dashboard/SellerInventoryTab.tsx
 * Dedicated stock control and inventory management for MarketNest sellers.
 * Features quick inline stock increment/decrement, low-stock alerts, and restocking prompts.
 */

import React, { useState } from 'react';
import { useSeller } from '../../../context/SellerContext';
import { useMarket } from '../../../context/MarketContext';
import { Button } from '../../../components/ui/Button';
import { Product } from '../../../types';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Minus,
  Save,
  RotateCcw
} from 'lucide-react';

export const SellerInventoryTab: React.FC = () => {
  const { sellerProducts, editProduct } = useSeller();
  const { showToast } = useMarket();

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const getStockCount = (p: Product) => {
    return stockChanges[p.id] !== undefined ? stockChanges[p.id] : p.stockCount || p.stock || 0;
  };

  const handleStockDelta = (productId: string, current: number, delta: number) => {
    const updated = Math.max(0, current + delta);
    setStockChanges((prev) => ({ ...prev, [productId]: updated }));
  };

  const handleManualStockInput = (productId: string, val: string) => {
    const parsed = parseInt(val, 10);
    setStockChanges((prev) => ({
      ...prev,
      [productId]: isNaN(parsed) ? 0 : Math.max(0, parsed)
    }));
  };

  const handleSaveStock = async (product: Product) => {
    const newCount = getStockCount(product);
    setSavingId(product.id);
    try {
      await editProduct(product.id, {
        stockCount: newCount,
        stock: newCount,
        inStock: newCount > 0,
        status: newCount === 0 ? 'outOfStock' : (product.status === 'outOfStock' ? 'active' : product.status)
      });
      // Clear pending state
      setStockChanges((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      showToast('Inventory Updated', `${product.title} updated to ${newCount} units.`, 'success');
    } catch {
      showToast('Error', 'Unable to update inventory.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = sellerProducts.filter((p) => {
    const stock = getStockCount(p);
    if (search.trim()) {
      const match = (p.title || p.name || '').toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
    }

    if (stockFilter === 'low') {
      return stock > 0 && stock <= 5;
    }
    if (stockFilter === 'out') {
      return stock === 0;
    }
    if (stockFilter === 'healthy') {
      return stock > 5;
    }
    return true;
  });

  const lowCount = sellerProducts.filter((p) => {
    const s = p.stockCount || p.stock || 0;
    return s > 0 && s <= 5;
  }).length;

  const outCount = sellerProducts.filter((p) => {
    const s = p.stockCount || p.stock || 0;
    return s === 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Inventory Management</h2>
          <p className="text-xs text-[#6B726E]">
            Monitor item availability, configure low-stock triggers, and adjust unit quantities in real-time.
          </p>
        </div>

        {/* Warning Badge if any items low or out */}
        {(lowCount > 0 || outCount > 0) && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {lowCount} low stock · {outCount} out of stock
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or title..."
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              stockFilter === 'all' ? 'bg-[#101413] text-white' : 'bg-[#F7F5F0] text-[#6B726E]'
            }`}
          >
            All Inventory ({sellerProducts.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              stockFilter === 'low' ? 'bg-amber-600 text-white' : 'bg-[#F7F5F0] text-[#6B726E]'
            }`}
          >
            Low Stock ({lowCount})
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              stockFilter === 'out' ? 'bg-rose-600 text-white' : 'bg-[#F7F5F0] text-[#6B726E]'
            }`}
          >
            Out of Stock ({outCount})
          </button>
          <button
            onClick={() => setStockFilter('healthy')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              stockFilter === 'healthy' ? 'bg-[#0E8F5A] text-white' : 'bg-[#F7F5F0] text-[#6B726E]'
            }`}
          >
            Healthy Stock
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#101413]">
            <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E] font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-center">Quantity In Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {filteredProducts.map((p) => {
                const currentStock = getStockCount(p);
                const hasPendingChange = stockChanges[p.id] !== undefined;

                return (
                  <tr key={p.id} className="hover:bg-[#FBFBFA] transition-colors">
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg'}
                          alt=""
                          className="w-10 h-10 rounded object-cover border border-[#E4E7E5] shrink-0"
                        />
                        <div className="max-w-[220px]">
                          <p className="font-bold text-[#101413] truncate">{p.title || p.name}</p>
                          <p className="text-[11px] text-[#6B726E] font-mono">
                            SKU: {p.sku || `MN-${p.id.slice(0, 6).toUpperCase()}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[11px] tracking-wider text-[#6B726E]">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4">
                      {currentStock === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3 text-rose-600" /> Out of stock
                        </span>
                      ) : currentStock <= 5 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Low stock warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-[#0E8F5A]" /> Healthy ({currentStock})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStockDelta(p.id, currentStock, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-[#E4E7E5] hover:bg-[#F7F5F0] text-[#101413] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={currentStock}
                          onChange={(e) => handleManualStockInput(p.id, e.target.value)}
                          className="w-16 text-center py-1 border border-[#E4E7E5] rounded text-xs font-bold tabular-nums focus:outline-none focus:border-[#0E8F5A]"
                        />

                        <button
                          type="button"
                          onClick={() => handleStockDelta(p.id, currentStock, +1)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-[#E4E7E5] hover:bg-[#F7F5F0] text-[#101413] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {hasPendingChange ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveStock(p)}
                          disabled={savingId === p.id}
                          leftIcon={<Save className="w-3.5 h-3.5" />}
                        >
                          Save
                        </Button>
                      ) : (
                        <span className="text-[11px] text-[#6B726E]">In sync</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
