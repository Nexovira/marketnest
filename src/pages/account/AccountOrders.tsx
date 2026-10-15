/**
 * @file src/pages/account/AccountOrders.tsx
 * Customer order history and order tracking powered by real Firestore orders.
 * Supports multi-seller status timelines, cancellation of eligible orders, and inspection details.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { getCustomerOrders, cancelCustomerOrder } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Package,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Store,
  X
} from 'lucide-react';

export const AccountOrders: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { navigateTo, showToast } = useMarket();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Cancellation modal state
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetched = await getCustomerOrders(firebaseUser.uid);
      setOrders(fetched);
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [firebaseUser]);

  const handleConfirmCancel = async () => {
    if (!orderToCancel || !firebaseUser) return;
    setCancelling(true);
    try {
      await cancelCustomerOrder(orderToCancel.id, firebaseUser.uid);
      showToast('Order Cancelled', `Order ${orderToCancel.orderNumber} has been cancelled.`, 'info');
      setOrderToCancel(null);
      if (selectedOrder && selectedOrder.id === orderToCancel.id) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled', orderStatus: 'cancelled' });
      }
      await fetchOrders();
    } catch (err: any) {
      showToast('Cancellation Failed', err.message || 'Unable to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Processing
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Order Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Package className="w-3 h-3 text-indigo-600" /> Packaging Items
          </span>
        );
      case 'shipped':
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" /> In Transit with Courier
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9]">
            <CheckCircle2 className="w-3 h-3 text-[#0E8F5A]" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Timeline step helper
  const renderTimeline = (currentStatus: OrderStatus) => {
    const steps: { status: OrderStatus; label: string }[] = [
      { status: 'pending', label: 'Order Placed' },
      { status: 'confirmed', label: 'Confirmed' },
      { status: 'processing', label: 'Processing' },
      { status: 'dispatched', label: 'Shipped' },
      { status: 'delivered', label: 'Delivered' }
    ];

    if (currentStatus === 'cancelled') {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>This order was cancelled. Product inventory was returned to stock.</span>
        </div>
      );
    }

    const orderRank: Record<OrderStatus, number> = {
      pending: 1,
      confirmed: 2,
      processing: 3,
      dispatched: 4,
      shipped: 4,
      delivered: 5,
      cancelled: 0
    };

    const currentRank = orderRank[currentStatus] || 1;

    return (
      <div className="py-4">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#E4E7E5] -z-0" />
          {steps.map((step, idx) => {
            const stepRank = orderRank[step.status];
            const isCompleted = currentRank > stepRank;
            const isCurrent = currentRank === stepRank;

            return (
              <div key={idx} className="flex flex-col items-center relative z-10 space-y-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#0E8F5A] text-white'
                      : isCurrent
                      ? 'bg-[#101413] text-white ring-4 ring-[#E8F5EF]'
                      : 'bg-white border-2 border-[#E4E7E5] text-[#6B726E]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium text-center ${
                    isCurrent ? 'font-bold text-[#101413]' : isCompleted ? 'text-[#0E8F5A]' : 'text-[#6B726E]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6B726E]">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto">
          <Package className="w-7 h-7 opacity-40" />
        </div>
        <h3 className="text-xl font-bold text-[#101413]">No orders yet.</h3>
        <p className="text-xs sm:text-sm text-[#6B726E] leading-relaxed">
          Your orders will appear here automatically with real-time dispatch tracking and escrow protection.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={() => navigateTo('shop')}>
            Explore Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E7E5] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">My Orders</h2>
          <p className="text-xs text-[#6B726E]">
            Track shipments, inspect multi-seller parcels, and view receipts.
          </p>
        </div>
        <span className="text-xs font-bold text-[#101413] tabular-nums">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const currentStatus = order.orderStatus || order.status;
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          const firstItem = order.items[0];
          const isEligibleToCancel = currentStatus === 'pending' || currentStatus === 'confirmed';

          return (
            <div
              key={order.id}
              className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs hover:border-[#CBD5E1] transition-all"
            >
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 bg-[#FBFBFA] border-b border-[#E4E7E5] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#101413] font-mono text-sm">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(currentStatus)}
                  </div>
                  <p className="text-[11px] text-[#6B726E]">
                    Placed on {formatCustomerDate(order.createdAt)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#101413] text-sm tabular-nums">
                    {formatCurrency(order.total)}
                  </span>
                  {order.paymentStatus === 'paid' ? (
                    <span className="text-[10px] font-bold text-[#0E8F5A] bg-[#E8F5EF] border border-[#A7E2C9] px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Paid & Escrowed
                    </span>
                  ) : order.paymentStatus === 'failed' ? (
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      Payment Failed
                    </span>
                  ) : order.paymentStatus === 'refunded' ? (
                    <span className="text-[10px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                      Refunded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Payment Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Item Previews */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex -space-x-2 shrink-0">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.productImage || '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg'}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-xs bg-[#F7F5F0]"
                      />
                    ))}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-[#101413] truncate max-w-md">
                      {firstItem?.productTitle || firstItem?.productName}
                      {order.items.length > 1 && ` and ${order.items.length - 1} other item(s)`}
                    </p>
                    <p className="text-[11px] text-[#6B726E] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#0E8F5A]" />
                      <span>
                        Delivering to {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isEligibleToCancel && (
                    <button
                      type="button"
                      onClick={() => setOrderToCancel(order)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    View Order Details
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Slide-Over / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E4E7E5] shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-4">
              <div>
                <span className="text-xs text-[#6B726E]">Order Inspection</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-black text-[#101413] font-mono">{selectedOrder.orderNumber}</h3>
                  {selectedOrder.paymentStatus === 'paid' ? (
                    <span className="text-[10px] font-bold text-[#0E8F5A] bg-[#E8F5EF] border border-[#A7E2C9] px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Paid & Escrowed
                    </span>
                  ) : selectedOrder.paymentStatus === 'failed' ? (
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      Payment Failed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Payment Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B726E]">
                  Placed on {formatCustomerDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-[#6B726E] hover:text-[#101413] rounded-full hover:bg-[#F7F5F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B726E] mb-2">
                Order Timeline
              </h4>
              {renderTimeline(selectedOrder.orderStatus || selectedOrder.status)}
            </div>

            {/* Delivery Details */}
            <div className="bg-[#F7F5F0] rounded-xl p-4 text-xs space-y-2 border border-[#E4E7E5]">
              <span className="font-bold text-[#101413] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0E8F5A]" /> Delivery Address
              </span>
              <p className="text-[#101413] font-semibold">{selectedOrder.shippingAddress.fullName}</p>
              <p className="text-[#6B726E]">{selectedOrder.shippingAddress.street}</p>
              <p className="text-[#6B726E]">
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, Nigeria
              </p>
              <p className="text-[#6B726E]">{selectedOrder.shippingAddress.phone}</p>
            </div>

            {/* Multi-Seller Parcels & Line Items */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B726E]">
                Items by Merchant
              </h4>

              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-[#E4E7E5] flex items-center justify-between text-xs hover:bg-[#FBFBFA]"
                  >
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
                          <span>Fulfilled by {item.storeName}</span>
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

            {/* Financial Summary */}
            <div className="bg-[#F7F5F0] rounded-xl p-4 text-xs space-y-2 border border-[#E4E7E5]">
              <div className="flex justify-between text-[#6B726E]">
                <span>Items Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B726E]">
                <span>Shipping & Courier</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : formatCurrency(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[#101413] pt-2 border-t border-[#E4E7E5]">
                <span>Total Amount</span>
                <span className="text-[#0E8F5A]">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E4E7E5]">
              {(selectedOrder.orderStatus === 'pending' || selectedOrder.status === 'pending') && (
                <button
                  type="button"
                  onClick={() => setOrderToCancel(selectedOrder)}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Cancel this order
                </button>
              )}
              <div className="ml-auto">
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7E5] shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#101413]">Cancel this order?</h3>
              <p className="text-xs text-[#6B726E]">
                Are you sure you want to cancel order <strong>{orderToCancel.orderNumber}</strong>? Reserved inventory will be returned to the store catalog.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setOrderToCancel(null)}
                disabled={cancelling}
              >
                Keep Order
              </Button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
