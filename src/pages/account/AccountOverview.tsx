/**
 * @file src/pages/account/AccountOverview.tsx
 * Customer dashboard summary with quick stats, recent orders, and quick links.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { Button } from '../../components/ui/Button';
import { Package, Heart, MapPin, ShieldCheck, ArrowRight, Clock } from 'lucide-react';

interface AccountOverviewProps {
  addressCount: number;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({ addressCount }) => {
  const { profile, firebaseUser } = useAuth();
  const { wishlistCount, setActiveAccountTab, navigateTo } = useMarket();

  const customerName = profile?.name || firebaseUser?.displayName || 'Valued Customer';
  const isVerified = firebaseUser?.emailVerified;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#FFFFFF] border border-[#E4E7E5] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2.5 py-0.5 rounded-full">
              Customer Account
            </span>
            {isVerified ? (
              <span className="text-xs text-[#0E8F5A] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <button
                onClick={() => navigateTo('verify-email')}
                className="text-xs text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" /> Verify Email
              </button>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
            Welcome back, {customerName}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B726E] mt-1">
            Manage your orders, saved items, and verified Nigerian delivery addresses.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigateTo('shop')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Explore Marketplace
        </Button>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saved Items */}
        <div
          onClick={() => setActiveAccountTab('wishlist')}
          className="bg-white border border-[#E4E7E5] rounded-xl p-5 hover:border-[#CBD5E1] transition-all cursor-pointer hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B726E]">Saved Items</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[#101413] tabular-nums">
              {wishlistCount}
            </span>
            <span className="text-xs text-[#6B726E] ml-1.5">items in wishlist</span>
          </div>
        </div>

        {/* Orders Placed */}
        <div
          onClick={() => setActiveAccountTab('orders')}
          className="bg-white border border-[#E4E7E5] rounded-xl p-5 hover:border-[#CBD5E1] transition-all cursor-pointer hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B726E]">Orders</span>
            <div className="w-8 h-8 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[#101413] tabular-nums">1</span>
            <span className="text-xs text-[#6B726E] ml-1.5">active escrow order</span>
          </div>
        </div>

        {/* Saved Addresses */}
        <div
          onClick={() => setActiveAccountTab('addresses')}
          className="bg-white border border-[#E4E7E5] rounded-xl p-5 hover:border-[#CBD5E1] transition-all cursor-pointer hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B726E]">Saved Addresses</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-[#101413] tabular-nums">
              {addressCount}
            </span>
            <span className="text-xs text-[#6B726E] ml-1.5">delivery destinations</span>
          </div>
        </div>
      </div>

      {/* Recent Escrow Order Feature */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#101413]">Recent Order</h3>
            <p className="text-xs text-[#6B726E]">Track delivery progress and escrow inspection window.</p>
          </div>
          <button
            onClick={() => setActiveAccountTab('orders')}
            className="text-xs font-semibold text-[#0E8F5A] hover:underline"
          >
            View All Orders
          </button>
        </div>

        <div className="p-4 rounded-lg bg-[#F7F5F0] border border-[#E4E7E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#101413]">Order #MN-2026-8941</span>
              <span className="text-[11px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                Held in Escrow
              </span>
            </div>
            <p className="text-xs text-[#6B726E]">
              1x Premium Leather Crossbody Bag · Dispatched from Victoria Island, Lagos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#101413] tabular-nums">₦34,500</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAccountTab('orders')}
            >
              Track Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
