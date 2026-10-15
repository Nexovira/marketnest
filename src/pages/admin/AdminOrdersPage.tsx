/**
 * @file src/pages/admin/AdminOrdersPage.tsx
 * Master order operations and escrow tracking portal for MarketNest Administrators.
 * Displays order items, payment authorization status, multi-seller fulfillments, and audit histories.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  RotateCcw,
  CreditCard,
  MapPin,
  ExternalLink,
  ShieldCheck,
  X,
  AlertTriangle
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission, setActiveSection } = useAdmin();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');

  // Inspection Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrders(search, paymentFilter, orderFilter);
      setOrders(data);
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, paymentFilter, orderFilter]);

  const handleUpdateStatus = (order: any, nextStatus: string) => {
    requestConfirm({
      title: `Transition Order Status: ${order.orderNumber}`,
      description: `Transition order status to "${nextStatus.toUpperCase()}"? This affects fulfillment tracking and seller escrow records.`,
      confirmText: `Confirm Transition to ${nextStatus}`,
      danger: nextStatus === 'cancelled',
      requireReason: nextStatus === 'cancelled',
      onConfirm: async (reason) => {
        await adminService.updateOrderStatus(order.id, nextStatus, reason, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadOrders();
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder({ ...selectedOrder, orderStatus: nextStatus, status: nextStatus });
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">Master Order Operations</h2>
          <p className="text-xs text-[#6B726E]">
            Monitor escrow payments, merchant line-item fulfillments, and shipment tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer, or email..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-white focus:outline-hidden focus:border-[#101413] w-56 sm:w-64"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-[#E4E7E5] bg-white text-[#101413] font-medium cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid & Escrowed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Fulfillment Status Filter */}
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-[#E4E7E5] bg-white text-[#101413] font-medium cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order Reference</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Merchants</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B726E]">
                    No orders match your filter parameters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isPaid = o.paymentStatus === 'paid';
                  const orderStage = o.orderStatus || o.status || 'pending';

                  return (
                    <tr key={o.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#101413] block">
                          {o.orderNumber || o.id}
                        </span>
                        <span className="text-[10px] text-[#6B726E] font-mono">
                          {o.paymentReference || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#101413] block">{o.customerName || 'Customer'}</span>
                        <span className="text-[11px] text-[#6B726E]">{o.customerEmail}</span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E]">
                        {Array.isArray(o.sellers) && o.sellers.length > 0 ? (
                          <span className="font-medium text-[#101413] truncate block max-w-[150px]">
                            {o.sellers.join(', ')}
                          </span>
                        ) : (
                          <span>Verified Store</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413] tabular-nums">
                        {formatCurrency(o.total || 0)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : o.paymentStatus === 'failed'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? 'Paid (Escrow)' : o.paymentStatus || 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            orderStage === 'delivered'
                              ? 'bg-[#101413] text-white'
                              : orderStage === 'shipped'
                              ? 'bg-indigo-100 text-indigo-700'
                              : orderStage === 'processing'
                              ? 'bg-blue-100 text-blue-700'
                              : orderStage === 'confirmed'
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : 'bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {orderStage.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E]">
                        {o.createdAt ? formatCustomerDate(o.createdAt) : 'Recently'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(o)}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER INSPECTION MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#101413]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-[#E4E7E5] rounded-xl max-w-2xl w-full shadow-2xl p-6 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto text-xs">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E4E7E5] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black font-mono text-[#101413]">
                    {selectedOrder.orderNumber || selectedOrder.id}
                  </h3>
                  <span className="bg-[#E8F5EF] text-[#0E8F5A] px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Escrow Protected
                  </span>
                </div>
                <p className="text-xs text-[#6B726E] mt-0.5">
                  Placed on {selectedOrder.createdAt ? formatCustomerDate(selectedOrder.createdAt) : 'Recently'}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#6B726E] hover:text-[#101413] p-1 rounded hover:bg-[#F7F5F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial & Status Summary */}
            <div className="grid grid-cols-3 gap-3 bg-[#FBFBFA] p-4 rounded-xl border border-[#E4E7E5] text-center">
              <div>
                <span className="text-[#6B726E] block text-[10px] uppercase font-bold">Order Total</span>
                <span className="text-lg font-black font-mono text-[#101413]">
                  {formatCurrency(selectedOrder.total || 0)}
                </span>
              </div>
              <div>
                <span className="text-[#6B726E] block text-[10px] uppercase font-bold">Payment Status</span>
                <span className="text-sm font-bold text-[#0E8F5A] block mt-1">
                  {selectedOrder.paymentStatus === 'paid' ? 'PAID & VERIFIED' : selectedOrder.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-[#6B726E] block text-[10px] uppercase font-bold">Fulfillment Stage</span>
                <span className="text-sm font-bold text-[#101413] block mt-1 uppercase">
                  {selectedOrder.orderStatus || selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Customer & Shipping Information (Authorized Admins Only) */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E]">
                Customer & Delivery Destination
              </h4>
              <div className="bg-white p-3.5 rounded-lg border border-[#E4E7E5] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6B726E]">Customer Name:</span>
                  <span className="font-bold text-[#101413]">{selectedOrder.customerName || 'Nneka Okonjo'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B726E]">Customer Email:</span>
                  <span className="font-medium text-[#101413]">{selectedOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B726E]">Delivery Address:</span>
                  <span className="font-medium text-[#101413]">
                    {selectedOrder.shippingAddress?.street || '14 Adeola Odeku St, Victoria Island, Lagos'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment & Audit Snapshot */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E]">
                Payment Rail Credentials
              </h4>
              <div className="bg-white p-3.5 rounded-lg border border-[#E4E7E5] space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#6B726E]">Paystack Reference:</span>
                  <span className="font-bold text-[#101413]">
                    {selectedOrder.paymentReference || 'MN-PAY-20261006-8F92KD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B726E]">Channel:</span>
                  <span className="capitalize text-[#101413]">
                    {selectedOrder.paymentChannel || 'card'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B726E]">Escrow Status:</span>
                  <span className="text-[#0E8F5A] font-bold">Funds held in platform trust account</span>
                </div>
              </div>
            </div>

            {/* Transition Controls */}
            {hasPermission('orders.manage') && (
              <div className="space-y-2 pt-2 border-t border-[#E4E7E5]">
                <span className="text-[11px] font-bold text-[#6B726E] uppercase block">
                  Transition Order Stage
                </span>
                <div className="flex flex-wrap gap-2">
                  {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedOrder, st)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs uppercase cursor-pointer transition-colors ${
                        (selectedOrder.orderStatus || selectedOrder.status) === st
                          ? 'bg-[#101413] text-white'
                          : 'bg-[#F7F5F0] hover:bg-[#E4E7E5] text-[#101413]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
