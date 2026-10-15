/**
 * @file src/pages/HomePage.tsx
 * MarketNest luxury homepage featuring editorial collections, verified stores,
 * recently viewed discoveries, escrow trust architecture, and curated browsing.
 */

import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import {
  HERO_IMAGE,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_STORES,
  EDITORIAL_COLLECTIONS
} from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { StoreCard } from '../components/StoreCard';
import { Button } from '../components/ui/Button';
import { CategoryId, Product } from '../types';
import { recommendationService } from '../services/recommendationService';
import {
  ShieldCheck,
  Lock,
  Truck,
  CheckCircle2,
  ArrowRight,
  Store,
  Sparkles,
  ArrowUpRight,
  Compass,
  Zap,
  RotateCcw,
  History,
  X
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo, showToast, wishlistIds, setFilter } = useMarket();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const trendingProducts = MOCK_PRODUCTS.filter((p) => p.isTrending).slice(0, 8);
  const featuredStores = MOCK_STORES.slice(0, 4);

  // Load recently viewed products
  useEffect(() => {
    setRecentlyViewed(recommendationService.getRecentlyViewedProducts(MOCK_PRODUCTS));
  }, []);

  const handleClearRecentlyViewed = () => {
    recommendationService.clearRecentlyViewed();
    setRecentlyViewed([]);
    showToast('Browsing History Cleared', 'Your recently viewed products list has been reset.', 'info');
  };

  // Personalized recommendations with transparent explanations
  const personalizedList = React.useMemo(() => {
    return recommendationService.getPersonalizedRecommendations({
      viewedIds: recentlyViewed.map((p) => p.id),
      wishlistIds: wishlistIds || [],
      allProducts: MOCK_PRODUCTS,
      count: 4
    });
  }, [wishlistIds, recentlyViewed]);

  const handleCategoryClick = (categoryId: CategoryId) => {
    navigateTo('shop', { category: categoryId });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      showToast('Welcome to MarketNest', 'You are now subscribed to our weekly curated discoveries.', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#FFFFFF] pt-6 lg:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>The New Standard in Nigerian Commerce</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#101413] tracking-tight leading-[1.08] text-balance">
                Discover products worth coming back for.
              </h1>

              <p className="text-base sm:text-lg text-[#6B726E] leading-relaxed max-w-xl">
                Shop verified Nigerian fashion, handcrafted home decor, and specialty technology with total peace of mind. Every order is held in 100% escrow until delivery inspection.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigateTo('shop')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Shopping
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigateTo('stores')}
                >
                  Explore Stores
                </Button>
              </div>

              {/* Quick Discovery Shortcuts (Anti-slop interactive buttons) */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-[#6B726E] uppercase tracking-wider mb-2">
                  Popular in Lagos today:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('deliverySpeed', 'lagos_sameday');
                      navigateTo('shop');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#101413] bg-[#F7F5F0] hover:bg-[#E8F5EF] hover:text-[#0E8F5A] px-3 py-1.5 rounded-md border border-[#E4E7E5] transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#0E8F5A]" />
                    <span>Lagos Same-Day</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFilter('madeInNigeriaOnly', true);
                      navigateTo('shop');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#101413] bg-[#F7F5F0] hover:bg-[#E8F5EF] hover:text-[#0E8F5A] px-3 py-1.5 rounded-md border border-[#E4E7E5] transition-colors cursor-pointer"
                  >
                    <span>🇳🇬 Made in Nigeria</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFilter('verifiedOnly', true);
                      navigateTo('shop');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#101413] bg-[#F7F5F0] hover:bg-[#E8F5EF] hover:text-[#0E8F5A] px-3 py-1.5 rounded-md border border-[#E4E7E5] transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8F5A]" />
                    <span>Verified Merchants</span>
                  </button>
                </div>
              </div>

              {/* Hero Proof Metrics */}
              <div className="pt-5 border-t border-[#E4E7E5] flex items-center gap-6 sm:gap-10 text-xs">
                <div>
                  <p className="text-lg font-bold text-[#101413] tabular-nums">1,200+</p>
                  <p className="text-[#6B726E] mt-0.5">Vetted Products</p>
                </div>
                <div className="h-8 w-px bg-[#E4E7E5]" />
                <div>
                  <p className="text-lg font-bold text-[#101413] tabular-nums">140+</p>
                  <p className="text-[#6B726E] mt-0.5">Verified Stores</p>
                </div>
                <div className="h-8 w-px bg-[#E4E7E5]" />
                <div>
                  <p className="text-lg font-bold text-[#0E8F5A] tabular-nums">24h</p>
                  <p className="text-[#6B726E] mt-0.5">Lagos Express</p>
                </div>
              </div>
            </div>

            {/* Right Visual Stage */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] lg:aspect-[16/11] rounded-xl overflow-hidden bg-[#F7F5F0] border border-[#E4E7E5] shadow-lg">
                <img
                  src={HERO_IMAGE}
                  alt="Modern Nigerian creatives with handcrafted luxury goods"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Overlaid Trust Callout */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/95 backdrop-blur-md rounded-lg p-3.5 border border-[#E4E7E5] shadow-md flex items-center gap-3 max-w-sm">
                  <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#101413]">MarketNest Escrow Guarantee</p>
                    <p className="text-[#6B726E] mt-0.5">Merchant funds released 48 hours after delivery inspection.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="border-y border-[#E4E7E5] bg-[#F7F5F0]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0E8F5A] shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#101413]">Verified Sellers</h4>
                <p className="text-[11px] sm:text-xs text-[#6B726E]">Every merchant vetted for authenticity</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#0E8F5A] shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#101413]">Secure Escrow</h4>
                <p className="text-[11px] sm:text-xs text-[#6B726E]">Funds protected until delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#101413]">Order Protection</h4>
                <p className="text-[11px] sm:text-xs text-[#6B726E]">Hassle-free dispute resolution</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#0E8F5A] shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#101413]">Reliable Delivery</h4>
                <p className="text-[11px] sm:text-xs text-[#6B726E]">Same-day & 24h Lagos dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY DISCOVERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
              Explore categories
            </h2>
            <p className="text-xs sm:text-sm text-[#6B726E] mt-1">
              Curated departments from independent Nigerian artisans and specialty boutiques.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="text-xs font-semibold text-[#0E8F5A] hover:text-[#0B7549] inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-5">
          {MOCK_CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group relative bg-[#F7F5F0] rounded-lg overflow-hidden border border-[#E4E7E5] aspect-square flex flex-col justify-end p-4 transition-all duration-300 hover:shadow-md hover:border-[#0E8F5A] cursor-pointer"
            >
              <img
                src={category.imageUrl}
                alt={category.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="relative z-10 text-white">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  {category.name}
                </h3>
                <p className="text-[11px] text-neutral-300 tabular-nums mt-0.5">
                  {category.itemCount} items
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3B. RECENTLY VIEWED PRODUCTS (Customer Continuity) */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E4E7E5]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#0E8F5A]" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#101413] tracking-tight">
                Recently viewed
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClearRecentlyViewed}
              className="text-xs text-[#6B726E] hover:text-rose-600 underline cursor-pointer"
            >
              Clear browsing history
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
              Trending now
            </h2>
            <p className="text-xs sm:text-sm text-[#6B726E] mt-1">
              Popular products customers are discovering this week across Lagos and nationwide.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="text-xs font-semibold text-[#0E8F5A] hover:text-[#0B7549] inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-col desktop / 3-col tablet / 2-col mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4B. AI CONCIERGE SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#101413] via-[#1B211F] to-[#101413] text-white rounded-2xl p-6 sm:p-10 border border-[#2C3330] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-xl text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0E8F5A]" />
              <span>Smart Market Assistant</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Looking for something specific?
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A5A3] leading-relaxed">
              Describe what you need in natural English — budget, occasion, or handcrafted material — and our grounded assistant will find verified in-stock items with fast Lagos dispatch.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigateTo('shopping-assistant')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shrink-0"
          >
            Launch Shopping Concierge
          </Button>
        </div>
      </section>

      {/* 4C. PERSONALIZED RECOMMENDATIONS WITH TRANSPARENT REASONING */}
      {personalizedList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A] flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Curated For Your Profile</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
                Recommended for you
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {personalizedList.map(({ product, reason }) => (
              <div key={product.id} className="space-y-1.5">
                <div className="bg-[#E8F5EF] text-[#0E8F5A] px-2.5 py-1 rounded-md text-[10px] font-semibold truncate border border-[#A7E2C9]">
                  💡 {reason}
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. HOW ESCROW WORKS (Nigerian Commerce Trust Foundation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFFFF] border border-[#E4E7E5] rounded-2xl p-8 sm:p-12 text-left">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A]">
              Buyer Protection Guarantee
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight mt-1">
              How MarketNest Escrow Protects You
            </h2>
            <p className="text-sm text-[#6B726E] mt-2 leading-relaxed">
              We eliminate the uncertainty of online shopping in Nigeria with our 4-step escrow settlement process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="space-y-3 relative p-4 rounded-xl bg-[#F7F5F0]/60 border border-[#E4E7E5]">
              <div className="w-8 h-8 rounded-full bg-[#101413] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h4 className="font-bold text-sm text-[#101413]">Place Order</h4>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                Your payment is safely held in escrow via Paystack. Funds are never released to the seller immediately.
              </p>
            </div>

            <div className="space-y-3 relative p-4 rounded-xl bg-[#F7F5F0]/60 border border-[#E4E7E5]">
              <div className="w-8 h-8 rounded-full bg-[#101413] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h4 className="font-bold text-sm text-[#101413]">Verified Dispatch</h4>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                Verified sellers ship using tracked Lagos dispatch or nationwide express couriers.
              </p>
            </div>

            <div className="space-y-3 relative p-4 rounded-xl bg-[#F7F5F0]/60 border border-[#E4E7E5]">
              <div className="w-8 h-8 rounded-full bg-[#101413] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h4 className="font-bold text-sm text-[#101413]">Inspect Goods</h4>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                You receive and inspect your items. You have a full 48-hour window to ensure authenticity and quality.
              </p>
            </div>

            <div className="space-y-3 relative p-4 rounded-xl bg-[#E8F5EF] border border-[#A7E2C9]">
              <div className="w-8 h-8 rounded-full bg-[#0E8F5A] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h4 className="font-bold text-sm text-[#0E8F5A]">Payout Released</h4>
              <p className="text-xs text-[#1B211F] leading-relaxed">
                Once satisfied, funds are settled into the merchant&apos;s verified Nigerian bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL DISCOVERY SECTION */}
      <section className="bg-[#F7F5F0] py-16 lg:py-20 border-y border-[#E4E7E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A]">
              Editorial Curation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight mt-1 text-balance">
              Good finds don&apos;t always look for you.
            </h2>
            <p className="text-sm text-[#6B726E] mt-2 leading-relaxed">
              Explore handpicked spotlight collections celebrating Nigerian heritage craftsmanship, high-end electronics, and everyday luxury.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {EDITORIAL_COLLECTIONS.map((col) => (
              <div
                key={col.id}
                onClick={() => {
                  if (col.filterKey === 'madeInNigeriaOnly') {
                    setFilter('madeInNigeriaOnly', true);
                    navigateTo('shop');
                  } else if (col.filterValue) {
                    navigateTo('shop', { category: col.filterValue as CategoryId });
                  } else {
                    navigateTo('shop');
                  }
                }}
                className="group bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="aspect-[4/3] bg-[#F7F5F0] overflow-hidden relative">
                  <img
                    src={col.image}
                    alt={col.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-semibold text-[#101413]">
                    {col.kicker}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="text-xl font-bold text-[#101413] group-hover:text-[#0E8F5A] transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-xs text-[#6B726E] mt-2 leading-relaxed">
                      {col.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#E4E7E5] flex items-center justify-between text-xs font-semibold text-[#101413]">
                    <span className="tabular-nums text-[#6B726E] font-normal">
                      {col.itemCount} curated items
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:text-[#0E8F5A] transition-colors">
                      Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FEATURED STORES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
              Meet the stores behind the products
            </h2>
            <p className="text-xs sm:text-sm text-[#6B726E] mt-1">
              Connect directly with verified Nigerian merchants, artisans, and specialized tech boutiques.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('stores')}
            className="text-xs font-semibold text-[#0E8F5A] hover:text-[#0B7549] inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* 8. SELLER CALLOUT (Dark Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#101413] text-white rounded-2xl p-8 sm:p-14 relative overflow-hidden text-left">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A] flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>For Independent Merchants & Brands</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Your products deserve more customers.
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Create your store on MarketNest and reach thousands of customers looking for products like yours. Build brand credibility with verified seller credentials, guaranteed payouts, and seamless logistics.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigateTo('sell')}
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                Start Selling
              </Button>

              <button
                type="button"
                onClick={() => navigateTo('stores')}
                className="text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Learn How It Works →
              </button>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-10 -bottom-10 w-96 h-96 bg-[#1B211F] rounded-full blur-3xl opacity-50 pointer-events-none" />
        </div>
      </section>

      {/* 9. NEWSLETTER / DISCOVERY CTA */}
      <section className="max-w-3xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
          Stay ahead of the finds.
        </h2>
        <p className="text-xs sm:text-sm text-[#6B726E] max-w-md mx-auto leading-relaxed">
          Get new arrivals, trending products and marketplace highlights delivered straight to your inbox.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-4 py-2 rounded-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thank you for subscribing to MarketNest discoveries.</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-4 py-2.5 text-xs text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A]"
            />
            <Button variant="dark" size="md" type="submit">
              Join MarketNest
            </Button>
          </form>
        )}
      </section>
    </div>
  );
};
