/**
 * @file src/services/cartService.ts
 * Cross-device cart synchronization and guest cart merger for MarketNest.
 * Handles localStorage persistence for guests, Firestore synchronization for authenticated users,
 * and intelligent duplicate resolution upon login.
 */

import {
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem } from '../types';

const GUEST_CART_KEY = 'marketnest_guest_cart_v1';

/**
 * Loads the guest cart from localStorage safely.
 */
export const loadGuestCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to load guest cart from localStorage:', e);
    return [];
  }
};

/**
 * Saves the guest cart to localStorage.
 */
export const saveGuestCart = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save guest cart to localStorage:', e);
  }
};

/**
 * Clears the guest cart from localStorage.
 */
export const clearGuestCart = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (e) {
    console.warn('Failed to clear guest cart:', e);
  }
};

/**
 * Loads the user's cart from Firestore: users/{userId}/cart/{itemId}
 */
export const loadUserCart = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartCol = collection(db, 'users', userId, 'cart');
    const snap = await getDocs(cartCol);
    const items: CartItem[] = [];
    snap.forEach((d) => {
      items.push({ id: d.id, ...(d.data() as Omit<CartItem, 'id'>) });
    });
    return items;
  } catch (error) {
    console.warn('Could not fetch cloud cart, falling back to local state:', error);
    return [];
  }
};

/**
 * Persists a single cart item to Firestore: users/{userId}/cart/{itemId}
 */
export const saveUserCartItem = async (userId: string, item: CartItem): Promise<void> => {
  try {
    const itemRef = doc(db, 'users', userId, 'cart', item.id);
    await setDoc(itemRef, {
      ...item,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to sync item to Firestore cart:', error);
  }
};

/**
 * Removes a cart item from Firestore.
 */
export const removeUserCartItem = async (userId: string, itemId: string): Promise<void> => {
  try {
    const itemRef = doc(db, 'users', userId, 'cart', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.warn('Failed to remove item from Firestore cart:', error);
  }
};

/**
 * Clears the entire user cart in Firestore.
 */
export const clearUserCart = async (userId: string): Promise<void> => {
  try {
    const cartCol = collection(db, 'users', userId, 'cart');
    const snap = await getDocs(cartCol);
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (error) {
    console.warn('Failed to clear Firestore cart:', error);
  }
};

/**
 * Merges guest cart with user cloud cart upon login.
 * Resolves duplicates by combining quantities and capping at available stock.
 */
export const mergeGuestCartWithUserCart = async (
  userId: string,
  guestItems: CartItem[]
): Promise<CartItem[]> => {
  if (!guestItems || guestItems.length === 0) {
    return await loadUserCart(userId);
  }

  const cloudItems = await loadUserCart(userId);
  const mergedMap = new Map<string, CartItem>();

  // Add existing cloud items
  cloudItems.forEach((ci) => {
    mergedMap.set(ci.id, ci);
  });

  // Merge guest items
  guestItems.forEach((gi) => {
    if (mergedMap.has(gi.id)) {
      const existing = mergedMap.get(gi.id)!;
      const combinedQuantity = existing.quantity + gi.quantity;
      const availableStock =
        gi.product?.stockCount !== undefined ? gi.product.stockCount : gi.product?.stock || 10;
      const finalQuantity = Math.min(availableStock, combinedQuantity);

      mergedMap.set(gi.id, {
        ...existing,
        quantity: finalQuantity,
        lineTotal: existing.unitPrice * finalQuantity
      });
    } else {
      mergedMap.set(gi.id, gi);
    }
  });

  const mergedList = Array.from(mergedMap.values());

  // Save merged result back to Firestore
  try {
    const batch = writeBatch(db);
    mergedList.forEach((item) => {
      const itemRef = doc(db, 'users', userId, 'cart', item.id);
      batch.set(itemRef, {
        ...item,
        updatedAt: new Date().toISOString()
      });
    });
    await batch.commit();
  } catch (e) {
    console.warn('Failed to commit merged cart to Firestore:', e);
  }

  // Clear guest cart once safely merged
  clearGuestCart();

  return mergedList;
};
