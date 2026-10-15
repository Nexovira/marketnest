/**
 * @file src/services/returnService.ts
 * Customer return requests, structured reasons, photo evidence, and seller review.
 */

import { ReturnRequest, ReturnReason, ReturnStatus } from '../types';

export const RETURN_REASONS_LABELS: Record<ReturnReason, string> = {
  wrong_item: 'Received wrong product or variant',
  damaged_item: 'Item damaged during transit',
  defective_product: 'Defective or malfunctioning product',
  not_as_described: 'Product does not match listing description/photos',
  missing_parts: 'Missing accessories or parts',
  wrong_size: 'Sizing does not fit as expected',
  changed_mind: 'Changed mind (unopened & original packaging)',
  other: 'Other specific reason'
};

export const returnService = {
  /**
   * Submit return request
   */
  async requestReturn(payload: {
    orderId: string;
    orderNumber?: string;
    orderItemId?: string;
    customerId: string;
    customerName?: string;
    customerEmail?: string;
    sellerId: string;
    storeName?: string;
    productTitle: string;
    productImage?: string;
    price: number;
    quantity?: number;
    reason: ReturnReason;
    description: string;
    images?: string[];
  }): Promise<ReturnRequest> {
    const res = await fetch('/api/returns/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit return request');
    return data.data;
  },

  /**
   * Fetch returns for customer
   */
  async getCustomerReturns(customerId: string): Promise<ReturnRequest[]> {
    try {
      const res = await fetch(`/api/returns?customerId=${encodeURIComponent(customerId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
    } catch {}
    return [];
  },

  /**
   * Fetch returns for seller
   */
  async getSellerReturns(sellerId: string): Promise<ReturnRequest[]> {
    try {
      const res = await fetch(`/api/returns?sellerId=${encodeURIComponent(sellerId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
    } catch {}
    return [];
  },

  /**
   * Seller or Admin action on return request
   */
  async reviewReturn(
    returnId: string,
    action: 'approve' | 'reject' | 'receive' | 'refund',
    reason?: string,
    note?: string
  ): Promise<void> {
    const res = await fetch(`/api/returns/${encodeURIComponent(returnId)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason, note })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update return status');
  }
};
