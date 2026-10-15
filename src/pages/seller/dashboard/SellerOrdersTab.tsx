/**
 * @file src/pages/seller/dashboard/SellerOrdersTab.tsx
 * Order fulfillment management for MarketNest sellers.
 * Includes Lagos dispatch tracking, customer shipping details, escrow status, and status updating.
 */

import React, { useState } from 'react';
import { useSeller } from '../../../context/SellerContext';
import { useMarket } from '../../../context/MarketContext';
import { formatNaira } from '../../../components/ui/PriceDisplay';
import { Button } from '../../../components/ui/Button';
import { Order, OrderStatus } from '../../../types';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  ChevronRight,
  X,
  AlertCircle
} from 'lucide-react';

export const SellerOrdersTab: React.FC = () => {
  const { sellerOrders, updateOrderDispatch } = useSeller();
  const { showToast } = useMarket();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = sellerOrders.filter((order) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchCust = order.shippingAddress.fullName?.toLowerCase().includes(q);
      const matchCity = order.shippingAddress.city.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchCity) return false;
    }
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderDispatch(orderId, nextStatus);
      showToast('Order Updated', `Order marked as ${nextStatus.toUpperCase()}. Customer notified.`, 'success');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
    } catch {
      showToast('Error', 'Unable to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Awaiting Fulfillment
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Package className="w-3 h-3 text-blue-600" /> Packaging
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Truck className="w-3 h-3 text-indigo-600" /> In Transit
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9]">
            <CheckCircle2 className="w-3 h-3 text-[#0E8F5A]" /> Delivered & Released
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Cancelled
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Store Orders</h2>
          <p className="text-xs text-[#6B726E]">
            Process customer orders, print dispatch waybills, and update shipment milestones.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or customer..."
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'processing', 'dispatched', 'delivered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#101413] text-white'
                  : 'bg-[#F7F5F0] text-[#6B726E] hover:text-[#101413]'
              }`}
            >
              {st === 'all' ? 'All Orders' : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-[#6B726E] mx-auto opacity-40" />
          <h3 className="text-base font-semibold text-[#101413]">No orders found</h3>
          <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters or search keywords.'
              : 'Incoming customer orders will appear here automatically with escrow protection.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#101413]">
              <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E] font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total & Escrow</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7E5]">
                {filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
                  const firstItem = order.items[0];

                  return (
                    <tr key={order.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-[#101413]">{order.orderNumber}</div>
                        <div className="text-[11px] text-[#6B726E]">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#101413]">
                          {order.shippingAddress.fullName || 'Customer'}
                        </div>
                        <div className="text-[11px] text-[#6B726E] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0E8F5A]" />
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {firstItem && (
                            <img
                              src={firstItem.productImage}
                              alt=""
                              className="w-9 h-9 rounded object-cover border border-[#E4E7E5] shrink-0"
                            />
                          )}
                          <div className="max-w-[180px]">
                            <p className="truncate font-medium text-[#101413]">{firstItem?.productTitle}</p>
                            <p className="text-[10px] text-[#6B726E]">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#101413] tabular-nums">
                          {formatNaira(order.total)}
                        </div>
                        <div className="text-[10px] text-[#0E8F5A] flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3 h-3" /> Escrow Secured
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E4E7E5] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-4">
              <div>
                <span className="text-xs text-[#6B726E]">Order Details</span>
                <h3 className="text-xl font-bold text-[#101413]">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-[#6B726E] hover:text-[#101413] rounded-full hover:bg-[#F7F5F0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Escrow Banner */}
            <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0 mt-0.5" />
              <div className="text-xs text-[#101413]">
                <p className="font-semibold text-[#0E8F5A]">Payment Secured in MarketNest Escrow</p>
                <p className="text-[#6B726E] mt-0.5">
                  ₦{selectedOrder.total.toLocaleString()} is safely held in escrow. Payout will be credited immediately to your store balance upon verified delivery.
                </p>
              </div>
            </div>

            {/* Customer & Delivery Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F5F0] rounded-xl p-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#101413] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0E8F5A]" /> Recipient
                </span>
                <p className="text-[#101413]">{selectedOrder.shippingAddress.fullName || 'Customer'}</p>
                <p className="text-[#6B726E] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {selectedOrder.shippingAddress.phone || '+234 800 000 0000'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#101413] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0E8F5A]" /> Delivery Address
                </span>
                <p className="text-[#101413]">{selectedOrder.shippingAddress.street}</p>
                <p className="text-[#6B726E]">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, Nigeria
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B726E]">Line Items</h4>
              <div className="divide-y divide-[#E4E7E5] border border-[#E4E7E5] rounded-xl overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt=""
                        className="w-12 h-12 rounded object-cover border border-[#E4E7E5]"
                      />
                      <div>
                        <p className="font-bold text-[#101413]">{item.productTitle}</p>
                        <p className="text-[#6B726E] text-[11px]">
                          Qty: {item.quantity} × {formatNaira(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold tabular-nums text-[#101413]">
                      {formatNaira(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-[#F7F5F0] rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-[#6B726E]">
                <span>Items Subtotal</span>
                <span>{formatNaira(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B726E]">
                <span>Courier Dispatch Fee</span>
                <span>{formatNaira(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#101413] pt-2 border-t border-[#E4E7E5]">
                <span>Total Escrow Amount</span>
                <span>{formatNaira(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Status Transition Control (Enforcing pending -> confirmed -> processing -> shipped -> delivered) */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[#101413] block">Fulfillment Workflow</label>
              <div className="flex flex-wrap items-center gap-2">
                {selectedOrder.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                    disabled={updatingId === selectedOrder.id}
                  >
                    Confirm Order
                  </Button>
                )}

                {selectedOrder.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                    disabled={updatingId === selectedOrder.id}
                  >
                    Start Packaging
                  </Button>
                )}

                {selectedOrder.status === 'processing' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrder.id, 'dispatched')}
                    disabled={updatingId === selectedOrder.id}
                  >
                    Hand to Dispatch Courier
                  </Button>
                )}

                {(selectedOrder.status === 'dispatched' || (selectedOrder.status as any) === 'shipped') && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                    disabled={updatingId === selectedOrder.id}
                  >
                    Mark as Delivered
                  </Button>
                )}

                {selectedOrder.status === 'delivered' && (
                  <div className="text-xs font-bold text-[#0E8F5A] flex items-center gap-1.5 bg-[#E8F5EF] px-3 py-1.5 rounded-lg border border-[#A7E2C9]">
                    <CheckCircle2 className="w-4 h-4 text-[#0E8F5A]" />
                    <span>Order Delivered · Payout Released to Merchant Account</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E4E7E5]">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
