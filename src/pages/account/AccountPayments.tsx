/**
 * @file src/pages/account/AccountPayments.tsx
 * Customer payment transaction history.
 * Lists all Paystack payments for the authenticated customer with masked channel details,
 * reconciliation status, and direct receipt views.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Payment, Order } from '../../types';
import { formatNairaAmount } from '../../utils/money';
import { formatCustomerDate } from '../../services/dateService';
import { getOrderById } from '../../services/orderService';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PaymentReceiptModal } from '../../components/PaymentReceiptModal';

export const AccountPayments: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { navigateTo } = useMarket();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReceipt, setSelectedReceipt] = useState<{ order: Order; reference: string } | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        const q = query(
          collection(db, 'payments'),
          where('userId', '==', firebaseUser.uid)
        );
        const snap = await getDocs(q);
        const list: Payment[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) });
        });

        // Also check customerId match
        if (list.length === 0) {
          const qCust = query(
            collection(db, 'payments'),
            where('customerId', '==', firebaseUser.uid)
          );
          const snapCust = await getDocs(qCust);
          snapCust.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) });
          });
        }

        setPayments(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        console.warn('Error fetching customer payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [firebaseUser]);

  const handleOpenReceipt = async (orderId: string, reference: string) => {
    try {
      const order = await getOrderById(orderId);
      if (order) {
        setSelectedReceipt({ order, reference });
      }
    } catch (e) {
      console.warn('Could not load order for receipt:', e);
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9]">
            <CheckCircle2 className="w-3 h-3" /> Paid & Escrowed
          </span>
        );
      case 'pending':
      case 'initialized':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending Verification
          </span>
        );
      case 'failed':
      case 'abandoned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Failed / Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6B726E]">Loading payment history...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto">
          <CreditCard className="w-7 h-7 opacity-40" />
        </div>
        <h3 className="text-xl font-bold text-[#101413]">No payment records found</h3>
        <p className="text-xs text-[#6B726E] leading-relaxed">
          Completed and pending Paystack payments will appear here with references, masked card channels, and official receipts.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={() => navigateTo('shop')}>
            Explore Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E7E5] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Payment History</h2>
          <p className="text-xs text-[#6B726E]">
            Verified Paystack transactions, escrow reservations, and billing records.
          </p>
        </div>
        <span className="text-xs font-bold text-[#101413] tabular-nums">
          {payments.length} {payments.length === 1 ? 'transaction' : 'transactions'}
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#101413]">
            <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E] font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#FBFBFA] transition-colors">
                  <td className="py-3.5 px-4 text-[#6B726E] font-medium whitespace-nowrap">
                    {formatCustomerDate(p.paidAt || p.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">
                    {p.reference}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#101413] tabular-nums">
                    {formatNairaAmount(p.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B726E]">
                    <span className="inline-flex items-center gap-1 font-medium capitalize">
                      <CreditCard className="w-3.5 h-3.5 text-[#0E8F5A]" />
                      {p.channel ? `${p.channel} (Safe masked)` : 'Paystack Rail'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReceipt(p.orderId, p.reference)}
                      leftIcon={<Receipt className="w-3.5 h-3.5" />}
                    >
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <PaymentReceiptModal
          order={selectedReceipt.order}
          reference={selectedReceipt.reference}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
