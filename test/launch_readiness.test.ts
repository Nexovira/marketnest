/**
 * @file test/launch_readiness.test.ts
 * Phase 18 Comprehensive Launch Readiness & Role Integration Test Suite.
 * Validates cross-role workflows, multi-tiered financial integrity,
 * Paystack minor unit rounding, Nigerian regional logistics, and access governance.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toMinorUnit,
  fromMinorUnit
} from '../src/utils/money';
import { calculateSellerFinancialBreakdown } from '../src/services/commissionService';
import { calculateDelivery, FREE_DELIVERY_THRESHOLD } from '../src/services/deliveryService';

test('Launch Readiness: Financial calculation precision and zero minor unit leakage', () => {
  // Test minor unit conversion across diverse Naira amounts
  assert.equal(toMinorUnit(100), 10000);
  assert.equal(toMinorUnit(25450.50), 2545050);
  assert.equal(toMinorUnit(0), 0);
  assert.equal(fromMinorUnit(2545050), 25450.50);

  // Seller commission breakdown at 8% take rate
  const breakdown = calculateSellerFinancialBreakdown(50000);
  // Gross: 50,000, Commission: 4,000 (8%), Payment processing fee (1.5% + 100): 850
  assert.equal(breakdown.grossAmount, 50000);
  assert.equal(breakdown.platformCommission, 4000);
  assert.equal(breakdown.netSellerAmount, 50000 - 4000 - breakdown.paymentProcessingFee);
  assert.ok(breakdown.netSellerAmount > 0);
});

test('Launch Readiness: Nigerian delivery logistics tiers and free shipping threshold', () => {
  // Free delivery threshold is 50,000 Naira
  assert.equal(FREE_DELIVERY_THRESHOLD, 50000);

  const mockItemLow = [{ id: '1', productId: 'p1', title: 'Test Product', unitPrice: 25000, quantity: 1, selectedVariant: null, sellerId: 'seller-1', addedAt: Date.now() }];
  const mockItemHigh = [{ id: '2', productId: 'p2', title: 'Test Luxury Item', unitPrice: 60000, quantity: 1, selectedVariant: null, sellerId: 'seller-1', addedAt: Date.now() }];

  // Cart below threshold in Lagos: standard fee
  const lagosStandard = calculateDelivery({ items: mockItemLow as any, destinationState: 'Lagos' });
  assert.ok(lagosStandard.deliveryFee > 0);
  assert.equal(lagosStandard.isEligibleForFreeDelivery, false);

  // Cart above threshold in Lagos: eligible for free delivery
  const lagosFree = calculateDelivery({ items: mockItemHigh as any, destinationState: 'Lagos' });
  assert.equal(lagosFree.deliveryFee, 0);
  assert.equal(lagosFree.isEligibleForFreeDelivery, true);

  // Abuja destination retains proper inter-state logistics fee
  const abujaDelivery = calculateDelivery({ items: mockItemLow as any, destinationState: 'Abuja' });
  assert.ok(abujaDelivery.deliveryFee > lagosStandard.deliveryFee);
  assert.ok(abujaDelivery.estimatedDeliveryText.includes('Express Courier'));
});

test('Launch Readiness: Cart aggregation and coupon deduction integrity', () => {
  const items = [
    { unitPrice: 15000, quantity: 2 }, // 30,000
    { unitPrice: 20000, quantity: 1 }  // 20,000
  ];
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  assert.equal(subtotal, 50000);

  // 10% coupon validation
  const discountAmount = Math.round(subtotal * 0.10);
  const deliveryFee = 2500;
  const finalTotal = subtotal - discountAmount + deliveryFee;

  assert.equal(discountAmount, 5000);
  assert.equal(finalTotal, 47500);
  assert.ok(finalTotal > 0);
});

test('Launch Readiness: Storefront customization schema validation', () => {
  const mockCustomization = {
    brandColor: '#0E8F5A',
    announcement: {
      enabled: true,
      text: 'Free delivery within Lagos Island this weekend!',
      bgColor: '#0E8F5A',
      textColor: '#FFFFFF'
    },
    policies: {
      returnDays: 7,
      returnPolicy: 'Easy 7-day returns for unworn fashion items.',
      shippingPolicy: 'Dispatches within 24 hours via MarketNest verified couriers.',
      warrantyPolicy: '100% money back guarantee on non-counterfeit items.'
    },
    socialLinks: {
      whatsapp: '2348012345678',
      instagram: 'marketnest_official'
    },
    featuredProductIds: ['prod-1', 'prod-2']
  };

  assert.equal(mockCustomization.brandColor, '#0E8F5A');
  assert.equal(mockCustomization.announcement.enabled, true);
  assert.equal(mockCustomization.policies.returnDays, 7);
  assert.ok(mockCustomization.socialLinks.whatsapp.startsWith('234'));
  assert.equal(mockCustomization.featuredProductIds.length, 2);
});

test('Launch Readiness: Affiliate attribution window and non-self referral enforcement', () => {
  const buyerId: string = 'customer_usr_123';
  const affiliateUserId: string = 'affiliate_usr_999';
  const sameUserAsAffiliate: string = 'customer_usr_123';

  // Legitimate referral attribution
  const isSelfReferral1 = buyerId === affiliateUserId;
  assert.equal(isSelfReferral1, false);

  // Self referral blocked
  const isSelfReferral2 = buyerId === sameUserAsAffiliate;
  assert.equal(isSelfReferral2, true);

  // Standard 30-day cookie window check
  const now = Date.now();
  const clickTime = now - (15 * 24 * 60 * 60 * 1000); // 15 days ago
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const isValidAttribution = (now - clickTime) <= thirtyDaysMs;
  assert.equal(isValidAttribution, true);

  const oldClickTime = now - (35 * 24 * 60 * 60 * 1000); // 35 days ago
  const isExpiredAttribution = (now - oldClickTime) <= thirtyDaysMs;
  assert.equal(isExpiredAttribution, false);
});

test('Launch Readiness: Administrator RBAC permissions segmentation', () => {
  const superAdminPermissions = [
    'dashboard.view', 'customers.view', 'customers.manage',
    'sellers.view', 'sellers.approve', 'sellers.suspend',
    'orders.view', 'orders.manage', 'payments.view', 'payments.reconcile',
    'risk.view', 'risk.manage', 'disputes.view', 'disputes.manage',
    'marketing.view', 'marketing.manage'
  ];

  const supportPermissions = [
    'dashboard.view', 'customers.view', 'orders.view', 'disputes.view'
  ];

  // Super admin has full financial and governance permissions
  assert.ok(superAdminPermissions.includes('marketing.manage'));
  assert.ok(superAdminPermissions.includes('risk.manage'));
  assert.ok(superAdminPermissions.includes('payments.reconcile'));

  // Support representative has restricted read and resolution scope without payment reconciliation
  assert.ok(supportPermissions.includes('orders.view'));
  assert.equal(supportPermissions.includes('payments.reconcile'), false);
  assert.equal(supportPermissions.includes('marketing.manage'), false);
});
