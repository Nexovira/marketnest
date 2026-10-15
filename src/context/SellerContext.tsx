/**
 * @file src/context/SellerContext.tsx
 * State management for the MarketNest Seller Platform.
 * Manages store profile, seller products, orders, dashboard tabs, and storefront preview.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  getSellerProfile,
  getSellerProducts,
  getSellerOrders,
  saveProduct,
  updateProduct,
  archiveProduct,
  deleteProduct,
  updateSellerProfile,
  updateOrderStatus,
  slugify
} from '../lib/sellerFirestore';
import { Order, OrderStatus, Product, SellerDashboardTab, SellerProfile } from '../types';
import { MOCK_PRODUCTS } from '../data/mockData';
import { getAdminDataMode } from '../utils/dataMode';

// Initial default seed orders for realistic seller demo
const SAMPLE_SELLER_ORDERS: Order[] = [
  {
    id: 'ord_mn_84920',
    orderNumber: 'MN-2026-84920',
    customerId: 'cust_lekki_01',
    items: [
      {
        id: 'item_1',
        productId: 'prod_adire_01',
        productTitle: 'Hand-Dyed Indigo Adire Silk Kimono',
        sellerId: 'demo_seller',
        storeName: 'Alara Atelier',
        productImage: '/src/assets/images/hero_marketplace_lifestyle_1791134143019.jpg',
        unitPrice: 85000,
        quantity: 1,
        lineTotal: 85000
      }
    ],
    subtotal: 85000,
    deliveryFee: 3500,
    total: 88500,
    status: 'pending',
    paymentStatus: 'held_in_escrow',
    shippingAddress: {
      id: 'addr_1',
      fullName: 'Babatunde Adeyemi',
      phone: '+234 803 456 7890',
      street: '14 Admiralty Way, Lekki Phase 1',
      city: 'Lekki',
      state: 'Lagos',
      country: 'Nigeria'
    },
    deliverySpeed: 'lagos_sameday',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    estimatedDeliveryDate: 'Today by 5:00 PM'
  },
  {
    id: 'ord_mn_84812',
    orderNumber: 'MN-2026-84812',
    customerId: 'cust_ikoyi_02',
    items: [
      {
        id: 'item_2',
        productId: 'prod_leather_01',
        productTitle: 'Kano Tanned Full-Grain Leather Briefcase',
        sellerId: 'demo_seller',
        storeName: 'Alara Atelier',
        productImage: '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg',
        unitPrice: 145000,
        quantity: 1,
        lineTotal: 145000
      }
    ],
    subtotal: 145000,
    deliveryFee: 0,
    total: 145000,
    status: 'processing',
    paymentStatus: 'held_in_escrow',
    shippingAddress: {
      id: 'addr_2',
      fullName: 'Amina Bello',
      phone: '+234 812 987 6543',
      street: 'Plot 8 Glover Road',
      city: 'Ikoyi',
      state: 'Lagos',
      country: 'Nigeria'
    },
    deliverySpeed: 'lagos_24h',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    estimatedDeliveryDate: 'Tomorrow by 12:00 PM'
  },
  {
    id: 'ord_mn_84655',
    orderNumber: 'MN-2026-84655',
    customerId: 'cust_abuja_03',
    items: [
      {
        id: 'item_3',
        productId: 'prod_shea_01',
        productTitle: 'Pure Nilotica Shea Body Balm',
        sellerId: 'demo_seller',
        storeName: 'Alara Atelier',
        productImage: '/src/assets/images/editorial_beauty_glow_1791134175992.jpg',
        unitPrice: 24000,
        quantity: 2,
        lineTotal: 48000
      }
    ],
    subtotal: 48000,
    deliveryFee: 6500,
    total: 54500,
    status: 'dispatched',
    paymentStatus: 'held_in_escrow',
    shippingAddress: {
      id: 'addr_3',
      fullName: 'Dr. Chukwudi Okafor',
      phone: '+234 802 111 2233',
      street: '12 Mississippi Street, Maitama',
      city: 'Abuja FCT',
      state: 'Abuja FCT',
      country: 'Nigeria'
    },
    deliverySpeed: 'express_48h',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    estimatedDeliveryDate: 'Within 48 Hours'
  }
];

interface SellerContextType {
  sellerProfile: SellerProfile | null;
  isSeller: boolean;
  loading: boolean;
  activeDashboardTab: SellerDashboardTab;
  setActiveDashboardTab: (tab: SellerDashboardTab) => void;
  activeEditProductId: string | null;
  setActiveEditProductId: (id: string | null) => void;
  activeStorefrontSlug: string | null;
  setActiveStorefrontSlug: (slug: string | null) => void;
  sellerProducts: Product[];
  sellerOrders: Order[];
  refreshSellerProfile: () => Promise<void>;
  refreshSellerProducts: () => Promise<void>;
  refreshSellerOrders: () => Promise<void>;
  addNewProduct: (product: Product) => Promise<void>;
  editProduct: (productId: string, data: Partial<Product>) => Promise<void>;
  archiveProductById: (productId: string) => Promise<void>;
  deleteProductById: (productId: string) => Promise<void>;
  updateOrderDispatch: (orderId: string, status: OrderStatus) => Promise<void>;
  updateStoreSettings: (data: Partial<SellerProfile>) => Promise<void>;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export const SellerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, profile } = useAuth();

  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDashboardTab, setActiveDashboardTab] = useState<SellerDashboardTab>('overview');
  const [activeEditProductId, setActiveEditProductId] = useState<string | null>(null);
  const [activeStorefrontSlug, setActiveStorefrontSlug] = useState<string | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>(SAMPLE_SELLER_ORDERS);

  // Load seller profile when authenticated user changes
  const loadSellerProfile = async () => {
    if (!firebaseUser) {
      setSellerProfile(null);
      setSellerProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetched = await getSellerProfile(firebaseUser.uid);
      const isSeedMode = getAdminDataMode() === 'seed';

      if (fetched) {
        setSellerProfile(fetched);
        // Load real seller products from firestore
        const products = await getSellerProducts(firebaseUser.uid);
        if (products && products.length > 0) {
          setSellerProducts(products);
        } else if (isSeedMode) {
          // Provide seed products matching this store ONLY in explicit seed mode
          const seedProducts: Product[] = MOCK_PRODUCTS.slice(0, 4).map((p, idx) => ({
            ...p,
            id: `prod_seller_${idx + 1}`,
            sellerId: firebaseUser.uid,
            seller: {
              ...p.seller,
              id: fetched.id,
              name: fetched.storeName,
              slug: fetched.storeSlug,
              city: fetched.city,
              state: fetched.state
            },
            status: 'active'
          }));
          setSellerProducts(seedProducts);
        } else {
          setSellerProducts([]);
        }

        // Load real seller orders from firestore
        const orders = await getSellerOrders(firebaseUser.uid);
        if (orders && orders.length > 0) {
          setSellerOrders(orders);
        } else if (isSeedMode) {
          setSellerOrders(SAMPLE_SELLER_ORDERS);
        } else {
          setSellerOrders([]);
        }
      } else if (isSeedMode && (profile?.role === 'seller' || profile?.role === 'admin')) {
        // Fallback demo merchant profile ONLY in explicit seed sandbox mode
        const defaultProfile: SellerProfile = {
          id: `sp_${firebaseUser.uid}`,
          userId: firebaseUser.uid,
          storeName: profile?.displayName ? `${profile.displayName}'s Studio` : 'Alara Atelier',
          storeSlug: slugify(profile?.displayName || 'alara-atelier'),
          tagline: 'Artisanal Luxury & Contemporary Nigerian Craftsmanship',
          description: 'Contemporary Nigerian lifestyle and curated artisan goods crafted in Lagos. Verified merchant offering same-day escrow dispatch and authenticity guarantees.',
          category: 'fashion',
          logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          bannerUrl: '/src/assets/images/hero_marketplace_lifestyle_1791134143019.jpg',
          phone: '+234 803 123 4567',
          email: firebaseUser.email || 'merchant@marketnest.ng',
          city: 'Victoria Island',
          state: 'Lagos',
          country: 'Nigeria',
          status: 'active',
          verified: true,
          rating: 4.9,
          reviewCount: 38,
          productCount: 4,
          shipsWithinHours: 24,
          customization: {
            brandColor: '#0E8F5A',
            headerLayout: 'editorial',
            announcement: {
              enabled: true,
              text: 'Special Offer: Free Lagos Express Delivery on orders over ₦50,000 | 100% Escrow Protected',
              bgColor: '#0E8F5A',
              textColor: '#FFFFFF'
            },
            policies: {
              returns: '7-day inspection return window for unwashed, tag-intact items under MarketNest Buyer Protection Escrow.',
              shipping: 'Same-day dispatch across Lagos. Nationwide GIG Logistics delivery within 48-72 hours with end-to-end tracking.',
              warranty: '100% Genuine Nigerian Craftsmanship & Authenticity Guarantee.'
            },
            socialLinks: {
              instagram: '@alara.atelier',
              twitter: '@alara_ng',
              whatsapp: '+2348031234567'
            },
            contact: {
              phone: '+234 803 123 4567',
              email: firebaseUser.email || 'contact@alara.ng',
              whatsapp: '+2348031234567',
              address: 'Plot 14 Victoria Island, Lagos State',
              hours: 'Mon - Sat: 9:00 AM - 7:00 PM WAT'
            },
            featuredProductIds: ['prod_seller_1', 'prod_seller_2'],
            pinnedCategories: ['fashion', 'bags', 'shoes']
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSellerProfile(defaultProfile);

        // Seed products in seed mode
        const seedProducts: Product[] = MOCK_PRODUCTS.slice(0, 4).map((p, idx) => ({
          ...p,
          id: `prod_seller_${idx + 1}`,
          sellerId: firebaseUser.uid,
          seller: {
            ...p.seller,
            id: defaultProfile.id,
            name: defaultProfile.storeName,
            slug: defaultProfile.storeSlug,
            city: defaultProfile.city,
            state: defaultProfile.state
          },
          status: 'active'
        }));
        setSellerProducts(seedProducts);
        setSellerOrders(SAMPLE_SELLER_ORDERS);
      } else {
        setSellerProfile(null);
        setSellerProducts([]);
        setSellerOrders([]);
      }
    } catch (err) {
      console.error('Error loading seller profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerProfile();
  }, [firebaseUser]);

  const refreshSellerProfile = async () => {
    if (firebaseUser) {
      const fetched = await getSellerProfile(firebaseUser.uid);
      setSellerProfile(fetched);
    }
  };

  const refreshSellerProducts = async () => {
    if (firebaseUser) {
      const products = await getSellerProducts(firebaseUser.uid);
      if (products && products.length > 0) {
        setSellerProducts(products);
      }
    }
  };

  const refreshSellerOrders = async () => {
    if (firebaseUser) {
      const orders = await getSellerOrders(firebaseUser.uid);
      if (orders && orders.length > 0) {
        setSellerOrders(orders);
      }
    }
  };

  const addNewProduct = async (product: Product) => {
    try {
      await saveProduct(product);
    } catch (e) {
      console.warn('Saved locally in state fallback', e);
    }
    setSellerProducts((prev) => [product, ...prev]);
  };

  const editProduct = async (productId: string, data: Partial<Product>) => {
    try {
      await updateProduct(productId, data);
    } catch (e) {
      console.warn('Updated locally in state fallback', e);
    }
    setSellerProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    );
  };

  const archiveProductById = async (productId: string) => {
    try {
      await archiveProduct(productId);
    } catch (e) {
      console.warn('Archived locally in state fallback', e);
    }
    setSellerProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: 'archived' } : p))
    );
  };

  const deleteProductById = async (productId: string) => {
    try {
      await deleteProduct(productId);
    } catch (e) {
      console.warn('Deleted locally in state fallback', e);
    }
    setSellerProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateOrderDispatch = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (e) {
      console.warn('Order status updated locally', e);
    }
    setSellerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const updateStoreSettings = async (data: Partial<SellerProfile>) => {
    if (!firebaseUser || !sellerProfile) return;
    try {
      await updateSellerProfile(firebaseUser.uid, data);
    } catch (e) {
      console.warn('Profile updated locally', e);
    }
    setSellerProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const isSeller =
    sellerProfile?.status === 'active' ||
    profile?.role === 'seller';

  return (
    <SellerContext.Provider
      value={{
        sellerProfile,
        isSeller,
        loading,
        activeDashboardTab,
        setActiveDashboardTab,
        activeEditProductId,
        setActiveEditProductId,
        activeStorefrontSlug,
        setActiveStorefrontSlug,
        sellerProducts,
        sellerOrders,
        refreshSellerProfile,
        refreshSellerProducts,
        refreshSellerOrders,
        addNewProduct,
        editProduct,
        archiveProductById,
        deleteProductById,
        updateOrderDispatch,
        updateStoreSettings
      }}
    >
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = (): SellerContextType => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};
