/**
 * @file src/services/paymentService.ts
 * Payment boundary abstraction for MarketNest.
 * Prepares the commerce engine for Phase 5 Paystack inline and webhook integration.
 * In Phase 4, sets paymentStatus to 'unpaid' and tracks escrow readiness.
 */

import { Order, Payment } from '../types';

export interface InitializePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in NGN (₦)
  customerEmail: string;
  customerName: string;
}

export interface PaymentInitializationResult {
  provider: 'paystack';
  reference: string;
  authorizationUrl?: string;
  status: 'unpaid' | 'pending';
  message: string;
}

class PaymentService {
  /**
   * Generates a unique transaction reference for future Paystack checkout.
   */
  generateTransactionReference(orderNumber: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const cleanNumber = orderNumber.replace(/[^A-Za-z0-9]/g, '');
    return `PAY_${cleanNumber}_${timestamp}`;
  }

  /**
   * Initializes a payment session placeholder.
   * Phase 5 will invoke Paystack popup/redirect and verify signatures.
   */
  async initializeOrderPayment(params: InitializePaymentParams): Promise<PaymentInitializationResult> {
    const reference = this.generateTransactionReference(params.orderNumber);

    // In Phase 4, return an escrow-ready payment placeholder without charging real money
    return {
      provider: 'paystack',
      reference,
      status: 'unpaid',
      message: 'Payment step placeholder. Paystack gateway will connect in Phase 5.'
    };
  }

  /**
   * Records a payment ledger stub.
   */
  createPaymentRecord(order: Order, reference: string): Payment {
    return {
      id: `pay_${Date.now()}`,
      orderId: order.id,
      amount: order.total,
      currency: 'NGN',
      provider: 'paystack',
      reference,
      status: 'initialized',
      createdAt: new Date().toISOString()
    };
  }
}

export * from './payments/paymentService';
export const paymentService = new PaymentService();
