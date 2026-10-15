/**
 * @file src/components/GuestAuthModal.tsx
 * Non-intrusive prompt encouraging guests to sync saved items across devices.
 */

import React from 'react';
import { useMarket } from '../context/MarketContext';
import { Button } from './ui/Button';
import { Heart, X, ShieldCheck } from 'lucide-react';

export const GuestAuthModal: React.FC = () => {
  const { showGuestAuthModal, setShowGuestAuthModal, navigateTo } = useMarket();

  if (!showGuestAuthModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={() => setShowGuestAuthModal(false)}
        className="fixed inset-0 bg-[#101413]/50 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-xl shadow-2xl p-6 border border-[#E4E7E5] my-8 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setShowGuestAuthModal(false)}
            className="absolute top-4 right-4 p-1 text-[#6B726E] hover:text-[#101413] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-3 pt-2">
            <div className="w-12 h-12 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 fill-[#0E8F5A]" />
            </div>

            <h3 className="text-lg font-bold text-[#101413]">
              Save products you love
            </h3>

            <p className="text-xs text-[#6B726E] leading-relaxed max-w-sm mx-auto">
              We&apos;ve temporarily saved this to your browser. Sign in or create a free account to access your saved items from any device.
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setShowGuestAuthModal(false);
                navigateTo('login');
              }}
            >
              Sign In
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => {
                setShowGuestAuthModal(false);
                navigateTo('register');
              }}
            >
              Create Account
            </Button>

            <button
              onClick={() => setShowGuestAuthModal(false)}
              className="w-full text-center text-xs text-[#6B726E] hover:text-[#101413] py-1 cursor-pointer transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E4E7E5] flex items-center justify-center gap-1.5 text-[11px] text-[#6B726E]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" />
            <span>Secure 256-bit encryption · MarketNest Customer Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
