/**
 * @file src/components/QuickViewModal.tsx
 * Quick inspection modal for seamless catalog browsing without losing scroll position.
 */

import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { PriceDisplay, formatNaira } from './ui/PriceDisplay';
import { RatingStars } from './ui/RatingStars';
import { VerifiedBadge } from './ui/VerifiedBadge';
import { Button } from './ui/Button';
import { X, Heart, ShieldCheck, Zap, ArrowRight, Minus, Plus } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, closeQuickView, addToCart, toggleWishlist, isWishlisted, navigateTo, showToast } = useMarket();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    quickViewProduct?.variants?.[0]?.id
  );

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isSaved = isWishlisted(product.id);
  const currentVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const activePrice = currentVariant ? currentVariant.price : product.price;

  const handleAdd = () => {
    addToCart(product, quantity, currentVariant);
    closeQuickView();
  };

  const handleViewFullDetails = () => {
    closeQuickView();
    navigateTo('product', { productId: product.id });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={closeQuickView}
        className="fixed inset-0 bg-[#101413]/60 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-xl shadow-2xl overflow-hidden border border-[#E4E7E5] my-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#101413] flex items-center justify-center shadow-sm cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Left */}
            <div className="p-6 bg-[#F7F5F0] flex flex-col justify-between">
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white shadow-xs">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-[#0E8F5A] ring-1 ring-[#0E8F5A]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Right */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                {/* Seller & Verification */}
                <div className="flex items-center gap-2 text-xs text-[#6B726E]">
                  <span>Sold by {product.seller.name}</span>
                  {product.seller.verified && <VerifiedBadge size="sm" />}
                </div>

                <h2 className="text-xl font-bold text-[#101413] mt-1.5 leading-snug">
                  {product.title}
                </h2>

                <div className="flex items-center gap-3 mt-2">
                  <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
                  <span className="text-xs text-[#CBD5E1]">·</span>
                  <span className="text-xs text-[#0E8F5A] font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {product.deliverySpeed === 'lagos_sameday' ? 'Lagos Same-Day Dispatch' : 'Lagos 24h Delivery'}
                  </span>
                </div>

                <div className="mt-4 pb-4 border-b border-[#E4E7E5]">
                  <PriceDisplay price={activePrice} originalPrice={product.originalPrice} size="lg" />
                </div>

                <p className="text-xs text-[#6B726E] mt-3 line-clamp-3 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>

                {/* Variants if any */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-[#101413] block mb-1.5">
                      Select Option
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`text-xs px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                            selectedVariantId === v.id
                              ? 'border-[#0E8F5A] bg-[#E8F5EF] text-[#0E8F5A] font-semibold'
                              : 'border-[#E4E7E5] text-[#101413] hover:border-[#101413]'
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {(() => {
                  const availableStock =
                    product.stockCount !== undefined
                      ? product.stockCount
                      : product.stock !== undefined
                      ? product.stock
                      : 10;
                  const isOutOfStock =
                    availableStock <= 0 || product.status === 'outOfStock' || product.inStock === false;

                  return (
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-xs font-semibold text-[#101413]">Quantity</span>
                      <div className="flex items-center border border-[#E4E7E5] rounded bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={isOutOfStock}
                          className="w-7 h-7 flex items-center justify-center text-[#6B726E] hover:text-[#101413] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold tabular-nums">
                          {isOutOfStock ? 0 : quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (quantity >= availableStock) {
                              showToast('Stock Limit Reached', `Only ${availableStock} available.`, 'warning');
                              return;
                            }
                            setQuantity(quantity + 1);
                          }}
                          disabled={isOutOfStock || quantity >= availableStock}
                          className="w-7 h-7 flex items-center justify-center text-[#6B726E] hover:text-[#101413] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {isOutOfStock ? (
                        <span className="text-[11px] font-bold text-rose-600">Out of Stock</span>
                      ) : (
                        <span className="text-[11px] text-[#6B726E]">({availableStock} available)</span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Actions & Escrow Guarantee */}
              <div className="mt-6 pt-4 border-t border-[#E4E7E5] space-y-3">
                {(() => {
                  const availableStock =
                    product.stockCount !== undefined
                      ? product.stockCount
                      : product.stock !== undefined
                      ? product.stock
                      : 10;
                  const isOutOfStock =
                    availableStock <= 0 || product.status === 'outOfStock' || product.inStock === false;

                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        disabled={isOutOfStock}
                        onClick={handleAdd}
                      >
                        {isOutOfStock ? 'Out of Stock' : `Add to Bag · ${formatNaira(activePrice * quantity)}`}
                      </Button>

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className={`w-11 h-11 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isSaved
                            ? 'border-rose-200 bg-rose-50 text-rose-600'
                            : 'border-[#E4E7E5] text-[#101413] hover:bg-[#F7F5F0]'
                        }`}
                        aria-label="Save to Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                      </button>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between text-xs text-[#6B726E]">
                  <span className="flex items-center gap-1 text-[#0E8F5A]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Escrow Guaranteed
                  </span>
                  <button
                    onClick={handleViewFullDetails}
                    className="text-[#101413] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    Full details & specs <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
