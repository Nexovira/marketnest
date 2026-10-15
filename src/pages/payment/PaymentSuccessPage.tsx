/**
 * @file src/pages/payment/PaymentSuccessPage.tsx
 * Premium Paystack payment confirmation screen.
 * Displays authoritative order reference, payment badge, escrow status,
 * delivery estimate, and receipt trigger.
 */

import React, { useEffect, useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { getOrderById } from '../../services/orderService';
import { Order } from '../../types';
import { formatNairaAmount } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  CheckCircle2,
  ShieldCheck,
  Package,
  ArrowRight,
  Receipt,
  Truck,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { PaymentReceiptModal } from '../../components/PaymentReceiptModal';

export const PaymentSuccessPage: React.FC = () => {
  const { selectedOrderId, searchQuery, navigateTo } = useMarket();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  // Extract reference or orderId
  const reference = searchQuery || '';

  useEffect(() => {
    if (selectedOrderId) {
      getOrderById(selectedOrderId)
        .then((fetched) => {
          if (fetched) setOrder(fetched);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [selectedOrderId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-8 animate-in fade-in">
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mx-auto ring-8 ring-[#E8F5EF]/50">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5EF] text-[#0E8F5A] text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Payment Verified & Confirmed</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight">
          Payment confirmed.
        </h1>
        <p className="text-sm text-[#6B726E] max-w-md mx-auto">
          Your payment was processed securely via Paystack. Funds are held in MarketNest Escrow until your delivery is inspected.
        </p>
      </div>

      {/* Payment Receipt Box */}
      <div className="bg-white border border-[#E4E7E5] rounded-2xl shadow-xs overflow-hidden divide-y divide-[#E4E7E5]">
        <div className="p-6 bg-[#FBFBFA] space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#6B726E] text-[11px] block">ORDER NUMBER</span>
              <span className="font-mono font-bold text-sm text-[#101413]">
                {order?.orderNumber || 'MN-CONFIRMED'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[#6B726E] text-[11px] block">AMOUNT PAID</span>
              <span className="font-extrabold text-base text-[#0E8F5A] tabular-nums">
                {order ? formatNairaAmount(order.total) : '₦--'}
              </span>
            </div>

            {reference && (
              <div className="col-span-2 pt-2 border-t border-[#E4E7E5]/70">
                <span className="text-[#6B726E] text-[11px] block">PAYSTACK REFERENCE</span>
                <span className="font-mono font-bold text-xs text-[#101413]">{reference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="p-6 space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-[#0E8F5A] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#101413] block">Estimated Delivery</span>
              <span className="text-[#6B726E]">
                {order?.estimatedDeliveryDate || 'Within 24–48 Hours across Lagos'}
              </span>
            </div>
          </div>

          {order?.shippingAddress && (
            <div className="flex items-start gap-3 pt-2">
              <MapPin className="w-4 h-4 text-[#6B726E] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#101413] block">Destination</span>
                <span className="text-[#6B726E]">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Escrow Guarantee Callout */}
        <div className="p-6 bg-[#E8F5EF]/40 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#101413] leading-relaxed">
            <strong>MarketNest Escrow Guarantee:</strong> Independent merchants are notified immediately to dispatch your parcels. Funds are only disbursed once you confirm receipt.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigateTo('account', { tab: 'orders' })}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View Order
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowReceipt(true)}
          leftIcon={<Receipt className="w-4 h-4" />}
        >
          View Receipt
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigateTo('shop')}
        >
          Continue Shopping
        </Button>
      </div>

      {/* Receipt Modal */}
      {showReceipt && order && (
        <PaymentReceiptModal
          order={order}
          reference={reference || (order as any).paymentReference || 'MN-PAY-VERIFIED'}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
