/**
 * @file src/pages/affiliate/AffiliateNav.tsx
 * Shared navigation header for the Affiliate Partner portal.
 * Features partner identity badge, referral code quick-copy, and tab navigation.
 */

import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { AffiliateProfile } from '../../types';
import {
  LayoutDashboard,
  Link2,
  DollarSign,
  BarChart3,
  Sparkles,
  Settings,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface AffiliateNavProps {
  profile: AffiliateProfile;
  activeTab: 'overview' | 'links' | 'earnings' | 'analytics' | 'campaigns' | 'settings';
}

export const AffiliateNav: React.FC<AffiliateNavProps> = ({ profile, activeTab }) => {
  const { navigateTo, showToast } = useMarket();
  const [copied, setCopied] = useState(false);

  const defaultShareUrl = `${window.location.origin}/?ref=${profile.code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.code);
    setCopied(true);
    showToast('Code Copied', `Referral code "${profile.code}" copied to clipboard.`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(defaultShareUrl);
    setCopied(true);
    showToast('Link Copied', 'Default marketplace referral link copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border-b border-[#E4E7E5] sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Partner</span>
              </span>
              <span className="text-xs text-[#6B726E] font-medium">
                Standard Commission: <strong className="text-[#101413]">{(profile.commissionRate * 100).toFixed(1)}%</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
              {profile.displayName || 'Affiliate Partner Dashboard'}
            </h1>
          </div>

          {/* Quick Code & Link Copy Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl px-3 py-1.5 text-xs">
              <span className="text-[#6B726E] text-[11px] uppercase font-bold">Partner Code:</span>
              <span className="font-mono font-extrabold text-[#101413]">{profile.code}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1 hover:text-[#0E8F5A] transition-colors cursor-pointer"
                title="Copy partner code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0E8F5A]" /> : <Copy className="w-3.5 h-3.5 text-[#6B726E]" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101413] text-white text-xs font-semibold hover:bg-[#1B211F] transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#0E8F5A]" />
              <span>Copy Store Link</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-2 border-t border-[#E4E7E5]/70 -mb-px">
          {[
            { id: 'overview', label: 'Overview', page: 'affiliate-dashboard', icon: LayoutDashboard },
            { id: 'links', label: 'Referral Links', page: 'affiliate-links', icon: Link2 },
            { id: 'earnings', label: 'Earnings & Payouts', page: 'affiliate-earnings', icon: DollarSign },
            { id: 'analytics', label: 'Traffic & Conversion', page: 'affiliate-analytics', icon: BarChart3 },
            { id: 'settings', label: 'Profile Settings', page: 'affiliate-settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.page as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#101413] text-white shadow-xs'
                    : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0E8F5A]' : 'text-[#6B726E]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
