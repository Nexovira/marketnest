/**
 * @file src/services/payments/paymentService.ts
 * Client-side payment integration service for MarketNest.
 * Connects checkout to backend Paystack initialization, inline checkout modal,
 * redirect fallbacks, and server verification pipelines.
 */

import { CartItem, Address, OrderContactInformation } from '../../types';

export interface InitializePaymentParams {
  customerId?: string;
  contactInformation: OrderContactInformation;
  shippingAddress: Address;
  cartItems: CartItem[];
  deliverySpeed?: string;
  affiliateReferral?: {
    code: string;
    linkId?: string;
    campaignId?: string;
  };
}

export interface InitializePaymentResponse {
  status: 'success' | 'error';
  reference: string;
  authorization_url: string;
  access_code: string;
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  testMode?: boolean;
}

export interface VerifyPaymentResponse {
  status: 'success' | 'failed' | 'error';
  alreadyProcessed?: boolean;
  orderId?: string;
  orderNumber?: string;
  reference?: string;
  amount?: number;
  customerEmail?: string;
  error?: string;
}

export interface PaymentGatewayConfig {
  publicKey: string;
  currency: string;
  testMode: boolean;
  environment: string;
}

/**
 * Retrieves the client-safe public configuration from the server.
 */
export const fetchPaymentConfig = async (): Promise<PaymentGatewayConfig> => {
  try {
    const res = await fetch('/api/payments/config');
    if (!res.ok) throw new Error('Failed to load gateway config');
    return await res.json();
  } catch (err) {
    console.warn('[PaymentService] Error fetching gateway config, using defaults:', err);
    return {
      publicKey: 'pk_test_marketnest_sample_public_key',
      currency: 'NGN',
      testMode: true,
      environment: 'sandbox_simulator'
    };
  }
};

/**
 * Initiates an authoritative payment transaction on the server.
 * Backend verifies stock, prices, seller status, and computes the exact total.
 */
export const initializePaymentSession = async (
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> => {
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const data = await response.json();
  if (!response.ok || data.status !== 'success') {
    throw new Error(data.error || 'Failed to initialize payment session.');
  }

  return data;
};

/**
 * Calls trusted server-side verification with Paystack.
 * Authoritative: order is only confirmed after this endpoint returns success.
 */
export const verifyPaymentSession = async (
  reference: string,
  simulateFail: boolean = false
): Promise<VerifyPaymentResponse> => {
  const url = `/api/payments/verify/${encodeURIComponent(reference)}${
    simulateFail ? '?simulate_fail=true' : ''
  }`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    return {
      status: 'failed',
      reference,
      error: data.error || 'Payment could not be verified with Paystack.'
    };
  }

  return data;
};

/**
 * Polls payment reference status from the server.
 */
export const fetchPaymentStatus = async (reference: string) => {
  const response = await fetch(`/api/payments/status/${encodeURIComponent(reference)}`);
  return await response.json();
};

/**
 * Dynamically loads Paystack's official inline script.
 */
const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).PaystackPop) return resolve(true);

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface LaunchCheckoutOptions {
  publicKey: string;
  email: string;
  amountInKobo: number;
  reference: string;
  authorizationUrl: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  onCancel?: () => void;
}

/**
 * Launches Paystack Checkout modal or safely redirects to authorization_url.
 */
export const launchPaystackCheckout = async (options: LaunchCheckoutOptions): Promise<void> => {
  const { publicKey, email, amountInKobo, reference, authorizationUrl, onSuccess, onClose } = options;

  const scriptLoaded = await loadPaystackScript();

  // If PaystackPop is available and not in mock redirect mode, open inline modal
  if (
    scriptLoaded &&
    (window as any).PaystackPop &&
    publicKey &&
    !publicKey.startsWith('pk_test_sample') &&
    authorizationUrl &&
    !authorizationUrl.includes('mock=true')
  ) {
    try {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email,
        amount: amountInKobo,
        ref: reference,
        currency: 'NGN',
        callback: function (response: { reference: string }) {
          onSuccess(response.reference || reference);
        },
        onClose: function () {
          onClose();
        }
      });
      handler.openIframe();
      return;
    } catch (inlineErr) {
      console.warn('[PaystackPop] Inline setup error, fallback to URL:', inlineErr);
    }
  }

  // Standard fallback: redirect or simulated checkout transition
  window.location.href = authorizationUrl;
};
