/**
 * @file src/lib/sellerFirestore.ts
 * Firestore operations for Seller Profiles, Products, Applications, and Seller Orders.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { Order, OrderStatus, Product, SellerApplication, SellerProfile } from '../types';

// Helper to sanitize and create URL-safe store slugs
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// ----------------------------------------------------------------------
// Seller Profile Operations
// ----------------------------------------------------------------------

export const getSellerProfile = async (userId: string): Promise<SellerProfile | null> => {
  const path = `sellerProfiles/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'sellerProfiles', userId));
    if (snap.exists()) {
      return snap.data() as SellerProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const getSellerProfileBySlug = async (slug: string): Promise<SellerProfile | null> => {
  const path = 'sellerProfiles';
  try {
    const q = query(collection(db, 'sellerProfiles'), where('storeSlug', '==', slug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as SellerProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const generateUniqueStoreSlug = async (storeName: string): Promise<string> => {
  const baseSlug = slugify(storeName) || 'store';
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await getSellerProfileBySlug(candidate);
    if (!existing) {
      return candidate;
    }
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
};

export const createSellerProfile = async (profile: SellerProfile): Promise<void> => {
  const path = `sellerProfiles/${profile.userId}`;
  try {
    await setDoc(doc(db, 'sellerProfiles', profile.userId), {
      ...profile,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateSellerProfile = async (userId: string, data: Partial<SellerProfile>): Promise<void> => {
  const path = `sellerProfiles/${userId}`;
  try {
    await updateDoc(doc(db, 'sellerProfiles', userId), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// ----------------------------------------------------------------------
// Seller Applications
// ----------------------------------------------------------------------

export const submitSellerApplication = async (app: SellerApplication): Promise<void> => {
  const path = `sellerApplications/${app.id}`;
  try {
    await setDoc(doc(db, 'sellerApplications', app.id), app);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

// ----------------------------------------------------------------------
// Seller Products Operations
// ----------------------------------------------------------------------

export const getSellerProducts = async (sellerId: string): Promise<Product[]> => {
  const path = 'products';
  try {
    const q = query(collection(db, 'products'), where('sellerId', '==', sellerId));
    const snap = await getDocs(q);
    const products: Product[] = [];
    snap.forEach((doc) => {
      const raw = doc.data() as any;
      const normalizedImages: string[] =
        Array.isArray(raw.images) && raw.images.length > 0
          ? raw.images
          : raw.imageUrl
          ? [raw.imageUrl]
          : [];
      const primaryImage = normalizedImages[0] || raw.imageUrl || '';

      products.push({
        ...raw,
        id: doc.id,
        images: normalizedImages,
        imageUrl: primaryImage
      } as Product);
    });
    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const getStorefrontProducts = async (sellerId: string): Promise<Product[]> => {
  const path = 'products';
  try {
    // Fetch products belonging to this seller
    const q = query(
      collection(db, 'products'),
      where('sellerId', '==', sellerId)
    );
    const snap = await getDocs(q);
    const products: Product[] = [];
    snap.forEach((doc) => {
      const raw = doc.data() as any;
      // Filter out archived products from storefront
      if (raw.status !== 'archived') {
        const normalizedImages: string[] =
          Array.isArray(raw.images) && raw.images.length > 0
            ? raw.images
            : raw.imageUrl
            ? [raw.imageUrl]
            : [];
        const primaryImage = normalizedImages[0] || raw.imageUrl || '';

        products.push({
          ...raw,
          id: doc.id,
          images: normalizedImages,
          imageUrl: primaryImage
        } as Product);
      }
    });

    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const saveProduct = async (product: Product): Promise<void> => {
  const path = `products/${product.id}`;
  try {
    const primaryImage = product.images?.[0] || product.imageUrl || '';
    await setDoc(doc(db, 'products', product.id), {
      ...product,
      imageUrl: primaryImage, // Maintain backward compatibility
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateProduct = async (productId: string, data: Partial<Product>): Promise<void> => {
  const path = `products/${productId}`;
  try {
    const payload: any = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    if (data.images && data.images.length > 0) {
      payload.imageUrl = data.images[0];
    }
    await updateDoc(doc(db, 'products', productId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const archiveProduct = async (productId: string): Promise<void> => {
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, 'products', productId), {
      status: 'archived',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// ----------------------------------------------------------------------
// Seller Orders Operations
// ----------------------------------------------------------------------

export const getSellerOrders = async (sellerId: string): Promise<Order[]> => {
  try {
    // 1. Query sellerOrders collection for this merchant
    const qSellerOrders = query(collection(db, 'sellerOrders'), where('sellerId', '==', sellerId));
    const snap = await getDocs(qSellerOrders);
    const orders: Order[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      orders.push({
        id: docSnap.id,
        orderNumber: data.orderNumber || docSnap.id,
        customerId: data.customerId || '',
        items: data.items || [],
        subtotal: data.subtotal || 0,
        deliveryFee: data.deliveryAmount || 0,
        total: (data.subtotal || 0) + (data.deliveryAmount || 0),
        status: data.status || 'pending',
        orderStatus: data.status || 'pending',
        paymentStatus: data.paymentStatus || 'unpaid',
        shippingAddress: data.shippingAddress || {
          id: 'addr_default',
          street: 'Lagos Delivery',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria'
        },
        deliverySpeed: data.deliverySpeed || 'lagos_24h',
        createdAt: data.createdAt || new Date().toISOString(),
        estimatedDeliveryDate: data.estimatedDeliveryDate || 'Within 24–48 Hours'
      });
    });

    if (orders.length > 0) {
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 2. Also check unified orders where sellerId is direct
    const qDirect = query(collection(db, 'orders'), where('sellerId', '==', sellerId));
    const snapDirect = await getDocs(qDirect);
    snapDirect.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
    });

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Could not query seller orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  try {
    // Try updating in sellerOrders
    const sellerOrderRef = doc(db, 'sellerOrders', orderId);
    const snap = await getDoc(sellerOrderRef);
    if (snap.exists()) {
      await updateDoc(sellerOrderRef, {
        status,
        updatedAt: new Date().toISOString()
      });
      return;
    }

    // Fallback to orders
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      orderStatus: status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `sellerOrders/${orderId}`);
  }
};
