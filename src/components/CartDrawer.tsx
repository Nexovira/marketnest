/**
 * @file src/components/CartDrawer.tsx
 * High-touch slide-over cart drawer with live subtotal and free delivery progress.
 */

import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { formatNaira } from './ui/PriceDisplay';
import { Button } from './ui/Button';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    cartSubtotal,
    cartItemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    freeDeliveryThreshold,
    isEligibleForFreeDelivery,
    amountNeededForFreeDelivery,
    navigateTo,
    showToast
  } = useMarket();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  if (!isCartOpen) return null;

  const deliveryFee = isEligibleForFreeDelivery || cartItems.length === 0 ? 0 : 2500;
  const grandTotal = cartSubtotal + deliveryFee;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  const handleSimulateCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      clearCart();
      showToast('Order Placed Successfully', 'Your escrow-protected order MN-2026-9214 has been recorded.', 'success');
    }, 1200);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setCheckoutComplete(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="cart-heading" role="dialog" aria-modal="true">
      {/* Dimmed backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-[#101413]/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFFFF] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#101413]" />
              <h2 id="cart-heading" className="text-base font-bold text-[#101413]">
                Shopping Bag
              </h2>
              <span className="text-xs text-[#6B726E] tabular-nums">
                ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
              </span>
            </div>

            <button
              onClick={handleClose}
              className="p-1 rounded-md text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout Completed Confirmation Screen */}
          {checkoutComplete ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#101413]">Order Confirmed</h3>
              <p className="text-xs text-[#0E8F5A] font-semibold mt-1 uppercase tracking-wider">
                Order Reference: MN-2026-9214
              </p>
              <p className="text-sm text-[#6B726E] mt-3 max-w-xs leading-relaxed">
                Thank you for supporting verified Nigerian merchants. Your payment is held in MarketNest Escrow and will only be disbursed after you confirm delivery.
              </p>
              <div className="mt-6 w-full">
                <Button
                  variant="dark"
                  fullWidth
                  onClick={() => {
                    handleClose();
                    navigateTo('shop');
                  }}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Free Delivery Tracker */}
              {cartItems.length > 0 && (
                <div className="bg-[#F7F5F0] p-3.5 border-b border-[#E4E7E5] text-xs">
                  {isEligibleForFreeDelivery ? (
                    <div className="flex items-center gap-1.5 text-[#0E8F5A] font-medium">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>You have unlocked complimentary Lagos Express Delivery!</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#101413] font-medium">
                        Add <span className="tabular-nums font-bold text-[#0E8F5A]">{formatNaira(amountNeededForFreeDelivery)}</span> more for free Lagos express delivery.
                      </p>
                      <div className="w-full bg-[#E4E7E5] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-[#0E8F5A] h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E4E7E5]">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#6B726E] mb-3">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-[#101413]">Your bag is empty</h3>
                    <p className="text-xs text-[#6B726E] mt-1 max-w-xs">
                      Discover curated finds from verified Nigerian fashion, tech, and lifestyle stores.
                    </p>
                    <div className="mt-5">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          handleClose();
                          navigateTo('shop');
                        }}
                      >
                        Explore Marketplace
                      </Button>
                    </div>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                      {/* Item Image */}
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="w-18 h-18 rounded object-cover bg-[#F7F5F0] border border-[#E4E7E5] shrink-0"
                      />

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4
                              onClick={() => {
                                handleClose();
                                navigateTo('product', { productId: item.product.id });
                              }}
                              className="text-sm font-semibold text-[#101413] hover:text-[#0E8F5A] transition-colors truncate cursor-pointer"
                            >
                              {item.product.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#6B726E] hover:text-rose-600 p-0.5 rounded cursor-pointer transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-xs text-[#6B726E] mt-0.5 truncate">
                            Sold by {item.product.seller.name}
                          </p>
                          {item.selectedVariant && (
                            <p className="text-[11px] text-[#0E8F5A] font-medium mt-0.5">
                              {item.selectedVariant.name}
                            </p>
                          )}
                        </div>

                        {/* Stepper & Line Total */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center border border-[#E4E7E5] rounded bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#6B726E] hover:text-[#101413] cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-semibold tabular-nums text-[#101413]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#6B726E] hover:text-[#101413] cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-[#101413] tabular-nums">
                            {formatNaira(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-[#E4E7E5] bg-[#FFFFFF] space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#6B726E]">
                      <span>Subtotal</span>
                      <span className="tabular-nums font-medium text-[#101413]">
                        {formatNaira(cartSubtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#6B726E]">
                      <span>Estimated Delivery</span>
                      <span className="tabular-nums font-medium text-[#101413]">
                        {deliveryFee === 0 ? (
                          <span className="text-[#0E8F5A] font-semibold">Complimentary</span>
                        ) : (
                          formatNaira(deliveryFee)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-[#101413] pt-2 border-t border-[#E4E7E5]">
                      <span>Total</span>
                      <span className="tabular-nums text-base">{formatNaira(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Trust Banner */}
                  <div className="flex items-center gap-2 p-2 rounded bg-[#E8F5EF] text-[11px] text-[#101413]">
                    <ShieldCheck className="w-4 h-4 text-[#0E8F5A] shrink-0" />
                    <span>MarketNest Escrow: Sellers are paid only after you inspect delivery.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigateTo('cart');
                      }}
                    >
                      View Cart
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigateTo('checkout');
                      }}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
