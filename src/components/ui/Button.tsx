/**
 * @file src/components/ui/Button.tsx
 * Production button with strict spatial math, single-line labels, and accessible focus.
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  leftIcon,
  icon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const effectiveLoading = isLoading || loading;
  const effectiveLeftIcon = leftIcon || icon;
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E8F5A] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap shrink-0';

  const sizeClasses = {
    sm: 'text-xs py-2 px-3.5 min-h-[36px] gap-1.5',
    md: 'text-sm py-2.5 px-5 min-h-[44px] gap-2',
    lg: 'text-base py-3 px-6 min-h-[48px] gap-2.5'
  };

  const variantClasses = {
    primary:
      'bg-[#0E8F5A] hover:bg-[#0B7549] text-white shadow-sm hover:shadow active:bg-[#095E3A]',
    dark:
      'bg-[#101413] hover:bg-[#1B211F] text-white shadow-sm hover:shadow active:bg-[#000000]',
    secondary:
      'bg-[#1B211F] hover:bg-[#2A3330] text-white',
    soft:
      'bg-[#E8F5EF] hover:bg-[#D4ECE0] text-[#0E8F5A] font-semibold',
    outline:
      'border border-[#E4E7E5] hover:border-[#101413] bg-transparent text-[#101413] hover:bg-[#F7F5F0]',
    ghost:
      'bg-transparent hover:bg-[#F7F5F0] text-[#101413]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow active:bg-rose-800 focus-visible:ring-rose-500'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || effectiveLoading}
      {...props}
    >
      {effectiveLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {effectiveLeftIcon && <span className="shrink-0">{effectiveLeftIcon}</span>}
          <span className="truncate">{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
