/**
 * @file src/components/RegionCurrencyModal.tsx
 * Multi-Region & Currency Selection Dialog for MarketNest.
 * Displays data-driven country regions, currency rules, local fulfillment hubs,
 * and regional tax disclosures with active Nigerian market defaults.
 */

import React, { useState, useEffect } from 'react';
import { MarketplaceRegion } from '../types';
import { multiRegionService, DEFAULT_NIGERIA_REGION } from '../services/multiRegionService';
import { Button } from './ui/Button';
import {
  Globe,
  Check,
  ShieldCheck,
  MapPin,
  Clock,
  CreditCard,
  Truck,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';

interface RegionCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegionChange?: (region: MarketplaceRegion) => void;
}

export const RegionCurrencyModal: React.FC<RegionCurrencyModalProps> = ({
  isOpen,
  onClose,
  onRegionChange
}) => {
  const [regions, setRegions] = useState<MarketplaceRegion[]>([DEFAULT_NIGERIA_REGION]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('region_ng');
  const [selectedStateCode, setSelectedStateCode] = useState<string>('LA');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const activeId = multiRegionService.getActiveRegionId();
      setSelectedRegionId(activeId);
      multiRegionService.getRegions().then((data) => {
        if (data && data.length > 0) setRegions(data);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRegion = regions.find((r) => r.id === selectedRegionId) || regions[0] || DEFAULT_NIGERIA_REGION;

  const handleSelectRegion = (region: MarketplaceRegion) => {
    if (region.status !== 'active') {
      return; // Prevent selecting unverified regions
    }
    setSelectedRegionId(region.id);
  };

  const handleSave = () => {
    multiRegionService.setActiveRegionId(selectedRegionId);
    if (onRegionChange) {
      onRegionChange(currentRegion);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E4E7E5] space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E4E7E5]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F5EF] text-[#0E8F5A] text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Multi-Region Marketplace Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#101413]">
              Regional Hub & Currency
            </h2>
            <p className="text-xs text-[#6B726E]">
              MarketNest operations are currently live across Nigeria with full escrow and certified courier dispatch.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Available Regions Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#101413] block uppercase tracking-wider">
            Select Country & Currency Region
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regions.map((region) => {
              const isSelected = region.id === selectedRegionId;
              const isActive = region.status === 'active';

              return (
                <div
                  key={region.id}
                  onClick={() => handleSelectRegion(region)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#0E8F5A] bg-[#E8F5EF]/30 ring-1 ring-[#0E8F5A]'
                      : isActive
                      ? 'border-[#E4E7E5] hover:border-[#CBD5E1] bg-white cursor-pointer'
                      : 'border-[#E4E7E5] bg-[#FBFBFA] opacity-70 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{region.flagEmoji}</span>
                      <div>
                        <h4 className="font-bold text-xs text-[#101413]">{region.countryName}</h4>
                        <span className="text-[11px] font-semibold text-[#0E8F5A]">
                          {region.currencyCode} ({region.currencySymbol})
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0E8F5A] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-neutral-100">
                    <span className="text-[#6B726E]">Locale: {region.locale}</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded uppercase ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : region.status === 'coming_soon'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {isActive ? 'Active Market' : region.status === 'coming_soon' ? 'Coming Soon' : 'In Regulatory Review'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Region Detailed Breakdown */}
        <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#101413] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#0E8F5A]" />
              <span>{currentRegion.countryName} Regional Parameters</span>
            </span>
            <span className="text-[11px] font-semibold text-[#6B726E]">
              ISO: {currentRegion.countryCode} / {currentRegion.currencyCode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg border border-[#E4E7E5] space-y-1">
              <span className="text-[10px] text-[#6B726E] font-medium block">Tax Compliance</span>
              <p className="font-bold text-[#101413]">
                {currentRegion.taxConfig.taxName}: {(currentRegion.taxConfig.vatRate * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-emerald-700 block">
                {currentRegion.taxConfig.isTaxInclusive ? 'Display prices inclusive' : 'Exclusive at checkout'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-[#E4E7E5] space-y-1">
              <span className="text-[10px] text-[#6B726E] font-medium block">Primary Payment Rails</span>
              <p className="font-bold text-[#101413]">
                Paystack Verified Gateway
              </p>
              <span className="text-[10px] text-[#6B726E] block">
                Cards, Bank Transfer, USSD
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-[#E4E7E5] space-y-1">
              <span className="text-[10px] text-[#6B726E] font-medium block">Fulfillment Fleet</span>
              <p className="font-bold text-[#101413]">
                GIG Logistics + Kwik
              </p>
              <span className="text-[10px] text-[#6B726E] block">
                24h Lagos / 72h Nationwide
              </span>
            </div>
          </div>

          {/* Regional Hub selector within Nigeria */}
          {currentRegion.supportedStates?.length > 0 && (
            <div>
              <label className="text-[11px] font-bold text-[#101413] block mb-1.5">
                Active Delivery State Hub:
              </label>
              <select
                value={selectedStateCode}
                onChange={(e) => setSelectedStateCode(e.target.value)}
                className="w-full bg-white border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A]"
              >
                {currentRegion.supportedStates.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.isDispatchHub ? 'Primary Logistics Hub' : 'Regional Waypoint'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Trust Escrow Note */}
          <div className="flex items-start gap-2 pt-2 border-t border-neutral-200 text-[11px] text-[#6B726E]">
            <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0 mt-0.5" />
            <span>
              All transactions in {currentRegion.currencyCode} remain protected by MarketNest 7-Day Escrow. Foreign expansion regions require active local trust partner accounts before checkout is enabled.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Confirm Region
          </Button>
        </div>
      </div>
    </div>
  );
};
