/**
 * @file src/pages/admin/AdminOperationsPage.tsx
 * Marketplace Operations Command Center for MarketNest.
 * Displays real, server-derived operational metrics, date filtering,
 * and direct operational deep-links for immediate staff intervention.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { MarketplaceOperationsMetrics } from '../../types';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  Activity,
  ShoppingBag,
  Store,
  Users,
  DollarSign,
  RotateCcw,
  Clock,
  AlertTriangle,
  Package,
  Headphones,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Filter,
  Calendar,
  Sparkles,
  Truck,
  CreditCard
} from 'lucide-react';

export const AdminOperationsPage: React.FC = () => {
  const { setActiveSection } = useAdmin();
  const [metrics, setMetrics] = useState<MarketplaceOperationsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '12m' | 'all'>('30d');

  const loadMetrics = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/operations/metrics?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data);
      }
    } catch (err) {
      console.warn('Error loading operational metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics(range);
  }, [range]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header and Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-[#0E8F5A] text-white">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A]">
              Phase 10 Operations
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#101413] mt-1">Marketplace Operations Command Center</h2>
          <p className="text-xs text-[#6B726E]">
            Real-time, server-derived operational telemetry, fulfillment backlogs, and merchant activity.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E4E7E5] shadow-xs">
          {(['7d', '30d', '90d', '12m', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                range === r
                  ? 'bg-[#101413] text-white shadow-xs'
                  : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
              }`}
            >
              {r === 'all' ? 'All Time' : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading || !metrics ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6B726E]">Aggregating server-side operational data...</p>
        </div>
      ) : (
        <>
          {/* Top Financial Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* GMV */}
            <div className="p-5 bg-white border border-[#E4E7E5] rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-[#6B726E] uppercase tracking-wider">
                Gross Merchandise Value (GMV)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#101413] tabular-nums">
                  {formatCurrency(metrics.gmv)}
                </span>
                <span className="text-xs text-[#0E8F5A] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Gross Sales</span>
                </span>
              </div>
              <p className="text-[11px] text-[#6B726E]">Total customer payments processed</p>
            </div>

            {/* Net Marketplace Revenue */}
            <div className="p-5 bg-white border border-[#E4E7E5] rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-[#6B726E] uppercase tracking-wider">
                Net Platform Commission (8%)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#0E8F5A] tabular-nums">
                  {formatCurrency(metrics.netMarketplaceRevenue)}
                </span>
                <span className="text-xs text-[#0E8F5A] font-semibold">Net Retained</span>
              </div>
              <p className="text-[11px] text-[#6B726E]">Platform take rate on fulfilled orders</p>
            </div>

            {/* Completed Orders & AOV */}
            <div className="p-5 bg-white border border-[#E4E7E5] rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-[#6B726E] uppercase tracking-wider">
                Completed Orders & AOV
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#101413] tabular-nums">
                  {metrics.completedOrdersCount}
                </span>
                <span className="text-xs text-[#6B726E] font-medium">
                  AOV: <strong>{formatCurrency(metrics.averageOrderValue)}</strong>
                </span>
              </div>
              <p className="text-[11px] text-[#6B726E]">Average value per completed checkout</p>
            </div>

            {/* Active Merchants & Buyers */}
            <div className="p-5 bg-white border border-[#E4E7E5] rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-[#6B726E] uppercase tracking-wider">
                Active Participants
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#101413] tabular-nums">
                  {metrics.activeCustomersCount} / {metrics.activeSellersCount}
                </span>
                <span className="text-xs text-[#6B726E] font-semibold">Buyers / Stores</span>
              </div>
              <p className="text-[11px] text-[#6B726E]">Active within selected {range.toUpperCase()} window</p>
            </div>
          </div>

          {/* Operational Action Queues (Direct Deep-links) */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#101413] uppercase tracking-wider">
              Operational Action Queues & Immediate Interventions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Unfulfilled Orders */}
              <div
                onClick={() => setActiveSection('orders')}
                className="p-5 bg-white border border-[#E4E7E5] rounded-xl hover:border-[#CBD5E1] transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Truck className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-xs text-[#101413]">Fulfillment Backlog</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {metrics.unfulfilledOrdersCount} Pending
                  </span>
                </div>
                <p className="text-xs text-[#6B726E] leading-relaxed">
                  Orders confirmed by customer payment awaiting merchant packing and courier handover.
                </p>
                <div className="text-[11px] font-semibold text-blue-600 group-hover:underline flex items-center gap-1 pt-1">
                  <span>Manage Master Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 2. Pending Returns & Refunds */}
              <div
                onClick={() => setActiveSection('returns')}
                className="p-5 bg-white border border-[#E4E7E5] rounded-xl hover:border-[#CBD5E1] transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <RotateCcw className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-xs text-[#101413]">Pending Returns & RMA</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {metrics.pendingReturnsCount} Action Req.
                  </span>
                </div>
                <p className="text-xs text-[#6B726E] leading-relaxed">
                  Customer return requests under the 7-day inspection guarantee awaiting inspection review.
                </p>
                <div className="text-[11px] font-semibold text-amber-700 group-hover:underline flex items-center gap-1 pt-1">
                  <span>Authorize Escrow RMA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 3. Open Support Tickets */}
              <div
                onClick={() => setActiveSection('support')}
                className="p-5 bg-white border border-[#E4E7E5] rounded-xl hover:border-[#CBD5E1] transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
                      <Headphones className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-xs text-[#101413]">Open Support Cases</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    {metrics.openSupportTicketsCount} Active
                  </span>
                </div>
                <p className="text-xs text-[#6B726E] leading-relaxed">
                  Inquiries concerning delivery windows, size exchanges, or banking reconciliations.
                </p>
                <div className="text-[11px] font-semibold text-purple-700 group-hover:underline flex items-center gap-1 pt-1">
                  <span>Open Support Operations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 4. Pending Seller Applications */}
              <div
                onClick={() => setActiveSection('seller-applications')}
                className="p-5 bg-white border border-[#E4E7E5] rounded-xl hover:border-[#CBD5E1] transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-[#E8F5EF] text-[#0E8F5A]">
                      <Store className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-xs text-[#101413]">Seller Applications</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8F5EF] text-[#0E8F5A]">
                    {metrics.pendingSellerApplicationsCount} In Queue
                  </span>
                </div>
                <p className="text-xs text-[#6B726E] leading-relaxed">
                  Independent designers and artisans requesting storefront verification and onboarding.
                </p>
                <div className="text-[11px] font-semibold text-[#0E8F5A] group-hover:underline flex items-center gap-1 pt-1">
                  <span>Review Merchant Applications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 5. Pending Affiliate Applications */}
              <div
                onClick={() => setActiveSection('affiliate-applications')}
                className="p-5 bg-white border border-[#E4E7E5] rounded-xl hover:border-[#CBD5E1] transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-pink-50 text-pink-600">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-xs text-[#101413]">Affiliate Applications</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800">
                    {metrics.pendingAffiliateApplicationsCount} Pending
                  </span>
                </div>
                <p className="text-xs text-[#6B726E] leading-relaxed">
                  Influencers and publishers applying for referral links and 5% commission attribution.
                </p>
                <div className="text-[11px] font-semibold text-pink-700 group-hover:underline flex items-center gap-1 pt-1">
                  <span>Approve Growth Partners</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 6. Catalog Low Stock Warnings */}
              <div
                onClick={() => setActiveSection('products')}
                className="p-5 bg-white border border-[#E4E7E5] rounded-xl hover:border-[#CBD5E1] transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
                      <Package className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-xs text-[#101413]">Inventory Depletion Alerts</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    {metrics.lowStockProductsCount} Items ≤ 5
                  </span>
                </div>
                <p className="text-xs text-[#6B726E] leading-relaxed">
                  Listings with fewer than 5 units left. Restocking notifications sent to merchants.
                </p>
                <div className="text-[11px] font-semibold text-rose-700 group-hover:underline flex items-center gap-1 pt-1">
                  <span>Moderate Product Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#101413] uppercase tracking-wider">
              Settlement & Reconciliation Overview ({range.toUpperCase()})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FBFBFA] rounded-xl border border-[#E4E7E5] space-y-1">
                <span className="text-[11px] font-semibold text-[#6B726E]">Total Seller Disbursements</span>
                <p className="text-xl font-bold text-[#101413]">{formatCurrency(metrics.totalSellerEarnings)}</p>
                <span className="text-[10px] text-[#6B726E]">92% Net product value held in escrow</span>
              </div>

              <div className="p-4 bg-[#FBFBFA] rounded-xl border border-[#E4E7E5] space-y-1">
                <span className="text-[11px] font-semibold text-[#6B726E]">Affiliate Partner Commissions</span>
                <p className="text-xl font-bold text-[#101413]">{formatCurrency(metrics.totalAffiliateCommissions)}</p>
                <span className="text-[10px] text-[#6B726E]">5% Verified last-click attribution</span>
              </div>

              <div className="p-4 bg-[#FBFBFA] rounded-xl border border-[#E4E7E5] space-y-1">
                <span className="text-[11px] font-semibold text-[#6B726E]">Refunds Disbursed</span>
                <p className="text-xl font-bold text-rose-700">{formatCurrency(metrics.totalRefundsAmount)}</p>
                <span className="text-[10px] text-[#6B726E]">Customer RMA returns completed</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AdminOperationsPage;
