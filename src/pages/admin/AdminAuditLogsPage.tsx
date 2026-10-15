/**
 * @file src/pages/admin/AdminAuditLogsPage.tsx
 * Append-only compliance and financial audit trail portal for MarketNest Administrators.
 * Inspects all privileged system mutations, actor roles, entity snapshots, and security events.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  History,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Terminal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs(
        actionFilter !== 'all' ? actionFilter : undefined
      );
      setLogs(data);
    } catch (err) {
      console.warn('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">
            Append-Only Audit Trail
          </h2>
          <p className="text-xs text-[#6B726E]">
            Immutable chronological record of administrative actions, compliance decisions, and financial operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-[#E4E7E5] bg-white text-[#101413] font-medium cursor-pointer"
          >
            <option value="all">All Audit Actions</option>
            <option value="SELLER_APPROVED">SELLER_APPROVED</option>
            <option value="SELLER_SUSPENDED">SELLER_SUSPENDED</option>
            <option value="PRODUCT_MODERATED">PRODUCT_MODERATED</option>
            <option value="ORDER_STATUS_CHANGED">ORDER_STATUS_CHANGED</option>
            <option value="REFUND_APPROVED">REFUND_APPROVED</option>
            <option value="PAYMENT_RECONCILED">PAYMENT_RECONCILED</option>
            <option value="AFFILIATE_APPROVED">AFFILIATE_APPROVED</option>
            <option value="COMMISSION_REVERSED">COMMISSION_REVERSED</option>
            <option value="ADMIN_SETTINGS_UPDATED">ADMIN_SETTINGS_UPDATED</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Key</th>
                <th className="py-3 px-4">Actor / Role</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B726E]">
                    No audit records matching filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-[#FBFBFA] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#6B726E]">
                          {log.timestamp ? formatCustomerDate(log.timestamp) : 'Recently'}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">
                          <span className="bg-[#F7F5F0] border border-[#E4E7E5] px-2 py-0.5 rounded text-[11px]">
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#101413] block">
                            {log.actorName || log.actorId}
                          </span>
                          <span className="text-[10px] text-[#6B726E] capitalize">
                            {log.actorRole?.replace('_', ' ') || 'admin'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#6B726E] uppercase font-bold text-[10px]">
                          {log.entityType}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#101413]">
                          {log.entityId}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="text-xs font-bold text-[#0E8F5A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Payload</span>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable JSON Payload Drawer */}
                      {isExpanded && (
                        <tr className="bg-[#141A18] text-[#A7E2C9] font-mono text-[11px]">
                          <td colSpan={6} className="p-4">
                            <div className="space-y-1">
                              <span className="text-white text-[10px] uppercase font-bold tracking-wider">
                                Audit Metadata Payload:
                              </span>
                              <pre className="overflow-x-auto p-2 bg-[#101413] rounded border border-[#2D3834] text-xs">
                                {JSON.stringify(log.metadata || {}, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
