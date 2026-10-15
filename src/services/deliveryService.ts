/**
 * @file src/services/deliveryService.ts
 * Configurable delivery calculation service for MarketNest multi-vendor commerce.
 * Prepares for future dynamic carrier rate APIs, distance calculations, and state rates.
 */

import { CartItem } from '../types';

export interface DeliveryCalculationParams {
  items: CartItem[];
  destinationState?: string;
  destinationCity?: string;
  speed?: 'lagos_sameday' | 'lagos_24h' | 'express_48h' | 'standard';
}

export interface DeliveryCalculationResult {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isEligibleForFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;
  estimatedDeliveryText: string;
  distinctSellerCount: number;
}

export const FREE_DELIVERY_THRESHOLD = 50000; // ₦50,000

export const calculateDelivery = (params: DeliveryCalculationParams): DeliveryCalculationResult => {
  const { items, destinationState = 'Lagos', speed = 'lagos_24h' } = params;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Group by seller to understand multi-vendor dispatch logistics
  const sellerIds = new Set<string>();
  items.forEach((item) => {
    if (item.sellerId) {
      sellerIds.add(item.sellerId);
    } else if (item.product?.sellerId) {
      sellerIds.add(item.product.sellerId);
    }
  });

  const distinctSellerCount = Math.max(1, sellerIds.size);
  const isLagos = destinationState.toLowerCase().includes('lagos');
  const isAbuja = destinationState.toLowerCase().includes('abuja');

  // Check free delivery qualification (applies to Lagos destinations above threshold)
  const isEligibleForFreeDelivery = isLagos && subtotal >= FREE_DELIVERY_THRESHOLD;
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  if (isEligibleForFreeDelivery) {
    return {
      deliveryFee: 0,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
      isEligibleForFreeDelivery: true,
      amountNeededForFreeDelivery: 0,
      estimatedDeliveryText: speed === 'lagos_sameday' ? 'Today by 6:00 PM' : 'Tomorrow by 1:00 PM',
      distinctSellerCount
    };
  }

  // Base shipping cost by destination
  let baseFee = 3500; // Lagos standard
  let estimatedDeliveryText = '1–2 business days';

  if (!isLagos) {
    if (isAbuja) {
      baseFee = 5500;
      estimatedDeliveryText = '2–3 business days via Express Courier';
    } else {
      baseFee = 7000;
      estimatedDeliveryText = '3–5 business days Nationwide Dispatch';
    }
  } else {
    if (speed === 'lagos_sameday') {
      baseFee = 4500;
      estimatedDeliveryText = 'Today by 6:00 PM';
    } else {
      baseFee = 3500;
      estimatedDeliveryText = 'Tomorrow by 1:00 PM';
    }
  }

  // Multi-seller consolidation fee: ₦1,000 per extra independent vendor
  const multiSellerSurcharge = (distinctSellerCount - 1) * 1000;
  const finalFee = baseFee + multiSellerSurcharge;

  return {
    deliveryFee: finalFee,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    isEligibleForFreeDelivery: false,
    amountNeededForFreeDelivery,
    estimatedDeliveryText,
    distinctSellerCount
  };
};
