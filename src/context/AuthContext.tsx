/**
 * @file src/context/AuthContext.tsx
 * Reusable authentication context tracking persistent Firebase session and customer profile.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  RegisterData,
  signInCustomer,
  signInWithGoogle,
  signOutCustomer,
  signUpCustomer,
  sendPasswordReset,
  resendVerification,
  mapAuthError
} from '../lib/auth';
import { getUserProfile, updateUserProfile, UserProfileData } from '../lib/firestore';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: UserProfileData | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateCustomerProfile: (data: Partial<UserProfileData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load customer profile from Firestore
  const loadProfile = async (uid: string) => {
    try {
      const userProfile = await getUserProfile(uid);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error fetching customer profile:', err);
    }
  };

  // Persistent Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = async (data: RegisterData) => {
    const result = await signUpCustomer(data);
    setFirebaseUser(result.firebaseUser);
    setProfile(result.userProfile as UserProfileData);
  };

  const handleSignIn = async (email: string, password: string) => {
    const user = await signInCustomer(email, password);
    setFirebaseUser(user);
    await loadProfile(user.uid);
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    setFirebaseUser(result.firebaseUser);
    setProfile(result.userProfile as UserProfileData);
  };

  const handleSignOut = async () => {
    await signOutCustomer();
    setFirebaseUser(null);
    setProfile(null);
  };

  const handleResetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  const handleResendVerification = async () => {
    if (firebaseUser) {
      await resendVerification(firebaseUser);
    }
  };

  const handleUpdateProfile = async (data: Partial<UserProfileData>) => {
    if (!firebaseUser) throw new Error('Not authenticated');
    await updateUserProfile(firebaseUser.uid, data);
    await loadProfile(firebaseUser.uid);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await loadProfile(firebaseUser.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        isAuthenticated: !!firebaseUser,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        resendVerificationEmail: handleResendVerification,
        refreshProfile,
        updateCustomerProfile: handleUpdateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
