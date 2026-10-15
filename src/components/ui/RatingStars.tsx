/**
 * @file src/components/ui/RatingStars.tsx
 * Accessible rating indicator with unboxed review counts.
 */

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
  className = ''
}) => {
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-amber-500">
        <Star className={`${starSizes[size]} fill-amber-400 text-amber-500`} />
      </div>

      <span className={`font-medium text-[#101413] tabular-nums ${textSizes[size]}`}>
        {rating.toFixed(1)}
      </span>

      {showCount && reviewCount !== undefined && (
        <span className={`text-[#6B726E] tabular-nums ${textSizes[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
