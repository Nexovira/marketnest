/**
 * @file src/components/StoreCard.tsx
 * Verified merchant card representing credible Nigerian businesses.
 */

import React from 'react';
import { Store } from '../types';
import { useMarket } from '../context/MarketContext';
import { VerifiedBadge } from './ui/VerifiedBadge';
import { RatingStars } from './ui/RatingStars';
import { Button } from './ui/Button';
import { MapPin, Package, Clock } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  className?: string;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, className = '' }) => {
  const { navigateTo } = useMarket();

  const handleVisitStore = () => {
    navigateTo('shop', { search: store.name });
  };

  return (
    <div
      className={`bg-[#FFFFFF] border border-[#E4E7E5] rounded-lg p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#CBD5E1] ${className}`}
    >
      <div>
        {/* Store Header: Avatar & Verified Badge */}
        <div className="flex items-start gap-3.5">
          <img
            src={store.logoUrl}
            alt={store.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-12 h-12 rounded-full object-cover border border-[#E4E7E5] shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-semibold text-[#101413] truncate">{store.name}</h3>
              {store.verified && <VerifiedBadge size="sm" />}
            </div>

            <div className="flex items-center gap-1 text-xs text-[#6B726E] mt-0.5">
              <MapPin className="w-3 h-3 text-[#6B726E] shrink-0" />
              <span className="truncate">{store.city}, {store.state}</span>
            </div>
          </div>
        </div>

        {/* Store Bio */}
        <p className="text-xs text-[#6B726E] mt-3 line-clamp-2 leading-relaxed">
          {store.bio}
        </p>

        {/* Store Trust Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#E4E7E5] text-xs">
          <div className="flex items-center gap-1.5 text-[#101413]">
            <Package className="w-3.5 h-3.5 text-[#6B726E]" />
            <span className="tabular-nums font-medium">{store.productCount}</span>
            <span className="text-[#6B726E]">products</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#101413]">
            <Clock className="w-3.5 h-3.5 text-[#0E8F5A]" />
            <span className="text-[#6B726E]">Ships in</span>
            <span className="tabular-nums font-medium">{store.shipsWithinHours}h</span>
          </div>
        </div>

        <div className="mt-2.5">
          <RatingStars rating={store.rating} reviewCount={store.reviewCount} size="sm" />
        </div>
      </div>

      {/* Action */}
      <div className="mt-4 pt-3 border-t border-[#E4E7E5]">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={handleVisitStore}
        >
          Visit Store
        </Button>
      </div>
    </div>
  );
};
