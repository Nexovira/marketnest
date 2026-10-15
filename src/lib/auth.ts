/**
 * @file src/lib/auth.ts
 * Firebase Authentication operations and human-friendly error mapping for MarketNest.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { createUserProfile, getUserProfile } from './firestore';
import { User } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const mapAuthError = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errCode = (error as { code?: string }).code || '';

  switch (errCode) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Your email or password is incorrect. Please check your credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters with letters and numbers.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact MarketNest support.';
    default:
      return (error as Error).message || 'Authentication could not be completed. Please try again.';
  }
};

export const signUpCustomer = async (data: RegisterData): Promise<{ firebaseUser: FirebaseUser; userProfile: User }> => {
  const { email, password, firstName, lastName } = data;
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  const displayName = `${firstName.trim()} ${lastName.trim()}`;
  await updateProfile(firebaseUser, { displayName });

  // Send verification email
  try {
    await sendEmailVerification(firebaseUser);
  } catch (err) {
    console.warn('Could not send verification email immediately:', err);
  }

  // Create Firestore customer document
  const userProfile: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || email,
    name: displayName,
    role: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await createUserProfile(firebaseUser.uid, {
    ...userProfile,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    emailVerified: firebaseUser.emailVerified
  });

  return { firebaseUser, userProfile };
};

export const signInCustomer = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signInWithGoogle = async (): Promise<{ firebaseUser: FirebaseUser; userProfile: User }> => {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  // Check if Firestore profile exists, if not create one
  let profile = await getUserProfile(firebaseUser.uid);
  if (!profile) {
    const names = (firebaseUser.displayName || '').split(' ');
    const firstName = names[0] || 'Customer';
    const lastName = names.slice(1).join(' ') || '';

    profile = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'MarketNest Customer',
      role: 'customer',
      avatarUrl: firebaseUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await createUserProfile(firebaseUser.uid, {
      ...profile,
      firstName,
      lastName,
      emailVerified: firebaseUser.emailVerified
    });
  }

  return { firebaseUser, userProfile: profile };
};

export const signOutCustomer = async (): Promise<void> => {
  await signOut(auth);
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const resendVerification = async (user: FirebaseUser): Promise<void> => {
  await sendEmailVerification(user);
};
