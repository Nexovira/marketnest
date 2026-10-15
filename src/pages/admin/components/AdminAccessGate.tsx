/**
 * @file src/pages/admin/components/AdminAccessGate.tsx
 * Security Gate & Access Recovery Modal for MarketNest Administrators.
 * Prevents unauthorized access, enables root owner onboarding, and provides
 * safe emergency recovery without authentication bypasses.
 */

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAdmin } from '../../../context/AdminContext';
import { PLATFORM_OWNER_EMAIL } from '../../../services/admin/adminAuthService';
import { Button } from '../../../components/ui/Button';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Mail,
  AlertCircle,
  ArrowRight,
  Sparkles,
  LogOut,
  RefreshCw
} from 'lucide-react';

export const AdminAccessGate: React.FC = () => {
  const { firebaseUser, signIn, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const { isOwner, isAdminVerified, claimSuperAdmin, recoverAdminAccess } = useAdmin();

  // Mode: 'login' | 'claim' | 'recover' | 'denied'
  const [activeTab, setActiveTab] = useState<'signin' | 'recover'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRoot = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await claimSuperAdmin();
      setSuccessMessage(res.message || 'Super Administrator role provisioned successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to claim root administrator account.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKey.trim()) {
      setError('Please enter the emergency recovery key.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await recoverAdminAccess(recoveryKey.trim());
      setSuccessMessage(res.message || 'Emergency administrator access recovered successfully!');
    } catch (err: any) {
      setError(err.message || 'Recovery failed. Invalid recovery key.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-[#6B726E]">Verifying platform credentials...</p>
      </div>
    );
  }

  // Case 1: Authenticated but NOT authorized (Unauthorized Account)
  if (firebaseUser && !isAdminVerified && !isOwner) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-[#E4E7E5] rounded-2xl max-w-md w-full p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-[#101413] tracking-tight">
              Administrative Clearance Required
            </h2>
            <p className="text-xs text-[#6B726E] leading-relaxed">
              This area is strictly restricted to MarketNest operational staff and platform directors.
            </p>
          </div>

          <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-3 text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B726E]">
              Current Account
            </span>
            <p className="text-xs font-mono font-medium text-[#101413] break-all">
              {firebaseUser.email || firebaseUser.uid}
            </p>
            <span className="inline-block text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
              Standard User (Non-Admin)
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => (window.location.href = '/')}
            >
              Return to Marketplace
            </Button>

            <Button
              variant="outline"
              className="w-full text-rose-600 hover:text-rose-700"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Authenticated as Platform Owner (ummuunaysah2006@gmail.com) but needs activation / recovery
  if (firebaseUser && isOwner && !isAdminVerified) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-[#E4E7E5] rounded-2xl max-w-md w-full p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-14 h-14 bg-[#E8F5EF] text-[#0E8F5A] rounded-2xl flex items-center justify-center mx-auto border border-[#A7E2C9]">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#0E8F5A] uppercase tracking-wider bg-[#E8F5EF] px-2.5 py-1 rounded-full">
              Verified Platform Owner
            </span>
            <h2 className="text-lg font-black text-[#101413] tracking-tight">
              Initialize Super Admin Role
            </h2>
            <p className="text-xs text-[#6B726E] leading-relaxed">
              Welcome back, <strong>{firebaseUser.email}</strong>. Your identity is recognized as the
              constitutional platform owner. Click below to provision your authoritative Super Admin profile.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-[#E8F5EF] border border-[#A7E2C9] text-[#0E8F5A] text-xs p-3 rounded-xl flex items-start gap-2 text-left font-semibold">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <Button
            variant="primary"
            className="w-full bg-[#0E8F5A] hover:bg-[#0B7348]"
            onClick={handleClaimRoot}
            disabled={loading}
          >
            {loading ? 'Provisioning Role...' : 'Activate Super Administrator Profile'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <button
            onClick={signOut}
            className="text-xs text-[#6B726E] hover:text-[#101413] underline block mx-auto"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Not Authenticated (Sign In & Recovery Screen)
  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-4">
      <div className="bg-white border border-[#E4E7E5] rounded-2xl max-w-md w-full p-8 shadow-xl space-y-6 animate-in zoom-in-95">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#101413] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 text-[#0E8F5A]" />
          </div>
          <h1 className="text-xl font-black text-[#101413] tracking-tight">
            MarketNest Admin Center
          </h1>
          <p className="text-xs text-[#6B726E]">
            Executive operations, financial reconciliation, and platform governance.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E4E7E5] text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('signin');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'signin'
                ? 'border-[#0E8F5A] text-[#0E8F5A] font-bold'
                : 'border-transparent text-[#6B726E] hover:text-[#101413]'
            }`}
          >
            Administrator Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('recover');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'recover'
                ? 'border-[#0E8F5A] text-[#0E8F5A] font-bold'
                : 'border-transparent text-[#6B726E] hover:text-[#101413]'
            }`}
          >
            Access Recovery
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-[#E8F5EF] border border-[#A7E2C9] text-[#0E8F5A] text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {activeTab === 'signin' ? (
          <div className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B726E] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={PLATFORM_OWNER_EMAIL}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E4E7E5] rounded-xl focus:outline-none focus:border-[#0E8F5A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#6B726E] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E4E7E5] rounded-xl focus:outline-none focus:border-[#0E8F5A]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E4E7E5]"></div>
              <span className="flex-shrink mx-3 text-[11px] text-[#6B726E] uppercase font-bold">Or</span>
              <div className="flex-grow border-t border-[#E4E7E5]"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Sign In with Authorized Google Account
            </Button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-[#6B726E]">
                Platform Owner: <strong>{PLATFORM_OWNER_EMAIL}</strong>
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRecover} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-xl space-y-1">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Emergency Super Admin Recovery
              </p>
              <p>
                If access was lost or credentials changed, enter your emergency recovery key to re-provision the root Super Administrator account.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1">
                Recovery Key
              </label>
              <input
                type="password"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                placeholder="Enter emergency recovery key"
                className="w-full px-3 py-2 text-xs border border-[#E4E7E5] rounded-xl focus:outline-none focus:border-[#0E8F5A] font-mono"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-[#101413] hover:bg-[#1B211F]"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Recover Super Admin Access'}
              <RefreshCw className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        <div className="border-t border-[#E4E7E5] pt-4 text-center">
          <a
            href="/"
            className="text-xs text-[#6B726E] hover:text-[#101413] font-medium"
          >
            ← Back to MarketNest Storefront
          </a>
        </div>
      </div>
    </div>
  );
};
