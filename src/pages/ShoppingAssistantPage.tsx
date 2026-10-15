/**
 * @file src/pages/ShoppingAssistantPage.tsx
 * Grounded AI Customer Shopping Assistant for MarketNest.
 * Translates natural-language shopping requests into verified inventory results,
 * price boundaries, category filters, and direct product exploration.
 */

import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { aiService } from '../services/aiService';
import { AIShoppingQueryResponse, Product, CategoryId } from '../types';
import { formatCurrency } from '../utils/money';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'Handcrafted leather loafers for work under ₦50,000',
  'Traditional Nigerian heritage gifts and Aso-Oke',
  'Modern everyday tech gadgets with warranty',
  'Natural organic skincare and glow oils under ₦30,000'
];

export const ShoppingAssistantPage: React.FC = () => {
  const { navigateTo } = useMarket();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIShoppingQueryResponse | null>(null);

  const runQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setInputQuery(queryText);
    try {
      const res = await aiService.queryShoppingAssistant({
        query: queryText.trim()
      });
      setResponse(res);
    } catch (err) {
      console.warn('Error querying shopping assistant:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial popular search
  useEffect(() => {
    runQuery('Handcrafted leather loafers for work under ₦50,000');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runQuery(inputQuery);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => navigateTo('home') },
          { label: 'Shopping Assistant', isCurrent: true }
        ]}
      />

      {/* Hero Header */}
      <div className="bg-[#101413] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E8F5A]/20 text-[#A7E2C9] text-xs font-semibold border border-[#0E8F5A]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MarketNest Intelligent Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            AI Shopping Assistant
          </h1>
          <p className="text-sm text-[#A0A5A3] leading-relaxed">
            Search our curated multi-vendor marketplace using natural language. Tell us your budget, occasion, or style, and we will find verified in-stock items with fast Lagos dispatch.
          </p>
        </div>

        {/* Search Bar Input inside Hero */}
        <div className="relative z-10 mt-6 max-w-3xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search className="w-5 h-5 text-white/60" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="e.g. I need handcrafted dress shoes under ₦50,000 for a weekend wedding..."
                className="w-full bg-transparent text-sm text-white placeholder-white/50 focus:outline-hidden"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="bg-[#0E8F5A] hover:bg-[#0B7348] text-white shrink-0"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ask Assistant
            </Button>
          </form>

          {/* Prompt chips */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-[11px] text-white/60">Try asking:</span>
            {SUGGESTED_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => runQuery(q)}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors cursor-pointer border border-white/10"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Viewport */}
      {response && (
        <div className="space-y-6">
          {/* AI Conversational Summary Banner */}
          <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#101413] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-[#A7E2C9]" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-bold text-sm text-[#101413]">Marketplace Concierge Analysis</h3>
                <p className="text-xs text-[#2C3330] leading-relaxed font-medium">
                  {response.reply}
                </p>

                {/* Trust & Policy Markers */}
                <div className="flex items-center gap-4 pt-2 flex-wrap text-xs text-[#6B726E]">
                  {response.verifiedDeliveryPolicy && (
                    <div className="flex items-center gap-1.5 text-[#0E8F5A] font-semibold">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{response.verifiedDeliveryPolicy}</span>
                    </div>
                  )}
                  {response.verifiedReturnPolicy && (
                    <div className="flex items-center gap-1.5 text-[#101413] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" />
                      <span>{response.verifiedReturnPolicy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Tags */}
            {response.suggestedCategories?.length > 0 && (
              <div className="pt-3 border-t border-[#E4E7E5] flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[#6B726E] font-medium">Matched Categories:</span>
                {response.suggestedCategories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => navigateTo('shop', { category: cat as CategoryId })}
                    className="px-2.5 py-1 rounded-md bg-white border border-[#E4E7E5] text-[#101413] hover:border-[#0E8F5A] transition-colors cursor-pointer capitalize font-bold text-[11px]"
                  >
                    {cat}
                  </button>
                ))}
                {response.suggestedPriceRange && (
                  <span className="text-[#6B726E] text-[11px] ml-auto">
                    Price range in stock: {formatCurrency(response.suggestedPriceRange.min)} – {formatCurrency(response.suggestedPriceRange.max)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Ground-Truth Product Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#101413]">
                  Eligible Verified Products ({response.matchedProducts.length})
                </h2>
                <p className="text-xs text-[#6B726E]">
                  Every listed item is verified in stock with secure escrow payment rails.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTo('shop')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Browse Full Catalog
              </Button>
            </div>

            {response.matchedProducts.length === 0 ? (
              <div className="bg-white border border-[#E4E7E5] rounded-2xl p-12 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-[#6B726E] mx-auto opacity-50" />
                <h3 className="font-bold text-base text-[#101413]">No exact inventory match</h3>
                <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
                  Try adjusting your budget or searching with broader keywords like "shoes" or "fashion".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {response.matchedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
