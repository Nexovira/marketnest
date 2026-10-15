/**
 * @file src/pages/seller/SellLandingPage.tsx
 * Public entry point for prospective Nigerian merchants looking to sell on MarketNest.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { useSeller } from '../../context/SellerContext';
import { HERO_IMAGE, EDITORIAL_MADE_IN_NIGERIA } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import {
  Store,
  ShieldCheck,
  TrendingUp,
  Truck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Lock,
  Package,
  Layers
} from 'lucide-react';

export const SellLandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { navigateTo, setRedirectAfterLogin } = useMarket();
  const { isSeller } = useSeller();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleStartSelling = () => {
    if (isSeller) {
      navigateTo('seller-dashboard');
      return;
    }
    if (isAuthenticated) {
      navigateTo('seller-onboarding');
    } else {
      setRedirectAfterLogin('seller-onboarding');
      navigateTo('login', { redirect: 'seller-onboarding' });
    }
  };

  const faqs = [
    {
      q: 'What are the requirements to open a store on MarketNest?',
      a: 'Any independent Nigerian maker, artisan, brand owner, or retailer with genuine products and a valid Nigerian phone number can apply. You will need your store name, business category, location, and clear product images.'
    },
    {
      q: 'How does MarketNest Escrow protect sellers?',
      a: 'When a customer places an order, payment is secured in escrow immediately before you ship. Once the customer receives and inspects the item, your payout is automatically released. You never have to worry about fake payment alerts or unfulfilled cash-on-delivery orders.'
    },
    {
      q: 'How does shipping work across Lagos and nationwide?',
      a: 'MarketNest integrates with vetted Lagos dispatch networks offering same-day and 24-hour deliveries. For interstate deliveries to Abuja, Port Harcourt, and other states, express air couriers collect from your location.'
    },
    {
      q: 'Are there any upfront listing fees?',
      a: 'No. Creating a store and listing your products on MarketNest is completely free. We only charge a small platform commission when your product successfully sells and is verified by the buyer.'
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-[#FFFFFF] pt-8 lg:pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-3 py-1 rounded-full">
                <Store className="w-3.5 h-3.5" />
                <span>MarketNest Merchant Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#101413] tracking-tight leading-[1.08] text-balance">
                Turn your products into a growing business.
              </h1>

              <p className="text-base sm:text-lg text-[#6B726E] leading-relaxed max-w-xl">
                Create your store on MarketNest, reach more customers and manage your products from one powerful platform.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartSelling}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isSeller ? 'Open Seller Dashboard' : 'Start Selling'}
                </Button>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center font-medium text-xs sm:text-sm py-2.5 px-5 min-h-[44px] rounded-md border border-[#E4E7E5] text-[#101413] hover:bg-[#F7F5F0] transition-colors"
                >
                  Explore How It Works
                </a>
              </div>

              {/* Trust Metric Strip */}
              <div className="pt-6 border-t border-[#E4E7E5] flex items-center gap-6 sm:gap-10 text-xs">
                <div>
                  <p className="text-lg font-bold text-[#101413] tabular-nums">0%</p>
                  <p className="text-[#6B726E] mt-0.5">Upfront Listing Fee</p>
                </div>
                <div className="h-8 w-px bg-[#E4E7E5]" />
                <div>
                  <p className="text-lg font-bold text-[#101413] tabular-nums">100%</p>
                  <p className="text-[#6B726E] mt-0.5">Escrow Guaranteed</p>
                </div>
                <div className="h-8 w-px bg-[#E4E7E5]" />
                <div>
                  <p className="text-lg font-bold text-[#0E8F5A] tabular-nums">24h</p>
                  <p className="text-[#6B726E] mt-0.5">Average Store Activation</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F7F5F0] border border-[#E4E7E5] shadow-xl">
                <img
                  src={EDITORIAL_MADE_IN_NIGERIA}
                  alt="Verified Nigerian artisan crafting premium goods"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E8F5A]">
                      Verified Merchant Spotlight
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs">
                      Lagos, Nigeria
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    &ldquo;MarketNest elevated our workshop from Instagram DMs to a serious retail brand.&rdquo;
                  </h3>
                  <p className="text-xs text-neutral-300">
                    — Urban Finds, Victoria Island
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A]">
            Why Sell on MarketNest
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight mt-1">
            Built for modern Nigerian commerce.
          </h2>
          <p className="text-sm text-[#6B726E] mt-2">
            Say goodbye to endless WhatsApp chats, payment screenshot disputes, and unverified buyers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-[#E4E7E5] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#101413]">Escrow Secured Payouts</h3>
            <p className="text-xs text-[#6B726E] leading-relaxed">
              Customer funds are pre-authorized before you fulfill. Never lose inventory to bad debts or bounced payments.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E4E7E5] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#101413]">Integrated Lagos Dispatch</h3>
            <p className="text-xs text-[#6B726E] leading-relaxed">
              Access reliable logistics partners with same-day and 24h tracked dispatch across Island, Mainland, and interstate.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E4E7E5] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#101413]">Verified Brand Badge</h3>
            <p className="text-xs text-[#6B726E] leading-relaxed">
              Stand out with an official MarketNest Verified badge that signals trustworthiness and premium craftsmanship.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E4E7E5] rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#101413]">Dedicated Business Suite</h3>
            <p className="text-xs text-[#6B726E] leading-relaxed">
              A high-end SaaS seller dashboard to manage inventory, track product performance, and manage fulfillment.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW SELLING WORKS */}
      <section id="how-it-works" className="bg-[#F7F5F0] py-16 lg:py-20 border-y border-[#E4E7E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A]">
              Simple Three-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight mt-1">
              How selling on MarketNest works
            </h2>
            <p className="text-sm text-[#6B726E] mt-2">
              Launch your branded store in under 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-8 space-y-4">
              <div className="w-9 h-9 rounded-full bg-[#101413] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-[#101413]">Complete Onboarding</h3>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                Provide your store name, business category, and contact details. Set up your custom brand slug and store bio.
              </p>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-8 space-y-4">
              <div className="w-9 h-9 rounded-full bg-[#101413] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-[#101413]">List Your Products</h3>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                Upload crisp product imagery, set prices in Nigerian Naira (₦), configure stock thresholds, and publish instantly.
              </p>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-8 space-y-4">
              <div className="w-9 h-9 rounded-full bg-[#101413] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-[#101413]">Ship & Get Paid</h3>
              <p className="text-xs text-[#6B726E] leading-relaxed">
                Receive instant order alerts with pre-funded escrow. Hand over to our dispatch riders and receive disbursement upon delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SELLER FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A]">
            Questions & Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6B726E] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#0E8F5A]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-[#6B726E] leading-relaxed border-t border-[#E4E7E5]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#101413] text-white rounded-2xl p-8 sm:p-14 text-center max-w-4xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#1B211F] text-[#0E8F5A] flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to grow your customer base?
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
            Create your MarketNest store today and reach high-intent customers looking for authentic Nigerian goods and premium services.
          </p>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartSelling}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSeller ? 'Open Seller Dashboard' : 'Start Selling on MarketNest'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
