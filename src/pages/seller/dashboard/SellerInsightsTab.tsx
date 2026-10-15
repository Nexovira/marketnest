/**
 * @file src/pages/seller/dashboard/SellerInsightsTab.tsx
 * AI-Assisted Seller Performance Insights for MarketNest Merchants.
 * Delivers transparent, fact-based operational observations, root-cause hypotheses,
 * and direct links to products, orders, and restock actions.
 */

import React, { useState, useEffect } from 'react';
import { useSeller } from '../../../context/SellerContext';
import { useMarket } from '../../../context/MarketContext';
import { aiService } from '../../../services/aiService';
import { AISellerPerformanceInsight } from '../../../types';
import { Button } from '../../../components/ui/Button';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  FileText
} from 'lucide-react';

export const SellerInsightsTab: React.FC = () => {
  const { sellerProfile, setActiveDashboardTab } = useSeller();
  const { navigateTo } = useMarket();

  const [insights, setInsights] = useState<AISellerPerformanceInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const sellerId = sellerProfile?.id || 'store_alara';

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await aiService.getSellerPerformanceInsights(sellerId);
      setInsights(data || []);
    } catch (err) {
      console.warn('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [sellerId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#101413] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E8F5A]/20 text-[#A7E2C9] text-xs font-semibold border border-[#0E8F5A]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MarketNest Intelligence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Seller Performance Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#A0A5A3] leading-relaxed">
            Data-backed observations derived strictly from your store's live listings, fulfillment turnaround, and conversion metrics.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
          <span className="text-[11px] font-bold text-white/80 block uppercase tracking-wider">
            Coverage Period
          </span>
          <div className="text-lg font-extrabold text-[#A7E2C9] my-0.5">
            Trailing 30 Days
          </div>
          <span className="text-[10px] text-white/60 block">
            Updated Daily · Verified Orders Only
          </span>
        </div>
      </div>

      {/* Transparency Disclaimer Notice */}
      <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0 mt-0.5" />
        <div className="text-xs text-[#101413] space-y-1">
          <p className="font-bold text-[#0E8F5A]">Transparent Data Integrity</p>
          <p className="text-[#6B726E] leading-relaxed">
            Insights distinguish observed facts from possible explanations. No guaranteed revenue forecasts are made, and your private metrics are never shared with competitor stores.
          </p>
        </div>
      </div>

      {/* Insights Cards List */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#101413]">Active Store Observations</h3>
            <p className="text-xs text-[#6B726E]">
              Review fact-based diagnostics to maintain your verified merchant standing.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchInsights}
            className="flex items-center gap-1.5 text-xs text-[#0E8F5A] font-semibold hover:underline cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#6B726E]">
            Analyzing live store metrics...
          </div>
        ) : insights.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6B726E]">
            No performance flags detected. Your store catalog and fulfillment metrics are performing within normal parameters.
          </div>
        ) : (
          <div className="divide-y divide-[#E4E7E5]">
            {insights.map((ins) => (
              <div key={ins.id} className="p-6 space-y-4 hover:bg-[#FBFBFA] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        ins.impactLevel === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : ins.impactLevel === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ins.impactLevel} Priority
                    </span>
                    <h4 className="font-bold text-sm text-[#101413]">{ins.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#6B726E]">
                    <span className="bg-[#F7F5F0] px-2 py-0.5 rounded font-mono">{ins.period}</span>
                    <span>·</span>
                    <span>Sample: {ins.sampleSize}</span>
                  </div>
                </div>

                {/* Structured Breakdown: Fact vs Hypothesis vs Action */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="bg-[#F7F5F0] rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-[#6B726E] uppercase block">
                      1. Observed Fact
                    </span>
                    <p className="text-xs text-[#101413] leading-relaxed font-medium">
                      {ins.observedFact}
                    </p>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">
                      2. Plausible Hypothesis
                    </span>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      {ins.hypothesis}
                    </p>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-[#0E8F5A] uppercase block">
                      3. Practical Action
                    </span>
                    <p className="text-xs text-[#101413] leading-relaxed">
                      {ins.actionableStep}
                    </p>
                  </div>
                </div>

                {/* Navigation CTA */}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (ins.category === 'inventory_replenish') setActiveDashboardTab('inventory');
                      else if (ins.category === 'listing_quality') setActiveDashboardTab('products');
                      else if (ins.category === 'conversion_funnel') setActiveDashboardTab('orders');
                      else setActiveDashboardTab('products');
                    }}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Open Relevant Tab
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
