/**
 * @file src/pages/DealsPage.tsx
 * Curated editorial deals, limited runs, and seasonal promotions on MarketNest.
 */

import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Sparkles, ShieldCheck, Zap, Tag } from 'lucide-react';

export const DealsPage: React.FC = () => {
  const { navigateTo } = useMarket();
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    productService.getDiscountedProducts()
      .then((prods) => {
        if (active) setDiscountedProducts(prods);
      })
      .catch((err) => {
        console.warn('Error fetching discounted products:', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Home', onClick: () => navigateTo('home') },
            { label: 'Editorial Deals', isCurrent: true }
          ]}
        />

        <div className="mt-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2.5 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Limited-Quantity Editorial Finds</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight">
            Curated Deals & Promotional Runs
          </h1>
          <p className="text-xs sm:text-sm text-[#6B726E] mt-1 max-w-xl leading-relaxed">
            Verified Nigerian brands offering introductory seasonal pricing and limited batch releases with full escrow guarantee.
          </p>
        </div>
      </div>

      {/* Trust Notice */}
      <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#101413]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0" />
          <span>All promotional items carry our 7-day buyer escrow return policy.</span>
        </div>
        <div className="flex items-center gap-2 text-[#0E8F5A] font-semibold">
          <Zap className="w-4 h-4" />
          <span>Same-Day Lagos Dispatch on Orders before 12:00 PM</span>
        </div>
      </div>

      {/* Deals Grid or Empty State */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6B726E]">Loading verified deals...</p>
        </div>
      ) : discountedProducts.length === 0 ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto mb-4">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-[#101413]">No active promotional runs</h3>
          <p className="text-xs sm:text-sm text-[#6B726E] mt-1.5 leading-relaxed">
            All current listings are at regular verified merchant pricing. Check back soon for introductory drops and seasonal campaigns.
          </p>
          <div className="mt-6">
            <Button variant="primary" size="md" onClick={() => navigateTo('shop')}>
              Explore Marketplace Catalog
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {discountedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
