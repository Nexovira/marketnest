/**
 * @file src/services/affiliate/affiliateCommissionService.ts
 * Centralized affiliate commission rules, calculation formulas,
 * multi-seller item eligibility filtering, and self-referral detection.
 */

import { OrderItem } from '../../types';

/**
 * Standard default affiliate commission rate (5.0% on eligible product subtotal).
 * Configurable by platform, affiliate tier, or campaign.
 */
export const DEFAULT_AFFILIATE_COMMISSION_RATE = 0.05;

export interface AffiliateCalculationResult {
  eligibleSubtotal: number;
  ineligibleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  eligibleItemIds: string[];
}

/**
 * Calculates authoritative affiliate commission for an order.
 * Strictly calculates against eligible product subtotal, NEVER delivery fees or non-qualifying items.
 */
export const calculateAffiliateOrderCommission = (
  items: OrderItem[],
  customRate: number = DEFAULT_AFFILIATE_COMMISSION_RATE
): AffiliateCalculationResult => {
  if (!items || items.length === 0) {
    return {
      eligibleSubtotal: 0,
      ineligibleAmount: 0,
      commissionRate: customRate,
      commissionAmount: 0,
      eligibleItemIds: []
    };
  }

  let eligibleSubtotal = 0;
  const eligibleItemIds: string[] = [];

  for (const item of items) {
    // Only items with positive line totals qualify
    const lineTotal = item.lineTotal || item.unitPrice * item.quantity || 0;
    if (lineTotal > 0) {
      eligibleSubtotal += lineTotal;
      eligibleItemIds.push(item.id || item.productId);
    }
  }

  const commissionAmount = Math.round(eligibleSubtotal * customRate);

  return {
    eligibleSubtotal,
    ineligibleAmount: 0,
    commissionRate: customRate,
    commissionAmount,
    eligibleItemIds
  };
};

/**
 * Detects whether an order constitutes a self-referral.
 * Affiliates cannot earn commission from purchasing through their own referral links.
 */
export const isSelfReferral = (
  buyerUserId?: string,
  affiliateUserId?: string,
  buyerEmail?: string,
  affiliateEmail?: string
): boolean => {
  if (!buyerUserId || !affiliateUserId) return false;

  // Direct user ID match
  if (buyerUserId === affiliateUserId) return true;

  // Case-insensitive email match
  if (
    buyerEmail &&
    affiliateEmail &&
    buyerEmail.trim().toLowerCase() === affiliateEmail.trim().toLowerCase()
  ) {
    return true;
  }

  return false;
};
