/**
 * @file src/components/ui/PriceDisplay.tsx
 * Tabular-aligned Nigerian Naira (₦) price formatter.
 */

import React from 'react';

export interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  compareAtPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount).replace('NGN', '₦');
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  compareAtPrice,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl lg:text-3xl font-bold tracking-tight'
  };

  const effectiveOriginal = originalPrice ?? compareAtPrice;

  const discountPercent =
    effectiveOriginal && effectiveOriginal > price
      ? Math.round(((effectiveOriginal - price) / effectiveOriginal) * 100)
      : null;

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`${sizeClasses[size]} text-[#101413] tabular-nums`}>
        {formatNaira(price)}
      </span>

      {originalPrice && originalPrice > price && (
        <span className="text-xs lg:text-sm text-[#6B726E] line-through tabular-nums">
          {formatNaira(originalPrice)}
        </span>
      )}

      {discountPercent && discountPercent > 0 && (
        <span className="text-[11px] font-medium text-[#0E8F5A] bg-[#E8F5EF] px-1.5 py-0.5 rounded">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
};
