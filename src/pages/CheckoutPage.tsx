/**
 * @file src/pages/CheckoutPage.tsx
 * Production multi-step unified checkout experience for MarketNest.
 * Supports guest checkout, saved customer addresses, multi-seller item breakdown,
 * authoritative price checks, atomic inventory reservation, and Phase 5 Paystack readiness.
 */

import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../services/currencyService';
import { createMarketplaceOrder, validateCartItems } from '../services/orderService';
import { getUserAddresses, createAddress } from '../lib/firestore';
import { calculateDelivery } from '../services/deliveryService';
import {
  initializePaymentSession,
  launchPaystackCheckout,
  fetchPaymentConfig
} from '../services/payments/paymentService';
import { getStoredReferral } from '../services/affiliate/affiliateAttributionService';
import { Address, CartItem, OrderContactInformation } from '../types';
import { Button } from '../components/ui/Button';
import {
  ShieldCheck,
  Truck,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Store,
  User,
  Phone,
  Mail,
  Lock,
  Plus
} from 'lucide-react';

const NIGERIAN_STATES = [
  'Lagos',
  'Abuja FCT',
  'Rivers',
  'Oyo',
  'Enugu',
  'Delta',
  'Anambra',
  'Ogun',
  'Kano',
  'Kaduna',
  'Edo'
];

