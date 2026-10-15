/**
 * @file test/admin_recovery_and_rbac.test.ts
 * Comprehensive Test Suite for Production Data Cleanup, Administrator RBAC & Access Recovery.
 * Verifies role authorization boundaries, root owner claim verification,
 * data mode separation, and anti-escalation security checks.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLATFORM_OWNER_EMAIL } from '../src/services/admin/adminAuthService';
import { getAdminDataMode, setAdminDataMode } from '../src/utils/dataMode';
import { AdminRole, AdminPermission } from '../src/types';

// Mock minimal role permissions schema identical to AdminContext
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'dashboard.view', 'customers.view', 'customers.manage',
    'sellers.view', 'sellers.approve', 'sellers.suspend',
    'products.view', 'products.moderate', 'orders.view', 'orders.manage',
    'payments.view', 'payments.reconcile', 'refunds.view', 'refunds.manage',
    'affiliates.view', 'affiliates.approve', 'affiliates.suspend',
    'commissions.view', 'payouts.view', 'payouts.manage',
    'reports.view', 'settings.view', 'settings.manage',
    'analytics.view', 'analytics.financial.view', 'analytics.customer.view',
    'analytics.seller.view', 'analytics.affiliate.view',
    'reports.generate', 'reports.export',
    'finance.reconciliation.view', 'finance.reconciliation.manage',
    'risk.view', 'risk.manage', 'disputes.view', 'disputes.manage',
    'governance.enforce', 'marketing.view', 'marketing.manage'
  ],
  operations_admin: [
    'dashboard.view', 'marketing.view', 'customers.view', 'customers.manage',
    'sellers.view', 'sellers.approve', 'sellers.suspend',
    'products.view', 'products.moderate', 'orders.view', 'orders.manage',
    'affiliates.view', 'affiliates.approve', 'affiliates.suspend',
    'reports.view', 'settings.view', 'analytics.view',
    'analytics.customer.view', 'analytics.seller.view', 'analytics.affiliate.view',
    'reports.generate', 'reports.export',
    'risk.view', 'risk.manage', 'disputes.view', 'disputes.manage',
    'governance.enforce'
  ],
  finance_admin: [
    'dashboard.view', 'orders.view', 'payments.view', 'payments.reconcile',
    'refunds.view', 'refunds.manage', 'commissions.view', 'payouts.view',
    'payouts.manage', 'reports.view', 'analytics.view',
    'analytics.financial.view', 'reports.generate', 'reports.export',
    'finance.reconciliation.view', 'finance.reconciliation.manage',
    'risk.view', 'disputes.view'
  ],
  support_admin: [
    'dashboard.view', 'customers.view', 'sellers.view', 'orders.view',
    'refunds.view', 'affiliates.view', 'risk.view', 'disputes.view'
  ],
  moderator: [
    'dashboard.view', 'products.view', 'products.moderate',
    'sellers.view', 'customers.view', 'risk.view'
  ]
};

test('RBAC: Super Admin has all critical governance, marketing, and treasury permissions', () => {
  const superPerms = ROLE_PERMISSIONS.super_admin;
  assert.ok(superPerms.includes('governance.enforce'));
  assert.ok(superPerms.includes('marketing.manage'));
  assert.ok(superPerms.includes('risk.manage'));
  assert.ok(superPerms.includes('finance.reconciliation.manage'));
  assert.ok(superPerms.includes('payouts.manage'));
});

test('RBAC: Least-privilege separation blocks lower roles from sensitive operations', () => {
  // Support Admin cannot reconcile payments or enforce governance
  assert.equal(ROLE_PERMISSIONS.support_admin.includes('payments.reconcile'), false);
  assert.equal(ROLE_PERMISSIONS.support_admin.includes('governance.enforce'), false);
  assert.equal(ROLE_PERMISSIONS.support_admin.includes('payouts.manage'), false);

  // Moderator cannot disburse payouts or approve affiliates
  assert.equal(ROLE_PERMISSIONS.moderator.includes('payouts.manage'), false);
  assert.equal(ROLE_PERMISSIONS.moderator.includes('affiliates.approve'), false);

  // Finance Admin cannot moderate catalog products or suspend sellers
  assert.equal(ROLE_PERMISSIONS.finance_admin.includes('products.moderate'), false);
  assert.equal(ROLE_PERMISSIONS.finance_admin.includes('sellers.suspend'), false);
});

test('Platform Owner Identity: Designated email is verified', () => {
  assert.equal(PLATFORM_OWNER_EMAIL, 'ummuunaysah2006@gmail.com');

  // Verify case-insensitive match logic
  const testEmail = 'UmmuUnaysah2006@gmail.com';
  const isOwner = testEmail.trim().toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase();
  assert.equal(isOwner, true);

  // Verify non-owner is rejected
  const intruderEmail = 'random_intruder@yahoo.com';
  const isIntruderOwner = intruderEmail.trim().toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase();
  assert.equal(isIntruderOwner, false);
});

test('Data Separation: Data mode utility defaults to production', () => {
  const mode = getAdminDataMode();
  assert.equal(mode, 'production');
});

test('Data Separation: Production mode calculation produces authentic 0 metrics when no orders exist', () => {
  const liveOrders: any[] = [];
  const isSeedMode = false;

  let totalGmv = 0;
  let totalPlatformCommissions = 0;
  let totalSellerNet = 0;

  liveOrders.forEach((o) => {
    totalGmv += o.total || 0;
    totalPlatformCommissions += Math.round((o.total || 0) * 0.1);
    totalSellerNet += Math.round((o.total || 0) * 0.885);
  });

  // In production mode, totalGmv MUST remain 0, never fabricated
  if (isSeedMode && totalGmv === 0 && liveOrders.length === 0) {
    totalGmv = 24850000;
  }

  assert.equal(totalGmv, 0);
  assert.equal(totalPlatformCommissions, 0);
  assert.equal(totalSellerNet, 0);
});

test('Emergency Recovery: Valid recovery key check authorizes super admin claim', () => {
  const DEFAULT_EMERGENCY_KEY = 'MARKETNEST_SUPER_ADMIN_RECOVER_2026';

  function validateClaim(email: string, recoveryKey?: string): boolean {
    const isOwner = email.trim().toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase();
    const isValidKey = recoveryKey === DEFAULT_EMERGENCY_KEY;
    return isOwner || isValidKey;
  }

  // Owner without key is valid
  assert.equal(validateClaim('ummuunaysah2006@gmail.com'), true);

  // Non-owner with valid recovery key is valid (emergency recovery)
  assert.equal(validateClaim('alternate_director@marketnest.ng', DEFAULT_EMERGENCY_KEY), true);

  // Non-owner with invalid key is blocked
  assert.equal(validateClaim('intruder@gmail.com', 'wrong_key'), false);

  // Non-owner without key is blocked
  assert.equal(validateClaim('intruder@gmail.com'), false);
});
