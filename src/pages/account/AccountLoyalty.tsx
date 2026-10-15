/**
 * @file src/pages/account/AccountLoyalty.tsx
 * Customer Loyalty, NestPoints Rewards & Referral Engine for MarketNest.
 * Delivers customer retention, tier perks, discount vouchers, and referral bonuses.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  Gift,
  Share2,
  Copy,
  Check,
  Award,
  Zap,
  ShoppingBag,
  Clock,
  ArrowRight
} from 'lucide-react';

export const AccountLoyalty: React.FC = () => {
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useMarket();

  const [copied, setCopied] = useState(false);
  const [points, setPoints] = useState(1450);
  const referralCode = `NEST-${(firebaseUser?.uid || profile?.id || '8941').slice(0, 6).toUpperCase()}`;
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Link Copied', 'Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRedeem = (cost: number, voucherName: string) => {
    if (points < cost) {
      showToast('Insufficient Points', `You need ${cost} NestPoints to unlock this voucher.`, 'warning');
      return;
    }
    setPoints((p) => p - cost);
    showToast('Voucher Unlocked!', `Applied "${voucherName}" to your cart checkout.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7E5]">
        <div>
          <h2 className="text-xl font-bold text-[#101413]">NestPoints & Loyalty Club</h2>
          <p className="text-xs text-[#6B726E] mt-1">
            Earn 1 point for every ₦100 spent on verified orders. Redeem for instant checkout savings.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101413] text-white text-xs font-bold">
          <Award className="w-4 h-4 text-[#A7E2C9]" />
          <span>Gold VIP Tier</span>
        </div>
      </div>

      {/* Balance & Tier Progress Hero */}
      <div className="bg-[#101413] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A7E2C9]">
              Available Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white">
                {points.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-[#A7E2C9]">NestPoints</span>
            </div>
            <p className="text-xs text-[#A0A5A3]">
              Equivalent to <span className="text-white font-bold">{formatCurrency(points * 5)}</span> in checkout discount credits.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Gold Tier</span>
              <span className="text-[#A7E2C9] font-bold">550 pts to Platinum</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-[#0E8F5A] h-full rounded-full w-[72%]" />
            </div>
            <p className="text-[11px] text-white/70">
              Platinum Tier unlocks free same-day Lagos dispatch and priority customer desk resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Referral Program Card */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0E8F5A] flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#101413]">Refer a Friend, Earn ₦2,000</h3>
            <p className="text-xs text-[#6B726E]">
              Give your friends ₦2,000 off their first purchase of ₦20,000 or more. You get ₦2,000 credit once delivered.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="flex-1 w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs font-mono text-[#101413] truncate">
            {referralLink}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-base text-[#101413]">Redeem Rewards</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-[#E4E7E5] rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#0E8F5A] uppercase tracking-wider block">
                500 Points
              </span>
              <h4 className="font-bold text-sm text-[#101413]">₦2,500 Off Checkout</h4>
              <p className="text-xs text-[#6B726E]">Valid across all luxury fashion, electronics, and home decor.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={points < 500}
              onClick={() => handleRedeem(500, '₦2,500 Discount Voucher')}
            >
              Redeem (500 pts)
            </Button>
          </div>

          <div className="border border-[#E4E7E5] rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#0E8F5A] uppercase tracking-wider block">
                1,000 Points
              </span>
              <h4 className="font-bold text-sm text-[#101413]">₦5,000 Off Checkout</h4>
              <p className="text-xs text-[#6B726E]">Valid for orders with minimum ₦25,000 basket value.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={points < 1000}
              onClick={() => handleRedeem(1000, '₦5,000 Discount Voucher')}
            >
              Redeem (1,000 pts)
            </Button>
          </div>

          <div className="border border-[#E4E7E5] rounded-xl p-4 space-y-3 flex flex-col justify-between bg-[#FBFBFA]">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                2,000 Points
              </span>
              <h4 className="font-bold text-sm text-[#101413]">₦12,000 VIP Voucher</h4>
              <p className="text-xs text-[#6B726E]">Maximum savings voucher plus priority dispatch packaging.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={points < 2000}
              onClick={() => handleRedeem(2000, '₦12,000 VIP Voucher')}
            >
              Redeem (2,000 pts)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
