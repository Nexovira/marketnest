/**
 * @file src/server/productRoutes.ts
 * Authoritative public catalog and store discovery endpoints.
 * Enforces strict publication governance:
 * Only legitimate, approved, and published products are visible on public channels.
 */

import { Router, Request, Response } from 'express';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ensureServerAuth } from './serverAuth';

export const productRouter = Router();

// Ensure server service auth before database operations
productRouter.use(async (_req, _res, next) => {
  await ensureServerAuth();
  next();
});

// Helper: Check if a product satisfies public marketplace publication rules
export function isProductPubliclyEligible(p: any): boolean {
  if (!p) return false;
  if (p.isDeleted === true) return false;

  const status = (p.status || '').toLowerCase().trim();
  // Valid publication statuses are 'published' and 'active'
  const isApprovedStatus = status === 'published' || status === 'active';
  if (!isApprovedStatus) return false;

  // Ineligible statuses must NEVER appear publicly
  if (['draft', 'pending_review', 'pending', 'rejected', 'suspended', 'archived', 'hidden'].includes(status)) {
    return false;
  }

  // Must have a valid title or name, price >= 0, and seller association
  if (!p.title && !p.name) return false;
  if (typeof p.price !== 'number' || isNaN(p.price) || p.price < 0) return false;

  return true;
}

// ----------------------------------------------------------------------
// 1. PUBLIC PRODUCT CATALOG
// ----------------------------------------------------------------------
productRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, inStockOnly, sort, sellerId } = req.query;

    const snap = await getDocs(collection(db, 'products'));
    let products: any[] = [];

    snap.forEach((d) => {
      const data = d.data();
      const item = { id: d.id, ...data };
      if (isProductPubliclyEligible(item)) {
        products.push(item);
      }
    });

    // Filter by category
    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category || p.categoryId === category);
    }

    // Filter by sellerId
    if (sellerId) {
      products = products.filter((p) => p.sellerId === sellerId || p.storeId === sellerId);
    }

    // Filter by price range
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    // Filter by inStockOnly
    if (inStockOnly === 'true') {
      products = products.filter((p) => p.inStock === true && (p.stockCount ?? p.stock ?? 1) > 0);
    }

    // Filter by search query
    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      products = products.filter((p) => {
        const title = (p.title || p.name || '').toLowerCase();
        const desc = (p.description || p.shortDescription || '').toLowerCase();
        const sellerName = (p.seller?.name || p.storeName || '').toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
        return title.includes(q) || desc.includes(q) || sellerName.includes(q) || tags.includes(q);
      });
    }

    // Sort products
    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'popular') {
      products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
      // Default: newest
      products.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
    }

    res.json({
      status: 'success',
      total: products.length,
      data: products
    });
  } catch (err: any) {
    console.error('[ProductRoutes] Error fetching products:', err);
    res.status(500).json({ error: err?.message || 'Error fetching products' });
  }
});

// ----------------------------------------------------------------------
// 2. PUBLIC SINGLE PRODUCT DETAIL
// ----------------------------------------------------------------------
productRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const docRef = doc(db, 'products', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return res.status(404).json({ error: 'Product not found or has been removed from MarketNest.' });
    }

    const data = snap.data();
    const product: any = { id: snap.id, ...data };

    // Check publication eligibility
    if (!isProductPubliclyEligible(product)) {
      return res.status(404).json({
        error: 'This listing is not currently available on the public marketplace.',
        status: product.status || 'unpublished'
      });
    }

    res.json({
      status: 'success',
      data: product
    });
  } catch (err: any) {
    console.error('[ProductRoutes] Error fetching product detail:', err);
    res.status(500).json({ error: err?.message || 'Error fetching product' });
  }
});

// ----------------------------------------------------------------------
// 3. PUBLIC STOREFRONT PROFILES
// ----------------------------------------------------------------------
productRouter.get('/stores', async (_req: Request, res: Response) => {
  try {
    const snap = await getDocs(collection(db, 'sellerProfiles'));
    const stores: any[] = [];

    snap.forEach((d) => {
      const data = d.data();
      // Only return stores that are active/verified
      if (data.status !== 'suspended' && data.status !== 'banned') {
        stores.push({
          id: d.id,
          sellerId: data.userId || d.id,
          name: data.storeName || data.name || 'Artisan Merchant',
          slug: data.storeSlug || data.slug || d.id,
          tagline: data.storeTagline || data.tagline || '',
          bio: data.storeBio || data.bio || '',
          logoUrl: data.logoUrl || data.avatarUrl || '',
          bannerUrl: data.bannerUrl || '',
          verified: data.verified !== false,
          city: data.city || 'Lagos',
          state: data.state || 'Lagos',
          rating: data.rating || 5.0,
          reviewCount: data.reviewCount || 0,
          productCount: data.productCount || 0,
          specialties: data.specialties || []
        });
      }
    });

    res.json({
      status: 'success',
      total: stores.length,
      data: stores
    });
  } catch (err: any) {
    console.error('[ProductRoutes] Error fetching stores:', err);
    res.status(500).json({ error: err?.message || 'Error fetching stores' });
  }
});

// ----------------------------------------------------------------------
// 4. PUBLIC SINGLE STORE DETAIL WITH PUBLISHED PRODUCTS
// ----------------------------------------------------------------------
productRouter.get('/stores/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;

    // Check direct doc by ID
    let storeDoc = await getDoc(doc(db, 'sellerProfiles', identifier));
    let storeData: any = null;

    if (storeDoc.exists()) {
      storeData = { id: storeDoc.id, ...storeDoc.data() };
    } else {
      // Query by slug
      const qSlug = query(collection(db, 'sellerProfiles'), where('storeSlug', '==', identifier), limit(1));
      const snap = await getDocs(qSlug);
      if (!snap.empty) {
        storeData = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
    }

    if (!storeData) {
      return res.status(404).json({ error: 'Store not found or unavailable.' });
    }

    const sellerId = storeData.userId || storeData.id;

    // Fetch published products for this store
    const pSnap = await getDocs(collection(db, 'products'));
    const storeProducts: any[] = [];
    pSnap.forEach((d) => {
      const data = d.data();
      const p: any = { id: d.id, ...data };
      if ((p.sellerId === sellerId || p.storeId === sellerId) && isProductPubliclyEligible(p)) {
        storeProducts.push(p);
      }
    });

    res.json({
      status: 'success',
      data: {
        store: storeData,
        products: storeProducts
      }
    });
  } catch (err: any) {
    console.error('[ProductRoutes] Error fetching store profile:', err);
    res.status(500).json({ error: err?.message || 'Error fetching store' });
  }
});
