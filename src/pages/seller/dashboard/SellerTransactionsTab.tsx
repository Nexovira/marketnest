/**
 * @file src/pages/seller/dashboard/SellerTransactionsTab.tsx
 * Merchant transaction history ledger.
 * Displays date, order number, gross sale, platform commission, payment processing fee,
 * net amount, and settlement status in desktop table and mobile cards.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { SellerEarning } from '../../../types';
import { formatNairaAmount } from '../../../utils/money';
import { formatCustomerDate } from '../../../services/dateService';
import { CheckCircle2, Clock, RotateCcw, ArrowDownRight, Search } from 'lucide-react';

export const SellerTransactionsTab: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [transactions, setTransactions] = useState<SellerEarning[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
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
        setTransactions(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        console.warn('Error loading seller transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [firebaseUser]);

  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.orderNumber?.toLowerCase().includes(q) ||
      t.orderId?.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: SellerEarning['status']) => {
    switch (status) {
      case 'available':
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9]">
            <CheckCircle2 className="w-3 h-3" /> Settled
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> In Escrow
          </span>
        );
      case 'reversed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <RotateCcw className="w-3 h-3" /> Reversed
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

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Transaction Ledger</h2>
          <p className="text-xs text-[#6B726E]">
            Detailed order payouts, platform commission calculations, and payment gateway fees.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or status..."
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6B726E]">Loading transactions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center space-y-3">
          <ArrowDownRight className="w-12 h-12 text-[#6B726E] mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-[#101413]">No transactions recorded</h3>
          <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
            Transactions will appear automatically when customers complete verified Paystack orders for your products.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-[#101413]">
              <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E] font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Gross Sale</th>
                  <th className="py-3 px-4">Platform Fee (8%)</th>
                  <th className="py-3 px-4">Paystack Fee</th>
                  <th className="py-3 px-4 font-bold text-[#0E8F5A]">Net Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7E5]">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FBFBFA] transition-colors">
                    <td className="py-3.5 px-4 text-[#6B726E] font-medium whitespace-nowrap">
                      {formatCustomerDate(t.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">
                      {t.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#101413] tabular-nums">
                      {formatNairaAmount(t.grossAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-rose-700 font-medium tabular-nums">
                      -{formatNairaAmount(t.platformCommission)}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B726E] tabular-nums">
                      -{formatNairaAmount(t.paymentProcessingFee || 0)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#0E8F5A] tabular-nums">
                      {formatNairaAmount(t.netAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">{getStatusBadge(t.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-2">
                  <span className="font-mono font-bold text-[#101413]">{t.orderNumber}</span>
                  {getStatusBadge(t.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#6B726E] block">Date</span>
                    <span className="font-medium text-[#101413]">{formatCustomerDate(t.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#6B726E] block">Gross Sale</span>
                    <span className="font-bold text-[#101413] tabular-nums">{formatNairaAmount(t.grossAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[#6B726E] block">Platform Fee (8%)</span>
                    <span className="text-rose-700 tabular-nums">-{formatNairaAmount(t.platformCommission)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#6B726E] block">Paystack Rail Fee</span>
                    <span className="text-[#6B726E] tabular-nums">-{formatNairaAmount(t.paymentProcessingFee || 0)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between font-bold">
                  <span className="text-[#101413]">Net Store Payout</span>
                  <span className="text-base text-[#0E8F5A] tabular-nums">{formatNairaAmount(t.netAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
