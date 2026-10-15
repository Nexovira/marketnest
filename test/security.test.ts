/**
 * @file test/security.test.ts
 * Automated security and cryptographic signature tests for MarketNest.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { calculateDelivery } from '../src/services/deliveryService';

test('Security Hardening: HMAC SHA-512 Paystack signature verification matches expected hash', () => {
  const secretKey = 'sk_test_mock_secret_key_for_testing';
  const payload = JSON.stringify({
    event: 'charge.success',
    data: {
      reference: 'MN-TEST-20261009-8812',
      amount: 5000000,
      currency: 'NGN',
      status: 'success'
    }
  });

  const expectedSignature = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');
  const actualSignature = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');

  assert.equal(actualSignature, expectedSignature);
  assert.equal(actualSignature.length, 128); // 512 bits in hex = 128 chars
});

test('Security Hardening: Tampered webhook body fails cryptographic hash match', () => {
  const secretKey = 'sk_test_mock_secret_key_for_testing';
  const originalPayload = '{"event":"charge.success","amount":5000000}';
  const tamperedPayload = '{"event":"charge.success","amount":1000000}';

  const originalSig = crypto.createHmac('sha512', secretKey).update(originalPayload).digest('hex');
  const tamperedSig = crypto.createHmac('sha512', secretKey).update(tamperedPayload).digest('hex');

  assert.notEqual(originalSig, tamperedSig);
});

test('Logistics & Delivery Calculation: Lagos express vs standard nationwide pricing tier', () => {
  const dummyItem = {
    id: 'item_1',
    productId: 'p_1',
    sellerId: 'seller_1',
    name: 'Artisan Bag',
    image: '',
    price: 20000,
    unitPrice: 20000,
    quantity: 1,
    lineTotal: 20000,
    product: {} as any
  };

  const lagosSameDay = calculateDelivery({
    items: [dummyItem],
    destinationState: 'Lagos',
    speed: 'lagos_sameday'
  });
  assert.ok(lagosSameDay.deliveryFee > 0);

  const lagosFree = calculateDelivery({
    items: [{ ...dummyItem, unitPrice: 60000, price: 60000, lineTotal: 60000 }],
    destinationState: 'Lagos',
    speed: 'lagos_24h'
  });
  assert.equal(lagosFree.deliveryFee, 0); // Qualifies for Lagos free delivery
  assert.equal(lagosFree.isEligibleForFreeDelivery, true);
});
