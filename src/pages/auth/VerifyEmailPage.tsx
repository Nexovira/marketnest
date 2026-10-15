/**
 * @file src/pages/auth/VerifyEmailPage.tsx
 * Customer email verification notice with resend and reload controls.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { firebaseUser, resendVerificationEmail, refreshProfile } = useAuth();
  const { navigateTo, showToast } = useMarket();

  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      showToast('Verification Sent', 'A fresh verification link has been sent to your email.', 'success');
    } catch {
      showToast('Notice', 'Could not send verification email right now. Please wait a minute.', 'warning');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setIsChecking(true);
    try {
      if (firebaseUser) {
        await firebaseUser.reload();
        await refreshProfile();
        if (firebaseUser.emailVerified) {
          showToast('Email Verified', 'Thank you! Your email is verified.', 'success');
          navigateTo('account');
          return;
        }
      }
      showToast('Pending Verification', 'We have not detected your verification click yet. Please check your spam folder.', 'info');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E4E7E5] shadow-lg p-6 sm:p-8 space-y-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#101413] tracking-tight">
            Check your inbox
          </h1>
          <p className="text-xs sm:text-sm text-[#6B726E] mt-2 leading-relaxed">
            We&apos;ve sent a verification link to{' '}
            <strong className="text-[#101413]">{firebaseUser?.email || 'your email'}</strong>. Click the link to verify your MarketNest customer identity.
          </p>
        </div>

        <div className="p-4 bg-[#F7F5F0] rounded-xl text-left space-y-2 border border-[#E4E7E5] text-xs text-[#6B726E]">
          <div className="flex items-center gap-2 text-[#101413] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#0E8F5A]" />
            <span>Why verify your email?</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Verified accounts receive instant dispatch confirmation, SMS delivery tracking codes, and priority escrow resolution.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            isLoading={isChecking}
            onClick={handleCheckVerified}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            I&apos;ve verified my email
          </Button>

          <Button
            variant="outline"
            size="md"
            fullWidth
            isLoading={isResending}
            onClick={handleResend}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Resend verification email
          </Button>

          <button
            onClick={() => navigateTo('shop')}
            className="w-full text-center text-xs text-[#6B726E] hover:text-[#101413] py-2 cursor-pointer transition-colors inline-flex items-center justify-center gap-1"
          >
            <span>Continue shopping as guest</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
