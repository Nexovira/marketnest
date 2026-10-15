/**
 * @file src/pages/admin/components/AdminHeader.tsx
 * Top operational bar for MarketNest Admin Control Center.
 * Houses breadcrumbs, search launcher, role switcher, and notification center.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useMarket } from '../../../context/MarketContext';
import { AdminRole, AdminSection } from '../../../types';
import {
  Menu,
  Search,
  Bell,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

const SECTION_TITLES: Record<AdminSection, { parent: string; title: string }> = {
  dashboard: { parent: 'Overview', title: 'Executive Health Dashboard' },
  analytics: { parent: 'Intelligence', title: 'Marketplace Growth & Funnel Analytics' },
  reports: { parent: 'Intelligence', title: 'Reporting & Ledger Exports' },
  'audit-logs': { parent: 'Governance', title: 'Append-Only Audit Trail' },
  orders: { parent: 'Commerce', title: 'Master Orders & Fulfillment' },
  payments: { parent: 'Risk & Treasury', title: 'Payment Processing & Reconciliation' },
  refunds: { parent: 'Risk & Treasury', title: 'Refund Inquiries & Dispute Queue' },
  products: { parent: 'Catalog', title: 'Product Catalog Moderation' },
  categories: { parent: 'Catalog', title: 'Department Hierarchies & Taxonomy' },
  stores: { parent: 'Catalog', title: 'Merchant Storefront Directory' },
  sellers: { parent: 'Merchants', title: 'Verified Seller Directory' },
  'seller-applications': { parent: 'Merchants', title: 'Pending Seller Applications' },
  affiliates: { parent: 'Affiliates', title: 'Affiliate Partner Suite' },
  'affiliate-applications': { parent: 'Affiliates', title: 'Pending Affiliate Applications' },
  customers: { parent: 'Users', title: 'Customer Accounts & Spending Profiles' },
  commissions: { parent: 'Finance', title: 'Platform Commissions & Net Take Rates' },
  'affiliate-commissions': { parent: 'Finance', title: 'Affiliate Referral Ledgers' },
  payouts: { parent: 'Finance', title: 'Disbursement & Bank Payout Orders' },
  reviews: { parent: 'Moderation', title: 'Customer Reviews Moderation' },
  returns: { parent: 'Commerce', title: 'Returns & Refund Authorizations' },
  promotions: { parent: 'Marketing', title: 'Coupons & Platform Promotions' },
  marketing: { parent: 'Marketing', title: 'Campaigns & Audience Engagement' },
  'affiliate-operations': { parent: 'Affiliates', title: 'Affiliate Reconciliation & Payouts' },
  messages: { parent: 'Support', title: 'Customer & Seller Messages' },
  support: { parent: 'Support', title: 'Customer Support Desk & Ticket Center' },
  operations: { parent: 'Operations', title: 'Operational Command Center' },
  moderation: { parent: 'Governance', title: 'Content Quality & Moderation Queue' },
  insights: { parent: 'Intelligence', title: 'AI Marketplace Intelligence & Cost Controls' },
  'ai-usage': { parent: 'Intelligence', title: 'AI Token Quotas & Latency Auditing' },
  'launch-readiness': { parent: 'Governance', title: 'Production Launch Control Center' },
  scalability: { parent: 'Intelligence', title: 'Scalability Audit & Multi-Region Hub' },
  regions: { parent: 'System', title: 'Multi-Region & Regional Governance' },
  settings: { parent: 'System', title: 'Platform Governance & Policies' },
  'business-intelligence': { parent: 'Intelligence', title: 'Business Intelligence & Financial Analytics' },
  reconciliation: { parent: 'Finance', title: 'Financial Reconciliation Center' },
  'sales-analytics': { parent: 'Intelligence', title: 'Sales & Revenue Analytics' },
  'customer-analytics': { parent: 'Intelligence', title: 'Customer Cohorts & Analytics' },
  'seller-analytics': { parent: 'Intelligence', title: 'Seller Performance & SLA Analytics' },
  'affiliate-analytics': { parent: 'Intelligence', title: 'Affiliate Partner Analytics' },
  'product-analytics': { parent: 'Intelligence', title: 'Product & Catalog Intelligence' },
  'marketing-analytics': { parent: 'Intelligence', title: 'Marketing Campaigns & Promotions' },
  risk: { parent: 'Risk & Governance', title: 'Marketplace Risk Center & Fraud Prevention' },
  'risk-cases': { parent: 'Risk & Governance', title: 'Investigation Case Dossiers' },
  disputes: { parent: 'Risk & Governance', title: 'Buyer & Seller Dispute Resolution' },
  'seller-governance': { parent: 'Merchants', title: 'Seller Compliance & SLA Governance' },
  'affiliate-integrity': { parent: 'Affiliates', title: 'Affiliate Attribution Integrity' }
};

export const AdminHeader: React.FC<{ onOpenSidebar: () => void }> = ({ onOpenSidebar }) => {
  const {
    activeSection,
    adminProfile,
    setAdminRole,
    setIsSearchOpen,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    setActiveSection,
    dataMode,
    setDataMode
  } = useAdmin();
  const { navigateTo } = useMarket();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const sectionInfo = SECTION_TITLES[activeSection] || {
    parent: 'Control Center',
    title: 'Operations'
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E4E7E5] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* LEFT: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 rounded-md text-[#6B726E] hover:bg-[#F7F5F0] hover:text-[#101413] cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-[#6B726E] font-medium">{sectionInfo.parent}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
          <span className="font-bold text-[#101413]">{sectionInfo.title}</span>
        </div>
        <div className="sm:hidden font-bold text-xs text-[#101413] truncate max-w-[160px]">
          {sectionInfo.title}
        </div>
      </div>

      {/* RIGHT: Global Search, Role Switcher, Notification Bell, User */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Search Launcher Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-[#F7F5F0] hover:bg-white text-xs text-[#6B726E] transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#6B726E]" />
          <span className="hidden md:inline font-medium">Quick search...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white rounded border border-[#E4E7E5] text-neutral-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Data Mode Switcher (Strict separation between real production data & sandbox demo data) */}
        <div className="flex items-center">
          <button
            onClick={() => setDataMode(dataMode === 'production' ? 'seed' : 'production')}
            title="Toggle between Live Production Data and Test Seed Data"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
              dataMode === 'production'
                ? 'bg-[#E8F5EF] text-[#0E8F5A] border-[#A7E2C9] hover:bg-[#D4EFE2]'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dataMode === 'production' ? 'bg-[#0E8F5A]' : 'bg-amber-600 animate-pulse'
              }`}
            />
            <span>{dataMode === 'production' ? 'Production Data' : 'Seed Sandbox Mode'}</span>
          </button>
        </div>

        {/* Role Switcher (Enabled for verified super_admins or root owner to simulate permissions) */}
        {adminProfile && (
          <div className="flex items-center gap-1.5 bg-[#F7F5F0] px-2.5 py-1 rounded-lg border border-[#E4E7E5]">
            <Shield className="w-3.5 h-3.5 text-[#0E8F5A] shrink-0" />
            <label htmlFor="role-select" className="sr-only">
              Active Admin Role
            </label>
            <select
              id="role-select"
              value={adminProfile.role}
              onChange={(e) => setAdminRole(e.target.value as AdminRole)}
              className="text-[11px] font-bold text-[#101413] bg-transparent outline-hidden cursor-pointer"
            >
              <option value="super_admin">Super Admin (All Privileges)</option>
              <option value="operations_admin">Operations Admin</option>
              <option value="finance_admin">Finance & Treasury Admin</option>
              <option value="support_admin">Support Admin</option>
              <option value="moderator">Catalog Moderator</option>
            </select>
          </div>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
            aria-label="Admin notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E4E7E5] rounded-xl shadow-xl py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2.5 border-b border-[#E4E7E5] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#101413]">Ops Notifications</h4>
                  <p className="text-[11px] text-[#6B726E]">
                    {unreadNotificationCount} priority alert{unreadNotificationCount === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                  Live Feed
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#F7F5F0]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B726E]">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-[#FBFBFA] transition-colors ${
                        !n.read ? 'bg-[#FBFBFA]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 mt-0.5">
                          {n.priority === 'critical' ? (
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          ) : n.priority === 'warning' ? (
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Info className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-[#101413] truncate">{n.title}</p>
                            {!n.read && (
                              <button
                                onClick={() => markNotificationRead(n.id)}
                                className="text-[10px] text-[#0E8F5A] hover:underline font-semibold cursor-pointer shrink-0"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B726E] mt-0.5 leading-snug">
                            {n.message}
                          </p>

                          {n.link && (
                            <button
                              onClick={() => {
                                setNotifOpen(false);
                                if (n.link?.includes('sellers/applications')) {
                                  setActiveSection('seller-applications');
                                } else if (n.link?.includes('refunds')) {
                                  setActiveSection('refunds');
                                } else if (n.link?.includes('products')) {
                                  setActiveSection('products');
                                }
                              }}
                              className="text-[10px] font-bold text-[#0E8F5A] hover:underline mt-1.5 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Take Action</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Return to Marketplace Button */}
        <button
          onClick={() => navigateTo('home')}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0] rounded-md transition-colors cursor-pointer"
        >
          <span>Marketplace</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
