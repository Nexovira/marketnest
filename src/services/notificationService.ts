/**
 * @file src/services/notificationService.ts
 * Customer in-app notifications and granular notification preferences.
 */

import { CustomerNotification, NotificationPreferences } from '../types';

const NOTIF_PREFS_KEY = 'marketnest_notification_preferences';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  orderNotifications: true,
  promotionNotifications: true,
  priceAlerts: true,
  stockAlerts: true,
  sellerUpdates: true,
  reviewReminders: true,
  emailNotifications: true,
  inAppNotifications: true
};

export const notificationService = {
  /**
   * Fetch in-app notifications for user
   */
  async getNotifications(userId: string): Promise<CustomerNotification[]> {
    try {
      const res = await fetch(`/api/notifications/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
    } catch {}

    // Default notifications fallback
    return [
      {
        id: 'notif_welcome',
        userId,
        type: 'promotion',
        title: 'Welcome to MarketNest Rewards',
        message: 'Your account is active. Use promo code NESTWELCOME to save 10% on your first order.',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif_security',
        userId,
        type: 'order_confirmed',
        title: 'Escrow Protection Active',
        message: 'All your orders are backed by verified Nigerian banking rails. Funds are held safely in escrow until you inspect your items.',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
        method: 'POST'
      });
    } catch {}
  },

  /**
   * Get notification preferences
   */
  getPreferences(userId: string): NotificationPreferences {
    try {
      const stored = localStorage.getItem(`${NOTIF_PREFS_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  /**
   * Save notification preferences
   */
  savePreferences(userId: string, prefs: NotificationPreferences): void {
    try {
      localStorage.setItem(`${NOTIF_PREFS_KEY}_${userId}`, JSON.stringify(prefs));
    } catch {}
  }
};
