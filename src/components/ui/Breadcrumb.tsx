/**
 * @file src/components/ui/Breadcrumb.tsx
 * Clean, unboxed typography breadcrumb navigation with subtle separators.
 */

import React from 'react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs lg:text-sm text-[#6B726E] ${className}`}>
      <ol className="flex items-center space-x-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.isCurrent;
          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && <span className="text-[#CBD5E1]" aria-hidden="true">/</span>}
              {isLast ? (
                <span className="font-medium text-[#101413] truncate max-w-[200px] lg:max-w-xs" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-[#101413] hover:underline underline-offset-4 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
