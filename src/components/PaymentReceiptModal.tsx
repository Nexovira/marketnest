/**
 * @file src/components/PaymentReceiptModal.tsx
 * Official payment receipt presentation modal.
 * Displays authoritative transaction receipt details, order items breakdown,
 * and a future-ready "Download Receipt" action.
 */

import React from 'react';
import { Order } from '../types';
import { formatNairaAmount } from '../utils/money';
import { formatCustomerDate } from '../services/dateService';
import { X, CheckCircle2, Download, Printer, ShieldCheck, Store } from 'lucide-react';
import { Button } from './ui/Button';

import { useMarket } from '../context/MarketContext';

interface PaymentReceiptModalProps {
  order: Order;
  reference: string;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  order,
  reference,
  onClose
}) => {
  const { showToast } = useMarket();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadNotice = () => {
    showToast(
      'Receipt Ready',
      'Digital PDF receipts are securely archived and printable directly.',
      'info'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E4E7E5] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-4">
          <div>
            <span className="text-[11px] font-bold text-[#0E8F5A] uppercase tracking-wider">
              MarketNest Official Receipt
            </span>
            <h2 className="text-xl font-black text-[#101413]">Payment Receipt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B726E] hover:text-[#101413] rounded-full hover:bg-[#F7F5F0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Stage */}
        <div className="bg-[#FBFBFA] border border-[#E4E7E5] rounded-xl p-6 space-y-5 text-xs text-[#101413]">
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-4">
            <div>
              <span className="text-base font-extrabold text-[#101413] tracking-tight">MarketNest</span>
              <p className="text-[10px] text-[#6B726E]">Lagos, Nigeria · Premier Multi-Vendor Marketplace</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E8F5EF] text-[#0E8F5A] font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid & Escrowed</span>
            </div>
          </div>

          {/* Key Receipt Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[#6B726E] text-[10px] uppercase font-semibold block">Order Number</span>
              <span className="font-mono font-bold text-xs">{order.orderNumber}</span>
            </div>

            <div className="text-right">
              <span className="text-[#6B726E] text-[10px] uppercase font-semibold block">Date</span>
              <span className="font-medium text-xs">{formatCustomerDate(order.paidAt || order.createdAt)}</span>
            </div>

            <div>
              <span className="text-[#6B726E] text-[10px] uppercase font-semibold block">Payment Reference</span>
              <span className="font-mono font-bold text-xs text-[#0E8F5A]">{reference}</span>
            </div>

            <div className="text-right">
              <span className="text-[#6B726E] text-[10px] uppercase font-semibold block">Payment Provider</span>
              <span className="font-semibold text-xs">Paystack Gateway</span>
            </div>
          </div>

          {/* Customer & Destination */}
          <div className="pt-2 border-t border-[#E4E7E5] space-y-1">
            <span className="text-[#6B726E] text-[10px] uppercase font-semibold block">Billed To</span>
            <p className="font-bold">{order.shippingAddress?.fullName || order.contactInformation?.fullName}</p>
            <p className="text-[#6B726E] text-[11px]">{order.contactInformation?.email}</p>
            <p className="text-[#6B726E] text-[11px]">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </p>
          </div>

          {/* Items Summary */}
          <div className="pt-2 border-t border-[#E4E7E5] space-y-2">
            <span className="text-[#6B726E] text-[10px] uppercase font-semibold block">Items Summary</span>
            <div className="divide-y divide-[#E4E7E5]/70">
              {order.items.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold">{item.productTitle || item.productName}</span>
                    <span className="text-[#6B726E] block text-[10px]">
                      Qty: {item.quantity} · Merchant: {item.storeName}
                    </span>
                  </div>
                  <span className="font-bold tabular-nums">
                    {formatNairaAmount(item.lineTotal || (item.unitPrice * item.quantity))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="pt-3 border-t border-[#E4E7E5] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#6B726E]">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium">{formatNairaAmount(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6B726E]">
              <span>Delivery Fee</span>
              <span className="tabular-nums font-medium">
                {order.deliveryFee === 0 ? 'FREE' : formatNairaAmount(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#101413] pt-2 border-t border-[#E4E7E5]">
              <span>Amount Paid</span>
              <span className="text-[#0E8F5A] tabular-nums">{formatNairaAmount(order.total)}</span>
            </div>
          </div>

          {/* Escrow Footer Note */}
          <div className="p-2.5 rounded-lg bg-[#E8F5EF] flex items-center gap-2 text-[10px] text-[#101413]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A] shrink-0" />
            <span>Funds held in MarketNest Escrow and disbursed to verified vendors upon delivery.</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Receipt
          </Button>

          <Button
            variant="dark"
            size="sm"
            onClick={handleDownloadNotice}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download PDF Receipt (Future-ready)
          </Button>
        </div>
      </div>
    </div>
  );
};
