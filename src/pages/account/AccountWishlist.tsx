/**
 * @file src/pages/account/AccountWishlist.tsx
 * Customer saved items view linked with Firestore and instant shopping actions.
 */

import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/ui/Button';
import { Heart } from 'lucide-react';

export const AccountWishlist: React.FC = () => {
  const { wishlistIds, navigateTo } = useMarket();

  const savedProducts = MOCK_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  if (savedProducts.length === 0) {
    return (
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-[#101413]">Your wishlist is empty</h3>
        <p className="text-xs sm:text-sm text-[#6B726E] mt-1.5 leading-relaxed">
          Tap the heart icon on any product across the marketplace to save finds for later inspection.
        </p>
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={() => navigateTo('shop')}>
            Explore Curated Finds
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Saved Items</h2>
          <p className="text-xs text-[#6B726E]">
            Products saved to your account. Synced across all your devices.
          </p>
        </div>
        <span className="text-xs text-[#6B726E] tabular-nums">
          {savedProducts.length} {savedProducts.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {savedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