export const CheckoutPage: React.FC = () => {
  const {
    cartItems,
    clearCart,
    setLastCreatedOrder,
    navigateTo,
    showToast
  } = useMarket();
  const { firebaseUser, profile, isAuthenticated } = useAuth();

  // Contact Information
  const [fullName, setFullName] = useState(profile?.name || firebaseUser?.displayName || '');
  const [email, setEmail] = useState(profile?.email || firebaseUser?.email || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '+234 ');

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(true);

  // New Address Fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Lekki');
  const [state, setState] = useState('Lagos');
  const [postalCode, setPostalCode] = useState('');

  // Delivery Speed
  const [deliverySpeed, setDeliverySpeed] = useState<'lagos_sameday' | 'lagos_24h' | 'express_48h'>('lagos_24h');

  // Checkout process state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [idempotencyKey] = useState<string>(() => `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  // Load customer saved addresses
  useEffect(() => {
    if (firebaseUser) {
      getUserAddresses(firebaseUser.uid)
        .then((addrs) => {
          if (addrs && addrs.length > 0) {
            setSavedAddresses(addrs);
            const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
            setSelectedAddressId(defaultAddr.id);
            setIsAddingNewAddress(false);
            setStreet(defaultAddr.street);
            setCity(defaultAddr.city);
            setState(defaultAddr.state);
          }
        })
        .catch((e) => console.warn('Could not load saved addresses:', e));
    }
  }, [firebaseUser]);

  // Recalculate delivery and totals based on destination state
  const currentState = isAddingNewAddress
    ? state
    : savedAddresses.find((a) => a.id === selectedAddressId)?.state || 'Lagos';

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const deliveryCalc = calculateDelivery({
    items: cartItems,
    destinationState: currentState,
    speed: deliverySpeed
  });
  const deliveryFee = deliveryCalc.deliveryFee;
  const grandTotal = cartSubtotal + deliveryFee;

  // Group items by seller
  const sellerGroups = React.useMemo(() => {
    const map = new Map<string, { storeName: string; items: CartItem[] }>();
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

  const handleAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setIsAddingNewAddress(true);
    } else {
      setIsAddingNewAddress(false);
      const chosen = savedAddresses.find((a) => a.id === addrId);
      if (chosen) {
        setStreet(chosen.street);
        setCity(chosen.city);
        setState(chosen.state);
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (cartItems.length === 0) {
      showToast('Cart is Empty', 'Please add products before checking out.', 'warning');
      navigateTo('shop');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setValidationError('Please provide complete contact information (Full Name, Email, and Phone).');
      return;
    }

    if (!street.trim() || !city.trim()) {
      setValidationError('Please provide a complete street delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Pre-validate stock and authoritative prices
      const validation = await validateCartItems(cartItems, currentState);
      if (!validation.isValid) {
        const msg = validation.issues.map((i) => i.message).join(' ');
        setValidationError(msg);
        showToast('Cart Updated', 'Some items or prices in your cart changed. Please review.', 'warning');
        setIsSubmitting(false);
        return;
      }

      // 2. Prepare shipping address payload
      const shippingAddress: Address = {
        id: selectedAddressId !== 'new' ? selectedAddressId : `addr_${Date.now()}`,
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: currentState,
        country: 'Nigeria',
        postalCode: postalCode.trim() || undefined
      };

      // If authenticated and added new address, save for next time
      if (firebaseUser && isAddingNewAddress) {
        createAddress(firebaseUser.uid, shippingAddress).catch((err) =>
          console.warn('Could not auto-save address:', err)
        );
      }

      const contactInfo: OrderContactInformation = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim()
      };

      // 3. Authoritative Server-Side Paystack Session Initialization with Affiliate Attribution
      const activeReferral = getStoredReferral();
      const initResult = await initializePaymentSession({
        customerId: firebaseUser?.uid,
        contactInformation: contactInfo,
        shippingAddress,
        cartItems: validation.validatedItems,
        deliverySpeed,
        affiliateReferral: activeReferral
          ? {
              code: activeReferral.code,
              linkId: activeReferral.linkId,
              campaignId: activeReferral.campaignId
            }
          : undefined
      });

      // 4. Fetch gateway configuration
      const config = await fetchPaymentConfig();

      // 5. Launch Paystack Checkout (Inline modal or secure redirect fallback)
      await launchPaystackCheckout({
        publicKey: config.publicKey,
        email: contactInfo.email,
        amountInKobo: Math.round(initResult.amount * 100),
        reference: initResult.reference,
        authorizationUrl: initResult.authorization_url,
        onSuccess: (ref) => {
          navigateTo('payment-callback', { search: ref });
        },
        onClose: () => {
          setIsSubmitting(false);
          showToast('Payment Window Closed', 'You can resume payment whenever you are ready.', 'info');
        }
      });
    } catch (err: any) {
      console.error('Order/Payment creation failed:', err);
      setValidationError(err.message || 'We could not initiate secure payment. Please try again.');
      showToast('Checkout Error', err.message || 'Payment initiation failed.', 'error');
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#101413]">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-[#6B726E]">
          You have no items in your cart to checkout.
        </p>
        <Button variant="primary" size="md" onClick={() => navigateTo('shop')}>
          Return to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('cart')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B726E] hover:text-[#101413] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Cart</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight mt-2">
          Secure Checkout
        </h1>
        <p className="text-xs text-[#6B726E] mt-0.5">
          Single unified checkout across {sellerGroups.length} independent verified {sellerGroups.length === 1 ? 'store' : 'stores'}.
        </p>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-start gap-3 text-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Checkout Notice:</span>
            <p className="mt-0.5 leading-relaxed">{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: Contact Information */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#101413] text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#101413]">Contact Information</h2>
              </div>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => navigateTo('login', { redirect: 'checkout' })}
                  className="text-xs font-semibold text-[#0E8F5A] hover:underline cursor-pointer"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-full-name" className="font-semibold text-[#101413] block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="checkout-full-name"
                    type="text"
                    required
                    aria-required="true"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Babatunde Adeyemi"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white focus:ring-1 focus:ring-[#0E8F5A]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-email" className="font-semibold text-[#101413] block mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    aria-required="true"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white focus:ring-1 focus:ring-[#0E8F5A]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-phone" className="font-semibold text-[#101413] block mb-1">
                  Nigerian Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    aria-required="true"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white focus:ring-1 focus:ring-[#0E8F5A]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Delivery Address */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#101413] text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h2 className="text-sm font-bold text-[#101413]">Delivery Address in Nigeria</h2>
              </div>
            </div>

            {/* Saved Addresses Selector (if authenticated) */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#101413] block">Saved Addresses</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedAddressId === addr.id
                          ? 'border-[#0E8F5A] bg-[#E8F5EF]/40 ring-1 ring-[#0E8F5A]'
                          : 'border-[#E4E7E5] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#101413]">{addr.fullName || 'Address'}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold uppercase text-[#0E8F5A] bg-[#E8F5EF] px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B726E] mt-1">{addr.street}</p>
                      <p className="text-[11px] text-[#6B726E]">
                        {addr.city}, {addr.state}
                      </p>
                    </div>
                  ))}

                  <div
                    onClick={() => handleAddressSelect('new')}
                    className={`p-3.5 rounded-xl border border-dashed transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold ${
                      selectedAddressId === 'new'
                        ? 'border-[#0E8F5A] text-[#0E8F5A] bg-[#E8F5EF]/40'
                        : 'border-[#E4E7E5] text-[#6B726E] hover:text-[#101413]'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enter Different Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Input Fields */}
            {isAddingNewAddress && (
              <div className="space-y-3 text-xs pt-2">
                <div>
                  <label htmlFor="checkout-street" className="font-semibold text-[#101413] block mb-1">
                    Street Address & Apartment / Landmark <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-street"
                    type="text"
                    required
                    aria-required="true"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white focus:ring-1 focus:ring-[#0E8F5A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="checkout-city" className="font-semibold text-[#101413] block mb-1">
                      City / Area <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      aria-required="true"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lekki, Ikeja, Victoria Island"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white focus:ring-1 focus:ring-[#0E8F5A]"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-state" className="font-semibold text-[#101413] block mb-1">
                      State in Nigeria <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="checkout-state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white focus:ring-1 focus:ring-[#0E8F5A]"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Multi-Seller Dispatch Review */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#101413] text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h2 className="text-sm font-bold text-[#101413]">Delivery Speed & Vendor Parcels</h2>
              </div>
              <span className="text-xs text-[#0E8F5A] font-semibold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Dispatch Guaranteed
              </span>
            </div>

            {/* Delivery Speed options */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliverySpeed('lagos_24h')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    deliverySpeed === 'lagos_24h'
                      ? 'border-[#0E8F5A] bg-[#E8F5EF]/40 ring-1 ring-[#0E8F5A]'
                      : 'border-[#E4E7E5] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[#101413]">
                    <span>Standard Express Dispatch</span>
                    <span className="text-[#0E8F5A]">24 Hours</span>
                  </div>
                  <p className="text-[11px] text-[#6B726E] mt-1">
                    Vetted dispatch riders across Lagos and major commercial hubs.
                  </p>
                </div>

                <div
                  onClick={() => setDeliverySpeed('lagos_sameday')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    deliverySpeed === 'lagos_sameday'
                      ? 'border-[#0E8F5A] bg-[#E8F5EF]/40 ring-1 ring-[#0E8F5A]'
                      : 'border-[#E4E7E5] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[#101413]">
                    <span>Lagos Same-Day Rush</span>
                    <span className="text-[#0E8F5A]">Today by 6 PM</span>
                  </div>
                  <p className="text-[11px] text-[#6B726E] mt-1">
                    Direct dispatch for orders placed before 1:00 PM in Lagos.
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Parcels Overview */}
            <div className="pt-2 space-y-3">
              <span className="text-xs font-semibold text-[#6B726E] block">
                Items grouped by merchant for consolidated fulfillment:
              </span>
              <div className="space-y-2">
                {sellerGroups.map(([sellerId, group]) => (
                  <div key={sellerId} className="bg-[#F7F5F0] rounded-xl p-3.5 border border-[#E4E7E5] text-xs">
                    <div className="flex items-center justify-between font-bold text-[#101413] mb-2">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#0E8F5A]" />
                        Parcel from {group.storeName}
                      </span>
                      <span className="text-[#6B726E] font-normal text-[11px]">
                        {group.items.length} items
                      </span>
                    </div>

                    <div className="divide-y divide-[#E4E7E5]/70">
                      {group.items.map((item) => (
                        <div key={item.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.image}
                              alt=""
                              className="w-8 h-8 rounded object-cover border border-[#E4E7E5]"
                            />
                            <div>
                              <p className="font-semibold text-[#101413] truncate max-w-[200px]">{item.name}</p>
                              <p className="text-[10px] text-[#6B726E]">
                                Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold tabular-nums text-[#101413]">
                            {formatCurrency(item.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 4: Paystack Payment Gateway & Escrow */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#101413] text-white flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <h2 className="text-sm font-bold text-[#101413]">Payment Method & Escrow</h2>
              </div>
              <span className="text-[11px] font-bold text-[#0E8F5A] bg-[#E8F5EF] px-2.5 py-0.5 rounded border border-[#A7E2C9]">
                Paystack Gateway (Live / Test)
              </span>
            </div>

            <div className="bg-[#F7F5F0] rounded-xl p-4 border border-[#E4E7E5] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#101413] font-bold">
                  <CreditCard className="w-4 h-4 text-[#0E8F5A]" />
                  <span>Secure Paystack Checkout</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6B726E]">
                  <span>Cards</span>
                  <span>·</span>
                  <span>Bank Transfer</span>
                  <span>·</span>
                  <span>USSD</span>
                </div>
              </div>
              <p className="text-[#6B726E] text-[11px] leading-relaxed">
                Clicking the payment button below connects you to the Paystack gateway. All payments are verified server-side with bank-grade encryption and held in <strong>MarketNest Escrow</strong> until order delivery is confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary & Final Submit (5 cols) */}
        <aside className="lg:col-span-5 bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-6 lg:sticky lg:top-24">
          <h2 className="text-base font-bold text-[#101413] border-b border-[#E4E7E5] pb-3">
            Order Review
          </h2>

          {/* Cost breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#6B726E]">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#101413] tabular-nums">
                {formatCurrency(cartSubtotal)}
              </span>
            </div>

            <div className="flex justify-between text-[#6B726E]">
              <span>Consolidated Shipping ({deliveryCalc.distinctSellerCount} {deliveryCalc.distinctSellerCount === 1 ? 'store' : 'stores'})</span>
              <span className="font-semibold text-[#101413] tabular-nums">
                {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
              </span>
            </div>

            <div className="flex justify-between text-[#6B726E]">
              <span>Discount</span>
              <span className="font-semibold text-[#101413] tabular-nums">₦0</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-[#101413] pt-3 border-t border-[#E4E7E5]">
              <span>Grand Total</span>
              <span className="tabular-nums text-[#0E8F5A]">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Escrow Guarantee Callout */}
          <div className="bg-[#E8F5EF] rounded-xl p-4 border border-[#A7E2C9] text-xs space-y-1.5">
            <span className="font-bold text-[#0E8F5A] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> MarketNest Escrow Protection
            </span>
            <p className="text-[11px] text-[#6B726E] leading-relaxed">
              Your funds are held securely until the goods are delivered and confirmed. Verified independent Nigerian sellers only receive payout once you are satisfied.
            </p>
          </div>

          {/* Submit Button with Anti-Duplication Locking */}
          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Preparing secure payment...' : `Pay ${formatCurrency(grandTotal)}`}
            </Button>

            <p className="text-[11px] text-center text-[#6B726E] flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              <span>256-bit encrypted checkout · Idempotency protected</span>
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
};
