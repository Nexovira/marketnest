/**
 * @file src/pages/ShopPage.tsx
 * Marketplace catalog listing with faceted filtering, multi-column responsive grid, and sorting.
 */

import React, { useMemo, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { CategoryId, SortOption } from '../types';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const {
    navigateTo,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    sortOption,
    setSortOption
  } = useMarket();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = product.title.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchSeller = product.seller.name.toLowerCase().includes(query);
        const matchCategory = product.category.toLowerCase().includes(query);
        const matchTag = product.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchSeller && !matchCategory && !matchTag) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Max price filter
      if (product.price > filters.maxPrice) {
        return false;
      }

      // Rating filter
      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false;
      }

      // Verified only
      if (filters.verifiedOnly && !product.seller.verified) {
        return false;
      }

      // Made in Nigeria only
      if (filters.madeInNigeriaOnly && !product.isMadeInNigeria) {
        return false;
      }

      // Delivery speed
      if (filters.deliverySpeed === 'lagos_sameday' && product.deliverySpeed !== 'lagos_sameday') {
        return false;
      }
      if (filters.deliverySpeed === 'lagos_24h' && product.deliverySpeed !== 'lagos_sameday' && product.deliverySpeed !== 'lagos_24h') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating_desc':
          return b.rating - a.rating;
        case 'recommended':
        default:
          return (b.isEditorialPick ? 1 : 0) - (a.isEditorialPick ? 1 : 0) || b.rating - a.rating;
      }
    });
  }, [searchQuery, filters, sortOption]);

  const activeCategoryObject = MOCK_CATEGORIES.find((c) => c.id === filters.category);

  const activeFilterCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.maxPrice < 200000 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.madeInNigeriaOnly ? 1 : 0) +
    (filters.deliverySpeed !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs & Header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Home', onClick: () => navigateTo('home') },
            {
              label: filters.category !== 'all' ? activeCategoryObject?.name || 'Category' : 'Shop All',
              isCurrent: true
            }
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight">
              {filters.category !== 'all' ? activeCategoryObject?.name : 'All Marketplace Products'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B726E] mt-1 max-w-xl">
              {filters.category !== 'all'
                ? activeCategoryObject?.description
                : 'Browse verified Nigerian merchants, artisanal manufacturers, and specialty tech vendors.'}
            </p>
          </div>

          <div className="text-xs text-[#6B726E] tabular-nums self-start sm:self-auto">
            Showing <span className="font-bold text-[#101413]">{filteredProducts.length}</span> curated finds
          </div>
        </div>
      </div>

      {/* Control Bar: Filters toggle, Active Chips & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E4E7E5]">
        {/* Filter Trigger Button (Mobile + Desktop quick toggle) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-md border border-[#E4E7E5] bg-[#FFFFFF] hover:bg-[#F7F5F0] text-[#101413] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0E8F5A]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0E8F5A] text-white text-[10px] flex items-center justify-center font-bold tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#6B726E] hover:text-[#101413] inline-flex items-center gap-1 px-2 py-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6B726E] hidden sm:inline">Sort by:</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none bg-white border border-[#E4E7E5] rounded-md pl-3 pr-8 py-2 text-xs font-medium text-[#101413] focus:outline-none focus:border-[#0E8F5A] cursor-pointer"
            >
              <option value="recommended">Recommended Picks</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B726E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips (Quiet unboxed style) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#6B726E]">Active filters:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 bg-[#F7F5F0] border border-[#E4E7E5] px-2.5 py-1 rounded text-[#101413]">
              <span>Search: &ldquo;{searchQuery}&rdquo;</span>
              <button onClick={() => setSearchQuery('')} className="cursor-pointer hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-[#E8F5EF] border border-[#0E8F5A]/20 px-2.5 py-1 rounded text-[#0E8F5A] font-medium">
              <span>{activeCategoryObject?.name}</span>
              <button onClick={() => setFilter('category', 'all')} className="cursor-pointer hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.maxPrice < 200000 && (
            <span className="inline-flex items-center gap-1.5 bg-[#F7F5F0] border border-[#E4E7E5] px-2.5 py-1 rounded text-[#101413]">
              <span>Under ₦{(filters.maxPrice).toLocaleString()}</span>
              <button onClick={() => setFilter('maxPrice', 200000)} className="cursor-pointer hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.verifiedOnly && (
            <span className="inline-flex items-center gap-1.5 bg-[#E8F5EF] border border-[#0E8F5A]/20 px-2.5 py-1 rounded text-[#0E8F5A] font-medium">
              <span>Verified Merchants</span>
              <button onClick={() => setFilter('verifiedOnly', false)} className="cursor-pointer hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.madeInNigeriaOnly && (
            <span className="inline-flex items-center gap-1.5 bg-[#F7F5F0] border border-[#E4E7E5] px-2.5 py-1 rounded text-[#101413]">
              <span>Made in Nigeria</span>
              <button onClick={() => setFilter('madeInNigeriaOnly', false)} className="cursor-pointer hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.deliverySpeed !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-[#F7F5F0] border border-[#E4E7E5] px-2.5 py-1 rounded text-[#101413]">
              <span>{filters.deliverySpeed === 'lagos_sameday' ? 'Lagos Same-Day' : 'Lagos 24h'}</span>
              <button onClick={() => setFilter('deliverySpeed', 'all')} className="cursor-pointer hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Main Layout: Filters Sidebar + 4-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          } bg-white p-5 lg:p-0 rounded-lg border lg:border-none border-[#E4E7E5]`}
        >
          {/* Departments */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101413] mb-3">
              Departments
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  onClick={() => setFilter('category', 'all')}
                  className={`w-full text-left py-1.5 px-2 rounded transition-colors cursor-pointer flex justify-between ${
                    filters.category === 'all'
                      ? 'bg-[#101413] text-white font-semibold'
                      : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="tabular-nums">{MOCK_PRODUCTS.length}</span>
                </button>
              </li>
              {MOCK_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setFilter('category', cat.id)}
                    className={`w-full text-left py-1.5 px-2 rounded transition-colors cursor-pointer flex justify-between ${
                      filters.category === cat.id
                        ? 'bg-[#101413] text-white font-semibold'
                        : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="tabular-nums">{cat.itemCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Slider */}
          <div className="pt-5 border-t border-[#E4E7E5]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#101413]">
                Maximum Price
              </h3>
              <span className="text-xs font-bold text-[#0E8F5A] tabular-nums">
                ₦{filters.maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={filters.maxPrice}
              onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
              className="w-full accent-[#0E8F5A] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#6B726E] mt-1 tabular-nums">
              <span>₦10,000</span>
              <span>₦200,000+</span>
            </div>
          </div>

          {/* Trust & Merchant Verification */}
          <div className="pt-5 border-t border-[#E4E7E5] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101413]">
              Merchant Standards
            </h3>

            <label className="flex items-center gap-2.5 text-xs text-[#101413] cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilter('verifiedOnly', e.target.checked)}
                className="rounded accent-[#0E8F5A] cursor-pointer"
              />
              <span>Verified Sellers Only</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[#101413] cursor-pointer">
              <input
                type="checkbox"
                checked={filters.madeInNigeriaOnly}
                onChange={(e) => setFilter('madeInNigeriaOnly', e.target.checked)}
                className="rounded accent-[#0E8F5A] cursor-pointer"
              />
              <span>Made in Nigeria Artisans</span>
            </label>
          </div>

          {/* Delivery Speed */}
          <div className="pt-5 border-t border-[#E4E7E5] space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101413]">
              Delivery Speed
            </h3>

            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2 text-[#101413] cursor-pointer">
                <input
                  type="radio"
                  name="deliverySpeed"
                  checked={filters.deliverySpeed === 'all'}
                  onChange={() => setFilter('deliverySpeed', 'all')}
                  className="accent-[#0E8F5A]"
                />
                <span>All Delivery Timelines</span>
              </label>

              <label className="flex items-center gap-2 text-[#101413] cursor-pointer">
                <input
                  type="radio"
                  name="deliverySpeed"
                  checked={filters.deliverySpeed === 'lagos_sameday'}
                  onChange={() => setFilter('deliverySpeed', 'lagos_sameday')}
                  className="accent-[#0E8F5A]"
                />
                <span>Lagos Same-Day Dispatch</span>
              </label>

              <label className="flex items-center gap-2 text-[#101413] cursor-pointer">
                <input
                  type="radio"
                  name="deliverySpeed"
                  checked={filters.deliverySpeed === 'lagos_24h'}
                  onChange={() => setFilter('deliverySpeed', 'lagos_24h')}
                  className="accent-[#0E8F5A]"
                />
                <span>Lagos 24h Guaranteed</span>
              </label>
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID (Adaptive 4-col desktop, 3-col tablet, 2-col mobile) */}
        <main className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E4E7E5] rounded-xl p-12 text-center max-w-lg mx-auto my-8">
              <div className="w-12 h-12 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101413]">No matching products found</h3>
              <p className="text-xs text-[#6B726E] mt-1.5 leading-relaxed">
                Try loosening your filters or clearing search terms to explore our broader catalog of Nigerian finds.
              </p>
              <div className="mt-6">
                <Button variant="primary" size="sm" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
