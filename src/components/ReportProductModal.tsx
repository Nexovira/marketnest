/**
 * @file src/components/ReportProductModal.tsx
 * Marketplace Quality & Prohibited Listing Reporting Dialog for MarketNest.
 * Allows buyers to flag suspicious, counterfeit, or misleading products to trust & safety.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { MarketplaceReportReason } from '../types';
import { Button } from './ui/Button';
import { ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ReportProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
}

export const ReportProductModal: React.FC<ReportProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle
}) => {
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useMarket();

  const [reason, setReason] = useState<MarketplaceReportReason>('counterfeit');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Details Required', 'Please provide a brief explanation of the concern.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: firebaseUser?.uid || profile?.id || 'anonymous',
          reporterEmail: firebaseUser?.email || profile?.email || undefined,
          targetType: 'product',
          targetId: productId,
          targetTitle: productTitle,
          reason,
          description: description.trim()
        })
      });

      if (res.ok) {
        showToast('Report Filed', 'Thank you. Our Trust & Safety team will review this listing within 24 hours.', 'success');
        onClose();
        setDescription('');
      } else {
        throw new Error('Failed to submit report');
      }
    } catch {
      showToast('Error', 'Could not submit report. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E5]">
          <div className="flex items-center gap-2.5 text-rose-600">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-base text-[#101413]">Report This Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#FBFBFA] border border-[#E4E7E5] rounded-xl p-3.5 text-xs space-y-1">
          <span className="text-[#6B726E] block">Flagging Item:</span>
          <span className="font-bold text-[#101413] block truncate">{productTitle}</span>
          <span className="text-[11px] text-[#A0A5A3] font-mono block">ID: {productId}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#101413] mb-1.5">
              Reason for Concern
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as MarketplaceReportReason)}
              className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413] focus:outline-hidden focus:border-[#101413]"
            >
              <option value="counterfeit">Suspected Counterfeit or Imitation</option>
              <option value="prohibited_item">Prohibited / Hazardous or Illegal Item</option>
              <option value="misleading">Misleading Pricing, Specs, or Stock Claim</option>
              <option value="inappropriate_content">Offensive Images or Explicit Language</option>
              <option value="seller_fraud">Suspected Fraudulent Merchant Activity</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101413] mb-1.5">
              Detailed Explanation
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this listing violates MarketNest quality guidelines..."
              className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413] focus:outline-hidden focus:border-[#101413]"
              required
            />
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 leading-relaxed">
            MarketNest enforces a zero-tolerance policy against counterfeit merchandise. Verified reports result in immediate listing de-indexing and seller escrow freezes.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
