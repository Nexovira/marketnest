/**
 * @file src/server/phase8Routes.ts
 * Phase 8 API routes for MarketNest:
 * - Server-side coupon validation & checkout calculation
 * - Verified product reviews & seller responses
 * - Product questions & answers (Q&A)
 * - Customer return requests & seller return processing
 * - Customer loyalty points ledger & tier calculation
 * - Customer notifications inbox
 * - Customer <-> Seller direct messaging
 * - Store follower tracking
 */

import { Router, Request, Response } from 'express';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  CouponValidationResult,
  ProductReview,
  ReviewResponse,
  ProductQuestion,
  ProductAnswer,
  ReturnRequest,
  Promotion,
  LoyaltyAccount,
  LoyaltyTransaction,
  CustomerNotification,
  Conversation,
  ChatMessage
} from '../types';
import { ensureServerAuth } from './serverAuth';

export const phase8Router = Router();

phase8Router.use(async (_req, _res, next) => {
  await ensureServerAuth();
  next();
});

// ======================================================================
// 1. PROMOTIONS & SERVER-SIDE COUPON VALIDATION
// ======================================================================

// In-memory fallback promotional coupons for testing/demo
const DEFAULT_COUPONS: Record<string, Partial<Promotion>> = {
  NESTWELCOME: {
    id: 'promo_welcome',
    name: 'Welcome to MarketNest',
    code: 'NESTWELCOME',
    type: 'percentage',
    value: 10, // 10% off
    scope: 'all',
    minimumOrderAmount: 10000,
    usageLimit: 5000,
    usedCount: 142,
    perCustomerLimit: 1,
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2027-12-31T23:59:59.000Z',
    status: 'active'
  },
  LAGOSVIP: {
    id: 'promo_lagos',
    name: 'Lagos Fast Track Promo',
    code: 'LAGOSVIP',
    type: 'fixed',
    value: 5000, // ₦5,000 off
    scope: 'all',
    minimumOrderAmount: 30000,
    usageLimit: 1000,
    usedCount: 88,
    perCustomerLimit: 1,
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2027-12-31T23:59:59.000Z',
    status: 'active'
  },
  LUXURY15: {
    id: 'promo_luxury',
    name: 'Artisan Heritage Collection Discount',
    code: 'LUXURY15',
    type: 'percentage',
    value: 15, // 15% off
    scope: 'category',
    targetIds: ['fashion', 'beauty'],
    minimumOrderAmount: 25000,
    usageLimit: 2000,
    usedCount: 310,
    perCustomerLimit: 2,
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2027-12-31T23:59:59.000Z',
    status: 'active'
  }
};

