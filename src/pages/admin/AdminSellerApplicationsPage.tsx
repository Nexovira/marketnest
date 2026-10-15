/**
 * @file src/pages/admin/AdminSellerApplicationsPage.tsx
 * Merchant application queue and onboarding compliance verification portal.
 * Admin can inspect company documentation, approve sellers, or reject with internal audit reasons.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCustomerDate } from '../../services/dateService';
import { Button } from '../../components/ui/Button';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  FileText,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export const AdminSellerApplicationsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission, setActiveSection } = useAdmin();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSellerApplications();
      setApplications(data);
    } catch (err) {
      console.warn('Error loading seller applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleReview = (app: any, action: 'approve' | 'reject' | 'request_review') => {
    const isReject = action === 'reject';
    const isApprove = action === 'approve';

    requestConfirm({
      title: isApprove
        ? `Approve Merchant Application: ${app.storeName}`
        : isReject
        ? `Reject Merchant Application: ${app.storeName}`
        : `Request Review: ${app.storeName}`,
      description: isApprove
        ? `Approving this application will provision and activate "${app.storeName}" as a verified marketplace seller. An audit log and notification will be created.`
        : `Provide the internal rejection reason. This reason will be logged for compliance and internal records.`,
      confirmText: isApprove ? 'Approve & Activate Seller' : isReject ? 'Reject Application' : 'Request Info',
      danger: isReject,
      requireReason: isReject,
      onConfirm: async (reason) => {
        await adminService.reviewSellerApplication(app.id, action, reason, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadApplications();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setActiveSection('sellers')}
              className="text-xs font-bold text-[#0E8F5A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Verified Sellers</span>
            </button>
          </div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">
            Pending Merchant Applications
          </h2>
          <p className="text-xs text-[#6B726E]">
            Verify business registration numbers, artisanal workshops, and merchant credentials.
          </p>
        </div>

        <span className="text-xs font-bold bg-[#E8F5EF] text-[#0E8F5A] px-3 py-1.5 rounded-lg border border-[#A7E2C9] self-start sm:self-auto">
          {applications.filter((a) => a.status === 'pending').length} Awaiting Verification
        </span>
      </div>

      {/* Applications Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-[#6B726E]">
          <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center text-xs text-[#6B726E] space-y-2">
          <UserCheck className="w-8 h-8 text-[#0E8F5A] mx-auto" />
          <p className="font-bold text-sm text-[#101413]">Queue Clean: No Pending Applications</p>
          <p>All merchant applications have been reviewed and verified.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {applications.map((app) => {
            const isPending = app.status === 'pending';

            return (
              <div
                key={app.id}
                className="bg-white border border-[#E4E7E5] rounded-xl p-5 space-y-4 shadow-2xs hover:border-[#101413] transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#101413]">{app.storeName}</h3>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'approved'
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B726E] mt-0.5 font-medium">
                        Representative: <strong className="text-[#101413]">{app.sellerName}</strong>
                      </p>
                    </div>

                    <span className="text-[10px] text-[#6B726E] font-mono">
                      {app.submittedAt ? formatCustomerDate(app.submittedAt) : 'Recently'}
                    </span>
                  </div>

                  {/* Business Meta Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#FBFBFA] p-3 rounded-lg border border-[#E4E7E5]">
                    <div>
                      <span className="text-[#6B726E] block text-[10px]">Business Type:</span>
                      <span className="font-semibold text-[#101413]">{app.businessType}</span>
                    </div>
                    <div>
                      <span className="text-[#6B726E] block text-[10px]">Department:</span>
                      <span className="font-semibold text-[#101413]">{app.category}</span>
                    </div>
                    <div>
                      <span className="text-[#6B726E] block text-[10px]">CAC / RC Number:</span>
                      <span className="font-mono font-bold text-[#101413]">{app.rcNumber || 'BN-Pending'}</span>
                    </div>
                    <div>
                      <span className="text-[#6B726E] block text-[10px]">Tax ID (TIN):</span>
                      <span className="font-mono font-bold text-[#101413]">{app.taxId || 'TIN-Pending'}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B726E]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{app.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{app.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{app.city}, {app.state}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-xs text-[#101413] bg-[#FFFFFF] p-3 rounded-lg border border-[#E4E7E5] leading-relaxed">
                    <p className="text-[10px] font-bold text-[#6B726E] uppercase mb-1">Store Mission & Craft:</p>
                    <p>{app.description}</p>
                  </div>
                </div>

                {/* Actions */}
                {isPending && hasPermission('sellers.approve') && (
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7E5]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReview(app, 'reject')}
                    >
                      Reject Application
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReview(app, 'approve')}
                    >
                      Approve & Activate Seller
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
