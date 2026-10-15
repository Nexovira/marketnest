/**
 * @file src/pages/account/AccountSettings.tsx
 * Customer account settings, security actions, and comprehensive NDPA-compliant
 * communication consent preferences center.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { Button } from '../../components/ui/Button';
import { marketingService } from '../../services/marketingService';
import { CustomerCommunicationPreferences } from '../../types/marketing';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Bell,
  CheckCircle2,
  Mail,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { firebaseUser, resetPassword, signOut } = useAuth();
  const { showToast, navigateTo } = useMarket();

  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Communication Preferences State
  const userId = firebaseUser?.uid || 'guest_user';
  const [preferences, setPreferences] = useState<CustomerCommunicationPreferences | null>(null);
  const [isSavingPref, setIsSavingPref] = useState(false);

  useEffect(() => {
    marketingService
      .getCustomerPreferences(userId)
      .then((data) => setPreferences(data))
      .catch((err) => console.warn('Could not fetch preferences:', err));
  }, [userId]);

  const handleUpdatePreferences = async (updates: Partial<CustomerCommunicationPreferences>) => {
    if (!preferences) return;
    const newPref: CustomerCommunicationPreferences = {
      ...preferences,
      ...updates,
      channels: {
        ...preferences.channels,
        ...(updates.channels || {})
      },
      categories: {
        ...preferences.categories,
        ...(updates.categories || {})
      }
    };

    setPreferences(newPref);
    setIsSavingPref(true);
    try {
      await marketingService.updateCustomerPreferences(userId, newPref);
      showToast('Preferences Saved', 'Your communication choices have been securely logged.', 'success');
    } catch {
      showToast('Error', 'Unable to save preferences.', 'error');
    } finally {
      setIsSavingPref(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!firebaseUser?.email) return;
    setIsResetting(true);
    try {
      await resetPassword(firebaseUser.email);
      setResetSent(true);
      showToast('Password Reset Link Sent', `Check ${firebaseUser.email} for reset instructions.`, 'success');
    } catch {
      showToast('Notice', 'Could not send reset email. Please try again shortly.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Signed Out', 'You have been signed out of MarketNest.', 'info');
      navigateTo('home');
    } catch {
      showToast('Error', 'Failed to sign out. Please try again.', 'error');
    }
  };

  return (
    <div className="max-w-3xl space-y-8 text-[#101413]">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Account Settings & Privacy</h2>
        <p className="text-xs text-[#6B726E] mt-1">
          Manage credentials, security preferences, and NDPA marketing communication controls.
        </p>
      </div>

      {/* 1. Security & Password */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0E8F5A]" />
          <h3 className="text-sm font-bold text-[#101413]">Security & Password</h3>
        </div>

        <p className="text-xs text-[#6B726E] leading-relaxed">
          To update your password, we dispatch an encrypted security link to your registered email address ({firebaseUser?.email || 'your account email'}).
        </p>

        {resetSent ? (
          <div className="p-3 bg-[#E8F5EF] rounded-md text-xs text-[#0E8F5A] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Reset link sent to your inbox. Please check within 15 minutes.</span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            isLoading={isResetting}
            onClick={handlePasswordReset}
          >
            Send Password Reset Link
          </Button>
        )}
      </div>

      {/* 2. Communication & Marketing Preferences Center */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0E8F5A]" />
            <div>
              <h3 className="text-sm font-bold text-[#101413]">Communication & Consent Center</h3>
              <p className="text-xs text-[#6B726E]">
                Under NDPA compliance, you have full authority over which marketing channels can contact you.
              </p>
            </div>
          </div>
          {isSavingPref && (
            <span className="text-[11px] font-semibold text-[#0E8F5A] animate-pulse">
              Updating...
            </span>
          )}
        </div>

        {preferences && (
          <div className="space-y-6 text-xs">
            {/* Master Promotional Opt-In Toggle */}
            <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E4E7E5] flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-[#101413] block">
                  Promotional Marketing Communications
                </span>
                <span className="text-[11px] text-[#6B726E] block mt-0.5">
                  Receive personalized seasonal drops, vouchers, artisan spotlights, and cart reminders.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketingOptIn}
                onChange={(e) =>
                  handleUpdatePreferences({ marketingOptIn: e.target.checked })
                }
                className="w-5 h-5 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
              />
            </div>

            {/* Granular Channel Toggles */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#101413] text-xs uppercase tracking-wider text-[#6B726E]">
                Permitted Channels
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email */}
                <label className="p-3 rounded-lg border border-[#E4E7E5] hover:border-slate-300 flex items-start justify-between gap-3 cursor-pointer bg-white">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#101413] block">Email Updates</span>
                      <span className="text-[11px] text-[#6B726E]">
                        Editorial newsletters, voucher codes, and drops.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!preferences.marketingOptIn}
                    checked={preferences.channels.email && preferences.marketingOptIn}
                    onChange={(e) =>
                      handleUpdatePreferences({
                        channels: { ...preferences.channels, email: e.target.checked }
                      })
                    }
                    className="mt-1 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
                  />
                </label>

                {/* SMS */}
                <label className="p-3 rounded-lg border border-[#E4E7E5] hover:border-slate-300 flex items-start justify-between gap-3 cursor-pointer bg-white">
                  <div className="flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#101413] block">SMS Alerts (Termii)</span>
                      <span className="text-[11px] text-[#6B726E]">
                        Flash price reductions and restock alerts.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!preferences.marketingOptIn}
                    checked={preferences.channels.sms && preferences.marketingOptIn}
                    onChange={(e) =>
                      handleUpdatePreferences({
                        channels: { ...preferences.channels, sms: e.target.checked }
                      })
                    }
                    className="mt-1 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
                  />
                </label>

                {/* WhatsApp */}
                <label className="p-3 rounded-lg border border-[#E4E7E5] hover:border-slate-300 flex items-start justify-between gap-3 cursor-pointer bg-white">
                  <div className="flex items-start gap-2.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#101413] block">WhatsApp Concierge</span>
                      <span className="text-[11px] text-[#6B726E]">
                        Direct artisan announcements & order care.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!preferences.marketingOptIn}
                    checked={preferences.channels.whatsapp && preferences.marketingOptIn}
                    onChange={(e) =>
                      handleUpdatePreferences({
                        channels: { ...preferences.channels, whatsapp: e.target.checked }
                      })
                    }
                    className="mt-1 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
                  />
                </label>

                {/* Push */}
                <label className="p-3 rounded-lg border border-[#E4E7E5] hover:border-slate-300 flex items-start justify-between gap-3 cursor-pointer bg-white">
                  <div className="flex items-start gap-2.5">
                    <Bell className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#101413] block">Web & Mobile Push</span>
                      <span className="text-[11px] text-[#6B726E]">
                        Real-time drop alerts in your browser.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!preferences.marketingOptIn}
                    checked={preferences.channels.push && preferences.marketingOptIn}
                    onChange={(e) =>
                      handleUpdatePreferences({
                        channels: { ...preferences.channels, push: e.target.checked }
                      })
                    }
                    className="mt-1 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Category Preferences */}
            <div className="space-y-3 pt-3 border-t border-[#E4E7E5]">
              <h4 className="font-bold text-[#101413] text-xs uppercase tracking-wider text-[#6B726E]">
                Campaign Topic Preferences
              </h4>

              <div className="space-y-2">
                {[
                  { id: 'promotionsAndDiscounts', label: 'Discounts, Promos & Vouchers', desc: 'Campaign discount codes and seasonal sale invites.' },
                  { id: 'curatedDrops', label: 'Made in Nigeria Handcrafted Drops', desc: 'Editorial showcases of new verified artisan pieces.' },
                  { id: 'abandonedCartReminders', label: 'Shopping Bag Recovery Reminders', desc: 'Gentle nudges when items left in bag are low in stock.' },
                  { id: 'reviewRequests', label: 'Post-Delivery Review Inquiries', desc: 'Requests for honest feedback after order arrival.' },
                  { id: 'backInStock', label: 'Back-In-Stock Alerts', desc: 'Instant notifications when saved wishlist items replenish.' }
                ].map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg hover:bg-[#F7F5F0] cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-[#101413] block">{cat.label}</span>
                      <span className="text-[11px] text-[#6B726E]">{cat.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!preferences.marketingOptIn}
                      checked={
                        (preferences.categories as any)[cat.id] && preferences.marketingOptIn
                      }
                      onChange={(e) =>
                        handleUpdatePreferences({
                          categories: {
                            ...preferences.categories,
                            [cat.id]: e.target.checked
                          }
                        })
                      }
                      className="mt-1 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Transactional Notifications (Non-opt-outable) */}
            <div className="p-4 bg-[#E8F5EF]/50 rounded-xl border border-[#A7E2C9] space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0E8F5A]" />
                <span className="font-bold text-xs text-[#0E8F5A]">
                  Mandatory Transactional Notices (Always Active)
                </span>
              </div>
              <p className="text-[11px] text-[#101413] leading-relaxed">
                To guarantee your financial security, <strong>order confirmations</strong>, <strong>Paystack payment receipts</strong>, <strong>dispatch tracking</strong>, and <strong>escrow release updates</strong> cannot be opted out of.
              </p>
            </div>

            {/* Consent Timestamp & Audit Log */}
            <div className="text-[11px] text-[#6B726E] pt-2 border-t border-[#E4E7E5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                Consent Record: <strong className="text-[#101413]">{preferences.consentRecord.consentSource}</strong>
              </span>
              <span>
                Last Updated: <strong className="text-[#101413]">{new Date(preferences.consentRecord.lastChangedAt).toLocaleString()}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Escrow Guarantee Statement */}
      <div className="p-4 rounded-xl bg-[#F7F5F0] border border-[#E4E7E5] flex items-center gap-3 text-xs text-[#101413]">
        <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0" />
        <span>Your account is backed by MarketNest Escrow Protection across all 36 Nigerian states.</span>
      </div>

      {/* 4. Sign Out Card */}
      <div className="bg-white border border-rose-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-[#101413]">Sign Out of MarketNest</h4>
          <p className="text-xs text-[#6B726E]">
            End your current session on this device. Your saved items and orders remain safely stored in the cloud.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 shrink-0"
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};
