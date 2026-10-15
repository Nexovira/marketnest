/**
 * @file src/pages/admin/components/AdminConfirmModal.tsx
 * High-risk operational confirmation modal for MarketNest Administrators.
 * Enforces explicit administrative reasoning and prevents accidental destructive updates.
 */

import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const AdminConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirm } = useAdmin();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!confirmModal) return null;

  const handleConfirm = async () => {
    if (confirmModal.requireReason && !reason.trim()) {
      setError('Please provide an administrative reason to proceed.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await confirmModal.onConfirm(reason.trim());
      closeConfirm();
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#101413]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-[#E4E7E5] rounded-xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
        {/* Header Icon + Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                confirmModal.danger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              {confirmModal.danger ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101413]">{confirmModal.title}</h3>
              <p className="text-xs text-[#6B726E] mt-0.5">High-Risk Operation Confirmation</p>
            </div>
          </div>

          <button
            onClick={closeConfirm}
            disabled={loading}
            className="text-[#6B726E] hover:text-[#101413] p-1 rounded hover:bg-[#F7F5F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-[#101413] leading-relaxed bg-[#FBFBFA] p-3 rounded-lg border border-[#E4E7E5]">
          {confirmModal.description}
        </p>

        {/* Reason Input (if required) */}
        {confirmModal.requireReason && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#101413] flex items-center justify-between">
              <span>Administrative Reason</span>
              <span className="text-[10px] text-rose-600 font-normal">Required for audit log</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Provide exact justification or internal compliance note..."
              className="w-full text-xs p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden focus:border-[#101413] focus:ring-1 focus:ring-[#101413] transition-all"
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded border border-rose-200">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={closeConfirm}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={confirmModal.danger ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmModal.confirmText || 'Confirm & Proceed'}
          </Button>
        </div>
      </div>
    </div>
  );
};
