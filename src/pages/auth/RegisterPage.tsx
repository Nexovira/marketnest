/**
 * @file src/pages/auth/RegisterPage.tsx
 * Customer registration page with real-time validation and luxury presentation.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { mapAuthError } from '../../lib/auth';
import { EDITORIAL_MADE_IN_NIGERIA } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const { navigateTo, showToast } = useMarket();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time validation checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please provide your full first and last name.');
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMessage('Please ensure your password meets all security criteria.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('The passwords entered do not match. Please recheck.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });

      showToast('Account Created', 'Welcome to MarketNest! Please verify your email.', 'success');
      navigateTo('verify-email');
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      showToast('Welcome to MarketNest', 'Signed in with your Google account.', 'success');
      navigateTo('account');
    } catch (err) {
      setErrorMessage(mapAuthError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl border border-[#E4E7E5] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-sm bg-[#101413] text-white flex items-center justify-center font-black text-xs">
                M
              </span>
              <span className="text-sm font-extrabold tracking-tight text-[#101413]">
                MARKETNEST
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-[#6B726E] mt-1.5 leading-relaxed">
              Join thousands of Nigerian customers discovering verified independent brands and artisans with full escrow protection.
            </p>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Sign Up */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-md border border-[#E4E7E5] bg-white hover:bg-[#F7F5F0] text-xs font-semibold text-[#101413] transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E4E7E5]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#6B726E]">Or register with email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Babajide"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs sm:text-sm text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Adeleke"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs sm:text-sm text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs sm:text-sm text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 pr-10 text-xs sm:text-sm text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B726E] hover:text-[#101413] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs sm:text-sm text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
              </div>

              {/* Password Requirements Checklist */}
              {password.length > 0 && (
                <div className="p-3 bg-[#F7F5F0] rounded-md space-y-1 text-[11px] text-[#6B726E]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#0E8F5A] font-medium' : ''}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-[#0E8F5A]' : 'text-neutral-400'}`} />
                    <span>Minimum 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? 'text-[#0E8F5A] font-medium' : ''}`}>
                    <Check className={`w-3.5 h-3.5 ${hasLetter && hasNumber ? 'text-[#0E8F5A]' : 'text-neutral-400'}`} />
                    <span>Contains letters and numbers</span>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-[#0E8F5A] font-medium' : 'text-rose-600'}`}>
                      <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-[#0E8F5A]' : 'text-rose-600'}`} />
                      <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  type="submit"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>

          {/* Footer link */}
          <div className="pt-6 mt-6 border-t border-[#E4E7E5] text-center text-xs text-[#6B726E]">
            <span>Already have an account? </span>
            <button
              onClick={() => navigateTo('login')}
              className="text-[#0E8F5A] font-semibold hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Right Editorial Visual Panel (Desktop) */}
        <div className="hidden lg:block lg:col-span-5 bg-[#F7F5F0] relative overflow-hidden">
          <img
            src={EDITORIAL_MADE_IN_NIGERIA}
            alt="Handcrafted Nigerian craftsmanship"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E8F5A]">
              Join the Movement
            </span>
            <h3 className="text-xl font-bold leading-snug">
              Direct access to Nigeria&apos;s finest independent makers.
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Every purchase through MarketNest supports vetted Nigerian merchants with secured payments and delivery tracking.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#0E8F5A]">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Escrow Protection on Every Order</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
