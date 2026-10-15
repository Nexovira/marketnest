/**
 * @file src/pages/seller/StorefrontPage.tsx
 * Public merchant storefront view on MarketNest.
 * Displays store announcement ribbon, customized brand styling, spotlight products,
 * verified credentials, showroom location, WhatsApp direct chat, policies, and live catalog.
 */

import React, { useState, useEffect } from 'react';
import { useSeller } from '../../context/SellerContext';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';
import { getAffiliateProfile } from '../../services/affiliate/affiliateService';
import { AffiliateProfile } from '../../types';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/ui/Button';
import { RatingStars } from '../../components/ui/RatingStars';
import { formatNaira } from '../../components/ui/PriceDisplay';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Share2,
  Package,
  Layers,
  Search,
  ArrowLeft,
  Edit,
  ExternalLink,
  UserPlus,
  Check,
  MessageSquare,
  MessageCircle,
  Phone,
  Mail,
  Sparkles,
  Info,
  Calendar,
  ChevronDown,
  Award
} from 'lucide-react';
import { storeFollowService } from '../../services/storeFollowService';

export const StorefrontPage: React.FC = () => {
  const { sellerProfile, sellerProducts, isSeller, setActiveDashboardTab } = useSeller();
  const { navigateTo, showToast } = useMarket();
  const { firebaseUser } = useAuth();
  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    getAffiliateProfile(firebaseUser.uid).then((prof) => {
      if (prof && prof.status === 'active') {
        setAffiliateProfile(prof);
      }
    });
  }, [firebaseUser]);

  const storeId = sellerProfile?.userId || 'seller_1';
  const [isFollowing, setIsFollowing] = useState(() => storeFollowService.isFollowing(storeId));
  const [followersCount, setFollowersCount] = useState(52);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [activePolicyTab, setActivePolicyTab] = useState<'returns' | 'shipping' | 'warranty'>('returns');

  const custom = sellerProfile?.customization || {};
  const brandColor = custom.brandColor || '#0E8F5A';
  const announcement = custom.announcement;

  const handleToggleFollow = async () => {
    if (!firebaseUser) {
      showToast('Sign In Required', 'Please sign in to follow stores and receive catalog updates.', 'info');
      navigateTo('login');
      return;
    }
    const res = await storeFollowService.toggleFollow(firebaseUser.uid, storeId);
    setIsFollowing(res.isFollowing);
    setFollowersCount(res.count);
    showToast(
      res.isFollowing ? 'Store Followed' : 'Store Unfollowed',
      res.isFollowing
        ? `You are now following ${sellerProfile?.storeName || 'this store'} for new drops.`
        : `Unfollowed ${sellerProfile?.storeName || 'this store'}.`,
      res.isFollowing ? 'success' : 'info'
    );
  };

  const activeProducts = sellerProducts.filter((p) => p.status !== 'archived' && p.status !== 'draft');

  const filteredProducts = activeProducts.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) {
      return false;
    }
    if (search.trim()) {
      const match = (p.title || p.name || '').toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const categories = Array.from(new Set(activeProducts.map((p) => p.category)));

  // Spotlight curated products
  const featuredProductIds = custom.featuredProductIds || [];
  const spotlightProducts = activeProducts.filter((p) => featuredProductIds.includes(p.id));

  const handleShare = () => {
    let url = window.location.href;
    if (affiliateProfile?.code) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}ref=${affiliateProfile.code}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showToast('Affiliate Store Link Copied', `Referral link with code "${affiliateProfile.code}" copied.`, 'success');
        return;
      }
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Store Link Copied', 'Storefront URL copied to clipboard.', 'success');
    }
  };

  const whatsappNumber = custom.contact?.whatsapp || '';
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-24 text-[#101413]">
      {/* 1. TOP PROMOTIONAL ANNOUNCEMENT RIBBON */}
      {announcement?.enabled && announcement.text && (
        <div
          className="py-2.5 px-4 text-center text-xs font-bold text-white shadow-xs transition-colors"
          style={{ backgroundColor: announcement.bgColor || brandColor }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-90" />
            <span>{announcement.text}</span>
          </div>
        </div>
      )}

      {/* 2. FLOATING SELLER OWNER CONTROLS (Only visible to store owner) */}
      {isSeller && (
        <div className="bg-[#101413] text-white py-2.5 px-4 sticky top-18 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0E8F5A] animate-pulse" />
              <span>You are viewing your live public storefront preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveDashboardTab('store');
                  navigateTo('seller-dashboard');
                }}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-xs"
              >
                <Edit className="w-3 h-3" /> Storefront Builder
              </button>
              <button
                onClick={() => navigateTo('seller-dashboard')}
                className="px-3 py-1 rounded bg-[#0E8F5A] hover:bg-[#0c7a4d] transition-colors cursor-pointer font-bold text-xs"
              >
                Seller Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. STORE HERO BANNER & IDENTITY BAR */}
      <div className="bg-white border-b border-[#E4E7E5]">
        {/* Cover Banner Image */}
        <div className="h-52 sm:h-72 lg:h-88 w-full overflow-hidden relative bg-[#101413]">
          <img
            src={sellerProfile?.bannerUrl || '/src/assets/images/hero_marketplace_lifestyle_1791134143019.jpg'}
            alt=""
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Store Profile Identity Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-22 relative z-10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-end gap-4 sm:gap-6">
              <img
                src={
                  sellerProfile?.logoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={sellerProfile?.storeName || 'Store'}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
              />
              <div className="space-y-1.5 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101413] tracking-tight">
                    {sellerProfile?.storeName || 'Alara Atelier'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E8F5A] bg-[#E8F5EF] px-2.5 py-0.5 rounded-md border border-[#A7E2C9]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" /> Verified Merchant
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#6B726E] max-w-xl font-medium">
                  {sellerProfile?.tagline ||
                    'Artisanal Luxury & Contemporary Nigerian Craftsmanship, ready for nationwide dispatch.'}
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#6B726E] pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#0E8F5A]" />
                    {sellerProfile?.city || 'Victoria Island'}, {sellerProfile?.state || 'Lagos'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#0E8F5A]" />
                    Ships in {sellerProfile?.shipsWithinHours || 24}h
                  </span>
                  <span>·</span>
                  <RatingStars rating={sellerProfile?.rating || 4.9} reviewCount={sellerProfile?.reviewCount || 38} />
                </div>
              </div>
            </div>

            {/* Quick Actions (Follow, WhatsApp Chat, Message, Share) */}
            <div className="flex flex-wrap items-center gap-2.5">
              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                    `Hello ${sellerProfile?.storeName || 'Store'}, I am shopping your MarketNest catalog.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-xs cursor-pointer hover:opacity-95 transition-all"
                  style={{ backgroundColor: brandColor }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              <button
                onClick={handleToggleFollow}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isFollowing
                    ? 'bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9]'
                    : 'bg-[#101413] hover:bg-[#1B211F] text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Following ({followersCount})</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow Store ({followersCount})</span>
                  </>
                )}
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!firebaseUser) {
                    showToast('Sign In Required', 'Please sign in to message merchants.', 'info');
                    navigateTo('login');
                    return;
                  }
                  navigateTo('account', { tab: 'messages' });
                }}
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Message
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Share
              </Button>
            </div>
          </div>

          {/* About / Heritage Story */}
          {sellerProfile?.description && (
            <div className="mt-6 border-t border-[#E4E7E5] pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B726E] mb-1">
                Merchant Heritage & Workshop Story
              </h3>
              <p className="text-xs sm:text-sm text-[#101413] leading-relaxed max-w-4xl">
                {sellerProfile.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 4. CURATED SPOTLIGHT SECTION (If configured) */}
        {spotlightProducts.length > 0 && (
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0E8F5A]" />
                <h2 className="text-base font-bold text-[#101413]">
                  Storefront Spotlight & Featured Creations
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#0E8F5A]">
                Curated by Merchant
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {spotlightProducts.map((product) => (
                <ProductCard key={`spotlight_${product.id}`} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* 5. STORE POLICIES & SHOWROOM VERIFICATION TABS */}
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#101413]">
                MarketNest Buyer Protection & Store Policies
              </h3>
              <p className="text-xs text-[#6B726E]">
                All transactions through this storefront are held safely in escrow until you inspect and approve delivery.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#F7F5F0] p-1 rounded-lg border border-[#E4E7E5]">
              <button
                onClick={() => setActivePolicyTab('returns')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  activePolicyTab === 'returns'
                    ? 'bg-white text-[#101413] shadow-xs'
                    : 'text-[#6B726E] hover:text-[#101413]'
                }`}
              >
                Inspection & Returns
              </button>
              <button
                onClick={() => setActivePolicyTab('shipping')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  activePolicyTab === 'shipping'
                    ? 'bg-white text-[#101413] shadow-xs'
                    : 'text-[#6B726E] hover:text-[#101413]'
                }`}
              >
                Shipping Turnaround
              </button>
              <button
                onClick={() => setActivePolicyTab('warranty')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  activePolicyTab === 'warranty'
                    ? 'bg-white text-[#101413] shadow-xs'
                    : 'text-[#6B726E] hover:text-[#101413]'
                }`}
              >
                Authenticity Guarantee
              </button>
            </div>
          </div>

          <div className="text-xs text-[#101413] leading-relaxed bg-[#F7F5F0] rounded-xl p-4 border border-[#E4E7E5]">
            {activePolicyTab === 'returns' && (
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#101413]">7-Day Buyer Inspection Window</span>
                  <p className="text-[#6B726E]">
                    {custom.policies?.returns ||
                      '7-day inspection return window for unwashed, tag-intact items under MarketNest Buyer Protection Escrow. If the item differs from its description, returns are cost-free.'}
                  </p>
                </div>
              </div>
            )}

            {activePolicyTab === 'shipping' && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#0E8F5A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#101413]">Express Dispatch Standards</span>
                  <p className="text-[#6B726E]">
                    {custom.policies?.shipping ||
                      'Same-day Lagos dispatch for orders placed before 1:00 PM. Nationwide delivery via GIG Logistics within 48-72 hours with end-to-end SMS & WhatsApp tracking.'}
                  </p>
                </div>
              </div>
            )}

            {activePolicyTab === 'warranty' && (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-[#0E8F5A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#101413]">100% Genuine Craftsmanship Guarantee</span>
                  <p className="text-[#6B726E]">
                    {custom.policies?.warranty ||
                      'All items sold by verified merchants are guaranteed authentic. In the rare event of a defect, full funds are refunded immediately via Paystack.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Showroom & Contact Row */}
          {(custom.contact?.address || custom.contact?.phone || custom.contact?.email) && (
            <div className="pt-2 border-t border-[#E4E7E5] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#6B726E]">
              {custom.contact?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0E8F5A] shrink-0" />
                  <span className="truncate">{custom.contact.address}</span>
                </div>
              )}
              {custom.contact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0E8F5A] shrink-0" />
                  <span>{custom.contact.phone}</span>
                </div>
              )}
              {custom.contact?.hours && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0E8F5A] shrink-0" />
                  <span>{custom.contact.hours}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. FULL CATALOG WITH SEARCH & CATEGORY FILTERS */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[#101413] text-white'
                    : 'bg-[#F7F5F0] text-[#6B726E] hover:text-[#101413]'
                }`}
              >
                All Listings ({activeProducts.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap capitalize transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#101413] text-white'
                      : 'bg-[#F7F5F0] text-[#6B726E] hover:text-[#101413]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search within Store */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search this store's catalog..."
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#101413] placeholder-[#6B726E] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
              />
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-[#6B726E] mx-auto opacity-30" />
              <h3 className="text-base font-semibold text-[#101413]">No listings match criteria</h3>
              <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
                Try selecting another category or clearing your search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
