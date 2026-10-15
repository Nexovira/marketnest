/**
 * @file src/pages/admin/AdminPaymentsPage.tsx
 * Authoritative payment monitoring & reconciliation portal for MarketNest Administrators.
 * Compares Paystack banking settlements against order documents and flags discrepancies.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Building,
  RefreshCw
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'reconciliation'>('all');

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayments();
      setPayments(data);
    } catch (err) {
      console.warn('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = payments.filter((p) => {
    if (tab === 'reconciliation' && p.reconciliationStatus === 'matched') return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.reference || '').toLowerCase().includes(q) ||
      (p.customerName || '').toLowerCase().includes(q) ||
      (p.customerEmail || '').toLowerCase().includes(q) ||
      (p.orderNumber || '').toLowerCase().includes(q)
    );
  });

  const handleReconcile = (payment: any) => {
    requestConfirm({
      title: `Reconcile Transaction: ${payment.reference}`,
      description: `Verify and mark transaction "${payment.reference}" as reconciled. Enter manual ledger notes or bank confirmation details.`,
      confirmText: 'Mark Reconciled',
      danger: false,
      requireReason: true,
      onConfirm: async (reason) => {
        await adminService.reconcilePayment(payment.reference, 'manual_match', reason, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadPayments();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">
            Payment Processing & Banking Rails
          </h2>
          <p className="text-xs text-[#6B726E]">
            Inspect Paystack transactions, payment channels, settlement reconciliation, and escrow holdings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-lg border border-[#E4E7E5] bg-white p-0.5 text-xs">
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                tab === 'all' ? 'bg-[#101413] text-white font-bold' : 'text-[#6B726E]'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setTab('reconciliation')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                tab === 'reconciliation'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-amber-800 bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flagged Discrepancies</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, order, or email..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-white focus:outline-hidden focus:border-[#101413] w-56 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment Reference</th>
                <th className="py-3 px-4">Associated Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Rail Channel</th>
                <th className="py-3 px-4">Gateway Status</th>
                <th className="py-3 px-4">Reconciliation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading payment records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B726E]">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isPaid = p.status === 'paid';
                  const isMismatched = p.reconciliationStatus === 'mismatch_detected';

                  return (
                    <tr key={p.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">
                        {p.reference}
                        {p.paystackTransactionId && (
                          <span className="block text-[10px] text-[#6B726E] font-normal">
                            Tx: {p.paystackTransactionId}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="font-bold text-[#101413] block">{p.orderNumber || p.orderId}</span>
                        <span className="text-[10px] text-[#6B726E]">{formatCustomerDate(p.createdAt)}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#101413] block">{p.customerName || 'Customer'}</span>
                        <span className="text-[11px] text-[#6B726E]">{p.customerEmail}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413] tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-[#6B726E]">
                        {p.channel || 'Card'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isPaid ? 'Approved (Paid)' : p.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isMismatched
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isMismatched ? 'Mismatch Flag' : 'Reconciled'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isMismatched && hasPermission('payments.reconcile') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReconcile(p)}
                          >
                            Reconcile
                          </Button>
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
