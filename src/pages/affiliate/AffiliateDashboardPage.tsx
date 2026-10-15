/**
 * @file src/pages/affiliate/AffiliateDashboardPage.tsx
 * Executive dashboard for approved MarketNest Affiliate Partners.
 * Displays key metrics cards, interactive performance timeline,
 * filtered conversion ledgers, and privacy-safe transaction logs.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { getAffiliateProfile } from '../../services/affiliate/affiliateService';
import {
  fetchAffiliateDashboardData,
  generatePerformanceChartPoints,
  TimeRangeFilter,
  AffiliateDashboardMetrics,
  ChartDataPoint
} from '../../services/affiliate/affiliateAnalyticsService';
import { AffiliateProfile } from '../../types';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { AffiliateNav } from './AffiliateNav';
import { Button } from '../../components/ui/Button';
import {
  MousePointerClick,
  ShoppingBag,
  Percent,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Plus,
  ArrowRight,
  Filter,
  ShieldCheck,
  Calendar,
  Lock
} from 'lucide-react';

export const AffiliateDashboardPage: React.FC = () => {
  const { firebaseUser, isAuthenticated } = useAuth();
  const { navigateTo, showToast } = useMarket();

  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [metrics, setMetrics] = useState<AffiliateDashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [activeMetricTab, setActiveMetricTab] = useState<'earnings' | 'conversions' | 'clicks'>('earnings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const prof = await getAffiliateProfile(firebaseUser.uid);
        if (prof) {
          setProfile(prof);
          const data = await fetchAffiliateDashboardData(prof.userId, timeRange);
          setMetrics(data);
          const pts = generatePerformanceChartPoints(timeRange, data.commissions, data.totalClicks);
          setChartData(pts);
        }
      } catch (err) {
        console.warn('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [firebaseUser, timeRange]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6B726E]">Loading affiliate performance metrics...</p>
      </div>
    );
  }

  // Not an active affiliate yet -> prompt application
  if (!profile || profile.status !== 'active') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#101413]">Partner Access Required</h2>
        <p className="text-xs text-[#6B726E] leading-relaxed">
          You need an approved affiliate partner profile to access the creator dashboard and generate tracked referral links.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={() => navigateTo('affiliate-apply')}>
            Apply or Activate Partner Mode
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-20 animate-in fade-in">
      <AffiliateNav profile={profile} activeTab="overview" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Total Clicks */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Clicks</span>
              <MousePointerClick className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#101413] font-mono tabular-nums">
              {(metrics?.totalClicks || 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-[#6B726E] block">30-day active sessions</span>
          </div>

          {/* Conversions */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Conversions</span>
              <ShoppingBag className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#101413] font-mono tabular-nums">
              {(metrics?.totalConversions || 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-[#6B726E] block">Verified orders placed</span>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Conversion Rate</span>
              <Percent className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#101413] font-mono tabular-nums">
              {metrics?.conversionRate || 0}%
            </p>
            <span className="text-[10px] text-[#6B726E] block">Clicks converted to sales</span>
          </div>

          {/* Pending Commission */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-900 font-mono tabular-nums">
              {formatCurrency(metrics?.pendingCommission || 0)}
            </p>
            <span className="text-[10px] text-[#6B726E] block">Delivery review window</span>
          </div>

          {/* Approved Commission */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#0E8F5A]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#0E8F5A] font-mono tabular-nums">
              {formatCurrency(metrics?.approvedCommission || 0)}
            </p>
            <span className="text-[10px] text-[#6B726E] block">Settled & eligible for payout</span>
          </div>

          {/* Total Lifetime Earnings */}
          <div className="bg-[#101413] text-white rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-white/70">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Earned</span>
              <DollarSign className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-white font-mono tabular-nums">
              {formatCurrency(metrics?.totalEarnings || 0)}
            </p>
            <span className="text-[10px] text-white/60 block">Lifetime attributed return</span>
          </div>
        </div>

        {/* Performance Visualization Section */}
        <div className="bg-white border border-[#E4E7E5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7E5] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#101413]">Performance Over Time</h3>
              <p className="text-xs text-[#6B726E]">
                Track referral clicks, completed conversions, and net commission earnings.
              </p>
            </div>

            {/* Time Filter Controls */}
            <div className="flex items-center gap-1.5 bg-[#F7F5F0] p-1 rounded-xl text-xs">
              {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    timeRange === r
                      ? 'bg-white text-[#101413] shadow-xs'
                      : 'text-[#6B726E] hover:text-[#101413]'
                  }`}
                >
                  {r === 'all' ? 'All Time' : r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setActiveMetricTab('earnings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeMetricTab === 'earnings'
                  ? 'bg-[#0E8F5A] text-white'
                  : 'bg-[#F7F5F0] text-[#6B726E] hover:text-[#101413]'
              }`}
            >
              Earnings (₦)
            </button>
            <button
              onClick={() => setActiveMetricTab('conversions')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeMetricTab === 'conversions'
                  ? 'bg-[#101413] text-white'
                  : 'bg-[#F7F5F0] text-[#6B726E] hover:text-[#101413]'
              }`}
            >
              Conversions
            </button>
            <button
              onClick={() => setActiveMetricTab('clicks')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeMetricTab === 'clicks'
                  ? 'bg-[#101413] text-white'
                  : 'bg-[#F7F5F0] text-[#6B726E] hover:text-[#101413]'
              }`}
            >
              Clicks
            </button>
          </div>

          {/* Clean Performance Bar Visualization */}
          <div className="space-y-2 pt-2">
            <div className="h-44 sm:h-52 flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-[#E4E7E5]">
              {chartData.map((pt, idx) => {
                const maxVal = Math.max(
                  ...chartData.map((d) =>
                    activeMetricTab === 'earnings'
                      ? d.earnings
                      : activeMetricTab === 'conversions'
                      ? d.conversions
                      : d.clicks
                  ),
                  10
                );
                const currentVal =
                  activeMetricTab === 'earnings'
                    ? pt.earnings
                    : activeMetricTab === 'conversions'
                    ? pt.conversions
                    : pt.clicks;
                const heightPercent = Math.max(10, Math.round((currentVal / maxVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#101413] text-white text-[10px] py-1 px-2 rounded font-mono pointer-events-none whitespace-nowrap z-10">
                      {activeMetricTab === 'earnings'
                        ? formatCurrency(pt.earnings)
                        : `${currentVal} ${activeMetricTab}`}
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                        activeMetricTab === 'earnings'
                          ? 'bg-[#0E8F5A] group-hover:bg-[#0B7A4C]'
                          : 'bg-[#101413] group-hover:bg-[#1B211F]'
                      }`}
                    />
                    <span className="text-[10px] text-[#6B726E] mt-2 block truncate w-full text-center">
                      {pt.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Conversions Table */}
        <div className="bg-white border border-[#E4E7E5] rounded-2xl shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#101413]">Recent Qualifying Conversions</h3>
              <p className="text-xs text-[#6B726E]">
                Customer privacy protected. Financial metrics verify eligible physical products only.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('affiliate-earnings')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Full Financial Ledger
            </Button>
          </div>

          {metrics?.recentConversions.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#FBFBFA] rounded-xl border border-dashed border-[#E4E7E5]">
              <ShoppingBag className="w-10 h-10 text-[#6B726E] mx-auto opacity-30" />
              <p className="text-xs font-semibold text-[#101413]">No conversions recorded yet</p>
              <p className="text-[11px] text-[#6B726E] max-w-sm mx-auto">
                Share your unique referral links with your audience. Once followers complete paid purchases, verified conversions will populate here.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigateTo('affiliate-links')}>
                Generate Referral Link
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#101413]">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Attribution</th>
                    <th className="py-3 px-4 text-right">Eligible Subtotal</th>
                    <th className="py-3 px-4 text-right">Commission</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {metrics?.recentConversions.map((conv) => {
                    // Mask order number e.g. MN-20261006-***
                    const maskedOrder = conv.orderNumber
                      ? `${conv.orderNumber.slice(0, 11)}-***`
                      : 'MN-ORDER-***';

                    return (
                      <tr key={conv.id} className="hover:bg-[#FBFBFA] transition-colors">
                        <td className="py-3 px-4 text-[#6B726E]">
                          {formatCustomerDate(conv.createdAt)}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#101413]">
                          {maskedOrder}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B726E]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" /> Last-Click
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          {formatCurrency(conv.eligibleAmount || conv.grossAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#0E8F5A]">
                          +{formatCurrency(conv.commissionAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Pending Escrow
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
