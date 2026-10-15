/**
 * @file src/pages/seller/SellerDashboardPage.tsx
 * Master operating dashboard for MarketNest sellers.
 * Provides sidebar navigation, tab routing, store status, and rapid commerce management.
 */

import React, { useState } from 'react';
import { useSeller } from '../../context/SellerContext';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { Button } from '../../components/ui/Button';
import { SellerDashboardTab } from '../../types';

import { SellerOverviewTab } from './dashboard/SellerOverviewTab';
import { SellerGrowthTab } from './dashboard/SellerGrowthTab';
import { SellerInsightsTab } from './dashboard/SellerInsightsTab';
import { SellerProductsTab } from './dashboard/SellerProductsTab';
import { SellerOrdersTab } from './dashboard/SellerOrdersTab';
import { SellerInventoryTab } from './dashboard/SellerInventoryTab';
import { SellerEarningsTab } from './dashboard/SellerEarningsTab';
import { SellerTransactionsTab } from './dashboard/SellerTransactionsTab';
import { SellerAnalyticsTab } from './dashboard/SellerAnalyticsTab';
import { SellerSettingsTab } from './dashboard/SellerSettingsTab';
import { SellerStorefrontBuilderTab } from './dashboard/SellerStorefrontBuilderTab';

import {
  LayoutDashboard,
  Sparkles,
  Package,
  ShoppingBag,
  SlidersHorizontal,
  DollarSign,
  Receipt,
  TrendingUp,
  Store,
  Settings,
  ExternalLink,
  ShieldCheck,
  Plus,
  ArrowRight,
  Menu,
  X,
  Bell
} from 'lucide-react';

export const SellerDashboardPage: React.FC = () => {
  const {
    sellerProfile,
    isSeller,
    loading,
    activeDashboardTab,
    setActiveDashboardTab,
    sellerProducts,
    sellerOrders,
    setActiveEditProductId
  } = useSeller();
  const { isAuthenticated } = useAuth();
  const { navigateTo } = useMarket();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not authenticated, prompt sign-in
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center space-y-6">
        <Store className="w-16 h-16 text-[#0E8F5A] mx-auto opacity-70" />
        <h2 className="text-2xl font-bold text-[#101413]">Seller Sign In Required</h2>
        <p className="text-sm text-[#6B726E]">
          Please sign in to your MarketNest merchant account to access your seller dashboard, products, and incoming orders.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigateTo('login', { redirect: 'seller-dashboard' })}
        >
          Sign In to Seller Hub
        </Button>
      </div>
    );
  }

  // If authenticated but not yet a seller, prompt onboarding
  if (!loading && !isSeller) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E8F5EF] flex items-center justify-center text-[#0E8F5A] mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#101413]">Ready to Start Selling?</h2>
        <p className="text-sm text-[#6B726E]">
          You have an active customer account. Complete the quick 3-minute merchant onboarding to launch your store on MarketNest and reach thousands of verified buyers.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigateTo('home')}
          >
            Continue Shopping
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigateTo('seller-onboarding')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Your Store
          </Button>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = sellerOrders.filter((o) => o.status === 'pending').length;
  const lowStockCount = sellerProducts.filter((p) => (p.stockCount || p.stock || 0) <= 5).length;

  const navItems: { tab: SellerDashboardTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      tab: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      tab: 'growth',
      label: 'Growth Center',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      badge: 'PRO'
    },
    {
      tab: 'insights',
      label: 'AI Insights',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      badge: 'AI'
    },
    {
      tab: 'products',
      label: 'Products',
      icon: <Package className="w-4 h-4" />,
      badge: sellerProducts.length
    },
    {
      tab: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    {
      tab: 'inventory',
      label: 'Inventory',
      icon: <SlidersHorizontal className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined
    },
    {
      tab: 'earnings',
      label: 'Earnings',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      tab: 'transactions',
      label: 'Payouts',
      icon: <Receipt className="w-4 h-4" />
    },
    {
      tab: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      tab: 'store',
      label: 'Storefront Builder',
      icon: <Store className="w-4 h-4 text-emerald-600" />,
      badge: 'LIVE'
    },
    {
      tab: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* DESKTOP SIDEBAR (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Store Identification Card */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    sellerProfile?.logoUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                  }
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-[#E4E7E5]"
                />
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm text-[#101413] truncate">
                    {sellerProfile?.storeName || 'Alara Atelier'}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-[#0E8F5A] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Merchant</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4E7E5] flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setActiveEditProductId(null);
                    navigateTo('seller-product-new');
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Product
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigateTo('storefront')}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View Storefront
                </Button>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="bg-white border border-[#E4E7E5] rounded-xl p-2 shadow-xs space-y-0.5">
              {navItems.map((item) => {
                const isActive = activeDashboardTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveDashboardTab(item.tab)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#101413] text-white shadow-xs'
                        : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.tab === 'inventory' || item.tab === 'orders'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#F7F5F0] text-[#101413]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Escrow badge trust reminder */}
            <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 text-xs space-y-1.5">
              <span className="font-bold text-[#0E8F5A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> MarketNest Escrow
              </span>
              <p className="text-[#6B726E] text-[11px] leading-relaxed">
                Orders are secured upfront in escrow. Once dispatched and delivered to your customer, funds are automatically cleared to your payout bank.
              </p>
            </div>
          </aside>

          {/* MAIN DASHBOARD CONTENT (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            {/* Mobile Header / Tab Bar */}
            <div className="lg:hidden bg-white border border-[#E4E7E5] rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#101413]">
                    {sellerProfile?.storeName || 'My Store'}
                  </span>
                  <span className="text-[10px] text-[#0E8F5A] bg-[#E8F5EF] px-1.5 py-0.5 rounded font-bold">
                    Seller
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setActiveEditProductId(null);
                      navigateTo('seller-product-new');
                    }}
                  >
                    + Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateTo('storefront')}
                  >
                    Storefront
                  </Button>
                </div>
              </div>

              {/* Horizontal Tab Scroller */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {navItems.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => setActiveDashboardTab(item.tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeDashboardTab === item.tab
                        ? 'bg-[#101413] text-white'
                        : 'bg-[#F7F5F0] text-[#6B726E]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Render Active Tab */}
            {activeDashboardTab === 'overview' && <SellerOverviewTab />}
            {activeDashboardTab === 'growth' && <SellerGrowthTab />}
            {activeDashboardTab === 'insights' && <SellerInsightsTab />}
            {activeDashboardTab === 'products' && <SellerProductsTab />}
            {activeDashboardTab === 'orders' && <SellerOrdersTab />}
            {activeDashboardTab === 'inventory' && <SellerInventoryTab />}
            {activeDashboardTab === 'earnings' && <SellerEarningsTab />}
            {activeDashboardTab === 'transactions' && <SellerTransactionsTab />}
            {activeDashboardTab === 'analytics' && <SellerAnalyticsTab />}
            {activeDashboardTab === 'store' && <SellerStorefrontBuilderTab />}
            {activeDashboardTab === 'settings' && <SellerSettingsTab />}
          </main>
        </div>
      </div>
    </div>
  );
};
