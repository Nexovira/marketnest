/**
 * @file src/pages/admin/AdminCustomersPage.tsx
 * Customer management portal for MarketNest Administrators.
 * Displays data tables, customer spending profiles, and non-destructive suspension controls.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  CreditCard,
  MapPin,
  Heart,
  Clock,
  ArrowRight,
  X,
  ExternalLink
} from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Customer Profile Inspection Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCustomers(search, statusFilter);
      setCustomers(data);
    } catch (err) {
      console.warn('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleToggleStatus = (customer: any) => {
    const nextStatus = customer.status === 'suspended' ? 'active' : 'suspended';
    const isSuspension = nextStatus === 'suspended';

    requestConfirm({
      title: isSuspension ? 'Suspend Customer Account' : 'Reactivate Customer Account',
      description: isSuspension
        ? `Are you sure you want to suspend ${customer.name}? The customer will be unable to log in or initiate new orders. Historical transactions will remain preserved.`
        : `Reactivate account for ${customer.name}? The customer will regain full purchasing access.`,
      confirmText: isSuspension ? 'Suspend Account' : 'Reactivate Account',
      danger: isSuspension,
      requireReason: isSuspension,
      onConfirm: async (reason) => {
        await adminService.updateCustomerStatus(customer.id, nextStatus, reason, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadCustomers();
        if (selectedCustomer && selectedCustomer.id === customer.id) {
          setSelectedCustomer({ ...selectedCustomer, status: nextStatus });
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">Customer Directory</h2>
          <p className="text-xs text-[#6B726E]">
            Inspect customer activity, lifetime spend, order histories, and account statuses.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-white focus:outline-hidden focus:border-[#101413] w-56 sm:w-64"
            />
          </div>

          <div className="inline-flex rounded-lg border border-[#E4E7E5] bg-white p-0.5 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'suspended', label: 'Suspended' },
              { id: 'high_value', label: 'High Value (₦1M+)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === f.id ? 'bg-[#101413] text-white font-bold' : 'text-[#6B726E]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Email & Contact</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4">Total Spend</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B726E]">
                    No customer accounts match your search filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isSuspended = c.status === 'suspended';
                  return (
                    <tr key={c.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#101413] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-[#101413] block">{c.name}</span>
                            <span className="text-[10px] text-[#6B726E] font-mono">{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[#101413] font-medium">{c.email}</div>
                        <div className="text-[11px] text-[#6B726E]">{c.phone || 'No phone recorded'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold">
                        {c.ordersCount || 0}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-[#101413]">
                        {formatCurrency(c.totalSpend || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-[#E8F5EF] text-[#0E8F5A]'
                          }`}
                        >
                          {isSuspended ? (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Suspended</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B726E]">
                        {c.createdAt ? formatCustomerDate(c.createdAt) : '2026'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(c)}
                          >
                            Profile
                          </Button>
                          {hasPermission('customers.manage') && (
                            <Button
                              variant={isSuspended ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => handleToggleStatus(c)}
                            >
                              {isSuspended ? 'Reactivate' : 'Suspend'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER PROFILE INSPECTION DRAWER */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-[#101413]/60 backdrop-blur-xs flex justify-end animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#101413] text-white flex items-center justify-center font-bold text-sm">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101413]">{selectedCustomer.name}</h3>
                  <span className="text-[11px] text-[#6B726E] font-mono">{selectedCustomer.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[#6B726E] hover:text-[#101413] p-1.5 rounded hover:bg-[#F7F5F0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Account Status Badge & Financial Overview */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FBFBFA] rounded-xl border border-[#E4E7E5]">
                <div>
                  <span className="text-[#6B726E] block text-[11px]">Total Purchases</span>
                  <span className="text-lg font-black font-mono tabular-nums text-[#101413]">
                    {formatCurrency(selectedCustomer.totalSpend || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B726E] block text-[11px]">Completed Orders</span>
                  <span className="text-lg font-black font-mono tabular-nums text-[#101413]">
                    {selectedCustomer.ordersCount || 0}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E]">
                  Contact & Identity
                </h4>
                <div className="bg-white p-3.5 rounded-lg border border-[#E4E7E5] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6B726E]">Email:</span>
                    <span className="font-semibold text-[#101413]">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B726E]">Phone:</span>
                    <span className="font-semibold text-[#101413]">{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B726E]">Status:</span>
                    <span
                      className={`font-bold ${
                        selectedCustomer.status === 'suspended' ? 'text-rose-600' : 'text-[#0E8F5A]'
                      }`}
                    >
                      {selectedCustomer.status === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B726E]">Registered:</span>
                    <span className="font-medium text-[#101413]">
                      {selectedCustomer.createdAt ? formatCustomerDate(selectedCustomer.createdAt) : 'Nov 2025'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order History Summary */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E]">
                  Recent Orders
                </h4>
                <div className="border border-[#E4E7E5] rounded-lg divide-y divide-[#E4E7E5]">
                  <div className="p-3 flex items-center justify-between hover:bg-[#FBFBFA]">
                    <div>
                      <p className="font-mono font-bold text-[#101413]">MN-ORD-20261006-8F92KD</p>
                      <p className="text-[11px] text-[#6B726E]">3 items · Paid via Card</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#101413]">₦125,000</span>
                      <span className="block text-[10px] text-[#0E8F5A] font-bold">Confirmed</span>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between hover:bg-[#FBFBFA]">
                    <div>
                      <p className="font-mono font-bold text-[#101413]">MN-ORD-20260914-4J22PB</p>
                      <p className="text-[11px] text-[#6B726E]">1 item · Delivered</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#101413]">₦48,000</span>
                      <span className="block text-[10px] text-[#101413] font-bold">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses & Saved Items Summary */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E]">
                  Delivery Address on File
                </h4>
                <div className="bg-[#FBFBFA] p-3 rounded-lg border border-[#E4E7E5] text-[11px] text-[#101413] space-y-1">
                  <p className="font-bold">Primary Lagos Residence</p>
                  <p className="text-[#6B726E]">14 Adeola Odeku Street, Victoria Island, Lagos State</p>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E4E7E5] bg-[#FBFBFA] flex items-center justify-between">
              <span className="text-[11px] text-[#6B726E]">Actionable Operations</span>
              {hasPermission('customers.manage') && (
                <Button
                  variant={selectedCustomer.status === 'suspended' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={() => handleToggleStatus(selectedCustomer)}
                >
                  {selectedCustomer.status === 'suspended' ? 'Reactivate Customer' : 'Suspend Customer'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
