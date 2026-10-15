/**
 * @file src/pages/admin/AdminPayoutsPage.tsx
 * Merchant escrow disbursements & affiliate payout manager for MarketNest Administrators.
 * Handles electronic banking transfer authorizations, settlement references, and payout states.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { MarketplacePayout } from '../../types';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  DollarSign,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Store,
  Sparkles
} from 'lucide-react';

export const AdminPayoutsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const [payouts, setPayouts] = useState<MarketplacePayout[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayouts();
      setPayouts(data);
    } catch (err) {
      console.warn('Error loading payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleUpdateStatus = (payout: MarketplacePayout, nextStatus: string) => {
    requestConfirm({
      title: `Update Payout Status: ${formatCurrency(payout.amount)}`,
      description: `Transition payout to "${nextStatus.toUpperCase()}" for ${payout.recipientName} (${payout.destinationBank})?`,
      confirmText: `Confirm ${nextStatus}`,
      danger: nextStatus === 'failed' || nextStatus === 'cancelled',
      requireReason: nextStatus === 'failed' || nextStatus === 'cancelled',
      onConfirm: async (reason) => {
        await adminService.updatePayoutStatus(payout.id, nextStatus, reason, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadPayouts();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">
            Disbursements & Bank Payout Orders
          </h2>
          <p className="text-xs text-[#6B726E]">
            Process verified merchant escrow releases and affiliate partner commission bank payouts.
          </p>
        </div>

        <span className="text-xs font-bold bg-[#E8F5EF] text-[#0E8F5A] px-3 py-1.5 rounded-lg border border-[#A7E2C9] self-start sm:self-auto">
          Nigerian Banking Rails (NIP Protocol)
        </span>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Payout Reference</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Bank & Account</th>
                <th className="py-3 px-4">Disbursement Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requested</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading payout orders...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B726E]">
                    No disbursement orders in the queue.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => {
                  const isPaid = p.status === 'paid';
                  const isProcessing = p.status === 'processing';

                  return (
                    <tr key={p.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">
                        {p.reference}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#101413] block">{p.recipientName}</span>
                        <span className="text-[10px] text-[#6B726E] font-mono">{p.recipientId}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.recipientType === 'seller'
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {p.recipientType === 'seller' ? <Store className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                          <span className="capitalize">{p.recipientType}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#101413] block">{p.destinationBank}</span>
                        <span className="text-[11px] text-[#6B726E] font-mono">
                          {p.accountNumberMasked} ({p.accountName})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413] tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : isProcessing
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E]">
                        {formatCustomerDate(p.requestedAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {hasPermission('payouts.manage') && !isPaid && (
                          <div className="flex items-center justify-end gap-1.5">
                            {isProcessing ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleUpdateStatus(p, 'paid')}
                              >
                                Mark Paid
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(p, 'processing')}
                              >
                                Authorize
                              </Button>
                            )}
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