phase8Router.post('/promotions/validate-coupon', async (req: Request, res: Response) => {
  try {
    const { code, cartSubtotal = 0, items = [], customerId } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, error: 'Promo coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    let promo: Partial<Promotion> | null = null;

    // Check Firestore promotions collection
    try {
      const q = query(collection(db, 'promotions'), where('code', '==', cleanCode), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        promo = snap.docs[0].data() as Promotion;
      }
    } catch (e) {
      // Cloud query fallback to defaults
    }

    if (!promo && DEFAULT_COUPONS[cleanCode]) {
      promo = DEFAULT_COUPONS[cleanCode];
    }

    if (!promo) {
      return res.json({
        valid: false,
        code: cleanCode,
        discountAmount: 0,
        error: `Coupon "${cleanCode}" is invalid or does not exist.`
      } as CouponValidationResult);
    }

    // Check status
    if (promo.status !== 'active') {
      return res.json({
        valid: false,
        code: cleanCode,
        discountAmount: 0,
        error: `Coupon "${cleanCode}" is ${promo.status || 'inactive'}.`
      } as CouponValidationResult);
    }

    // Check date validity
    const now = new Date().toISOString();
    if (promo.startAt && promo.startAt > now) {
      return res.json({
        valid: false,
        code: cleanCode,
        discountAmount: 0,
        error: `Coupon "${cleanCode}" is not yet active.`
      } as CouponValidationResult);
    }
    if (promo.endAt && promo.endAt < now) {
      return res.json({
        valid: false,
        code: cleanCode,
        discountAmount: 0,
        error: `Coupon "${cleanCode}" has expired.`
      } as CouponValidationResult);
    }

    // Check usage limits
    if (promo.usageLimit && (promo.usedCount || 0) >= promo.usageLimit) {
      return res.json({
        valid: false,
        code: cleanCode,
        discountAmount: 0,
        error: `Coupon "${cleanCode}" has reached its maximum redemption limit.`
      } as CouponValidationResult);
    }

    // Check minimum order amount
    const minAmount = promo.minimumOrderAmount || 0;
    if (cartSubtotal < minAmount) {
      return res.json({
        valid: false,
        code: cleanCode,
        discountAmount: 0,
        minimumOrderAmount: minAmount,
        error: `Coupon requires a minimum order subtotal of ₦${minAmount.toLocaleString()}.`
      } as CouponValidationResult);
    }

    // Calculate eligible amount based on scope
    let eligibleAmount = cartSubtotal;
    if (promo.scope === 'category' && promo.targetIds && promo.targetIds.length > 0) {
      eligibleAmount = items
        .filter((it: any) => promo?.targetIds?.includes(it.category))
        .reduce((sum: number, it: any) => sum + (it.price * (it.quantity || 1)), 0);

      if (eligibleAmount <= 0) {
        return res.json({
          valid: false,
          code: cleanCode,
          discountAmount: 0,
          error: `Coupon "${cleanCode}" is only valid for selected departments.`
        } as CouponValidationResult);
      }
    }

    let discountAmount = 0;
    if (promo.type === 'percentage') {
      discountAmount = Math.round(eligibleAmount * ((promo.value || 0) / 100));
    } else {
      discountAmount = Math.min(promo.value || 0, eligibleAmount);
    }

    // Guarantee discount never exceeds eligible subtotal
    discountAmount = Math.min(discountAmount, cartSubtotal);

    return res.json({
      valid: true,
      code: cleanCode,
      discountAmount,
      discountPercentage: promo.type === 'percentage' ? promo.value : undefined,
      description: promo.name || `${promo.value}% discount applied`,
      promotionId: promo.id,
      minimumOrderAmount: promo.minimumOrderAmount
    } as CouponValidationResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error validating coupon' });
  }
});

// Calculate authoritative checkout totals
phase8Router.post('/checkout/calculate-totals', async (req: Request, res: Response) => {
  try {
    const { items = [], deliveryMethod = 'standard', couponCode, state = 'Lagos' } = req.body;

    const subtotal = items.reduce((sum: number, it: any) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 1;
      return sum + (price * qty);
    }, 0);

    // Delivery fee calculation
    let deliveryFee = 2500;
    if (deliveryMethod === 'express') {
      deliveryFee = 5000;
    } else if (deliveryMethod === 'pickup') {
      deliveryFee = 800;
    } else {
      deliveryFee = state.toLowerCase().includes('lagos') ? 2000 : 3500;
    }

    let discount = 0;
    let couponInfo: any = null;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const promo = DEFAULT_COUPONS[cleanCode];
      if (promo && promo.status === 'active' && subtotal >= (promo.minimumOrderAmount || 0)) {
        if (promo.type === 'percentage') {
          discount = Math.round(subtotal * ((promo.value || 0) / 100));
        } else {
          discount = Math.min(promo.value || 0, subtotal);
        }
        couponInfo = {
          code: cleanCode,
          name: promo.name,
          discountAmount: discount
        };
      }
    }

    const platformFee = 0; // Free buyer escrow on MarketNest
    const total = Math.max(0, subtotal - discount + deliveryFee);

    res.json({
      status: 'success',
      data: {
        subtotal,
        discount,
        deliveryFee,
        platformFee,
        total,
        deliveryMethod,
        coupon: couponInfo
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error calculating checkout totals' });
  }
});

// ======================================================================
// 2. PRODUCT REVIEWS & RATINGS
// ======================================================================

phase8Router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const { productId, sellerId, status = 'published' } = req.query;
    let reviews: ProductReview[] = [];

    try {
      let q = collection(db, 'reviews');
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const data = d.data() as ProductReview;
        if (productId && data.productId !== productId) return;
        if (sellerId && data.sellerId !== sellerId) return;
        if (status && data.status !== status && status !== 'all') return;
        reviews.push(data);
      });
    } catch {}

    // Sort by newest
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ status: 'success', data: reviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching reviews' });
  }
});

