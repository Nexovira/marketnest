/**
 * @file src/pages/admin/AdminReturnsPage.tsx
 * Returns & RMA Management Portal for MarketNest Administrators.
 * Displays return requests across merchants, inspection verification status,
 * and authorizes escrow return disbursements.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ReturnRequest, ReturnStatus } from '../../types';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ShieldAlert,
  Search,
  Filter,
  Package,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const AdminReturnsPage: React.FC = () => {
  const { requestConfirm, adminProfile } = useAdmin();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/returns');
      if (res.ok) {
        const json = await res.json();
        setReturns(json.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleUpdateStatus = (ret: ReturnRequest, nextStatus: ReturnStatus) => {
    requestConfirm({
      title: `Update Return Request Status: ${nextStatus.toUpperCase()}`,
      description: `Authorize return #${ret.id} status update to ${nextStatus}. This communicates directly with customer and merchant ledgers.`,
      danger: nextStatus === 'rejected',
      requireReason: true,
      onConfirm: async (reason?: string) => {
        const res = await fetch(`/api/returns/${ret.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStatus,
            adminNote: reason,
            moderatedBy: adminProfile.name
          })
        });
        if (!res.ok) {
          throw new Error('Failed to update return request status.');
        }
        await loadReturns();
      }
    });
  };

  const filtered = returns.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchOrder = r.orderId?.toLowerCase().includes(q);
      const matchCustomer = r.customerId?.toLowerCase().includes(q);
      const matchReason = r.reason?.toLowerCase().includes(q);
      if (!matchOrder && !matchCustomer && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#101413]">Returns & Escrow RMA Authorization</h2>
          <p className="text-xs text-[#6B726E]">
            Process customer return requests, review merchant inspection reports, and authorize escrow refunds.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadReturns}>
          Refresh Queue
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-[#E4E7E5] rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer ID, or reason..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E4E7E5] rounded-lg focus:outline-none focus:border-[#0E8F5A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#6B726E]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-[#E4E7E5] rounded-lg px-2.5 py-2 bg-white text-[#101413] focus:outline-none"
          >
            <option value="all">All Return Statuses</option>
            <option value="requested">Requested</option>
            <option value="reviewing">Reviewing</option>
            <option value="approved">Approved</option>
            <option value="return_in_progress">Return In Progress</option>
            <option value="received">Received</option>
            <option value="refunded">Refunded</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Returns List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6B726E]">Loading returns queue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E4E7E5] rounded-xl space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#0E8F5A] mx-auto" />
          <h3 className="text-sm font-bold text-[#101413]">No active return requests</h3>
          <p className="text-xs text-[#6B726E]">There are no return requests matching your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ret) => (
            <div
              key={ret.id}
              className="p-5 bg-white border border-[#E4E7E5] rounded-xl hover:border-[#CBD5E1] transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#101413]">RMA #{ret.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ret.status === 'refunded'
                          ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                          : ret.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : ret.status === 'approved'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ret.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B726E]">
                    Order: <strong className="text-[#101413]">{ret.orderId}</strong> • Amount:{' '}
                    <strong className="text-[#101413]">{formatCurrency(ret.price)}</strong> •
                    Seller: <strong className="text-[#101413]">{ret.sellerId}</strong>
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {ret.status === 'requested' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(ret, 'approved')}
                      className="text-xs"
                    >
                      Authorize Return
                    </Button>
                  )}

                  {ret.status === 'return_in_progress' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(ret, 'received')}
                      className="text-xs"
                    >
                      Mark Received
                    </Button>
                  )}

                  {(ret.status === 'received' || ret.status === 'approved') && (
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => handleUpdateStatus(ret, 'refunded')}
                      className="text-xs bg-[#0E8F5A] hover:bg-[#0B7549]"
                    >
                      Disburse Refund
                    </Button>
                  )}

                  {ret.status !== 'rejected' && ret.status !== 'refunded' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(ret, 'rejected')}
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Reject RMA
                    </Button>
                  )}
                </div>
              </div>

              {/* Reason & Comments */}
              <div className="p-3 bg-[#F7F5F0] rounded-lg text-xs space-y-1">
                <p className="font-semibold text-[#101413]">
                  Customer Reason: <span className="font-normal capitalize">{ret.reason.replace(/_/g, ' ')}</span>
                </p>
                {ret.description && (
                  <p className="text-[#6B726E] italic">"{ret.description}"</p>
                )}
                {ret.adminNote && (
                  <p className="text-xs text-blue-700 pt-1">
                    <strong>Admin Note:</strong> {ret.adminNote}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
