/**
 * @file test/financial.test.ts
 * Automated financial accuracy and Paystack Kobo conversion test suite.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toMinorUnit, fromMinorUnit, formatNairaAmount } from '../src/utils/money';
import { calculateSellerFinancialBreakdown, DEFAULT_PLATFORM_COMMISSION_RATE } from '../src/services/commissionService';

test('Financial Calculations: toMinorUnit converts Naira to exact integer Kobo', () => {
  assert.equal(toMinorUnit(100), 10000);
  assert.equal(toMinorUnit(88500.50), 8850050);
  assert.equal(toMinorUnit(0), 0);
  assert.equal(toMinorUnit(14.99), 1499);
});

test('Financial Calculations: fromMinorUnit converts Kobo back to Naira float', () => {
  assert.equal(fromMinorUnit(10000), 100);
  assert.equal(fromMinorUnit(8850050), 88500.50);
  assert.equal(fromMinorUnit(0), 0);
});

test('Financial Calculations: formatNairaAmount produces valid Nigerian currency format', () => {
  const formatted = formatNairaAmount(88500);
  assert.ok(formatted.includes('88,500'));
});

test('Commission Integrity: calculateSellerFinancialBreakdown enforces 8% take rate and gateway fee', () => {
  const gross = 100000; // ₦100,000
  const breakdown = calculateSellerFinancialBreakdown(gross, DEFAULT_PLATFORM_COMMISSION_RATE);

  // 8% platform fee = ₦8,000
  assert.equal(breakdown.platformCommission, 8000);
  assert.equal(breakdown.platformCommissionRate, 0.08);

  // Paystack fee: 1.5% + 100 capped at 2000 => 1500 + 100 = 1600
  assert.equal(breakdown.paymentProcessingFee, 1600);

  // Net = 100,000 - 8,000 - 1,600 = ₦90,400
  assert.equal(breakdown.netSellerAmount, 90400);
  assert.equal(breakdown.grossAmount, gross);
});
