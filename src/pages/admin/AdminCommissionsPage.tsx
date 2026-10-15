/**
 * @file src/pages/admin/AdminCommissionsPage.tsx
 * Marketplace take-rate and affiliate commission audit ledger for MarketNest Administrators.
 * Displays gross fees, payment rail processing costs, and audited commission reversals.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  Percent,
  DollarSign,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export const AdminCommissionsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCommissions();
      setData(res);
    } catch (err) {
      console.warn('Error loading commissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, []);

  const handleReverse = (comm: any) => {
    requestConfirm({
      title: `Reverse Affiliate Commission: ${formatCurrency(comm.commissionAmount)}`,
      description: `Reverse commission for affiliate "${comm.code}" on order ${comm.orderNumber}? A required compliance justification must be provided.`,
      confirmText: 'Reverse Commission',
      danger: true,
      requireReason: true,
      onConfirm: async (reason) => {
        await adminService.reverseAffiliateCommission(comm.id, reason!, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadCommissions();
      }
    });
  };

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-xs text-[#6B726E]">
        <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading commission ledgers...
      </div>
    );
  }

  const { summary, affiliateCommissions } = data;

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Header */}
      <div>
        <h2 className="text-base font-black text-[#101413] tracking-tight">
          Platform Take-Rates & Commissions
        </h2>
        <p className="text-xs text-[#6B726E]">
          Transparent accounting of platform take rates, banking rail deductions, and creator referral payouts.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-semibold uppercase tracking-wider">Gross Platform Take</span>
            <Percent className="w-4 h-4 text-[#0E8F5A]" />
          </div>
          <div className="text-xl font-black font-mono text-[#0E8F5A] tabular-nums">
            {formatCurrency(summary.totalPlatformCommissions)}
          </div>
          <p className="text-[11px] text-[#6B726E]">~10% baseline marketplace take</p>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-semibold uppercase tracking-wider">Merchant Payouts</span>
            <DollarSign className="w-4 h-4 text-[#101413]" />
          </div>
          <div className="text-xl font-black font-mono text-[#101413] tabular-nums">
            {formatCurrency(summary.totalSellerCommissions)}
          </div>
          <p className="text-[11px] text-[#6B726E]">Escrow released to verified sellers</p>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-semibold uppercase tracking-wider">Paystack Banking Fees</span>
            <CreditCard className="w-4 h-4 text-[#6B726E]" />
          </div>
          <div className="text-xl font-black font-mono text-[#101413] tabular-nums">
            {formatCurrency(summary.paymentProcessingFees)}
          </div>
          <p className="text-[11px] text-[#6B726E]">1.5% gateway card & transfer rail cost</p>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6B726E]">
            <span className="font-semibold uppercase tracking-wider">Net Platform Earnings</span>
            <TrendingUp className="w-4 h-4 text-[#0E8F5A]" />
          </div>
          <div className="text-xl font-black font-mono text-[#0E8F5A] tabular-nums">
            {formatCurrency(summary.netPlatformEarnings)}
          </div>
          <p className="text-[11px] text-[#6B726E]">Retained marketplace operating profit</p>
        </div>
      </div>

      {/* Affiliate Commissions Ledger Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#101413]">Affiliate Referral Commission Ledger</h3>
            <p className="text-xs text-[#6B726E]">
              Tracked commissions earned by partners on confirmed paid orders.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            5.0% Standard Affiliate Split
          </span>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Partner Code</th>
                  <th className="py-3 px-4">Order Reference</th>
                  <th className="py-3 px-4">Eligible Subtotal</th>
                  <th className="py-3 px-4 text-center">Split Rate</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7E5]">
                {affiliateCommissions.map((c: any) => {
                  const isReversed = c.status === 'reversed';

                  return (
                    <tr key={c.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                        {c.code}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#101413]">
                        {c.orderNumber}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#6B726E] tabular-nums">
                        {formatCurrency(c.eligibleAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {(c.commissionRate * 100).toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#0E8F5A] tabular-nums">
                        {formatCurrency(c.commissionAmount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isReversed
                              ? 'bg-rose-100 text-rose-700'
                              : c.status === 'approved'
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E]">
                        {c.createdAt ? formatCustomerDate(c.createdAt) : 'Recently'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isReversed && hasPermission('commissions.view') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReverse(c)}
                          >
                            Reverse
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
