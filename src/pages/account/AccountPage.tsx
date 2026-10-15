/**
 * @file src/pages/account/AccountPage.tsx
 * Customer account dashboard supporting both luxury desktop sidebar and mobile-first experience.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { AccountTab } from '../../types';

import { AccountOverview } from './AccountOverview';
import { AccountOrders } from './AccountOrders';
import { AccountPayments } from './AccountPayments';
import { AccountWishlist } from './AccountWishlist';
import { AccountAddresses } from './AccountAddresses';
import { AccountProfile } from './AccountProfile';
import { AccountSettings } from './AccountSettings';
import { AccountReturns } from './AccountReturns';
import { AccountSupport } from './AccountSupport';
import { AccountLoyalty } from './AccountLoyalty';
import { AccountMessages } from './AccountMessages';

import {
  LayoutDashboard,
  Package,
  CreditCard,
  Heart,
  MapPin,
  User as UserIcon,
  Settings,
  LogOut,
  ShieldCheck,
  Clock,
  RotateCcw,
  Headphones,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { profile, firebaseUser, signOut } = useAuth();
  const { activeAccountTab, setActiveAccountTab, navigateTo, wishlistCount, showToast } = useMarket();

  const [addressCount, setAddressCount] = useState(1);

  const customerName = profile?.name || firebaseUser?.displayName || 'Customer';
  const customerEmail = profile?.email || firebaseUser?.email || '';
  const isVerified = firebaseUser?.emailVerified;

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Signed Out', 'You have been signed out.', 'info');
      navigateTo('home');
    } catch {
      showToast('Error', 'Failed to sign out.', 'error');
    }
  };

  const navItems: { id: AccountTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <Package className="w-4 h-4" />
    },
    {
      id: 'returns',
      label: 'Returns & RMA',
      icon: <RotateCcw className="w-4 h-4" />
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="w-4 h-4" />
    },
    {
      id: 'loyalty',
      label: 'NestPoints Club',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      badge: 'VIP'
    },
    {
      id: 'support',
      label: 'Support Desk',
      icon: <Headphones className="w-4 h-4" />
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      id: 'wishlist',
      label: 'Saved Items',
      icon: <Heart className="w-4 h-4" />,
      badge: wishlistCount > 0 ? wishlistCount : undefined
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: <MapPin className="w-4 h-4" />,
      badge: addressCount
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => navigateTo('home') },
          { label: 'My Account', isCurrent: true }
        ]}
      />

      {/* Mobile Profile Header */}
      <div className="lg:hidden bg-white border border-[#E4E7E5] rounded-xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#101413] text-white flex items-center justify-center font-bold text-lg shrink-0">
          {customerName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#101413] truncate">{customerName}</h2>
            {isVerified && <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0" />}
          </div>
          <p className="text-xs text-[#6B726E] truncate">{customerEmail}</p>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E4E7E5]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveAccountTab(item.id)}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[44px] transition-colors cursor-pointer ${
              activeAccountTab === item.id
                ? 'bg-[#101413] text-white'
                : 'bg-white border border-[#E4E7E5] text-[#6B726E] hover:text-[#101413]'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  activeAccountTab === item.id ? 'bg-[#0E8F5A] text-white' : 'bg-[#F7F5F0] text-[#101413]'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Dashboard Layout (Desktop Sidebar + Main Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#E4E7E5] rounded-xl p-5 space-y-6 sticky top-24">
          {/* User ID summary */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-[#E4E7E5]">
            <div className="w-12 h-12 rounded-full bg-[#101413] text-white flex items-center justify-center font-bold text-base shrink-0">
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#101413] truncate">{customerName}</span>
                {isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A] shrink-0" />}
              </div>
              <p className="text-xs text-[#6B726E] truncate">{customerEmail}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveAccountTab(item.id)}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeAccountTab === item.id
                    ? 'bg-[#101413] text-white'
                    : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                      activeAccountTab === item.id
                        ? 'bg-[#0E8F5A] text-white'
                        : 'bg-[#F7F5F0] text-[#101413]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sign Out Action */}
          <div className="pt-4 border-t border-[#E4E7E5]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 py-2 px-3 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="lg:col-span-9 min-h-[600px]">
          {activeAccountTab === 'overview' && (
            <AccountOverview addressCount={addressCount} />
          )}
          {activeAccountTab === 'orders' && <AccountOrders />}
          {activeAccountTab === 'returns' && <AccountReturns />}
          {activeAccountTab === 'payments' && <AccountPayments />}
          {activeAccountTab === 'loyalty' && <AccountLoyalty />}
          {activeAccountTab === 'support' && <AccountSupport />}
          {activeAccountTab === 'messages' && <AccountMessages />}
          {activeAccountTab === 'wishlist' && <AccountWishlist />}
          {activeAccountTab === 'addresses' && (
            <AccountAddresses onAddressCountChange={(count) => setAddressCount(count)} />
          )}
          {activeAccountTab === 'profile' && <AccountProfile />}
          {activeAccountTab === 'settings' && <AccountSettings />}
        </main>
      </div>
    </div>
  );
};
