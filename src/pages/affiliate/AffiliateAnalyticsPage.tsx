/**
 * @file src/pages/affiliate/AffiliateAnalyticsPage.tsx
 * Deep dive analytics and traffic conversion reporting for MarketNest Affiliates.
 * Displays traffic metrics, conversion funnel, top referral destinations, and category revenue share.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { getAffiliateProfile, getAffiliateLinks } from '../../services/affiliate/affiliateService';
import {
  fetchAffiliateDashboardData,
  TimeRangeFilter,
  AffiliateDashboardMetrics
} from '../../services/affiliate/affiliateAnalyticsService';
import { AffiliateProfile, AffiliateLink } from '../../types';
import { formatCurrency } from '../../services/currencyService';
import { AffiliateNav } from './AffiliateNav';
import {
  BarChart3,
  MousePointerClick,
  TrendingUp,
  ShoppingBag,
  Percent,
  Layers,
  Store,
  Sparkles,
  Link2,
  Calendar,
  ShieldCheck
} from 'lucide-react';

export const AffiliateAnalyticsPage: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { navigateTo } = useMarket();

  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [metrics, setMetrics] = useState<AffiliateDashboardMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [prof, userLinks, dashMetrics] = await Promise.all([
          getAffiliateProfile(firebaseUser.uid),
          getAffiliateLinks(firebaseUser.uid),
          fetchAffiliateDashboardData(firebaseUser.uid, timeRange)
        ]);
        setProfile(prof);
        setLinks(userLinks);
        setMetrics(dashMetrics);
      } catch (err) {
        console.warn('Error loading analytics:', err);
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
        <p className="text-xs text-[#6B726E]">Loading creator analytics...</p>
      </div>
    );
  }

  if (!profile || profile.status !== 'active') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 animate-in fade-in">
        <h2 className="text-xl font-bold text-[#101413]">Partner Access Required</h2>
        <p className="text-xs text-[#6B726E]">You need an approved affiliate partner profile to inspect analytics.</p>
        <button
          onClick={() => navigateTo('affiliate-apply')}
          className="px-4 py-2 bg-[#101413] text-white text-xs font-bold rounded-lg cursor-pointer"
        >
          Apply for Partner Access
        </button>
      </div>
    );
  }

  const totalRevenueGenerated = (metrics?.recentConversions || []).reduce(
    (sum, c) => sum + (c.eligibleAmount || c.grossAmount || 0),
    0
  );

  // Top Links sorted by clicks
  const sortedLinksByClicks = [...links].sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0));

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-20 animate-in fade-in">
      <AffiliateNav profile={profile} activeTab="analytics" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Performance & Traffic Analytics</h2>
            <p className="text-xs text-[#6B726E]">
              Audience conversion funnel, referred customer revenue, and link attribution breakdown.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-[#E4E7E5] p-1 rounded-xl text-xs shadow-xs">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  timeRange === r
                    ? 'bg-[#101413] text-white shadow-xs'
                    : 'text-[#6B726E] hover:text-[#101413]'
                }`}
              >
                {r === 'all' ? 'All Time' : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Funnel Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Referral Clicks</span>
              <MousePointerClick className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#101413] font-mono tabular-nums">
              {(metrics?.totalClicks || 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-[#6B726E] block">Top of partner funnel</span>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Completed Purchases</span>
              <ShoppingBag className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#101413] font-mono tabular-nums">
              {(metrics?.totalConversions || 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-[#6B726E] block">Orders with cleared payments</span>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Audience Conversion Rate</span>
              <Percent className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#0E8F5A] font-mono tabular-nums">
              {metrics?.conversionRate || 0}%
            </p>
            <span className="text-[10px] text-[#6B726E] block">Visitor to buyer ratio</span>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Gross GMV Driven</span>
              <TrendingUp className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#101413] font-mono tabular-nums">
              {formatCurrency(totalRevenueGenerated)}
            </p>
            <span className="text-[10px] text-[#6B726E] block">Eligible marketplace sales</span>
          </div>
        </div>

        {/* Detailed Breakdown Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Referral Links */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <h3 className="font-bold text-sm text-[#101413] flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#0E8F5A]" />
                <span>Top Performing Referral Links</span>
              </h3>
              <span className="text-[11px] text-[#6B726E] font-medium">{links.length} total links</span>
            </div>

            {sortedLinksByClicks.length === 0 ? (
              <p className="text-xs text-[#6B726E] py-8 text-center">No referral link traffic recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedLinksByClicks.slice(0, 5).map((l) => (
                  <div
                    key={l.id}
                    className="p-3 bg-[#FBFBFA] rounded-xl border border-[#E4E7E5] flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 max-w-[220px]">
                      <p className="font-bold text-[#101413] truncate">{l.targetName}</p>
                      <p className="text-[10px] text-[#6B726E] capitalize">{l.targetType} target</p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-[#6B726E] block">CLICKS</span>
                        <span className="font-mono font-bold text-[#101413]">
                          {(l.clicksCount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#6B726E] block">EARNED</span>
                        <span className="font-mono font-bold text-[#0E8F5A]">
                          {formatCurrency(l.earningsAmount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Conversion Insights */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <h3 className="font-bold text-sm text-[#101413] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0E8F5A]" />
                <span>Category Revenue Distribution</span>
              </h3>
              <span className="text-[11px] text-[#0E8F5A] font-bold">5.0% - 8.0% commission</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Fashion & Luxury Apparel', share: 45, bonus: 'Standard 5.0%' },
                { name: 'Home & Handcrafted Decor', share: 25, bonus: 'Bonus 7.0%' },
                { name: 'Jewelry & Contemporary Beads', share: 18, bonus: 'Standard 5.0%' },
                { name: 'Artisanal Gifts & Antiques', share: 12, bonus: 'Bonus 8.0%' }
              ].map((cat, i) => (
                <div key={i} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#101413]">{cat.name}</span>
                    <span className="text-[#6B726E] text-[11px] font-mono">
                      {cat.share}% ({cat.bonus})
                    </span>
                  </div>
                  <div className="w-full bg-[#F7F5F0] rounded-full h-2 overflow-hidden border border-[#E4E7E5]">
                    <div
                      style={{ width: `${cat.share}%` }}
                      className="bg-[#0E8F5A] h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#E8F5EF] rounded-xl p-3 text-[11px] text-[#101413] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0 mt-0.5" />
              <span>
                Tip: Featuring limited-edition handcrafted decor and seasonal luxury apparel yields higher average cart sizes across Lagos and Diaspora followers.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
