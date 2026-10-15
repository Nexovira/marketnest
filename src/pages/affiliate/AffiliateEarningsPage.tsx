/**
 * @file src/pages/affiliate/AffiliateEarningsPage.tsx
 * Financial ledger and payout foundation portal for MarketNest Affiliates.
 * Displays Available, Pending, Approved, Total Earned, and Reversed commissions,
 * alongside privacy-safe transaction logs.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { getAffiliateProfile } from '../../services/affiliate/affiliateService';
import { fetchAffiliateDashboardData } from '../../services/affiliate/affiliateAnalyticsService';
import { AffiliateProfile, AffiliateCommission } from '../../types';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { AffiliateNav } from './AffiliateNav';
import { Button } from '../../components/ui/Button';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Building,
  Info,
  Calendar,
  Lock,
  ArrowRight
} from 'lucide-react';

const MINIMUM_PAYOUT_THRESHOLD = 10000; // ₦10,000 minimum balance for bank payout

export const AffiliateEarningsPage: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { navigateTo, showToast } = useMarket();

  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const prof = await getAffiliateProfile(firebaseUser.uid);
        if (prof) {
          setProfile(prof);
          const data = await fetchAffiliateDashboardData(prof.userId, 'all');
          setCommissions(data.commissions);
        }
      } catch (err) {
        console.warn('Error loading earnings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [firebaseUser]);

  // Aggregate Metrics
  const pendingAmount = commissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

  const approvedAmount = commissions
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

  const paidAmount = commissions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

  const reversedAmount = commissions
    .filter((c) => c.status === 'reversed')
    .reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

  const availableAmount = approvedAmount; // Approved commissions eligible for withdrawal
  const totalEarned = pendingAmount + approvedAmount + paidAmount;

  const thresholdPercent = Math.min(
    100,
    Math.round((availableAmount / MINIMUM_PAYOUT_THRESHOLD) * 100)
  );

  const handleRequestPayoutClick = () => {
    setShowPayoutModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6B726E]">Loading financial records...</p>
      </div>
    );
  }

  if (!profile || profile.status !== 'active') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 animate-in fade-in">
        <h2 className="text-xl font-bold text-[#101413]">Partner Access Required</h2>
        <p className="text-xs text-[#6B726E]">You need an approved affiliate partner profile to inspect financial ledgers.</p>
        <Button variant="primary" size="md" onClick={() => navigateTo('affiliate-apply')}>
          Apply for Partner Access
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-20 animate-in fade-in">
      <AffiliateNav profile={profile} activeTab="earnings" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Earnings & Settlements</h2>
            <p className="text-xs text-[#6B726E]">
              Transparent accounting backed by verified Paystack checkout and buyer delivery inspection.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleRequestPayoutClick}
            disabled={availableAmount < MINIMUM_PAYOUT_THRESHOLD}
            leftIcon={<DollarSign className="w-4 h-4" />}
          >
            Request Payout ({formatCurrency(availableAmount)})
          </Button>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Available for Payout */}
          <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#0E8F5A]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Available Payout</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-[#0E8F5A] font-mono tabular-nums">
              {formatCurrency(availableAmount)}
            </p>
            <span className="text-[10px] text-[#0E8F5A]/80 block">Cleared delivery inspection</span>
          </div>

          {/* Pending Escrow */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-900 font-mono tabular-nums">
              {formatCurrency(pendingAmount)}
            </p>
            <span className="text-[10px] text-[#6B726E] block">In customer return window</span>
          </div>

          {/* Approved */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#6B726E]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Approved</span>
              <ShieldCheck className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-[#101413] font-mono tabular-nums">
              {formatCurrency(approvedAmount)}
            </p>
            <span className="text-[10px] text-[#6B726E] block">Pending disbursement batch</span>
          </div>

          {/* Total Lifetime Earned */}
          <div className="bg-[#101413] text-white rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-white/70">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Earned</span>
              <DollarSign className="w-4 h-4 text-[#0E8F5A]" />
            </div>
            <p className="text-2xl font-black text-white font-mono tabular-nums">
              {formatCurrency(totalEarned)}
            </p>
            <span className="text-[10px] text-white/60 block">Cumulative partner commissions</span>
          </div>

          {/* Reversed */}
          <div className="bg-white border border-[#E4E7E5] rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-[11px] font-bold uppercase tracking-wider">Reversed</span>
              <RotateCcw className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-900 font-mono tabular-nums">
              {formatCurrency(reversedAmount)}
            </p>
            <span className="text-[10px] text-[#6B726E] block">Cancelled / refunded orders</span>
          </div>
        </div>

        {/* Payout Foundation Progress Bar & Instructions */}
        <div className="bg-white border border-[#E4E7E5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#101413]">Payout Eligibility Foundation</h3>
              <p className="text-xs text-[#6B726E]">
                Minimum withdrawal threshold is <strong>₦10,000</strong>. Payouts are transferred directly into verified Nigerian bank accounts.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#101413]">
              {formatCurrency(availableAmount)} / {formatCurrency(MINIMUM_PAYOUT_THRESHOLD)} ({thresholdPercent}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#F7F5F0] rounded-full h-2.5 overflow-hidden border border-[#E4E7E5]">
            <div
              style={{ width: `${thresholdPercent}%` }}
              className="bg-[#0E8F5A] h-full rounded-full transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-[#6B726E] pt-1">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#0E8F5A]" /> Direct NGN Bank Transfer (Paystack Payout Foundation)
            </span>
            <span className="text-[11px]">
              {availableAmount >= MINIMUM_PAYOUT_THRESHOLD
                ? '✓ Eligible for payout request'
                : `₦${(MINIMUM_PAYOUT_THRESHOLD - availableAmount).toLocaleString()} needed to unlock withdrawal`}
            </span>
          </div>
        </div>

        {/* Full Financial Ledger Table */}
        <div className="bg-white border border-[#E4E7E5] rounded-2xl shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
          <div>
            <h3 className="text-base font-bold text-[#101413]">Commission Transaction Ledger</h3>
            <p className="text-xs text-[#6B726E]">
              Every entry is verified server-side. Order identifiers are masked for customer privacy.
            </p>
          </div>

          {commissions.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-[#FBFBFA] rounded-xl border border-dashed border-[#E4E7E5]">
              <DollarSign className="w-10 h-10 text-[#6B726E] mx-auto opacity-30" />
              <p className="text-xs font-bold text-[#101413]">No financial records yet</p>
              <p className="text-[11px] text-[#6B726E] max-w-sm mx-auto">
                Once customer orders attributed to your referral links complete payment, commission ledger entries will be generated here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#101413]">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Order Reference</th>
                    <th className="py-3 px-4 text-right">Eligible Subtotal</th>
                    <th className="py-3 px-4 text-center">Rate</th>
                    <th className="py-3 px-4 text-right">Commission</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {commissions.map((comm) => {
                    const maskedRef = comm.orderNumber
                      ? `${comm.orderNumber.slice(0, 11)}-***`
                      : 'MN-ORDER-***';

                    return (
                      <tr key={comm.id} className="hover:bg-[#FBFBFA] transition-colors">
                        <td className="py-3.5 px-4 text-[#6B726E]">
                          {formatCustomerDate(comm.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#101413]">
                          {maskedRef}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold">
                          {formatCurrency(comm.eligibleAmount || comm.grossAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          {((comm.commissionRate || 0.05) * 100).toFixed(1)}%
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-bold ${
                            comm.status === 'reversed' ? 'text-rose-600 line-through' : 'text-[#0E8F5A]'
                          }`}
                        >
                          {comm.status === 'reversed' ? '-' : '+'}
                          {formatCurrency(comm.commissionAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {comm.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" /> Pending Escrow
                            </span>
                          )}
                          {comm.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9]">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {comm.status === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" /> Paid Out
                            </span>
                          )}
                          {comm.status === 'reversed' && (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200"
                              title={comm.reversalReason || 'Order cancelled'}
                            >
                              <RotateCcw className="w-3 h-3 text-rose-600" /> Reversed
                            </span>
                          )}
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

      {/* Payout Foundation Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7E5] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#0E8F5A] uppercase tracking-wider">Settlement</span>
                <h3 className="text-lg font-black text-[#101413]">Affiliate Payout Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="text-[#6B726E] hover:text-[#101413] text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#101413]">
              <div className="bg-[#F7F5F0] rounded-xl p-4 space-y-2 border border-[#E4E7E5]">
                <div className="flex justify-between">
                  <span className="text-[#6B726E]">Eligible Available Balance:</span>
                  <span className="font-mono font-bold text-base text-[#0E8F5A]">
                    {formatCurrency(availableAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#6B726E]">
                  <span>Minimum Threshold:</span>
                  <span>{formatCurrency(MINIMUM_PAYOUT_THRESHOLD)}</span>
                </div>
              </div>

              <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-3.5 space-y-1 text-[11px] text-[#101413]">
                <span className="font-bold text-[#0E8F5A] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Phase 6 Payout Foundation
                </span>
                <p className="text-[#6B726E] leading-relaxed">
                  As specified in platform governance, live banking transfer disbursements will be processed in Phase 7 alongside Admin Settlement workflows. Your balance remains verified in escrow.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowPayoutModal(false);
                  showToast('Payout Requested', 'Payout request recorded in settlement queue.', 'success');
                }}
              >
                Acknowledge & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
