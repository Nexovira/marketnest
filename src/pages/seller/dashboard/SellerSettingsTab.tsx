/**
 * @file src/pages/seller/dashboard/SellerSettingsTab.tsx
 * Merchant store configuration, branding, delivery turnaround, and payout bank settings.
 */

import React, { useState } from 'react';
import { useSeller } from '../../../context/SellerContext';
import { useMarket } from '../../../context/MarketContext';
import { Button } from '../../../components/ui/Button';
import {
  Store,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  Truck,
  CreditCard,
  Save,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const SAMPLE_LOGOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
];

const SAMPLE_BANNERS = [
  '/src/assets/images/hero_marketplace_lifestyle_1791134143019.jpg',
  '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg',
  '/src/assets/images/editorial_everyday_tech_1791134164769.jpg'
];

export const SellerSettingsTab: React.FC = () => {
  const { sellerProfile, updateStoreSettings } = useSeller();
  const { showToast, navigateTo } = useMarket();

  const [storeName, setStoreName] = useState(sellerProfile?.storeName || '');
  const [tagline, setTagline] = useState(sellerProfile?.tagline || '');
  const [description, setDescription] = useState(sellerProfile?.description || '');
  const [city, setCity] = useState(sellerProfile?.city || 'Victoria Island');
  const [state, setState] = useState(sellerProfile?.state || 'Lagos');
  const [phone, setPhone] = useState(sellerProfile?.phone || '+234 ');
  const [email, setEmail] = useState(sellerProfile?.email || '');
  const [logoUrl, setLogoUrl] = useState(sellerProfile?.logoUrl || SAMPLE_LOGOS[0]);
  const [bannerUrl, setBannerUrl] = useState(sellerProfile?.bannerUrl || SAMPLE_BANNERS[0]);
  const [shipsWithinHours, setShipsWithinHours] = useState(sellerProfile?.shipsWithinHours || 24);

  // Payout bank details (Mock for Paystack phase)
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState(sellerProfile?.storeName || 'Official Merchant Account');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      showToast('Store Name Required', 'Please enter your store brand name.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await updateStoreSettings({
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        city: city.trim(),
        state: state.trim(),
        phone: phone.trim(),
        email: email.trim(),
        logoUrl,
        bannerUrl,
        shipsWithinHours
      });
      showToast('Settings Saved', 'Your store profile and logistics have been updated.', 'success');
    } catch {
      showToast('Error', 'Unable to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Store Settings</h2>
          <p className="text-xs text-[#6B726E]">
            Configure your merchant branding, dispatch turnaround, and bank payout information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigateTo('storefront')}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Preview Storefront
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Section 1: Store Identity */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E4E7E5] pb-3">
          <Store className="w-4 h-4 text-[#0E8F5A]" />
          <h3 className="text-sm font-bold text-[#101413]">Store Identity & Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#101413] block mb-1.5">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-[#101413] block mb-1.5">Public URL Slug</label>
            <input
              type="text"
              disabled
              value={sellerProfile?.storeSlug || 'my-store'}
              className="w-full bg-gray-100 border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#6B726E] font-mono cursor-not-allowed"
            />
            <span className="text-[10px] text-[#6B726E] mt-1 block">
              Permanent verified merchant handle on MarketNest
            </span>
          </div>
        </div>

        <div className="text-xs">
          <label className="font-semibold text-[#101413] block mb-1.5">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Contemporary Nigerian luxury fashion and leathercraft"
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>

        <div className="text-xs">
          <label className="font-semibold text-[#101413] block mb-1.5">Store Bio / Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#101413] block mb-1.5">City / Neighborhood</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-[#101413] block mb-1.5">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            >
              <option value="Lagos">Lagos</option>
              <option value="Abuja FCT">Abuja FCT</option>
              <option value="Rivers">Rivers (Port Harcourt)</option>
              <option value="Oyo">Oyo (Ibadan)</option>
              <option value="Enugu">Enugu</option>
              <option value="Delta">Delta</option>
              <option value="Kano">Kano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Store Branding (Logo & Banner) */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E4E7E5] pb-3">
          <ImageIcon className="w-4 h-4 text-[#0E8F5A]" />
          <h3 className="text-sm font-bold text-[#101413]">Store Visual Branding</h3>
        </div>

        {/* Logo Preview & Input */}
        <div className="space-y-3 text-xs">
          <label className="font-semibold text-[#101413] block">Store Logo</label>
          <div className="flex items-center gap-4">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-16 h-16 rounded-full object-cover border border-[#E4E7E5]"
            />
            <div className="flex-1">
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-[#6B726E]">Pick sample logo:</span>
                {SAMPLE_LOGOS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLogoUrl(url)}
                    className="w-6 h-6 rounded-full overflow-hidden border border-[#E4E7E5] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Banner Preview & Input */}
        <div className="space-y-3 text-xs pt-2">
          <label className="font-semibold text-[#101413] block">Storefront Hero Banner</label>
          <div className="h-28 w-full rounded-xl overflow-hidden border border-[#E4E7E5] bg-gray-100">
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          </div>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>
      </div>

      {/* Section 3: Delivery Speed & Dispatch Turnaround */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E4E7E5] pb-3">
          <Truck className="w-4 h-4 text-[#0E8F5A]" />
          <h3 className="text-sm font-bold text-[#101413]">Logistics & Dispatch Commitments</h3>
        </div>

        <div className="text-xs">
          <label className="font-semibold text-[#101413] block mb-1.5">
            Handling & Dispatch Turnaround Time
          </label>
          <select
            value={shipsWithinHours}
            onChange={(e) => setShipsWithinHours(Number(e.target.value))}
            className="w-full sm:max-w-xs bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          >
            <option value={12}>Same-day dispatch (within 12 hours)</option>
            <option value={24}>24 hours standard dispatch (Recommended)</option>
            <option value={48}>48 hours express dispatch</option>
          </select>
          <p className="text-[11px] text-[#6B726E] mt-1.5">
            Stores that ship within 24 hours receive the verified fast-dispatch badge on product cards.
          </p>
        </div>
      </div>

      {/* Section 4: Payout Bank Account */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0E8F5A]" />
            <h3 className="text-sm font-bold text-[#101413]">Escrow Settlement Bank Account</h3>
          </div>
          <span className="text-[10px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> NIBSS Verified
          </span>
        </div>

        <p className="text-xs text-[#6B726E]">
          Payouts from escrow are transferred to this Nigerian bank account automatically upon customer delivery confirmation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#101413] block mb-1.5">Bank Name</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            >
              <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
              <option value="Access Bank">Access Bank</option>
              <option value="Zenith Bank">Zenith Bank</option>
              <option value="First Bank of Nigeria">First Bank of Nigeria</option>
              <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
              <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
              <option value="Kuda Bank">Kuda Bank</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[#101413] block mb-1.5">Account Number (NUBAN)</label>
            <input
              type="text"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] font-mono focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-[#101413] block mb-1.5">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E4E7E5]">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isSaving ? 'Saving Changes...' : 'Save Store Settings'}
        </Button>
      </div>
    </form>
  );
};
