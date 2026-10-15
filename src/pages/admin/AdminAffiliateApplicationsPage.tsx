/**
 * @file src/pages/admin/AdminAffiliateApplicationsPage.tsx
 * Creator and partner application verification portal for MarketNest Administrators.
 * Review audience metrics, assign unique partner codes, and activate accounts.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Layers,
  ArrowLeft,
  Mail,
  UserCheck
} from 'lucide-react';

export const AdminAffiliateApplicationsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission, setActiveSection } = useAdmin();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAffiliateApplications();
      setApplications(data);
    } catch (err) {
      console.warn('Error loading affiliate applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleReview = (app: any, action: 'approve' | 'reject') => {
    const isApprove = action === 'approve';
    const suggestedCode = `MN${app.fullName.replace(/[^A-Za-z]/g, '').slice(0, 5).toUpperCase()}`;

    requestConfirm({
      title: isApprove
        ? `Approve Affiliate: ${app.displayName}`
        : `Reject Affiliate Application: ${app.displayName}`,
      description: isApprove
        ? `This will activate ${app.displayName} as a verified affiliate with unique referral code ${suggestedCode} and standard 5.0% commission rate.`
        : `Provide the internal audit reason for declining this creator application.`,
      confirmText: isApprove ? 'Approve & Assign Code' : 'Reject Application',
      danger: !isApprove,
      requireReason: !isApprove,
      onConfirm: async (reason) => {
        await adminService.reviewAffiliateApplication(
          app.id,
          action,
          { customCode: suggestedCode, commissionRate: 0.05, reason },
          { id: adminProfile.id, name: adminProfile.name }
        );
        loadApplications();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setActiveSection('affiliates')}
            className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Active Affiliates</span>
          </button>
          <h2 className="text-base font-black text-[#101413] tracking-tight">
            Pending Affiliate Applications
          </h2>
          <p className="text-xs text-[#6B726E]">
            Verify creator channel authenticity, audience reach, and assign unique tracking codes.
          </p>
        </div>

        <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 self-start sm:self-auto">
          {applications.filter((a) => a.status === 'pending').length} Awaiting Verification
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-[#6B726E]">
          <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center text-xs text-[#6B726E] space-y-2">
          <UserCheck className="w-8 h-8 text-purple-600 mx-auto" />
          <p className="font-bold text-sm text-[#101413]">No Pending Applications</p>
          <p>All affiliate applicants have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {applications.map((app) => {
            const isPending = app.status === 'pending';

            return (
              <div
                key={app.id}
                className="bg-white border border-[#E4E7E5] rounded-xl p-5 space-y-4 shadow-2xs hover:border-purple-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#101413]">{app.displayName}</h3>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-purple-100 text-purple-800'
                              : app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B726E] mt-0.5 font-medium">
                        Applicant: <strong className="text-[#101413]">{app.fullName}</strong>
                      </p>
                    </div>

                    <span className="text-[10px] text-[#6B726E] font-mono">
                      {app.submittedAt ? formatCustomerDate(app.submittedAt) : 'Recently'}
                    </span>
                  </div>

                  {/* Channel & Audience Meta */}
                  <div className="bg-[#FBFBFA] p-3 rounded-lg border border-[#E4E7E5] space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B726E]">Channel:</span>
                      <a
                        href={app.channelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-purple-700 hover:underline flex items-center gap-1"
                      >
                        <span>{app.channel}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div>
                      <span className="text-[#6B726E] block text-[10px]">Audience Profile:</span>
                      <p className="text-[#101413] mt-0.5">{app.audience}</p>
                    </div>
                    {app.preferredCategories && app.preferredCategories.length > 0 && (
                      <div>
                        <span className="text-[#6B726E] block text-[10px]">Preferred Niches:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {app.preferredCategories.map((c: string) => (
                            <span
                              key={c}
                              className="text-[10px] bg-white border border-[#E4E7E5] px-1.5 py-0.5 rounded text-[#101413]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Motivation / Reason */}
                  {app.reason && (
                    <div className="text-xs text-[#101413] bg-white p-3 rounded-lg border border-[#E4E7E5] leading-relaxed">
                      <span className="text-[10px] font-bold text-[#6B726E] uppercase block mb-1">
                        Application Statement:
                      </span>
                      <p>{app.reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isPending && hasPermission('affiliates.approve') && (
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7E5]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReview(app, 'reject')}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReview(app, 'approve')}
                    >
                      Approve & Issue Code
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
