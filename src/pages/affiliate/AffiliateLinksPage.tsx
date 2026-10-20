/**
 * @file src/pages/affiliate/AffiliateLinksPage.tsx
 * Referral Link Generator and Management Suite for MarketNest Affiliates.
 * Generates tracked deep links to Products, Stores, Categories, Campaigns, and Homepage.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import {
  getAffiliateProfile,
  getAffiliateLinks,
  createAffiliateLink,
  toggleAffiliateLinkStatus,
  getActiveAffiliateCampaigns
} from '../../services/affiliate/affiliateService';
import { productService } from '../../services/productService';
import {
  AffiliateProfile,
  AffiliateLink,
  AffiliateLinkTargetType,
  AffiliateCampaign,
  Product,
  Store as StoreType
} from '../../types';
import { formatCurrency } from '../../services/currencyService';
import { AffiliateNav } from './AffiliateNav';
import { Button } from '../../components/ui/Button';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  ShoppingBag,
  Store,
  Layers,
  Sparkles,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

const CATEGORY_CHOICES = [
  { id: 'fashion', name: 'Fashion & Apparel', path: '/shop?category=fashion' },
  { id: 'home', name: 'Handcrafted Decor & Living', path: '/shop?category=home' },
  { id: 'jewelry', name: 'Fine Jewelry & Beads', path: '/shop?category=jewelry' },
  { id: 'art', name: 'Contemporary Art & Sculptures', path: '/shop?category=art' },
  { id: 'beauty', name: 'Artisanal Beauty & Oils', path: '/shop?category=beauty' },
  { id: 'food', name: 'Gourmet Treats & Spices', path: '/shop?category=food' }
];

export const AffiliateLinksPage: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { showToast, navigateTo } = useMarket();

  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [campaigns, setCampaigns] = useState<AffiliateCampaign[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableStores, setAvailableStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);

  // Link Generator Modal / Drawer State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetType, setTargetType] = useState<AffiliateLinkTargetType>('product');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [creating, setCreating] = useState(false);

  // Copy Feedback map
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      productService.getPublicProducts(),
      productService.getStores()
    ]).then(([prods, stores]) => {
      if (active) {
        setAvailableProducts(prods);
        setAvailableStores(stores);
        if (prods.length > 0 && !selectedTargetId) {
          setSelectedTargetId(prods[0].id);
        }
      }
    }).catch(() => {});

    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      try {
        const [prof, userLinks, camps] = await Promise.all([
          getAffiliateProfile(firebaseUser.uid),
          getAffiliateLinks(firebaseUser.uid),
          getActiveAffiliateCampaigns()
        ]);
        if (active) {
          setProfile(prof);
          setLinks(userLinks);
          setCampaigns(camps);
        }
      } catch (err) {
        console.warn('Error loading links:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAll();
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  const handleCopy = (link: AffiliateLink) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    showToast('Link Copied', `Referral link for "${link.targetName}" copied to clipboard.`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (link: AffiliateLink) => {
    try {
      const nextActive = !link.active;
      await toggleAffiliateLinkStatus(link.id, nextActive);
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, active: nextActive } : l))
      );
      showToast('Link Updated', `Link status is now ${nextActive ? 'Active' : 'Deactivated'}.`, 'info');
    } catch {
      showToast('Error', 'Unable to toggle link status.', 'error');
    }
  };

  const handleCreateNewLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setCreating(true);
    try {
      let targetName = customName.trim();
      let targetUrl = '/';
      let campaignId: string | undefined = undefined;

      if (targetType === 'product') {
        const p = availableProducts.find((prod) => prod.id === selectedTargetId);
        targetName = targetName || p?.title || p?.name || 'Product Referral';
        targetUrl = `/product/${selectedTargetId}`;
      } else if (targetType === 'store') {
        const s = availableStores.find((st) => st.id === selectedTargetId);
        targetName = targetName || s?.name || 'Storefront Referral';
        targetUrl = `/stores/${selectedTargetId}`;
      } else if (targetType === 'category') {
        const c = CATEGORY_CHOICES.find((cat) => cat.id === selectedTargetId);
        targetName = targetName || c?.name || 'Category Showcase';
        targetUrl = c?.path || '/shop';
      } else if (targetType === 'campaign') {
        const cmp = campaigns.find((c) => c.id === selectedTargetId);
        targetName = targetName || cmp?.name || 'Seasonal Campaign';
        targetUrl = `/deals?campaign=${selectedTargetId}`;
        campaignId = selectedTargetId;
      } else {
        targetName = targetName || 'MarketNest Marketplace Homepage';
        targetUrl = '/';
      }

      const created = await createAffiliateLink(profile.userId, profile.code, {
        targetType,
        targetId: selectedTargetId || 'home',
        targetName,
        targetUrl,
        campaignId
      });

      setLinks((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setCustomName('');
      showToast('Link Created', `Generated tracked link for "${created.targetName}".`, 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to create link.', 'error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6B726E]">Loading referral links...</p>
      </div>
    );
  }

  if (!profile || profile.status !== 'active') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 animate-in fade-in">
        <h2 className="text-xl font-bold text-[#101413]">Partner Access Required</h2>
        <p className="text-xs text-[#6B726E]">
          You need an approved affiliate partner profile to manage tracked referral links.
        </p>
        <Button variant="primary" size="md" onClick={() => navigateTo('affiliate-apply')}>
          Apply for Partner Access
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-20 animate-in fade-in">
      <AffiliateNav profile={profile} activeTab="links" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Referral Links</h2>
            <p className="text-xs text-[#6B726E]">
              Create and manage tracked URLs with 30-day Last-Click attribution.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Referral Link
          </Button>
        </div>

        {/* Links Table */}
        <div className="bg-white border border-[#E4E7E5] rounded-2xl shadow-xs overflow-hidden">
          {links.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Link2 className="w-10 h-10 text-[#6B726E] mx-auto opacity-30" />
              <p className="text-sm font-bold text-[#101413]">No custom referral links yet</p>
              <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
                Generate targeted links to individual luxury products, boutique storefronts, or categories.
              </p>
              <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                Generate First Link
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#101413]">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Destination & Target</th>
                    <th className="py-3.5 px-4">Target Type</th>
                    <th className="py-3.5 px-4 text-center">Clicks</th>
                    <th className="py-3.5 px-4 text-center">Conversions</th>
                    <th className="py-3.5 px-4 text-right">Earned</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {links.map((link) => {
                    const isCopied = copiedId === link.id;

                    return (
                      <tr key={link.id} className="hover:bg-[#FBFBFA] transition-colors">
                        <td className="py-4 px-4 max-w-xs">
                          <p className="font-bold text-[#101413] truncate">{link.targetName}</p>
                          <p className="text-[11px] font-mono text-[#0E8F5A] truncate mt-0.5" title={link.url}>
                            {link.url}
                          </p>
                        </td>

                        <td className="py-4 px-4 capitalize">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7F5F0] border border-[#E4E7E5] text-[#101413]">
                            {link.targetType === 'product' && <ShoppingBag className="w-3 h-3 text-[#0E8F5A]" />}
                            {link.targetType === 'store' && <Store className="w-3 h-3 text-[#0E8F5A]" />}
                            {link.targetType === 'category' && <Layers className="w-3 h-3 text-[#0E8F5A]" />}
                            {link.targetType === 'campaign' && <Sparkles className="w-3 h-3 text-[#0E8F5A]" />}
                            {link.targetType === 'homepage' && <Home className="w-3 h-3 text-[#0E8F5A]" />}
                            {link.targetType}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center font-mono font-semibold">
                          {(link.clicksCount || 0).toLocaleString()}
                        </td>

                        <td className="py-4 px-4 text-center font-mono font-semibold">
                          {(link.conversionsCount || 0).toLocaleString()}
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-bold text-[#0E8F5A]">
                          {formatCurrency(link.earningsAmount || 0)}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(link)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              link.active
                                ? 'bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9]'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {link.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{link.active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopy(link)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#101413] text-white text-[11px] font-semibold hover:bg-[#1B211F] transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-[#0E8F5A]" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                            </button>

                            <a
                              href={link.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-[#6B726E] hover:text-[#101413] rounded-lg hover:bg-[#F7F5F0] transition-colors"
                              title="Visit destination"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4E7E5] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#0E8F5A] uppercase tracking-wider">Generator</span>
                <h3 className="text-lg font-black text-[#101413]">Create Referral Deep Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#6B726E] hover:text-[#101413] text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewLink} className="space-y-4 text-xs">
              {/* Target Type Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#101413]">Destination Target Type *</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(
                    [
                      { id: 'product', label: 'Product' },
                      { id: 'store', label: 'Store' },
                      { id: 'category', label: 'Category' },
                      { id: 'campaign', label: 'Campaign' },
                      { id: 'homepage', label: 'Homepage' }
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTargetType(t.id);
                        if (t.id === 'product') setSelectedTargetId(availableProducts[0]?.id || '');
                        if (t.id === 'store') setSelectedTargetId(availableStores[0]?.id || '');
                        if (t.id === 'category') setSelectedTargetId(CATEGORY_CHOICES[0]?.id || '');
                        if (t.id === 'campaign') setSelectedTargetId(campaigns[0]?.id || '');
                      }}
                      className={`py-2 px-1 text-center rounded-lg font-semibold border transition-colors cursor-pointer ${
                        targetType === t.id
                          ? 'bg-[#101413] text-white border-[#101413]'
                          : 'bg-[#F7F5F0] border-[#E4E7E5] text-[#6B726E] hover:text-[#101413]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Target Picker */}
              {targetType === 'product' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#101413]">Select Product *</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg p-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] cursor-pointer"
                  >
                    {availableProducts.length === 0 ? (
                      <option value="">No published products available</option>
                    ) : (
                      availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title || p.name} — {formatCurrency(p.price)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {targetType === 'store' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#101413]">Select Storefront *</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg p-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] cursor-pointer"
                  >
                    {availableStores.length === 0 ? (
                      <option value="">No merchant stores available</option>
                    ) : (
                      availableStores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.city}, {s.state})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {targetType === 'category' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#101413]">Select Category *</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg p-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] cursor-pointer"
                  >
                    {CATEGORY_CHOICES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'campaign' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#101413]">Select Seasonal Campaign *</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg p-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] cursor-pointer"
                  >
                    {campaigns.map((cmp) => (
                      <option key={cmp.id} value={cmp.id}>
                        {cmp.name} (+{(cmp.commissionRate * 100).toFixed(0)}% Bonus Rate)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Label */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#101413]">Custom Campaign / Link Label (Optional)</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Instagram Bio Fall Collection"
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg p-2.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E4E7E5]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={creating}
                >
                  {creating ? 'Generating Link...' : 'Create Referral Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