phase8Router.post('/reviews/submit', async (req: Request, res: Response) => {
  try {
    const {
      productId,
      orderId,
      orderItemId,
      customerId,
      customerName = 'Verified Buyer',
      sellerId,
      rating,
      title,
      comment,
      images = []
    } = req.body;

    if (!productId || !customerId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    // Verify customer purchase authenticity
    let verifiedPurchase = false;
    let effectiveOrderId = orderId || `ord_${Date.now()}`;
    let effectiveSellerId = sellerId || '';

    if (orderId) {
      try {
        const orderSnap = await getDoc(doc(db, 'orders', orderId));
        if (orderSnap.exists()) {
          const ord = orderSnap.data();
          if (ord.customerId === customerId) {
            verifiedPurchase = true;
            if (!effectiveSellerId && ord.items) {
              const matched = ord.items.find((i: any) => i.productId === productId);
              if (matched) effectiveSellerId = matched.sellerId;
            }
          }
        }
      } catch {}
    } else {
      // Find past orders by this customer with this product
      try {
        const qOrders = query(collection(db, 'orders'), where('customerId', '==', customerId));
        const ordsSnap = await getDocs(qOrders);
        ordsSnap.forEach((d) => {
          const ord = d.data();
          const foundItem = (ord.items || []).find((i: any) => i.productId === productId);
          if (foundItem) {
            verifiedPurchase = true;
            effectiveOrderId = ord.id;
            effectiveSellerId = foundItem.sellerId || effectiveSellerId;
          }
        });
      } catch {}
    }

    // Database lookup for product seller
    if (!effectiveSellerId) {
      try {
        const prodSnap = await getDoc(doc(db, 'products', productId));
        if (prodSnap.exists()) {
          effectiveSellerId = prodSnap.data()?.sellerId || '';
        }
      } catch {}
    }

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const reviewDoc: ProductReview = {
      id: reviewId,
      productId,
      orderId: effectiveOrderId,
      orderItemId: orderItemId || `item_${productId}`,
      customerId,
      customerName,
      sellerId: effectiveSellerId,
      rating: numRating as any,
      title: title?.trim() || '',
      comment: comment.trim(),
      images,
      status: 'published',
      verifiedPurchase,
      helpfulCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    try {
      await setDoc(doc(db, 'reviews', reviewId), reviewDoc);
    } catch {}

    res.json({ status: 'success', data: reviewDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error submitting review' });
  }
});

// Seller response to customer review
phase8Router.post('/reviews/:id/response', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sellerId, sellerName = 'Merchant Store', response } = req.body;

    if (!sellerId || !response) {
      return res.status(400).json({ error: 'Seller ID and response message are required' });
    }

    const responseId = `resp_${id}_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const responseDoc: ReviewResponse = {
      id: responseId,
      reviewId: id,
      sellerId,
      sellerName,
      response: response.trim(),
      createdAt: nowIso,
      updatedAt: nowIso
    };

    try {
      await setDoc(doc(db, 'reviewResponses', responseId), responseDoc);
      // Embed on review for fast client rendering
      await updateDoc(doc(db, 'reviews', id), {
        response: responseDoc,
        updatedAt: nowIso
      });
    } catch {}

    res.json({ status: 'success', data: responseDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error posting review response' });
  }
});

// Helpful vote toggle
phase8Router.post('/reviews/:id/helpful', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    let updatedHelpful = 1;
    try {
      const rRef = doc(db, 'reviews', id);
      const rSnap = await getDoc(rRef);
      if (rSnap.exists()) {
        const cur = rSnap.data();
        const curUsers: string[] = cur.helpfulUserIds || [];
        const isUpvoted = userId && curUsers.includes(userId);
        const nextUsers = isUpvoted
          ? curUsers.filter((u) => u !== userId)
          : userId ? [...curUsers, userId] : curUsers;
        updatedHelpful = Math.max(0, (cur.helpfulCount || 0) + (isUpvoted ? -1 : 1));

        await updateDoc(rRef, {
          helpfulCount: updatedHelpful,
          helpfulUserIds: nextUsers,
          updatedAt: new Date().toISOString()
        });
      }
    } catch {}

    res.json({ status: 'success', helpfulCount: updatedHelpful });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating helpful vote' });
  }
});

// ======================================================================
// 3. PRODUCT QUESTIONS & ANSWERS (Q&A)
// ======================================================================

phase8Router.get('/questions', async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    let list: ProductQuestion[] = [];

    try {
      const snap = await getDocs(collection(db, 'productQuestions'));
      snap.forEach((d) => {
        const q = d.data() as ProductQuestion;
        if (!productId || q.productId === productId) {
          list.push(q);
        }
      });
    } catch {}

    // Sort newest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ status: 'success', data: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching questions' });
  }
});

phase8Router.post('/questions/ask', async (req: Request, res: Response) => {
  try {
    const { productId, customerId, customerName = 'Shopper', question } = req.body;

    if (!productId || !customerId || !question) {
      return res.status(400).json({ error: 'Product ID, customer ID, and question text required' });
    }

    const qId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const qDoc: ProductQuestion = {
      id: qId,
      productId,
      customerId,
      customerName,
      question: question.trim(),
      status: 'published',
      answers: [],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    try {
      await setDoc(doc(db, 'productQuestions', qId), qDoc);
    } catch {}

    res.json({ status: 'success', data: qDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error submitting question' });
  }
});

phase8Router.post('/questions/:id/answer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answererId, answererType = 'seller', answererName = 'Merchant Store', answer } = req.body;

    if (!answererId || !answer) {
      return res.status(400).json({ error: 'Answerer ID and answer text are required' });
    }

    const aId = `ans_${id}_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const answerDoc: ProductAnswer = {
      id: aId,
      questionId: id,
      answererId,
      answererType,
      answererName,
      answer: answer.trim(),
      createdAt: nowIso,
      updatedAt: nowIso
    };

    try {
      await setDoc(doc(db, 'productAnswers', aId), answerDoc);
      // Append to question doc
      const qRef = doc(db, 'productQuestions', id);
      const qSnap = await getDoc(qRef);
      if (qSnap.exists()) {
        const curAnswers = qSnap.data().answers || [];
        await updateDoc(qRef, {
          answers: [...curAnswers, answerDoc],
          updatedAt: nowIso
        });
      }
    } catch {}

    res.json({ status: 'success', data: answerDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error submitting answer' });
  }
});

// ======================================================================
// 4. STORE FOLLOWING
// ======================================================================

phase8Router.post('/store-followers/toggle', async (req: Request, res: Response) => {
  try {
    const { customerId, storeId } = req.body;
    if (!customerId || !storeId) {
      return res.status(400).json({ error: 'Customer ID and Store ID are required' });
    }

    const followId = `f_${customerId}_${storeId}`;
    let isFollowing = false;
    let followerCount = 48; // Baseline mock counter

    try {
      const fRef = doc(db, 'storeFollowers', followId);
      const fSnap = await getDoc(fRef);

      if (fSnap.exists()) {
        await updateDoc(doc(db, 'storeFollowers', followId), { deletedAt: new Date().toISOString() });
        isFollowing = false;
      } else {
        await setDoc(fRef, {
          id: followId,
          customerId,
          storeId,
          createdAt: new Date().toISOString()
        });
        isFollowing = true;
      }

      // Count followers
      const qCount = query(collection(db, 'storeFollowers'), where('storeId', '==', storeId));
      const snap = await getDocs(qCount);
      followerCount = snap.size;
    } catch {}

    res.json({ status: 'success', isFollowing, followerCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating store follower state' });
  }
});

// ======================================================================
// 5. RETURNS & REFUNDS (CUSTOMER & SELLER)
// ======================================================================

phase8Router.get('/returns', async (req: Request, res: Response) => {
  try {
    const { customerId, sellerId } = req.query;
    let list: ReturnRequest[] = [];

    try {
      const snap = await getDocs(collection(db, 'returns'));
      snap.forEach((d) => {
        const data = d.data() as ReturnRequest;
        if (customerId && data.customerId !== customerId) return;
        if (sellerId && data.sellerId !== sellerId) return;
        list.push(data);
      });
    } catch {}

    list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    res.json({ status: 'success', data: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching returns' });
  }
});

phase8Router.post('/returns/request', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      orderNumber,
      orderItemId,
      customerId,
      customerName,
      customerEmail,
      sellerId,
      storeName,
      productTitle,
      productImage,
      price,
      quantity = 1,
      reason,
      description,
      images = []
    } = req.body;

    if (!orderId || !customerId || !reason || !description) {
      return res.status(400).json({ error: 'Order ID, customer ID, reason, and description required' });
    }

    const returnId = `ret_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const returnDoc: ReturnRequest = {
      id: returnId,
      orderId,
      orderNumber: orderNumber || `MN-${orderId.slice(-6).toUpperCase()}`,
      orderItemId: orderItemId || `item_${Date.now()}`,
      customerId,
      customerName,
      customerEmail,
      sellerId: sellerId || 'seller_1',
      storeName: storeName || 'Verified Merchant',
      productTitle: productTitle || 'Purchased Item',
      productImage,
      price: Number(price) || 0,
      quantity: Number(quantity) || 1,
      reason,
      description: description.trim(),
      images,
      status: 'requested',
      requestedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    try {
      await setDoc(doc(db, 'returns', returnId), returnDoc);
    } catch {}

    res.json({ status: 'success', data: returnDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating return request' });
  }
});

phase8Router.post('/returns/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason, note, reviewerId } = req.body;

    let nextStatus = 'reviewing';
    if (action === 'approve') nextStatus = 'approved';
    if (action === 'reject') nextStatus = 'rejected';
    if (action === 'receive') nextStatus = 'received';
    if (action === 'refund') nextStatus = 'refunded';

    const nowIso = new Date().toISOString();
    const updates: any = {
      status: nextStatus,
      reviewedAt: nowIso,
      updatedAt: nowIso
    };
    if (action === 'reject') updates.rejectionReason = reason || 'Item does not meet return policy criteria.';
    if (note) updates.adminNote = note;

    try {
      await updateDoc(doc(db, 'returns', id), updates);
    } catch {}

    res.json({ status: 'success', message: `Return ${id} status updated to ${nextStatus}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error reviewing return' });
  }
});

// ======================================================================
// 6. CUSTOMER LOYALTY REWARDS
// ======================================================================

phase8Router.get('/loyalty/account/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let account: LoyaltyAccount | null = null;

    try {
      const snap = await getDoc(doc(db, 'loyaltyAccounts', userId));
      if (snap.exists()) {
        account = snap.data() as LoyaltyAccount;
      }
    } catch {}

    if (!account) {
      // Default initial tier
      account = {
        id: `loy_${userId}`,
        userId,
        pointsBalance: 250, // ₦250 welcome incentive
        lifetimePoints: 250,
        tier: 'bronze',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    res.json({ status: 'success', data: account });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching loyalty account' });
  }
});

phase8Router.get('/loyalty/transactions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let list: LoyaltyTransaction[] = [];

    try {
      const q = query(collection(db, 'loyaltyTransactions'), where('userId', '==', userId));
      const snap = await getDocs(q);
      snap.forEach((d) => list.push(d.data() as LoyaltyTransaction));
    } catch {}

    if (list.length === 0) {
      list = [
        {
          id: `tx_welcome_${userId}`,
          userId,
          type: 'earned',
          points: 250,
          description: 'MarketNest Welcome Bonus Points',
          createdAt: new Date().toISOString()
        }
      ];
    }

    res.json({ status: 'success', data: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching loyalty transactions' });
  }
});

// ======================================================================
// 7. IN-APP CUSTOMER NOTIFICATIONS
// ======================================================================

phase8Router.get('/notifications/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let list: CustomerNotification[] = [];

    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const snap = await getDocs(q);
      snap.forEach((d) => list.push(d.data() as CustomerNotification));
    } catch {}

    if (list.length === 0) {
      list = [
        {
          id: 'notif_welcome',
          userId,
          type: 'promotion',
          title: 'Welcome to MarketNest Luxury Rewards',
          message: 'Enjoy verified Nigerian artisan stores with 10% off using coupon NESTWELCOME at checkout.',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ status: 'success', data: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching notifications' });
  }
});

phase8Router.post('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch {}
    res.json({ status: 'success' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating notification status' });
  }
});

// ======================================================================
// 8. DIRECT MESSAGING (CUSTOMER <-> SELLER)
// ======================================================================

phase8Router.get('/messages/conversations/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let list: Conversation[] = [];

    try {
      const snap = await getDocs(collection(db, 'conversations'));
      snap.forEach((d) => {
        const c = d.data() as Conversation;
        if (c.customerId === userId || c.sellerId === userId) {
          list.push(c);
        }
      });
    } catch {}

    res.json({ status: 'success', data: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching conversations' });
  }
});

phase8Router.post('/messages/send', async (req: Request, res: Response) => {
  try {
    const {
      conversationId,
      senderId,
      senderRole = 'customer',
      senderName = 'Shopper',
      customerId,
      sellerId,
      storeName = 'Merchant Store',
      productTitle,
      message
    } = req.body;

    if (!senderId || !message) {
      return res.status(400).json({ error: 'Sender ID and message are required' });
    }

    const cId = conversationId || `conv_${customerId}_${sellerId}`;
    const mId = `msg_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const chatMsg: ChatMessage = {
      id: mId,
      conversationId: cId,
      senderId,
      senderRole,
      senderName,
      message: message.trim(),
      read: false,
      createdAt: nowIso
    };

    try {
      await setDoc(doc(db, 'conversations', cId, 'messages', mId), chatMsg);

      // Upsert conversation metadata
      await setDoc(
        doc(db, 'conversations', cId),
        {
          id: cId,
          customerId: customerId || senderId,
          customerName: senderRole === 'customer' ? senderName : 'Customer',
          sellerId: sellerId || (senderRole === 'seller' ? senderId : 'seller_1'),
          storeName,
          productTitle,
          lastMessage: message.trim(),
          lastMessageSenderId: senderId,
          lastMessageAt: nowIso,
          unreadCountCustomer: senderRole === 'seller' ? 1 : 0,
          unreadCountSeller: senderRole === 'customer' ? 1 : 0,
          updatedAt: nowIso
        },
        { merge: true }
      );
    } catch {}

    res.json({ status: 'success', data: chatMsg });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error sending message' });
  }
});
