/**
 * @file src/types/index.ts
 * Core TypeScript contracts for MarketNest multi-vendor marketplace architecture.
 * Designed for full forward-compatibility with future phases (Firebase, Paystack, Affiliates, Admin).
 */

export type UserRole = 'customer' | 'seller' | 'affiliate' | 'admin';

export interface Address {
  id: string;
  fullName?: string;
  phone?: string;
  street: string;
  city: string;
  state: string; // e.g. 'Lagos', 'Abuja FCT', 'Rivers', 'Oyo'
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends User {
  role: 'customer';
  addresses: Address[];
  savedPaymentMethodsCount?: number;
  totalOrdersCount: number;
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  tagline?: string;
  bio: string;
  logoUrl: string;
  bannerUrl?: string;
  verified: boolean;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  joinedYear: number;
  responseRatePercent: number; // e.g. 98%
  shipsWithinHours: number; // e.g. 24h
  specialties: string[];
  storeName?: string;
}

export interface Seller extends User {
  role: 'seller';
  storeId: string;
  store: Store;
  payoutBank?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  commissionRate: number; // e.g. 0.08 (8%)
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size 42", "Obsidian Black 256GB"
  sku: string;
  price: number;
  stockCount: number;
}

export type ProductStatus = 'draft' | 'active' | 'outOfStock' | 'archived';

export interface Product {
  id: string;
  title: string;
  name?: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number; // In NGN (₦)
  originalPrice?: number; // In NGN, for strikethrough comparison
  compareAtPrice?: number;
  category: CategoryId;
  categoryId?: string;
  images: string[];
  rating: number; // e.g. 4.8
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;
  brand?: string;
  status?: ProductStatus;
  sellerId: string;
  storeId?: string;
  storeName?: string;
  seller: Store;
  isMadeInNigeria?: boolean;
  isEditorialPick?: boolean;
  isTrending?: boolean;
  featured?: boolean;
  origin?: string;
  deliverySpeed: 'lagos_sameday' | 'lagos_24h' | 'express_48h' | 'standard';
  specifications: ProductSpecification[];
  variants?: ProductVariant[];
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface StoreCustomization {
  announcement?: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
    bgColor?: string;
    textColor?: string;
  };
  brandColor?: string; // Approved curated palette (e.g. #0E8F5A, #101413, #1B365D, #8D3F2D, #4A154B, #0F766E)
  headerLayout?: 'centered' | 'editorial' | 'banner-first';
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
  policies?: {
    returns?: string;
    shipping?: string;
    warranty?: string;
  };
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    hours?: string;
  };
  featuredProductIds?: string[];
  pinnedCategories?: string[];
  layoutTheme?: 'editorial' | 'compact' | 'classic';
  isDraft?: boolean;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  tagline?: string;
  description: string;
  category: string;
  logoUrl: string;
  bannerUrl?: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  verified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
  shipsWithinHours: number;
  customization?: StoreCustomization;
  createdAt: string;
  updatedAt: string;
}

export interface SellerApplication {
  id: string;
  userId: string;
  storeName: string;
  businessCategory: string;
  description: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type CategoryId =
  | 'fashion'
  | 'electronics'
  | 'phones'
  | 'beauty'
  | 'home'
  | 'shoes'
  | 'bags'
  | 'food';

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  itemCount: number;
  featuredPicksCount: number;
}

export interface CartItem {
  id: string; // unique item id (productId + variantId)
  productId: string;
  sellerId: string;
  storeId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariant?: ProductVariant;
  unitPrice: number;
  lineTotal: number;
  addedAt?: string;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  estimatedDeliveryFee: number;
  freeDeliveryThreshold: number;
  isEligibleForFreeDelivery: boolean;
  total: number;
}

