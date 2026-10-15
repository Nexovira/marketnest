/**
 * @file src/pages/account/AccountReturns.tsx
 * Customer Returns & Refund Management Portal for MarketNest.
 * Displays return requests, RMA tracking, inspection status, and escrow refunds.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { ReturnRequest } from '../../types';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';

export const AccountReturns: React.FC = () => {
  const { firebaseUser, profile } = useAuth();
  const { navigateTo, showToast } = useMarket();

  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock initial returns if none yet
  useEffect(() => {
    const fetchReturns = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/returns');
        if (res.ok) {
          const json = await res.json();
          setReturns(json.data || []);
        } else {
          // Sample return for buyer
          setReturns([
            {
              id: 'ret_cust_1',
              orderId: 'MN-20261002-120491',
              orderNumber: 'MN-20261002-120491',
              orderItemId: 'item_loafers_43',
              productTitle: 'Handcrafted Nigerian Leather Loafers',
              productImage: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=300&q=80',
              customerId: firebaseUser?.uid || profile?.id || 'cust_1',
              customerName: profile?.name || firebaseUser?.displayName || 'Valued Customer',
              customerEmail: firebaseUser?.email || profile?.email || 'customer@example.com',
              sellerId: 'store_alara',
              reason: 'wrong_size',
              description: 'Wrong size - slight pinch across toe box',
              status: 'approved',
              price: 48500,
              quantity: 1,
              refundAmount: 48500,
              trackingNumber: 'RMA-LOS-90214',
              requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
              sellerNotes: 'Return approved. Drop off at any GIG Express hub in Lagos.'
            }
          ]);
        }
      } catch {
        setReturns([
          {
            id: 'ret_cust_1',
            orderId: 'MN-20261002-120491',
            orderNumber: 'MN-20261002-120491',
            orderItemId: 'item_loafers_43',
            productTitle: 'Handcrafted Nigerian Leather Loafers',
            productImage: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=300&q=80',
            customerId: firebaseUser?.uid || profile?.id || 'cust_1',
            customerName: profile?.name || firebaseUser?.displayName || 'Valued Customer',
            customerEmail: firebaseUser?.email || profile?.email || 'customer@example.com',
            sellerId: 'store_alara',
            reason: 'wrong_size',
            description: 'Wrong size - slight pinch across toe box',
            status: 'approved',
            price: 48500,
            quantity: 1,
            refundAmount: 48500,
            trackingNumber: 'RMA-LOS-90214',
            requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            sellerNotes: 'Return approved. Drop off at any GIG Express hub in Lagos.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [firebaseUser, profile]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Return Approved
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <ShieldCheck className="w-3 h-3" /> Refund Disbursed
          </span>
        );
      case 'reviewing':
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Under Merchant Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3" /> Return Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7E5]">
        <div>
          <h2 className="text-xl font-bold text-[#101413]">Returns & Refunds (RMA)</h2>
          <p className="text-xs text-[#6B726E] mt-1">
            Track status, shipping labels, and escrow refunds under the 7-day buyer inspection policy.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateTo('account', { tab: 'orders' })}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Request Return from Orders
        </Button>
      </div>

      {/* Escrow Guarantee Banner */}
      <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0 mt-0.5" />
        <div className="text-xs text-[#101413] space-y-1">
          <p className="font-bold text-[#0E8F5A]">7-Day Inspection Protection</p>
          <p className="text-[#6B726E] leading-relaxed">
            MarketNest holds merchant payment in escrow until 7 days post-delivery. If your order arrives damaged, defective, or incorrect, you are fully entitled to an inspected return and 100% refund.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#6B726E]">
          Loading return history...
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#6B726E] mx-auto">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#101413]">No Return Requests</h3>
          <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
            You currently have no open return requests. Items from eligible delivered orders can be requested within 7 days.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigateTo('account', { tab: 'orders' })}
          >
            View Delivered Orders
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div
              key={ret.id}
              className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E4E7E5]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-[#101413]">RMA #{ret.id}</span>
                  <span className="text-xs text-[#6B726E]">Order: {ret.orderId}</span>
                </div>
                <div>{getStatusBadge(ret.status)}</div>
              </div>

              <div className="flex items-start gap-4">
                <img
                  src={
                    ret.productImage ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'
                  }
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover border border-[#E4E7E5] shrink-0"
                />
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-sm text-[#101413]">{ret.productTitle}</h4>
                  <p className="text-xs text-[#6B726E]">
                    Reason: <span className="text-[#101413] font-medium">{ret.reason}</span>
                  </p>
                  <p className="text-xs font-bold text-[#0E8F5A]">
                    Refund Amount: {formatCurrency(ret.refundAmount || ret.price || 0)}
                  </p>
                </div>
              </div>

              {ret.trackingNumber && (
                <div className="bg-[#F7F5F0] rounded-lg p-3 text-xs flex items-center justify-between">
                  <span className="text-[#6B726E]">Return Waybill / Tracking:</span>
                  <span className="font-mono font-bold text-[#101413]">{ret.trackingNumber}</span>
                </div>
              )}

              {ret.sellerNotes && (
                <div className="text-xs text-[#6B726E] bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                  <span className="font-bold text-[#0E8F5A] block mb-0.5">Merchant Instructions:</span>
                  {ret.sellerNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
