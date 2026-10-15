/**
 * @file src/pages/admin/AdminMarketingPage.tsx
 * Admin Marketing Center, CRM & Customer Retention Workspace for MarketNest.
 * Features campaign lifecycle management, explainable audience segmentation,
 * CRM customer directory, abandoned cart recovery, message templates,
 * channel provider status monitoring, and scheduled automation engines.
 */

import React, { useState, useEffect } from 'react';
import {
  marketingService,
  MarketingOverviewData
} from '../../services/marketingService';
import {
  MarketingCampaign,
  MarketingSegment,
  AbandonedCart,
  MarketingTemplate,
  AutomationJob,
  ChannelProviderStatus,
  CustomerCrmProfile,
  MarketingChannel,
  CampaignObjective
} from '../../types/marketing';
import { formatNaira } from '../../components/ui/PriceDisplay';
import { Button } from '../../components/ui/Button';
import {
  Megaphone,
  TrendingUp,
  Users,
  ShoppingCart,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  Percent,
  RefreshCw,
  Eye,
  ExternalLink,
  Tag,
  Radio,
  Sliders,
  DollarSign,
  HelpCircle,
  X
} from 'lucide-react';

type MarketingTab =
  | 'overview'
  | 'campaigns'
  | 'crm'
  | 'segments'
  | 'abandoned_carts'
  | 'automations'
  | 'templates'
  | 'providers';

