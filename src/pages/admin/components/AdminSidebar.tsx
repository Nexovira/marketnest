/**
 * @file src/pages/admin/components/AdminSidebar.tsx
 * Dense, professional administrative navigation sidebar for MarketNest.
 * Features categorized operational groups, pending badge indicators,
 * and role-based access visual indicators.
 */

import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useMarket } from '../../../context/MarketContext';
import { AdminSection } from '../../../types';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  Package,
  Layers,
  Store,
  Users,
  UserCheck,
  Percent,
  DollarSign,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  History,
  Star,
  MessageSquare,
  Tag,
  Rocket,
  Activity,
  Headphones,
  Globe,
  TrendingUp,
  Megaphone
} from 'lucide-react';

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  permission?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { activeSection, setActiveSection, adminProfile, pendingCounts } = useAdmin();
  const { navigateTo } = useMarket();

  const NAV_GROUPS: NavGroup[] = [
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'dashboard', label: 'Executive Health', icon: LayoutDashboard },
        { id: 'business-intelligence', label: 'Business Intelligence', icon: TrendingUp, badgeColor: 'bg-[#0E8F5A] text-white' },
        { id: 'operations', label: 'Operations Command', icon: Activity },
        { id: 'scalability', label: 'Scalability & Regions', icon: Globe, badgeColor: 'bg-blue-600 text-white' },
        { id: 'insights', label: 'AI Operations & Cost', icon: Sparkles, badgeColor: 'bg-purple-600 text-white' },
        { id: 'launch-readiness', label: 'Launch Readiness', icon: Rocket, badgeColor: 'bg-[#0E8F5A] text-white' },
        { id: 'analytics', label: 'Growth Analytics', icon: BarChart3 },
        { id: 'reports', label: 'Reports Hub', icon: FileText },
        { id: 'audit-logs', label: 'Audit Trail', icon: History }
      ]
    },
    {
      title: 'COMMERCE & RISK',
      items: [
        {
          id: 'risk',
          label: 'Risk & Fraud Center',
          icon: ShieldAlert,
          badge: pendingCounts.riskCases,
          badgeColor: 'bg-red-600 text-white'
        },
        {
          id: 'disputes',
          label: 'Dispute Mediation',
          icon: AlertTriangle,
          badge: pendingCounts.disputes,
          badgeColor: 'bg-purple-600 text-white'
        },
        { id: 'orders', label: 'Master Orders', icon: ShoppingBag },
        { id: 'reconciliation', label: 'Financial Reconciliation', icon: ShieldCheck, badgeColor: 'bg-emerald-700 text-white' },
        { id: 'payments', label: 'Payments & Gateways', icon: CreditCard },
        {
          id: 'refunds',
          label: 'Refund Requests',
          icon: RotateCcw,
          badge: pendingCounts.refunds,
          badgeColor: 'bg-amber-500 text-white'
        },
        { id: 'returns', label: 'Returns & RMA', icon: RotateCcw }
      ]
    },
    {
      title: 'CATALOG & STORES',
      items: [
        { id: 'products', label: 'Product Moderation', icon: Package },
        { id: 'reviews', label: 'Customer Reviews', icon: Star },
        { id: 'categories', label: 'Categories & SEO', icon: Layers },
        { id: 'stores', label: 'Storefronts', icon: Store }
      ]
    },
    {
      title: 'MERCHANTS & PARTNERS',
      items: [
        { id: 'sellers', label: 'Active Sellers', icon: Store },
        {
          id: 'seller-applications',
          label: 'Seller Applications',
          icon: UserCheck,
          badge: pendingCounts.sellers,
          badgeColor: 'bg-[#0E8F5A] text-white'
        },
        { id: 'affiliates', label: 'Affiliate Partners', icon: Sparkles },
        {
          id: 'affiliate-applications',
          label: 'Affiliate Applications',
          icon: UserCheck,
          badge: pendingCounts.affiliates,
          badgeColor: 'bg-purple-600 text-white'
        }
      ]
    },
    {
      title: 'MARKETING & RETENTION',
      items: [
        {
          id: 'marketing',
          label: 'Marketing & CRM Hub',
          icon: Megaphone,
          badgeColor: 'bg-[#0E8F5A] text-white'
        }
      ]
    },
    {
      title: 'CUSTOMERS',
      items: [
        { id: 'customers', label: 'Customer Directory', icon: Users },
        { id: 'support', label: 'Support Desk & Tickets', icon: Headphones },
        { id: 'messages', label: 'Live Conversations', icon: MessageSquare }
      ]
    },
    {
      title: 'SETTLEMENTS & CONFIG',
      items: [
        { id: 'commissions', label: 'Marketplace Fees', icon: Percent },
        { id: 'payouts', label: 'Disbursements & Payouts', icon: DollarSign },
        { id: 'promotions', label: 'Coupons & Promos', icon: Tag },
        { id: 'settings', label: 'Platform Governance', icon: Settings }
      ]
    }
  ];

  const handleSelect = (section: AdminSection) => {
    setActiveSection(section);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#101413]/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#101413] text-white z-50 flex flex-col transition-transform duration-200 ease-in-out border-r border-[#1B211F] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="h-16 px-5 border-b border-[#1B211F] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-sm bg-[#0E8F5A] text-white flex items-center justify-center font-black text-xs tracking-wider">
              MN
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-white">MARKETNEST</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E8F5EF]/10 text-[#0E8F5A] border border-[#0E8F5A]/30">
                  OPS
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">Control Center v7.0</p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('home')}
            title="Return to Public Marketplace"
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#0E8F5A] text-white font-semibold shadow-xs'
                        : 'text-neutral-300 hover:bg-[#1B211F] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                          isActive ? 'bg-white text-[#0E8F5A]' : item.badgeColor || 'bg-neutral-700 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Role Identity Card in Footer */}
        <div className="p-3.5 border-t border-[#1B211F] bg-[#141A18] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1B211F] border border-[#2D3834] flex items-center justify-center text-xs font-bold text-[#0E8F5A]">
              {adminProfile.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{adminProfile.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E8F5A]" />
                <span className="capitalize">{adminProfile.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
