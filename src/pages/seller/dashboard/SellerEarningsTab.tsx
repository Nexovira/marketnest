/**
 * @file src/pages/seller/dashboard/SellerEarningsTab.tsx
 * Merchant financial overview & earnings analytics.
 * Displays Total Sales, Pending Earnings (held in escrow), Available Earnings,
 * Platform Fees, and Net Merchant Revenue.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSeller } from '../../../context/SellerContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { SellerEarning } from '../../../types';
import { formatNairaAmount } from '../../../utils/money';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  Percent,
  ShieldCheck,
  ArrowUpRight,
  Info
} from 'lucide-react';

export const SellerEarningsTab: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { sellerProfile } = useSeller();

  const [earnings, setEarnings] = useState<SellerEarning[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const fetchEarnings = async () => {
      try {
        const q = query(
          collection(db, 'sellerEarnings'),
          where('sellerId', '==', firebaseUser.uid)
        );
        const snap = await getDocs(q);
        const list: SellerEarning[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<SellerEarning, 'id'>) });
        });
        setEarnings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (e) {
        console.warn('Error loading seller earnings:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [firebaseUser]);

  // Aggregate Metrics
  const totalGrossSales = earnings.reduce((acc, e) => acc + e.grossAmount, 0);
  const pendingEarnings = earnings
    .filter((e) => e.status === 'pending')
    .reduce((acc, e) => acc + e.netAmount, 0);
  const availableEarnings = earnings
    .filter((e) => e.status === 'available')
    .reduce((acc, e) => acc + e.netAmount, 0);
  const totalPlatformFees = earnings.reduce((acc, e) => acc + e.platformCommission, 0);
  const totalPaymentFees = earnings.reduce((acc, e) => acc + (e.paymentProcessingFee || 0), 0);
  const totalNetEarnings = earnings.reduce((acc, e) => acc + e.netAmount, 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Store Earnings & Revenue</h2>
        <p className="text-xs text-[#6B726E] mt-0.5">
          Verified financial performance, escrow settlements, and platform commission breakdown.
        </p>
      </div>

      {/* Escrow Settlement Guidance Notice */}
      <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#0E8F5A]">Marketplace Escrow & Settlement Schedule</span>
          <p className="text-[#101413] leading-relaxed text-[11px]">
            Earnings remain in <strong>Pending Earnings</strong> while parcels are in transit. Upon confirmed buyer delivery or inspection clearance, funds transition into available store balance.
          </p>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sales */}
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-medium">Total Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-[#0E8F5A]" />
          </div>
          <div className="text-xl font-black text-[#101413] tabular-nums">
            {formatNairaAmount(totalGrossSales)}
          </div>
          <span className="text-[10px] text-[#6B726E] block">Cumulative customer spend</span>
        </div>

        {/* Pending Earnings */}
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-medium">Pending Earnings</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 tabular-nums">
            {formatNairaAmount(pendingEarnings)}
          </div>
          <span className="text-[10px] text-[#6B726E] block">Awaiting marketplace delivery</span>
        </div>

        {/* Available Earnings */}
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-medium">Available Balance</span>
            <CheckCircle2 className="w-4 h-4 text-[#0E8F5A]" />
          </div>
          <div className="text-xl font-black text-[#0E8F5A] tabular-nums">
            {formatNairaAmount(availableEarnings)}
          </div>
          <span className="text-[10px] text-[#6B726E] block">Settled store balance</span>
        </div>

        {/* Platform Fees */}
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-medium">Platform & Rail Fees</span>
            <Percent className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl font-black text-[#101413] tabular-nums">
            {formatNairaAmount(totalPlatformFees + totalPaymentFees)}
          </div>
          <span className="text-[10px] text-[#6B726E] block">Commission & Paystack processing</span>
        </div>

        {/* Net Earnings */}
        <div className="bg-[#101413] text-white rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A7E2C9]">
            <span className="font-medium">Net Store Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-[#A7E2C9]" />
          </div>
          <div className="text-xl font-black text-white tabular-nums">
            {formatNairaAmount(totalNetEarnings)}
          </div>
          <span className="text-[10px] text-[#CBD5E1] block">Net merchant earnings</span>
        </div>
      </div>

      {/* Commission Transparency Card */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#101413] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0E8F5A]" />
          <span>Commission Structure & Terms</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#F7F5F0] rounded-xl space-y-1">
            <span className="font-bold text-[#101413] block">Marketplace Commission (8%)</span>
            <p className="text-[#6B726E] text-[11px] leading-relaxed">
              Deducted transparently on confirmed product orders. Covers curated luxury buyer traffic and storefront hosting.
            </p>
          </div>

          <div className="p-4 bg-[#F7F5F0] rounded-xl space-y-1">
            <span className="font-bold text-[#101413] block">Paystack Gateway Fee</span>
            <p className="text-[#6B726E] text-[11px] leading-relaxed">
              Standard 1.5% + ₦100 rail fee capped at ₦2,000 for secure instant card, USSD, and bank transfer processing.
            </p>
          </div>

          <div className="p-4 bg-[#F7F5F0] rounded-xl space-y-1">
            <span className="font-bold text-[#101413] block">Automated Escrow Protection</span>
            <p className="text-[#6B726E] text-[11px] leading-relaxed">
              Merchants receive 100% of their net earnings upon customer delivery confirmation without arbitrary chargebacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
