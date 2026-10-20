/**
 * @file src/services/searchService.ts
 * Search suggestions, recent searches (localStorage), trending searches,
 * advanced faceted filtering, and deterministic sorting.
 */

import { Product, SearchSuggestion, SortOption } from '../types';

const RECENT_SEARCHES_KEY = 'marketnest_recent_searches';
const POPULAR_SEARCHES = [
  'Agbada',
  'Leather Boots',
  'Teak Desk',
  'Lagos Fashion',
  'Noise Canceling',
  'Ceramic Dinnerware',
  'Organic Shea Butter',
  'Silk Scarf'
];

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sellerId?: string;
  inStockOnly?: boolean;
  madeInNigeriaOnly?: boolean;
  hasDiscountOnly?: boolean;
  deliverySpeed?: 'all' | 'lagos_sameday' | 'lagos_24h' | 'express_48h';
}

export const searchService = {
  /**
   * Autocomplete search suggestions while typing
   */
  getSuggestions(queryText: string, products: Product[] = []): SearchSuggestion[] {
    if (!queryText || queryText.trim().length < 2) return [];
    const q = queryText.toLowerCase().trim();
    const suggestions: SearchSuggestion[] = [];

    // Title matching
    products.forEach((p) => {
      if (p.title.toLowerCase().includes(q)) {
        if (!suggestions.some((s) => s.query.toLowerCase() === p.title.toLowerCase())) {
          suggestions.push({
            query: p.title,
            category: p.category,
            type: 'product'
          });
        }
      }
    });

    // Tag and category matching
    const categories = ['fashion', 'electronics', 'home', 'beauty'];
    categories.forEach((cat) => {
      if (cat.includes(q)) {
        suggestions.push({
          query: cat.toUpperCase(),
          category: cat,
          type: 'category'
        });
      }
    });

    return suggestions.slice(0, 6);
  },

  /**
   * Get recent searches from client storage
   */
  getRecentSearches(): string[] {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : ['Agbada', 'Mechanical Keyboard', 'Leather'];
    } catch {
      return [];
    }
  },

  /**
   * Record recent search query
   */
  addRecentSearch(queryText: string): void {
    if (!queryText || queryText.trim().length < 2) return;
    try {
      const list = searchService.getRecentSearches().filter((s) => s.toLowerCase() !== queryText.toLowerCase());
      list.unshift(queryText.trim());
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list.slice(0, 8)));
    } catch {}
  },

  /**
   * Clear recent search history
   */
  clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  },

  /**
   * Trending popular searches
   */
  getPopularSearches(): string[] {
    return POPULAR_SEARCHES;
  },

  /**
   * Filter and sort products
   */
  filterAndSort(
    products: Product[],
    queryText: string,
    filters: SearchFilters,
    sort: SortOption = 'recommended'
  ): Product[] {
    let result = [...products];

    // Text search matching
    if (queryText && queryText.trim()) {
      const terms = queryText.toLowerCase().trim().split(/\s+/);
      result = result.filter((p) => {
        const fullText = `${p.title} ${p.description} ${p.category} ${p.storeName || ''}`.toLowerCase();
        return terms.every((t) => fullText.includes(t));
      });
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    // Min / Max price
    if (typeof filters.minPrice === 'number' && filters.minPrice > 0) {
      result = result.filter((p) => p.price >= (filters.minPrice as number));
    }
    if (typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
      result = result.filter((p) => p.price <= (filters.maxPrice as number));
    }

    // Rating
    if (typeof filters.minRating === 'number' && filters.minRating > 0) {
      result = result.filter((p) => (p.rating || 5) >= (filters.minRating as number));
    }

    // Seller ID
    if (filters.sellerId) {
      result = result.filter((p) => p.sellerId === filters.sellerId);
    }

    // In Stock
    if (filters.inStockOnly) {
      result = result.filter((p) => (p.stock ?? 10) > 0 && p.status !== 'outOfStock');
    }

    // Made in Nigeria
    if (filters.madeInNigeriaOnly) {
      result = result.filter((p) => p.tags?.includes('made-in-nigeria') || p.origin === 'Nigeria');
    }

    // Discount
    if (filters.hasDiscountOnly) {
      result = result.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    }

    // Delivery speed
    if (filters.deliverySpeed && filters.deliverySpeed !== 'all') {
      result = result.filter((p) => p.deliverySpeed === filters.deliverySpeed);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'recommended':
      default:
        // Featured and verified first
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.rating || 5) - (a.rating || 5);
        });
        break;
    }

    return result;
  }
};
