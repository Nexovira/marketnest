/**
 * @file src/services/promotionService.ts
 * Server-authoritative coupon validation and checkout totals computation.
 */

import { CouponValidationResult, DeliveryMethodId } from '../types';

export const promotionService = {
  /**
   * Validate coupon code on server
   */
  async validateCoupon(
    code: string,
    cartSubtotal: number,
    items: any[] = [],
    customerId?: string
  ): Promise<CouponValidationResult> {
    try {
      const res = await fetch('/api/promotions/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartSubtotal, items, customerId })
      });
      const data = await res.json();
      return data as CouponValidationResult;
    } catch {
      return {
        valid: false,
        code,
        discountAmount: 0,
        description: '',
        error: 'Network error validating coupon. Please try again.'
      };
    }
  },

  /**
   * Calculate authoritative checkout totals with delivery and coupon
   */
  async calculateTotals(
    items: any[],
    deliveryMethod: DeliveryMethodId = 'standard',
    couponCode?: string,
    state: string = 'Lagos'
  ): Promise<{
    subtotal: number;
    discount: number;
    deliveryFee: number;
    platformFee: number;
    total: number;
    coupon?: { code: string; name: string; discountAmount: number };
  }> {
    try {
      const res = await fetch('/api/checkout/calculate-totals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, deliveryMethod, couponCode, state })
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {}

    // Safe client-side fallback matching server rules
    const subtotal = items.reduce((sum, it) => sum + (it.price * (it.quantity || 1)), 0);
    const deliveryFee = deliveryMethod === 'express' ? 5000 : deliveryMethod === 'pickup' ? 800 : 2500;
    return {
      subtotal,
      discount: 0,
      deliveryFee,
      platformFee: 0,
      total: subtotal + deliveryFee
    };
  }
};
