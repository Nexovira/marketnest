/**
 * @file src/pages/seller/dashboard/SellerStorefrontBuilderTab.tsx
 * Professional no-code storefront builder for MarketNest merchants.
 * Supports live desktop/mobile preview, branding controls, announcement banners,
 * policy configurations, featured products spotlight, and draft/publish workflows.
 */

import React, { useState, useEffect } from 'react';
import { useSeller } from '../../../context/SellerContext';
import { useMarket } from '../../../context/MarketContext';
import { StoreCustomization, Product, SellerProfile } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { formatNaira } from '../../../components/ui/PriceDisplay';
import {
  Store,
  Palette,
  Image as ImageIcon,
  Megaphone,
  ShieldCheck,
  Phone,
  Share2,
  Sparkles,
  Eye,
  Smartphone,
  Monitor,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Info,
  Clock,
  MapPin,
  MessageCircle,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';

const APPROVED_BRAND_COLORS = [
  { id: '#0E8F5A', label: 'Heritage Emerald', bg: '#0E8F5A', text: '#FFFFFF' },
  { id: '#101413', label: 'Deep Ink', bg: '#101413', text: '#FFFFFF' },
  { id: '#1B365D', label: 'Royal Indigo', bg: '#1B365D', text: '#FFFFFF' },
  { id: '#8D3F2D', label: 'Warm Terracotta', bg: '#8D3F2D', text: '#FFFFFF' },
  { id: '#4A154B', label: 'Plum Velvet', bg: '#4A154B', text: '#FFFFFF' },
  { id: '#0F766E', label: 'Forest Teal', bg: '#0F766E', text: '#FFFFFF' },
  { id: '#7D5A1E', label: 'Bronze Ochre', bg: '#7D5A1E', text: '#FFFFFF' }
];

const PRESET_BANNERS = [
  {
    name: 'Lifestyle Atelier',
    url: '/src/assets/images/hero_marketplace_lifestyle_1791134143019.jpg'
  },
  {
    name: 'Handcrafted Nigeria',
    url: '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg'
  },
  {
    name: 'Everyday Tech & Audio',
    url: '/src/assets/images/editorial_everyday_tech_1791134164769.jpg'
  },
  {
    name: 'Glow Skincare & Wellness',
    url: '/src/assets/images/editorial_beauty_glow_1791134175992.jpg'
  }
];

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80'
];

type BuilderSubTab = 'branding' | 'announcement' | 'contact' | 'policies' | 'curation';

