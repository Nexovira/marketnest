/**
 * @file src/services/unifiedDeliveryService.ts
 * Unified Delivery Carrier Abstraction Service for MarketNest.
 * Connects checkout to multi-carrier quotes (GIG Logistics, Kwik Delivery, DHL Express)
 * with carrier outage failover, zone SLA calculations, and tracking normalization.
 */

import { DeliveryQuote, DeliveryProviderId, NormalizedTrackingUpdate } from '../types';

export interface MultiCarrierQuoteRequest {
  destinationState: string;
  destinationCity?: string;
  subtotal: number;
  distinctSellerCount: number;
  requestedSpeed?: 'standard' | 'sameday' | 'express';
}

export const unifiedDeliveryService = {
  /**
   * Fetches quotes across all registered delivery providers
   */
  async getDeliveryQuotes(params: MultiCarrierQuoteRequest): Promise<{
    recommendedProvider: DeliveryProviderId;
    quotes: DeliveryQuote[];
  }> {
    try {
      const res = await fetch('/api/delivery/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!res.ok) throw new Error('Failed to fetch delivery quotes');
      const json = await res.json();
      return {
        recommendedProvider: json.recommendedProvider || 'gig_logistics',
        quotes: json.data || []
      };
    } catch (err) {
      console.warn('[UnifiedDelivery] Using fallback local quotes:', err);
      const isLagos = params.destinationState.toLowerCase().includes('lagos');
      const baseFee = isLagos ? 3500 : 6500;
      const isFree = isLagos && params.subtotal >= 50000;

      return {
        recommendedProvider: 'gig_logistics',
        quotes: [
          {
            providerId: 'gig_logistics',
            providerName: 'GIG Logistics (GIGL)',
            serviceLevel: isLagos ? 'Lagos Hub Priority' : 'Nationwide Ground Fleet',
            rateInMinorUnits: (isFree ? 0 : baseFee) * 100,
            currency: 'NGN',
            estimatedDaysMin: isLagos ? 1 : 2,
            estimatedDaysMax: isLagos ? 1 : 4,
            estimatedDeliveryText: isLagos ? 'Tomorrow by 1:00 PM' : '2–4 Business Days',
            isGuaranteed: true,
            trackingCapabilities: ['gps_realtime', 'milestones_only']
          }
        ]
      };
    }
  },

  /**
   * Normalizes disparate tracking states from multiple carrier formats
   */
  normalizeCarrierStatus(
    carrier: DeliveryProviderId,
    rawStatus: string
  ): NormalizedTrackingUpdate {
    const s = rawStatus.toLowerCase();
    const timestamp = new Date().toISOString();

    if (s.includes('delivered') || s.includes('pod_received')) {
      return {
        timestamp,
        status: 'delivered',
        location: 'Customer Address',
        description: 'Package handed to verified customer. 7-Day Escrow Inspection Window starts.',
        carrierRawStatus: rawStatus
      };
    }

    if (s.includes('out_for_delivery') || s.includes('with_rider') || s.includes('dispatched')) {
      return {
        timestamp,
        status: 'out_for_delivery',
        location: carrier === 'kwik_delivery' ? 'Kwik Dispatch Hub' : 'Local Waypoint Station',
        description: 'Assigned to courier rider for final delivery today.',
        carrierRawStatus: rawStatus
      };
    }

    if (s.includes('in_transit') || s.includes('departed_facility') || s.includes('hub_transfer')) {
      return {
        timestamp,
        status: 'in_transit',
        location: 'Central Consolidation Facility',
        description: 'In transit between MarketNest logistics distribution centers.',
        carrierRawStatus: rawStatus
      };
    }

    if (s.includes('picked_up') || s.includes('seller_handed_over')) {
      return {
        timestamp,
        status: 'picked_up',
        location: 'Merchant Storefront',
        description: 'Package picked up from verified seller and validated at intake scale.',
        carrierRawStatus: rawStatus
      };
    }

    return {
      timestamp,
      status: 'label_created',
      location: 'Logistics Operations Center',
      description: 'Shipment manifest generated. Awaiting courier intake.',
      carrierRawStatus: rawStatus
    };
  }
};
