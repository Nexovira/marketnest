/**
 * @file src/pages/SearchPage.tsx
 * Advanced marketplace search experience with autocomplete suggestions,
 * recent searches history, trending popular queries, faceted filters, sorting,
 * grid/list view toggles, mobile filter drawer, and empty-state recovery.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { MOCK_PRODUCTS } from '../data/mockData';
import { searchService, SearchFilters } from '../services/searchService';
import { Product, SortOption } from '../types';
import { formatCurrency } from '../utils/money';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  X,
  History,
  TrendingUp,
  Star,
  SlidersHorizontal,
  Layers,
  Heart,
  ShoppingBag,
  Zap,
  LayoutGrid,
  List,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Store
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    navigateTo,
    addToCart,
    toggleWishlist,
    isWishlisted,
    addToCompare,
    isComparing,
    setIsCartOpen
  } = useMarket();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    minPrice: 0,
    maxPrice: 300000,
    minRating: 0,
    inStockOnly: false,
    madeInNigeriaOnly: false,
    hasDiscountOnly: false,
    deliverySpeed: 'all'
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync external searchQuery to inputVal
  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(searchService.getRecentSearches());
  }, []);

  // Handle autocomplete suggestions
  useEffect(() => {
    if (inputVal.trim().length >= 2) {
      setSuggestions(searchService.getSuggestions(inputVal, MOCK_PRODUCTS));
    } else {
      setSuggestions([]);
    }
  }, [inputVal]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Execute Search
  const handleExecuteSearch = (q: string) => {
    const trimmed = q.trim();
    setSearchQuery(trimmed);
    setInputVal(trimmed);
    setShowSuggestions(false);
    if (trimmed) {
      searchService.addRecentSearch(trimmed);
      setRecentSearches(searchService.getRecentSearches());
    }
  };

  const handleClearHistory = () => {
    searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return searchService.filterAndSort(MOCK_PRODUCTS, searchQuery, filters, sortOption);
  }, [searchQuery, filters, sortOption]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.minPrice && filters.minPrice > 0) count++;
    if (filters.maxPrice && filters.maxPrice < 300000) count++;
    if (filters.minRating && filters.minRating > 0) count++;
    if (filters.inStockOnly) count++;
    if (filters.madeInNigeriaOnly) count++;
    if (filters.hasDiscountOnly) count++;
    if (filters.deliverySpeed && filters.deliverySpeed !== 'all') count++;
    return count;
  }, [filters]);

  const resetAllFilters = () => {
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: 300000,
      minRating: 0,
      inStockOnly: false,
      madeInNigeriaOnly: false,
      hasDiscountOnly: false,
      deliverySpeed: 'all'
    });
  };

  // Fallback recommended products for empty states
  const fallbackRecommended = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.isTrending || p.isEditorialPick).slice(0, 3);
  }, []);

  // Filter Sidebar & Drawer Shared Content
  const renderFilterControls = () => (
    <div className="space-y-6">
      {/* Department Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#101413] uppercase tracking-wider block">
          Department
        </label>
        <div className="space-y-1 text-xs">
          {['all', 'fashion', 'electronics', 'home', 'beauty'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-md capitalize transition-colors cursor-pointer flex items-center justify-between ${
                (filters.category || 'all') === cat
                  ? 'bg-[#E8F5EF] text-[#0E8F5A] font-bold'
                  : 'text-[#6B726E] hover:bg-[#F7F5F0] hover:text-[#101413]'
              }`}
            >
              <span>{cat === 'all' ? 'All Departments' : cat}</span>
              <span className="text-[10px] text-[#6B726E]">
                {cat === 'all'
                  ? MOCK_PRODUCTS.length
                  : MOCK_PRODUCTS.filter((p) => p.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Speed Filter */}
      <div className="space-y-2 pt-3 border-t border-[#E4E7E5]">
        <label className="text-xs font-bold text-[#101413] uppercase tracking-wider block flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-[#0E8F5A]" /> Delivery Speed
        </label>
        <div className="space-y-1 text-xs">
          {[
            { id: 'all', label: 'Any Delivery Speed' },
            { id: 'lagos_sameday', label: '⚡ Lagos Same-Day Dispatch' },
            { id: 'lagos_24h', label: '🚀 Lagos 24h Delivery' },
            { id: 'express_48h', label: '📦 Nationwide Express' }
          ].map((speed) => (
            <button
              key={speed.id}
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  deliverySpeed: speed.id as SearchFilters['deliverySpeed']
                }))
              }
              className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                (filters.deliverySpeed || 'all') === speed.id
                  ? 'bg-[#E8F5EF] text-[#0E8F5A] font-bold'
                  : 'text-[#6B726E] hover:bg-[#F7F5F0] hover:text-[#101413]'
              }`}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2 pt-3 border-t border-[#E4E7E5]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#101413] uppercase tracking-wider block">
            Max Price
          </label>
          <span className="text-xs font-bold text-[#0E8F5A] tabular-nums">
            {formatCurrency(filters.maxPrice || 300000)}
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max="300000"
          step="5000"
          value={filters.maxPrice || 300000}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-[#0E8F5A] cursor-pointer"
          aria-label="Filter by maximum price"
        />
        <div className="flex justify-between text-[10px] text-[#6B726E]">
          <span>₦5,000</span>
          <span>₦300,000+</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2 pt-3 border-t border-[#E4E7E5]">
        <label className="text-xs font-bold text-[#101413] uppercase tracking-wider block">
          Customer Rating
        </label>
        <div className="space-y-1">
          {[4, 3, 0].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, minRating: star }))}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                (filters.minRating || 0) === star
                  ? 'bg-[#E8F5EF] text-[#0E8F5A] font-bold'
                  : 'text-[#6B726E] hover:bg-[#F7F5F0]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{star === 0 ? 'Any Rating' : `${star} Stars & Up`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="space-y-2.5 pt-3 border-t border-[#E4E7E5] text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filters.inStockOnly)}
            onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
            className="rounded accent-[#0E8F5A] w-4 h-4"
          />
          <span className="text-[#101413] font-medium">In Stock Only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filters.madeInNigeriaOnly)}
            onChange={(e) => setFilters((prev) => ({ ...prev, madeInNigeriaOnly: e.target.checked }))}
            className="rounded accent-[#0E8F5A] w-4 h-4"
          />
          <span className="text-[#101413] font-medium">Made in Nigeria Only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(filters.hasDiscountOnly)}
            onChange={(e) => setFilters((prev) => ({ ...prev, hasDiscountOnly: e.target.checked }))}
            className="rounded accent-[#0E8F5A] w-4 h-4"
          />
          <span className="text-[#101413] font-medium">Special Offers Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
      </div>

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => navigateTo('home') },
          { label: 'Search Catalog', isCurrent: true }
        ]}
      />

      {/* Main Search Input & Auto-complete */}
      <div ref={searchContainerRef} className="relative max-w-3xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch(inputVal);
          }}
          className="relative flex items-center"
        >
          <div className="absolute left-4 text-neutral-400 pointer-events-none">
            <Search className="w-5 h-5 text-[#0E8F5A]" />
          </div>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search products, departments, Nigerian designers, tags..."
            className="w-full pl-12 pr-28 py-3.5 bg-white border border-[#E4E7E5] rounded-xl text-sm text-[#101413] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0E8F5A] focus:border-[#0E8F5A] transition-all"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                handleExecuteSearch('');
              }}
              className="absolute right-20 p-1 text-neutral-400 hover:text-neutral-600 rounded-full cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 bg-[#0E8F5A] hover:bg-[#0B7549] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Suggestions & History Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E7E5] rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-[#E4E7E5]/50 animate-in fade-in duration-150">
            {/* Live Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <p className="text-[10px] font-bold text-[#6B726E] uppercase tracking-wider mb-1.5 px-2">
                  Matching Suggestions
                </p>
                <div className="space-y-0.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleExecuteSearch(s.query)}
                      className="w-full text-left px-3 py-2 text-xs text-[#101413] hover:bg-[#F7F5F0] rounded-md flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-medium">{s.query}</span>
                      </span>
                      <span className="text-[10px] text-[#0E8F5A] uppercase font-semibold">
                        {s.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-3 bg-[#FBFBFA]/50">
                <div className="flex items-center justify-between mb-1.5 px-2">
                  <p className="text-[10px] font-bold text-[#6B726E] uppercase tracking-wider flex items-center gap-1">
                    <History className="w-3 h-3" />
                    <span>Recent Searches</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-[10px] text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Clear history
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleExecuteSearch(term)}
                      className="px-2.5 py-1 bg-white border border-[#E4E7E5] hover:border-[#101413] rounded-md text-xs text-[#101413] transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="p-3">
              <p className="text-[10px] font-bold text-[#6B726E] uppercase tracking-wider mb-1.5 px-2 flex items-center gap-1 text-[#0E8F5A]">
                <TrendingUp className="w-3 h-3" />
                <span>Trending on MarketNest</span>
              </p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {searchService.getPopularSearches().map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleExecuteSearch(term)}
                    className="px-2.5 py-1 bg-[#F7F5F0] hover:bg-[#E8F5EF] text-[#101413] hover:text-[#0E8F5A] rounded-md text-xs font-medium transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E4E7E5]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden px-3 py-2 bg-white border border-[#E4E7E5] rounded-lg text-xs font-semibold text-[#101413] flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
          </button>

          <span className="text-xs text-[#6B726E]">
            Found <strong className="text-[#101413]">{filteredProducts.length}</strong>{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'}
            {searchQuery && (
              <>
                {' '}
                for &ldquo;<span className="text-[#101413] font-semibold">{searchQuery}</span>&rdquo;
              </>
            )}
          </span>
        </div>

        {/* View Mode & Sorting */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-[#F7F5F0] p-1 rounded-lg border border-[#E4E7E5]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#101413] shadow-2xs font-semibold'
                  : 'text-[#6B726E] hover:text-[#101413]'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#101413] shadow-2xs font-semibold'
                  : 'text-[#6B726E] hover:text-[#101413]'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#6B726E] hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="text-xs bg-white border border-[#E4E7E5] rounded-lg px-3 py-1.5 font-medium text-[#101413] focus:outline-none focus:ring-1 focus:ring-[#0E8F5A] cursor-pointer"
            >
              <option value="recommended">Recommended & Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Customer Rating</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-[#6B726E] font-medium">Active filters:</span>

          {filters.category && filters.category !== 'all' && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[#E8F5EF] text-[#0E8F5A] rounded-md hover:bg-[#d5eee2] transition-colors"
            >
              <span>Dept: {filters.category}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filters.deliverySpeed && filters.deliverySpeed !== 'all' && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, deliverySpeed: 'all' }))}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[#E8F5EF] text-[#0E8F5A] rounded-md hover:bg-[#d5eee2] transition-colors"
            >
              <span>
                {filters.deliverySpeed === 'lagos_sameday'
                  ? 'Lagos Same-Day'
                  : filters.deliverySpeed === 'lagos_24h'
                  ? 'Lagos 24h'
                  : 'Nationwide Express'}
              </span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filters.maxPrice && filters.maxPrice < 300000 && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, maxPrice: 300000 }))}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[#E8F5EF] text-[#0E8F5A] rounded-md hover:bg-[#d5eee2] transition-colors"
            >
              <span>≤ {formatCurrency(filters.maxPrice)}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filters.minRating && filters.minRating > 0 && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[#E8F5EF] text-[#0E8F5A] rounded-md hover:bg-[#d5eee2] transition-colors"
            >
              <span>{filters.minRating}★ & Up</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filters.inStockOnly && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: false }))}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[#E8F5EF] text-[#0E8F5A] rounded-md hover:bg-[#d5eee2] transition-colors"
            >
              <span>In Stock Only</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filters.madeInNigeriaOnly && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, madeInNigeriaOnly: false }))}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[#E8F5EF] text-[#0E8F5A] rounded-md hover:bg-[#d5eee2] transition-colors"
            >
              <span>Made in Nigeria</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filters.hasDiscountOnly && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, hasDiscountOnly: false }))}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[#E8F5EF] text-[#0E8F5A] rounded-md hover:bg-[#d5eee2] transition-colors"
            >
              <span>Discounted Only</span>
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs text-neutral-500 hover:text-rose-600 underline cursor-pointer ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block md:col-span-1 space-y-6 bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E5]">
            <h3 className="font-bold text-sm text-[#101413] flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#0E8F5A]" />
              <span>Filters</span>
            </h3>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-[#6B726E] hover:text-[#0E8F5A] cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {renderFilterControls()}
        </aside>

        {/* Product Grid / List Area */}
        <main className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-[#FBFBFA] border border-[#E4E7E5] rounded-2xl p-8 sm:p-12 text-center space-y-6">
              <div className="w-12 h-12 bg-white rounded-full border border-[#E4E7E5] flex items-center justify-center mx-auto text-[#6B726E]">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#101413]">No matching products found</h3>
                <p className="text-xs text-[#6B726E] max-w-md mx-auto">
                  Try clearing active filters or searching for verified Nigerian craftsmanship like
                  &ldquo;Aso-Oke&rdquo;, &ldquo;Leather&rdquo;, or &ldquo;Desk&rdquo;.
                </p>
              </div>
              <div>
                <Button variant="primary" size="sm" onClick={resetAllFilters}>
                  Clear All Filters
                </Button>
              </div>

              {/* Conversion Recovery: Fallback Recommendations */}
              <div className="pt-8 border-t border-[#E4E7E5] text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A] mb-3">
                  Popular Marketplace Picks
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {fallbackRecommended.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Detailed List View Mode */
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const isSaved = isWishlisted(product.id);
                const isComp = isComparing(product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => navigateTo('product', { productId: product.id })}
                    className="group bg-white border border-[#E4E7E5] rounded-xl p-4 hover:border-[#101413] transition-all flex flex-col sm:flex-row items-center gap-4 cursor-pointer shadow-2xs hover:shadow-md"
                  >
                    <img
                      src={product.images?.[0]}
                      alt={product.title}
                      className="w-full sm:w-36 h-36 object-cover rounded-lg bg-[#F7F5F0] border border-[#E4E7E5] shrink-0 group-hover:scale-102 transition-transform"
                    />
                    <div className="flex-1 min-w-0 space-y-2 text-left">
                      <div className="flex items-center gap-2 text-xs text-[#6B726E]">
                        <span className="font-semibold text-[#0E8F5A] uppercase tracking-wider text-[11px]">
                          {product.category}
                        </span>
                        <span>·</span>
                        <span className="truncate">{product.seller?.name}</span>
                        {product.seller?.verified && (
                          <span className="inline-flex items-center gap-0.5 text-[#0E8F5A] text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-[#101413] group-hover:text-[#0E8F5A] transition-colors">
                        {product.title}
                      </h4>
                      <p className="text-xs text-[#6B726E] line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-3 text-xs text-[#6B726E]">
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{product.rating}</span>
                          <span className="text-neutral-400 font-normal">
                            ({product.reviewCount})
                          </span>
                        </span>
                        <span>·</span>
                        <span className="text-xs font-medium text-[#101413]">
                          {product.deliverySpeed === 'lagos_sameday'
                            ? '⚡ Lagos Same-Day'
                            : product.deliverySpeed === 'lagos_24h'
                            ? '🚀 Lagos 24h'
                            : '📦 Nationwide Express'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E4E7E5] shrink-0">
                      <div className="text-right">
                        <p className="text-base sm:text-lg font-extrabold text-[#101413] tabular-nums">
                          {formatCurrency(product.price)}
                        </p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-xs text-neutral-400 line-through tabular-nums">
                            {formatCurrency(product.originalPrice)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className={`p-2 rounded-lg border border-[#E4E7E5] transition-colors cursor-pointer ${
                            isSaved ? 'text-rose-600 bg-rose-50' : 'text-[#6B726E] hover:text-[#101413]'
                          }`}
                          title="Save to wishlist"
                          aria-label="Save to wishlist"
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, 1);
                            setIsCartOpen(true);
                          }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E4E7E5]">
                  <h3 className="font-bold text-base text-[#101413] flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#0E8F5A]" />
                    <span>Filter Products</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1.5 text-[#6B726E] hover:text-[#101413] rounded-md cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {renderFilterControls()}
              </div>

              <div className="pt-6 border-t border-[#E4E7E5] flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => {
                    resetAllFilters();
                    setIsFilterDrawerOpen(false);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setIsFilterDrawerOpen(false)}
                >
                  Show Results ({filteredProducts.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