export const SellerStorefrontBuilderTab: React.FC = () => {
  const { sellerProfile, sellerProducts, updateStoreSettings } = useSeller();
  const { showToast, navigateTo } = useMarket();

  // Active editor subtab
  const [activeSubTab, setActiveSubTab] = useState<BuilderSubTab>('branding');

  // Preview Mode: 'desktop' or 'mobile'
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTab, setPreviewTab] = useState<'editor' | 'preview' | 'split'>('split');

  // Editable fields in builder
  const [storeName, setStoreName] = useState(sellerProfile?.storeName || 'Alara Atelier');
  const [tagline, setTagline] = useState(sellerProfile?.tagline || 'Artisanal Luxury & Contemporary Nigerian Craftsmanship');
  const [description, setDescription] = useState(sellerProfile?.description || '');
  const [city, setCity] = useState(sellerProfile?.city || 'Victoria Island');
  const [state, setState] = useState(sellerProfile?.state || 'Lagos');
  const [logoUrl, setLogoUrl] = useState(sellerProfile?.logoUrl || PRESET_LOGOS[0]);
  const [bannerUrl, setBannerUrl] = useState(sellerProfile?.bannerUrl || PRESET_BANNERS[0].url);
  const [shipsWithinHours, setShipsWithinHours] = useState(sellerProfile?.shipsWithinHours || 24);

  // Customization fields
  const custom = sellerProfile?.customization || {};
  const [brandColor, setBrandColor] = useState(custom.brandColor || '#0E8F5A');
  const [headerLayout, setHeaderLayout] = useState<'centered' | 'editorial' | 'banner-first'>(
    custom.headerLayout || 'editorial'
  );

  // Announcement bar
  const [announcementEnabled, setAnnouncementEnabled] = useState(custom.announcement?.enabled ?? true);
  const [announcementText, setAnnouncementText] = useState(
    custom.announcement?.text || 'Flash Offer: Free Lagos Express Delivery on orders over ₦50,000 | 100% Escrow Protected'
  );
  const [announcementBg, setAnnouncementBg] = useState(custom.announcement?.bgColor || '#0E8F5A');

  // Contact info
  const [phone, setPhone] = useState(custom.contact?.phone || sellerProfile?.phone || '+234 803 123 4567');
  const [email, setEmail] = useState(custom.contact?.email || sellerProfile?.email || 'contact@alara.ng');
  const [whatsapp, setWhatsapp] = useState(custom.contact?.whatsapp || '+2348031234567');
  const [address, setAddress] = useState(custom.contact?.address || 'Plot 14 Victoria Island, Lagos');
  const [hours, setHours] = useState(custom.contact?.hours || 'Mon - Sat: 9:00 AM - 7:00 PM WAT');

  // Social links
  const [instagram, setInstagram] = useState(custom.socialLinks?.instagram || '@alara.atelier');
  const [twitter, setTwitter] = useState(custom.socialLinks?.twitter || '@alara_ng');
  const [facebook, setFacebook] = useState(custom.socialLinks?.facebook || '');
  const [website, setWebsite] = useState(custom.socialLinks?.website || 'https://alara.ng');

  // Store policies
  const [returnPolicy, setReturnPolicy] = useState(
    custom.policies?.returns ||
      '7-day inspection return window for unwashed, tag-intact items under MarketNest Buyer Protection Escrow.'
  );
  const [shippingPolicy, setShippingPolicy] = useState(
    custom.policies?.shipping ||
      'Lagos same-day dispatch for orders confirmed before 1:00 PM. Nationwide delivery via GIG Logistics within 48-72 hours.'
  );
  const [warrantyPolicy, setWarrantyPolicy] = useState(
    custom.policies?.warranty ||
      '100% Genuine Nigerian Craftsmanship & Authenticity Guarantee with direct escrow resolution.'
  );

  // Spotlight featured products
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>(
    custom.featuredProductIds || (sellerProducts.slice(0, 2).map((p) => p.id))
  );

  // Saved / dirty states
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mark dirty when edits occur
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [
    storeName,
    tagline,
    description,
    city,
    state,
    logoUrl,
    bannerUrl,
    brandColor,
    headerLayout,
    announcementEnabled,
    announcementText,
    phone,
    email,
    whatsapp,
    address,
    hours,
    instagram,
    twitter,
    facebook,
    website,
    returnPolicy,
    shippingPolicy,
    warrantyPolicy,
    featuredProductIds,
    shipsWithinHours
  ]);

  // Construct current customization object
  const currentCustomization: StoreCustomization = {
    brandColor,
    headerLayout,
    announcement: {
      enabled: announcementEnabled,
      text: announcementText,
      bgColor: announcementBg,
      textColor: '#FFFFFF'
    },
    contact: {
      phone,
      email,
      whatsapp,
      address,
      hours
    },
    socialLinks: {
      instagram,
      twitter,
      facebook,
      website
    },
    policies: {
      returns: returnPolicy,
      shipping: shippingPolicy,
      warranty: warrantyPolicy
    },
    featuredProductIds,
    pinnedCategories: ['fashion', 'bags', 'shoes'],
    layoutTheme: 'editorial'
  };

  // Completeness score
  const calculateCompleteness = () => {
    let score = 0;
    if (storeName.trim().length > 2) score += 15;
    if (tagline.trim().length > 5) score += 10;
    if (logoUrl) score += 15;
    if (bannerUrl) score += 15;
    if (description.trim().length > 20) score += 10;
    if (whatsapp.trim().length > 7) score += 10;
    if (returnPolicy.trim().length > 10) score += 10;
    if (featuredProductIds.length > 0) score += 10;
    if (announcementEnabled && announcementText.trim().length > 5) score += 5;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  // Save Draft (does not mark store as live draft update)
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    try {
      await updateStoreSettings({
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        city: city.trim(),
        state: state.trim(),
        logoUrl,
        bannerUrl,
        phone: phone.trim(),
        email: email.trim(),
        shipsWithinHours,
        customization: {
          ...currentCustomization,
          isDraft: true
        }
      });
      setHasUnsavedChanges(false);
      showToast('Draft Saved', 'Your storefront draft changes have been preserved.', 'success');
    } catch {
      showToast('Error', 'Unable to save draft.', 'error');
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Publish to Live Storefront
  const handlePublish = async () => {
    if (!storeName.trim()) {
      showToast('Store Name Required', 'Please enter your merchant brand name.', 'warning');
      return;
    }

    setIsPublishing(true);
    try {
      await updateStoreSettings({
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        city: city.trim(),
        state: state.trim(),
        logoUrl,
        bannerUrl,
        phone: phone.trim(),
        email: email.trim(),
        shipsWithinHours,
        customization: {
          ...currentCustomization,
          isDraft: false
        }
      });
      setHasUnsavedChanges(false);
      showToast(
        'Storefront Published!',
        'Your custom storefront is now live to all MarketNest shoppers.',
        'success'
      );
    } catch {
      showToast('Publication Error', 'Could not publish changes.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Discard Changes
  const handleDiscard = () => {
    if (sellerProfile) {
      setStoreName(sellerProfile.storeName || '');
      setTagline(sellerProfile.tagline || '');
      setDescription(sellerProfile.description || '');
      setCity(sellerProfile.city || 'Victoria Island');
      setState(sellerProfile.state || 'Lagos');
      setLogoUrl(sellerProfile.logoUrl || PRESET_LOGOS[0]);
      setBannerUrl(sellerProfile.bannerUrl || PRESET_BANNERS[0].url);
      setShipsWithinHours(sellerProfile.shipsWithinHours || 24);

      const oldC = sellerProfile.customization || {};
      setBrandColor(oldC.brandColor || '#0E8F5A');
      setHeaderLayout(oldC.headerLayout || 'editorial');
      setAnnouncementEnabled(oldC.announcement?.enabled ?? true);
      setAnnouncementText(oldC.announcement?.text || '');
      setPhone(oldC.contact?.phone || sellerProfile.phone || '');
      setEmail(oldC.contact?.email || sellerProfile.email || '');
      setWhatsapp(oldC.contact?.whatsapp || '');
      setAddress(oldC.contact?.address || '');
      setHours(oldC.contact?.hours || '');
      setInstagram(oldC.socialLinks?.instagram || '');
      setTwitter(oldC.socialLinks?.twitter || '');
      setFacebook(oldC.socialLinks?.facebook || '');
      setWebsite(oldC.socialLinks?.website || '');
      setReturnPolicy(oldC.policies?.returns || '');
      setShippingPolicy(oldC.policies?.shipping || '');
      setWarrantyPolicy(oldC.policies?.warranty || '');
      setFeaturedProductIds(oldC.featuredProductIds || []);
      setHasUnsavedChanges(false);
      showToast('Changes Discarded', 'Reverted back to the current published version.', 'info');
    }
  };

  // Toggle featured product selection
  const handleToggleFeaturedProduct = (prodId: string) => {
    if (featuredProductIds.includes(prodId)) {
      setFeaturedProductIds(featuredProductIds.filter((id) => id !== prodId));
    } else {
      if (featuredProductIds.length >= 4) {
        showToast('Limit Reached', 'You can spotlight up to 4 featured products.', 'warning');
        return;
      }
      setFeaturedProductIds([...featuredProductIds, prodId]);
    }
  };

  // Get featured products objects
  const featuredProductsList = sellerProducts.filter((p) => featuredProductIds.includes(p.id));

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header & Publishing Control Bar */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
              Storefront Studio
            </span>
            {hasUnsavedChanges && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Unsaved Edits
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413] mt-1">
            Storefront Builder & Brand Customizer
          </h2>
          <p className="text-xs text-[#6B726E] mt-0.5">
            Design your public merchant storefront without code. Changes reflect live in the interactive preview below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasUnsavedChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              disabled={isPublishing || isDraftSaving}
            >
              Discard
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isDraftSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePublish}
            isLoading={isPublishing}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Publish Storefront
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('storefront')}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            View Live Store
          </Button>
        </div>
      </div>

      {/* Completeness Meter */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center font-bold text-sm shrink-0">
            {completeness}%
          </div>
          <div>
            <span className="font-bold text-[#101413]">Storefront Readiness Score</span>
            <p className="text-[#6B726E] text-[11px]">
              {completeness >= 90
                ? 'Excellent! Your storefront is fully optimized for buyer trust and repeat orders.'
                : 'Complete logo, policies, WhatsApp link, and hero banner to reach 100% buyer trust.'}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-[#F7F5F0] rounded-full h-2 overflow-hidden border border-[#E4E7E5]">
          <div
            className="bg-[#0E8F5A] h-full transition-all duration-500 rounded-full"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Workspace View Mode Switcher */}
      <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
        {/* Editor Subtabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'branding', label: 'Branding & Visuals', icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'announcement', label: 'Announcement Bar', icon: <Megaphone className="w-3.5 h-3.5" /> },
            { id: 'contact', label: 'Contact & Showroom', icon: <Phone className="w-3.5 h-3.5" /> },
            { id: 'policies', label: 'Escrow & Policies', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'curation', label: 'Spotlight Curation', icon: <Sparkles className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as BuilderSubTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-[#101413] text-white'
                  : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Layout Controls: Split vs Editor Only vs Preview Only */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="flex items-center bg-[#F7F5F0] p-0.5 rounded-lg border border-[#E4E7E5]">
            <button
              onClick={() => setPreviewTab('editor')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                previewTab === 'editor' ? 'bg-white shadow-xs text-[#101413]' : 'text-[#6B726E]'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setPreviewTab('split')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                previewTab === 'split' ? 'bg-white shadow-xs text-[#101413]' : 'text-[#6B726E]'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setPreviewTab('preview')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                previewTab === 'preview' ? 'bg-white shadow-xs text-[#101413]' : 'text-[#6B726E]'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Device toggle */}
          <div className="flex items-center bg-[#F7F5F0] p-0.5 rounded-lg border border-[#E4E7E5]">
            <button
              onClick={() => setPreviewDevice('desktop')}
              title="Desktop Preview"
              className={`p-1.5 rounded cursor-pointer ${
                previewDevice === 'desktop' ? 'bg-white shadow-xs text-[#101413]' : 'text-[#6B726E]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              title="Mobile Device Preview"
              className={`p-1.5 rounded cursor-pointer ${
                previewDevice === 'mobile' ? 'bg-white shadow-xs text-[#101413]' : 'text-[#6B726E]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Builder Grid: Editor (Left) & Interactive Live Simulator (Right) */}
      <div className={`grid gap-6 ${previewTab === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* ===================== LEFT: FORM EDITOR ===================== */}
        {(previewTab === 'editor' || previewTab === 'split') && (
          <div className={`${previewTab === 'split' ? 'lg:col-span-6' : 'max-w-3xl mx-auto w-full'} space-y-6`}>
            {/* SUBTAB 1: BRANDING & VISUALS */}
            {activeSubTab === 'branding' && (
              <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
                <div className="border-b border-[#E4E7E5] pb-3">
                  <h3 className="font-bold text-sm text-[#101413]">Branding & Visual Identity</h3>
                  <p className="text-xs text-[#6B726E]">
                    Set your store name, signature tagline, logo, cover image, and approved brand palette.
                  </p>
                </div>

                {/* Store Name & Tagline */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Store Brand Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Alara Atelier"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs font-semibold text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Tagline / Brand Moniker
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Artisanal Luxury & Contemporary Nigerian Craftsmanship"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      About Story & Brand Heritage
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell buyers where your goods are crafted, your materials, and your dedication to excellence..."
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md p-3 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Approved Brand Color Palette */}
                <div className="space-y-2 pt-2 border-t border-[#E4E7E5]">
                  <label className="font-semibold text-[#101413] text-xs block">
                    Curated Brand Color Palette
                  </label>
                  <p className="text-[11px] text-[#6B726E]">
                    Choose from approved Nigerian luxury design system accents to style your storefront buttons and banners.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {APPROVED_BRAND_COLORS.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setBrandColor(col.id)}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                          brandColor === col.id
                            ? 'border-[#101413] bg-[#F7F5F0] font-bold ring-2 ring-[#101413]'
                            : 'border-[#E4E7E5] hover:border-slate-400 bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: col.bg }}
                        />
                        <span className="text-[#101413] text-[11px]">{col.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header Layout Structure */}
                <div className="space-y-2 pt-2 border-t border-[#E4E7E5]">
                  <label className="font-semibold text-[#101413] text-xs block">
                    Storefront Header Style
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'editorial', label: 'Editorial Banner', desc: 'Cover banner top with avatar overlay' },
                      { id: 'centered', label: 'Centered Prestige', desc: 'Symmetrical logo center focus' },
                      { id: 'banner-first', label: 'Hero Spotlight', desc: 'Prominent wide cover image' }
                    ].map((layout) => (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => setHeaderLayout(layout.id as any)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          headerLayout === layout.id
                            ? 'border-[#0E8F5A] bg-[#E8F5EF] text-[#0E8F5A] font-bold'
                            : 'border-[#E4E7E5] hover:border-slate-300 bg-white text-[#6B726E]'
                        }`}
                      >
                        <span className="block text-xs font-bold text-[#101413]">{layout.label}</span>
                        <span className="text-[10px] text-[#6B726E] leading-tight block mt-0.5">{layout.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Store Logo Presets & Custom URL */}
                <div className="space-y-3 pt-2 border-t border-[#E4E7E5]">
                  <label className="font-semibold text-[#101413] text-xs block">
                    Store Logo (Avatar)
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-[#E4E7E5] shadow-xs"
                    />
                    <div className="flex-1 space-y-1">
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="Paste logo image URL..."
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-1.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#6B726E]">Quick Presets:</span>
                        {PRESET_LOGOS.map((pUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLogoUrl(pUrl)}
                            className="cursor-pointer"
                          >
                            <img
                              src={pUrl}
                              alt=""
                              className="w-5 h-5 rounded-md object-cover border border-[#E4E7E5] hover:scale-110 transition-transform"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover Banner Presets & Custom URL */}
                <div className="space-y-3 pt-2 border-t border-[#E4E7E5]">
                  <label className="font-semibold text-[#101413] text-xs block">
                    Hero Cover Banner
                  </label>
                  <div className="rounded-lg overflow-hidden border border-[#E4E7E5] relative aspect-21/9 bg-[#F7F5F0]">
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="Paste banner image URL..."
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-1.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {PRESET_BANNERS.map((banner, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerUrl(banner.url)}
                        className={`rounded-lg border overflow-hidden p-1 text-left cursor-pointer transition-all ${
                          bannerUrl === banner.url
                            ? 'border-[#0E8F5A] ring-1 ring-[#0E8F5A]'
                            : 'border-[#E4E7E5] hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={banner.url}
                          alt={banner.name}
                          className="w-full h-10 object-cover rounded"
                        />
                        <span className="text-[10px] font-bold text-[#101413] block truncate mt-1">
                          {banner.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: ANNOUNCEMENT BAR */}
            {activeSubTab === 'announcement' && (
              <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
                <div className="border-b border-[#E4E7E5] pb-3">
                  <h3 className="font-bold text-sm text-[#101413]">Store Announcement Ribbon</h3>
                  <p className="text-xs text-[#6B726E]">
                    Display prominent top promotions, seasonal drops, coupon codes, or delivery assurances.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E4E7E5]">
                  <div>
                    <span className="text-xs font-bold text-[#101413] block">Enable Top Announcement</span>
                    <span className="text-[11px] text-[#6B726E]">
                      Displays a header alert bar across your public store.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
                  />
                </div>

                {announcementEnabled && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-[#101413] block mb-1">
                        Announcement Copy
                      </label>
                      <textarea
                        rows={2}
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="e.g. Flash Offer: Free Lagos Express Delivery on orders over ₦50,000 | 100% Escrow Protected"
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md p-3 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#101413] block mb-1">
                        Banner Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        {APPROVED_BRAND_COLORS.map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => setAnnouncementBg(col.id)}
                            className={`w-6 h-6 rounded-full border border-black/10 cursor-pointer ${
                              announcementBg === col.id ? 'ring-2 ring-offset-2 ring-[#101413]' : ''
                            }`}
                            style={{ backgroundColor: col.bg }}
                            title={col.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Announcement Preview */}
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-[#6B726E] block mb-1.5">
                        Live Ribbon Preview:
                      </span>
                      <div
                        className="p-2.5 rounded-lg text-center text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: announcementBg }}
                      >
                        {announcementText || 'Your announcement message appears here'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 3: CONTACT & SHOWROOM */}
            {activeSubTab === 'contact' && (
              <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
                <div className="border-b border-[#E4E7E5] pb-3">
                  <h3 className="font-bold text-sm text-[#101413]">Contact, Location & Social Proof</h3>
                  <p className="text-xs text-[#6B726E]">
                    Nigerian buyers value verified contact points, physical workshop addresses, and direct WhatsApp links.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      WhatsApp Business Number
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+234 803 123 4567"
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                    </div>
                    <span className="text-[10px] text-[#6B726E] mt-0.5 block">
                      Enables "Chat with Merchant" button on your storefront.
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Customer Service Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 803 123 4567"
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="orders@yourstore.ng"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Business Hours
                    </label>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="Mon - Sat: 9:00 AM - 7:00 PM WAT"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#E4E7E5] text-xs">
                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Physical Showroom / Workshop Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Plot 14 Victoria Island, Lagos State"
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-[#101413] block mb-1">City / District</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Victoria Island"
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#101413] block mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Lagos"
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Social media handles */}
                <div className="space-y-3 pt-2 border-t border-[#E4E7E5] text-xs">
                  <h4 className="font-bold text-[#101413]">Verified Social Channels</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-[#6B726E] block mb-1">Instagram</label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@yourbrand"
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#6B726E] block mb-1">X / Twitter</label>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="@yourbrand_ng"
                        className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: POLICIES & ESCROW */}
            {activeSubTab === 'policies' && (
              <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
                <div className="border-b border-[#E4E7E5] pb-3">
                  <h3 className="font-bold text-sm text-[#101413]">Store Policies & Buyer Protection</h3>
                  <p className="text-xs text-[#6B726E]">
                    Clear policies eliminate buyer hesitation and prevent disputed order cancellations.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Return & Refund Window
                    </label>
                    <textarea
                      rows={2}
                      value={returnPolicy}
                      onChange={(e) => setReturnPolicy(e.target.value)}
                      placeholder="e.g. 7-day inspection return window for unwashed, tag-intact items under MarketNest Buyer Protection Escrow."
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md p-3 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Shipping & Dispatch Turnaround
                    </label>
                    <textarea
                      rows={2}
                      value={shippingPolicy}
                      onChange={(e) => setShippingPolicy(e.target.value)}
                      placeholder="e.g. Lagos dispatch within 24 hours. Nationwide delivery via GIG Logistics within 48-72 hours."
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md p-3 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#101413] block mb-1">
                      Authenticity & Craftsmanship Warranty
                    </label>
                    <textarea
                      rows={2}
                      value={warrantyPolicy}
                      onChange={(e) => setWarrantyPolicy(e.target.value)}
                      placeholder="e.g. 100% Genuine Nigerian Craftsmanship & Authenticity Guarantee with direct escrow resolution."
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md p-3 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#101413] block">Default Dispatch Speed</span>
                      <span className="text-[11px] text-[#6B726E]">
                        Expected hours between payment confirmation and courier handover.
                      </span>
                    </div>
                    <select
                      value={shipsWithinHours}
                      onChange={(e) => setShipsWithinHours(Number(e.target.value))}
                      className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-1.5 text-xs font-semibold text-[#101413]"
                    >
                      <option value={12}>12 Hours (Rapid Express)</option>
                      <option value={24}>24 Hours (Standard Lagos)</option>
                      <option value={48}>48 Hours (Handmade to Order)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 5: SPOTLIGHT CURATION */}
            {activeSubTab === 'curation' && (
              <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
                <div className="border-b border-[#E4E7E5] pb-3">
                  <h3 className="font-bold text-sm text-[#101413]">Spotlight Featured Products</h3>
                  <p className="text-xs text-[#6B726E]">
                    Pin up to 4 premier listings to the top hero section of your storefront to maximize sales.
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#101413] block">
                    Select from Your Catalog ({featuredProductIds.length}/4 selected):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                    {sellerProducts.map((product) => {
                      const isFeatured = featuredProductIds.includes(product.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleToggleFeaturedProduct(product.id)}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                            isFeatured
                              ? 'border-[#0E8F5A] bg-[#E8F5EF]'
                              : 'border-[#E4E7E5] hover:border-slate-300 bg-white'
                          }`}
                        >
                          <img
                            src={product.images?.[0] || PRESET_BANNERS[0].url}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border border-[#E4E7E5]"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#101413] truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs font-bold text-[#0E8F5A] tabular-nums mt-0.5">
                              {formatNaira(product.price)}
                            </p>
                            <span className="text-[10px] text-[#6B726E] capitalize">
                              {product.category}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold ${
                              isFeatured
                                ? 'bg-[#0E8F5A] border-[#0E8F5A] text-white'
                                : 'border-[#CBD5E1] bg-white text-transparent'
                            }`}
                          >
                            ✓
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== RIGHT: LIVE INTERACTIVE PREVIEW ===================== */}
        {(previewTab === 'preview' || previewTab === 'split') && (
          <div className={`${previewTab === 'split' ? 'lg:col-span-6' : 'max-w-4xl mx-auto w-full'} space-y-3`}>
            {/* Live Indicator Bar */}
            <div className="flex items-center justify-between text-xs text-[#6B726E] px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0E8F5A] animate-pulse" />
                <span className="font-bold text-[#101413]">Live Preview Simulator</span>
                <span className="text-[11px] text-[#6B726E]">
                  ({previewDevice === 'desktop' ? 'Desktop View' : 'Mobile View'})
                </span>
              </div>
              <span className="text-[11px] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#E4E7E5]">
                {previewDevice === 'desktop' ? 'Full Canvas' : '375px Device'}
              </span>
            </div>

            {/* PREVIEW CONTAINER */}
            <div
              className={`mx-auto bg-white border border-[#E4E7E5] shadow-lg rounded-2xl overflow-hidden transition-all duration-300 ${
                previewDevice === 'mobile' ? 'max-w-[375px]' : 'w-full'
              }`}
            >
              {/* TOP ANNOUNCEMENT RIBBON */}
              {announcementEnabled && announcementText && (
                <div
                  className="py-2 px-3 text-center text-[11px] font-bold text-white transition-colors"
                  style={{ backgroundColor: announcementBg }}
                >
                  {announcementText}
                </div>
              )}

              {/* STOREFRONT HERO BANNER */}
              <div className="relative aspect-21/9 bg-[#F7F5F0] overflow-hidden">
                <img
                  src={bannerUrl}
                  alt="Store Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* In-Banner Store Info */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl}
                      alt={storeName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md bg-white"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-extrabold text-white leading-tight">
                          {storeName}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-[#A7E2C9]" />
                      </div>
                      <p className="text-[11px] text-white/90 truncate max-w-xs">
                        {tagline}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">
                      Location
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {city}, {state}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION QUICK BAR & WHATSAPP BUTTON */}
              <div className="px-4 py-3 bg-[#F7F5F0] border-b border-[#E4E7E5] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#6B726E] text-[11px]">
                  <span className="font-bold text-[#101413]">★ 4.9 (38)</span>
                  <span>·</span>
                  <span>Dispatches in {shipsWithinHours}h</span>
                  <span>·</span>
                  <span className="text-[#0E8F5A] font-semibold">Verified Escrow</span>
                </div>

                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold text-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: brandColor }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* SPOTLIGHT FEATURED PRODUCTS SECTION */}
              {featuredProductsList.length > 0 && (
                <div className="p-4 border-b border-[#E4E7E5] bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0E8F5A]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#101413]">
                        Curated Spotlight
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-[#0E8F5A]">Handpicked</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {featuredProductsList.slice(0, 2).map((prod) => (
                      <div
                        key={prod.id}
                        className="border border-[#E4E7E5] rounded-xl p-2.5 bg-[#FBFBFA] flex flex-col justify-between"
                      >
                        <img
                          src={prod.images?.[0] || PRESET_BANNERS[0].url}
                          alt=""
                          className="w-full h-24 object-cover rounded-lg mb-2"
                        />
                        <div>
                          <h5 className="text-[11px] font-bold text-[#101413] truncate">
                            {prod.title}
                          </h5>
                          <span className="text-xs font-extrabold text-[#0E8F5A] tabular-nums mt-0.5 block">
                            {formatNaira(prod.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STORE STORY & POLICIES ACCORDION PREVIEW */}
              <div className="p-4 bg-white space-y-3 text-xs">
                {description && (
                  <div>
                    <h4 className="font-bold text-[#101413] text-xs mb-1">About the Maker</h4>
                    <p className="text-[11px] text-[#6B726E] leading-relaxed">
                      {description}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-[#E4E7E5] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#F7F5F0] border border-[#E4E7E5]">
                    <span className="font-bold text-[#101413] block mb-0.5">Return Policy</span>
                    <p className="text-[#6B726E] text-[10px] line-clamp-2">{returnPolicy}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F7F5F0] border border-[#E4E7E5]">
                    <span className="font-bold text-[#101413] block mb-0.5">Shipping Standard</span>
                    <p className="text-[#6B726E] text-[10px] line-clamp-2">{shippingPolicy}</p>
                  </div>
                </div>

                {/* Showroom Contact Card */}
                <div className="p-2.5 rounded-lg bg-[#E8F5EF] border border-[#A7E2C9] flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-[#0E8F5A] block">Showroom & Inquiries</span>
                    <span className="text-[#101413] text-[10px]">{address}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0E8F5A] tabular-nums">
                    {phone}
                  </span>
                </div>
              </div>

              {/* SIMULATED LIVE FOOTER */}
              <div className="bg-[#101413] text-white p-3 text-center text-[10px] text-white/70">
                MarketNest Verified Merchant Store · Secured by Escrow Guarantee
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
