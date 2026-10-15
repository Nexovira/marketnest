/**
 * @file src/types/marketing.ts
 * Type definitions for MarketNest Marketing Automation, CRM & Customer Retention.
 * Covers campaigns, audience segments, communication preferences, cart recovery,
 * message templates, automation jobs, and campaign attributions.
 */

export type MarketingChannel = 'email' | 'sms' | 'whatsapp' | 'push';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'processing'
  | 'sent'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type CampaignObjective =
  | 'conversion'
  | 'win_back'
  | 'retention'
  | 'cart_recovery'
  | 'announcement'
  | 'seasonal';

export interface CampaignMessageTemplate {
  subject?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  variables?: string[];
}

export interface CampaignStats {
  delivered: number;
  clicks: number;
  optOuts: number;
  attributedOrders: number;
  attributedRevenue: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  channel: MarketingChannel;
  status: CampaignStatus;
  targetSegmentId: string;
  targetSegmentName: string;
  estimatedAudience: number;
  actualRecipients: number;
  messageTemplate: CampaignMessageTemplate;
  couponCode?: string;
  scheduledAt?: string;
  sentAt?: string;
  stats: CampaignStats;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export type SegmentType =
  | 'new_customers'
  | 'first_time_buyers'
  | 'repeat_loyal'
  | 'inactive_winback'
  | 'cart_abandoners'
  | 'high_value'
  | 'all_opted_in'
  | 'custom';

export interface SegmentRules {
  minOrders?: number;
  maxOrders?: number;
  daysSinceLastOrder?: number;
  minLifetimeSpend?: number;
  categoryInterest?: string;
  requiresExplicitMarketingConsent: boolean;
}

export interface MarketingSegment {
  id: string;
  name: string;
  description: string;
  type: SegmentType;
  rules: SegmentRules;
  eligibleCount: number;
  lastCalculatedAt: string;
}

export interface CustomerConsentRecord {
  consentSource: 'account_registration' | 'checkout' | 'preference_center' | 'footer_newsletter';
  timestamp: string;
  ipAddress?: string;
  lastChangedAt: string;
}

export interface CustomerCommunicationPreferences {
  userId: string;
  email: string;
  phone?: string;
  marketingOptIn: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  categories: {
    promotionsAndDiscounts: boolean;
    curatedDrops: boolean;
    abandonedCartReminders: boolean;
    reviewRequests: boolean;
    backInStock: boolean;
  };
  transactional: {
    orderUpdates: boolean; // Always true - immutable
    paymentReceipts: boolean; // Always true - immutable
    escrowDisbursements: boolean; // Always true - immutable
  };
  consentRecord: CustomerConsentRecord;
  suppressionReason?: string;
}

export interface AbandonedCartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
}

export interface AbandonedCart {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  items: AbandonedCartItem[];
  cartTotal: number;
  status: 'abandoned' | 'recovery_sent' | 'recovered' | 'expired' | 'suppressed';
  recoveryAttempts: number;
  lastAttemptAt?: string;
  abandonedAt: string;
  recoveryToken: string;
  returnUrl: string;
  isOptedInForCartReminders: boolean;
}

export interface MarketingTemplate {
  id: string;
  name: string;
  channel: MarketingChannel;
  category: 'cart_recovery' | 'welcome' | 'win_back' | 'review_request' | 'promo';
  subject?: string;
  body: string;
  variables: string[];
}

export type AutomationTrigger =
  | 'cart_inactive_1h'
  | 'cart_inactive_24h'
  | 'welcome_new_user'
  | 'post_purchase_review_7d'
  | 'inactive_customer_30d';

export interface AutomationJob {
  id: string;
  trigger: AutomationTrigger;
  title: string;
  description: string;
  enabled: boolean;
  channel: MarketingChannel;
  delayMinutes: number;
  executionCount: number;
  lastRunAt?: string;
  successRatePercent: number;
  templateId: string;
}

export interface ChannelProviderStatus {
  channel: MarketingChannel;
  providerName: string;
  status: 'active_simulated' | 'configured' | 'pending_credentials';
  deliveryRate: number;
  requiredEnvVars: string[];
  missingEnvVars: string[];
  documentation: string;
}

export interface CampaignAttribution {
  id: string;
  campaignId: string;
  campaignName: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  orderTotal: number;
  couponCode?: string;
  attributedAt: string;
}

export interface CustomerCrmProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  city: string;
  state: string;
  status: 'active' | 'inactive' | 'dormant';
  orderCount: number;
  lifetimeSpend: number;
  firstOrderDate?: string;
  lastOrderDate?: string;
  marketingOptIn: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  preferredCategory?: string;
  retentionTier: 'vip_loyal' | 'promising' | 'at_risk' | 'dormant';
  lastTouchpoint?: string;
}
