/**
 * @file src/pages/StoresPage.tsx
 * Verified Nigerian merchant directory celebrating independent brand owners and artisans.
 */

import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { MOCK_STORES } from '../data/mockData';
import { StoreCard } from '../components/StoreCard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { ShieldCheck, MapPin, Store, CheckCircle2, ArrowRight } from 'lucide-react';

export const StoresPage: React.FC = () => {
  const { navigateTo } = useMarket();
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const filteredStores = MOCK_STORES.filter((store) => {
    if (selectedCity === 'all') return true;
    return store.state.toLowerCase().includes(selectedCity.toLowerCase()) ||
           store.city.toLowerCase().includes(selectedCity.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Home', onClick: () => navigateTo('home') },
            { label: 'Verified Stores', isCurrent: true }
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2.5 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Vetted Merchant Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101413] tracking-tight">
              Meet the stores behind the products
            </h1>
            <p className="text-xs sm:text-sm text-[#6B726E] mt-1 max-w-xl">
              MarketNest gives independent Nigerian brands, designers, and artisans a premium storefront with trusted escrow infrastructure.
            </p>
          </div>

          <Button
            variant="dark"
            size="sm"
            onClick={() => navigateTo('shop')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Browse All Products
          </Button>
        </div>
      </div>

      {/* City & Region Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E4E7E5] text-xs">
        <button
          onClick={() => setSelectedCity('all')}
          className={`py-2 px-3.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedCity === 'all'
              ? 'bg-[#101413] text-white'
              : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
          }`}
        >
          All Locations ({MOCK_STORES.length})
        </button>

        <button
          onClick={() => setSelectedCity('Lagos')}
          className={`py-2 px-3.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedCity === 'Lagos'
              ? 'bg-[#101413] text-white'
              : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
          }`}
        >
          Lagos (VI, Ikoyi, Yaba, Lekki)
        </button>

        <button
          onClick={() => setSelectedCity('Abuja')}
          className={`py-2 px-3.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedCity === 'Abuja'
              ? 'bg-[#101413] text-white'
              : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
          }`}
        >
          Abuja FCT (Maitama)
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      {/* Become a Verified Seller Callout Box */}
      <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E8F5A]">
            <Store className="w-4 h-4" />
            <span>Merchant Accreditation</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#101413]">
            Do you manufacture or curate exceptional goods in Nigeria?
          </h3>
          <p className="text-xs sm:text-sm text-[#6B726E] leading-relaxed">
            Join the MarketNest merchant network. Enjoy automated escrow payments, discounted Lagos express shipping, and a verified brand badge.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigateTo('shop')}
        >
          Apply to Sell on MarketNest
        </Button>
      </div>
    </div>
  );
};