export const AdminMarketingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketingTab>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState<MarketingOverviewData | null>(null);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [segments, setSegments] = useState<MarketingSegment[]>([]);
  const [crmCustomers, setCrmCustomers] = useState<CustomerCrmProfile[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [automations, setAutomations] = useState<AutomationJob[]>([]);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [providers, setProviders] = useState<ChannelProviderStatus[]>([]);

  // Search & Filter states
  const [crmSearch, setCrmSearch] = useState('');
  const [crmTierFilter, setCrmTierFilter] = useState('all');
  const [feedbackNotice, setFeedbackNotice] = useState<{ title: string; message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // New Campaign Modal state
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignObjective, setNewCampaignObjective] = useState<CampaignObjective>('conversion');
  const [newCampaignChannel, setNewCampaignChannel] = useState<MarketingChannel>('email');
  const [newCampaignSegmentId, setNewCampaignSegmentId] = useState('seg_all_opted_in');
  const [newCampaignSubject, setNewCampaignSubject] = useState('');
  const [newCampaignBody, setNewCampaignBody] = useState('');
  const [newCampaignCoupon, setNewCampaignCoupon] = useState('');
  const [newCampaignCtaUrl, setNewCampaignCtaUrl] = useState('/shop');
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);

  // Test Send Modal state
  const [testSendCampaignId, setTestSendCampaignId] = useState<string | null>(null);
  const [testRecipientInput, setTestRecipientInput] = useState('admin@marketnest.ng');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Action Loading states
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, camps, segs, crm, carts, autos, tmpls, provs] = await Promise.all([
        marketingService.getOverview().catch(() => null),
        marketingService.getCampaigns().catch(() => []),
        marketingService.getSegments().catch(() => []),
        marketingService.getCrmCustomers().catch(() => []),
        marketingService.getAbandonedCarts().catch(() => []),
        marketingService.getAutomationJobs().catch(() => []),
        marketingService.getTemplates().catch(() => []),
        marketingService.getChannelProviderStatuses().catch(() => [])
      ]);

      setOverview(ov);
      setCampaigns(camps);
      setSegments(segs);
      setCrmCustomers(crm);
      setAbandonedCarts(carts);
      setAutomations(autos);
      setTemplates(tmpls);
      setProviders(provs);
    } catch (err) {
      console.error('Error loading marketing center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackNotice({ title, message, type });
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  // 1. Create New Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim() || !newCampaignBody.trim()) {
      showFeedback('Missing Fields', 'Please enter a campaign name and message copy.', 'error');
      return;
    }

    setIsSubmittingCampaign(true);
    try {
      const created = await marketingService.createCampaign({
        name: newCampaignName.trim(),
        objective: newCampaignObjective,
        channel: newCampaignChannel,
        targetSegmentId: newCampaignSegmentId,
        messageTemplate: {
          subject: newCampaignSubject.trim() || undefined,
          body: newCampaignBody.trim(),
          ctaUrl: newCampaignCtaUrl.trim()
        },
        couponCode: newCampaignCoupon.trim() || undefined
      });

      setCampaigns([created, ...campaigns]);
      setIsNewCampaignOpen(false);
      // Reset form
      setNewCampaignName('');
      setNewCampaignSubject('');
      setNewCampaignBody('');
      setNewCampaignCoupon('');
      showFeedback('Campaign Created', `"${created.name}" is now ready in draft.`, 'success');
      setActiveTab('campaigns');
    } catch (err: any) {
      showFeedback('Creation Error', err.message || 'Could not create campaign.', 'error');
    } finally {
      setIsSubmittingCampaign(false);
    }
  };

  // 2. Launch Campaign
  const handleLaunchCampaign = async (camp: MarketingCampaign) => {
    if (camp.status === 'sent' || camp.status === 'completed') {
      showFeedback('Already Sent', 'This campaign has already completed delivery.', 'info');
      return;
    }

    const confirmed = window.confirm(
      `Confirm Campaign Launch:\n\nSend "${camp.name}" to ${camp.estimatedAudience} estimated customers via ${camp.channel.toUpperCase()}?\n\nImmediate suppression filtering will exclude opted-out recipients.`
    );
    if (!confirmed) return;

    setActionInProgressId(camp.id);
    try {
      const res = await marketingService.launchCampaign(camp.id);
      setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? res.campaign : c)));
      showFeedback('Campaign Dispatched', res.message, 'success');
      if (overview) {
        setOverview({
          ...overview,
          totalDelivered: overview.totalDelivered + res.campaign.actualRecipients
        });
      }
    } catch (err: any) {
      showFeedback('Launch Error', err.message || 'Failed to dispatch campaign.', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // 3. Test Send
  const handleExecuteTestSend = async () => {
    if (!testSendCampaignId || !testRecipientInput.trim()) return;
    setIsSendingTest(true);
    try {
      const msg = await marketingService.testSend(testSendCampaignId, testRecipientInput.trim());
      showFeedback('Test Preview Sent', msg, 'success');
      setTestSendCampaignId(null);
    } catch (err: any) {
      showFeedback('Test Failed', err.message || 'Could not send test.', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  // 4. Recover Abandoned Cart
  const handleRecoverCart = async (cart: AbandonedCart) => {
    setActionInProgressId(cart.id);
    try {
      const res = await marketingService.recoverAbandonedCart(cart.id);
      setAbandonedCarts((prev) => prev.map((c) => (c.id === cart.id ? res.cart : c)));
      showFeedback('Recovery Link Sent', res.message, 'success');
    } catch (err: any) {
      showFeedback('Recovery Failed', err.message || 'Could not recover cart.', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // 5. Toggle Automation Trigger
  const handleToggleAutomation = async (jobId: string) => {
    setActionInProgressId(jobId);
    try {
      const updated = await marketingService.toggleAutomationJob(jobId);
      setAutomations((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
      showFeedback('Automation Updated', `Rule "${updated.title}" is now ${updated.enabled ? 'ACTIVE' : 'PAUSED'}.`, 'info');
    } catch (err: any) {
      showFeedback('Error', err.message || 'Could not toggle rule.', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // CRM filtered list
  const filteredCrmCustomers = crmCustomers.filter((cust) => {
    if (crmSearch.trim()) {
      const q = crmSearch.toLowerCase();
      const matchName = cust.name.toLowerCase().includes(q);
      const matchEmail = cust.email.toLowerCase().includes(q);
      const matchCity = cust.city.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCity) return false;
    }
    if (crmTierFilter !== 'all' && cust.retentionTier !== crmTierFilter) {
      return false;
    }
    return true;
  });

  const getChannelIcon = (ch: MarketingChannel) => {
    switch (ch) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case 'sms':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-600" />;
      case 'whatsapp':
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'push':
        return <Bell className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. MASTER WORKSPACE HEADER */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
              Growth & CRM Hub
            </span>
            <span className="text-[11px] font-semibold text-[#101413] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#E4E7E5]">
              Phase 17 Governance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101413] mt-1">
            Marketing Automation, CRM & Retention Center
          </h1>
          <p className="text-xs text-[#6B726E] mt-0.5 max-w-3xl">
            Responsible, consent-aware customer retention. Manage campaigns, recover abandoned shopping bags, monitor deliverability, and analyze attributed orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewCampaignOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Campaign
          </Button>
        </div>
      </div>

      {/* FEEDBACK TOAST / BANNER */}
      {feedbackNotice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedbackNotice.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : feedbackNotice.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-[#E8F5EF] text-[#0E8F5A] border-[#A7E2C9]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-bold block">{feedbackNotice.title}</span>
              <span>{feedbackNotice.message}</span>
            </div>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-xs font-bold cursor-pointer opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. NAVIGATION SUBTABS */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#E4E7E5] pb-2 text-xs">
        {[
          { id: 'overview', label: 'Overview & Retention', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="w-3.5 h-3.5" />, badge: campaigns.length },
          { id: 'crm', label: 'Customer CRM', icon: <Users className="w-3.5 h-3.5" />, badge: crmCustomers.length },
          { id: 'abandoned_carts', label: 'Cart Recovery', icon: <ShoppingCart className="w-3.5 h-3.5" />, badge: abandonedCarts.length },
          { id: 'segments', label: 'Audience Segments', icon: <Sliders className="w-3.5 h-3.5" />, badge: segments.length },
          { id: 'automations', label: 'Automations', icon: <Clock className="w-3.5 h-3.5" />, badge: automations.length },
          { id: 'templates', label: 'Message Templates', icon: <Tag className="w-3.5 h-3.5" /> },
          { id: 'providers', label: 'Channels & Health', icon: <Radio className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MarketingTab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#101413] text-white shadow-xs'
                : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#E4E7E5] text-[#101413]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===================== TAB 1: OVERVIEW ===================== */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#6B726E]">
                <span className="font-semibold">Attributed Sales (GMV)</span>
                <TrendingUp className="w-4 h-4 text-[#0E8F5A]" />
              </div>
              <p className="text-2xl font-extrabold text-[#101413] tabular-nums mt-1">
                {formatNaira(overview.totalAttributedRevenue)}
              </p>
              <p className="text-[11px] text-[#6B726E]">
                Across {overview.totalAttributedOrders} orders driven by campaigns
              </p>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-blue-700">
                <span className="font-semibold">Messages Delivered</span>
                <Send className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#101413] tabular-nums mt-1">
                {overview.totalDelivered}
              </p>
              <p className="text-[11px] text-[#6B726E]">
                {overview.totalClicks} clicks · {overview.avgCtr}% click-through rate
              </p>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-amber-700">
                <span className="font-semibold">Cart Recovery Rate</span>
                <ShoppingCart className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#101413] tabular-nums mt-1">
                {overview.cartRecoveryRate}%
              </p>
              <p className="text-[11px] text-[#6B726E]">
                {overview.recoveredCarts} of {overview.totalAbandonedTracked} carts saved
              </p>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#0E8F5A]">
                <span className="font-semibold">Opted-In Audience</span>
                <Users className="w-4 h-4 text-[#0E8F5A]" />
              </div>
              <p className="text-2xl font-extrabold text-[#0E8F5A] tabular-nums mt-1">
                {overview.totalOptedInAudience}
              </p>
              <p className="text-[11px] text-[#6B726E]">
                {overview.optOutRate}% unsubscribed (low churn)
              </p>
            </div>
          </div>

          {/* Compliance & Safeguards Banner */}
          <div className="bg-[#E8F5EF] border border-[#A7E2C9] rounded-xl p-4 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-[#0E8F5A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#0E8F5A]">
                Nigerian Data Protection (NDPA) & Marketing Consent Architecture
              </span>
              <p className="text-[#101413] leading-relaxed text-[11px]">
                MarketNest enforces strict pre-send suppression checks: customers who opt out of any channel or category are instantly excluded prior to dispatch. Transactional dispatch/escrow alerts remain separate from promotional messaging.
              </p>
            </div>
          </div>

          {/* Two-Column Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Campaigns Highlights (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E5]">
                <h3 className="text-sm font-bold text-[#101413]">Active & Recent Campaigns</h3>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className="text-xs font-semibold text-[#0E8F5A] hover:underline cursor-pointer"
                >
                  View All ({campaigns.length})
                </button>
              </div>

              <div className="space-y-3">
                {campaigns.slice(0, 3).map((camp) => (
                  <div
                    key={camp.id}
                    className="p-3.5 rounded-lg bg-[#F7F5F0] border border-[#E4E7E5] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(camp.channel)}
                        <span className="font-bold text-[#101413]">{camp.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                            camp.status === 'sent' || camp.status === 'completed'
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : camp.status === 'scheduled'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </div>
                      <p className="text-[#6B726E] text-[11px] mt-0.5">
                        Target: {camp.targetSegmentName} · {camp.stats.delivered} delivered
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-[#101413] tabular-nums">
                        {formatNaira(camp.stats.attributedRevenue)}
                      </span>
                      <p className="text-[10px] text-[#0E8F5A] font-semibold">
                        {camp.stats.attributedOrders} orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Automation Engines Highlights (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E5]">
                <h3 className="text-sm font-bold text-[#101413]">Event-Driven Triggers</h3>
                <button
                  onClick={() => setActiveTab('automations')}
                  className="text-xs font-semibold text-[#0E8F5A] hover:underline cursor-pointer"
                >
                  Configure
                </button>
              </div>

              <div className="space-y-2.5">
                {automations.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 rounded-lg bg-[#F7F5F0] border border-[#E4E7E5] flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            job.enabled ? 'bg-[#0E8F5A]' : 'bg-slate-300'
                          }`}
                        />
                        <span className="font-bold text-[#101413] truncate">{job.title}</span>
                      </div>
                      <span className="text-[10px] text-[#6B726E] block mt-0.5">
                        {job.executionCount} executions · {job.successRatePercent}% success
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleAutomation(job.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        job.enabled
                          ? 'bg-[#E8F5EF] text-[#0E8F5A] hover:bg-[#d5eee2]'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {job.enabled ? 'Active' : 'Paused'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: CAMPAIGNS ===================== */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#101413]">Marketing Campaigns</h2>
              <p className="text-xs text-[#6B726E]">
                Create, test, schedule, and review campaign deliverability and attributed sales.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewCampaignOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Campaign
            </Button>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Campaign Name</th>
                    <th className="py-3 px-4 font-bold">Channel</th>
                    <th className="py-3 px-4 font-bold">Target Segment</th>
                    <th className="py-3 px-4 font-bold">Audience</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Attributed GMV</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#101413]">
                        {camp.name}
                        {camp.couponCode && (
                          <span className="block text-[10px] text-[#0E8F5A] font-semibold mt-0.5">
                            Promo: {camp.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 capitalize font-medium text-[#101413]">
                          {getChannelIcon(camp.channel)}
                          {camp.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B726E]">{camp.targetSegmentName}</td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <span className="font-bold text-[#101413]">
                          {camp.actualRecipients > 0 ? camp.actualRecipients : camp.estimatedAudience}
                        </span>
                        <span className="text-[10px] text-[#6B726E] block">shoppers</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            camp.status === 'sent' || camp.status === 'completed'
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : camp.status === 'scheduled'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <span className="font-extrabold text-[#101413]">
                          {formatNaira(camp.stats.attributedRevenue)}
                        </span>
                        <span className="block text-[10px] text-[#6B726E]">
                          {camp.stats.attributedOrders} orders
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setTestSendCampaignId(camp.id)}
                            className="px-2.5 py-1 rounded bg-[#F7F5F0] hover:bg-[#E4E7E5] text-[#101413] text-[11px] font-semibold cursor-pointer"
                          >
                            Test Send
                          </button>
                          {camp.status === 'draft' || camp.status === 'scheduled' ? (
                            <button
                              onClick={() => handleLaunchCampaign(camp)}
                              disabled={actionInProgressId === camp.id}
                              className="px-2.5 py-1 rounded bg-[#0E8F5A] hover:bg-[#0c7a4d] text-white text-[11px] font-bold cursor-pointer"
                            >
                              Launch
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#6B726E]">Dispatched</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: CUSTOMER CRM DIRECTORY ===================== */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#101413]">Customer CRM Directory</h2>
              <p className="text-xs text-[#6B726E]">
                Privacy-conscious customer profiles, lifetime purchase records, and consent statuses.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  placeholder="Search customer, email..."
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={crmTierFilter}
                onChange={(e) => setCrmTierFilter(e.target.value)}
                className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-2.5 py-1.5 text-xs text-[#101413]"
              >
                <option value="all">All Tiers</option>
                <option value="vip_loyal">VIP Loyal</option>
                <option value="promising">Promising</option>
                <option value="at_risk">At Risk</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Customer Name</th>
                    <th className="py-3 px-4 font-bold">Location</th>
                    <th className="py-3 px-4 font-bold">Orders & Spend</th>
                    <th className="py-3 px-4 font-bold">Retention Tier</th>
                    <th className="py-3 px-4 font-bold">Consent Status</th>
                    <th className="py-3 px-4 font-bold">Preferred Category</th>
                    <th className="py-3 px-4 font-bold">Last Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {filteredCrmCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#101413]">
                        {cust.name}
                        <span className="block text-[11px] text-[#6B726E] font-normal">
                          {cust.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B726E]">
                        {cust.city}, {cust.state}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <span className="font-extrabold text-[#101413]">
                          {formatNaira(cust.lifetimeSpend)}
                        </span>
                        <span className="block text-[10px] text-[#6B726E]">
                          {cust.orderCount} order(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cust.retentionTier === 'vip_loyal'
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : cust.retentionTier === 'promising'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {cust.retentionTier.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {cust.marketingOptIn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E8F5A]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Opted-In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                            ✕ Suppressed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#101413]">{cust.preferredCategory}</td>
                      <td className="py-3.5 px-4 text-[#6B726E]">{cust.lastTouchpoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: ABANDONED CARTS ===================== */}
      {activeTab === 'abandoned_carts' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#101413]">Abandoned Shopping Bags Recovery</h2>
            <p className="text-xs text-[#6B726E]">
              Detects inactive checkout journeys. Revalidates stock, respects channel opt-outs, and dispatches secure return-to-cart links.
            </p>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Customer</th>
                    <th className="py-3 px-4 font-bold">Abandoned Item(s)</th>
                    <th className="py-3 px-4 font-bold">Bag Value</th>
                    <th className="py-3 px-4 font-bold">Recovery Status</th>
                    <th className="py-3 px-4 font-bold">Attempts</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {abandonedCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#101413]">
                        {cart.customerName}
                        <span className="block text-[11px] text-[#6B726E] font-normal">
                          {cart.customerEmail}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={cart.items[0]?.image || 'https://via.placeholder.com/40'}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover border border-[#E4E7E5]"
                          />
                          <span className="font-semibold text-[#101413] truncate max-w-xs">
                            {cart.items[0]?.title}
                            {cart.items.length > 1 && ` (+${cart.items.length - 1} more)`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#101413] tabular-nums">
                        {formatNaira(cart.cartTotal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            cart.status === 'recovered'
                              ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                              : cart.status === 'recovery_sent'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {cart.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-[#6B726E]">
                        {cart.recoveryAttempts} attempt(s)
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {cart.status === 'recovered' ? (
                          <span className="text-[11px] text-[#0E8F5A] font-bold">Converted</span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={actionInProgressId === cart.id}
                            onClick={() => handleRecoverCart(cart)}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                          >
                            Send Nudge
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 5: AUDIENCE SEGMENTS ===================== */}
      {activeTab === 'segments' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#101413]">Audience Segmentation Rules</h2>
            <p className="text-xs text-[#6B726E]">
              Explainable first-party segments calculated from verified order history and explicit opt-in preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((seg) => (
              <div
                key={seg.id}
                className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E7E5]">
                    <span className="text-xs font-extrabold text-[#101413]">{seg.name}</span>
                    <span className="text-xs font-bold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                      {seg.eligibleCount} shoppers
                    </span>
                  </div>

                  <p className="text-xs text-[#6B726E] mt-2 leading-relaxed">
                    {seg.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#E4E7E5] space-y-1 text-[11px] text-[#101413]">
                    <span className="font-bold text-[#6B726E] block text-[10px] uppercase">
                      Rule Conditions:
                    </span>
                    {seg.rules.minOrders !== undefined && (
                      <span className="block">· Min completed orders: {seg.rules.minOrders}</span>
                    )}
                    {seg.rules.maxOrders !== undefined && (
                      <span className="block">· Max completed orders: {seg.rules.maxOrders}</span>
                    )}
                    {seg.rules.daysSinceLastOrder !== undefined && (
                      <span className="block">· Days since order: ≥ {seg.rules.daysSinceLastOrder} days</span>
                    )}
                    {seg.rules.minLifetimeSpend !== undefined && (
                      <span className="block">· Lifetime GMV: ≥ {formatNaira(seg.rules.minLifetimeSpend)}</span>
                    )}
                    <span className="block text-[#0E8F5A] font-semibold">
                      · Explicit marketing opt-in required: Yes
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setNewCampaignSegmentId(seg.id);
                    setIsNewCampaignOpen(true);
                  }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Create Campaign for Segment
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 6: AUTOMATIONS ===================== */}
      {activeTab === 'automations' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#101413]">Scheduled Automation Triggers</h2>
            <p className="text-xs text-[#6B726E]">
              Event-driven automation engine handling welcome vouchers, cart recovery, and post-delivery review requests.
            </p>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Trigger Rule</th>
                    <th className="py-3 px-4 font-bold">Channel</th>
                    <th className="py-3 px-4 font-bold">Timing Delay</th>
                    <th className="py-3 px-4 font-bold">Executions</th>
                    <th className="py-3 px-4 font-bold">Success Rate</th>
                    <th className="py-3 px-4 font-bold">State</th>
                    <th className="py-3 px-4 font-bold text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {automations.map((job) => (
                    <tr key={job.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#101413]">
                        {job.title}
                        <span className="block text-[11px] text-[#6B726E] font-normal">
                          {job.description}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 capitalize font-medium text-[#101413]">
                          {getChannelIcon(job.channel)}
                          {job.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B726E]">
                        {job.delayMinutes >= 1440
                          ? `${Math.round(job.delayMinutes / 1440)} day(s)`
                          : `${job.delayMinutes} mins`}
                      </td>
                      <td className="py-3.5 px-4 font-bold tabular-nums text-[#101413]">
                        {job.executionCount}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0E8F5A] tabular-nums">
                        {job.successRatePercent}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            job.enabled ? 'bg-[#E8F5EF] text-[#0E8F5A]' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {job.enabled ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant={job.enabled ? 'outline' : 'primary'}
                          size="sm"
                          isLoading={actionInProgressId === job.id}
                          onClick={() => handleToggleAutomation(job.id)}
                        >
                          {job.enabled ? 'Pause' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 7: TEMPLATES ===================== */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#101413]">Channel Message Templates</h2>
            <p className="text-xs text-[#6B726E]">
              Pre-approved copy templates supporting merge tags like customer name, return-to-cart link, and coupon code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E7E5]">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(tmpl.channel)}
                    <h3 className="font-bold text-xs text-[#101413]">{tmpl.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded uppercase">
                    {tmpl.category.replace('_', ' ')}
                  </span>
                </div>

                {tmpl.subject && (
                  <div className="text-xs">
                    <span className="font-bold text-[#6B726E] text-[10px] uppercase">Subject: </span>
                    <span className="font-semibold text-[#101413]">{tmpl.subject}</span>
                  </div>
                )}

                <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E4E7E5] text-xs text-[#101413] font-mono whitespace-pre-wrap leading-relaxed">
                  {tmpl.body}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                  <span className="text-[#6B726E] font-bold">Merge Variables:</span>
                  {tmpl.variables.map((v) => (
                    <span key={v} className="bg-white border border-[#E4E7E5] px-1.5 py-0.5 rounded text-[#0E8F5A] font-semibold">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 8: PROVIDERS & HEALTH ===================== */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#101413]">Channel Providers & Delivery Health</h2>
            <p className="text-xs text-[#6B726E]">
              Separated messaging architecture. Real delivery state reporting across Email, Nigerian SMS, WhatsApp, and Web Push.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((prov) => (
              <div
                key={prov.channel}
                className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E7E5]">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(prov.channel)}
                    <h3 className="font-bold text-sm text-[#101413]">{prov.providerName}</h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prov.status === 'configured'
                        ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {prov.status === 'configured' ? 'Live Connected' : 'Simulated Test Engine'}
                  </span>
                </div>

                <p className="text-xs text-[#6B726E] leading-relaxed">
                  {prov.documentation}
                </p>

                <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E4E7E5] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B726E]">Average Delivery SLA</span>
                    <span className="font-extrabold text-[#0E8F5A] tabular-nums">
                      {prov.deliveryRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B726E]">Required Server Secrets</span>
                    <span className="font-mono text-[10px] text-[#101413]">
                      {prov.requiredEnvVars.join(', ')}
                    </span>
                  </div>
                  {prov.missingEnvVars.length > 0 && (
                    <div className="text-[10px] text-amber-700 font-semibold pt-1">
                      Notice: Operating safely in sandbox mode. Set {prov.missingEnvVars.join(', ')} for production carrier dispatch.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE CAMPAIGN ===================== */}
      {isNewCampaignOpen && (
        <div className="fixed inset-0 bg-[#101413]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7E5] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E5]">
              <div>
                <h3 className="text-base font-bold text-[#101413]">Guided Campaign Builder</h3>
                <p className="text-xs text-[#6B726E]">
                  Create and target an eligible, opted-in customer audience.
                </p>
              </div>
              <button
                onClick={() => setIsNewCampaignOpen(false)}
                className="p-1 rounded-md text-[#6B726E] hover:text-[#101413] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#101413] block mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g. Lagos Fashion Week VIP Exclusive"
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs font-semibold text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#101413] block mb-1">Objective</label>
                  <select
                    value={newCampaignObjective}
                    onChange={(e) => setNewCampaignObjective(e.target.value as any)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413]"
                  >
                    <option value="conversion">Conversion & Sales</option>
                    <option value="win_back">Win-Back Inactive Shoppers</option>
                    <option value="retention">Retention & Loyalty</option>
                    <option value="cart_recovery">Cart Recovery</option>
                    <option value="seasonal">Seasonal Drop</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#101413] block mb-1">Communication Channel</label>
                  <select
                    value={newCampaignChannel}
                    onChange={(e) => setNewCampaignChannel(e.target.value as any)}
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413]"
                  >
                    <option value="email">Email</option>
                    <option value="sms">Nigerian SMS (Termii)</option>
                    <option value="whatsapp">WhatsApp Business</option>
                    <option value="push">In-App Push (Web/FCM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#101413] block mb-1">Target Audience Segment</label>
                <select
                  value={newCampaignSegmentId}
                  onChange={(e) => setNewCampaignSegmentId(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413]"
                >
                  {segments.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name} ({seg.eligibleCount} verified opted-in shoppers)
                    </option>
                  ))}
                </select>
              </div>

              {newCampaignChannel === 'email' && (
                <div>
                  <label className="font-bold text-[#101413] block mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={newCampaignSubject}
                    onChange={(e) => setNewCampaignSubject(e.target.value)}
                    placeholder="e.g. Exclusive Adire silk drop - Escrow protected delivery"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-[#101413] block mb-1">Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={newCampaignBody}
                  onChange={(e) => setNewCampaignBody(e.target.value)}
                  placeholder="Enter message copy. You may use {{customer_name}}, {{cart_url}}, {{discount_code}}..."
                  className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md p-3 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#101413] block mb-1">Optional Coupon Code</label>
                  <input
                    type="text"
                    value={newCampaignCoupon}
                    onChange={(e) => setNewCampaignCoupon(e.target.value)}
                    placeholder="e.g. VIP2026"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs uppercase font-bold text-[#101413]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#101413] block mb-1">Destination CTA URL</label>
                  <input
                    type="text"
                    value={newCampaignCtaUrl}
                    onChange={(e) => setNewCampaignCtaUrl(e.target.value)}
                    placeholder="/shop"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E4E7E5] text-[11px] text-[#6B726E]">
                Safety confirmation: Marketing consent checks will be executed immediately before sending to filter any opted-out recipients.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E7E5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewCampaignOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingCampaign}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save as Draft
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: TEST SEND ===================== */}
      {testSendCampaignId && (
        <div className="fixed inset-0 bg-[#101413]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7E5] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-[#101413]">Dispatch Test Preview</h3>
            <p className="text-xs text-[#6B726E]">
              Verify message formatting and merge variables by sending a test preview to your designated address.
            </p>

            <div>
              <label className="font-bold text-xs text-[#101413] block mb-1">
                Test Recipient (Email or Phone)
              </label>
              <input
                type="text"
                value={testRecipientInput}
                onChange={(e) => setTestRecipientInput(e.target.value)}
                placeholder="admin@marketnest.ng or +234..."
                className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3 py-2 text-xs text-[#101413]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestSendCampaignId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSendingTest}
                onClick={handleExecuteTestSend}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
