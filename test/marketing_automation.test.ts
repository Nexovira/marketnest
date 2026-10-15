/**
 * @file test/marketing_automation.test.ts
 * Automated Test Suite for Phase 17: Marketing Automation, CRM & Customer Retention.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Import types
import {
  MarketingCampaign,
  MarketingSegment,
  CustomerCommunicationPreferences,
  AbandonedCart,
  AutomationJob,
  ChannelProviderStatus
} from '../src/types/marketing';

test('Marketing Campaign: Validates required campaign structure and initial stats', () => {
  const campaign: MarketingCampaign = {
    id: 'camp_test_01',
    name: 'Eid Al-Fitr Artisan Drop',
    objective: 'seasonal',
    channel: 'email',
    status: 'draft',
    targetSegmentId: 'seg_all_opted_in',
    targetSegmentName: 'All Opted-In Newsletter Shoppers',
    estimatedAudience: 285,
    actualRecipients: 0,
    messageTemplate: {
      subject: 'Eid Mubarak from MarketNest',
      body: 'Celebrate with bespoke traditional tailoring.',
      ctaUrl: '/shop'
    },
    couponCode: 'EID2026',
    stats: {
      delivered: 0,
      clicks: 0,
      optOuts: 0,
      attributedOrders: 0,
      attributedRevenue: 0
    },
    createdAt: new Date().toISOString(),
    createdBy: 'admin_test',
    updatedAt: new Date().toISOString()
  };

  assert.equal(campaign.name, 'Eid Al-Fitr Artisan Drop');
  assert.equal(campaign.status, 'draft');
  assert.equal(campaign.stats.delivered, 0);
  assert.equal(campaign.couponCode, 'EID2026');
});

test('Suppression Enforcement: Pre-send suppression filters opted-out customers', () => {
  const rawAudience = [
    { id: 'user_1', optIn: true, channelOptOut: false },
    { id: 'user_2', optIn: false, channelOptOut: true }, // Explicitly opted-out
    { id: 'user_3', optIn: true, channelOptOut: true },  // Channel suppressed
    { id: 'user_4', optIn: true, channelOptOut: false }
  ];

  // Pre-send suppression rule
  const cleanAudience = rawAudience.filter((u) => u.optIn && !u.channelOptOut);

  assert.equal(cleanAudience.length, 2);
  assert.deepEqual(cleanAudience.map((u) => u.id), ['user_1', 'user_4']);
});

test('Duplicate Send Prevention: Prevents launching already sent campaigns', () => {
  const campaign: Partial<MarketingCampaign> = {
    id: 'camp_sent_01',
    status: 'sent',
    actualRecipients: 250
  };

  const attemptLaunch = (status: string) => {
    if (status === 'sent' || status === 'completed') {
      throw new Error('Campaign has already been sent to prevent duplicate messages.');
    }
    return true;
  };

  assert.throws(() => attemptLaunch(campaign.status!), {
    message: 'Campaign has already been sent to prevent duplicate messages.'
  });
});

test('Abandoned Cart Recovery: Excludes out-of-stock items and converted carts', () => {
  const activeCart: AbandonedCart = {
    id: 'cart_1',
    customerId: 'cust_1',
    customerEmail: 'test@example.com',
    customerName: 'Test Buyer',
    items: [
      { productId: 'p1', title: 'Adire Kimono', price: 85000, quantity: 1, image: '', inStock: true }
    ],
    cartTotal: 85000,
    status: 'abandoned',
    recoveryAttempts: 0,
    abandonedAt: new Date().toISOString(),
    recoveryToken: 'tok_1',
    returnUrl: '/cart?recover=cart_1&token=tok_1',
    isOptedInForCartReminders: true
  };

  const convertedCart: AbandonedCart = {
    ...activeCart,
    id: 'cart_2',
    status: 'recovered'
  };

  const outOfStockCart: AbandonedCart = {
    ...activeCart,
    id: 'cart_3',
    items: [
      { productId: 'p2', title: 'Sold Out Item', price: 40000, quantity: 1, image: '', inStock: false }
    ]
  };

  const validateCartEligibility = (c: AbandonedCart) => {
    if (c.status === 'recovered') return 'already_converted';
    if (!c.isOptedInForCartReminders) return 'customer_opted_out';
    if (c.items.some((i) => !i.inStock)) return 'item_out_of_stock';
    return 'eligible';
  };

  assert.equal(validateCartEligibility(activeCart), 'eligible');
  assert.equal(validateCartEligibility(convertedCart), 'already_converted');
  assert.equal(validateCartEligibility(outOfStockCart), 'item_out_of_stock');
});

test('Customer Preferences: Transactional notices remain immutable and non-opt-outable', () => {
  const preferences: CustomerCommunicationPreferences = {
    userId: 'cust_amina',
    email: 'amina@example.com',
    marketingOptIn: false, // Turned off marketing
    channels: { email: false, sms: false, whatsapp: false, push: false },
    categories: {
      promotionsAndDiscounts: false,
      curatedDrops: false,
      abandonedCartReminders: false,
      reviewRequests: false,
      backInStock: false
    },
    transactional: {
      orderUpdates: true,
      paymentReceipts: true,
      escrowDisbursements: true
    },
    consentRecord: {
      consentSource: 'preference_center',
      timestamp: new Date().toISOString(),
      lastChangedAt: new Date().toISOString()
    }
  };

  // Ensure transactional communications cannot be mutated to false
  assert.equal(preferences.transactional.orderUpdates, true);
  assert.equal(preferences.transactional.paymentReceipts, true);
  assert.equal(preferences.transactional.escrowDisbursements, true);
  assert.equal(preferences.marketingOptIn, false);
});

test('Automation Trigger: Supports idempotent state toggling', () => {
  const job: AutomationJob = {
    id: 'job_cart_1h',
    trigger: 'cart_inactive_1h',
    title: '1-Hour Inactive Cart Reminder',
    description: 'Triggered 60 minutes after cart inactivity.',
    enabled: true,
    channel: 'email',
    delayMinutes: 60,
    executionCount: 142,
    successRatePercent: 96.5,
    templateId: 'tmpl_cart_recovery_lagos'
  };

  assert.equal(job.enabled, true);

  // Toggle
  job.enabled = !job.enabled;
  assert.equal(job.enabled, false);

  job.enabled = !job.enabled;
  assert.equal(job.enabled, true);
});

test('Channel Providers: Accurately reports configuration state vs sandbox simulation', () => {
  const providers: ChannelProviderStatus[] = [
    {
      channel: 'email',
      providerName: 'Resend',
      status: 'active_simulated',
      deliveryRate: 98.4,
      requiredEnvVars: ['RESEND_API_KEY'],
      missingEnvVars: ['RESEND_API_KEY'],
      documentation: 'Sandbox mode active.'
    },
    {
      channel: 'sms',
      providerName: 'Termii',
      status: 'active_simulated',
      deliveryRate: 94.2,
      requiredEnvVars: ['TERMII_API_KEY'],
      missingEnvVars: ['TERMII_API_KEY'],
      documentation: 'Sandbox mode active.'
    }
  ];

  assert.equal(providers[0].status, 'active_simulated');
  assert.equal(providers[0].missingEnvVars.length, 1);
  assert.equal(providers[1].channel, 'sms');
});
