/**
 * @file src/pages/seller/dashboard/SellerGrowthTab.tsx
 * MarketNest Seller Growth Center.
 * Delivers data-driven recommendations, inventory restocking alerts,
 * catalogue media scoring, and seller activation milestone progress.
 */

import React, { useState, useEffect } from 'react';
import { useSeller } from '../../../context/SellerContext';
import { useMarket } from '../../../context/MarketContext';
import { SellerGrowthInsight } from '../../../types';
import { formatCurrency } from '../../../utils/money';
import { Button } from '../../../components/ui/Button';
import { SellerAiAssistantModal } from '../../../components/seller/SellerAiAssistantModal';
import {
  TrendingUp,
  Sparkles,
  Camera,
  AlertTriangle,
  FileText,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Zap,
  ShoppingBag,
  ExternalLink,
  Award,
  Wand2
} from 'lucide-react';

export const SellerGrowthTab: React.FC = () => {
  const { sellerProfile, sellerProducts, sellerOrders, setActiveEditProductId, editProduct } = useSeller();
  const { navigateTo, showToast } = useMarket();

  const [insights, setInsights] = useState<SellerGrowthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [completenessScore, setCompletenessScore] = useState(88);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiProduct, setAiProduct] = useState<any>(null);

  const sellerId = sellerProfile?.id || 'store_alara';

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/growth-insights/${sellerId}`);
      if (res.ok) {
        const json = await res.json();
        setInsights(json.data || []);
        if (json.profileCompleteness) {
          setCompletenessScore(json.profileCompleteness);
        }
      } else {
        generateLocalInsights();
      }
    } catch {
      generateLocalInsights();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalInsights = () => {
    const list: SellerGrowthInsight[] = [];

    // Check images
    const lowImages = sellerProducts.filter((p) => !p.images || p.images.length < 3);
    if (lowImages.length > 0) {
      list.push({
        id: 'ins_photo_local',
        type: 'photography',
        title: 'Add Multiple Studio Angles',
        description: `${lowImages.length} of your listings have fewer than 3 high-resolution images. High-intent shoppers convert 38% faster with 360° details.`,
        actionLabel: 'Update Gallery',
        impact: 'high',
        productId: lowImages[0].id,
        productTitle: lowImages[0].title,
        dataMetric: `${lowImages.length} listings impacted`
      });
    }

    // Check low stock
    const lowStock = sellerProducts.filter((p) => (p.stockCount || p.stock || 0) <= 5 && (p.stockCount || p.stock || 0) > 0);
    if (lowStock.length > 0) {
      list.push({
        id: 'ins_stock_local',
        type: 'inventory',
        title: 'Prevent Stockout on Popular Items',
        description: `"${lowStock[0].title}" is down to ${lowStock[0].stockCount || lowStock[0].stock} unit(s). Restock now to maintain priority placement in search.`,
        actionLabel: 'Restock +10 Units',
        impact: 'high',
        productId: lowStock[0].id,
        productTitle: lowStock[0].title,
        dataMetric: `${lowStock[0].stockCount || lowStock[0].stock} units left`
      });
    }

    // Check descriptions
    const shortDesc = sellerProducts.filter((p) => !p.description || p.description.length < 80);
    if (shortDesc.length > 0) {
      list.push({
        id: 'ins_desc_local',
        type: 'description',
        title: 'Add Nigerian Sizing & Fabric Specs',
        description: 'Provide measurements in inches or European footwear standards to reduce fit-related return inquiries.',
        actionLabel: 'Expand Description',
        impact: 'medium',
        productId: shortDesc[0].id,
        productTitle: shortDesc[0].title
      });
    }

    // Reviews insight
    list.push({
      id: 'ins_rev_local',
      type: 'reviews',
      title: 'Request Verified Delivery Reviews',
      description: 'Your recent buyers can be invited to leave 5-star verified feedback with photos for extra loyalty points.',
      actionLabel: 'Engage Customers',
      impact: 'medium',
      dataMetric: `${sellerOrders.filter((o) => o.status === 'delivered').length} delivered orders`
    });

    setInsights(list);
  };

  useEffect(() => {
    fetchInsights();
  }, [sellerId]);

  const handleAction = async (insight: SellerGrowthInsight) => {
    if (insight.type === 'inventory' && insight.productId) {
      setRestockingId(insight.productId);
      try {
        const prod = sellerProducts.find((p) => p.id === insight.productId);
        const currentStock = prod ? (prod.stockCount || prod.stock || 0) : 2;
        await editProduct(insight.productId, { stock: currentStock + 10, stockCount: currentStock + 10 });
        showToast('Restocked Successfully', `Added 10 units to inventory for "${insight.productTitle}".`, 'success');
        fetchInsights();
      } catch {
        showToast('Restock Error', 'Could not update stock.', 'error');
      } finally {
        setRestockingId(null);
      }
      return;
    }

    if (insight.productId) {
      setActiveEditProductId(insight.productId);
      navigateTo('seller-product-edit');
    } else {
      navigateTo('storefront');
    }
  };

  // Milestones calculation
  const milestones = [
    { label: 'Merchant Onboarding Completed', done: true, desc: 'Store registered and approved on MarketNest' },
    { label: 'First Product Published', done: sellerProducts.length > 0, desc: `${sellerProducts.length} active products in catalog` },
    { label: 'First Customer Order', done: sellerOrders.length > 0, desc: `${sellerOrders.length} customer orders received` },
    { label: 'Escrow Fulfillment Payout', done: sellerOrders.some((o) => o.status === 'delivered'), desc: 'Completed delivery and balance cleared' },
    { label: 'Verified Merchant Badge (Tier 2)', done: sellerProducts.length >= 5 && sellerOrders.length >= 3, desc: 'Top-rated seller privileges' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#101413] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E8F5A]/20 text-[#A7E2C9] text-xs font-semibold border border-[#0E8F5A]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MarketNest Merchant Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Seller Growth Center
          </h1>
          <p className="text-sm text-[#A0A5A3] leading-relaxed">
            Data-driven recommendations to maximize buy-box visibility, accelerate Nigerian shoppers’ conversion, and safeguard your fulfillment escrow rating.
          </p>
        </div>

        {/* Completeness Card */}
        <div className="mt-6 sm:mt-0 sm:absolute sm:right-8 sm:top-1/2 sm:-translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 text-center min-w-[200px]">
          <span className="text-xs font-bold text-white/80 block uppercase tracking-wider">
            Store Health Score
          </span>
          <div className="text-4xl font-extrabold text-[#A7E2C9] my-1">
            {completenessScore}%
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-[#0E8F5A] h-full rounded-full transition-all duration-500"
              style={{ width: `${completenessScore}%` }}
            />
          </div>
          <span className="text-[11px] text-white/70 block mt-2">
            Top 15% across Lagos merchants
          </span>
        </div>
      </div>

      {/* AI Listing Intelligence Assistant Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#101413] to-purple-950 border border-emerald-800/40 text-white rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Catalog Intelligence & Automation</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            AI Listing & Copywriting Assistant
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Generate high-converting luxury product descriptions, suggest accurate Nigerian categories, extract technical specifications, and optimize SEO search tags with verified seller controls.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const sample = sellerProducts[0] || null;
              setAiProduct(sample);
              setAiModalOpen(true);
            }}
            rightIcon={<Wand2 className="w-4 h-4" />}
          >
            Launch AI Assistant
          </Button>
        </div>
      </div>

      {/* Grid of Key Growth Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0E8F5A] flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#101413]">Photography & Gallery Depth</h3>
          <p className="text-xs text-[#6B726E] leading-relaxed">
            Listings featuring 3 or more studio images receive an average of 4.2x more cart adds on mobile devices.
          </p>
          <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between text-xs">
            <span className="text-[#6B726E]">Catalog Average</span>
            <span className="font-bold text-[#101413]">
              {sellerProducts.length > 0
                ? (sellerProducts.reduce((acc, p) => acc + (p.images?.length || 1), 0) / sellerProducts.length).toFixed(1)
                : '3.0'}{' '}
              photos / item
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#101413]">Inventory Stockout Risk</h3>
          <p className="text-xs text-[#6B726E] leading-relaxed">
            When inventory drops below 3 units, customer purchase abandonment doubles due to fears of stock unavailability.
          </p>
          <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between text-xs">
            <span className="text-[#6B726E]">Low Stock Warnings</span>
            <span className="font-bold text-amber-600">
              {sellerProducts.filter((p) => (p.stockCount || p.stock || 0) <= 5).length} items
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#101413]">Fulfillment SLA Speed</h3>
          <p className="text-xs text-[#6B726E] leading-relaxed">
            Dispatching confirmed orders within 24 hours unlocks the MarketNest Express badge on search result cards.
          </p>
          <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between text-xs">
            <span className="text-[#6B726E]">Dispatch SLA</span>
            <span className="font-bold text-[#0E8F5A]">24h Lagos Standard</span>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-[#101413]">High-Impact Growth Actions</h2>
            <p className="text-xs text-[#6B726E]">
              Specific optimizations derived from your live products and order performance.
            </p>
          </div>
          <button
            onClick={fetchInsights}
            className="flex items-center gap-1.5 text-xs text-[#0E8F5A] font-semibold hover:underline cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit</span>
          </button>
        </div>

        <div className="divide-y divide-[#E4E7E5]">
          {insights.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#0E8F5A] mx-auto" />
              <h4 className="font-bold text-sm text-[#101413]">Catalog in Peak Condition</h4>
              <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
                No immediate catalog or inventory flags detected. Your storefront is well-optimized for maximum sales.
              </p>
            </div>
          ) : (
            insights.map((ins) => (
              <div
                key={ins.id}
                className="p-5 hover:bg-[#FBFBFA] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 max-w-2xl">
                  <div
                    className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                      ins.impact === 'high'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : ins.impact === 'medium'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {ins.type === 'photography' && <Camera className="w-4 h-4" />}
                    {ins.type === 'inventory' && <AlertTriangle className="w-4 h-4" />}
                    {ins.type === 'description' && <FileText className="w-4 h-4" />}
                    {ins.type === 'reviews' && <Star className="w-4 h-4" />}
                    {ins.type === 'pricing' && <TrendingUp className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#101413]">{ins.title}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          ins.impact === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : ins.impact === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ins.impact} impact
                      </span>
                      {ins.dataMetric && (
                        <span className="text-[11px] font-semibold text-[#6B726E] bg-[#F7F5F0] px-2 py-0.5 rounded">
                          {ins.dataMetric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B726E] leading-relaxed">{ins.description}</p>
                    {ins.productTitle && (
                      <p className="text-[11px] text-[#101413] font-medium">
                        Target product: <span className="font-semibold underline">{ins.productTitle}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <Button
                    variant={ins.impact === 'high' ? 'primary' : 'outline'}
                    size="sm"
                    loading={restockingId === ins.productId}
                    onClick={() => handleAction(ins)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    {ins.actionLabel}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Seller Activation & Milestone Journey */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h2 className="font-bold text-base text-[#101413]">Seller Activation Milestones</h2>
          <p className="text-xs text-[#6B726E]">
            Track your progression from onboarding application to premier verified merchant status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border relative transition-all ${
                m.done
                  ? 'border-[#A7E2C9] bg-[#E8F5EF]/40 text-[#101413]'
                  : 'border-[#E4E7E5] bg-[#FBFBFA] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    m.done ? 'bg-[#0E8F5A] text-white' : 'bg-[#E4E7E5] text-[#6B726E]'
                  }`}
                >
                  {m.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </span>
                <span className="text-[10px] font-bold uppercase text-[#6B726E]">
                  Step {idx + 1}
                </span>
              </div>
              <h4 className="font-bold text-xs text-[#101413] mb-1">{m.label}</h4>
              <p className="text-[11px] text-[#6B726E] leading-normal">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant Modal */}
      <SellerAiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        currentTitle={aiProduct?.title || ''}
        currentCategory={aiProduct?.category || 'fashion'}
        currentDescription={aiProduct?.description || ''}
        onApply={(content) => {
          showToast('AI Content Generated', 'Content reviewed and ready to apply to your product listing.', 'success');
          setAiModalOpen(false);
          if (aiProduct?.id) {
            setActiveEditProductId(aiProduct.id);
            navigateTo('seller-product-edit');
          }
        }}
      />
    </div>
  );
};
