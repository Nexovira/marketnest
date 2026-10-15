/**
 * @file src/pages/OrderSuccessPage.tsx
 * Order confirmation screen displaying receipt, human-friendly order number,
 * multi-seller delivery breakdown, and payment status.
 */

import React, { useEffect, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { formatCurrency } from '../services/currencyService';
import { formatCustomerDate } from '../services/dateService';
import { getOrderById } from '../services/orderService';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Store,
  ExternalLink
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { lastCreatedOrder, selectedOrderId, navigateTo } = useMarket();
  const [order, setOrder] = useState<Order | null>(lastCreatedOrder);
  const [loading, setLoading] = useState<boolean>(!lastCreatedOrder);

  useEffect(() => {
    if (!order && selectedOrderId) {
      setLoading(true);
      getOrderById(selectedOrderId)
        .then((fetched) => {
          if (fetched) setOrder(fetched);
        })
        .finally(() => setLoading(false));
    }
  }, [order, selectedOrderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6B726E]">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-[#6B726E] mx-auto opacity-40" />
        <h2 className="text-2xl font-bold text-[#101413]">Order Not Found</h2>
        <p className="text-xs text-[#6B726E]">
          We could not locate this order receipt. Please check your account orders.
        </p>
        <Button variant="primary" size="md" onClick={() => navigateTo('account', { tab: 'orders' })}>
          View Your Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-in fade-in">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#101413] tracking-tight">
          Order Placed
        </h1>
        <p className="text-sm text-[#6B726E]">
          Your order has been received and scheduled for dispatch.
        </p>

        {/* Order Number Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F5F0] border border-[#E4E7E5] text-xs font-mono font-bold text-[#101413]">
          <span>Order Number:</span>
          <span className="text-[#0E8F5A]">{order.orderNumber}</span>
        </div>
      </div>

      {/* Escrow & Payment Status Banner */}
      <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-2xl p-5 flex items-start gap-3.5 text-xs">
        <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0E8F5A]">Payment Pending · MarketNest Escrow Reserved</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Phase 4 Demo
            </span>
          </div>
          <p className="text-[#101413] leading-relaxed">
            Your products have been committed and inventory reserved. When Paystack gateway is connected in Phase 5, seamless card and bank transfer checkout will finalize payment upon delivery.
          </p>
        </div>
      </div>

      {/* Order Summary Receipt Box */}
      <div className="bg-white border border-[#E4E7E5] rounded-2xl shadow-xs overflow-hidden divide-y divide-[#E4E7E5]">
        {/* Order Meta Header */}
        <div className="p-6 bg-[#FBFBFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[#6B726E]">Date Placed</span>
            <p className="font-bold text-[#101413]">{formatCustomerDate(order.createdAt)}</p>
          </div>
          <div>
            <span className="text-[#6B726E]">Total Amount</span>
            <p className="font-black text-base text-[#101413] tabular-nums">{formatCurrency(order.total)}</p>
          </div>
          <div>
            <span className="text-[#6B726E]">Estimated Delivery</span>
            <p className="font-bold text-[#0E8F5A]">{order.estimatedDeliveryDate}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="p-6 space-y-2 text-xs">
          <h3 className="font-bold text-[#101413] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#0E8F5A]" />
            <span>Delivery Destination</span>
          </h3>
          <p className="text-[#101413] font-semibold">{order.shippingAddress.fullName || order.contactInformation?.fullName}</p>
          <p className="text-[#6B726E]">{order.shippingAddress.street}</p>
          <p className="text-[#6B726E]">
            {order.shippingAddress.city}, {order.shippingAddress.state}, Nigeria
          </p>
          <p className="text-[#6B726E]">{order.shippingAddress.phone || order.contactInformation?.phone}</p>
        </div>

        {/* Multi-Seller Items Breakdown */}
        <div className="p-6 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B726E]">
            Ordered Items ({order.items.length})
          </h3>

          <div className="divide-y divide-[#E4E7E5] border border-[#E4E7E5] rounded-xl overflow-hidden">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#FBFBFA]">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage || '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg'}
                    alt=""
                    className="w-12 h-12 rounded object-cover border border-[#E4E7E5]"
                  />
                  <div>
                    <p className="font-bold text-[#101413]">{item.productTitle || item.productName}</p>
                    <p className="text-[11px] text-[#6B726E] flex items-center gap-1">
                      <Store className="w-3 h-3 text-[#0E8F5A]" />
                      <span>{item.storeName}</span>
                    </p>
                    <p className="text-[11px] text-[#6B726E]">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>

                <span className="font-bold tabular-nums text-[#101413]">
                  {formatCurrency(item.lineTotal || (item.unitPrice * item.quantity))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-6 bg-[#FBFBFA] space-y-2 text-xs">
          <div className="flex justify-between text-[#6B726E]">
            <span>Items Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#6B726E]">
            <span>Shipping & Dispatch</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-[#101413] pt-2 border-t border-[#E4E7E5]">
            <span>Order Total</span>
            <span className="text-[#0E8F5A]">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigateTo('shop')}
        >
          Continue Shopping
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigateTo('account', { tab: 'orders' })}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View My Orders
        </Button>
      </div>
    </div>
  );
};
