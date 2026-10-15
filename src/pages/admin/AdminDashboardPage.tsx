/**
 * @file src/pages/admin/AdminDashboardPage.tsx
 * Executive Health & Business Intelligence Dashboard for MarketNest.
 * Displays authoritative GMV, revenue charts, order distributions, and operational KPIs.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { Button } from '../../components/ui/Button';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Users,
  Store,
  Sparkles,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { setActiveSection, hasPermission, dataMode } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const [activeMetricTab, setActiveMetricTab] = useState<'gmv' | 'platformCommission' | 'sellerEarnings'>('gmv');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminService.getOverview();
        setData(res);
      } catch (err) {
        console.warn('Error loading admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dataMode]);

  if (loading || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6B726E]">Aggregating live marketplace telemetry...</p>
      </div>
    );
  }

  const { kpis, financials, ordersByStatus, timeSeries } = data;

  // Filter time series data based on chosen filter
  let displayedSeries = timeSeries || [];
  if (timeFilter === '7d') displayedSeries = displayedSeries.slice(-7);
  else if (timeFilter === '90d') displayedSeries = displayedSeries; // 30 sample points
  else if (timeFilter === '12m') displayedSeries = displayedSeries;

  const maxChartValue = Math.max(
    ...displayedSeries.map((s: any) => s[activeMetricTab] || s.gmv || 1000000)
  );

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* 1. TOP-LEVEL KPI METRICS GRID */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-black text-[#101413] tracking-tight">
              Marketplace Health & Executive Telemetry
            </h2>
            <p className="text-xs text-[#6B726E]">
              Authoritative transaction totals and partner ecosystem metrics.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#0E8F5A] bg-[#E8F5EF] px-2.5 py-1 rounded-full self-start sm:self-auto">
            Live Escrow Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* GMV */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-3 shadow-2xs hover:border-[#101413] transition-colors">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-xs font-semibold uppercase tracking-wider">Gross Volume (GMV)</span>
              <DollarSign className="w-4 h-4 text-[#101413]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#101413] tabular-nums font-mono">
                {formatCurrency(kpis.gmv.value)}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="font-bold text-[#0E8F5A] flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{kpis.gmv.changePercent}%
                </span>
                <span className="text-[#6B726E] text-[11px]">{kpis.gmv.period}</span>
              </div>
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-3 shadow-2xs hover:border-[#101413] transition-colors">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-xs font-semibold uppercase tracking-wider">Platform Take</span>
              <TrendingUp className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#0E8F5A] tabular-nums font-mono">
                {formatCurrency(kpis.platformRevenue.value)}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="font-bold text-[#0E8F5A] flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{kpis.platformRevenue.changePercent}%
                </span>
                <span className="text-[#6B726E] text-[11px]">{kpis.platformRevenue.period}</span>
              </div>
            </div>
          </div>

          {/* Orders Count & AOV */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-3 shadow-2xs hover:border-[#101413] transition-colors">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#101413]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#101413] tabular-nums font-mono">
                {kpis.orders.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="text-[#6B726E] text-[11px]">AOV:</span>
                <span className="font-bold text-[#101413] tabular-nums font-mono">
                  {formatCurrency(kpis.aov.value)}
                </span>
                <span className="text-[#0E8F5A] font-bold text-[10px]">+{kpis.aov.changePercent}%</span>
              </div>
            </div>
          </div>

          {/* Active Customers */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-3 shadow-2xs hover:border-[#101413] transition-colors">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Customers</span>
              <Users className="w-4 h-4 text-[#101413]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#101413] tabular-nums font-mono">
                {kpis.customers.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="font-bold text-[#0E8F5A] flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{kpis.customers.changePercent}%
                </span>
                <span className="text-[#6B726E] text-[11px]">{kpis.customers.period}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Partner Ecosystem & Queue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Active Sellers */}
          <div
            onClick={() => setActiveSection('sellers')}
            className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs hover:border-[#0E8F5A] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-[#6B726E]">
              <span className="font-semibold">Verified Sellers</span>
              <Store className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <div className="text-lg font-black text-[#101413] tabular-nums font-mono">
              {kpis.activeSellers.value} Stores
            </div>
            <p className="text-[11px] text-[#6B726E]">Lagos, Abuja & nationwide merchants</p>
          </div>

          {/* Active Affiliates */}
          <div
            onClick={() => setActiveSection('affiliates')}
            className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs hover:border-[#0E8F5A] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-[#6B726E]">
              <span className="font-semibold">Affiliate Partners</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-black text-[#101413] tabular-nums font-mono">
              {kpis.activeAffiliates.value} Partners
            </div>
            <p className="text-[11px] text-[#6B726E]">Verified creators & editorial referrers</p>
          </div>

          {/* Pending Seller Applications */}
          <div
            onClick={() => setActiveSection('seller-applications')}
            className={`border rounded-xl p-4 space-y-2 shadow-2xs cursor-pointer transition-colors ${
              kpis.pendingSellerApplications.value > 0
                ? 'bg-[#E8F5EF]/40 border-[#A7E2C9] hover:border-[#0E8F5A]'
                : 'bg-white border-[#E4E7E5]'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#101413]">Seller Applications</span>
              <UserCheck className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <div className="text-lg font-black text-[#0E8F5A] tabular-nums font-mono">
              {kpis.pendingSellerApplications.value} Pending
            </div>
            <p className="text-[11px] text-[#6B726E] flex items-center justify-between">
              <span>Awaiting compliance review</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#0E8F5A]" />
            </p>
          </div>

          {/* Pending Affiliate Applications */}
          <div
            onClick={() => setActiveSection('affiliate-applications')}
            className={`border rounded-xl p-4 space-y-2 shadow-2xs cursor-pointer transition-colors ${
              kpis.pendingAffiliateApplications.value > 0
                ? 'bg-purple-50/50 border-purple-200 hover:border-purple-500'
                : 'bg-white border-[#E4E7E5]'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#101413]">Affiliate Applications</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-black text-purple-700 tabular-nums font-mono">
              {kpis.pendingAffiliateApplications.value} Pending
            </div>
            <p className="text-[11px] text-[#6B726E] flex items-center justify-between">
              <span>Channel review & code assignment</span>
              <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
            </p>
          </div>
        </div>
      </div>

      {/* 2. REVENUE ANALYTICS & TIME SERIES CHART */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7E5] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#101413]">Marketplace Financial Growth</h3>
            <p className="text-xs text-[#6B726E]">
              Daily settlement volume across gross transactions, seller disbursements, and net fees.
            </p>
          </div>

          {/* Controls: Metric Selector & Time Window */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-[#E4E7E5] p-0.5 bg-[#F7F5F0] text-xs">
              <button
                onClick={() => setActiveMetricTab('gmv')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeMetricTab === 'gmv' ? 'bg-white text-[#101413] shadow-2xs font-bold' : 'text-[#6B726E]'
                }`}
              >
                Gross Sales
              </button>
              <button
                onClick={() => setActiveMetricTab('platformCommission')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeMetricTab === 'platformCommission'
                    ? 'bg-white text-[#0E8F5A] shadow-2xs font-bold'
                    : 'text-[#6B726E]'
                }`}
              >
                Platform Fee
              </button>
              <button
                onClick={() => setActiveMetricTab('sellerEarnings')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeMetricTab === 'sellerEarnings'
                    ? 'bg-white text-[#101413] shadow-2xs font-bold'
                    : 'text-[#6B726E]'
                }`}
              >
                Seller Payouts
              </button>
            </div>

            <div className="inline-flex rounded-lg border border-[#E4E7E5] p-0.5 bg-[#F7F5F0] text-xs">
              {(['7d', '30d', '90d', '12m'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`px-2.5 py-1 rounded-md font-medium uppercase transition-colors cursor-pointer ${
                    timeFilter === t ? 'bg-[#101413] text-white font-bold' : 'text-[#6B726E]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Bar Chart (Responsive Pure CSS / SVG) */}
        {displayedSeries.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center border border-dashed border-[#E4E7E5] rounded-xl text-center p-6 space-y-2 bg-[#FBFBFA]">
            <ShoppingBag className="w-8 h-8 text-[#6B726E]" />
            <p className="text-xs font-bold text-[#101413]">No live order transactions recorded yet</p>
            <p className="text-[11px] text-[#6B726E] max-w-sm">
              As customer checkout journeys are finalized through Paystack escrow, daily transaction volume and commission settlements will populate this chart in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-56 flex items-end gap-1 sm:gap-2 pt-6">
              {displayedSeries.map((pt: any, idx: number) => {
                const val = pt[activeMetricTab] || pt.gmv || 0;
                const heightPct = Math.max(8, Math.round((val / maxChartValue) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Floating tooltip */}
                    <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="bg-[#101413] text-white text-[10px] font-mono py-1 px-2 rounded shadow-lg whitespace-nowrap">
                        {pt.date}: {formatCurrency(val)}
                      </div>
                      <div className="w-1.5 h-1.5 bg-[#101413] rotate-45 -mt-0.5" />
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all duration-300 ${
                        activeMetricTab === 'platformCommission'
                          ? 'bg-[#0E8F5A] group-hover:bg-[#0B7348]'
                          : 'bg-[#1B211F] group-hover:bg-[#0E8F5A]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] font-mono text-[#6B726E] pt-2 border-t border-[#E4E7E5]">
              <span>{displayedSeries[0]?.date || 'Start'}</span>
              <span>{displayedSeries[Math.floor(displayedSeries.length / 2)]?.date || 'Mid'}</span>
              <span>{displayedSeries[displayedSeries.length - 1]?.date || 'Today'}</span>
            </div>
          </div>
        )}

        {/* Ledger Breakdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E4E7E5] text-xs">
          <div>
            <span className="text-[#6B726E] block text-[11px]">Gross Sales Settled</span>
            <span className="font-bold text-[#101413] font-mono tabular-nums">
              {formatCurrency(financials.grossSales)}
            </span>
          </div>
          <div>
            <span className="text-[#6B726E] block text-[11px]">Merchant Escrow Share</span>
            <span className="font-bold text-[#101413] font-mono tabular-nums">
              {formatCurrency(financials.sellerEarnings)}
            </span>
          </div>
          <div>
            <span className="text-[#6B726E] block text-[11px]">Platform Commission Take</span>
            <span className="font-bold text-[#0E8F5A] font-mono tabular-nums">
              {formatCurrency(financials.platformCommission)}
            </span>
          </div>
          <div>
            <span className="text-[#6B726E] block text-[11px]">Affiliate Commissions Paid</span>
            <span className="font-bold text-purple-700 font-mono tabular-nums">
              {formatCurrency(financials.affiliateCommission)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. ORDER STATUS DISTRIBUTION & AUDIT QUICK GLANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Status Distribution */}
        <div className="lg:col-span-7 bg-white border border-[#E4E7E5] rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#101413]">Order Fulfillment Pipeline</h3>
              <p className="text-xs text-[#6B726E]">Status breakdown of live customer orders</p>
            </div>
            <button
              onClick={() => setActiveSection('orders')}
              className="text-xs font-bold text-[#0E8F5A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { key: 'confirmed', label: 'Confirmed & Escrow Held', color: 'bg-emerald-500', count: ordersByStatus.confirmed || 0 },
              { key: 'processing', label: 'Merchant Packing & Prep', color: 'bg-blue-500', count: ordersByStatus.processing || 0 },
              { key: 'shipped', label: 'Dispatched / In Transit', color: 'bg-indigo-500', count: ordersByStatus.shipped || 0 },
              { key: 'delivered', label: 'Completed & Delivered', color: 'bg-[#101413]', count: ordersByStatus.delivered || 0 },
              { key: 'pending', label: 'Pending Payment Verification', color: 'bg-amber-500', count: ordersByStatus.pending || 0 },
              { key: 'refunded', label: 'Disputed / Refunded', color: 'bg-rose-500', count: ordersByStatus.refunded || 0 }
            ].map((stat) => {
              const totalOrders = Object.values(ordersByStatus).reduce((a: any, b: any) => a + b, 0) as number;
              const pct = totalOrders > 0 ? Math.round((stat.count / totalOrders) * 100) : 0;

              return (
                <div key={stat.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stat.color}`} />
                      <span className="font-semibold text-[#101413]">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-[#6B726E] text-[11px]">{pct}%</span>
                      <span className="font-bold text-[#101413]">{stat.count}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#F7F5F0] rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Shortcuts & Governance Notice */}
        <div className="lg:col-span-5 bg-white border border-[#E4E7E5] rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="border-b border-[#E4E7E5] pb-3">
            <h3 className="text-sm font-bold text-[#101413]">Operational Workflows</h3>
            <p className="text-xs text-[#6B726E]">Direct shortcuts to high-priority management queues</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <button
              onClick={() => setActiveSection('seller-applications')}
              className="w-full p-3 rounded-lg border border-[#E4E7E5] hover:border-[#101413] hover:bg-[#FBFBFA] flex items-center justify-between transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-[#0E8F5A]" />
                <div>
                  <span className="font-bold text-[#101413] block">Review Seller Applications</span>
                  <span className="text-[11px] text-[#6B726E]">3 prospective merchants awaiting approval</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#101413]" />
            </button>

            <button
              onClick={() => setActiveSection('payments')}
              className="w-full p-3 rounded-lg border border-[#E4E7E5] hover:border-[#101413] hover:bg-[#FBFBFA] flex items-center justify-between transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#101413]" />
                <div>
                  <span className="font-bold text-[#101413] block">Reconcile Paystack Ledgers</span>
                  <span className="text-[11px] text-[#6B726E]">Compare bank settlements with order records</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#101413]" />
            </button>

            <button
              onClick={() => setActiveSection('refunds')}
              className="w-full p-3 rounded-lg border border-[#E4E7E5] hover:border-[#101413] hover:bg-[#FBFBFA] flex items-center justify-between transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="font-bold text-[#101413] block">Inspect Refund Requests</span>
                  <span className="text-[11px] text-[#6B726E]">Review customer disputes and return windows</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#101413]" />
            </button>

            <button
              onClick={() => setActiveSection('reports')}
              className="w-full p-3 rounded-lg border border-[#E4E7E5] hover:border-[#101413] hover:bg-[#FBFBFA] flex items-center justify-between transition-colors cursor-pointer group text-left"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="font-bold text-[#101413] block">Export Financial Reports</span>
                  <span className="text-[11px] text-[#6B726E]">Download GMV, commissions, and seller revenue</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#101413]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
