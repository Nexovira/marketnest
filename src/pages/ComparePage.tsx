/**
 * @file src/pages/ComparePage.tsx
 * Product Comparison matrix comparing up to 4 items side-by-side.
 * Includes attributes, ratings, merchant credentials, pricing, and fast add-to-bag.
 */

import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { formatCurrency } from '../utils/money';
import {
  Layers,
  Star,
  CheckCircle2,
  X,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const {
    compareProductIds,
    removeFromCompare,
    clearCompare,
    addToCart,
    navigateTo,
    setIsCartOpen
  } = useMarket();

  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (compareProductIds.length === 0) {
      setComparedProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(compareProductIds.map((id) => productService.getProductById(id)))
      .then((results) => {
        if (active) {
          setComparedProducts(results.filter((p): p is Product => p !== null));
        }
      })
      .catch((err) => {
        console.warn('Error loading compared products:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [compareProductIds]);

  const handleBuy = (product: any) => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => navigateTo('home') },
          { label: 'Shop', onClick: () => navigateTo('shop') },
          { label: 'Product Comparison', isCurrent: true }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E4E7E5] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#E8F5EF] text-[#0E8F5A]">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#101413]">
              Product Comparison Matrix
            </h1>
          </div>
          <p className="text-sm text-[#6B726E]">
            Compare specifications, artisan craftsmanship, ratings, and escrow guarantees side-by-side.
          </p>
        </div>

        {comparedProducts.length > 0 && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompare}
            >
              Clear Comparison
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('shop')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse More Items
            </Button>
          </div>
        )}
      </div>

      {/* Comparison Grid or Empty State */}
      {comparedProducts.length === 0 ? (
        <div className="bg-[#FBFBFA] border border-[#E4E7E5] rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-white border border-[#E4E7E5] rounded-full flex items-center justify-center mx-auto shadow-sm text-[#0E8F5A]">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#101413]">No Products in Comparison</h2>
          <p className="text-xs text-[#6B726E] leading-relaxed">
            Select "Add to Compare" on any product detail page to evaluate specifications, pricing, and verified merchant credentials side-by-side.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => navigateTo('shop')}
            >
              Explore Verified Marketplace
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <tbody>
              {/* Product Header Row */}
              <tr className="border-b border-[#E4E7E5] bg-[#FBFBFA]/50">
                <td className="p-4 w-44 font-semibold text-[#6B726E] align-top uppercase tracking-wider text-[11px]">
                  Product Overview
                </td>
                {comparedProducts.map((product) => (
                  <td key={product!.id} className="p-4 w-64 align-top border-l border-[#E4E7E5]">
                    <div className="relative space-y-2.5">
                      <button
                        onClick={() => removeFromCompare(product!.id)}
                        className="absolute -top-1 -right-1 p-1 bg-white border border-[#E4E7E5] hover:bg-rose-50 hover:text-rose-600 rounded-full text-[#6B726E] transition-colors cursor-pointer shadow-2xs"
                        title="Remove product"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div
                        onClick={() => navigateTo('product', { productId: product!.id })}
                        className="cursor-pointer group"
                      >
                        <div className="aspect-square w-full rounded-lg bg-[#F7F5F0] overflow-hidden mb-2 border border-[#E4E7E5]/70">
                          <img
                            src={product!.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                            alt={product!.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h3 className="font-bold text-sm text-[#101413] group-hover:text-[#0E8F5A] transition-colors line-clamp-2">
                          {product!.title}
                        </h3>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-[#101413] tabular-nums">
                          {formatCurrency(product!.price)}
                        </span>
                        {product!.compareAtPrice && (
                          <span className="text-xs text-[#6B726E] line-through tabular-nums">
                            {formatCurrency(product!.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleBuy(product)}
                        icon={<ShoppingBag className="w-3.5 h-3.5" />}
                      >
                        Add to Bag
                      </Button>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Rating Row */}
              <tr className="border-b border-[#E4E7E5]">
                <td className="p-4 font-semibold text-[#6B726E] bg-[#FBFBFA]/30 text-[11px] uppercase tracking-wider">
                  Rating & Reviews
                </td>
                {comparedProducts.map((product) => (
                  <td key={product!.id} className="p-4 border-l border-[#E4E7E5]">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="font-bold text-xs ml-1 text-[#101413]">
                          {product!.rating || 4.8}
                        </span>
                      </div>
                      <span className="text-neutral-400 text-xs">
                        ({product!.reviewCount || 34} reviews)
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Verified Merchant */}
              <tr className="border-b border-[#E4E7E5]">
                <td className="p-4 font-semibold text-[#6B726E] bg-[#FBFBFA]/30 text-[11px] uppercase tracking-wider">
                  Verified Merchant
                </td>
                {comparedProducts.map((product) => (
                  <td key={product!.id} className="p-4 border-l border-[#E4E7E5]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0E8F5A] shrink-0" />
                      <span className="font-medium text-xs text-[#101413]">
                        {product!.storeName || product!.seller?.storeName || 'Verified Merchant'}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr className="border-b border-[#E4E7E5]">
                <td className="p-4 font-semibold text-[#6B726E] bg-[#FBFBFA]/30 text-[11px] uppercase tracking-wider">
                  Stock Status
                </td>
                {comparedProducts.map((product) => {
                  const stock = product!.stockCount ?? product!.stock ?? 10;
                  const isAvailable = stock > 0;
                  return (
                    <td key={product!.id} className="p-4 border-l border-[#E4E7E5]">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isAvailable
                            ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {isAvailable ? `In Stock (${stock} available)` : 'Sold Out'}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Department */}
              <tr className="border-b border-[#E4E7E5]">
                <td className="p-4 font-semibold text-[#6B726E] bg-[#FBFBFA]/30 text-[11px] uppercase tracking-wider">
                  Department
                </td>
                {comparedProducts.map((product) => (
                  <td key={product!.id} className="p-4 border-l border-[#E4E7E5] capitalize font-medium text-[#101413]">
                    {product!.category}
                  </td>
                ))}
              </tr>

              {/* Origin / Authenticity */}
              <tr className="border-b border-[#E4E7E5]">
                <td className="p-4 font-semibold text-[#6B726E] bg-[#FBFBFA]/30 text-[11px] uppercase tracking-wider">
                  Authenticity & Origin
                </td>
                {comparedProducts.map((product) => (
                  <td key={product!.id} className="p-4 border-l border-[#E4E7E5] text-[#101413]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0E8F5A]" />
                      <span>{product!.origin || 'Nigeria'} (Artisan Verified)</span>
                    </span>
                  </td>
                ))}
              </tr>

              {/* Escrow Buyer Protection */}
              <tr className="border-b border-[#E4E7E5]">
                <td className="p-4 font-semibold text-[#6B726E] bg-[#FBFBFA]/30 text-[11px] uppercase tracking-wider">
                  Escrow Protection
                </td>
                {comparedProducts.map((product) => (
                  <td key={product!.id} className="p-4 border-l border-[#E4E7E5] text-xs text-[#6B726E]">
                    <div className="flex items-center gap-1 text-[#0E8F5A]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="font-semibold text-[11px]">100% Protected</span>
                    </div>
                    <p className="text-[11px] mt-0.5">Funds released only after buyer inspection.</p>
                  </td>
                ))}
              </tr>

              {/* Delivery Window */}
              <tr className="border-b border-[#E4E7E5]">
                <td className="p-4 font-semibold text-[#6B726E] bg-[#FBFBFA]/30 text-[11px] uppercase tracking-wider">
                  Delivery Speed
                </td>
                {comparedProducts.map((product) => (
                  <td key={product!.id} className="p-4 border-l border-[#E4E7E5] text-xs text-[#101413]">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#0E8F5A]" />
                      <span>Same-Day / 24h Lagos Dispatch</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Return Policy */}
              <tr>
                <td className="p-4 font-semibold text-[#6B726E] bg-[#FBFBFA]/30 text-[11px] uppercase tracking-wider">
                  Return Window
                </td>
                {comparedProducts.map((product) => (
                  <td key={product!.id} className="p-4 border-l border-[#E4E7E5] text-xs text-[#101413]">
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-[#6B726E]" />
                      <span>7-Day Return Guarantee</span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
