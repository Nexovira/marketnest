/**
 * @file src/components/ui/Skeleton.tsx
 * Subtle loading skeleton for cards and placeholders.
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[#F7F5F0] rounded ${className}`}
      aria-hidden="true"
    />
  );
};
