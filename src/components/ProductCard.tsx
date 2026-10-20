/**
 * @file src/components/ProductCard.tsx
 * Luxury product card with image ratio discipline, hover elevation, and quick buy.
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { useMarket } from '../context/MarketContext';
import { PriceDisplay } from './ui/PriceDisplay';
import { RatingStars } from './ui/RatingStars';
import { VerifiedBadge } from './ui/VerifiedBadge';
import { Heart, Eye, ShoppingBag, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart, toggleWishlist, isWishlisted, openQuickView, navigateTo } = useMarket();
  const [imageError, setImageError] = useState(false);
  const isSaved = isWishlisted(product.id);

  const handleCardClick = () => {
    navigateTo('product', { productId: product.id });
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateTo('stores', { storeId: product.sellerId });
  };

  const deliveryLabel =
    product.deliverySpeed === 'lagos_sameday'
      ? 'Lagos Same-Day'
      : product.deliverySpeed === 'lagos_24h'
      ? 'Lagos 24h Delivery'
      : 'Express Nationwide';

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-[#FFFFFF] border border-[#E4E7E5] rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:border-[#CBD5E1] cursor-pointer ${className}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] bg-[#F7F5F0] overflow-hidden">
        {!imageError && (product.images?.[0] || product.imageUrl) ? (
          <img
            src={product.images?.[0] || product.imageUrl}
            alt={product.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F7F5F0] p-4 text-center">
            <span className="text-xs uppercase tracking-wider text-[#6B726E] font-medium">
              {product.category}
            </span>
            <span className="text-sm font-semibold text-[#101413] mt-1 line-clamp-1">
              {product.title}
            </span>
          </div>
        )}

        {/* Top Floating Actions */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label={isSaved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8F5A] ${
              isSaved
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/95 text-[#101413] hover:bg-white hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 stroke-rose-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            aria-label={`Quick preview for ${product.title}`}
            className="w-9 h-9 rounded-full bg-white/95 text-[#101413] hover:bg-white hover:text-[#0E8F5A] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8F5A]"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Quiet Delivery Indicator */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/95 text-[#101413] px-2 py-0.5 rounded shadow-xs backdrop-blur-xs">
            <Zap className="w-3 h-3 text-[#0E8F5A]" />
            <span>{deliveryLabel}</span>
          </span>
        </div>
      </div>

      {/* Card Content Module */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller Byline */}
          <div className="flex items-center justify-between gap-1 text-xs text-[#6B726E] mb-1">
            <button
              type="button"
              onClick={handleSellerClick}
              className="hover:text-[#101413] hover:underline underline-offset-2 truncate max-w-[160px] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0E8F5A]"
            >
              {product.seller.name}
            </button>
            {product.seller.verified && <VerifiedBadge size="sm" showIconOnly />}
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-[#101413] line-clamp-1 group-hover:text-[#0E8F5A] transition-colors">
            {product.title}
          </h3>

          {/* Rating & Review Count */}
          <div className="mt-1.5">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>
        </div>

        {/* Price & Buy Action */}
        <div className="mt-3 pt-3 border-t border-[#E4E7E5] flex items-center justify-between gap-2">
          <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="sm" />

          {(() => {
            const isOutOfStock =
              (product.stockCount !== undefined
                ? product.stockCount
                : product.stock !== undefined
                ? product.stock
                : 10) <= 0 ||
              product.status === 'outOfStock' ||
              product.inStock === false;

            if (isOutOfStock) {
              return (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                  Out of Stock
                </span>
              );
            }

            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                aria-label={`Add ${product.title} to bag`}
                className="w-9 h-9 rounded-md bg-[#F7F5F0] hover:bg-[#0E8F5A] text-[#101413] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E8F5A]"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
