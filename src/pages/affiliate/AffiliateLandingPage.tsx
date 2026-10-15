/**
 * @file src/pages/affiliate/AffiliateLandingPage.tsx
 * Public marketing and recruitment page for the MarketNest Affiliate Platform.
 * Features value propositions, commission structures, interactive earnings calculator,
 * FAQ, and conversion CTAs.
 */

import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../services/currencyService';
import { Button } from '../../components/ui/Button';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
  Users,
  Store,
  Sparkles,
  Link2,
  Lock,
  ChevronDown,
  HelpCircle,
  Clock,
  Layers,
  Award
} from 'lucide-react';

export const AffiliateLandingPage: React.FC = () => {
  const { navigateTo } = useMarket();
  const { isAuthenticated } = useAuth();

  // Interactive Earnings Calculator
  const [estimatedSalesVolume, setEstimatedSalesVolume] = useState<number>(1500000); // ₦1.5m in GMV
  const estimatedCommissionRate = 0.05; // 5%
  const estimatedEarnings = Math.round(estimatedSalesVolume * estimatedCommissionRate);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleApplyClick = () => {
    navigateTo('affiliate-apply');
  };

  const handleDashboardClick = () => {
    navigateTo('affiliate-dashboard');
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 animate-in fade-in">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#FBFBFA] border-b border-[#E4E7E5] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5EF] text-[#0E8F5A] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MarketNest Creator & Partner Program</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#101413] tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Turn Your Audience <br className="hidden sm:block" />
            <span className="text-[#0E8F5A]">Into Earnings.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#6B726E] max-w-2xl mx-auto leading-relaxed">
            Partner with Nigeria's premier multi-vendor luxury marketplace. Promote authentic fashion, handcrafted homeware, and artisanal lifestyle collections, earning transparent commissions on every eligible order.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleApplyClick}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Become an Affiliate
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleDashboardClick}
            >
              Login to Affiliate Dashboard
            </Button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B726E]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0E8F5A]" /> 5.0% – 8.0% Base Commission
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0E8F5A]" /> 30-Day Attribution Window
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0E8F5A]" /> Escrow-Verified Payouts
            </span>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#0E8F5A] uppercase tracking-wider">The Process</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
            How The MarketNest Affiliate Platform Works
          </h2>
          <p className="text-xs sm:text-sm text-[#6B726E] max-w-xl mx-auto">
            A frictionless, high-converting partnership engine designed specifically for African tastemakers, digital creators, and bloggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Join & Get Approved',
              desc: 'Submit your profile and promotional channels. Approved partners receive a unique uppercase partner code and portal access.'
            },
            {
              step: '02',
              title: 'Curate & Generate Links',
              desc: 'Promote specific luxury items, designer storefronts, broad categories, or seasonal marketing campaigns.'
            },
            {
              step: '03',
              title: 'Audience Shops with Ease',
              desc: 'Followers enjoy a seamless luxury checkout backed by Paystack and our 30-day multi-page attribution window.'
            },
            {
              step: '04',
              title: 'Earn Verified Payouts',
              desc: 'Once the customer payment and delivery review periods clear, commissions become available for direct disbursement.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E4E7E5] rounded-2xl p-6 shadow-xs space-y-3 relative overflow-hidden hover:border-[#101413] transition-colors"
            >
              <span className="text-2xl font-black text-[#0E8F5A]/40 font-mono block">{item.step}</span>
              <h3 className="font-bold text-base text-[#101413]">{item.title}</h3>
              <p className="text-xs text-[#6B726E] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Why Become an Affiliate & What to Promote */}
      <section className="bg-[#F7F5F0] border-y border-[#E4E7E5] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#0E8F5A] uppercase tracking-wider">
                Why Partner With MarketNest
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight">
                Built For Curators Who Value Authenticity & Quality
              </h2>
              <p className="text-xs sm:text-sm text-[#6B726E] leading-relaxed">
                Unlike generic marketplaces flooded with low-grade mass imports, MarketNest curates certified Nigerian artisans, verified fashion houses, and vetted luxury brands. High average order values mean your recommendations earn significant returns.
              </p>

              <div className="space-y-3">
                {[
                  'Competitive 5.0% standard base commission, with bonus rates up to 8.0% on seasonal campaigns.',
                  '30-day Last-Click attribution window survives full checkout and cart browsing.',
                  'Transparent analytics: track clicks, conversion rates, and settled payouts in real time.',
                  'Multi-seller support: earn across all eligible items in a customer basket.'
                ].map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#101413]">
                    <CheckCircle2 className="w-4 h-4 text-[#0E8F5A] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button variant="primary" size="md" onClick={handleApplyClick}>
                  Apply To Become a Partner
                </Button>
              </div>
            </div>

            {/* What you can promote cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#101413]">Individual Products</h4>
                <p className="text-xs text-[#6B726E]">
                  Create direct deep-links to trending bespoke silk kimonos, bronze casting, or luxury leather bags.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#101413]">Seller Storefronts</h4>
                <p className="text-xs text-[#6B726E]">
                  Promote your favorite verified Nigerian designers and craft studios as complete boutique collections.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#101413]">Category Hubs</h4>
                <p className="text-xs text-[#6B726E]">
                  Send gift-shoppers directly to curated categories like Handcrafted Decor or Contemporary Apparel.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#101413]">Seasonal Campaigns</h4>
                <p className="text-xs text-[#6B726E]">
                  Boost earnings during national shopping events like Lagos Fashion Week and Independence Showcases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Earnings Calculator */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#0E8F5A] uppercase tracking-wider">Transparency</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
            Estimate Your Potential Monthly Earnings
          </h2>
          <p className="text-xs text-[#6B726E]">
            Commissions are calculated on net verified order products excluding delivery fees.
          </p>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#6B726E]">Referred Monthly Customer Purchases:</span>
              <span className="font-extrabold text-base text-[#101413] font-mono">
                {formatCurrency(estimatedSalesVolume)}
              </span>
            </div>

            <input
              type="range"
              min={200000}
              max={10000000}
              step={100000}
              value={estimatedSalesVolume}
              onChange={(e) => setEstimatedSalesVolume(parseInt(e.target.value, 10))}
              className="w-full accent-[#0E8F5A] cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-[#6B726E]">
              <span>₦200,000</span>
              <span>₦5,000,000</span>
              <span>₦10,000,000+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E4E7E5]">
            <div className="bg-[#F7F5F0] rounded-2xl p-4 text-center space-y-1">
              <span className="text-[11px] font-bold text-[#6B726E] uppercase">Average Base Rate</span>
              <p className="text-xl font-black text-[#101413]">5.0%</p>
            </div>

            <div className="bg-[#F7F5F0] rounded-2xl p-4 text-center space-y-1">
              <span className="text-[11px] font-bold text-[#6B726E] uppercase">Attribution Window</span>
              <p className="text-xl font-black text-[#101413]">30 Days</p>
            </div>

            <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-2xl p-4 text-center space-y-1">
              <span className="text-[11px] font-bold text-[#0E8F5A] uppercase">Estimated Monthly Payout</span>
              <p className="text-2xl font-black text-[#0E8F5A] font-mono">
                {formatCurrency(estimatedEarnings)}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#6B726E] text-center italic">
            *Illustration only. Actual earnings depend on product categories, active campaigns, and customer completion of delivery inspection.
          </p>
        </div>
      </section>

      {/* 5. Trust, Fraud & Escrow Security Notice */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#101413] text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0E8F5A]">
            <ShieldCheck className="w-4 h-4" />
            <span className="uppercase tracking-wider">Bank-Grade Attribution Security</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Server-Authoritative Earnings. Zero Estimation Slop.
          </h3>

          <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed max-w-2xl">
            Commissions are only minted after Paystack verification and confirmation of authentic orders. Both affiliates and customers are protected: self-referrals are prevented, cancelled orders are handled gracefully, and affiliates are never shortchanged by frontend tampering.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-[#D1D5DB]">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-white block">Cryptographic Integrity</span>
              <span>HMAC webhook validation ensures every order is paid in Nigerian Naira.</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-white block">Idempotent Accounting</span>
              <span>Duplicate webhooks or repeat callbacks never trigger double payouts.</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="font-bold text-white block">Escrow Clearance</span>
              <span>Affiliates and sellers are settled once the customer delivery period passes.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-[#101413] tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-[#6B726E]">Everything you need to know about the MarketNest affiliate partnership.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Who can apply to become a MarketNest Affiliate?',
              a: 'Digital creators, influencers, fashion stylists, lifestyle bloggers, interior designers, and WhatsApp community curators with authentic audiences interested in premium Nigerian products can apply.'
            },
            {
              q: 'How does link tracking and attribution work?',
              a: 'When your audience clicks your referral link, a secure 30-day tracking session is established. If they browse different stores and complete a verified checkout within 30 days, your account receives the commission attribution.'
            },
            {
              q: 'Are delivery fees included in commission calculations?',
              a: 'No. Affiliate commissions are calculated strictly on the verified purchase subtotal of physical products, excluding logistics, customs, and delivery courier fees.'
            },
            {
              q: 'Can I purchase items through my own affiliate link?',
              a: 'No. MarketNest enforces a strict self-referral prevention policy. Affiliates cannot earn commission on purchases made using their own customer accounts.'
            },
            {
              q: 'What is the payout threshold and schedule?',
              a: 'The minimum balance eligible for payout request is ₦10,000. Commissions are first recorded as Pending during the customer delivery and return period, then transition to Approved for bank settlement.'
            }
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm font-bold text-[#101413] hover:bg-[#FBFBFA] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6B726E] transition-transform ${openFaq === i ? 'rotate-180 text-[#0E8F5A]' : ''}`}
                />
              </button>

              {openFaq === i && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-[#6B726E] leading-relaxed border-t border-[#E4E7E5]/50 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-3xl p-8 sm:p-14 text-center space-y-6">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-[#101413] tracking-tight">
              Ready to Monetize Your Audience?
            </h2>
            <p className="text-xs sm:text-sm text-[#6B726E] leading-relaxed">
              Join Nigeria's leading luxury affiliate network and champion authentic home-grown craftsmanship today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="primary" size="lg" onClick={handleApplyClick} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Submit Partner Application
            </Button>
            <Button variant="outline" size="lg" onClick={handleDashboardClick}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
