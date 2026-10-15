/**
 * @file src/pages/CartPage.tsx
 * Dedicated luxury shopping cart page for MarketNest.
 * Displays multi-seller grouped items, visual free delivery progress,
 * saved for later shelf, inventory limits, and live order summary.
 */

import React from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../services/currencyService';
import { Button } from '../components/ui/Button';
import { MOCK_PRODUCTS } from '../data/mockData';
import { Product } from '../types';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Heart,
  Store,
  Lock,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    isEligibleForFreeDelivery,
    amountNeededForFreeDelivery,
    navigateTo,
    toggleWishlist,
    wishlistIds,
    showToast
  } = useMarket();
  const { isAuthenticated } = useAuth();

  // Group items by seller for clear multi-vendor presentation
  const sellerGroups = React.useMemo(() => {
    const map = new Map<string, { storeName: string; items: typeof cartItems }>();
    cartItems.forEach((item) => {
      const sellerId = item.sellerId || item.product?.sellerId || 'seller_default';
      const storeName = item.product?.seller?.name || 'Verified Merchant';
      if (!map.has(sellerId)) {
        map.set(sellerId, { storeName, items: [] });
      }
      map.get(sellerId)!.items.push(item);
    });
    return Array.from(map.entries());
  }, [cartItems]);

  // Handle recovery link return
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('recover')) {
      showToast(
        'Shopping Bag Restored',
        'Welcome back! Your bag has been restored under MarketNest Escrow Protection.',
        'success'
      );
    }
  }, []);

  // Saved for Later items from wishlist
  const savedProducts = React.useMemo(() => {
    if (!wishlistIds || wishlistIds.length === 0) return [];
    return MOCK_PRODUCTS.filter((p) => wishlistIds.includes(p.id));
  }, [wishlistIds]);

  const handleSaveForLater = async (item: (typeof cartItems)[0]) => {
    removeFromCart(item.id);
    await toggleWishlist(item.productId);
    showToast('Saved for Later', `"${item.name}" moved to your saved items shelf.`, 'info');
  };

  const handleMoveSavedToCart = (p: Product) => {
    addToCart(p, 1);
    toggleWishlist(p.id);
    showToast('Moved to Cart', `"${p.title}" added to your cart.`, 'success');
  };

  if (cartItems.length === 0 && savedProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-full bg-[#F7F5F0] text-[#6B726E] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10 opacity-40" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
            Your cart is waiting for something great.
          </h1>
          <p className="text-sm text-[#6B726E] max-w-md mx-auto">
            Discover verified Nigerian designers, tech artisans, and creators across Lagos and nationwide.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo('shop')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  const freeDeliveryProgress = Math.min(100, Math.round((cartSubtotal / 50000) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7E5] pb-6">
        <div>
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B726E] hover:text-[#101413] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
            Shopping Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
          </h1>
        </div>

        {cartItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
            >
              Clear Entire Cart
            </button>
          </div>
        )}
      </div>

      {/* Free Delivery Bar with Real Visual Progress Bar */}
      {cartItems.length > 0 && (
        <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#0E8F5A] shrink-0" />
              <span className="text-[#101413]">
                {isEligibleForFreeDelivery ? (
                  <strong className="text-[#0E8F5A]">🎉 Complimentary Lagos Express Delivery unlocked!</strong>
                ) : (
                  <span>
                    Add <strong>{formatCurrency(amountNeededForFreeDelivery)}</strong> more for Complimentary Lagos Express Delivery.
                  </span>
                )}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#0E8F5A] hidden sm:inline tabular-nums">
              {freeDeliveryProgress}% of ₦50,000 threshold
            </span>
          </div>

          <div className="w-full bg-[#CBD5E1]/40 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0E8F5A] h-full transition-all duration-300 rounded-full"
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Multi-Seller Cart Items & Saved Items (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {cartItems.length > 0 ? (
            sellerGroups.map(([sellerId, group]) => (
              <div
                key={sellerId}
                className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs space-y-0"
              >
                {/* Seller Sub-Header */}
                <div className="bg-[#F7F5F0] border-b border-[#E4E7E5] px-5 py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#0E8F5A]" />
                    <span className="font-bold text-[#101413]">Fulfilled by {group.storeName}</span>
                  </div>
                  <span className="text-[#6B726E] text-[11px]">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#E4E7E5]">
                  {group.items.map((item) => {
                    const availableStock =
                      item.product?.stockCount !== undefined
                        ? item.product.stockCount
                        : item.product?.stock || 10;

                    return (
                      <div
                        key={item.id}
                        className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FBFBFA] transition-colors"
                      >
                        {/* Product Thumbnail & Details */}
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <img
                            src={
                              item.image ||
                              item.product?.images?.[0] ||
                              '/src/assets/images/editorial_made_in_nigeria_1791134154456.jpg'
                            }
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover border border-[#E4E7E5] bg-[#F7F5F0] shrink-0"
                          />
                          <div className="min-w-0 space-y-1 text-left">
                            <h3
                              onClick={() => navigateTo('product', { productId: item.productId })}
                              className="font-bold text-sm text-[#101413] hover:text-[#0E8F5A] transition-colors cursor-pointer truncate"
                            >
                              {item.name}
                            </h3>
                            {item.selectedVariant && (
                              <p className="text-[11px] text-[#6B726E]">
                                Option: <span className="font-semibold">{item.selectedVariant.name}</span>
                              </p>
                            )}
                            <p className="text-xs font-semibold text-[#101413] tabular-nums">
                              {formatCurrency(item.unitPrice)} each
                            </p>

                            {/* Low stock pill */}
                            {availableStock <= 5 && (
                              <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                Only {availableStock} left in stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stepper, Subtotal, and Delete Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E4E7E5]">
                          {/* Stepper */}
                          <div className="flex items-center border border-[#E4E7E5] rounded-md bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center text-xs font-bold tabular-nums text-[#101413]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= availableStock}
                              className="p-1.5 text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[90px]">
                            <span className="text-sm font-bold text-[#101413] tabular-nums">
                              {formatCurrency(item.lineTotal)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveForLater(item)}
                              className="p-1.5 text-[#6B726E] hover:text-[#0E8F5A] transition-colors cursor-pointer"
                              title="Save for Later"
                              aria-label="Save for later"
                            >
                              <Heart className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 text-[#6B726E] hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove Item"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#F7F5F0] rounded-xl p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-[#101413]">Your active shopping cart is currently empty.</p>
              <Button variant="primary" size="sm" onClick={() => navigateTo('shop')}>
                Browse Products
              </Button>
            </div>
          )}

          {/* SAVED FOR LATER SHELF (Conversion Recovery) */}
          {savedProducts.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#E4E7E5]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#101413] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#0E8F5A]" />
                  <span>Saved for Later ({savedProducts.length})</span>
                </h2>
                <span className="text-xs text-[#6B726E]">Items you want to purchase soon</span>
              </div>

              <div className="bg-white border border-[#E4E7E5] rounded-xl divide-y divide-[#E4E7E5]">
                {savedProducts.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.images?.[0]}
                        alt={p.title}
                        className="w-14 h-14 rounded-md object-cover bg-[#F7F5F0] border border-[#E4E7E5] shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <h4
                          onClick={() => navigateTo('product', { productId: p.id })}
                          className="font-bold text-xs sm:text-sm text-[#101413] hover:text-[#0E8F5A] cursor-pointer truncate"
                        >
                          {p.title}
                        </h4>
                        <p className="text-xs font-semibold text-[#0E8F5A] tabular-nums mt-0.5">
                          {formatCurrency(p.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(p.id)}
                        className="text-xs text-[#6B726E] hover:text-rose-600 px-2 py-1 cursor-pointer"
                      >
                        Remove
                      </button>
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={() => handleMoveSavedToCart(p)}
                      >
                        Move to Bag
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Order Summary (4 cols) */}
        {cartItems.length > 0 && (
          <aside className="lg:col-span-4 bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-6 lg:sticky lg:top-24 text-left">
            <h2 className="text-base font-bold text-[#101413] border-b border-[#E4E7E5] pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#6B726E]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#101413] tabular-nums">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-[#6B726E]">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-[#101413] tabular-nums">
                  {cartDeliveryFee === 0 ? (
                    <span className="text-[#0E8F5A] font-bold">FREE</span>
                  ) : (
                    formatCurrency(cartDeliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[#6B726E]">
                <span>Escrow Processing Protection</span>
                <span className="font-semibold text-[#0E8F5A]">Included</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-[#101413] pt-3 border-t border-[#E4E7E5]">
                <span>Total Amount</span>
                <span className="tabular-nums text-[#0E8F5A]">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {/* Escrow Guarantee Note */}
            <div className="bg-[#F7F5F0] rounded-xl p-3.5 border border-[#E4E7E5] flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#6B726E] leading-relaxed">
                <span className="font-bold text-[#101413]">MarketNest Escrow Guarantee</span>: Payment is held in secure escrow and released to verified sellers only after satisfactory inspection.
              </div>
            </div>

            {/* Checkout CTA */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigateTo('checkout')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Checkout
              </Button>

              <div className="space-y-1.5 pt-2 border-t border-[#E4E7E5] text-[11px] text-[#6B726E]">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0E8F5A]" />
                  <span>256-bit bank-grade encryption via Paystack</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8F5A]" />
                  <span>7-Day Return & Dispute Resolution Policy</span>
                </div>
              </div>

              {!isAuthenticated && (
                <p className="text-[11px] text-center text-[#6B726E]">
                  Guest checkout available. You can save your details after purchase.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
