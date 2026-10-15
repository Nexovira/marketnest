/**
 * @file src/utils/money.ts
 * Centralized currency and smallest-unit (Kobo) conversion utility for MarketNest.
 * Complies with Paystack API requirement of integer kobo for all NGN monetary transactions.
 */

/**
 * Converts a standard Naira amount to its smallest currency unit (Kobo).
 * Example: ₦88,500.50 -> 8850050 kobo
 */
export const toMinorUnit = (amountInNaira: number): number => {
  if (typeof amountInNaira !== 'number' || isNaN(amountInNaira)) {
    return 0;
  }
  // Use Math.round to safely mitigate floating point precision inaccuracies
  return Math.round(amountInNaira * 100);
};

/**
 * Converts a smallest currency unit (Kobo) to standard Naira.
 * Example: 8850050 kobo -> ₦88,500.50
 */
export const fromMinorUnit = (amountInKobo: number): number => {
  if (typeof amountInKobo !== 'number' || isNaN(amountInKobo)) {
    return 0;
  }
  return amountInKobo / 100;
};

/**
 * Formats a numeric value into an authoritative currency string.
 * Example: 88500 -> "₦88,500" or formatCurrency(50, 'USD') -> "$50"
 */
export const formatNairaAmount = (
  amount: number,
  currencyOrShowDecimals?: string | boolean,
  showDecimalsArg?: boolean
): string => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const currency = typeof currencyOrShowDecimals === 'string' ? currencyOrShowDecimals : 'NGN';
  const showDecimals = typeof currencyOrShowDecimals === 'boolean' ? currencyOrShowDecimals : !!showDecimalsArg;

  try {
    const formatted = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    }).format(safeAmount);

    if (currency === 'NGN') {
      return formatted.replace('NGN', '₦').trim();
    }
    return formatted;
  } catch {
    return `${currency} ${Math.round(safeAmount).toLocaleString()}`;
  }
};

/**
 * Standard alias for formatNairaAmount used across pages & components.
 */
export const formatCurrency = formatNairaAmount;
