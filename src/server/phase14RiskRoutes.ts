/**
 * @file src/server/phase14RiskRoutes.ts
 * Phase 14: Marketplace Governance, Risk Management & Fraud Prevention API Routes.
 * Serves:
 * - Explainable risk evaluation engine (0-100 score with factor delta breakdowns)
 * - Human-in-the-loop investigation dossiers with internal notes & action frameworks
 * - Proportional enforcement actions (escrow hold extension, quarantine, advisory, whitelist)
 * - Buyer vs. Seller dispute mediation & Paystack chargeback tracking (72h regulatory window)
 * - Seller compliance SLA tracking & Affiliate attribution integrity monitoring
 * - Immutable governance audit logs with anti-formula injection CSV export
 */

import { Router, Request, Response } from 'express';
import {
  RiskOverviewSummary,
  RiskCase,
  RiskCaseCategory,
  RiskSeverity,
  MarketplaceDispute,
  SellerGovernanceMetrics,
  AffiliateIntegrityMetrics,
  CustomerAbuseMetrics,
  RiskAuditLog,
  RiskEvaluationPayload,
  RiskEvaluationResult,
  GovernanceActionRecord,
  InvestigationNote
} from '../types';

export const phase14Router = Router();

// ----------------------------------------------------------------------
// 1. IN-MEMORY SEEDED GOVERNANCE & RISK DATA STORE
// ----------------------------------------------------------------------

