/**
 * @file src/context/MarketContext.tsx
 * Global state store for MarketNest Phase 4 Core Commerce Engine.
 * Integrates Cart, Guest Cart Merger, Wishlist, Firestore cloud sync, Routing, Modals, and Toast alerts.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_PRODUCTS } from '../data/mockData';
import {
  AccountTab,
  ActivePage,
  CartItem,
  CategoryId,
  FilterState,
  Order,
  Product,
  ProductVariant,
  SortOption,
  ToastMessage,
  CouponValidationResult,
  DeliveryMethodId
} from '../types';
import { useAuth } from './AuthContext';
import {
  getUserWishlist,
  addWishlistItem,
  removeWishlistItem
} from '../lib/firestore';
import {
  loadGuestCart,
  saveGuestCart,
  clearGuestCart,
  loadUserCart,
  saveUserCartItem,
  removeUserCartItem,
  clearUserCart as clearUserCartInDb,
  mergeGuestCartWithUserCart
} from '../services/cartService';
import { calculateDelivery, FREE_DELIVERY_THRESHOLD } from '../services/deliveryService';
import { captureReferralFromUrl } from '../services/affiliate/affiliateAttributionService';

const INITIAL_FILTERS: FilterState = {
  category: 'all',
  minPrice: 0,
  maxPrice: 200000,
  minRating: 0,
  verifiedOnly: false,
  madeInNigeriaOnly: false,
  deliverySpeed: 'all',
  inStockOnly: false
};

interface NavigationParams {
  productId?: string;
  storeId?: string;
  orderId?: string;
  category?: CategoryId | 'all';
  search?: string;
  tab?: AccountTab;
  redirect?: string;
}

interface MarketContextType {
  // Navigation & Page State
  activePage: ActivePage;
  selectedProductId: string | null;
  selectedStoreId: string | null;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  activeAccountTab: AccountTab;
  setActiveAccountTab: (tab: AccountTab) => void;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (redirect: string | null) => void;
  navigateTo: (page: ActivePage, params?: NavigationParams) => void;

  // Search & Catalog Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;

  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeDeliveryThreshold: number;
  isEligibleForFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;

  // Order Flow State
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;

  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Quick View Modal
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  // Guest Wishlist Prompt Modal
  showGuestAuthModal: boolean;
  setShowGuestAuthModal: (show: boolean) => void;

  // Phase 8: Product Comparison (Up to 4 items)
  compareProductIds: string[];
  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;

  // Phase 8: Saved for Later Items
  savedForLaterIds: string[];
  saveForLater: (productId: string) => void;
  removeFromSaved: (productId: string) => void;
  isSavedForLater: (productId: string) => boolean;

  // Phase 8: Promotions & Coupon System
  appliedCoupon: CouponValidationResult | null;
  setAppliedCoupon: (coupon: CouponValidationResult | null) => void;
  cartDiscount: number;

  // Phase 8: Delivery Method Options
  selectedDeliveryMethod: DeliveryMethodId;
  setSelectedDeliveryMethod: (method: DeliveryMethodId) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (
    title: string,
    description?: string,
    type?: 'success' | 'info' | 'warning' | 'error',
    action?: { label: string; onClick: () => void }
  ) => void;
  removeToast: (id: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'marketnest_wishlist_v2';

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, isAuthenticated } = useAuth();

  // Page Routing State with URL callback detection
  const [activePage, setActivePage] = useState<ActivePage>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const search = window.location.search;
      if (pathname.includes('/payment/callback') || search.includes('reference=') || search.includes('trxref=')) {
        return 'payment-callback';
      }
      if (pathname.includes('/payment/success')) {
        return 'payment-success';
      }
      if (pathname.includes('/payment/failed')) {
        return 'payment-failed';
      }
      if (pathname.includes('/payment/pending')) {
        return 'payment-pending';
      }
      // Phase 6 Affiliate Routes
      if (pathname.includes('/affiliate/apply')) {
        return 'affiliate-apply';
      }
      if (pathname.includes('/affiliate/dashboard')) {
        return 'affiliate-dashboard';
      }
      if (pathname.includes('/affiliate/links')) {
        return 'affiliate-links';
      }
      if (pathname.includes('/affiliate/earnings')) {
        return 'affiliate-earnings';
      }
      if (pathname.includes('/affiliate/analytics')) {
        return 'affiliate-analytics';
      }
      if (pathname.includes('/affiliate/settings')) {
        return 'affiliate-settings';
      }
      if (pathname.includes('/affiliate')) {
        return 'affiliate';
      }
      if (pathname.startsWith('/admin')) {
        return 'admin';
      }
      if (pathname.includes('/search')) {
        return 'search';
      }
      if (pathname.includes('/compare')) {
        return 'compare';
      }
    }
    return 'home';
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeAccountTab, setActiveAccountTab] = useState<AccountTab>('overview');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('reference') || params.get('trxref');
      if (ref) return ref;
    }
    return '';
  });
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');

  // Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showGuestAuthModal, setShowGuestAuthModal] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Phase 4 Commerce State
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Cart State with Guest Cart loading
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const guestItems = loadGuestCart();
    if (guestItems && guestItems.length > 0) {
      return guestItems;
    }
    // Fallback initial starter demo item if brand new
    const initialProduct = MOCK_PRODUCTS[0];
    return [
      {
        id: `${initialProduct.id}-default`,
        productId: initialProduct.id,
        sellerId: initialProduct.sellerId || initialProduct.seller?.id || 'seller_01',
        storeId: initialProduct.seller?.id || 'store_01',
        name: initialProduct.title || initialProduct.name || 'Adire Silk Kimono',
        image: initialProduct.images?.[0] || '',
        price: initialProduct.price,
        unitPrice: initialProduct.price,
        quantity: 1,
        lineTotal: initialProduct.price,
        addedAt: new Date().toISOString(),
        product: initialProduct
      }
    ];
  });

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore parse errors
    }
    return ['prod_001', 'prod_003'];
  });

  // Phase 8: Product Comparison State (Max 4 items)
  const [compareProductIds, setCompareProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('marketnest_compare_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Phase 8: Saved for Later Items
  const [savedForLaterIds, setSavedForLaterIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('marketnest_saved_later_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Phase 8: Promotions & Applied Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);

  // Phase 8: Selected Delivery Method Option
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethodId>('standard');

  // Persist Comparison IDs
  useEffect(() => {
    try {
      localStorage.setItem('marketnest_compare_ids', JSON.stringify(compareProductIds));
    } catch {}
  }, [compareProductIds]);

  // Persist Saved For Later IDs
  useEffect(() => {
    try {
      localStorage.setItem('marketnest_saved_later_ids', JSON.stringify(savedForLaterIds));
    } catch {}
  }, [savedForLaterIds]);

  // When user logs in, merge guest cart with Firestore cart
  useEffect(() => {
    if (firebaseUser) {
      const currentGuestItems = loadGuestCart();
      mergeGuestCartWithUserCart(firebaseUser.uid, currentGuestItems)
        .then((merged) => {
          if (merged && merged.length > 0) {
            setCartItems(merged);
          }
        })
        .catch((err) => console.warn('Could not merge user cart:', err));

      // Sync wishlist from Firestore
      getUserWishlist(firebaseUser.uid)
        .then((cloudIds) => {
          if (cloudIds && cloudIds.length > 0) {
            setWishlistIds((prev) => Array.from(new Set([...prev, ...cloudIds])));
          }
        })
        .catch((err) => console.warn('Could not sync cloud wishlist:', err));
    }
  }, [firebaseUser]);

  // Sync cart changes to localStorage (for guests) and Firestore (for logged in users)
  useEffect(() => {
    if (!firebaseUser) {
      saveGuestCart(cartItems);
    }
  }, [cartItems, firebaseUser]);

  // Sync guest wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage errors
    }
  }, [wishlistIds]);

  // Phase 6: Capture and persist incoming affiliate referrals on initial visit
  useEffect(() => {
    captureReferralFromUrl().catch((err) =>
      console.warn('[Affiliate] Referral capture notice:', err)
    );
  }, []);

  // Toast Helpers
  const showToast = (
    title: string,
    description?: string,
    type: ToastMessage['type'] = 'success',
    action?: { label: string; onClick: () => void }
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { id, title, description, type, action };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Route protection & navigation controller
  const navigateTo = (page: ActivePage, params?: NavigationParams) => {
    // Route Protection for customer account
    if (page === 'account' && !isAuthenticated) {
      setRedirectAfterLogin('account');
      setActivePage('login');
      showToast('Sign In Required', 'Please sign in to view your account dashboard.', 'info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Route Protection for affiliate dashboard and internal affiliate routes
    const affiliateProtectedPages: ActivePage[] = [
      'affiliate-dashboard',
      'affiliate-links',
      'affiliate-earnings',
      'affiliate-analytics',
      'affiliate-settings'
    ];
    if (affiliateProtectedPages.includes(page) && !isAuthenticated) {
      setRedirectAfterLogin(page);
      setActivePage('login');
      showToast('Sign In Required', 'Please sign in to access your affiliate partner dashboard.', 'info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'support') {
      setActiveAccountTab('support');
      setActivePage('account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (params?.productId) {
      setSelectedProductId(params.productId);
    }
    if (params?.storeId) {
      setSelectedStoreId(params.storeId);
    }
    if (params?.orderId) {
      setSelectedOrderId(params.orderId);
    }
    if (params?.category) {
      setFilters((prev) => ({ ...prev, category: params.category! }));
    }
    if (params?.search !== undefined) {
      setSearchQuery(params.search);
    }
    if (params?.tab) {
      setActiveAccountTab(params.tab);
    }
    if (params?.redirect) {
      setRedirectAfterLogin(params.redirect);
    }
  };

  // Filter modifiers
  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
  };

  // -------------------------------------------------------------------------
  // Cart Actions with Strict Stock Checking and Firestore Synchronization
  // -------------------------------------------------------------------------

  const addToCart = (product: Product, quantity = 1, variant?: ProductVariant): boolean => {
    const availableStock =
      product.stockCount !== undefined ? product.stockCount : product.stock !== undefined ? product.stock : 10;

    // Check if out of stock
    if (availableStock <= 0 || product.status === 'outOfStock' || product.inStock === false) {
      showToast('Out of Stock', `"${product.title || product.name}" is currently sold out.`, 'error');
      return false;
    }

    const variantKey = variant ? variant.id : 'default';
    const uniqueItemId = `${product.id}-${variantKey}`;
    const unitPrice = variant ? variant.price : product.price;

    const existingItem = cartItems.find((item) => item.id === uniqueItemId);
    const existingQty = existingItem ? existingItem.quantity : 0;
    const requestedTotal = existingQty + quantity;

    // Enforce available stock boundary
    if (requestedTotal > availableStock) {
      showToast(
        'Stock Limit Reached',
        `Only ${availableStock} available.`,
        'warning'
      );
      return false;
    }

    const updatedItem: CartItem = {
      id: uniqueItemId,
      productId: product.id,
      sellerId: product.sellerId || product.seller?.id || 'seller_default',
      storeId: product.seller?.id,
      name: product.title || product.name || 'Product',
      image: product.images?.[0] || '',
      price: unitPrice,
      unitPrice,
      quantity: requestedTotal,
      selectedVariant: variant,
      lineTotal: requestedTotal * unitPrice,
      addedAt: existingItem?.addedAt || new Date().toISOString(),
      product
    };

    setCartItems((prevItems) => {
      const exists = prevItems.some((i) => i.id === uniqueItemId);
      if (exists) {
        return prevItems.map((i) => (i.id === uniqueItemId ? updatedItem : i));
      }
      return [...prevItems, updatedItem];
    });

    // Cloud sync for authenticated user
    if (firebaseUser) {
      saveUserCartItem(firebaseUser.uid, updatedItem);
    }

    showToast(
      'Added to your cart',
      `${product.title || product.name}${variant ? ` (${variant.name})` : ''}`,
      'success',
      {
        label: 'View Cart',
        onClick: () => navigateTo('cart')
      }
    );
    return true;
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    if (firebaseUser) {
      removeUserCartItem(firebaseUser.uid, itemId);
    }
    showToast('Item Removed', 'The product was removed from your cart.', 'info');
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const existing = cartItems.find((i) => i.id === itemId);
    if (!existing) return;

    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const availableStock =
      existing.product?.stockCount !== undefined
        ? existing.product.stockCount
        : existing.product?.stock || 10;

    if (newQuantity > availableStock) {
      showToast('Quantity Exceeded', `Only ${availableStock} available.`, 'warning');
      return;
    }

    const updatedItem: CartItem = {
      ...existing,
      quantity: newQuantity,
      lineTotal: newQuantity * existing.unitPrice
    };

    setCartItems((prev) => prev.map((item) => (item.id === itemId ? updatedItem : item)));

    if (firebaseUser) {
      saveUserCartItem(firebaseUser.uid, updatedItem);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    clearGuestCart();
    if (firebaseUser) {
      clearUserCartInDb(firebaseUser.uid);
    }
  };

  // Authoritative Delivery and Total Calculations via deliveryService & Promotions
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const deliveryResult = calculateDelivery({
    items: cartItems,
    destinationState: 'Lagos'
  });

  let computedDeliveryFee = cartItems.length > 0 ? deliveryResult.deliveryFee : 0;
  if (selectedDeliveryMethod === 'express') {
    computedDeliveryFee = 5000;
  } else if (selectedDeliveryMethod === 'pickup') {
    computedDeliveryFee = 800;
  }

  const cartDeliveryFee = computedDeliveryFee;
  const cartDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartDeliveryFee);
  const isEligibleForFreeDelivery = deliveryResult.isEligibleForFreeDelivery;
  const amountNeededForFreeDelivery = deliveryResult.amountNeededForFreeDelivery;

  // Comparison Handlers (Max 4 items)
  const addToCompare = (productId: string): boolean => {
    if (compareProductIds.includes(productId)) {
      showToast('Already in Tray', 'This item is already added to comparison.', 'info');
      return false;
    }
    if (compareProductIds.length >= 4) {
      showToast('Maximum Reached', 'You can compare up to 4 items side-by-side.', 'warning');
      return false;
    }
    setCompareProductIds((prev) => [...prev, productId]);
    const p = MOCK_PRODUCTS.find((it) => it.id === productId);
    showToast('Added to Compare', `"${p?.title || 'Product'}" added to comparison.`, 'success', {
      label: 'View Compare',
      onClick: () => navigateTo('compare')
    });
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const clearCompare = () => {
    setCompareProductIds([]);
  };

  const isComparing = (productId: string) => compareProductIds.includes(productId);

  // Saved for Later Handlers
  const saveForLater = (productId: string) => {
    if (!savedForLaterIds.includes(productId)) {
      setSavedForLaterIds((prev) => [...prev, productId]);
      const p = MOCK_PRODUCTS.find((it) => it.id === productId);
      showToast('Saved for Later', `"${p?.title || 'Item'}" saved for later.`, 'success');
    }
  };

  const removeFromSaved = (productId: string) => {
    setSavedForLaterIds((prev) => prev.filter((id) => id !== productId));
  };

  const isSavedForLater = (productId: string) => savedForLaterIds.includes(productId);

  // Wishlist actions (optimistic UI + Firestore sync when authenticated)
  const toggleWishlist = async (productId: string) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    const exists = wishlistIds.includes(productId);

    // Optimistic state update
    if (exists) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      showToast('Saved Item Removed', `${product?.title || 'Item'} removed from your saved items.`, 'info');
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      showToast('Saved to Wishlist', `${product?.title || 'Item'} added to your saved items.`, 'success');
      if (!isAuthenticated) {
        setShowGuestAuthModal(true);
      }
    }

    // Cloud sync if authenticated
    if (firebaseUser) {
      try {
        if (exists) {
          await removeWishlistItem(firebaseUser.uid, productId);
        } else {
          await addWishlistItem(firebaseUser.uid, productId);
        }
      } catch (err) {
        console.error('Failed to sync wishlist with cloud:', err);
      }
    }
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  // Quick View Modal
  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  return (
    <MarketContext.Provider
      value={{
        activePage,
        selectedProductId,
        selectedStoreId,
        selectedOrderId,
        setSelectedOrderId,
        activeAccountTab,
        setActiveAccountTab,
        redirectAfterLogin,
        setRedirectAfterLogin,
        navigateTo,

        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        resetFilters,
        sortOption,
        setSortOption,

        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartDeliveryFee,
        cartTotal,
        cartItemCount,
        isCartOpen,
        setIsCartOpen,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        isEligibleForFreeDelivery,
        amountNeededForFreeDelivery,

        lastCreatedOrder,
        setLastCreatedOrder,

        wishlistIds,
        toggleWishlist,
        isWishlisted,
        wishlistCount: wishlistIds.length,
        isWishlistOpen,
        setIsWishlistOpen,

        quickViewProduct,
        openQuickView,
        closeQuickView,

        showGuestAuthModal,
        setShowGuestAuthModal,

        // Phase 8 properties
        compareProductIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,

        savedForLaterIds,
        saveForLater,
        removeFromSaved,
        isSavedForLater,

        appliedCoupon,
        setAppliedCoupon,
        cartDiscount,

        selectedDeliveryMethod,
        setSelectedDeliveryMethod,

        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