export interface Wishlist {
  userId: string;
  productIds: string[];
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  authorLocation: string; // e.g. "Lekki, Lagos"
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  sellerOrderId?: string;
  productId: string;
  productTitle: string;
  productName?: string;
  sellerId: string;
  storeId?: string;
  storeName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  subtotal?: number;
  sku?: string;
  selectedVariant?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'held_in_escrow'
  | 'paid'
  | 'released'
  | 'refunded'
  | 'failed';

export interface SellerOrderGroup {
  sellerId: string;
  storeId?: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryAmount: number;
  status: OrderStatus;
}

export interface SellerOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  sellerId: string;
  storeId?: string;
  storeName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  deliverySpeed?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderContactInformation {
  fullName: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "MN-20261004-894120"
  userId?: string;
  customerId: string;
  items: OrderItem[];
  sellerGroups?: SellerOrderGroup[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  currency?: string; // "NGN"
  status: OrderStatus;
  orderStatus?: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  contactInformation?: OrderContactInformation;
  deliverySpeed: string;
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
  paymentReference?: string;
  paymentChannel?: string;
  estimatedDeliveryDate: string;
  idempotencyKey?: string;
}

export type ReconciliationStatus = 'matched' | 'unmatched' | 'requires_review';

export interface Payment {
  id: string;
  orderId: string;
  userId?: string;
  customerId?: string;
  amount: number;
  currency: 'NGN' | string;
  provider: 'paystack';
  reference: string;
  status: 'initialized' | 'pending' | 'paid' | 'failed' | 'abandoned' | 'refunded';
  channel?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
  paystackTransactionId?: string;
  gatewayResponse?: string;
  reconciliationStatus?: ReconciliationStatus;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

export interface PaymentAttempt {
  id: string;
  orderId: string;
  userId?: string;
  reference: string;
  amount: number;
  currency?: string;
  status: 'initialized' | 'pending' | 'successful' | 'failed' | 'abandoned';
  channel?: string;
  createdAt: string;
  updatedAt?: string;
  gatewayResponse?: string;
}

export type SellerEarningStatus = 'pending' | 'available' | 'paid' | 'reversed';

export interface SellerEarning {
  id: string;
  sellerId: string;
  orderId: string;
  orderNumber: string;
  orderItemIds?: string[];
  grossAmount: number;
  platformCommission: number;
  platformCommissionRate: number; // e.g. 0.08 (8%)
  paymentProcessingFee: number;
  netAmount: number;
  status: SellerEarningStatus;
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
}

export interface AuditLog {
  id: string;
  action:
    | 'PAYMENT_INITIALIZED'
    | 'PAYMENT_VERIFIED'
    | 'PAYMENT_FAILED'
    | 'ORDER_CONFIRMED'
    | 'SELLER_EARNING_CREATED'
    | 'INVENTORY_DEDUCTED'
    | 'INVENTORY_RECONCILED';
  actorId: string;
  actorRole: string;
  entityType: 'order' | 'payment' | 'sellerEarning' | 'product';
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/* ========================================================================= */
/* Phase 6: Affiliate Platform Data Models & Architecture                   */
/* ========================================================================= */

export type AffiliateStatus = 'pending' | 'active' | 'suspended';

export interface AffiliateProfile {
  id: string; // doc id, corresponds to user's Firebase Auth UID
  userId: string;
  displayName: string;
  code: string; // e.g. "MNJAMES"
  status: AffiliateStatus;
  commissionRate: number; // e.g. 0.05 (5.0%)
  promotionalChannel?: string;
  channelUrl?: string;
  audienceDescription?: string;
  preferredCategories?: string[];
  totalClicks?: number;
  totalConversions?: number;
  totalEarnings?: number;
  pendingEarnings?: number;
  approvedEarnings?: number;
  paidEarnings?: number;
  createdAt: string;
  updatedAt: string;
}

export type AffiliateApplicationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AffiliateApplication {
  id: string;
  userId: string;
  fullName: string;
  displayName: string;
  channel: string;
  channelUrl: string;
  audience: string;
  reason: string;
  preferredCategories: string[];
  agreedToTerms: boolean;
  status: AffiliateApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';

export interface AffiliateCampaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productIds?: string[];
  storeIds?: string[];
  commissionRate: number; // e.g. 0.07 (7.0% bonus commission)
  status: CampaignStatus;
  bannerUrl?: string;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AffiliateLinkTargetType = 'product' | 'store' | 'category' | 'homepage' | 'campaign';

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  code: string;
  campaignId?: string;
  targetType: AffiliateLinkTargetType;
  targetId: string;
  targetName: string;
  targetUrl: string;
  url: string; // full shareable URL e.g. https://domain/?ref=CODE&link=id
  clicksCount: number;
  conversionsCount: number;
  earningsAmount: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  code: string;
  linkId?: string;
  campaignId?: string;
  sessionId: string;
  landingPath: string;
  referrer: string;
  createdAt: string;
}

export interface AffiliateConversion {
  id: string;
  affiliateId: string;
  code: string;
  orderId: string;
  orderNumber: string;
  attributionType: 'last_click';
  grossAmount: number;
  eligibleAmount: number;
  commissionAmount: number;
  attributedAt: string;
  createdAt: string;
}

export type AffiliateCommissionStatus = 'pending' | 'approved' | 'paid' | 'reversed';

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  code: string;
  orderId: string;
  orderNumber: string;
  orderItemIds: string[];
  grossAmount: number;
  eligibleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: AffiliateCommissionStatus;
  reversalReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type AffiliatePayoutStatus = 'requested' | 'processing' | 'paid' | 'failed' | 'cancelled';

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  amount: number;
  currency: 'NGN';
  status: AffiliatePayoutStatus;
  reference: string;
  requestedAt: string;
  processedAt?: string;
  destinationBank?: string;
  accountNumberMasked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  sellerId: string;
  orderId: string;
  marketplaceFeeRate: number;
  marketplaceFeeAmount: number;
  netSellerPayout: number;
  status: 'escrowed' | 'settled';
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

/* ========================================================================= */
/* Phase 7: MarketNest Admin Control Center Types                           */
/* ========================================================================= */

export type AdminRole =
  | 'super_admin'
  | 'operations_admin'
  | 'finance_admin'
  | 'support_admin'
  | 'moderator';

export type AdminPermission =
  | 'dashboard.view'
  | 'customers.view'
  | 'customers.manage'
  | 'sellers.view'
  | 'sellers.approve'
  | 'sellers.suspend'
  | 'products.view'
  | 'products.moderate'
  | 'orders.view'
  | 'orders.manage'
  | 'payments.view'
  | 'payments.reconcile'
  | 'refunds.view'
  | 'refunds.manage'
  | 'affiliates.view'
  | 'affiliates.approve'
  | 'affiliates.suspend'
  | 'commissions.view'
  | 'payouts.view'
  | 'payouts.manage'
  | 'reports.view'
  | 'settings.view'
  | 'settings.manage'
  | 'analytics.view'
  | 'analytics.financial.view'
  | 'analytics.customer.view'
  | 'analytics.seller.view'
  | 'analytics.affiliate.view'
  | 'reports.generate'
  | 'reports.export'
  | 'finance.reconciliation.view'
  | 'finance.reconciliation.manage'
  | 'risk.view'
  | 'risk.manage'
  | 'disputes.view'
  | 'disputes.manage'
  | 'governance.enforce'
  | 'marketing.view'
  | 'marketing.manage';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  avatarUrl?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
  isRootOwner?: boolean;
}

export type AdminSection =
  | 'dashboard'
  | 'customers'
  | 'sellers'
  | 'seller-applications'
  | 'affiliates'
  | 'affiliate-applications'
  | 'products'
  | 'categories'
  | 'stores'
  | 'orders'
  | 'payments'
  | 'refunds'
  | 'commissions'
  | 'affiliate-commissions'
  | 'payouts'
  | 'reports'
  | 'analytics'
  | 'audit-logs'
  | 'settings'
  | 'reviews'
  | 'returns'
  | 'promotions'
  | 'messages'
  | 'launch-readiness'
  | 'operations'
  | 'marketing'
  | 'affiliate-operations'
  | 'support'
  | 'moderation'
  | 'insights'
  | 'ai-usage'
  | 'scalability'
  | 'regions'
  | 'business-intelligence'
  | 'reconciliation'
  | 'sales-analytics'
  | 'customer-analytics'
  | 'seller-analytics'
  | 'affiliate-analytics'
  | 'product-analytics'
  | 'marketing-analytics'
  | 'risk'
  | 'risk-cases'
  | 'disputes'
  | 'seller-governance'
  | 'affiliate-integrity';

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentId?: string | null;
  status: 'active' | 'draft' | 'archived';
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export type RefundStatus =
  | 'requested'
  | 'reviewing'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed';

export interface MarketplaceRefund {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  reason: string;
  adminNote?: string;
  status: RefundStatus;
  paymentReference?: string;
  requestedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MarketplacePayoutStatus =
  | 'requested'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled';

export interface MarketplacePayout {
  id: string;
  recipientType: 'seller' | 'affiliate';
  recipientId: string;
  recipientName: string;
  amount: number;
  currency: 'NGN';
  destinationBank: string;
  accountNumberMasked: string;
  accountName: string;
  reference: string;
  status: MarketplacePayoutStatus;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type:
    | 'seller_application'
    | 'affiliate_application'
    | 'refund_request'
    | 'payment_mismatch'
    | 'low_stock'
    | 'suspicious_activity'
    | 'failed_payout'
    | 'system_alert';
  priority: 'info' | 'warning' | 'critical';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface PlatformSettings {
  marketplaceName: string;
  currency: 'NGN';
  defaultCountry: string;
  maintenanceMode: boolean;
  sellerApprovalRequired: boolean;
  defaultSellerCommissionRate: number;
  defaultAffiliateCommissionRate: number;
  affiliateAttributionWindowDays: number;
  minimumAffiliatePayoutThreshold: number;
  orderCancellationWindowHours: number;
  returnWindowDays: number;
  paystackTestMode: boolean;
  notificationEmail: string;
}

/* ========================================================================= */
/* UI & Navigation Types                                                     */
/* ========================================================================= */

export type ActivePage =
  | 'home'
  | 'shop'
  | 'search'
  | 'compare'
  | 'product'
  | 'stores'
  | 'deals'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'verify-email'
  | 'account'
  | 'sell'
  | 'seller-onboarding'
  | 'seller-dashboard'
  | 'seller-product-new'
  | 'seller-product-edit'
  | 'storefront'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'payment-callback'
  | 'payment-success'
  | 'payment-failed'
  | 'payment-pending'
  | 'affiliate'
  | 'affiliate-apply'
  | 'affiliate-dashboard'
  | 'affiliate-links'
  | 'affiliate-earnings'
  | 'affiliate-analytics'
  | 'affiliate-settings'
  | 'admin'
  | 'sell-on-marketnest'
  | 'seller-growth'
  | 'seller-insights'
  | 'seller-ai-assistant'
  | 'seller-product-ai-assistant'
  | 'shopping-assistant'
  | 'support';

export type AccountTab =
  | 'overview'
  | 'orders'
  | 'payments'
  | 'wishlist'
  | 'saved'
  | 'returns'
  | 'notifications'
  | 'messages'
  | 'support'
  | 'recently-viewed'
  | 'loyalty'
  | 'addresses'
  | 'profile'
  | 'settings';

export type SellerDashboardTab =
  | 'overview'
  | 'growth'
  | 'insights'
  | 'ai-assistant'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'earnings'
  | 'transactions'
  | 'analytics'
  | 'reviews'
  | 'returns'
  | 'shipping'
  | 'messages'
  | 'store'
  | 'settings';

export type AffiliateDashboardTab =
  | 'overview'
  | 'links'
  | 'earnings'
  | 'analytics'
  | 'campaigns'
  | 'settings';


export type SortOption =
  | 'recommended'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc';

export interface FilterState {
  category: CategoryId | 'all';
  minPrice: number;
  maxPrice: number;
  minRating: number;
  verifiedOnly: boolean;
  madeInNigeriaOnly: boolean;
  deliverySpeed: 'all' | 'lagos_sameday' | 'lagos_24h';
  inStockOnly: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}

/* ========================================================================= */
/* Phase 8: Reviews & Ratings                                                */
/* ========================================================================= */

export type ReviewRating = 1 | 2 | 3 | 4 | 5;
export type ReviewStatus = 'pending' | 'published' | 'hidden' | 'flagged';

export interface ProductReview {
  id: string;
  productId: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  customerName?: string;
  customerAvatar?: string;
  sellerId: string;
  rating: ReviewRating;
  title: string;
  comment: string;
  images?: string[];
  status: ReviewStatus;
  verifiedPurchase: boolean;
  helpfulCount?: number;
  helpfulUserIds?: string[];
  response?: ReviewResponse;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  sellerId: string;
  sellerName?: string;
  response: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingDistribution {
  averageRating: number;
  totalReviews: number;
  counts: Record<ReviewRating, number>;
  percentages: Record<ReviewRating, number>;
}

/* ========================================================================= */
/* Phase 8: Product Questions & Answers                                      */
/* ========================================================================= */

export interface ProductQuestion {
  id: string;
  productId: string;
  customerId: string;
  customerName?: string;
  question: string;
  status: 'published' | 'pending' | 'hidden';
  answers?: ProductAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductAnswer {
  id: string;
  questionId: string;
  answererId: string;
  answererType: 'seller' | 'admin' | 'customer';
  answererName?: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

/* ========================================================================= */
/* Phase 8: Store Following & Brand Loyalty                                  */
/* ========================================================================= */

export interface StoreFollower {
  id: string;
  customerId: string;
  storeId: string;
  createdAt: string;
}

/* ========================================================================= */
/* Phase 8: Customer In-App Notifications & Preferences                       */
/* ========================================================================= */

export type NotificationType =
  | 'order_confirmed'
  | 'payment_successful'
  | 'order_shipped'
  | 'order_delivered'
  | 'refund_update'
  | 'price_drop'
  | 'back_in_stock'
  | 'seller_update'
  | 'review_reminder'
  | 'promotion'
  | 'affiliate_update'
  | 'message';

export interface CustomerNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: 'order' | 'product' | 'store' | 'refund' | 'conversation';
  entityId?: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  orderNotifications: boolean;
  promotionNotifications: boolean;
  priceAlerts: boolean;
  stockAlerts: boolean;
  sellerUpdates: boolean;
  reviewReminders: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

/* ========================================================================= */
/* Phase 8: Returns & Refunds Experience                                     */
/* ========================================================================= */

export type ReturnReason =
  | 'wrong_item'
  | 'damaged_item'
  | 'defective_product'
  | 'not_as_described'
  | 'missing_parts'
  | 'wrong_size'
  | 'changed_mind'
  | 'other';

export type ReturnStatus =
  | 'requested'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'return_in_progress'
  | 'received'
  | 'refunded'
  | 'cancelled';

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  orderItemId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  sellerId: string;
  storeName?: string;
  productTitle: string;
  productImage?: string;
  price: number;
  quantity: number;
  reason: ReturnReason;
  description: string;
  images?: string[];
  status: ReturnStatus;
  rejectionReason?: string;
  adminNote?: string;
  sellerNotes?: string;
  refundAmount?: number;
  trackingNumber?: string;
  requestedAt: string;
  reviewedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/* ========================================================================= */
/* Phase 8: Promotions & Server-Side Coupons                                 */
/* ========================================================================= */

export type PromotionType = 'percentage' | 'fixed';
export type PromotionScope = 'all' | 'category' | 'product' | 'store';
export type PromotionStatus = 'draft' | 'active' | 'paused' | 'expired';

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: PromotionType;
  value: number;
  scope: PromotionScope;
  targetIds?: string[];
  minimumOrderAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  perCustomerLimit?: number;
  startAt: string;
  endAt: string;
  status: PromotionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  discountPercentage?: number;
  description: string;
  promotionId?: string;
  minimumOrderAmount?: number;
  error?: string;
}

/* ========================================================================= */
/* Phase 8: Delivery Foundation & Shipping Methods                           */
/* ========================================================================= */

export type DeliveryMethodId = 'standard' | 'express' | 'pickup';
export type DeliveryTrackingStatus =
  | 'pending'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface DeliveryOption {
  id: DeliveryMethodId;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier: string;
  badge?: string;
}

export interface OrderDeliveryInfo {
  deliveryMethod: DeliveryMethodId;
  deliveryMethodName: string;
  deliveryFee: number;
  estimatedDeliveryDate: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  deliveryStatus: DeliveryTrackingStatus;
  statusHistory?: Array<{
    status: DeliveryTrackingStatus;
    timestamp: string;
    description: string;
    location?: string;
  }>;
}

export interface SellerShippingConfig {
  sellerId: string;
  shipsFromState: string;
  processingTimeHours: number;
  standardFeeLagos: number;
  standardFeeNationwide: number;
  expressAvailable: boolean;
  expressFeeLagos: number;
  pickupAvailable: boolean;
  pickupAddress?: string;
  freeShippingThreshold?: number;
  updatedAt: string;
}

/* ========================================================================= */
/* Phase 8: Direct Messaging (Customer <-> Seller)                           */
/* ========================================================================= */

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  storeName: string;
  orderId?: string;
  productId?: string;
  productTitle?: string;
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageAt: string;
  unreadCountCustomer: number;
  unreadCountSeller: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'seller' | 'admin';
  senderName: string;
  message: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
}

/* ========================================================================= */
/* Phase 8: Customer Loyalty & Rewards                                       */
/* ========================================================================= */

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'reversed';

export interface LoyaltyAccount {
  id: string;
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: LoyaltyTransactionType;
  points: number;
  orderId?: string;
  description: string;
  createdAt: string;
}

/* ========================================================================= */
/* Phase 8: Product Search & Discovery                                       */
/* ========================================================================= */

export interface SearchSuggestion {
  query: string;
  category?: string;
  type: 'product' | 'category' | 'brand' | 'store';
  count?: number;
}

/* ========================================================================= */
/* Phase 10: Launch, Growth & Marketplace Operations                         */
/* ========================================================================= */

export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportTicketCategory = 'order' | 'delivery' | 'payment' | 'return' | 'product' | 'account' | 'other';

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin' | 'seller';
  message: string;
  isInternalNote?: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  subject: string;
  category: SupportTicketCategory;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages?: SupportTicketMessage[];
}

export type ReportTargetType = 'product' | 'store' | 'review';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
export type MarketplaceReportReason = 'counterfeit' | 'misleading' | 'prohibited' | 'damaged' | 'harassment' | 'other';

export interface MarketplaceReport {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  reason: string;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOperationsMetrics {
  gmv: number;
  completedOrdersCount: number;
  netMarketplaceRevenue: number;
  averageOrderValue: number;
  activeCustomersCount: number;
  activeSellersCount: number;
  newCustomersCount: number;
  newSellersCount: number;
  pendingSellerApplicationsCount: number;
  pendingAffiliateApplicationsCount: number;
  unfulfilledOrdersCount: number;
  ordersAwaitingShipmentCount: number;
  pendingReturnsCount: number;
  paymentFailuresCount: number;
  refundsAwaitingActionCount: number;
  lowStockProductsCount: number;
  openSupportTicketsCount: number;
  totalAffiliateCommissions: number;
  totalSellerEarnings: number;
  totalRefundsAmount: number;
}

export interface FunnelStageMetric {
  stage: string;
  label: string;
  count: number;
  conversionFromPrevious: number;
  conversionFromTop: number;
}

export interface SellerGrowthInsight {
  id: string;
  type: 'photography' | 'description' | 'inventory' | 'unfulfilled' | 'pricing' | 'reviews' | 'questions';
  title: string;
  description: string;
  actionLabel: string;
  impact: 'high' | 'medium' | 'low';
  productId?: string;
  productTitle?: string;
  dataMetric?: string;
}

/* ========================================================================= */
/* Phase 11: AI Intelligence & Automation Types                              */
/* ========================================================================= */

export interface AIGeneratedProductContent {
  title: string;
  shortDescription: string;
  detailedDescription: string;
  keySellingPoints: string[];
  specifications: Record<string, string>;
  searchKeywords: string[];
  seoTitle: string;
  seoMetaDescription: string;
  suggestedAttributes: Record<string, string>;
  imageAltText: string;
  uncertainFields?: string[];
  isAiGenerated: boolean;
}

export interface AICategorySuggestion {
  categoryId: CategoryId;
  categoryName: string;
  confidence: number;
  reason: string;
  suggestedAttributes: Record<string, string>;
}

export interface AIShoppingQueryResponse {
  query: string;
  reply: string;
  matchedProducts: Product[];
  suggestedCategories: string[];
  suggestedPriceRange?: { min: number; max: number };
  verifiedDeliveryPolicy?: string;
  verifiedReturnPolicy?: string;
  confidence: number;
}

export interface AISupportAssistantResponse {
  reply: string;
  orderStatus?: {
    orderNumber: string;
    status: string;
    expectedDelivery?: string;
    trackingCarrier?: string;
  };
  policySummary?: string;
  suggestedActions: { label: string; action: string; payload?: any }[];
  needsEscalation: boolean;
  confidence: number;
}

export interface AISellerPerformanceInsight {
  id: string;
  title: string;
  observedFact: string;
  hypothesis: string;
  actionableStep: string;
  targetLink?: string;
  period: string;
  sampleSize: string;
  impactLevel: 'high' | 'medium' | 'low';
  category: 'listing_quality' | 'views_drop' | 'inventory_replenish' | 'conversion_funnel' | 'faq_clarity';
}

export interface AIAdminMarketplaceInsight {
  id: string;
  title: string;
  metricSummary: string;
  observedTrend: string;
  suggestedIntervention: string;
  category: 'category_momentum' | 'stockout_risk' | 'checkout_drop' | 'support_friction' | 'affiliate_velocity';
  period: string;
  sampleSize: string;
  confidence: number;
  reportLink?: string;
}

export interface AIModerationRecommendation {
  targetId: string;
  targetType: 'product' | 'review' | 'message';
  targetTitle?: string;
  riskScore: number; // 0 - 100
  flagReasons: string[];
  rationale: string;
  suggestedAction: 'approve' | 'flag_for_review' | 'request_specs' | 'quarantine';
  requiresHumanReview: boolean;
}

export interface AIUsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedCostUsd: number;
  activeProvider: string;
  featureBreakdown: {
    feature: string;
    requests: number;
    avgLatencyMs: number;
    tokens: number;
    failures: number;
  }[];
  rateLimitEvents: number;
  lastUpdated: string;
}

export interface AutomationJob {
  id: string;
  type: 'inventory_alert' | 'order_notification' | 'affiliate_reconciliation' | 'moderation_scan' | 'report_aggregation';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'manual_review';
  entityType: 'product' | 'order' | 'commission' | 'review' | 'inventory';
  entityId: string;
  attemptCount: number;
  maxRetries: number;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  lastErrorCode?: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/* ========================================================================= */
/* Phase 12: Scalability & Multi-Region Expansion Types                      */
/* ========================================================================= */

export type RegionStatus = 'active' | 'coming_soon' | 'draft' | 'archived';

export interface RegionalTaxConfig {
  vatRate: number; // e.g. 0.075 for 7.5%
  isTaxInclusive: boolean;
  taxName: string; // e.g. 'VAT'
  taxIdRequired: boolean;
  withholdingTaxRate?: number;
}

export interface RegionalSupportContact {
  email: string;
  phone: string;
  hours: string;
  emergencyEscrowHelpline: string;
}

export interface RegionalState {
  code: string;
  name: string;
  cities: string[];
  hubCode: string;
  isDispatchHub: boolean;
}

export interface MarketplaceRegion {
  id: string;
  countryCode: string; // ISO 3166-1 alpha-2, e.g. 'NG'
  countryName: string;
  currencyCode: string; // ISO 4217, e.g. 'NGN'
  currencySymbol: string;
  locale: string; // e.g. 'en-NG'
  flagEmoji: string;
  supportedStates: RegionalState[];
  supportedPaymentMethods: string[];
  supportedDeliveryMethods: string[];
  taxConfig: RegionalTaxConfig;
  status: RegionStatus;
  supportContact: RegionalSupportContact;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  minorUnitDecimals: number;
  displayFormat: string;
  isZeroDecimal: boolean;
}

export interface ExchangeRateRecord {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string;
  recordedAt: string;
}

export type DeliveryProviderId =
  | 'gig_logistics'
  | 'kwik_delivery'
  | 'dhl_express'
  | 'fedex_nigeria'
  | 'standard_fallback';

export interface DeliveryQuote {
  providerId: DeliveryProviderId;
  providerName: string;
  serviceLevel: string;
  rateInMinorUnits: number;
  currency: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  estimatedDeliveryText: string;
  isGuaranteed: boolean;
  trackingCapabilities: ('gps_realtime' | 'milestones_only' | 'sms_alerts')[];
}

export type ShipmentStatus =
  | 'draft'
  | 'label_created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'returned_to_sender'
  | 'cancelled';

export interface NormalizedTrackingUpdate {
  timestamp: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  carrierRawStatus?: string;
}

export type PaymentProviderId =
  | 'paystack'
  | 'secondary_simulator'
  | 'flutterwave_ready'
  | 'stripe_ready';

export interface UnifiedPaymentInitialization {
  providerId: PaymentProviderId;
  reference: string;
  authorizationUrl?: string;
  accessCode?: string;
  amountInMinorUnits: number;
  currency: string;
  customerEmail: string;
  expiresAt: string;
  status: 'initialized' | 'pending' | 'success' | 'failed';
}

export interface UnifiedPaymentVerification {
  providerId: PaymentProviderId;
  reference: string;
  status: 'success' | 'failed' | 'pending' | 'abandoned';
  amountInMinorUnits: number;
  currency: string;
  paidAt?: string;
  channel?: string;
  gatewayResponse?: string;
  customerEmail?: string;
  riskScore?: number;
  idempotencyKey: string;
}

export interface ScalabilityAuditItem {
  id: string;
  area: string;
  bottleneck: string;
  evidence: string;
  expectedImpact: string;
  recommendedFix: string;
  complexity: 'low' | 'medium' | 'high';
  priority: 'required_now' | 'deferred_until_scale';
  status: 'resolved' | 'monitoring' | 'planned';
}

export interface LoadTestScenario {
  id: string;
  name: string;
  targetRps: number;
  concurrency: number;
  durationSeconds: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  simulatedWorkflow: string;
  timestamp: string;
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  uptimeSeconds: number;
  memoryUsageMb: number;
  cacheHitRate: number;
  activeRegionCount: number;
  components: Record<string, { status: 'operational' | 'degraded' | 'down'; latencyMs: number; details?: string }>;
}

// ----------------------------------------------------------------------
// PHASE 13: BUSINESS INTELLIGENCE & FINANCIAL REPORTING CONTRACTS
// ----------------------------------------------------------------------

export type BiReportingPeriod =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | '90d'
  | '12m'
  | 'custom';

export interface BiMetricDefinition {
  metricName: string;
  code: string;
  formula: string;
  dataSource: string;
  treatmentOfRefundsAndCancellations: string;
  notes: string;
}

export interface BiExecutiveMetrics {
  period: BiReportingPeriod;
  dateRange: {
    start: string;
    end: string;
  };
  currency: string;
  // Core Financials
  gmv: number; // Gross merchandise value
  grossSales: number; // GMV + shipping charges - discounts
  completedOrders: number;
  averageOrderValue: number;
  platformCommissionRevenue: number;
  sellerEarnings: number;
  affiliateCommissions: number;
  paymentProcessingFees: number;
  refunds: number;
  netMarketplaceRevenue: number; // Platform revenue after affiliate & gateway costs (NOT net profit)
  
  // Customers & Commerce
  newCustomers: number;
  repeatCustomers: number;
  activeSellers: number;
  activeAffiliates: number;
  productReturnRate: number; // percentage
  paymentSuccessRate: number; // percentage
  checkoutConversionRate: number; // percentage
  
  // Period comparisons (% change vs prior comparable period)
  comparisons: {
    gmvChangePercent: number;
    completedOrdersChangePercent: number;
    aovChangePercent: number;
    platformRevenueChangePercent: number;
    newCustomersChangePercent: number;
    refundsChangePercent: number;
  };
  
  // Trend trajectory points for charting
  trendPoints: Array<{
    date: string;
    label: string;
    gmv: number;
    orders: number;
    revenue: number;
    refunds: number;
  }>;
}

export interface CashFlowLedger {
  currency: string;
  asOfTimestamp: string;
  verifiedCustomerPayments: number;
  pendingSettlements: number; // T+1 or pending clearing
  recordedRefundsDisbursed: number;
  sellerEarningsPayable: number; // held in escrow
  sellerPayoutsCompleted: number;
  affiliateCommissionsPayable: number;
  affiliatePayoutsCompleted: number;
  platformRetainedFees: number;
  outstandingDiscrepanciesAmount: number;
  discrepanciesCount: number;
  accountingBalance: number;
  bankIntegrationAvailable: boolean;
  actualBankBalanceNote: string;
}

export type DiscrepancyCategory =
  | 'gateway_verified_not_in_order'
  | 'order_paid_without_gateway_record'
  | 'duplicate_payment_reference'
  | 'refund_inconsistency'
  | 'missing_seller_earnings'
  | 'affiliate_commission_unreversed'
  | 'duplicate_commission_record'
  | 'amount_or_currency_mismatch'
  | 'webhook_processing_failure';

export type DiscrepancyStatus = 'unreviewed' | 'investigating' | 'resolved' | 'escalated';

export interface ReconciliationDiscrepancy {
  id: string;
  discrepancyCategory: DiscrepancyCategory;
  categoryLabel: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedRecordIds: {
    orderId?: string;
    orderNumber?: string;
    paymentReference?: string;
    customerEmail?: string;
    sellerId?: string;
    affiliateId?: string;
    refundId?: string;
  };
  expectedValue: string;
  observedValue: string;
  discrepancyAmountMinorUnits?: number;
  currency: string;
  detectionTime: string;
  status: DiscrepancyStatus;
  assignedReviewer?: string;
  resolutionNotes?: string;
  resolutionAction?: string;
  auditHistory: Array<{
    timestamp: string;
    actor: string;
    action: string;
    notes?: string;
  }>;
}

export interface AnalyticsEvent {
  id: string;
  eventName:
    | 'product_viewed'
    | 'search_performed'
    | 'add_to_cart'
    | 'checkout_started'
    | 'payment_verified'
    | 'order_completed'
    | 'seller_application_submitted'
    | 'seller_first_product_published'
    | 'affiliate_conversion_attributed'
    | 'promotion_redeemed';
  timestamp: string;
  anonymousSessionId: string;
  userId?: string;
  eventSource: 'web_storefront' | 'mobile_drawer' | 'seller_portal' | 'paystack_webhook' | 'server_worker';
  entityId?: string;
  campaignId?: string;
  referralCode?: string;
  metadata?: Record<string, any>;
  schemaVersion: string;
}

export interface ScheduledReportConfig {
  id: string;
  title: string;
  reportType:
    | 'daily_sales'
    | 'weekly_seller_performance'
    | 'monthly_financial_summary'
    | 'payment_reconciliation_exceptions'
    | 'outstanding_refunds'
    | 'low_stock_summary'
    | 'affiliate_commission_exceptions';
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  isActive: boolean;
  lastGeneratedAt?: string;
  nextRunAt: string;
  status: 'idle' | 'generating' | 'delivered' | 'failed';
  lastError?: string;
}

export interface SalesAnalyticsData {
  period: BiReportingPeriod;
  currency: string;
  totalGmv: number;
  totalOrders: number;
  averageOrderValue: number;
  byCategory: Array<{ category: string; gmv: number; orderCount: number; sharePercent: number }>;
  bySeller: Array<{ sellerId: string; storeName: string; gmv: number; orderCount: number }>;
  byProduct: Array<{ productId: string; title: string; category: string; unitsSold: number; gmv: number }>;
  byRegion: Array<{ state: string; gmv: number; orderCount: number; sharePercent: number }>;
  discountedVsFullPrice: {
    discountedOrdersGmv: number;
    fullPriceOrdersGmv: number;
    discountedOrdersCount: number;
    fullPriceOrdersCount: number;
    totalDiscountAmountGiven: number;
  };
  cancellationsAndRefunds: {
    cancelledOrdersCount: number;
    cancelledGmv: number;
    refundedOrdersCount: number;
    refundedAmount: number;
    refundRatePercent: number;
  };
}

export interface CustomerAnalyticsData {
  period: BiReportingPeriod;
  totalRegisteredCustomers: number;
  newRegistrations: number;
  firstTimePurchasers: number;
  repeatPurchasers: number;
  repeatPurchaseRatePercent: number;
  purchaseFrequencyAvg: number;
  segments: Array<{
    segmentName: string;
    criteria: string;
    customerCount: number;
    averageOrderValue: number;
    totalGmv: number;
  }>;
  retentionCohorts: Array<{
    cohortMonth: string;
    size: number;
    m1Retention: number;
    m2Retention: number;
    m3Retention: number;
  }>;
  funnelProgression: Array<{
    step: string;
    visitors: number;
    conversionPercent: number;
  }>;
  wishlistActivity: {
    totalItemsSaved: number;
    wishlistToCartConversionRate: number;
  };
}

export interface SellerAnalyticsData {
  period: BiReportingPeriod;
  activeSellersCount: number;
  sellerApplicationConversionRate: number;
  avgHoursToFirstProduct: number;
  avgDaysToFirstOrder: number;
  sellers: Array<{
    sellerId: string;
    storeName: string;
    city: string;
    gmv: number;
    ordersCount: number;
    sellerEarnings: number;
    avgFulfillmentHours: number;
    cancellationRatePercent: number;
    returnRatePercent: number;
    rating: number;
    reviewCount: number;
    activeListingCount: number;
    outOfStockCount: number;
  }>;
}

export interface AffiliateAnalyticsData {
  period: BiReportingPeriod;
  approvedAffiliatesCount: number;
  activeAffiliatesCount: number; // has clicks or conversions in window
  totalReferralClicks: number;
  attributedOrdersCount: number;
  conversionRatePercent: number;
  grossReferralSales: number;
  commissionsAccrued: number;
  commissionsReversed: number;
  commissionsPayable: number;
  affiliates: Array<{
    affiliateId: string;
    name: string;
    code: string;
    clicks: number;
    orders: number;
    salesGmv: number;
    commissionAccrued: number;
    commissionReversed: number;
    commissionPayable: number;
    status: string;
  }>;
}

export interface ProductAnalyticsData {
  period: BiReportingPeriod;
  bestSellers: Array<{
    productId: string;
    title: string;
    storeName: string;
    category: string;
    unitsSold: number;
    revenue: number;
    returnRate: number;
  }>;
  opportunityProducts: Array<{
    productId: string;
    title: string;
    storeName: string;
    views: number;
    addToCartCount: number;
    purchaseCount: number;
    conversionRate: number;
    stock: number;
  }>;
  stockoutAlerts: Array<{
    productId: string;
    title: string;
    storeName: string;
    currentStock: number;
    daysOfInventoryLeft: number;
  }>;
  zeroResultSearchQueries: Array<{
    query: string;
    searchCount: number;
    lastSearched: string;
  }>;
}

export interface MarketingAnalyticsData {
  period: BiReportingPeriod;
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    source: string;
    visits: number;
    referralClicks: number;
    attributedOrders: number;
    attributedRevenue: number;
    conversionRatePercent: number;
    promotionRedemptions: number;
    totalDiscountAmount: number;
  }>;
}

// ----------------------------------------------------------------------
// Phase 14: Marketplace Governance, Risk Management & Fraud Prevention
// ----------------------------------------------------------------------

export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type RiskCaseCategory =
  | 'payment_fraud'
  | 'account_takeover'
  | 'seller_abuse'
  | 'affiliate_fraud'
  | 'promotion_abuse'
  | 'dispute_chargeback'
  | 'suspicious_velocity'
  | 'counterfeit_catalog';

export type RiskCaseStatus =
  | 'open'
  | 'under_investigation'
  | 'action_taken'
  | 'resolved_cleared'
  | 'escalated';

export interface RiskScoreFactor {
  id: string;
  factorName: string;
  scoreDelta: number;
  reason: string;
  severity: RiskSeverity;
  code: string;
}

export interface RiskSignal {
  id: string;
  type: string;
  title: string;
  description: string;
  weight: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface InvestigationNote {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  content: string;
  createdAt: string;
  isInternalOnly: boolean;
}

export type GovernanceActionType =
  | 'warning_notice'
  | 'order_fulfillment_hold'
  | 'escrow_hold_extended'
  | 'payout_review_required'
  | 'affiliate_commission_quarantined'
  | 'promo_code_revoked'
  | 'secondary_verification_requested'
  | 'seller_listing_shadowed'
  | 'payout_disbursement_frozen'
  | 'account_under_review'
  | 'case_cleared_whitelisted';

export interface GovernanceActionRecord {
  id: string;
  actionType: GovernanceActionType;
  actionLabel: string;
  targetEntity: {
    type: 'order' | 'user' | 'seller' | 'affiliate' | 'promotion' | 'dispute' | 'transaction' | 'product';
    id: string;
    label?: string;
  };
  administeredBy: {
    id: string;
    name: string;
    role: string;
  };
  reason: string;
  effectiveUntil?: string;
  reversibility: 'reversible' | 'irreversible';
  status: 'active' | 'reversed' | 'expired';
  timestamp: string;
  reversalReason?: string;
  reversedAt?: string;
}

export interface RiskAppealRecord {
  id: string;
  submittedAt: string;
  appellantRole: 'customer' | 'seller' | 'affiliate';
  appellantName: string;
  statement: string;
  evidenceUrls?: string[];
  status: 'pending_review' | 'granted' | 'denied';
  reviewedBy?: string;
  reviewedAt?: string;
  rulingNotes?: string;
}

export interface RiskCase {
  id: string;
  caseNumber: string;
  title: string;
  category: RiskCaseCategory;
  categoryLabel: string;
  severity: RiskSeverity;
  riskScore: number; // 0-100
  scoreBreakdown: RiskScoreFactor[];
  status: RiskCaseStatus;
  userRole: 'customer' | 'seller' | 'affiliate' | 'anonymous';
  targetEntity: {
    type: 'order' | 'user' | 'seller' | 'affiliate' | 'transaction' | 'dispute';
    id: string;
    name: string;
    email: string;
    location?: string;
  };
  linkedIds: {
    orderId?: string;
    orderNumber?: string;
    transactionId?: string;
    paymentReference?: string;
    sellerId?: string;
    sellerName?: string;
    affiliateId?: string;
    affiliateCode?: string;
    customerId?: string;
    disputeId?: string;
  };
  detectionEngine:
    | 'rules_engine'
    | 'paystack_webhook'
    | 'velocity_anomaly'
    | 'customer_report'
    | 'affiliate_integrity'
    | 'seller_sla_monitor';
  signals: RiskSignal[];
  assignedAdminId?: string;
  assignedAdminName?: string;
  assignedAdminEmail?: string;
  internalNotes: InvestigationNote[];
  actionsTaken: GovernanceActionRecord[];
  appeal?: RiskAppealRecord;
  financialImpact: {
    amountMinorUnits: number;
    currency: string;
    potentialLoss: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type DisputeStage =
  | 'buyer_filed'
  | 'awaiting_seller_evidence'
  | 'under_admin_mediation'
  | 'settled_buyer_refund'
  | 'settled_seller_favour'
  | 'escalated_to_chargeback';

export type DisputeReason =
  | 'item_not_received'
  | 'item_defective'
  | 'counterfeit_suspected'
  | 'incorrect_item'
  | 'unauthorized_transaction'
  | 'refund_refused';

export interface MarketplaceDispute {
  id: string;
  disputeNumber: string;
  orderId: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerStoreName: string;
  amountMinorUnits: number;
  currency: string;
  reason: DisputeReason;
  reasonLabel: string;
  stage: DisputeStage;
  buyerClaim: string;
  buyerEvidenceUrls: string[];
  sellerResponse?: string;
  sellerEvidenceUrls?: string[];
  adminMediationNotes?: string;
  resolutionDecision?: string;
  chargebackReference?: string;
  paystackDisputeId?: string;
  deadline: string; // ISO date (e.g. 72hr deadline)
  createdAt: string;
  updatedAt: string;
}

export interface SellerGovernanceMetrics {
  sellerId: string;
  storeName: string;
  sellerEmail: string;
  registeredDate: string;
  riskScore: number; // 0-100
  complianceStatus:
    | 'in_good_standing'
    | 'advisory_warning'
    | 'escrow_hold_extended'
    | 'manual_review_required'
    | 'restricted';
  orderFulfillmentRate: number; // e.g. 96.5%
  cancellationRate: number; // e.g. 2.1%
  disputeRate: number; // e.g. 0.8%
  returnRate: number; // e.g. 3.4%
  counterfeitFlags: number;
  escrowHoldingDays: number; // default 7, extended to 14 or 21
  totalOrdersCount: number;
  disbursedAmountMinorUnits: number;
  pendingHoldAmountMinorUnits: number;
  lastAuditDate: string;
}

export interface AffiliateIntegrityMetrics {
  affiliateId: string;
  affiliateCode: string;
  affiliateName: string;
  affiliateEmail: string;
  integrityScore: number; // 0-100, 100 = clean
  status: 'clean' | 'flagged_for_review' | 'quarantined' | 'restricted';
  selfReferralAttempts: number;
  suspiciousIpMatches: number;
  unnaturalConversionSpikes: number;
  totalReferralClicks: number;
  totalConversions: number;
  quarantinedCommissionsMinorUnits: number;
  activeCommissionsMinorUnits: number;
  clawedBackCommissionsMinorUnits: number;
  lastFlaggedAt?: string;
}

export interface CustomerAbuseMetrics {
  customerId: string;
  customerName: string;
  customerEmail: string;
  riskScore: number;
  status: 'active' | 'warned' | 'promo_restricted' | 'high_scrutiny';
  multiAccountLinks: number;
  couponRedemptionVelocity: number; // promos per 24h
  orderReturnRate: number; // percentage
  failedPaymentAttempts: number;
  chargebackCount: number;
  lastActive: string;
}

export interface RiskAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  previousState: string;
  newState: string;
  reason: string;
  clientIp: string;
  timestamp: string;
}

export interface RiskOverviewSummary {
  totalOpenCases: number;
  criticalCases: number;
  highPriorityCases: number;
  moderateCases: number;
  openDisputes: number;
  preventedFraudLossMinorUnits: number;
  quarantinedFundsMinorUnits: number;
  pendingChargebacks: number;
  averageRiskScore: number;
  falsePositiveRatePercent: number;
  ruleTriggers24h: number;
  severityDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  categoryDistribution: Array<{
    category: RiskCaseCategory;
    categoryLabel: string;
    count: number;
  }>;
  recentTrends: Array<{
    date: string;
    flagged: number;
    cleared: number;
    actioned: number;
  }>;
}

export interface RiskEvaluationPayload {
  orderId?: string;
  amountMinorUnits: number;
  customerEmail: string;
  customerId?: string;
  customerState?: string;
  shippingState?: string;
  customerCreationDate?: string;
  failedPaymentCount?: number;
  cartItemCount?: number;
  promoCode?: string;
  affiliateRef?: string;
  clientIp?: string;
}

export interface RiskEvaluationResult {
  riskScore: number;
  severity: RiskSeverity;
  recommendation: 'auto_clear' | 'flag_for_review' | 'manual_review_required' | 'block_transaction';
  factors: RiskScoreFactor[];
  summary: string;
}

// Phase 17: Marketing Automation, CRM & Retention
export * from './marketing';

