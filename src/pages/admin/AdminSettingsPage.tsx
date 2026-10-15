/**
 * @file src/pages/admin/AdminSettingsPage.tsx
 * Marketplace platform governance and policy configuration portal for MarketNest Administrators.
 * Controls commission splits, approval requirements, dispute windows, and banking rail modes.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { PlatformSettings } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Settings,
  ShieldCheck,
  Percent,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Lock,
  DollarSign
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminService.getSettings();
        setSettings(data);
      } catch (err) {
        console.warn('Error loading platform settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    requestConfirm({
      title: 'Save Platform Governance Settings',
      description: 'Updating these settings will alter marketplace commission policies, buyer return windows, and operational requirements platform-wide.',
      confirmText: 'Save Platform Policies',
      danger: false,
      requireReason: true,
      onConfirm: async (reason) => {
        setSaving(true);
        try {
          await adminService.updateSettings(
            { ...settings },
            { id: adminProfile.id, name: adminProfile.name }
          );
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        } finally {
          setSaving(false);
        }
      }
    });
  };

  if (loading || !settings) {
    return (
      <div className="py-24 text-center text-xs text-[#6B726E]">
        <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading platform governance policies...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in pb-16">
      <div>
        <h2 className="text-base font-black text-[#101413] tracking-tight">
          Platform Governance & Global Policies
        </h2>
        <p className="text-xs text-[#6B726E]">
          Configure core operational parameters, commission structures, and verification requirements.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#E8F5EF] border border-[#A7E2C9] rounded-lg text-xs font-semibold text-[#0E8F5A] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Platform policies updated and audit record logged successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Marketplace Identity & Maintenance */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-4 shadow-2xs">
          <div className="border-b border-[#E4E7E5] pb-2.5">
            <h3 className="font-bold text-[#101413] text-sm">Marketplace Identity</h3>
            <p className="text-[#6B726E]">Primary branding and operating territory.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#101413]">Marketplace Name</label>
              <input
                type="text"
                value={settings.marketplaceName}
                onChange={(e) => setSettings({ ...settings, marketplaceName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden focus:border-[#101413]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#101413]">Operating Currency</label>
              <input
                type="text"
                disabled
                value="NGN (Nigerian Naira ₦)"
                className="w-full p-2.5 rounded-lg border border-[#E4E7E5] bg-[#FBFBFA] text-[#6B726E]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-bold text-[#101413] block">Marketplace Maintenance Mode</span>
              <span className="text-[11px] text-[#6B726E]">
                Restricts non-admin users from creating new checkouts during scheduled system updates.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4 text-[#0E8F5A] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 2. Merchant & Escrow Policies */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-4 shadow-2xs">
          <div className="border-b border-[#E4E7E5] pb-2.5">
            <h3 className="font-bold text-[#101413] text-sm">Merchant Standards & Escrow Take-Rates</h3>
            <p className="text-[#6B726E]">Onboarding criteria and default merchant commission rates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#101413]">Default Platform Take Rate (Commission)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.5"
                  value={settings.defaultSellerCommissionRate}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultSellerCommissionRate: parseFloat(e.target.value) || 0.1 })
                  }
                  className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden focus:border-[#101413] font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[#6B726E]">
                  {(settings.defaultSellerCommissionRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#FBFBFA] rounded-lg border border-[#E4E7E5]">
              <div>
                <span className="font-bold text-[#101413] block">Seller Verification Requirement</span>
                <span className="text-[11px] text-[#6B726E]">
                  Require admin approval before new storefronts can publish products.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.sellerApprovalRequired}
                onChange={(e) => setSettings({ ...settings, sellerApprovalRequired: e.target.checked })}
                className="w-4 h-4 text-[#0E8F5A] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Affiliate Partner Program Policies */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-4 shadow-2xs">
          <div className="border-b border-[#E4E7E5] pb-2.5">
            <h3 className="font-bold text-[#101413] text-sm">Affiliate Partner Rules</h3>
            <p className="text-[#6B726E]">Referral attribution windows and payout threshold barriers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#101413]">Baseline Commission Rate</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultAffiliateCommissionRate}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultAffiliateCommissionRate: parseFloat(e.target.value) || 0.05 })
                  }
                  className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-[#6B726E]">
                  {(settings.defaultAffiliateCommissionRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#101413]">Attribution Window (Days)</label>
              <input
                type="number"
                value={settings.affiliateAttributionWindowDays}
                onChange={(e) =>
                  setSettings({ ...settings, affiliateAttributionWindowDays: parseInt(e.target.value, 10) || 30 })
                }
                className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#101413]">Minimum Payout Barrier (₦)</label>
              <input
                type="number"
                value={settings.minimumAffiliatePayoutThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, minimumAffiliatePayoutThreshold: parseInt(e.target.value, 10) || 10000 })
                }
                className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Buyer Protection & Order Cancellation Windows */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-4 shadow-2xs">
          <div className="border-b border-[#E4E7E5] pb-2.5">
            <h3 className="font-bold text-[#101413] text-sm">Dispute & Return Guarantees</h3>
            <p className="text-[#6B726E]">Timing constraints on customer escrow return claims.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#101413]">Cancellation Grace Period (Hours)</label>
              <input
                type="number"
                value={settings.orderCancellationWindowHours}
                onChange={(e) =>
                  setSettings({ ...settings, orderCancellationWindowHours: parseInt(e.target.value, 10) || 24 })
                }
                className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#101413]">Inspection & Return Window (Days)</label>
              <input
                type="number"
                value={settings.returnWindowDays}
                onChange={(e) =>
                  setSettings({ ...settings, returnWindowDays: parseInt(e.target.value, 10) || 7 })
                }
                className="w-full p-2.5 rounded-lg border border-[#E4E7E5] focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* 5. Payments Security Notice */}
        <div className="p-4 bg-[#FBFBFA] rounded-xl border border-[#E4E7E5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#0E8F5A]" />
            <div>
              <span className="font-bold text-[#101413] block">Paystack Secret Key Security</span>
              <span className="text-[#6B726E]">
                Payment rail credentials reside in secure server environment secrets and cannot be exposed to UI.
              </span>
            </div>
          </div>
          <span className="bg-[#E8F5EF] text-[#0E8F5A] px-2 py-0.5 rounded text-[10px] font-bold">
            Air-Gapped
          </span>
        </div>

        {/* Action Button */}
        {hasPermission('settings.manage') && (
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="lg" type="submit" loading={saving}>
              Save Governance Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
