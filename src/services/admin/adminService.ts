/**
 * @file src/services/admin/adminService.ts
 * Client service for interacting with the MarketNest Admin Control Center API.
 * Encapsulates secure server-side communications for operations and reporting.
 */

import {
  MarketplaceCategory,
  MarketplaceRefund,
  MarketplacePayout,
  AdminNotification,
  PlatformSettings
} from '../../types';
import { getAdminDataMode } from '../../utils/dataMode';

export const adminService = {
  // 1. Overview & Metrics
  async getOverview() {
    const mode = getAdminDataMode();
    const res = await fetch(`/api/admin/overview?dataMode=${mode}`);
    if (!res.ok) throw new Error('Failed to fetch admin overview metrics');
    const json = await res.json();
    return json.data;
  },

  // 2. Customers
  async getCustomers(search?: string, status?: string) {
    const params = new URLSearchParams();
    params.append('dataMode', getAdminDataMode());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await fetch(`/api/admin/customers?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    const json = await res.json();
    return json.data;
  },

  async updateCustomerStatus(id: string, status: 'active' | 'suspended', reason?: string, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/customers/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to update customer status');
    return res.json();
  },

  // 3. Sellers
  async getSellers(search?: string, status?: string) {
    const params = new URLSearchParams();
    params.append('dataMode', getAdminDataMode());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const res = await fetch(`/api/admin/sellers?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sellers');
    const json = await res.json();
    return json.data;
  },

  async getSellerApplications() {
    const res = await fetch('/api/admin/sellers/applications');
    if (!res.ok) throw new Error('Failed to fetch seller applications');
    const json = await res.json();
    return json.data;
  },

  async reviewSellerApplication(id: string, action: 'approve' | 'reject' | 'request_review', reason?: string, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/sellers/applications/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to review seller application');
    return res.json();
  },

  async updateSellerStatus(id: string, updates: { status?: string; hideStore?: boolean; reason?: string }, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/sellers/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to update seller status');
    return res.json();
  },

  // 4. Affiliates
  async getAffiliates() {
    const params = new URLSearchParams();
    params.append('dataMode', getAdminDataMode());
    const res = await fetch(`/api/admin/affiliates?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch affiliates');
    const json = await res.json();
    return json.data;
  },

  async getAffiliateApplications(status?: string) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    const res = await fetch(`/api/admin/affiliates/applications?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch affiliate applications');
    const json = await res.json();
    return json.data;
  },

  async reviewAffiliateApplication(
    id: string,
    action: 'approve' | 'reject',
    options?: { customCode?: string; commissionRate?: number; reason?: string },
    adminInfo?: { id: string; name: string }
  ) {
    const res = await fetch(`/api/admin/affiliates/applications/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...options, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to review affiliate application');
    return res.json();
  },

  // 5. Products
  async getProducts(search?: string, category?: string, status?: string) {
    const params = new URLSearchParams();
    params.append('dataMode', getAdminDataMode());
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const res = await fetch(`/api/admin/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const json = await res.json();
    return json.data;
  },

  async moderateProduct(
    id: string,
    action: 'approve' | 'publish' | 'reject' | 'unpublish' | 'hide' | 'suspend' | 'archive' | 'flag',
    reason?: string,
    adminInfo?: { id: string; name: string }
  ) {
    const res = await fetch(`/api/admin/products/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to moderate product');
    return res.json();
  },

  async deleteProduct(id: string, permanent = false, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/products/${id}?permanent=${permanent}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete product');
    }
    return res.json();
  },

  // 6. Categories
  async getCategories(): Promise<MarketplaceCategory[]> {
    const res = await fetch('/api/admin/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    const json = await res.json();
    return json.data;
  },

  async createCategory(data: Partial<MarketplaceCategory>, adminInfo?: { id: string; name: string }) {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create category');
    }
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<MarketplaceCategory>, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  // 7. Orders
  async getOrders(search?: string, paymentStatus?: string, orderStatus?: string) {
    const params = new URLSearchParams();
    params.append('dataMode', getAdminDataMode());
    if (search) params.append('search', search);
    if (paymentStatus) params.append('paymentStatus', paymentStatus);
    if (orderStatus) params.append('orderStatus', orderStatus);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const json = await res.json();
    return json.data;
  },

  async updateOrderStatus(id: string, status: string, reason?: string, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // 8. Payments & Reconciliation
  async getPayments() {
    const res = await fetch('/api/admin/payments');
    if (!res.ok) throw new Error('Failed to fetch payments');
    const json = await res.json();
    return json.data;
  },

  async reconcilePayment(reference: string, action: string, note?: string, adminInfo?: { id: string; name: string }) {
    const res = await fetch('/api/admin/payments/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, action, note, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to reconcile payment');
    return res.json();
  },

  // 9. Refunds
  async getRefunds(): Promise<MarketplaceRefund[]> {
    const res = await fetch('/api/admin/refunds');
    if (!res.ok) throw new Error('Failed to fetch refunds');
    const json = await res.json();
    return json.data;
  },

  async reviewRefund(id: string, action: 'approve' | 'reject' | 'processing' | 'completed', adminNote?: string, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/refunds/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminNote, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to review refund');
    return res.json();
  },

  // 10. Commissions & Financials
  async getCommissions() {
    const res = await fetch('/api/admin/commissions');
    if (!res.ok) throw new Error('Failed to fetch commissions');
    const json = await res.json();
    return json.data;
  },

  async reverseAffiliateCommission(id: string, reason: string, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/commissions/affiliate/${id}/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to reverse commission');
    return res.json();
  },

  // 11. Payouts
  async getPayouts(): Promise<MarketplacePayout[]> {
    const res = await fetch('/api/admin/payouts');
    if (!res.ok) throw new Error('Failed to fetch payouts');
    const json = await res.json();
    return json.data;
  },

  async updatePayoutStatus(id: string, status: string, note?: string, adminInfo?: { id: string; name: string }) {
    const res = await fetch(`/api/admin/payouts/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to update payout status');
    return res.json();
  },

  // 12. Audit Logs
  async getAuditLogs(action?: string, entityType?: string, limitCount = 100) {
    const params = new URLSearchParams();
    if (action) params.append('action', action);
    if (entityType) params.append('entityType', entityType);
    params.append('limitCount', String(limitCount));
    const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const json = await res.json();
    return json.data;
  },

  // 13. Notifications
  async getNotifications(): Promise<AdminNotification[]> {
    const res = await fetch('/api/admin/notifications');
    if (!res.ok) throw new Error('Failed to fetch admin notifications');
    const json = await res.json();
    return json.data;
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
  },

  // 14. Settings
  async getSettings(): Promise<PlatformSettings> {
    const res = await fetch('/api/admin/settings');
    if (!res.ok) throw new Error('Failed to fetch platform settings');
    const json = await res.json();
    return json.data;
  },

  async updateSettings(settings: Partial<PlatformSettings>, adminInfo?: { id: string; name: string }) {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, adminId: adminInfo?.id, adminName: adminInfo?.name })
    });
    if (!res.ok) throw new Error('Failed to save platform settings');
    return res.json();
  }
};
