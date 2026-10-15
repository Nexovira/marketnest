/**
 * @file src/pages/auth/ForgotPasswordPage.tsx
 * Customer password reset request page with friendly state transitions.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { mapAuthError } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const { navigateTo } = useMarket();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E4E7E5] shadow-lg p-6 sm:p-8 space-y-6">
        <div>
          <button
            onClick={() => navigateTo('login')}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B726E] hover:text-[#101413] transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </button>

          <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mb-3">
            <Mail className="w-5 h-5" />
          </div>

          <h1 className="text-2xl font-bold text-[#101413] tracking-tight">
            Reset your password
          </h1>
          <p className="text-xs sm:text-sm text-[#6B726E] mt-1.5 leading-relaxed">
            Enter the email address registered with your MarketNest account. We&apos;ll send you a secure link to reset your credentials.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="p-5 rounded-xl bg-[#F7F5F0] border border-[#E4E7E5] text-center space-y-3 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101413]">Check your inbox</h3>
            <p className="text-xs text-[#6B726E] leading-relaxed">
              We&apos;ve sent a password reset link to <strong className="text-[#101413]">{email}</strong>. Please click the link to choose a new password.
            </p>
            <div className="pt-2">
              <Button
                variant="dark"
                size="sm"
                fullWidth
                onClick={() => navigateTo('login')}
              >
                Return to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              type="submit"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
