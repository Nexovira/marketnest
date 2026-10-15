/**
 * @file src/components/Footer.tsx
 * Large premium marketplace footer with editorial typography and Nigeria trust markers.
 */

import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { ShieldCheck, MapPin, Globe, Lock } from 'lucide-react';
import { PolicyModal, PolicyType } from './PolicyModal';

export const Footer: React.FC = () => {
  const { navigateTo } = useMarket();
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);

  return (
    <footer className="bg-[#101413] text-white border-t border-[#1B211F] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Kicker & Manifesto Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-14 border-b border-[#1B211F]">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-sm bg-[#0E8F5A] text-white flex items-center justify-center font-bold text-sm">
                M
              </span>
              <span className="text-xl font-black tracking-tight text-white">MARKETNEST</span>
            </div>

            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Nigeria&apos;s premier multi-vendor commerce platform connecting discerning customers with verified independent sellers, designers, and artisans across Lagos, Abuja, and nationwide.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5 text-[#0E8F5A]">
                <ShieldCheck className="w-4 h-4" />
                <span>Escrow Protected</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Footer Link Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
            {/* SHOP */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">SHOP</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    All Products
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('shopping-assistant')}
                    className="hover:text-white transition-colors cursor-pointer text-[#0E8F5A] font-bold flex items-center gap-1"
                  >
                    <span>AI Shopping Assistant</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Categories
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    New Arrivals
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Trending Now
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('stores')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Verified Stores
                  </button>
                </li>
              </ul>
            </div>

            {/* SELL */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">SELL</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <button
                    onClick={() => navigateTo('sell')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Become a Seller
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('seller-dashboard')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Seller Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('sell')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Seller Standards & Escrow
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('stores')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Verified Store Directory
                  </button>
                </li>
              </ul>
            </div>

            {/* AFFILIATE */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">AFFILIATE</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <button
                    onClick={() => navigateTo('affiliate-apply')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Become an Affiliate
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('affiliate')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Affiliate Program
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('affiliate')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Commission Structure (5%+)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('affiliate-dashboard')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <span>Partner Dashboard</span>
                    <span className="px-1.5 py-0.2 bg-[#0E8F5A] text-white text-[9px] font-bold rounded">Portal</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* SUPPORT & COMPANY */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">SUPPORT & LEGAL</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <button
                    onClick={() => navigateTo('support')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <span>Customer Support Desk</span>
                    <span className="px-1.5 py-0.2 bg-[#0E8F5A] text-white text-[9px] font-bold rounded">Live</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('delivery')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Lagos Delivery & Logistics
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('returns')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Escrow & 7-Day Returns
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('terms')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('privacy')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy (NDPR)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('review_guidelines')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Community & Review Guidelines
                  </button>
                </li>
                <li className="pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => navigateTo('admin')}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <span>Admin Control Center</span>
                    <span className="px-1.5 py-0.5 bg-neutral-800 text-neutral-300 text-[9px] font-bold rounded">
                      Ops
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Globe className="w-3.5 h-3.5 text-[#0E8F5A]" />
              Nigeria
            </span>
            <span>·</span>
            <span className="tabular-nums">© 2026 MarketNest Technologies Ltd.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-[#0E8F5A]" />
              Encrypted Checkout & Escrow Protection
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Discover. Buy. Sell. Grow.</span>
          </div>
        </div>
      </div>

      {/* Trust & Policies Modal */}
      {activePolicy && (
        <PolicyModal
          isOpen={true}
          onClose={() => setActivePolicy(null)}
          policyType={activePolicy}
        />
      )}
    </footer>
  );
};
