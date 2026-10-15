/**
 * @file src/services/commissionService.ts
 * Centralized marketplace commission and gateway processing fee calculation engine.
 * Ensures consistent revenue share and fee attribution across multi-vendor checkouts.
 */

/**
 * Default marketplace platform commission rate (8.0% for vetted luxury vendors).
 * Configurable per merchant tier or development environment.
 */
export const DEFAULT_PLATFORM_COMMISSION_RATE = 0.08;

/**
 * Standard Paystack Nigeria transaction fee model:
 * 1.5% + ₦100 (cap of ₦2,000; the ₦100 flat fee is waived for transactions below ₦2,500).
 */
export const PAYSTACK_PERCENTAGE_FEE = 0.015;
export const PAYSTACK_FLAT_FEE = 100;
export const PAYSTACK_FLAT_FEE_THRESHOLD = 2500;
export const PAYSTACK_MAX_FEE_CAP = 2000;

export interface FinancialBreakdown {
  grossAmount: number;
  platformCommissionRate: number;
  platformCommission: number;
  paymentProcessingFee: number;
  netSellerAmount: number;
}

/**
 * Calculates platform commission attributable to MarketNest from gross sales.
 */
export const calculatePlatformCommission = (
  grossAmount: number,
  rate: number = DEFAULT_PLATFORM_COMMISSION_RATE
): number => {
  if (grossAmount <= 0) return 0;
  return Math.round(grossAmount * rate);
};

/**
 * Calculates payment processing gateway fee (Paystack standard NGN schedule).
 */
export const calculatePaymentProcessingFee = (grossAmount: number): number => {
  if (grossAmount <= 0) return 0;

  let fee = grossAmount * PAYSTACK_PERCENTAGE_FEE;
  if (grossAmount >= PAYSTACK_FLAT_FEE_THRESHOLD) {
    fee += PAYSTACK_FLAT_FEE;
  }

  // Enforce fee cap
  fee = Math.min(fee, PAYSTACK_MAX_FEE_CAP);
  return Math.round(fee);
};

/**
 * Calculates complete transparent merchant financial breakdown:
 * Net Amount = Gross Sale - Platform Commission - Gateway Processing Fee
 */
export const calculateSellerFinancialBreakdown = (
  grossAmount: number,
  customRate: number = DEFAULT_PLATFORM_COMMISSION_RATE
): FinancialBreakdown => {
  const platformCommission = calculatePlatformCommission(grossAmount, customRate);
  const paymentProcessingFee = calculatePaymentProcessingFee(grossAmount);
  const netSellerAmount = Math.max(0, grossAmount - platformCommission - paymentProcessingFee);

  return {
    grossAmount,
    platformCommissionRate: customRate,
    platformCommission,
    paymentProcessingFee,
    netSellerAmount
  };
};
