/**
 * @file src/context/AdminContext.tsx
 * Production state management for the MarketNest Admin Control Center.
 * Handles RBAC permissions, role switching, global search, confirmation modals,
 * notification alerts, and active administration sub-navigation.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminRole,
  AdminPermission,
  AdminProfile,
  AdminSection,
  AdminNotification
} from '../types';
import { adminService } from '../services/admin/adminService';
import { useAuth } from './AuthContext';
import { DataMode, getAdminDataMode, setAdminDataMode as saveAdminDataMode } from '../utils/dataMode';
import { adminAuthService, PLATFORM_OWNER_EMAIL } from '../services/admin/adminAuthService';

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'dashboard.view',
    'customers.view',
    'customers.manage',
    'sellers.view',
    'sellers.approve',
    'sellers.suspend',
    'products.view',
    'products.moderate',
    'orders.view',
    'orders.manage',
    'payments.view',
    'payments.reconcile',
    'refunds.view',
    'refunds.manage',
    'affiliates.view',
    'affiliates.approve',
    'affiliates.suspend',
    'commissions.view',
    'payouts.view',
    'payouts.manage',
    'reports.view',
    'settings.view',
    'settings.manage',
    'analytics.view',
    'analytics.financial.view',
    'analytics.customer.view',
    'analytics.seller.view',
    'analytics.affiliate.view',
    'reports.generate',
    'reports.export',
    'finance.reconciliation.view',
    'finance.reconciliation.manage',
    'risk.view',
    'risk.manage',
    'disputes.view',
    'disputes.manage',
    'governance.enforce',
    'marketing.view',
    'marketing.manage'
  ],
  operations_admin: [
    'dashboard.view',
    'marketing.view',
    'customers.view',
    'customers.manage',
    'sellers.view',
    'sellers.approve',
    'sellers.suspend',
    'products.view',
    'products.moderate',
    'orders.view',
    'orders.manage',
    'affiliates.view',
    'affiliates.approve',
    'affiliates.suspend',
    'reports.view',
    'settings.view',
    'analytics.view',
    'analytics.customer.view',
    'analytics.seller.view',
    'analytics.affiliate.view',
    'reports.generate',
    'reports.export',
    'risk.view',
    'risk.manage',
    'disputes.view',
    'disputes.manage',
    'governance.enforce'
  ],
  finance_admin: [
    'dashboard.view',
    'orders.view',
    'payments.view',
    'payments.reconcile',
    'refunds.view',
    'refunds.manage',
    'commissions.view',
    'payouts.view',
    'payouts.manage',
    'reports.view',
    'analytics.view',
    'analytics.financial.view',
    'reports.generate',
    'reports.export',
    'finance.reconciliation.view',
    'finance.reconciliation.manage',
    'risk.view',
    'disputes.view'
  ],
  support_admin: [
    'dashboard.view',
    'customers.view',
    'sellers.view',
    'orders.view',
    'refunds.view',
    'affiliates.view',
    'risk.view',
    'disputes.view'
  ],
  moderator: [
    'dashboard.view',
    'products.view',
    'products.moderate',
    'sellers.view',
    'customers.view',
    'risk.view'
  ]
};

export interface ConfirmationRequest {
  title: string;
  description: string;
  confirmText?: string;
  danger?: boolean;
  requireReason?: boolean;
  onConfirm: (reason?: string) => Promise<void> | void;
}

interface AdminContextType {
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
  adminProfile: AdminProfile;
  isAdminVerified: boolean;
  isOwner: boolean;
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  setAdminRole: (role: AdminRole) => void;
  hasPermission: (permission: AdminPermission) => boolean;
  claimSuperAdmin: (recoveryKey?: string) => Promise<{ success: boolean; message?: string }>;
  recoverAdminAccess: (recoveryKey: string) => Promise<{ success: boolean; message?: string }>;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  // Confirmation Modal
  confirmModal: ConfirmationRequest | null;
  requestConfirm: (request: ConfirmationRequest) => void;
  closeConfirm: () => void;
  // Global Search Modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  // Notifications
  notifications: AdminNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  // Badge counts
  pendingCounts: {
    sellers: number;
    affiliates: number;
    refunds: number;
    riskCases: number;
    disputes: number;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, profile: userProfile } = useAuth();

  const [activeSection, setActiveSection] = useState<AdminSection>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/admin/risk') || pathname.includes('/admin/fraud')) {
        return 'risk';
      }
      if (pathname.includes('/admin/disputes')) {
        return 'disputes';
      }
      if (pathname.includes('/admin/business-intelligence')) {
        return 'business-intelligence';
      }
      if (pathname.includes('/admin/marketing')) {
        return 'marketing';
      }
      if (pathname.includes('/admin/reconciliation')) {
        return 'reconciliation';
      }
    }
    return 'dashboard';
  });

  const [currentRole, setCurrentRole] = useState<AdminRole>('super_admin');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [dataMode, setDataModeState] = useState<DataMode>(getAdminDataMode());
  const [claimedProfile, setClaimedProfile] = useState<AdminProfile | null>(null);

  // Check if current authenticated user is the designated platform owner
  const isOwner = Boolean(
    firebaseUser?.email &&
      firebaseUser.email.trim().toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase()
  );

  // Load admin profile from backend/firestore whenever user changes
  useEffect(() => {
    let isMounted = true;
    async function loadAdminStatus() {
      if (!firebaseUser) {
        setClaimedProfile(null);
        return;
      }

      try {
        const profile = await adminAuthService.getAdminProfile(firebaseUser.uid);
        if (isMounted && profile) {
          setClaimedProfile(profile);
          setCurrentRole(profile.role);
        }
      } catch (err) {
        console.warn('[AdminContext] Could not load admin profile:', err);
      }
    }

    loadAdminStatus();
    return () => {
      isMounted = false;
    };
  }, [firebaseUser]);

  // Modals
  const [confirmModal, setConfirmModal] = useState<ConfirmationRequest | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [pendingCounts, setPendingCounts] = useState({
    sellers: 1,
    affiliates: 0,
    refunds: 0,
    riskCases: 0,
    disputes: 0
  });

  // Verify administrative rights
  const userRole = (userProfile as any)?.role;
  const isAdminVerified = Boolean(
    firebaseUser &&
      (isOwner ||
        claimedProfile !== null ||
        userRole === 'admin' ||
        userRole === 'super_admin')
  );

  const adminProfile: AdminProfile = isAdminVerified
    ? claimedProfile || {
        id: firebaseUser?.uid || 'admin_owner',
        name: userProfile?.name || firebaseUser?.displayName || (isOwner ? 'Platform Director' : 'Administrator'),
        email: firebaseUser?.email || userProfile?.email || 'admin@marketnest.ng',
        role: currentRole,
        permissions: ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.super_admin,
        department: isOwner
          ? 'Executive Operations'
          : currentRole === 'finance_admin'
          ? 'Treasury & Settlements'
          : currentRole === 'operations_admin'
          ? 'Merchant Operations'
          : currentRole === 'moderator'
          ? 'Catalog & Risk'
          : 'Customer Support'
      }
    : {
        id: firebaseUser?.uid || 'guest_unverified',
        name: userProfile?.name || firebaseUser?.displayName || 'Guest User',
        email: firebaseUser?.email || '',
        role: 'support_admin' as AdminRole,
        permissions: [],
        department: 'Pending Verification'
      };

  const hasPermission = (permission: AdminPermission): boolean => {
    if (!adminProfile) return false;
    return adminProfile.permissions.includes(permission);
  };

  const setAdminRole = (role: AdminRole) => {
    // Only verified super_admins or the owner can simulate alternative roles
    if (isOwner || claimedProfile?.role === 'super_admin' || currentRole === 'super_admin') {
      setCurrentRole(role);
    }
  };

  const setDataMode = (mode: DataMode) => {
    setDataModeState(mode);
    saveAdminDataMode(mode);
  };

  const claimSuperAdmin = async (recoveryKey?: string) => {
    if (!firebaseUser) {
      throw new Error('Please sign in to Firebase Authentication first.');
    }

    const result = await adminAuthService.claimRootSuperAdmin({
      uid: firebaseUser.uid,
      email: firebaseUser.email || PLATFORM_OWNER_EMAIL,
      displayName: firebaseUser.displayName || userProfile?.name,
      recoveryKey
    });

    setClaimedProfile(result.profile);
    setCurrentRole('super_admin');
    return { success: true, message: result.message };
  };

  const recoverAdminAccess = async (recoveryKey: string) => {
    if (!firebaseUser) {
      throw new Error('Please sign in before initiating emergency admin recovery.');
    }

    const result = await adminAuthService.recoverAdminAccess({
      uid: firebaseUser.uid,
      email: firebaseUser.email || PLATFORM_OWNER_EMAIL,
      recoveryKey
    });

    setClaimedProfile(result.profile);
    setCurrentRole('super_admin');
    return { success: true, message: result.message };
  };

  const requestConfirm = (request: ConfirmationRequest) => {
    setConfirmModal(request);
  };

  const closeConfirm = () => {
    setConfirmModal(null);
  };

  const refreshNotifications = async () => {
    if (!isAdminVerified) return;
    try {
      const list = await adminService.getNotifications();
      setNotifications(list);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (isAdminVerified) {
      refreshNotifications();
    }
  }, [isAdminVerified]);

  const markNotificationRead = async (id: string) => {
    try {
      await adminService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminContext.Provider
      value={{
        activeSection,
        setActiveSection,
        adminProfile,
        isAdminVerified,
        isOwner,
        dataMode,
        setDataMode,
        setAdminRole,
        hasPermission,
        claimSuperAdmin,
        recoverAdminAccess,
        selectedEntityId,
        setSelectedEntityId,
        confirmModal,
        requestConfirm,
        closeConfirm,
        isSearchOpen,
        setIsSearchOpen,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        refreshNotifications,
        pendingCounts
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
