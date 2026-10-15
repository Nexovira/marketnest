/**
 * @file src/pages/DealsPage.tsx
 * Curated editorial deals, limited runs, and seasonal promotions on MarketNest.
 */

import React from 'react';
import { useMarket } from '../context/MarketContext';
import { MOCK_PRODUCTS } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const DealsPage: React.FC = () => {
  const { navigateTo } = useMarket();

  // Products with originalPrice (i.e. currently on promotional discount)
  const discountedProducts = MOCK_PRODUCTS.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );

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

      {/* Deals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {discountedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
