/**
 * @file src/services/recommendationService.ts
 * Deterministic recommendation algorithms and recently viewed products tracker (up to 12 items).
 */

import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockData';

const RECENTLY_VIEWED_KEY = 'marketnest_recently_viewed_ids';

export const recommendationService = {
  /**
   * Track recently viewed product
   */
  trackRecentlyViewed(productId: string): void {
    if (!productId) return;
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let ids: string[] = stored ? JSON.parse(stored) : [];
      ids = ids.filter((id) => id !== productId);
      ids.unshift(productId);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids.slice(0, 12)));
    } catch {}
  },

  /**
   * Get recently viewed product objects
   */
  getRecentlyViewedProducts(allProducts: Product[] = MOCK_PRODUCTS): Product[] {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const ids: string[] = stored ? JSON.parse(stored) : [];
      return ids
        .map((id) => allProducts.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
    } catch {
      return [];
    }
  },

  /**
   * Clear recently viewed
   */
  clearRecentlyViewed(): void {
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch {}
  },

  /**
   * "You May Also Like" - Products in same department or related tags
   */
  getYouMayAlsoLike(targetProduct: Product, allProducts: Product[] = MOCK_PRODUCTS, count = 4): Product[] {
    return allProducts
      .filter((p) => p.id !== targetProduct.id && p.category === targetProduct.category)
      .slice(0, count);
  },

  /**
   * "Similar Products" - Same department with close price range (+-35%)
   */
  getSimilarProducts(targetProduct: Product, allProducts: Product[] = MOCK_PRODUCTS, count = 4): Product[] {
    const minP = targetProduct.price * 0.65;
    const maxP = targetProduct.price * 1.35;
    const matching = allProducts.filter(
      (p) => p.id !== targetProduct.id && p.category === targetProduct.category && p.price >= minP && p.price <= maxP
    );

    if (matching.length >= count) return matching.slice(0, count);

    // Fallback if price range is narrow
    return allProducts.filter((p) => p.id !== targetProduct.id && p.category === targetProduct.category).slice(0, count);
  },

  /**
   * "Frequently Bought Together" - Complementary products from other departments
   */
  getFrequentlyBoughtTogether(targetProduct: Product, allProducts: Product[] = MOCK_PRODUCTS): Product[] {
    // Pick 1-2 complementary accessories from another department
    const complements = allProducts.filter((p) => p.id !== targetProduct.id && p.category !== targetProduct.category);
    return complements.slice(0, 2);
  },

  /**
   * "From This Seller" - Other catalog items by the same merchant
   */
  getFromThisSeller(sellerId: string, currentProductId: string, allProducts: Product[] = MOCK_PRODUCTS, count = 4): Product[] {
    return allProducts
      .filter((p) => p.sellerId === sellerId && p.id !== currentProductId && (p.stock || p.stockCount || 0) > 0)
      .slice(0, count);
  },

  /**
   * Wishlist-Related Recommendations
   */
  getWishlistRelated(wishlistProductIds: string[], allProducts: Product[] = MOCK_PRODUCTS, count = 4): Product[] {
    if (!wishlistProductIds || wishlistProductIds.length === 0) return [];
    const wishlistItems = allProducts.filter((p) => wishlistProductIds.includes(p.id));
    const categories = new Set(wishlistItems.map((p) => p.category));
    
    return allProducts
      .filter((p) => !wishlistProductIds.includes(p.id) && categories.has(p.category) && (p.stock || p.stockCount || 0) > 0)
      .slice(0, count);
  },

  /**
   * Personalized Homepage Recommendations with Transparent Reasoning
   */
  getPersonalizedRecommendations(options: {
    viewedIds?: string[];
    wishlistIds?: string[];
    allProducts?: Product[];
    count?: number;
  }): { product: Product; reason: string }[] {
    const { viewedIds = [], wishlistIds = [], allProducts = MOCK_PRODUCTS, count = 6 } = options;
    const results: { product: Product; reason: string }[] = [];
    const seenIds = new Set<string>();

    // 1. Based on wishlist categories
    if (wishlistIds.length > 0) {
      const wishlisted = allProducts.filter((p) => wishlistIds.includes(p.id));
      const favCategory = wishlisted[0]?.category;
      if (favCategory) {
        const matches = allProducts.filter(
          (p) => !wishlistIds.includes(p.id) && !seenIds.has(p.id) && p.category === favCategory && (p.stock || p.stockCount || 0) > 0
        );
        for (const m of matches.slice(0, 2)) {
          seenIds.add(m.id);
          results.push({ product: m, reason: `Matches your saved ${favCategory} collection` });
        }
      }
    }

    // 2. Based on recently viewed
    if (viewedIds.length > 0) {
      const lastViewed = allProducts.find((p) => p.id === viewedIds[0]);
      if (lastViewed) {
        const matches = allProducts.filter(
          (p) => !viewedIds.includes(p.id) && !seenIds.has(p.id) && p.category === lastViewed.category && (p.stock || p.stockCount || 0) > 0
        );
        for (const m of matches.slice(0, 2)) {
          seenIds.add(m.id);
          results.push({ product: m, reason: `Because you recently viewed ${lastViewed.title}` });
        }
      }
    }

    // 3. Editorial curated top-rated / trending fallbacks
    const fallback = allProducts.filter((p) => !seenIds.has(p.id) && (p.isTrending || (p.rating || 0) >= 4.5));
    for (const fb of fallback) {
      if (results.length >= count) break;
      seenIds.add(fb.id);
      results.push({ product: fb, reason: 'Curated trending favorite on MarketNest' });
    }

    return results;
  },

  /**
   * Track recommendation impression without duplicate spam
   */
  trackImpression(recommendationType: string, productId: string): void {
    try {
      const key = `marketnest_rec_imp_${recommendationType}_${productId}_${new Date().toISOString().slice(0, 10)}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      // Auditable telemetry entry
    } catch {}
  },

  /**
   * Track recommendation click
   */
  trackClick(recommendationType: string, productId: string): void {
    try {
      const key = `marketnest_rec_clk_${recommendationType}_${productId}_${new Date().toISOString().slice(0, 10)}`;
      sessionStorage.setItem(key, '1');
    } catch {}
  }
};
