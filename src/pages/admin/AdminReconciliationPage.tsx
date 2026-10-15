/**
 * @file src/pages/admin/AdminReconciliationPage.tsx
 * Financial Reconciliation Center for MarketNest Finance Admins.
 * Implements:
 * - Multi-way cross-record discrepancy detection (Paystack vs Orders vs Refunds vs Seller Escrow vs Affiliates)
 * - Discrepancy category classification & severity filters
 * - Authorized resolution workflow (no automatic silent overwrites) with mandatory reason notes
 * - Detailed audit history logging for financial accountability
 * - Sanitized CSV reconciliation export
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  ReconciliationDiscrepancy,
  DiscrepancyStatus,
  DiscrepancyCategory
} from '../../types';
import { financialReportingService } from '../../services/financialReportingService';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Download,
  RotateCcw,
  UserCheck,
  CreditCard,
  FileText,
  DollarSign,
  ArrowRight,
  ChevronDown,
  Info
} from 'lucide-react';

export const AdminReconciliationPage: React.FC = () => {
  const { adminProfile, hasPermission } = useAdmin();

  const [discrepancies, setDiscrepancies] = useState<ReconciliationDiscrepancy[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected discrepancy for inspection/resolution
  const [selectedItem, setSelectedItem] = useState<ReconciliationDiscrepancy | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<DiscrepancyStatus>('investigating');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionAction, setResolutionAction] = useState('MANUAL_LEDGER_ADJUSTMENT');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadDiscrepancies = async () => {
    setLoading(true);
    try {
      const items = await financialReportingService.getReconciliationDiscrepancies({
        status: statusFilter,
        category: categoryFilter
      });
      setDiscrepancies(items);
      if (items.length > 0 && !selectedItem) {
        setSelectedItem(items[0]);
      }
    } catch (err) {
      console.warn('Error loading discrepancies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscrepancies();
  }, [statusFilter, categoryFilter]);

  // Handle status update
  const handleApplyResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!resolutionNotes.trim()) {
      showToast('Resolution notes and reason are mandatory for financial audit compliance.', 'error');
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await financialReportingService.updateDiscrepancyStatus({
        id: selectedItem.id,
        status: resolutionStatus,
        reviewer: adminProfile?.email || 'finance_admin@marketnest.ng',
        resolutionNotes: resolutionNotes.trim(),
        action: resolutionAction
      });

      showToast(`Discrepancy ${selectedItem.id} updated to ${resolutionStatus.toUpperCase()}.`);
      setSelectedItem(res.discrepancy);
      setResolutionNotes('');
      loadDiscrepancies();
    } catch (err: any) {
      showToast(err.message || 'Failed to update discrepancy.', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // CSV export
  const handleExportCsv = () => {
    if (discrepancies.length === 0) {
      showToast('No discrepancies to export.', 'info');
      return;
    }

    const rows = discrepancies.map((d) => ({
      ID: d.id,
      Category: d.categoryLabel,
      Severity: d.severity,
      Status: d.status,
      Currency: d.currency,
      Discrepancy_Amount: d.discrepancyAmountMinorUnits ? d.discrepancyAmountMinorUnits / 100 : 0,
      Expected_Value: d.expectedValue,
      Observed_Value: d.observedValue,
      Affected_Order: d.affectedRecordIds.orderNumber || d.affectedRecordIds.orderId || 'N/A',
      Payment_Reference: d.affectedRecordIds.paymentReference || 'N/A',
      Customer_Email: d.affectedRecordIds.customerEmail || 'N/A',
      Assigned_Reviewer: d.assignedReviewer || 'Unassigned',
      Detection_Time: d.detectionTime
    }));

    financialReportingService.exportToSanitizedCsv('marketnest_reconciliation_discrepancies', rows, {
      title: 'Financial Reconciliation Discrepancy Ledger'
    });
    showToast('Exported reconciliation ledger CSV to your device.');
  };

  const filteredItems = discrepancies.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.id.toLowerCase().includes(q) ||
      d.categoryLabel.toLowerCase().includes(q) ||
      d.expectedValue.toLowerCase().includes(q) ||
      d.observedValue.toLowerCase().includes(q) ||
      d.affectedRecordIds.orderNumber?.toLowerCase().includes(q) ||
      d.affectedRecordIds.paymentReference?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold underline text-[11px] cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#101413] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E8F5A]/20 text-[#A7E2C9] text-xs font-semibold border border-[#0E8F5A]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Financial Integrity & Ledger Cross-Check</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Financial Reconciliation Center
          </h1>
          <p className="text-sm text-[#A0A5A3] leading-relaxed">
            Multi-way cross-record comparison across Paystack gateway settlements, customer orders, escrow balances, and affiliate commissions.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-4 text-xs">
            <span>
              Total Logged: <strong>{discrepancies.length}</strong>
            </span>
            <span>·</span>
            <span>
              Unreviewed: <strong className="text-amber-400">{discrepancies.filter((d) => d.status === 'unreviewed').length}</strong>
            </span>
            <span>·</span>
            <span>
              Investigating: <strong className="text-blue-400">{discrepancies.filter((d) => d.status === 'investigating').length}</strong>
            </span>
            <span>·</span>
            <span>
              Resolved: <strong className="text-emerald-400">{discrepancies.filter((d) => d.status === 'resolved').length}</strong>
            </span>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E8F5A] text-white text-xs font-bold hover:bg-[#0c7c4e] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Discrepancies CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 relative w-full md:w-auto">
          <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, payment reference, or category..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#E4E7E5] focus:outline-none focus:border-[#0E8F5A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#6B726E]">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-[#E4E7E5] bg-white font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-[#E4E7E5] bg-white font-medium cursor-pointer max-w-[220px]"
          >
            <option value="all">All Discrepancy Categories</option>
            <option value="gateway_verified_not_in_order">Gateway Verified / Delayed Order</option>
            <option value="affiliate_commission_unreversed">Unreversed Affiliate Commission</option>
            <option value="missing_seller_earnings">Missing Seller Escrow Record</option>
            <option value="duplicate_payment_reference">Duplicate Payment Reference</option>
            <option value="amount_or_currency_mismatch">Amount / Currency Mismatch</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Split: Discrepancy List + Investigation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Discrepancy Items List (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden divide-y divide-[#E4E7E5]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B726E]">
              No reconciliation discrepancies match the selected filters.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 sm:p-5 transition-colors cursor-pointer space-y-2.5 ${
                    isSelected ? 'bg-[#E8F5EF]/40 border-l-4 border-l-[#0E8F5A]' : 'hover:bg-[#FBFBFA]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#6B726E] font-bold">{item.id}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            item.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : item.severity === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'escalated'
                              ? 'bg-rose-100 text-rose-800'
                              : item.status === 'investigating'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#101413]">{item.categoryLabel}</h4>
                    </div>

                    {item.discrepancyAmountMinorUnits ? (
                      <span className="font-mono font-bold text-xs text-rose-700 whitespace-nowrap">
                        {formatCurrency(item.discrepancyAmountMinorUnits / 100, item.currency)}
                      </span>
                    ) : null}
                  </div>

                  <div className="text-[11px] text-[#6B726E] space-y-1 bg-[#FBFBFA] p-2.5 rounded-lg border border-[#E4E7E5]">
                    <p><strong className="text-[#101413]">Expected:</strong> {item.expectedValue}</p>
                    <p><strong className="text-rose-800">Observed:</strong> {item.observedValue}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#6B726E]">
                    <span>Detected: {new Date(item.detectionTime).toLocaleString()}</span>
                    <span>Reviewer: {item.assignedReviewer || 'Unassigned'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Investigation & Action Workspace (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-6 sticky top-24">
          {selectedItem ? (
            <div className="space-y-6">
              <div className="border-b border-[#E4E7E5] pb-4">
                <span className="text-[10px] font-mono text-[#6B726E] uppercase font-bold block">
                  Reconciliation Case #{selectedItem.id}
                </span>
                <h3 className="font-extrabold text-sm text-[#101413] mt-0.5">{selectedItem.categoryLabel}</h3>
              </div>

              {/* Affected Entities */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-[#101413] block text-[11px] uppercase tracking-wider">
                  Associated Record References
                </span>
                <div className="bg-[#FBFBFA] border border-[#E4E7E5] rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
                  {selectedItem.affectedRecordIds.orderNumber && (
                    <div className="flex justify-between">
                      <span className="text-[#6B726E]">Order:</span>
                      <span className="font-bold text-[#101413]">{selectedItem.affectedRecordIds.orderNumber}</span>
                    </div>
                  )}
                  {selectedItem.affectedRecordIds.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-[#6B726E]">Paystack Ref:</span>
                      <span className="font-bold text-[#0E8F5A]">{selectedItem.affectedRecordIds.paymentReference}</span>
                    </div>
                  )}
                  {selectedItem.affectedRecordIds.customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-[#6B726E]">Customer:</span>
                      <span className="text-neutral-800">{selectedItem.affectedRecordIds.customerEmail}</span>
                    </div>
                  )}
                  {selectedItem.affectedRecordIds.sellerId && (
                    <div className="flex justify-between">
                      <span className="text-[#6B726E]">Seller ID:</span>
                      <span className="text-neutral-800">{selectedItem.affectedRecordIds.sellerId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit History Trail */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-[#101413] block text-[11px] uppercase tracking-wider">
                  Immutable Audit History Trail
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedItem.auditHistory.map((h, i) => (
                    <div key={i} className="text-[11px] border-l-2 border-[#0E8F5A] pl-2.5 space-y-0.5">
                      <div className="flex items-center justify-between text-[#6B726E]">
                        <span className="font-bold text-[#101413]">{h.action}</span>
                        <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[#6B726E] text-[10px]">Actor: {h.actor}</p>
                      {h.notes && <p className="text-neutral-700 italic">{h.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Authorized Resolution Action Form */}
              <form onSubmit={handleApplyResolution} className="border-t border-[#E4E7E5] pt-4 space-y-4">
                <span className="font-bold text-[#101413] block text-[11px] uppercase tracking-wider">
                  Authorized Resolution Workflow
                </span>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#101413] block">Set Investigation Status</label>
                  <select
                    value={resolutionStatus}
                    onChange={(e) => setResolutionStatus(e.target.value as DiscrepancyStatus)}
                    className="w-full text-xs p-2 rounded-lg border border-[#E4E7E5] bg-white font-medium cursor-pointer"
                  >
                    <option value="investigating">Investigating (Under Review)</option>
                    <option value="resolved">Resolved (Approved & Reconciled)</option>
                    <option value="escalated">Escalated (Requires Super Admin)</option>
                    <option value="unreviewed">Unreviewed (Reset)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#101413] block">Resolution Action Type</label>
                  <select
                    value={resolutionAction}
                    onChange={(e) => setResolutionAction(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#E4E7E5] bg-white font-medium cursor-pointer"
                  >
                    <option value="MANUAL_LEDGER_ADJUSTMENT">Manual Ledger Adjustment</option>
                    <option value="RETRY_PAYSTACK_WEBHOOK">Re-Execute Paystack Webhook</option>
                    <option value="REVERSE_AFFILIATE_CREDIT">Debit Unreversed Affiliate Balance</option>
                    <option value="ESCALATE_TO_BANK_GATEWAY">Escalate to Paystack Support</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#101413] block">
                    Mandatory Resolution Reason & Notes <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Provide detailed justification and ledger audit notes..."
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-none focus:border-[#0E8F5A]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={isSubmittingAction}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  {isSubmittingAction ? 'Applying Resolution...' : 'Apply Authorized Resolution'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#6B726E]">
              Select a discrepancy from the list to inspect records and apply resolution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
