/**
 * @file src/components/Navbar.tsx
 * Production navigation following the Top Bar Contract (3-Zone Architecture)
 * with integrated Firebase authentication dropdown and mobile drawer.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { useSeller } from '../context/SellerContext';
import { MobileDrawer } from './MobileDrawer';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  ArrowUpRight,
  X,
  User as UserIcon,
  LayoutDashboard,
  Package,
  MapPin,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Store,
  Sparkles,
  Shield,
  Layers,
  Globe
} from 'lucide-react';
import { RegionCurrencyModal } from './RegionCurrencyModal';
import { searchService } from '../services/searchService';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockData';
import { formatCurrency } from '../services/currencyService';
import { History, TrendingUp, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { firebaseUser, profile, isAuthenticated, signOut } = useAuth();
  const { isSeller } = useSeller();
  const {
    activePage,
    navigateTo,
    searchQuery,
    setSearchQuery,
    cartItemCount,
    setIsCartOpen,
    wishlistCount,
    showToast
  } = useMarket();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches
  useEffect(() => {
    setRecentSearches(searchService.getRecentSearches());
  }, []);

  // Matching suggestions
  const matchingProducts = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.seller?.name?.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [searchQuery]);

  const matchingCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return MOCK_CATEGORIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    ).slice(0, 3);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchService.addRecentSearch(searchQuery.trim());
      setRecentSearches(searchService.getRecentSearches());
      setShowSearchDropdown(false);
      navigateTo('search', { search: searchQuery.trim() });
    }
  };

  const handleSelectQuery = (q: string) => {
    setSearchQuery(q);
    searchService.addRecentSearch(q);
    setRecentSearches(searchService.getRecentSearches());
    setShowSearchDropdown(false);
    navigateTo('search', { search: q });
  };

  const handleSelectProduct = (productId: string) => {
    setShowSearchDropdown(false);
    navigateTo('product', { productId });
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== query);
    setRecentSearches(updated);
    try {
      localStorage.setItem('marketnest_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSignOut = async () => {
    setAccountDropdownOpen(false);
    try {
      await signOut();
      showToast('Signed Out', 'You have been signed out.', 'info');
      navigateTo('home');
    } catch {
      showToast('Error', 'Failed to sign out.', 'error');
    }
  };

  const customerName = profile?.name || firebaseUser?.displayName || 'Customer';
  const customerEmail = profile?.email || firebaseUser?.email || '';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E4E7E5] backdrop-blur-md bg-white/95 transition-all">
        {/* Top announcement bar */}
        <div className="bg-[#101413] text-white text-[11px] py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
          <span>Complimentary Lagos Express Delivery on orders above ₦50,000</span>
          <span className="hidden sm:inline text-neutral-400">·</span>
          <span className="hidden sm:inline text-[#0E8F5A] font-semibold">100% Escrow Protected</span>
        </div>

        {/* Main 3-Zone Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 lg:gap-8">
          {/* ZONE 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#101413] hover:text-[#0E8F5A] rounded-md transition-colors cursor-pointer"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('home');
              }}
              className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-[#101413] hover:opacity-90 transition-opacity"
            >
              <span className="w-7 h-7 rounded-sm bg-[#101413] text-white flex items-center justify-center text-xs font-black">
                M
              </span>
              <span>MARKETNEST</span>
            </a>
          </div>

          {/* ZONE 2: Search Bar & Nav Links */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center gap-6">
            <div ref={searchContainerRef} className="flex-1 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div
                  className={`relative flex items-center w-full bg-[#F7F5F0] border transition-all rounded-md ${
                    searchFocused || showSearchDropdown
                      ? 'border-[#0E8F5A] bg-white ring-1 ring-[#0E8F5A]'
                      : 'border-[#E4E7E5] hover:border-[#CBD5E1]'
                  }`}
                >
                  <label htmlFor="navbar-search-input" className="sr-only">
                    Search products, brands and stores
                  </label>
                  <Search className="w-4 h-4 text-[#6B726E] ml-3.5 shrink-0" aria-hidden="true" />
                  <input
                    id="navbar-search-input"
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showSearchDropdown}
                    aria-controls="navbar-search-suggestions"
                    aria-haspopup="listbox"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => {
                      setSearchFocused(true);
                      setShowSearchDropdown(true);
                    }}
                    onBlur={() => {
                      setSearchFocused(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSearchDropdown(false);
                      }
                    }}
                    placeholder="Search products, brands and stores..."
                    className="w-full bg-transparent px-3 py-2 text-xs lg:text-sm text-[#101413] placeholder-[#6B726E] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-1 mr-2 text-[#6B726E] hover:text-[#101413] cursor-pointer"
                      aria-label="Clear search query"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Instant Search Suggestions Dropdown Overlay */}
              {showSearchDropdown && (
                <div
                  id="navbar-search-suggestions"
                  role="listbox"
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-[#E4E7E5] shadow-xl z-50 overflow-hidden divide-y divide-[#E4E7E5] animate-in fade-in duration-150"
                >
                  {/* Matching Products */}
                  {matchingProducts.length > 0 && (
                    <div className="p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E] mb-2 px-1">
                        Products
                      </p>
                      <div className="space-y-1">
                        {matchingProducts.map((p) => (
                          <div
                            key={p.id}
                            role="option"
                            aria-selected="false"
                            onClick={() => handleSelectProduct(p.id)}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-[#F7F5F0] cursor-pointer transition-colors group"
                          >
                            <img
                              src={p.images?.[0]}
                              alt=""
                              aria-hidden="true"
                              className="w-10 h-10 object-cover rounded bg-[#F7F5F0] border border-[#E4E7E5] shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#101413] group-hover:text-[#0E8F5A] truncate">
                                {p.title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-[#6B726E]">
                                <span className="font-semibold text-[#101413]">
                                  {formatCurrency(p.price)}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{p.seller.name}</span>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[#6B726E] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Categories */}
                  {matchingCategories.length > 0 && (
                    <div className="p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E] mb-1.5 px-1">
                        Departments
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchingCategories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setShowSearchDropdown(false);
                              navigateTo('shop', { category: c.id });
                            }}
                            className="text-xs font-medium text-[#101413] bg-[#F7F5F0] hover:bg-[#E8F5EF] hover:text-[#0E8F5A] px-2.5 py-1 rounded transition-colors text-left cursor-pointer"
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && !searchQuery.trim() && (
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E] flex items-center gap-1">
                          <History className="w-3 h-3" /> Recent Searches
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            searchService.clearRecentSearches();
                            setRecentSearches([]);
                          }}
                          className="text-[11px] text-[#6B726E] hover:text-[#101413] underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {recentSearches.slice(0, 5).map((q) => (
                          <div
                            key={q}
                            onClick={() => handleSelectQuery(q)}
                            className="flex items-center justify-between p-1.5 rounded hover:bg-[#F7F5F0] cursor-pointer text-xs text-[#101413] group"
                          >
                            <span className="flex items-center gap-2">
                              <History className="w-3.5 h-3.5 text-[#6B726E]" />
                              <span>{q}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveRecentSearch(e, q)}
                              className="text-[#6B726E] hover:text-rose-600 p-0.5"
                              aria-label={`Remove ${q} from recent searches`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Queries */}
                  {!searchQuery.trim() && (
                    <div className="p-3 bg-[#F7F5F0]/50">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E] mb-2 px-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#0E8F5A]" /> Popular in Nigeria
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Aso-Oke', 'Leather Bag', 'Lagos Honey', 'Smart Audio', 'Ankara Dress'].map(
                          (trend) => (
                            <button
                              key={trend}
                              type="button"
                              onClick={() => handleSelectQuery(trend)}
                              className="text-xs text-[#101413] bg-white border border-[#E4E7E5] hover:border-[#0E8F5A] hover:text-[#0E8F5A] px-2.5 py-1 rounded transition-colors cursor-pointer"
                            >
                              {trend}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* View All Search Results CTA */}
                  {searchQuery.trim() && (
                    <div className="p-2.5 bg-[#F7F5F0] text-center">
                      <button
                        type="button"
                        onClick={() => handleSelectQuery(searchQuery)}
                        className="text-xs font-semibold text-[#0E8F5A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>See all matching results for &ldquo;{searchQuery}&rdquo;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <nav className="hidden lg:flex items-center gap-5 text-xs lg:text-sm font-medium text-[#6B726E] shrink-0">
              <button
                type="button"
                onClick={() => navigateTo('shop')}
                className={`transition-colors hover:text-[#101413] cursor-pointer ${
                  activePage === 'shop' ? 'text-[#101413] font-semibold' : ''
                }`}
              >
                Shop
              </button>

              <button
                type="button"
                onClick={() => navigateTo('stores')}
                className={`transition-colors hover:text-[#101413] cursor-pointer ${
                  activePage === 'stores' ? 'text-[#101413] font-semibold' : ''
                }`}
              >
                Stores
              </button>

              <button
                type="button"
                onClick={() => navigateTo('deals')}
                className={`transition-colors hover:text-[#101413] cursor-pointer ${
                  activePage === 'deals' ? 'text-[#101413] font-semibold' : ''
                }`}
              >
                Deals
              </button>

              <button
                type="button"
                onClick={() => navigateTo('compare')}
                className={`transition-colors hover:text-[#101413] cursor-pointer ${
                  activePage === 'compare' ? 'text-[#101413] font-semibold' : ''
                }`}
              >
                Compare
              </button>

              <button
                type="button"
                onClick={() => navigateTo('shopping-assistant')}
                className={`transition-colors hover:text-[#0E8F5A] cursor-pointer flex items-center gap-1 font-semibold ${
                  activePage === 'shopping-assistant' ? 'text-[#0E8F5A]' : 'text-[#0E8F5A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('sell')}
                className={`transition-colors hover:text-[#101413] cursor-pointer ${
                  activePage === 'sell' || activePage === 'seller-dashboard' ? 'text-[#0E8F5A] font-bold' : ''
                }`}
              >
                Sell
              </button>
            </nav>
          </div>

          {/* ZONE 3: Primary Actions (Auth, Wishlist, Cart, Sell) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Region / Currency Switcher Trigger */}
            <button
              type="button"
              onClick={() => setIsRegionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#E4E7E5] text-xs font-semibold text-[#101413] hover:border-[#CBD5E1] transition-colors cursor-pointer bg-white"
              title="Marketplace Region & Currency (Nigeria - NGN ₦)"
            >
              <span className="text-sm">🇳🇬</span>
              <span className="font-mono text-[11px] text-[#0E8F5A] font-bold">NGN</span>
              <Globe className="w-3.5 h-3.5 text-[#6B726E] hidden sm:inline" />
            </button>

            {/* Seller Quick Hub Trigger */}
            {isSeller && (
              <button
                type="button"
                onClick={() => navigateTo('seller-dashboard')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#101413] text-white hover:bg-[#1B211F] text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-[#0E8F5A]" />
                <span>Seller Hub</span>
              </button>
            )}

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  navigateTo('account', { tab: 'wishlist' });
                } else {
                  navigateTo('shop');
                }
              }}
              title="Saved items"
              className="relative p-2 text-[#101413] hover:text-[#0E8F5A] transition-colors cursor-pointer"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#101413] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-md bg-[#F7F5F0] hover:bg-[#E8F5EF] text-[#101413] hover:text-[#0E8F5A] transition-colors cursor-pointer"
              aria-label={`Shopping bag with ${cartItemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-semibold tabular-nums">
                Bag ({cartItemCount})
              </span>
              {cartItemCount > 0 && (
                <span className="sm:hidden absolute top-1 right-1 w-4 h-4 bg-[#0E8F5A] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Customer Authentication Dropdown or Sign In CTA */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-[#F7F5F0] border border-transparent hover:border-[#E4E7E5] transition-all cursor-pointer"
                  aria-expanded={accountDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-[#101413] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden xl:inline text-xs font-semibold text-[#101413] max-w-[100px] truncate">
                    {customerName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6B726E] hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E4E7E5] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-[#E4E7E5]">
                      <p className="text-xs font-bold text-[#101413] truncate">{customerName}</p>
                      <p className="text-[11px] text-[#6B726E] truncate">{customerEmail}</p>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          navigateTo('account', { tab: 'overview' });
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#6B726E]" />
                        <span>My Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          navigateTo('account', { tab: 'orders' });
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-[#6B726E]" />
                        <span>Orders</span>
                      </button>

                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          navigateTo('account', { tab: 'wishlist' });
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-[#6B726E]" />
                        <span>Saved Items ({wishlistCount})</span>
                      </button>

                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          navigateTo('account', { tab: 'addresses' });
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[#6B726E]" />
                        <span>Addresses</span>
                      </button>

                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          navigateTo('account', { tab: 'settings' });
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#6B726E]" />
                        <span>Settings</span>
                      </button>

                      {isSeller ? (
                        <div className="pt-1 mt-1 border-t border-[#E4E7E5]">
                          <button
                            onClick={() => {
                              setAccountDropdownOpen(false);
                              navigateTo('seller-dashboard');
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-left font-bold text-[#0E8F5A] hover:bg-[#E8F5EF] cursor-pointer"
                          >
                            <Store className="w-4 h-4 text-[#0E8F5A]" />
                            <span>Seller Dashboard</span>
                          </button>
                          <button
                            onClick={() => {
                              setAccountDropdownOpen(false);
                              navigateTo('storefront');
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#6B726E]" />
                            <span>My Storefront</span>
                          </button>
                        </div>
                      ) : (
                        <div className="pt-1 mt-1 border-t border-[#E4E7E5]">
                          <button
                            onClick={() => {
                              setAccountDropdownOpen(false);
                              navigateTo('sell');
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-left font-bold text-[#0E8F5A] hover:bg-[#E8F5EF] cursor-pointer"
                          >
                            <Store className="w-4 h-4 text-[#0E8F5A]" />
                            <span>Become a Seller</span>
                          </button>
                        </div>
                      )}

                      {/* Phase 6: Affiliate Partner Suite */}
                      <div className="pt-1 mt-1 border-t border-[#E4E7E5]">
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            navigateTo('affiliate-dashboard');
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-left text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 text-[#0E8F5A]" />
                            <span>Affiliate Portal</span>
                          </span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                            Earn 5%+
                          </span>
                        </button>
                      </div>

                      {/* Phase 7 & 8: Admin Control Center */}
                      <div className="pt-1 mt-1 border-t border-[#E4E7E5]">
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            navigateTo('admin');
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-left text-[#101413] hover:bg-[#F7F5F0] cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5 font-semibold">
                            <Shield className="w-4 h-4 text-[#101413]" />
                            <span>Admin Center</span>
                          </span>
                          <span className="text-[10px] bg-[#101413] text-white font-bold px-1.5 py-0.5 rounded">
                            Ops
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-[#E4E7E5]">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('login')}
                  className="text-xs font-semibold text-[#101413] hover:text-[#0E8F5A] px-2.5 py-1.5 rounded-md hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('register')}
                  className="hidden sm:inline-flex items-center justify-center text-xs font-semibold text-white bg-[#101413] hover:bg-[#1B211F] px-3.5 py-2 rounded-md transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar below header */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands and stores..."
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A]"
            />
          </form>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Multi-Region & Currency Selection Modal */}
      <RegionCurrencyModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        onRegionChange={(reg) => {
          showToast('Regional Market Active', `MarketNest set to ${reg.countryName} (${reg.currencyCode}).`, 'success');
        }}
      />
    </>
  );
};
