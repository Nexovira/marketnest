/**
 * @file src/services/admin/adminAuthService.ts
 * Dedicated authentication and emergency recovery service for MarketNest Administrators.
 * Enforces role verification, root owner claims, and audit trail generation.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AdminProfile, AdminRole } from '../../types';

export const PLATFORM_OWNER_EMAIL = 'ummuunaysah2006@gmail.com';

export interface AdminAuthStatus {
  isOwnerConfigured: boolean;
  ownerEmail: string;
  hasProvisionedAdmin: boolean;
  environment: string;
}

export const adminAuthService = {
  /**
   * Check if root admin has been provisioned
   */
  async getStatus(): Promise<AdminAuthStatus> {
    try {
      const res = await fetch('/api/admin/auth/status');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }

    return {
      isOwnerConfigured: true,
      ownerEmail: PLATFORM_OWNER_EMAIL,
      hasProvisionedAdmin: false,
      environment: 'development'
    };
  },

  /**
   * Fetch an existing administrator profile from Firestore or API
   */
  async getAdminProfile(uid: string): Promise<AdminProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'adminProfiles', uid));
      if (snap.exists()) {
        return snap.data() as AdminProfile;
      }
    } catch (err) {
      console.warn('[AdminAuth] Client direct fetch note:', err);
    }

    // Try server verification API
    try {
      const res = await fetch(`/api/admin/auth/profile/${uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data as AdminProfile;
      }
    } catch {
      // Ignore
    }

    return null;
  },

  /**
   * Securely claim root super_admin role for the designated platform owner
   */
  async claimRootSuperAdmin(params: {
    uid: string;
    email: string;
    displayName?: string;
    recoveryKey?: string;
  }): Promise<{ success: boolean; profile: AdminProfile; message?: string }> {
    const res = await fetch('/api/admin/auth/claim-root', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to claim root administrator account.');
    }

    // Also attempt client-side doc write if user has write permissions
    try {
      await setDoc(doc(db, 'adminProfiles', params.uid), json.data, { merge: true });
    } catch (clientErr) {
      console.warn('[AdminAuth] Client sync note (handled authoritatively by server):', clientErr);
    }

    return {
      success: true,
      profile: json.data,
      message: json.message
    };
  },

  /**
   * Emergency Administrator Access Recovery
   */
  async recoverAdminAccess(params: {
    uid: string;
    email: string;
    recoveryKey: string;
  }): Promise<{ success: boolean; profile: AdminProfile; message?: string }> {
    const res = await fetch('/api/admin/auth/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Emergency admin recovery failed. Invalid recovery key or unauthorized email.');
    }

    return {
      success: true,
      profile: json.data,
      message: json.message
    };
  }
};
