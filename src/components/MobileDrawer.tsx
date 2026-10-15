/**
 * @file src/components/MobileDrawer.tsx
 * High-quality mobile navigation drawer with integrated customer authentication state.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { useSeller } from '../context/SellerContext';
import { MOCK_CATEGORIES } from '../data/mockData';
import { CategoryId, AccountTab, ActivePage } from '../types';
import {
  X,
  Search,
  ChevronRight,
  Store,
  ShieldCheck,
  Heart,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  MapPin,
  Settings,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { firebaseUser, profile, isAuthenticated, signOut } = useAuth();
  const { isSeller } = useSeller();
  const {
    navigateTo,
    searchQuery,
    setSearchQuery,
    wishlistCount,
    cartItemCount,
    setIsCartOpen,
    showToast
  } = useMarket();

  if (!isOpen) return null;

  const customerName = profile?.name || firebaseUser?.displayName || 'Customer';
  const customerEmail = profile?.email || firebaseUser?.email || '';

  const handleNav = (
    page: ActivePage,
    params?: Record<string, any>
  ) => {
    onClose();
    navigateTo(page, params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    navigateTo('shop', { search: searchQuery });
  };

  const handleSignOut = async () => {
    onClose();
    try {
      await signOut();
      showToast('Signed Out', 'You have been signed out.', 'info');
      navigateTo('home');
    } catch {
      showToast('Error', 'Failed to sign out.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#101413]/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-xs bg-[#FFFFFF] shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-[#E4E7E5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-sm bg-[#101413] flex items-center justify-center text-white font-bold text-xs">
                M
              </span>
              <span className="text-base font-extrabold tracking-tight text-[#101413]">
                MARKETNEST
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#6B726E] hover:text-[#101413] cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Auth Profile or Sign-in Box */}
          <div className="p-4 border-b border-[#E4E7E5] bg-[#F7F5F0]">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#101413] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#101413] truncate">{customerName}</p>
                    <p className="text-[11px] text-[#6B726E] truncate">{customerEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
                  <button
                    onClick={() => handleNav('account', { tab: 'overview' })}
                    className="py-1.5 px-2.5 rounded bg-white border border-[#E4E7E5] text-[#101413] hover:bg-[#E8F5EF] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => handleNav('account', { tab: 'orders' })}
                    className="py-1.5 px-2.5 rounded bg-white border border-[#E4E7E5] text-[#101413] hover:bg-[#E8F5EF] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Orders</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#6B726E]">
                  Sign in for cross-device wishlist and escrow tracking.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleNav('login')}
                    className="w-full py-2 bg-white border border-[#E4E7E5] text-[#101413] rounded text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav('register')}
                    className="w-full py-2 bg-[#101413] text-white rounded text-xs font-semibold hover:bg-[#1B211F] transition-colors cursor-pointer text-center"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Form */}
          <div className="p-4 border-b border-[#E4E7E5]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, stores..."
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A]"
              />
            </form>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('home')}
                className="w-full text-left py-2 px-3 rounded-md text-sm font-semibold text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              </button>

              <button
                onClick={() => handleNav('shop')}
                className="w-full text-left py-2 px-3 rounded-md text-sm font-semibold text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Shop All</span>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              </button>

              <button
                onClick={() => handleNav('stores')}
                className="w-full text-left py-2 px-3 rounded-md text-sm font-semibold text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Verified Stores</span>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              </button>

              <button
                onClick={() => handleNav('shopping-assistant')}
                className="w-full text-left py-2 px-3 rounded-md text-sm font-semibold text-[#0E8F5A] bg-[#E8F5EF]/60 hover:bg-[#E8F5EF] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0E8F5A]" />
                  <span>AI Shopping Assistant</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#0E8F5A]" />
              </button>

              <button
                onClick={() => handleNav('deals')}
                className="w-full text-left py-2 px-3 rounded-md text-sm font-semibold text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Editorial Deals</span>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              </button>

              <button
                onClick={() => handleNav('compare')}
                className="w-full text-left py-2 px-3 rounded-md text-sm font-semibold text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Product Comparison</span>
                <ChevronRight className="w-4 h-4 text-[#CBD5E1]" />
              </button>

              <button
                onClick={() => handleNav('affiliate')}
                className="w-full text-left py-2 px-3 rounded-md text-sm font-semibold text-[#0E8F5A] hover:bg-[#E8F5EF] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0E8F5A]" />
                  <span>Affiliate Program</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[#0E8F5A]" />
              </button>

              <button
                onClick={() => handleNav('admin')}
                className="w-full text-left py-2 px-3 rounded-md text-sm font-semibold text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#101413]" />
                  <span>Admin Control Center</span>
                </span>
                <span className="px-1.5 py-0.5 bg-[#101413] text-white text-[9px] font-bold rounded">
                  Ops
                </span>
              </button>
            </nav>

            {/* Account Quick Links if Authenticated */}
            {isAuthenticated && (
              <div>
                <h4 className="text-xs font-semibold text-[#6B726E] uppercase tracking-wider px-3 mb-2">
                  My Account
                </h4>
                <div className="space-y-0.5 text-xs">
                  <button
                    onClick={() => handleNav('account', { tab: 'wishlist' })}
                    className="w-full text-left py-2 px-3 text-[#101413] hover:bg-[#F7F5F0] rounded flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      Saved Items
                    </span>
                    <span className="font-semibold tabular-nums">{wishlistCount}</span>
                  </button>

                  <button
                    onClick={() => handleNav('account', { tab: 'addresses' })}
                    className="w-full text-left py-2 px-3 text-[#101413] hover:bg-[#F7F5F0] rounded flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#6B726E]" />
                    <span>Saved Addresses</span>
                  </button>

                  <button
                    onClick={() => handleNav('account', { tab: 'settings' })}
                    className="w-full text-left py-2 px-3 text-[#101413] hover:bg-[#F7F5F0] rounded flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#6B726E]" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left py-2 px-3 text-rose-600 hover:bg-rose-50 rounded flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Category Quick Links */}
            <div>
              <h4 className="text-xs font-semibold text-[#6B726E] uppercase tracking-wider px-3 mb-2">
                Departments
              </h4>
              <div className="space-y-0.5">
                {MOCK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleNav('shop', { category: cat.id })}
                    className="w-full text-left py-2 px-3 text-xs text-[#101413] hover:text-[#0E8F5A] hover:bg-[#E8F5EF] rounded transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-[#6B726E] tabular-nums">{cat.itemCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions (Wishlist & Cart) */}
            <div className="pt-4 border-t border-[#E4E7E5] space-y-2">
              <button
                onClick={() => {
                  onClose();
                  if (isAuthenticated) {
                    navigateTo('account', { tab: 'wishlist' });
                  } else {
                    navigateTo('shop');
                  }
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded text-xs text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Saved Items</span>
                </div>
                <span className="font-semibold tabular-nums text-xs">{wishlistCount}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-between py-2 px-3 rounded text-xs text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#0E8F5A]" />
                  <span>Shopping Bag</span>
                </div>
                <span className="font-semibold tabular-nums text-xs">{cartItemCount}</span>
              </button>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="p-4 border-t border-[#E4E7E5] bg-[#101413] text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <Store className="w-4 h-4 text-[#0E8F5A]" />
              <span className="text-xs font-bold tracking-tight">
                {isSeller ? 'Seller Platform' : 'Sell on MarketNest'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
              {isSeller
                ? 'Manage your live inventory, dispatch pending orders, and review store analytics.'
                : 'Reach discerning Nigerian customers with escrow payments and verified merchant credentials.'}
            </p>
            <button
              onClick={() => {
                onClose();
                if (isSeller) {
                  navigateTo('seller-dashboard');
                } else {
                  navigateTo('sell');
                }
              }}
              className="w-full py-2 bg-[#0E8F5A] text-white rounded text-xs font-semibold hover:bg-[#0B7549] transition-colors cursor-pointer text-center block"
            >
              {isSeller ? 'Open Seller Dashboard' : 'Start Selling'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
