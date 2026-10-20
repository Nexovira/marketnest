/**
 * @file src/pages/affiliate/AffiliateApplyPage.tsx
 * Onboarding and partner application form for MarketNest Affiliates.
 * Saves applications to Firestore and provides an instant test activation tool for development.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import {
  submitAffiliateApplication,
  getAffiliateApplication,
  getAffiliateProfile
} from '../../services/affiliate/affiliateService';
import { AffiliateApplication, AffiliateProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Instagram,
  Globe,
  Youtube,
  Send,
  Lock,
  ArrowLeft
} from 'lucide-react';

const PROMOTIONAL_CHANNELS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Facebook',
  'X (Twitter)',
  'Blog / Editorial',
  'Website',
  'WhatsApp Community',
  'Email Newsletter',
  'Other'
];

const CATEGORY_OPTIONS = [
  'Fashion & Apparel',
  'Home & Living',
  'Jewelry & Accessories',
  'Arts & Antiquities',
  'Beauty & Wellness',
  'Artisanal Gourmet',
  'Bespoke Gifts'
];

export const AffiliateApplyPage: React.FC = () => {
  const { firebaseUser, profile, isAuthenticated } = useAuth();
  const { navigateTo, showToast } = useMarket();

  // Form State
  const [fullName, setFullName] = useState(profile?.name || firebaseUser?.displayName || '');
  const [displayName, setDisplayName] = useState('');
  const [channel, setChannel] = useState('Instagram');
  const [channelUrl, setChannelUrl] = useState('');
  const [audience, setAudience] = useState('');
  const [reason, setReason] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Fashion & Apparel',
    'Home & Living'
  ]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Status & Existing Application State
  const [existingApp, setExistingApp] = useState<AffiliateApplication | null>(null);
  const [existingProfile, setExistingProfile] = useState<AffiliateProfile | null>(null);
  const [isReapplying, setIsReapplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const [app, prof] = await Promise.all([
          getAffiliateApplication(firebaseUser.uid),
          getAffiliateProfile(firebaseUser.uid)
        ]);
        setExistingApp(app);
        setExistingProfile(prof);
        if (app && app.status === 'rejected') {
          // Pre-fill fields for easy revision
          if (app.fullName) setFullName(app.fullName);
          if (app.displayName) setDisplayName(app.displayName);
          if (app.channel) setChannel(app.channel);
          if (app.channelUrl) setChannelUrl(app.channelUrl);
          if (app.audience) setAudience(app.audience);
          if (app.reason) setReason(app.reason);
          if (app.preferredCategories && app.preferredCategories.length > 0) {
            setSelectedCategories(app.preferredCategories);
          }
        }
      } catch (err) {
        console.warn('Error loading affiliate status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [firebaseUser]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated || !firebaseUser) {
      showToast('Sign In Required', 'Please sign in or register to submit an application.', 'info');
      navigateTo('login', { redirect: 'affiliate-apply' });
      return;
    }

    if (!fullName.trim() || !channelUrl.trim() || !audience.trim() || !reason.trim()) {
      setErrorMsg('Please complete all application fields before submitting.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('You must agree to the Affiliate Partner Terms and Ethical Promotion Policy.');
      return;
    }

    setSubmitting(true);
    try {
      const app = await submitAffiliateApplication(firebaseUser.uid, {
        fullName,
        displayName: displayName || fullName,
        channel,
        channelUrl,
        audience,
        reason,
        preferredCategories: selectedCategories
      });
      setExistingApp(app);
      setIsReapplying(false);
      showToast('Application Submitted', 'Your affiliate application is under review.', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6B726E]">Checking partner status...</p>
      </div>
    );
  }

  // Already an active affiliate
  if (existingProfile && existingProfile.status === 'active') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#101413]">You are an Active Partner</h2>
          <p className="text-xs text-[#6B726E]">
            Your partner profile is verified with active code: <strong className="text-[#101413]">{existingProfile.code}</strong>.
          </p>
        </div>

        <div className="pt-2">
          <Button variant="primary" size="lg" onClick={() => navigateTo('affiliate-dashboard')}>
            Go to Affiliate Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Application previously reviewed and rejected
  if (existingApp && existingApp.status === 'rejected' && !isReapplying) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-8 animate-in fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#101413]">Application Declined</h2>
          <p className="text-xs text-[#6B726E] max-w-md mx-auto leading-relaxed">
            Thank you for your interest in the MarketNest Affiliate Partner Program. After review by our curation team, your application was not approved at this time.
          </p>
        </div>

        {/* Reviewer Explanation */}
        <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px]">
              Review Decision & Explanation
            </span>
            {existingApp.reviewedAt && (
              <span className="text-[10px] text-rose-700 font-mono">
                Reviewed {new Date(existingApp.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          <p className="text-rose-950 font-medium leading-relaxed bg-white/80 p-3.5 rounded-xl border border-rose-100">
            {existingApp.reviewReason || 'No specific explanation was provided. Channels may not meet minimum audience reach or brand safety guidelines.'}
          </p>
        </div>

        {/* Previous Submission Summary */}
        <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-[#101413] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#6B726E]" />
            <span>Submitted Profile Details</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4E7E5]">
            <div>
              <span className="text-[#6B726E] text-[11px] block">APPLICANT</span>
              <span className="font-bold text-[#101413]">{existingApp.fullName}</span>
            </div>
            <div>
              <span className="text-[#6B726E] text-[11px] block">PRIMARY CHANNEL</span>
              <span className="font-bold text-[#101413]">{existingApp.channel}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#6B726E] text-[11px] block">CHANNEL URL</span>
              <span className="font-mono text-[11px] text-[#0E8F5A] break-all">{existingApp.channelUrl}</span>
            </div>
          </div>
        </div>

        {/* Reapplication Action */}
        <div className="p-6 bg-white border border-[#E4E7E5] rounded-2xl text-xs space-y-3 shadow-2xs">
          <h4 className="font-bold text-[#101413] text-sm">Would you like to re-apply?</h4>
          <p className="text-[#6B726E] text-xs leading-relaxed">
            You may revise your channel information, update your reach, and submit a new application for evaluation.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsReapplying(true)}
              className="w-full sm:w-auto"
            >
              Update Details & Re-apply
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigateTo('affiliate')}
              className="w-full sm:w-auto"
            >
              Back to Overview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Application already submitted and pending review
  if (existingApp && existingApp.status === 'pending') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-8 animate-in fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#101413]">Application Under Review</h2>
          <p className="text-xs text-[#6B726E] max-w-md mx-auto leading-relaxed">
            Thank you for applying to the MarketNest Affiliate Partner Program. Our brand curation committee is evaluating your promotional channels.
          </p>
        </div>

        <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-[#101413] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0E8F5A]" />
            <span>Submission Details</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4E7E5]">
            <div>
              <span className="text-[#6B726E] text-[11px] block">APPLICANT</span>
              <span className="font-bold text-[#101413]">{existingApp.fullName}</span>
            </div>
            <div>
              <span className="text-[#6B726E] text-[11px] block">PRIMARY CHANNEL</span>
              <span className="font-bold text-[#101413]">{existingApp.channel}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#6B726E] text-[11px] block">CHANNEL URL</span>
              <span className="font-mono text-[11px] text-[#0E8F5A] break-all">{existingApp.channelUrl}</span>
            </div>
            {existingApp.submittedAt && (
              <div className="col-span-2">
                <span className="text-[#6B726E] text-[11px] block">SUBMISSION DATE</span>
                <span className="font-mono text-[11px] text-[#101413]">
                  {new Date(existingApp.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigateTo('affiliate')}
            className="text-xs font-semibold text-[#6B726E] hover:text-[#101413] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Affiliate Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E4E7E5] pb-6">
        <button
          onClick={() => navigateTo('affiliate')}
          className="text-xs font-semibold text-[#6B726E] hover:text-[#101413] inline-flex items-center gap-1.5 cursor-pointer mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Program Details
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
          Partner Application Form
        </h1>
        <p className="text-xs sm:text-sm text-[#6B726E]">
          Join vetted Nigerian tastemakers and earn up to 8.0% commission on verified customer orders.
        </p>
      </div>

      {/* Guest Notice */}
      {!isAuthenticated && (
        <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#101413] block">Account Required</span>
            <span className="text-[#6B726E]">You must sign in to link your partner application to your account.</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateTo('login', { redirect: 'affiliate-apply' })}>
            Sign In First
          </Button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Re-application Guidance Banner */}
      {isReapplying && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Re-applying as Affiliate Partner:</strong> Please revise your promotional channel details and application statement to address the reviewer feedback before submitting.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsReapplying(false)}
            className="text-[11px] font-bold text-amber-800 underline hover:no-underline ml-4 cursor-pointer shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Name inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-[#101413]">Legal Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amina James Balogun"
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg px-3.5 py-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#101413]">Preferred Brand / Creator Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Lagos Curations by Amina"
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg px-3.5 py-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>
        </div>

        {/* Channel Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-[#101413]">Primary Promotional Channel *</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg px-3.5 py-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white cursor-pointer"
            >
              {PROMOTIONAL_CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#101413]">Social Handle or Channel URL *</label>
            <input
              type="url"
              required
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="https://instagram.com/yourhandle or website"
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg px-3.5 py-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>
        </div>

        {/* Audience Description */}
        <div className="space-y-1.5">
          <label className="font-bold text-[#101413]">Audience Profile & Follower Size *</label>
          <textarea
            required
            rows={2}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Describe your audience demographic, niche focus (e.g., fashion stylists, diaspora buyers, interior decor), and approximate community size..."
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg px-3.5 py-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>

        {/* Why apply */}
        <div className="space-y-1.5">
          <label className="font-bold text-[#101413]">Why do you want to partner with MarketNest? *</label>
          <textarea
            required
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Share how you plan to feature MarketNest creators and verified products to your audience..."
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg px-3.5 py-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>

        {/* Preferred Categories */}
        <div className="space-y-2">
          <label className="font-bold text-[#101413] block">Preferred Promotion Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const selected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#101413] text-white'
                      : 'bg-[#F7F5F0] text-[#6B726E] hover:text-[#101413]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded text-[#0E8F5A] focus:ring-[#0E8F5A] cursor-pointer"
            />
            <span className="text-[11px] text-[#6B726E] leading-relaxed">
              I agree to the <strong>MarketNest Affiliate Partnership Terms</strong>. I understand that self-referrals (buying through my own link) are prohibited, commissions are calculated only on verified paid physical products, and unethical spam promotion will lead to account suspension.
            </span>
          </label>
        </div>

        {/* Submit Button & Dev Tool */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            {submitting ? 'Submitting Application...' : 'Submit Partner Application'}
          </Button>
        </div>
      </form>
    </div>
  );
};
