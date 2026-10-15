/**
 * @file src/components/PolicyModal.tsx
 * Trust, Policies & Legal Framework Modal for MarketNest.
 * Displays authoritative policies: Terms of Service, Privacy Policy, Escrow & Returns,
 * Delivery Guidelines, Merchant Agreement, and Review Conduct.
 */

import React from 'react';
import { X, ShieldCheck, FileText, Lock, Truck, Store, Sparkles, Scale } from 'lucide-react';

export type PolicyType =
  | 'terms'
  | 'privacy'
  | 'returns'
  | 'delivery'
  | 'seller_agreement'
  | 'affiliate_terms'
  | 'review_guidelines';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: PolicyType;
}

const POLICY_CONTENT: Record<
  PolicyType,
  { title: string; subtitle: string; icon: React.ElementType; content: React.ReactNode }
> = {
  terms: {
    title: 'Terms of Service',
    subtitle: 'MarketNest Marketplace Master Platform Terms (Nigeria)',
    icon: Scale,
    content: (
      <div className="space-y-4 text-xs text-[#101413] leading-relaxed">
        <p className="font-semibold text-neutral-500">
          Last updated: October 2026 • Governed by the Laws of the Federal Republic of Nigeria
        </p>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">1. Nature of the Marketplace</h4>
          <p>
            MarketNest is a premier multi-vendor commerce platform that connects buyers with independent, verified Nigerian merchants, designers, and artisans. MarketNest acts as the technology provider and escrow payment facilitator. Contracts for sale are formed directly between the buyer and the merchant.
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">2. Escrow Protection & Settlements</h4>
          <p>
            All buyer payments are processed via licensed payment gateway partners (Paystack) and held in escrow protection until the delivery inspection window has passed (7 calendar days post-delivery) or the buyer confirms satisfactory receipt.
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">3. Prohibited Conduct & Listings</h4>
          <p>
            Users and merchants may not list counterfeit merchandise, narcotics, regulated substances, or engage in off-platform payment diversion. Violation results in immediate account deactivation and forfeiture of pending settlements.
          </p>
        </section>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Nigeria Data Protection Regulation (NDPR) Compliance',
    icon: Lock,
    content: (
      <div className="space-y-4 text-xs text-[#101413] leading-relaxed">
        <p className="font-semibold text-neutral-500">
          Last updated: October 2026 • Compliant with NDPR & NDPA
        </p>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">1. Information We Collect</h4>
          <p>
            We collect personal identity details (full name, phone number, email address, delivery addresses) necessary to fulfill order deliveries across Nigerian states. Payment transaction data is encrypted and processed via PCI-DSS Level 1 certified partners (Paystack). MarketNest never stores full card numbers or CVVs.
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">2. How We Share Information</h4>
          <p>
            Customer delivery details are securely shared only with the merchant fulfilling the order and verified third-party courier dispatchers (e.g. GIG Logistics, Kwik, DHL). We never sell personal data to third-party data brokers.
          </p>
        </section>
      </div>
    )
  },
  returns: {
    title: 'Escrow & Returns Policy',
    subtitle: '7-Day Peace of Mind Inspection Guarantee',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-xs text-[#101413] leading-relaxed">
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">1. 7-Day Inspection Window</h4>
          <p>
            Every purchase on MarketNest is covered by our 7-day inspection window. If your received item is damaged, defective, materially different from the listing description, or incorrect size, you can open a Return Merchandise Authorization (RMA) directly in your account.
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">2. Refund Authorization Process</h4>
          <p>
            Once the seller receives the returned item or our Lagos inspection hub verifies the condition, escrow funds are automatically refunded to your original payment channel or bank account within 3–5 business days.
          </p>
        </section>
      </div>
    )
  },
  delivery: {
    title: 'Delivery & Logistics Guidelines',
    subtitle: 'Lagos Express & Nationwide Shipping Commitments',
    icon: Truck,
    content: (
      <div className="space-y-4 text-xs text-[#101413] leading-relaxed">
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">1. Lagos Express Same-Day & 24h</h4>
          <p>
            Orders placed in Lagos before 12:00 PM marked with &quot;Lagos Same-Day&quot; are dispatched for same-day delivery by 6:00 PM. Standard Lagos fulfillment delivers within 24 to 48 hours.
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">2. Nationwide Transit</h4>
          <p>
            Deliveries to Abuja, Port Harcourt, Ibadan, Kano, Enugu, and all 36 states are handled via insured courier partners with real-time tracking numbers. Estimated delivery time is 2 to 5 business days.
          </p>
        </section>
      </div>
    )
  },
  seller_agreement: {
    title: 'Seller Agreement & Terms',
    subtitle: 'Merchant Standards, Commissions & Escrow Settlement',
    icon: Store,
    content: (
      <div className="space-y-4 text-xs text-[#101413] leading-relaxed">
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">1. Commission Structure</h4>
          <p>
            MarketNest charges a platform commission of 8% on successfully settled orders. Sellers retain 92% of gross product sales minus payment gateway processing fees (1.5% + ₦100, capped at ₦2,000 per transaction).
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">2. Payout Disbursements</h4>
          <p>
            Seller earnings are deposited automatically into the registered Nigerian commercial bank account upon completion of customer delivery inspection.
          </p>
        </section>
      </div>
    )
  },
  affiliate_terms: {
    title: 'Affiliate Partner Terms',
    subtitle: 'Growth Partner Attribution & Commission Rules',
    icon: Sparkles,
    content: (
      <div className="space-y-4 text-xs text-[#101413] leading-relaxed">
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">1. Commission Rate & Window</h4>
          <p>
            Approved affiliates earn 5% baseline commission on eligible product orders referred via their unique link or referral code. MarketNest operates on a 30-day attribution window.
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">2. Anti-Fraud & Self-Referral Rules</h4>
          <p>
            Affiliates cannot earn commissions on self-purchases. Fraudulent click farming, spamming, or misleading claims will result in immediate termination of partner access and reversal of pending balances.
          </p>
        </section>
      </div>
    )
  },
  review_guidelines: {
    title: 'Review & Community Guidelines',
    subtitle: 'Authentic Customer Feedback Standards',
    icon: FileText,
    content: (
      <div className="space-y-4 text-xs text-[#101413] leading-relaxed">
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">1. Verified Purchase Badges</h4>
          <p>
            Only customers who have completed an authenticated order for an item can submit a review with the &quot;Verified Purchase&quot; badge.
          </p>
        </section>
        <section className="space-y-2">
          <h4 className="font-bold text-sm text-[#101413]">2. Zero Tolerance for Retaliation</h4>
          <p>
            Merchants may reply publicly to reviews but may not harass customers or attempt to coerce review deletion. Inappropriate content is moderated transparently by administrators with audit logging.
          </p>
        </section>
      </div>
    )
  }
};

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, policyType }) => {
  if (!isOpen) return null;

  const current = POLICY_CONTENT[policyType] || POLICY_CONTENT.terms;
  const IconComponent = current.icon;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#101413]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div className="bg-white border border-[#E4E7E5] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between bg-[#FBFBFA]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-[#E8F5EF] text-[#0E8F5A]">
              <IconComponent className="w-5 h-5" />
            </span>
            <div>
              <h3 id="policy-modal-title" className="font-bold text-sm text-[#101413]">
                {current.title}
              </h3>
              <p className="text-[11px] text-[#6B726E]">{current.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
            aria-label="Close policy dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {current.content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E7E5] bg-[#FBFBFA] flex items-center justify-between text-xs text-[#6B726E]">
          <span className="text-[11px]">Official MarketNest Policy Document</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#101413] hover:bg-[#1B211F] text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
