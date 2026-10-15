/**
 * @file src/pages/admin/AdminAnalyticsPage.tsx
 * Advanced Growth & Conversion Funnel Analytics for MarketNest Administrators.
 * Visualizes customer conversion funnels, buyer retention cohorts, and revenue trajectories.
 */

import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrency } from '../../services/currencyService';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  Store,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [windowRange, setWindowRange] = useState<'30d' | '90d' | '12m'>('30d');

  const FUNNEL_STEPS = [
    { label: 'Marketplace Visitors', count: 184500, dropoff: '100%' },
    { label: 'Product Detail Views', count: 82400, dropoff: '44.6%' },
    { label: 'Added to Bag', count: 14200, dropoff: '17.2%' },
    { label: 'Checkout Initiated', count: 4890, dropoff: '34.4%' },
    { label: 'Paystack Payment Verified', count: 1240, dropoff: '25.3%' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">
            Growth & Conversion Funnel Analytics
          </h2>
          <p className="text-xs text-[#6B726E]">
            End-to-end commerce funnel telemetry from visitor acquisition to verified bank settlement.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-[#E4E7E5] bg-white p-0.5 text-xs">
          {(['30d', '90d', '12m'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setWindowRange(r)}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                windowRange === r ? 'bg-[#101413] text-white' : 'text-[#6B726E]'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Growth Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-semibold uppercase">Customer Growth</span>
            <Users className="w-4 h-4 text-[#101413]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#101413]">+22.5%</p>
          <span className="text-[11px] text-[#0E8F5A] font-semibold">+142 new buyers in {windowRange}</span>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-semibold uppercase">Seller Growth</span>
            <Store className="w-4 h-4 text-[#0E8F5A]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#0E8F5A]">+9.1%</p>
          <span className="text-[11px] text-[#6B726E]">6 new artisanal merchants onboarding</span>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-semibold uppercase">Affiliate Traffic</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black font-mono text-purple-700">+31.0%</p>
          <span className="text-[11px] text-[#6B726E]">Driven by creator social campaigns</span>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-semibold uppercase">Order Velocity</span>
            <ShoppingBag className="w-4 h-4 text-[#101413]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#101413]">+12.8%</p>
          <span className="text-[11px] text-[#0E8F5A] font-semibold">1,240 confirmed orders</span>
        </div>
      </div>

      {/* Conversion Funnel Breakdown */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 space-y-6 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-[#101413]">Marketplace Buyer Conversion Funnel</h3>
          <p className="text-xs text-[#6B726E]">
            Inspect retention through key checkout checkpoints to identify drop-off points.
          </p>
        </div>

        <div className="space-y-4">
          {FUNNEL_STEPS.map((step, idx) => {
            const widthPct = Math.max(10, Math.round((step.count / FUNNEL_STEPS[0].count) * 100));

            return (
              <div key={step.label} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#101413] text-white flex items-center justify-center text-[10px] font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-[#101413]">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-[#101413]">{step.count.toLocaleString()}</span>
                    <span className="text-[#6B726E] text-[11px]">({step.dropoff} pass-through)</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-[#F7F5F0] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className="h-full bg-[#0E8F5A] transition-all duration-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-[#FBFBFA] rounded-xl border border-[#E4E7E5] flex items-center justify-between text-xs text-[#6B726E]">
          <span>Overall End-to-End Visitor-to-Payment Conversion:</span>
          <span className="font-bold text-[#0E8F5A] font-mono text-sm">
            {((FUNNEL_STEPS[4].count / FUNNEL_STEPS[0].count) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};
