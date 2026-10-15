/**
 * @file src/pages/seller/SellerOnboardingPage.tsx
 * Multi-step onboarding wizard for Nigerian merchants creating a store on MarketNest.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { useSeller } from '../../context/SellerContext';
import {
  createSellerProfile,
  generateUniqueStoreSlug,
  submitSellerApplication
} from '../../lib/sellerFirestore';
import { SellerApplication, SellerProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Store,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  User as UserIcon,
  Palette,
  FileText
} from 'lucide-react';

const CATEGORIES = [
  'Fashion & Apparel',
  'Bags & Leathercraft',
  'Electronics & Audio',
  'Phones & Gadgets',
  'Beauty & Skincare',
  'Home & Living',
  'Shoes & Footwear',
  'Food & Gourmet Provisions'
];

export const SellerOnboardingPage: React.FC = () => {
  const { firebaseUser, profile, updateCustomerProfile } = useAuth();
  const { navigateTo, showToast } = useMarket();
  const { refreshSellerProfile } = useSeller();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Business Information
  const [storeName, setStoreName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessCategory, setBusinessCategory] = useState(CATEGORIES[0]);
  const [city, setCity] = useState('Victoria Island');
  const [state, setState] = useState('Lagos');

  // Step 2: Seller Information
  const [fullName, setFullName] = useState(profile?.name || firebaseUser?.displayName || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '+234 ');
  const [email, setEmail] = useState(profile?.email || firebaseUser?.email || '');

  // Step 3: Store Appearance
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );
  const [bannerUrl, setBannerUrl] = useState(
    '/src/assets/images/hero_marketplace_lifestyle_1791134143019.jpg'
  );

  // Step 4: Seller Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Next / Back handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!storeName.trim() || !businessDescription.trim()) {
        showToast('Required Fields', 'Please complete your store name and description.', 'warning');
        return;
      }
    } else if (currentStep === 2) {
      if (!fullName.trim() || !phone.trim() || !email.trim()) {
        showToast('Required Fields', 'Please provide your full contact details.', 'warning');
        return;
      }
    } else if (currentStep === 3) {
      if (!tagline.trim()) {
        setTagline(`${storeName} — Curated on MarketNest`);
      }
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitOnboarding = async () => {
    if (!firebaseUser) {
      navigateTo('login');
      return;
    }

    if (!agreedToTerms) {
      showToast('Agreement Required', 'Please accept the MarketNest Seller Terms to continue.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Generate unique URL slug
      const storeSlug = await generateUniqueStoreSlug(storeName.trim());

      // 2. Create Seller Profile
      const newSellerProfile: SellerProfile = {
        id: `store_${firebaseUser.uid}`,
        userId: firebaseUser.uid,
        storeName: storeName.trim(),
        storeSlug,
        tagline: tagline.trim() || `${storeName.trim()} — Official MarketNest Store`,
        description: businessDescription.trim(),
        category: businessCategory,
        logoUrl,
        bannerUrl,
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        state: state.trim(),
        country: 'Nigeria',
        status: 'active', // Activated for development
        verified: true, // Activated verified badge for active stores
        rating: 5.0,
        reviewCount: 0,
        productCount: 0,
        shipsWithinHours: 24,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await createSellerProfile(newSellerProfile);

      // 3. Create Seller Application record for audit
      const appRecord: SellerApplication = {
        id: `app_${Date.now()}_${firebaseUser.uid.slice(0, 6)}`,
        userId: firebaseUser.uid,
        storeName: storeName.trim(),
        businessCategory,
        description: businessDescription.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        state: state.trim(),
        status: 'approved',
        submittedAt: new Date().toISOString()
      };

      await submitSellerApplication(appRecord);

      // 4. Update user role in Firestore
      await updateCustomerProfile({
        role: 'seller',
        storeId: newSellerProfile.id
      });

      await refreshSellerProfile();

      showToast('Store Created!', `Welcome to MarketNest Seller Platform. Your store URL is /store/${storeSlug}`, 'success');
      navigateTo('seller-dashboard');
    } catch (err) {
      console.error('Error completing seller onboarding:', err);
      showToast('Onboarding Error', 'Unable to create store. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1, title: 'Business Details', icon: <Building className="w-4 h-4" /> },
    { num: 2, title: 'Seller Contact', icon: <UserIcon className="w-4 h-4" /> },
    { num: 3, title: 'Store Appearance', icon: <Palette className="w-4 h-4" /> },
    { num: 4, title: 'Seller Agreement', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-3 py-1 rounded-full">
          <Store className="w-3.5 h-3.5" />
          <span>Seller Onboarding</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#101413] tracking-tight">
          Create your MarketNest Store
        </h1>
        <p className="text-xs sm:text-sm text-[#6B726E]">
          Step {currentStep} of 4 — Set up your verified storefront and start managing products.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {stepsMeta.map((s) => {
          const isComplete = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          return (
            <div key={s.num} className="text-center space-y-1.5">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  isComplete || isCurrent ? 'bg-[#0E8F5A]' : 'bg-[#E4E7E5]'
                }`}
              />
              <p
                className={`text-[11px] font-semibold truncate ${
                  isCurrent ? 'text-[#101413]' : 'text-[#6B726E]'
                }`}
              >
                {s.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white border border-[#E4E7E5] rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        {/* STEP 1: Business Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#101413]">Business Information</h2>
              <p className="text-xs text-[#6B726E] mt-1">
                Tell us about your brand or store. This information appears on your public profile.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Business / Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Lagos Leather Atelier"
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
              <p className="text-[11px] text-[#6B726E] mt-1">
                Public storefront URL will be: marketnest.ng/store/{storeName ? storeName.toLowerCase().replace(/\s+/g, '-') : 'your-store'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Primary Business Category *
              </label>
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Business Description *
              </label>
              <textarea
                rows={4}
                required
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="What kinds of products do you craft or sell? Who are your customers?"
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md p-3.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                  City / Neighborhood *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Victoria Island, Ikeja, Maitama"
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                  State in Nigeria *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Lagos State"
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Seller Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#101413]">Seller Contact Information</h2>
              <p className="text-xs text-[#6B726E] mt-1">
                Used for dispatch rider notifications, order alerts, and escrow settlement notices.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Merchant Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Legal Name"
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Nigerian Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 123 4567"
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
              <p className="text-[11px] text-[#6B726E] mt-1">
                Lagos dispatch riders call this number to coordinate daily order pick-ups.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Store Business Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@yourbusiness.ng"
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Store Appearance */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#101413]">Store Appearance & Branding</h2>
              <p className="text-xs text-[#6B726E] mt-1">
                Set up your public brand identity. High-resolution imagery creates immediate trust with customers.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Store Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Handcrafted modern leathercraft for the conscious minimalist"
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                Extended Store Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your workshop, heritage, or materials..."
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md p-3.5 text-xs sm:text-sm text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                  Store Logo URL
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-full object-cover border border-[#E4E7E5]"
                  />
                  <span className="text-[11px] text-[#6B726E]">Avatar Preview</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101413] mb-1.5">
                  Store Banner URL
                </label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={bannerUrl}
                    alt="Banner preview"
                    className="w-20 h-10 rounded object-cover border border-[#E4E7E5]"
                  />
                  <span className="text-[11px] text-[#6B726E]">Hero Banner Preview</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Seller Agreement */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-[#101413]">Seller Responsibilities & Agreement</h2>
              <p className="text-xs text-[#6B726E] mt-1">
                MarketNest is built on uncompromising trust, authentic products, and prompt fulfillment.
              </p>
            </div>

            <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E4E7E5] space-y-3 text-xs text-[#6B726E] max-h-60 overflow-y-auto">
              <div className="flex items-center gap-2 text-[#101413] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#0E8F5A]" />
                <span>MarketNest Merchant Standards:</span>
              </div>
              <ul className="space-y-2 list-disc list-inside leading-relaxed text-[11px]">
                <li>
                  <strong>Authentic Goods Only:</strong> Counterfeit, stolen, or mislabeled items are strictly prohibited and result in permanent ban and forfeiture of escrow funds.
                </li>
                <li>
                  <strong>Fulfillment Window:</strong> Lagos orders must be prepared for courier pickup within 24 hours of confirmation.
                </li>
                <li>
                  <strong>Escrow Payouts:</strong> Customer payments remain held in secure escrow until delivery verification or 7-day inspection window expires.
                </li>
                <li>
                  <strong>Customer Service:</strong> Merchants agree to resolve legitimate buyer dispute inquiries within 24 business hours.
                </li>
              </ul>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-[#E4E7E5] bg-white cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded accent-[#0E8F5A] w-4 h-4"
              />
              <span className="text-xs text-[#101413] font-medium leading-relaxed">
                I have read and agree to the MarketNest Seller Terms, Escrow Protection Rules, and Product Authenticity Policies.
              </span>
            </label>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="pt-6 border-t border-[#E4E7E5] flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="text-xs text-[#6B726E] hover:text-[#101413] cursor-pointer"
            >
              Cancel & Return
            </button>
          )}

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              type="button"
              isLoading={isSubmitting}
              onClick={handleSubmitOnboarding}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Create My Store
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
