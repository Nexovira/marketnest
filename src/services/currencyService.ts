/**
 * @file src/services/currencyService.ts
 * Standard currency formatting service for MarketNest.
 * Standardizes Nigerian Naira (NGN, ₦) with tabular alignment.
 */

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₦0';
  }
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
};

export const formatNaira = formatCurrency;