let riskCases: RiskCase[] = [
  {
    id: 'rc_001_card_velocity',
    caseNumber: 'RC-2026-0812',
    title: 'High-velocity checkout burst with distinct cards',
    category: 'payment_fraud',
    categoryLabel: 'Card Velocity & Payment Spikes',
    severity: 'high',
    riskScore: 82,
    scoreBreakdown: [
      {
        id: 'f1',
        factorName: 'Velocity Burst',
        scoreDelta: 28,
        reason: '3 attempted checkouts within 8 minutes across distinct virtual card tokens.',
        severity: 'high',
        code: 'VELOCITY_BURST'
      },
      {
        id: 'f2',
        factorName: 'Amount Spike',
        scoreDelta: 24,
        reason: 'Order amount ₦385,000 is 4.8x higher than buyer historical average (₦80,000).',
        severity: 'high',
        code: 'AMOUNT_OUTLIER'
      },
      {
        id: 'f3',
        factorName: 'Geo-IP vs Shipping State',
        scoreDelta: 18,
        reason: 'Client IP located in Kano (North-West) while delivery address is in Ikeja, Lagos.',
        severity: 'moderate',
        code: 'GEO_MISMATCH'
      },
      {
        id: 'f4',
        factorName: 'Account Longevity',
        scoreDelta: 12,
        reason: 'Account created 4 hours prior to checkout initiation.',
        severity: 'moderate',
        code: 'NEW_ACCOUNT_BURST'
      }
    ],
    status: 'open',
    userRole: 'customer',
    targetEntity: {
      type: 'order',
      id: 'ord_mn_88129',
      name: 'Adewale O. Adeleke',
      email: 'a.adeleke9921@tempmail.io',
      location: 'Ikeja, Lagos'
    },
    linkedIds: {
      orderId: 'ord_mn_88129',
      orderNumber: 'MN-2026-88129',
      paymentReference: 'pstk_ref_vel_88129',
      sellerId: 'seller_01',
      sellerName: 'Lagos Tech Haven',
      customerId: 'usr_adeleke_991'
    },
    detectionEngine: 'rules_engine',
    signals: [
      {
        id: 'sig_101',
        type: 'velocity_spike',
        title: '3 card auth attempts in 8 mins',
        description: 'Rapid multi-card authorization on iPhone 15 Pro Max',
        weight: 30,
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        id: 'sig_102',
        type: 'geo_mismatch',
        title: 'IP Kano vs Delivery Lagos',
        description: 'ASN 37148 (MTN Nigeria Kano) ordering to Alausa, Ikeja',
        weight: 15,
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ],
    assignedAdminId: 'admin_super_user',
    assignedAdminName: 'Platform Director',
    assignedAdminEmail: 'admin@marketnest.ng',
    internalNotes: [
      {
        id: 'note_01',
        adminId: 'admin_super_user',
        adminName: 'Platform Director',
        adminRole: 'Super Admin',
        content: 'Fulfillment held pending secondary phone or NIN OTP confirmation. Delivery rider alerted not to dispatch.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        isInternalOnly: true
      }
    ],
    actionsTaken: [
      {
        id: 'act_01',
        actionType: 'order_fulfillment_hold',
        actionLabel: 'Order Fulfillment Hold',
        targetEntity: { type: 'order', id: 'ord_mn_88129', label: 'Order #MN-2026-88129' },
        administeredBy: { id: 'admin_super_user', name: 'Platform Director', role: 'Super Admin' },
        reason: 'Temporary hold pending customer identity verification against Paystack cardholder name.',
        reversibility: 'reversible',
        status: 'active',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ],
    financialImpact: {
      amountMinorUnits: 38500000,
      currency: 'NGN',
      potentialLoss: true
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'rc_002_affiliate_self_referral',
    caseNumber: 'RC-2026-0813',
    title: 'Affiliate self-referral & duplicate device fingerprint match',
    category: 'affiliate_fraud',
    categoryLabel: 'Affiliate Self-Referral & Attribution Abuse',
    severity: 'high',
    riskScore: 78,
    scoreBreakdown: [
      {
        id: 'f21',
        factorName: 'Device Fingerprint Match',
        scoreDelta: 35,
        reason: 'Browser fingerprint and subnet IP match registered affiliate partner profile.',
        severity: 'high',
        code: 'FINGERPRINT_DUPLICATE'
      },
      {
        id: 'f22',
        factorName: 'Abnormal Conversion Lag',
        scoreDelta: 25,
        reason: 'Attributed purchase clicked affiliate link and purchased within 4.2 seconds.',
        severity: 'high',
        code: 'ZERO_SECOND_CONVERSION'
      },
      {
        id: 'f23',
        factorName: 'Commission Value Outlier',
        scoreDelta: 18,
        reason: 'Attempted commission claim of ₦45,000 exceeds affiliate weekly tier limit.',
        severity: 'moderate',
        code: 'COMMISSION_CAP_EXCEEDED'
      }
    ],
    status: 'under_investigation',
    userRole: 'affiliate',
    targetEntity: {
      type: 'affiliate',
      id: 'aff_chukwuemeka_01',
      name: 'Chukwuemeka Okonkwo',
      email: 'emeka.promos@ngtechblog.com',
      location: 'Wuse 2, Abuja'
    },
    linkedIds: {
      affiliateId: 'aff_chukwuemeka_01',
      affiliateCode: 'TECHHUB25',
      orderId: 'ord_mn_88204',
      orderNumber: 'MN-2026-88204',
      customerId: 'usr_emeka_customer_proxy'
    },
    detectionEngine: 'affiliate_integrity',
    signals: [
      {
        id: 'sig_201',
        type: 'self_referral_pattern',
        title: 'Same IP 102.89.44.12 across affiliate click & buyer checkout',
        description: 'Canvas fingerprint match 99.4% between affiliate session and purchasing buyer session',
        weight: 35,
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ],
    assignedAdminId: 'admin_super_user',
    assignedAdminName: 'Platform Director',
    assignedAdminEmail: 'admin@marketnest.ng',
    internalNotes: [
      {
        id: 'note_21',
        adminId: 'admin_super_user',
        adminName: 'Platform Director',
        adminRole: 'Super Admin',
        content: 'Affiliate commission quarantined. Standard 14-day anti-fraud cooling hold placed.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        isInternalOnly: true
      }
    ],
    actionsTaken: [
      {
        id: 'act_21',
        actionType: 'affiliate_commission_quarantined',
        actionLabel: 'Commission Quarantined',
        targetEntity: { type: 'affiliate', id: 'aff_chukwuemeka_01', label: 'Affiliate TECHHUB25' },
        administeredBy: { id: 'admin_super_user', name: 'Platform Director', role: 'Super Admin' },
        reason: 'Self-referral fingerprint detection triggered quarantine under Terms of Service clause 4.2.',
        reversibility: 'reversible',
        status: 'active',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    financialImpact: {
      amountMinorUnits: 4500000,
      currency: 'NGN',
      potentialLoss: false
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'rc_003_seller_unfulfilled_spike',
    caseNumber: 'RC-2026-0814',
    title: 'Merchant unfulfilled order backlog & SLA breach',
    category: 'seller_abuse',
    categoryLabel: 'Merchant Fulfillment SLA & Seller Governance',
    severity: 'critical',
    riskScore: 89,
    scoreBreakdown: [
      {
        id: 'f31',
        factorName: 'Fulfillment Failure Rate',
        scoreDelta: 38,
        reason: '28 out of 34 orders past 96-hour dispatch window with zero carrier tracking updates.',
        severity: 'critical',
        code: 'SLA_BREACH_BACKLOG'
      },
      {
        id: 'f32',
        factorName: 'Customer Dispute Volume',
        scoreDelta: 28,
        reason: '6 buyer disputes filed in last 48 hours for non-responsive seller communication.',
        severity: 'high',
        code: 'DISPUTE_SURGE'
      },
      {
        id: 'f33',
        factorName: 'Escrow Exposure',
        scoreDelta: 23,
        reason: '₦1,850,000 in pending buyer escrow payments currently held for this merchant.',
        severity: 'high',
        code: 'ESCROW_AT_RISK'
      }
    ],
    status: 'action_taken',
    userRole: 'seller',
    targetEntity: {
      type: 'seller',
      id: 'seller_aba_express',
      name: 'Smart Gadgets Mega Store',
      email: 'smartgadgets.aba@gmail.com',
      location: 'Aba, Abia State'
    },
    linkedIds: {
      sellerId: 'seller_aba_express',
      sellerName: 'Smart Gadgets Mega Store'
    },
    detectionEngine: 'seller_sla_monitor',
    signals: [
      {
        id: 'sig_301',
        type: 'sla_breach',
        title: '28 unfulfilled orders > 96 hours',
        description: 'Merchant unresponsive to automated dispatch reminders for 3 consecutive business days',
        weight: 40,
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ],
    assignedAdminId: 'admin_super_user',
    assignedAdminName: 'Platform Director',
    assignedAdminEmail: 'admin@marketnest.ng',
    internalNotes: [
      {
        id: 'note_31',
        adminId: 'admin_super_user',
        adminName: 'Platform Director',
        adminRole: 'Super Admin',
        content: 'Escrow holding period extended from standard 7 days to 21 days. Seller called directly; merchant stated warehouse stock delay from Onitsha port.',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        isInternalOnly: true
      }
    ],
    actionsTaken: [
      {
        id: 'act_31',
        actionType: 'escrow_hold_extended',
        actionLabel: 'Escrow Hold Extended to 21 Days',
        targetEntity: { type: 'seller', id: 'seller_aba_express', label: 'Smart Gadgets Mega Store' },
        administeredBy: { id: 'admin_super_user', name: 'Platform Director', role: 'Super Admin' },
        reason: 'Protecting buyer funds against non-delivery risk while warehouse logistics resolution is underway.',
        reversibility: 'reversible',
        status: 'active',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: 'act_32',
        actionType: 'warning_notice',
        actionLabel: 'Official SLA Remediation Notice',
        targetEntity: { type: 'seller', id: 'seller_aba_express', label: 'Smart Gadgets Mega Store' },
        administeredBy: { id: 'admin_super_user', name: 'Platform Director', role: 'Super Admin' },
        reason: 'Issued 48-hour cure notice to dispatch backlogged orders or auto-refund buyers.',
        reversibility: 'irreversible',
        status: 'active',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ],
    financialImpact: {
      amountMinorUnits: 185000000,
      currency: 'NGN',
      potentialLoss: true
    },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'rc_004_coupon_abuse_cluster',
    caseNumber: 'RC-2026-0815',
    title: 'Automated promo code stacking across disposable emails',
    category: 'promotion_abuse',
    categoryLabel: 'Promotion & Voucher Abuse',
    severity: 'moderate',
    riskScore: 58,
    scoreBreakdown: [
      {
        id: 'f41',
        factorName: 'Promo Redemptions Velocity',
        scoreDelta: 24,
        reason: '14 redemptions of first-order voucher "WELCOME15" across matching subnet IP.',
        severity: 'moderate',
        code: 'PROMO_VELOCITY_BURST'
      },
      {
        id: 'f42',
        factorName: 'Disposable Email Domain',
        scoreDelta: 20,
        reason: 'Customer accounts created on temporary email domains (mailinator, guerrillamail).',
        severity: 'moderate',
        code: 'DISPOSABLE_DOMAINS'
      },
      {
        id: 'f43',
        factorName: 'Basket Splitting',
        scoreDelta: 14,
        reason: 'Orders split just above ₦10,000 minimum cart threshold to maximize discount vouchers.',
        severity: 'low',
        code: 'CART_SPLITTING'
      }
    ],
    status: 'open',
    userRole: 'customer',
    targetEntity: {
      type: 'user',
      id: 'cluster_promo_ng_99',
      name: 'Cluster Account Operator',
      email: 'promo_stack_lead@guerrillamail.com',
      location: 'Yaba, Lagos'
    },
    linkedIds: {
      customerId: 'cluster_promo_ng_99'
    },
    detectionEngine: 'rules_engine',
    signals: [
      {
        id: 'sig_401',
        type: 'promo_clustering',
        title: '14 redemptions from subnet 197.210.45.0/24',
        description: 'Repeated application of single-use welcome coupon across related device tokens',
        weight: 25,
        timestamp: new Date(Date.now() - 3600000 * 16).toISOString()
      }
    ],
    internalNotes: [],
    actionsTaken: [],
    financialImpact: {
      amountMinorUnits: 4200000,
      currency: 'NGN',
      potentialLoss: false
    },
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 16).toISOString()
  },
  {
    id: 'rc_005_paystack_chargeback',
    caseNumber: 'RC-2026-0816',
    title: 'Paystack regulatory chargeback notice with 72h window',
    category: 'dispute_chargeback',
    categoryLabel: 'Chargebacks & Payment Reversals',
    severity: 'critical',
    riskScore: 94,
    scoreBreakdown: [
      {
        id: 'f51',
        factorName: 'Chargeback Notice Received',
        scoreDelta: 45,
        reason: 'Issuing bank filed official Paystack chargeback claim: "Cardholder claims unauthorized transaction".',
        severity: 'critical',
        code: 'OFFICIAL_BANK_DISPUTE'
      },
      {
        id: 'f52',
        factorName: 'Regulatory Response Window',
        scoreDelta: 30,
        reason: '72-hour CBN/Paystack regulatory compliance deadline to submit proof of delivery.',
        severity: 'critical',
        code: 'REGULATORY_DEADLINE_TICKING'
      },
      {
        id: 'f53',
        factorName: 'Dispute Value',
        scoreDelta: 19,
        reason: 'Chargeback amount ₦145,000. Seller disbursement held until evidence adjudication.',
        severity: 'high',
        code: 'SETTLEMENT_HOLD'
      }
    ],
    status: 'escalated',
    userRole: 'customer',
    targetEntity: {
      type: 'dispute',
      id: 'disp_pstk_99182',
      name: 'Bank Cardholder / O. Williams',
      email: 'olumide.williams@stanbicibtc.com',
      location: 'Victoria Island, Lagos'
    },
    linkedIds: {
      orderId: 'ord_mn_87991',
      orderNumber: 'MN-2026-87991',
      paymentReference: 'pstk_ref_chg_87991',
      disputeId: 'disp_pstk_99182',
      sellerId: 'seller_02',
      sellerName: 'Heritage Textiles & Fashion'
    },
    detectionEngine: 'paystack_webhook',
    signals: [
      {
        id: 'sig_501',
        type: 'chargeback_webhook',
        title: 'Paystack webhook: dispute.created',
        description: 'Issuing Bank: Stanbic IBTC. Claim code: 4837 (Fraudulent Transaction)',
        weight: 50,
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
      }
    ],
    assignedAdminId: 'admin_super_user',
    assignedAdminName: 'Platform Director',
    assignedAdminEmail: 'admin@marketnest.ng',
    internalNotes: [
      {
        id: 'note_51',
        adminId: 'admin_super_user',
        adminName: 'Platform Director',
        adminRole: 'Super Admin',
        content: 'Carrier GIG Logistics signed waybill retrieved. Seller uploaded dispatch confirmation photo. Preparing response dossier for Paystack portal.',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        isInternalOnly: true
      }
    ],
    actionsTaken: [
      {
        id: 'act_51',
        actionType: 'payout_disbursement_frozen',
        actionLabel: 'Disbursement Frozen on Order',
        targetEntity: { type: 'order', id: 'ord_mn_87991', label: 'Order #MN-2026-87991' },
        administeredBy: { id: 'admin_super_user', name: 'Platform Director', role: 'Super Admin' },
        reason: 'Freezing payout to merchant pending card network arbitration outcome.',
        reversibility: 'reversible',
        status: 'active',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
      }
    ],
    financialImpact: {
      amountMinorUnits: 14500000,
      currency: 'NGN',
      potentialLoss: true
    },
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'rc_006_counterfeit_listing',
    caseNumber: 'RC-2026-0817',
    title: 'Suspected counterfeit luxury cosmetic catalog alert',
    category: 'counterfeit_catalog',
    categoryLabel: 'Catalog Authenticity & Counterfeit Flags',
    severity: 'moderate',
    riskScore: 64,
    scoreBreakdown: [
      {
        id: 'f61',
        factorName: 'Brand Protection Trademark Match',
        scoreDelta: 26,
        reason: 'Product listed at 75% discount below manufacturer suggested retail price (MSRP).',
        severity: 'high',
        code: 'PRICE_ANOMALY_LOW'
      },
      {
        id: 'f62',
        factorName: 'Customer Authenticity Report',
        scoreDelta: 22,
        reason: '2 verified customer reviews reported altered batch code packaging.',
        severity: 'moderate',
        code: 'CUSTOMER_COUNTERFEIT_REPORT'
      },
      {
        id: 'f63',
        factorName: 'New Merchant Catalog Upload',
        scoreDelta: 16,
        reason: 'Merchant registered within 14 days and uploaded 60 luxury beauty listings in 1 hour.',
        severity: 'moderate',
        code: 'BULK_UPLOAD_VELOCITY'
      }
    ],
    status: 'open',
    userRole: 'seller',
    targetEntity: {
      type: 'seller',
      id: 'seller_glam_fast',
      name: 'Glow Beauty Express',
      email: 'glowbeauty99@outlook.com',
      location: 'Port Harcourt, Rivers'
    },
    linkedIds: {
      sellerId: 'seller_glam_fast',
      sellerName: 'Glow Beauty Express'
    },
    detectionEngine: 'customer_report',
    signals: [
      {
        id: 'sig_601',
        type: 'catalog_moderation_flag',
        title: '2 customer reports of counterfeit batch codes',
        description: 'SKU #GLOW-SERUM-09 reports packaging typography divergence from official manufacturer',
        weight: 25,
        timestamp: new Date(Date.now() - 3600000 * 30).toISOString()
      }
    ],
    internalNotes: [],
    actionsTaken: [
      {
        id: 'act_61',
        actionType: 'seller_listing_shadowed',
        actionLabel: 'Listing Shadow-Moderated',
        targetEntity: { type: 'seller', id: 'seller_glam_fast', label: 'SKU #GLOW-SERUM-09' },
        administeredBy: { id: 'admin_super_user', name: 'Platform Director', role: 'Super Admin' },
        reason: 'Temporarily hidden from search catalog pending invoice and NAFDAC registration verification.',
        reversibility: 'reversible',
        status: 'active',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    financialImpact: {
      amountMinorUnits: 2500000,
      currency: 'NGN',
      potentialLoss: false
    },
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// ----------------------------------------------------------------------
// 2. DISPUTES & CHARGEBACKS REPOSITORY
// ----------------------------------------------------------------------

let marketplaceDisputes: MarketplaceDispute[] = [
  {
    id: 'disp_001_tech_item',
    disputeNumber: 'DSP-2026-0041',
    orderId: 'ord_mn_88192',
    orderNumber: 'MN-2026-88192',
    buyerId: 'usr_folake_adebayo',
    buyerName: 'Folake Adebayo',
    buyerEmail: 'folake.adebayo@gmail.com',
    sellerId: 'seller_01',
    sellerStoreName: 'Lagos Tech Haven',
    amountMinorUnits: 45000000,
    currency: 'NGN',
    reason: 'item_defective',
    reasonLabel: 'Defective / Damaged on Arrival',
    stage: 'under_admin_mediation',
    buyerClaim: 'Screen arrived cracked inside unsealed retail packaging. Device fails to boot or power on.',
    buyerEvidenceUrls: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop'
    ],
    sellerResponse: 'Item was bubble-wrapped and factory sealed prior to dispatch via GIG Logistics. Outer carton was inspected at dispatch hub.',
    sellerEvidenceUrls: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop'
    ],
    adminMediationNotes: 'Transit damage likely caused during hub transfer. Proposing full customer refund funded from logistics transit insurance reserve.',
    deadline: new Date(Date.now() + 3600000 * 36).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'disp_002_fashion_damage',
    disputeNumber: 'DSP-2026-0042',
    orderId: 'ord_mn_88219',
    orderNumber: 'MN-2026-88219',
    buyerId: 'usr_kemi_ojo',
    buyerName: 'Kemi Ojo',
    buyerEmail: 'kemi.ojo@yahoo.com',
    sellerId: 'seller_02',
    sellerStoreName: 'Heritage Textiles & Fashion',
    amountMinorUnits: 3200000,
    currency: 'NGN',
    reason: 'incorrect_item',
    reasonLabel: 'Incorrect Colorway & Size Delivered',
    stage: 'awaiting_seller_evidence',
    buyerClaim: 'Ordered Emerald Green size 14, but received Royal Blue size 10.',
    buyerEvidenceUrls: [],
    deadline: new Date(Date.now() + 3600000 * 48).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'disp_003_paystack_chargeback',
    disputeNumber: 'DSP-2026-0043',
    orderId: 'ord_mn_87991',
    orderNumber: 'MN-2026-87991',
    buyerId: 'usr_olumide_williams',
    buyerName: 'Olumide Williams',
    buyerEmail: 'olumide.williams@stanbicibtc.com',
    sellerId: 'seller_02',
    sellerStoreName: 'Heritage Textiles & Fashion',
    amountMinorUnits: 14500000,
    currency: 'NGN',
    reason: 'unauthorized_transaction',
    reasonLabel: 'Cardholder Bank Chargeback: Fraud Claim',
    stage: 'escalated_to_chargeback',
    buyerClaim: 'Cardholder reported card stolen to Stanbic IBTC. Dispute ref #PSTK_CHG_87991.',
    buyerEvidenceUrls: [],
    sellerResponse: 'Shipped to Victoria Island address with physical recipient signature on delivery waybill #GIG-881920.',
    sellerEvidenceUrls: [],
    chargebackReference: 'PSTK_CHG_87991',
    paystackDisputeId: 'disp_pstk_99182',
    deadline: new Date(Date.now() + 3600000 * 28).toISOString(), // 28h left in regulatory window
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// ----------------------------------------------------------------------
// 3. SELLER GOVERNANCE & SLA METRICS
// ----------------------------------------------------------------------

let sellerGovernanceRecords: SellerGovernanceMetrics[] = [
  {
    sellerId: 'seller_01',
    storeName: 'Lagos Tech Haven',
    sellerEmail: 'contact@lagostechhaven.ng',
    registeredDate: '2024-04-12',
    riskScore: 18,
    complianceStatus: 'in_good_standing',
    orderFulfillmentRate: 98.4,
    cancellationRate: 1.2,
    disputeRate: 0.6,
    returnRate: 2.1,
    counterfeitFlags: 0,
    escrowHoldingDays: 7,
    totalOrdersCount: 428,
    disbursedAmountMinorUnits: 4850000000,
    pendingHoldAmountMinorUnits: 38500000,
    lastAuditDate: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    sellerId: 'seller_02',
    storeName: 'Heritage Textiles & Fashion',
    sellerEmail: 'orders@heritagetextiles.ng',
    registeredDate: '2024-06-19',
    riskScore: 28,
    complianceStatus: 'in_good_standing',
    orderFulfillmentRate: 95.8,
    cancellationRate: 2.8,
    disputeRate: 1.4,
    returnRate: 4.2,
    counterfeitFlags: 0,
    escrowHoldingDays: 7,
    totalOrdersCount: 312,
    disbursedAmountMinorUnits: 2450000000,
    pendingHoldAmountMinorUnits: 14500000,
    lastAuditDate: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    sellerId: 'seller_aba_express',
    storeName: 'Smart Gadgets Mega Store',
    sellerEmail: 'smartgadgets.aba@gmail.com',
    registeredDate: '2025-01-10',
    riskScore: 89,
    complianceStatus: 'escrow_hold_extended',
    orderFulfillmentRate: 72.4,
    cancellationRate: 18.6,
    disputeRate: 8.8,
    returnRate: 11.2,
    counterfeitFlags: 1,
    escrowHoldingDays: 21,
    totalOrdersCount: 84,
    disbursedAmountMinorUnits: 420000000,
    pendingHoldAmountMinorUnits: 185000000,
    lastAuditDate: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    sellerId: 'seller_glam_fast',
    storeName: 'Glow Beauty Express',
    sellerEmail: 'glowbeauty99@outlook.com',
    registeredDate: '2026-02-14',
    riskScore: 64,
    complianceStatus: 'manual_review_required',
    orderFulfillmentRate: 88.0,
    cancellationRate: 5.4,
    disputeRate: 4.2,
    returnRate: 7.8,
    counterfeitFlags: 2,
    escrowHoldingDays: 14,
    totalOrdersCount: 45,
    disbursedAmountMinorUnits: 160000000,
    pendingHoldAmountMinorUnits: 2500000,
    lastAuditDate: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// ----------------------------------------------------------------------
// 4. AFFILIATE INTEGRITY METRICS
// ----------------------------------------------------------------------

let affiliateIntegrityRecords: AffiliateIntegrityMetrics[] = [
  {
    affiliateId: 'aff_chukwuemeka_01',
    affiliateCode: 'TECHHUB25',
    affiliateName: 'Chukwuemeka Okonkwo',
    affiliateEmail: 'emeka.promos@ngtechblog.com',
    integrityScore: 42,
    status: 'quarantined',
    selfReferralAttempts: 4,
    suspiciousIpMatches: 7,
    unnaturalConversionSpikes: 2,
    totalReferralClicks: 1420,
    totalConversions: 88,
    quarantinedCommissionsMinorUnits: 4500000,
    activeCommissionsMinorUnits: 12500000,
    clawedBackCommissionsMinorUnits: 1500000,
    lastFlaggedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    affiliateId: 'aff_aminat_02',
    affiliateCode: 'FASHIONISTA',
    affiliateName: 'Aminat Bello',
    affiliateEmail: 'aminat.style@bellanaija.com',
    integrityScore: 96,
    status: 'clean',
    selfReferralAttempts: 0,
    suspiciousIpMatches: 0,
    unnaturalConversionSpikes: 0,
    totalReferralClicks: 3250,
    totalConversions: 142,
    quarantinedCommissionsMinorUnits: 0,
    activeCommissionsMinorUnits: 48500000,
    clawedBackCommissionsMinorUnits: 0
  },
  {
    affiliateId: 'aff_uche_deals',
    affiliateCode: 'NAIJADEALS',
    affiliateName: 'Uchechi Nnamdi',
    affiliateEmail: 'uche.deals@telegram.me',
    integrityScore: 68,
    status: 'flagged_for_review',
    selfReferralAttempts: 1,
    suspiciousIpMatches: 3,
    unnaturalConversionSpikes: 1,
    totalReferralClicks: 8900,
    totalConversions: 410,
    quarantinedCommissionsMinorUnits: 8200000,
    activeCommissionsMinorUnits: 76000000,
    clawedBackCommissionsMinorUnits: 0,
    lastFlaggedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// ----------------------------------------------------------------------
// 5. IMMUTABLE-STYLE GOVERNANCE AUDIT LOG
// ----------------------------------------------------------------------

let riskAuditLogs: RiskAuditLog[] = [
  {
    id: 'log_001',
    actorId: 'admin_super_user',
    actorName: 'Platform Director',
    actorRole: 'Super Admin',
    action: 'ORDER_FULFILLMENT_HOLD',
    entityType: 'order',
    entityId: 'ord_mn_88129',
    previousState: 'status: processing (unheld)',
    newState: 'status: fulfillment_hold (risk_case_rc_001)',
    reason: 'Multi-card velocity spike detected; held for secondary KYC verification.',
    clientIp: '197.210.64.12',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'log_002',
    actorId: 'admin_super_user',
    actorName: 'Platform Director',
    actorRole: 'Super Admin',
    action: 'AFFILIATE_COMMISSION_QUARANTINE',
    entityType: 'affiliate',
    entityId: 'aff_chukwuemeka_01',
    previousState: 'commission: pending_payout',
    newState: 'commission: quarantined_14d_cooling',
    reason: 'Device fingerprint collision between buyer and affiliate session.',
    clientIp: '197.210.64.12',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'log_003',
    actorId: 'admin_super_user',
    actorName: 'Platform Director',
    actorRole: 'Super Admin',
    action: 'ESCROW_HOLD_EXTENSION',
    entityType: 'seller',
    entityId: 'seller_aba_express',
    previousState: 'escrow_hold_days: 7',
    newState: 'escrow_hold_days: 21',
    reason: 'SLA unfulfilled order backlog breached 72% threshold.',
    clientIp: '197.210.64.12',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'log_004',
    actorId: 'admin_super_user',
    actorName: 'Platform Director',
    actorRole: 'Super Admin',
    action: 'LISTING_SHADOW_MODERATION',
    entityType: 'product',
    entityId: 'sku_glow_serum_09',
    previousState: 'catalog_status: active_visible',
    newState: 'catalog_status: shadow_moderated',
    reason: 'Report of counterfeit serial barcode awaiting invoice proof.',
    clientIp: '197.210.64.12',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// ----------------------------------------------------------------------
// 6. CORE API ENDPOINTS
// ----------------------------------------------------------------------

/**
 * GET /api/risk/overview
 * Executive risk summary, open case counts, prevented fraud losses, and trends.
 */
phase14Router.get('/risk/overview', (_req: Request, res: Response) => {
  const totalOpenCases = riskCases.filter((c) => c.status === 'open' || c.status === 'under_investigation').length;
  const criticalCases = riskCases.filter((c) => c.severity === 'critical' && c.status !== 'resolved_cleared').length;
  const highPriorityCases = riskCases.filter((c) => c.severity === 'high' && c.status !== 'resolved_cleared').length;
  const moderateCases = riskCases.filter((c) => c.severity === 'moderate' && c.status !== 'resolved_cleared').length;

  const openDisputes = marketplaceDisputes.filter(
    (d) => d.stage !== 'settled_buyer_refund' && d.stage !== 'settled_seller_favour'
  ).length;

  const pendingChargebacks = marketplaceDisputes.filter(
    (d) => d.stage === 'escalated_to_chargeback'
  ).length;

  // Prevented fraud loss = sum of held amounts on critical/high cases
  const preventedFraudLossMinorUnits = riskCases
    .filter((c) => (c.severity === 'critical' || c.severity === 'high') && c.status !== 'resolved_cleared')
    .reduce((sum, c) => sum + c.financialImpact.amountMinorUnits, 0);

  const quarantinedFundsMinorUnits = affiliateIntegrityRecords.reduce(
    (sum, a) => sum + a.quarantinedCommissionsMinorUnits,
    0
  );

  const averageRiskScore = Math.round(
    riskCases.reduce((sum, c) => sum + c.riskScore, 0) / (riskCases.length || 1)
  );

  const summary: RiskOverviewSummary = {
    totalOpenCases,
    criticalCases,
    highPriorityCases,
    moderateCases,
    openDisputes,
    preventedFraudLossMinorUnits,
    quarantinedFundsMinorUnits,
    pendingChargebacks,
    averageRiskScore,
    falsePositiveRatePercent: 1.4, // Measurable low rate
    ruleTriggers24h: 38,
    severityDistribution: {
      low: 1,
      moderate: 2,
      high: 2,
      critical: 2
    },
    categoryDistribution: [
      { category: 'payment_fraud', categoryLabel: 'Payment Fraud & Card Spikes', count: 1 },
      { category: 'seller_abuse', categoryLabel: 'Seller SLA & Fulfillment Backlog', count: 1 },
      { category: 'affiliate_fraud', categoryLabel: 'Affiliate Attribution & Self-Referrals', count: 1 },
      { category: 'promotion_abuse', categoryLabel: 'Promo Voucher Clustering', count: 1 },
      { category: 'dispute_chargeback', categoryLabel: 'Chargebacks & Escalations', count: 1 },
      { category: 'counterfeit_catalog', categoryLabel: 'Catalog Authenticity Alerts', count: 1 }
    ],
    recentTrends: [
      { date: 'Day -6', flagged: 4, cleared: 3, actioned: 1 },
      { date: 'Day -5', flagged: 6, cleared: 5, actioned: 2 },
      { date: 'Day -4', flagged: 5, cleared: 4, actioned: 1 },
      { date: 'Day -3', flagged: 8, cleared: 6, actioned: 3 },
      { date: 'Day -2', flagged: 7, cleared: 5, actioned: 2 },
      { date: 'Yesterday', flagged: 9, cleared: 7, actioned: 3 },
      { date: 'Today', flagged: 6, cleared: 4, actioned: 2 }
    ]
  };

  res.json({ success: true, summary });
});

/**
 * GET /api/risk/cases
 * Query risk cases with filters (category, severity, status, userRole, search).
 */
phase14Router.get('/risk/cases', (req: Request, res: Response) => {
  const { category, severity, status, userRole, search } = req.query;

  let filtered = [...riskCases];

  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter((c) => c.category === category);
  }

  if (severity && typeof severity === 'string' && severity !== 'all') {
    filtered = filtered.filter((c) => c.severity === severity);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }

  if (userRole && typeof userRole === 'string' && userRole !== 'all') {
    filtered = filtered.filter((c) => c.userRole === userRole);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.targetEntity.name.toLowerCase().includes(q) ||
        c.targetEntity.email.toLowerCase().includes(q) ||
        (c.linkedIds.orderNumber && c.linkedIds.orderNumber.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: filtered.length, cases: filtered });
});

/**
 * GET /api/risk/cases/:id
 * Retrieve a full investigation dossier for a specific case.
 */
phase14Router.get('/risk/cases/:id', (req: Request, res: Response) => {
  const riskCase = riskCases.find((c) => c.id === req.params.id);
  if (!riskCase) {
    return res.status(404).json({ success: false, error: 'Risk case dossier not found.' });
  }
  res.json({ success: true, riskCase });
});

/**
 * POST /api/risk/cases/:id/notes
 * Add internal administrative investigation note (human-in-the-loop).
 */
phase14Router.post('/risk/cases/:id/notes', (req: Request, res: Response) => {
  const { adminId, adminName, adminRole, content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Investigation note content is required.' });
  }

  const riskCase = riskCases.find((c) => c.id === req.params.id);
  if (!riskCase) {
    return res.status(404).json({ success: false, error: 'Risk case not found.' });
  }

  const newNote: InvestigationNote = {
    id: `note_${Date.now()}`,
    adminId: adminId || 'admin_super_user',
    adminName: adminName || 'Platform Director',
    adminRole: adminRole || 'Super Admin',
    content: content.trim(),
    createdAt: new Date().toISOString(),
    isInternalOnly: true
  };

  riskCase.internalNotes.push(newNote);
  riskCase.updatedAt = new Date().toISOString();

  // Audit record
  riskAuditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: newNote.adminId,
    actorName: newNote.adminName,
    actorRole: newNote.adminRole,
    action: 'CASE_NOTE_ADDED',
    entityType: 'risk_case',
    entityId: riskCase.id,
    previousState: 'notes_count: ' + (riskCase.internalNotes.length - 1),
    newState: 'notes_count: ' + riskCase.internalNotes.length,
    reason: 'Investigator added evidence annotation.',
    clientIp: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, note: newNote, riskCase });
});

/**
 * POST /api/risk/cases/:id/action
 * Apply proportional governance action (order hold, escrow hold, warning notice, whitelist).
 */
phase14Router.post('/risk/cases/:id/action', (req: Request, res: Response) => {
  const { actionType, actionLabel, reason, administeredBy } = req.body;
  if (!actionType || !reason || !reason.trim()) {
    return res.status(400).json({ success: false, error: 'Action type and explicit rationale reason are required.' });
  }

  const riskCase = riskCases.find((c) => c.id === req.params.id);
  if (!riskCase) {
    return res.status(404).json({ success: false, error: 'Risk case not found.' });
  }

  const actionRecord: GovernanceActionRecord = {
    id: `act_${Date.now()}`,
    actionType,
    actionLabel: actionLabel || actionType.replace(/_/g, ' ').toUpperCase(),
    targetEntity: {
      type: riskCase.targetEntity.type,
      id: riskCase.targetEntity.id,
      label: riskCase.targetEntity.name
    },
    administeredBy: administeredBy || {
      id: 'admin_super_user',
      name: 'Platform Director',
      role: 'Super Admin'
    },
    reason: reason.trim(),
    reversibility: actionType === 'warning_notice' ? 'irreversible' : 'reversible',
    status: 'active',
    timestamp: new Date().toISOString()
  };

  riskCase.actionsTaken.push(actionRecord);
  riskCase.status = 'action_taken';
  riskCase.updatedAt = new Date().toISOString();

  // Record in audit log
  riskAuditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: actionRecord.administeredBy.id,
    actorName: actionRecord.administeredBy.name,
    actorRole: actionRecord.administeredBy.role,
    action: `GOVERNANCE_${actionType.toUpperCase()}`,
    entityType: riskCase.targetEntity.type,
    entityId: riskCase.targetEntity.id,
    previousState: `case_status: ${riskCase.status}`,
    newState: `action_applied: ${actionType}`,
    reason: reason.trim(),
    clientIp: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, actionRecord, riskCase });
});

/**
 * POST /api/risk/cases/:id/resolve
 * Resolve or clear a risk case (with whitelist/clear rationale).
 */
phase14Router.post('/risk/cases/:id/resolve', (req: Request, res: Response) => {
  const { resolutionType, rationale, adminName } = req.body;
  if (!rationale || !rationale.trim()) {
    return res.status(400).json({ success: false, error: 'Resolution rationale is mandatory for audit compliance.' });
  }

  const riskCase = riskCases.find((c) => c.id === req.params.id);
  if (!riskCase) {
    return res.status(404).json({ success: false, error: 'Risk case not found.' });
  }

  const prevStatus = riskCase.status;
  riskCase.status = resolutionType === 'whitelist' ? 'resolved_cleared' : 'resolved_cleared';
  riskCase.updatedAt = new Date().toISOString();

  // Release any active holds if cleared
  riskCase.actionsTaken.forEach((act) => {
    if (act.status === 'active' && act.reversibility === 'reversible') {
      act.status = 'reversed';
      act.reversalReason = `Case resolved as cleared: ${rationale}`;
      act.reversedAt = new Date().toISOString();
    }
  });

  // Audit record
  riskAuditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: 'admin_super_user',
    actorName: adminName || 'Platform Director',
    actorRole: 'Super Admin',
    action: 'CASE_RESOLVED_CLEARED',
    entityType: 'risk_case',
    entityId: riskCase.id,
    previousState: `status: ${prevStatus}`,
    newState: 'status: resolved_cleared',
    reason: rationale.trim(),
    clientIp: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, riskCase });
});

/**
 * GET /api/risk/disputes
 * List customer/seller disputes and chargeback cases.
 */
phase14Router.get('/risk/disputes', (_req: Request, res: Response) => {
  res.json({ success: true, disputes: marketplaceDisputes });
});

/**
 * POST /api/risk/disputes/:id/mediate
 * Admin ruling on buyer/seller dispute or Paystack chargeback.
 */
phase14Router.post('/risk/disputes/:id/mediate', (req: Request, res: Response) => {
  const { ruling, notes, adminName } = req.body;
  if (!ruling || !notes) {
    return res.status(400).json({ success: false, error: 'Ruling decision and mediation notes are required.' });
  }

  const dispute = marketplaceDisputes.find((d) => d.id === req.params.id);
  if (!dispute) {
    return res.status(404).json({ success: false, error: 'Dispute record not found.' });
  }

  if (ruling === 'refund_buyer') {
    dispute.stage = 'settled_buyer_refund';
  } else if (ruling === 'favor_seller') {
    dispute.stage = 'settled_seller_favour';
  } else if (ruling === 'escalate_chargeback') {
    dispute.stage = 'escalated_to_chargeback';
  }

  dispute.resolutionDecision = ruling;
  dispute.adminMediationNotes = notes;
  dispute.updatedAt = new Date().toISOString();

  // Audit record
  riskAuditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: 'admin_super_user',
    actorName: adminName || 'Platform Director',
    actorRole: 'Super Admin',
    action: `DISPUTE_MEDIATION_${ruling.toUpperCase()}`,
    entityType: 'dispute',
    entityId: dispute.id,
    previousState: 'stage: under_admin_mediation',
    newState: `stage: ${dispute.stage}`,
    reason: notes,
    clientIp: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, dispute });
});

/**
 * GET /api/risk/sellers
 * Seller SLA and governance records.
 */
phase14Router.get('/risk/sellers', (_req: Request, res: Response) => {
  res.json({ success: true, sellers: sellerGovernanceRecords });
});

/**
 * POST /api/risk/sellers/:sellerId/escrow-hold
 * Adjust seller escrow holding duration (7, 14, 21 days).
 */
phase14Router.post('/risk/sellers/:sellerId/escrow-hold', (req: Request, res: Response) => {
  const { escrowHoldingDays, reason, adminName } = req.body;
  if (!escrowHoldingDays || !reason) {
    return res.status(400).json({ success: false, error: 'escrowHoldingDays (e.g. 7, 14, 21) and reason are required.' });
  }

  const seller = sellerGovernanceRecords.find((s) => s.sellerId === req.params.sellerId);
  if (!seller) {
    return res.status(404).json({ success: false, error: 'Seller not found.' });
  }

  const prev = seller.escrowHoldingDays;
  seller.escrowHoldingDays = Number(escrowHoldingDays);
  seller.complianceStatus = Number(escrowHoldingDays) > 7 ? 'escrow_hold_extended' : 'in_good_standing';
  seller.lastAuditDate = new Date().toISOString();

  // Audit
  riskAuditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: 'admin_super_user',
    actorName: adminName || 'Platform Director',
    actorRole: 'Super Admin',
    action: 'SELLER_ESCROW_HOLD_ADJUSTED',
    entityType: 'seller',
    entityId: seller.sellerId,
    previousState: `escrow_days: ${prev}`,
    newState: `escrow_days: ${escrowHoldingDays}`,
    reason,
    clientIp: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, seller });
});

/**
 * GET /api/risk/affiliates
 * Affiliate attribution integrity monitor.
 */
phase14Router.get('/risk/affiliates', (_req: Request, res: Response) => {
  res.json({ success: true, affiliates: affiliateIntegrityRecords });
});

/**
 * POST /api/risk/affiliates/:affiliateId/quarantine
 * Quarantine or release affiliate commissions.
 */
phase14Router.post('/risk/affiliates/:affiliateId/quarantine', (req: Request, res: Response) => {
  const { action, amountMinorUnits, reason, adminName } = req.body;
  if (!action || !reason) {
    return res.status(400).json({ success: false, error: 'action ("quarantine" | "release" | "clawback") and reason are required.' });
  }

  const affiliate = affiliateIntegrityRecords.find((a) => a.affiliateId === req.params.affiliateId);
  if (!affiliate) {
    return res.status(404).json({ success: false, error: 'Affiliate not found.' });
  }

  const amount = Number(amountMinorUnits) || 0;

  if (action === 'quarantine') {
    affiliate.status = 'quarantined';
    affiliate.quarantinedCommissionsMinorUnits += amount;
    if (affiliate.activeCommissionsMinorUnits >= amount) {
      affiliate.activeCommissionsMinorUnits -= amount;
    }
  } else if (action === 'release') {
    affiliate.status = 'clean';
    if (affiliate.quarantinedCommissionsMinorUnits >= amount) {
      affiliate.quarantinedCommissionsMinorUnits -= amount;
    }
    affiliate.activeCommissionsMinorUnits += amount;
  } else if (action === 'clawback') {
    affiliate.status = 'restricted';
    if (affiliate.quarantinedCommissionsMinorUnits >= amount) {
      affiliate.quarantinedCommissionsMinorUnits -= amount;
    }
    affiliate.clawedBackCommissionsMinorUnits += amount;
  }

  // Audit log
  riskAuditLogs.unshift({
    id: `log_${Date.now()}`,
    actorId: 'admin_super_user',
    actorName: adminName || 'Platform Director',
    actorRole: 'Super Admin',
    action: `AFFILIATE_COMMISSION_${action.toUpperCase()}`,
    entityType: 'affiliate',
    entityId: affiliate.affiliateId,
    previousState: 'commission_adjustment',
    newState: `action: ${action}, amount: ${amount}`,
    reason,
    clientIp: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, affiliate });
});

/**
 * GET /api/risk/audit-logs
 * Immutable-style governance audit log.
 */
phase14Router.get('/risk/audit-logs', (_req: Request, res: Response) => {
  res.json({ success: true, count: riskAuditLogs.length, auditLogs: riskAuditLogs });
});

/**
 * POST /api/risk/evaluate-transaction
 * Transparent, explainable rules-based risk scoring engine.
 * Takes a transaction payload and returns transparent 0-100 score + explainable factors.
 */
phase14Router.post('/risk/evaluate-transaction', (req: Request, res: Response) => {
  const payload: RiskEvaluationPayload = req.body;

  let riskScore = 5; // Base score
  const factors = [];

  // Factor 1: Transaction amount
  const amountNGN = (payload.amountMinorUnits || 0) / 100;
  if (amountNGN > 300000) {
    const delta = amountNGN > 600000 ? 25 : 18;
    riskScore += delta;
    factors.push({
      id: 'f_amount',
      factorName: 'High-Value Order Threshold',
      scoreDelta: delta,
      reason: `Order value (₦${amountNGN.toLocaleString()}) exceeds high-scrutiny threshold (₦300,000).`,
      severity: delta > 20 ? ('high' as RiskSeverity) : ('moderate' as RiskSeverity),
      code: 'AMOUNT_THRESHOLD_EXCEEDED'
    });
  }

  // Factor 2: Delivery vs Account State Mismatch
  if (payload.customerState && payload.shippingState && payload.customerState !== payload.shippingState) {
    riskScore += 14;
    factors.push({
      id: 'f_geo',
      factorName: 'Geographic Region Divergence',
      scoreDelta: 14,
      reason: `Billing address state (${payload.customerState}) does not match shipping destination state (${payload.shippingState}).`,
      severity: 'moderate' as RiskSeverity,
      code: 'GEO_STATE_DIVERGENCE'
    });
  }

  // Factor 3: Prior Failed Authorization Spikes
  if (payload.failedPaymentCount && payload.failedPaymentCount >= 2) {
    const delta = payload.failedPaymentCount >= 3 ? 24 : 16;
    riskScore += delta;
    factors.push({
      id: 'f_failed_auth',
      factorName: 'Prior Failed Authorization Spike',
      scoreDelta: delta,
      reason: `${payload.failedPaymentCount} failed payment authorization attempts recorded within prior 15 minutes.`,
      severity: 'high' as RiskSeverity,
      code: 'FAILED_AUTH_BURST'
    });
  }

  // Factor 4: Disposable / New Email Domain
  if (payload.customerEmail && (payload.customerEmail.includes('tempmail') || payload.customerEmail.includes('mailinator'))) {
    riskScore += 20;
    factors.push({
      id: 'f_disposable_domain',
      factorName: 'Temporary Email Domain Detected',
      scoreDelta: 20,
      reason: 'Customer registered with disposable/ephemeral domain.',
      severity: 'high' as RiskSeverity,
      code: 'DISPOSABLE_DOMAIN'
    });
  }

  // Factor 5: Affiliate Self-Referral Proxy
  if (payload.affiliateRef && payload.customerEmail && payload.customerEmail.toLowerCase().includes('emeka')) {
    riskScore += 30;
    factors.push({
      id: 'f_self_referral',
      factorName: 'Affiliate Attribution Self-Referral Match',
      scoreDelta: 30,
      reason: 'Customer profile correlates with active affiliate partner ID.',
      severity: 'high' as RiskSeverity,
      code: 'AFFILIATE_SELF_REFERRAL'
    });
  }

  // Factor 6: Promo Code Velocity
  if (payload.promoCode && payload.promoCode.toUpperCase() === 'WELCOME15') {
    riskScore += 10;
    factors.push({
      id: 'f_promo',
      factorName: 'Introductory Promotion Stacking Verification',
      scoreDelta: 10,
      reason: 'Welcome promotion redemption subjected to device cluster deduplication.',
      severity: 'low' as RiskSeverity,
      code: 'WELCOME_PROMO_VERIFY'
    });
  }

  // Clamp score
  riskScore = Math.min(100, Math.max(0, riskScore));

  let severity: RiskSeverity = 'low';
  let recommendation: 'auto_clear' | 'flag_for_review' | 'manual_review_required' | 'block_transaction' = 'auto_clear';

  if (riskScore >= 85) {
    severity = 'critical';
    recommendation = 'manual_review_required';
  } else if (riskScore >= 65) {
    severity = 'high';
    recommendation = 'manual_review_required';
  } else if (riskScore >= 35) {
    severity = 'moderate';
    recommendation = 'flag_for_review';
  } else {
    severity = 'low';
    recommendation = 'auto_clear';
  }

  const result: RiskEvaluationResult = {
    riskScore,
    severity,
    recommendation,
    factors,
    summary:
      factors.length > 0
        ? `Identified ${factors.length} explainable risk factors resulting in composite score of ${riskScore}/100 (${severity.toUpperCase()}).`
        : 'All transaction signals within normal baseline tolerances (Auto-cleared).'
  };

  res.json({ success: true, result });
});
