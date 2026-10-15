/**
 * @file src/lib/firestore.ts
 * Firestore operations for Customer Profile, Addresses, Wishlist, and Orders.
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
import { Address, Order, User } from '../types';

export interface UserProfileData extends User {
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  storeId?: string;
}

// ----------------------------------------------------------------------
// User Profile Operations
// ----------------------------------------------------------------------

export const getUserProfile = async (userId: string): Promise<UserProfileData | null> => {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const createUserProfile = async (userId: string, data: Partial<UserProfileData>): Promise<void> => {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), {
      ...data,
      id: userId,
      role: 'customer',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfileData>): Promise<void> => {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// ----------------------------------------------------------------------
// Saved Shipping Addresses Operations
// ----------------------------------------------------------------------

export const getCustomerAddresses = async (userId: string): Promise<Address[]> => {
  const path = `users/${userId}/addresses`;
  try {
    const addressesRef = collection(db, 'users', userId, 'addresses');
    const snap = await getDocs(addressesRef);
    const addresses: Address[] = [];
    snap.forEach((doc) => {
      addresses.push({ id: doc.id, ...(doc.data() as Omit<Address, 'id'>) });
    });
    return addresses;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const saveCustomerAddress = async (
  userId: string,
  address: Omit<Address, 'id'> & { id?: string }
): Promise<Address> => {
  const addressId = address.id || `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const path = `users/${userId}/addresses/${addressId}`;

  try {
    const finalAddress: Address = {
      ...address,
      id: addressId
    };

    // If marked default, unset other defaults first
    if (address.isDefault) {
      const existing = await getCustomerAddresses(userId);
      for (const a of existing) {
        if (a.isDefault && a.id !== addressId) {
          await updateDoc(doc(db, 'users', userId, 'addresses', a.id), { isDefault: false });
        }
      }
    }

    await setDoc(doc(db, 'users', userId, 'addresses', addressId), {
      ...finalAddress,
      updatedAt: new Date().toISOString()
    });

    return finalAddress;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteCustomerAddress = async (userId: string, addressId: string): Promise<void> => {
  const path = `users/${userId}/addresses/${addressId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'addresses', addressId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const setDefaultCustomerAddress = async (userId: string, addressId: string): Promise<void> => {
  const path = `users/${userId}/addresses`;
  try {
    const existing = await getCustomerAddresses(userId);
    for (const a of existing) {
      await updateDoc(doc(db, 'users', userId, 'addresses', a.id), {
        isDefault: a.id === addressId
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// ----------------------------------------------------------------------
// Wishlist Operations
// ----------------------------------------------------------------------

export const getUserWishlist = async (userId: string): Promise<string[]> => {
  const path = `users/${userId}/wishlist`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'wishlist'));
    const ids: string[] = [];
    snap.forEach((doc) => {
      ids.push(doc.id);
    });
    return ids;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const addWishlistItem = async (userId: string, productId: string): Promise<void> => {
  const path = `users/${userId}/wishlist/${productId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'wishlist', productId), {
      productId,
      addedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const removeWishlistItem = async (userId: string, productId: string): Promise<void> => {
  const path = `users/${userId}/wishlist/${productId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'wishlist', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// ----------------------------------------------------------------------
// Orders Operations
// ----------------------------------------------------------------------

export const getCustomerOrders = async (userId: string): Promise<Order[]> => {
  const path = 'orders';
  try {
    const q = query(collection(db, 'orders'), where('customerId', '==', userId));
    const snap = await getDocs(q);
    const orders: Order[] = [];
    snap.forEach((doc) => {
      orders.push({ id: doc.id, ...(doc.data() as Omit<Order, 'id'>) });
    });
    return orders;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

// Aliases for unified checkout compatibility
export const getUserAddresses = getCustomerAddresses;
export const createAddress = saveCustomerAddress;
