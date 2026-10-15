/**
 * @file src/pages/admin/AdminRefundsPage.tsx
 * Refund and customer dispute management portal for MarketNest Administrators.
 * Inspect customer return claims, debit inquiries, and approve reversals with audit trails.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { MarketplaceRefund } from '../../types';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  CreditCard
} from 'lucide-react';

export const AdminRefundsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const [refunds, setRefunds] = useState<MarketplaceRefund[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRefunds();
      setRefunds(data);
    } catch (err) {
      console.warn('Error loading refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleReview = (refund: MarketplaceRefund, action: 'approve' | 'reject' | 'completed') => {
    const isApprove = action === 'approve' || action === 'completed';

    requestConfirm({
      title: `${action.toUpperCase()} Refund: ${formatCurrency(refund.amount)}`,
      description: isApprove
        ? `Approve refund for order ${refund.orderNumber}? Funds will be disbursed back to the original banking channel.`
        : `Decline refund request for order ${refund.orderNumber}? A required compliance explanation is logged.`,
      confirmText: isApprove ? 'Authorize Refund' : 'Reject Request',
      danger: !isApprove,
      requireReason: true,
      onConfirm: async (reason) => {
        await adminService.reviewRefund(refund.id, action, reason, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadRefunds();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">
            Refunds & Return Inquiries
          </h2>
          <p className="text-xs text-[#6B726E]">
            Process customer dispute claims, sizing returns, and double-debit adjustments.
          </p>
        </div>

        <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          {refunds.filter((r) => ['requested', 'reviewing'].includes(r.status)).length} Pending Review
        </span>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Refund ID</th>
                <th className="py-3 px-4">Order Reference</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Claimed Amount</th>
                <th className="py-3 px-4">Dispute Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading refund inquiries...
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B726E]">
                    No active refund disputes.
                  </td>
                </tr>
              ) : (
                refunds.map((r) => {
                  const isPending = ['requested', 'reviewing'].includes(r.status);
                  const isCompleted = r.status === 'completed';

                  return (
                    <tr key={r.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">
                        {r.id}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-[#101413] block">{r.orderNumber}</span>
                        <span className="text-[10px] text-[#6B726E]">{formatCustomerDate(r.requestedAt)}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#101413] block">{r.customerName}</span>
                        <span className="text-[11px] text-[#6B726E]">{r.customerEmail}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413] tabular-nums">
                        {formatCurrency(r.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E] max-w-xs leading-snug">
                        {r.reason}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPending && hasPermission('refunds.manage') && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReview(r, 'reject')}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReview(r, 'approve')}
                            >
                              Authorize
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
