/**
 * @file src/components/CompareTray.tsx
 * Floating persistent comparison dock showing up to 4 selected products
 * with thumbnails and a direct CTA to /compare.
 */

import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import { Layers, X, ArrowRight, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/money';

export const CompareTray: React.FC = () => {
  const { compareProductIds, removeFromCompare, clearCompare, navigateTo, activePage } = useMarket();
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    if (compareProductIds.length === 0) {
      setComparedProducts([]);
      return;
    }
    Promise.all(compareProductIds.map((id) => productService.getProductById(id)))
      .then((results) => {
        if (active) {
          setComparedProducts(results.filter((p): p is Product => p !== null));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [compareProductIds]);

  if (compareProductIds.length === 0 || activePage === 'compare') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#101413] text-white rounded-xl shadow-2xl border border-white/10 p-3 sm:p-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#0E8F5A]/20 text-[#0E8F5A]">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-tight">
              Compare Products ({comparedProducts.length}/4)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
            <button
              onClick={() => navigateTo('compare')}
              className="px-3 py-1 bg-[#0E8F5A] hover:bg-[#0B7549] text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>Compare Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/10">
          {[0, 1, 2, 3].map((index) => {
            const product = comparedProducts[index];
            if (!product) {
              return (
                <div
                  key={index}
                  className="h-12 border border-dashed border-white/15 rounded-lg flex items-center justify-center text-[10px] text-neutral-500 font-medium"
                >
                  Slot {index + 1}
                </div>
              );
            }

            return (
              <div
                key={product.id}
                className="relative group bg-white/5 border border-white/10 rounded-lg p-1.5 flex items-center gap-2 pr-6"
              >
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                  alt={product.title}
                  className="w-9 h-9 object-cover rounded shrink-0 bg-neutral-800"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-white truncate leading-tight">
                    {product.title}
                  </p>
                  <p className="text-[10px] text-[#0E8F5A] font-semibold tabular-nums">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Remove from comparison"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
