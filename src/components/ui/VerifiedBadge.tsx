/**
 * @file src/components/ui/VerifiedBadge.tsx
 * Quiet, trustworthy verified store and seller badge without tacky pill slop.
 */

import React from 'react';
import { Check } from 'lucide-react';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  showIconOnly?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  label = 'Verified',
  size = 'sm',
  className = '',
  showIconOnly = false
}) => {
  if (showIconOnly) {
    return (
      <span
        title="Verified Merchant"
        className={`inline-flex items-center justify-center rounded-full bg-[#0E8F5A] text-white ${
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        } ${className}`}
      >
        <Check className={size === 'sm' ? 'w-2.5 h-2.5 stroke-[3]' : 'w-3 h-3 stroke-[3]'} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium text-[#0E8F5A] ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      } ${className}`}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-[#0E8F5A] text-white w-3.5 h-3.5">
        <Check className="w-2.5 h-2.5 stroke-[3]" />
      </span>
      <span>{label}</span>
    </span>
  );
};
