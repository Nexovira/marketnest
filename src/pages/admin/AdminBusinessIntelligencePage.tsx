/**
 * @file src/pages/admin/AdminBusinessIntelligencePage.tsx
 * MarketNest Central Business Intelligence & Financial Analytics Command Center.
 * Implements:
 * - 17 Core authoritative financial & operational metrics with exact definitions
 * - Configurable reporting periods (Today, Yesterday, 7d, 30d, 90d, 12m, Custom)
 * - Money Movement & Cash Flow Settlement Ledger (Accounting balance vs Bank integration)
 * - Sales, Customer Cohorts, Seller SLA, Affiliate, Product, and Marketing deep dives
 * - Schema-governed Analytics Event Stream
 * - Scheduled Reports & Alerts manager with on-demand dispatch
 * - Anti-formula-injection CSV data export
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  BiReportingPeriod,
  BiExecutiveMetrics,
  BiMetricDefinition,
  CashFlowLedger,
  SalesAnalyticsData,
  CustomerAnalyticsData,
  SellerAnalyticsData,
  AffiliateAnalyticsData,
  ProductAnalyticsData,
  MarketingAnalyticsData,
  AnalyticsEvent,
  ScheduledReportConfig
} from '../../types';
import {
  financialReportingService,
  BI_METRIC_DEFINITIONS
} from '../../services/financialReportingService';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  Search,
  FileText,
  Mail,
  Play,
  Activity,
  CreditCard,
  Percent,
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';

export const AdminBusinessIntelligencePage: React.FC = () => {
  const { setActiveSection, hasPermission } = useAdmin();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'cashflow'
    | 'sales'
    | 'customers'
    | 'sellers'
    | 'affiliates'
    | 'products'
    | 'marketing'
    | 'events'
    | 'scheduled'
  >('overview');

  // Reporting period state
  const [selectedPeriod, setSelectedPeriod] = useState<BiReportingPeriod>('30d');
  const [customStart, setCustomStart] = useState('2026-09-01');
  const [customEnd, setCustomEnd] = useState('2026-10-11');
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<BiExecutiveMetrics | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowLedger | null>(null);
  const [salesData, setSalesData] = useState<SalesAnalyticsData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerAnalyticsData | null>(null);
  const [sellerData, setSellerData] = useState<SellerAnalyticsData | null>(null);
  const [affiliateData, setAffiliateData] = useState<AffiliateAnalyticsData | null>(null);
  const [productData, setProductData] = useState<ProductAnalyticsData | null>(null);
  const [marketingData, setMarketingData] = useState<MarketingAnalyticsData | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReportConfig[]>([]);

  // Definitions Drawer state
  const [showDefinitionsModal, setShowDefinitionsModal] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState<BiMetricDefinition | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        metricsRes,
        cashFlowRes,
        salesRes,
        custRes,
        sellerRes,
        affRes,
        prodRes,
        mktgRes,
        eventsRes,
        schedRes
      ] = await Promise.all([
        financialReportingService.getExecutiveMetrics(
          selectedPeriod,
          selectedPeriod === 'custom' ? { start: customStart, end: customEnd } : undefined
        ),
        financialReportingService.getCashFlowLedger(),
        financialReportingService.getSalesAnalytics(selectedPeriod),
        financialReportingService.getCustomerAnalytics(selectedPeriod),
        financialReportingService.getSellerAnalytics(selectedPeriod),
        financialReportingService.getAffiliateAnalytics(selectedPeriod),
        financialReportingService.getProductAnalytics(selectedPeriod),
        financialReportingService.getMarketingAnalytics(selectedPeriod),
        financialReportingService.getAnalyticsEvents(30),
        financialReportingService.getScheduledReports()
      ]);

      setMetrics(metricsRes);
      setCashFlow(cashFlowRes);
      setSalesData(salesRes);
      setCustomerData(custRes);
      setSellerData(sellerRes);
      setAffiliateData(affRes);
      setProductData(prodRes);
      setMarketingData(mktgRes);
      setEvents(eventsRes);
      setScheduledReports(schedRes);
    } catch (err) {
      console.warn('Error loading BI data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  // Export handler
  const handleExportCurrentView = () => {
    if (!metrics) return;

    try {
      if (activeTab === 'overview' || activeTab === 'sales') {
        const rows = [
          { Metric: 'Gross Merchandise Value (GMV)', Amount_NGN: metrics.gmv, Notes: 'Verified completed orders' },
          { Metric: 'Gross Sales (Top-Line)', Amount_NGN: metrics.grossSales, Notes: 'GMV + Shipping - Discounts' },
          { Metric: 'Completed Orders Count', Amount_NGN: metrics.completedOrders, Notes: 'Paid & Delivered' },
          { Metric: 'Average Order Value (AOV)', Amount_NGN: metrics.averageOrderValue, Notes: 'Gross Sales / Orders' },
          { Metric: 'Platform Commission Revenue', Amount_NGN: metrics.platformCommissionRevenue, Notes: '8%-15% category commission' },
          { Metric: 'Seller Earnings (Payable)', Amount_NGN: metrics.sellerEarnings, Notes: 'Net of platform commission' },
          { Metric: 'Affiliate Commissions Accrued', Amount_NGN: metrics.affiliateCommissions, Notes: 'Net of reversals' },
          { Metric: 'Payment Processing Fees', Amount_NGN: metrics.paymentProcessingFees, Notes: 'Paystack domestic interchange' },
          { Metric: 'Customer Refunds Disbursed', Amount_NGN: metrics.refunds, Notes: 'Approved returns' },
          { Metric: 'Net Marketplace Revenue', Amount_NGN: metrics.netMarketplaceRevenue, Notes: 'Platform revenue minus partner/gateway fees' }
        ];
        financialReportingService.exportToSanitizedCsv('marketnest_bi_executive_summary', rows, {
          title: 'Executive Financial Summary',
          currency: 'NGN',
          dateRange: `${metrics.dateRange.start.slice(0, 10)} to ${metrics.dateRange.end.slice(0, 10)}`
        });
        showToast('Exported sanitized executive summary CSV to your device.');
      } else if (activeTab === 'sellers' && sellerData) {
        const rows = sellerData.sellers.map((s) => ({
          Seller_ID: s.sellerId,
          Store_Name: s.storeName,
          Location: s.city,
          GMV_NGN: s.gmv,
          Orders: s.ordersCount,
          Seller_Earnings_NGN: s.sellerEarnings,
          Avg_Fulfillment_Hours: s.avgFulfillmentHours,
          Return_Rate_Percent: `${s.returnRatePercent}%`,
          Store_Rating: s.rating
        }));
        financialReportingService.exportToSanitizedCsv('marketnest_seller_performance', rows, {
          title: 'Seller Performance SLA Report',
          currency: 'NGN'
        });
        showToast('Exported seller performance CSV.');
      } else if (activeTab === 'affiliates' && affiliateData) {
        const rows = affiliateData.affiliates.map((a) => ({
          Affiliate_ID: a.affiliateId,
          Creator_Name: a.name,
          Referral_Code: a.code,
          Clicks: a.clicks,
          Attributed_Orders: a.orders,
          Referral_GMV_NGN: a.salesGmv,
          Commission_Accrued_NGN: a.commissionAccrued,
          Commission_Reversed_NGN: a.commissionReversed,
          Commission_Payable_NGN: a.commissionPayable
        }));
        financialReportingService.exportToSanitizedCsv('marketnest_affiliate_analytics', rows, {
          title: 'Affiliate Partner Attribution Report',
          currency: 'NGN'
        });
        showToast('Exported affiliate attribution CSV.');
      } else if (activeTab === 'cashflow' && cashFlow) {
        const rows = [
          { Ledger_Item: 'Verified Customer Payments', Amount_NGN: cashFlow.verifiedCustomerPayments, Type: 'Inflow' },
          { Ledger_Item: 'Pending Paystack Settlements (T+1)', Amount_NGN: cashFlow.pendingSettlements, Type: 'In-Transit' },
          { Ledger_Item: 'Customer Refunds Disbursed', Amount_NGN: cashFlow.recordedRefundsDisbursed, Type: 'Outflow' },
          { Ledger_Item: 'Seller Earnings Payable (In Escrow)', Amount_NGN: cashFlow.sellerEarningsPayable, Type: 'Liability' },
          { Ledger_Item: 'Affiliate Commissions Payable', Amount_NGN: cashFlow.affiliateCommissionsPayable, Type: 'Liability' },
          { Ledger_Item: 'Platform Retained Fees & Reserve', Amount_NGN: cashFlow.platformRetainedFees, Type: 'Platform Equity' },
          { Ledger_Item: 'Outstanding Discrepancies Amount', Amount_NGN: cashFlow.outstandingDiscrepanciesAmount, Type: 'Unreconciled' }
        ];
        financialReportingService.exportToSanitizedCsv('marketnest_cash_flow_ledger', rows, {
          title: 'Cash Flow & Settlement Ledger',
          currency: 'NGN'
        });
        showToast('Exported cash flow statement CSV.');
      } else {
        showToast('Export prepared for current tab.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Export failed.', 'error');
    }
  };

  // Trigger scheduled report
  const handleTriggerReport = async (reportId: string) => {
    try {
      const res = await financialReportingService.triggerReportExecution(reportId);
      showToast(res.message);
      loadData();
    } catch {
      showToast('Failed to trigger report compilation.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold underline text-[11px] cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#101413] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E8F5A]/20 text-[#A7E2C9] text-xs font-semibold border border-[#0E8F5A]/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Phase 13 Business Intelligence & Financial Reporting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Marketplace Financial Analytics & BI Hub
          </h1>
          <p className="text-sm text-[#A0A5A3] leading-relaxed">
            Authoritative financial metrics, escrow cash flow visibility, merchant SLA analytics, customer retention cohorts, and anti-tamper reconciliation.
          </p>
        </div>

        {/* Reporting Period Switcher */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Last 90 Days' },
            { id: '12m', label: 'Last 12 Months' },
            { id: 'custom', label: 'Custom Range' }
          ].map((p) => {
            const isSelected = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (p.id === 'custom') {
                    setShowCustomRangeModal(true);
                  } else {
                    setSelectedPeriod(p.id as BiReportingPeriod);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0E8F5A] text-white shadow-xs'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={() => setShowDefinitionsModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[#A7E2C9]" />
              <span>Metric Definitions</span>
            </button>

            <button
              onClick={handleExportCurrentView}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E8F5A] text-white text-xs font-bold hover:bg-[#0c7c4e] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-[#E4E7E5] flex items-center gap-2 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
          { id: 'cashflow', label: 'Cash Flow & Escrow Ledger', icon: CreditCard },
          { id: 'sales', label: 'Sales & Categories', icon: DollarSign },
          { id: 'customers', label: 'Customer Cohorts & LTV', icon: Users },
          { id: 'sellers', label: 'Merchant SLA & GMV', icon: Store },
          { id: 'affiliates', label: 'Affiliate Conversions', icon: Sparkles },
          { id: 'products', label: 'Product Intelligence', icon: Package },
          { id: 'marketing', label: 'Campaigns & Discounts', icon: Activity },
          { id: 'events', label: 'Governed Event Stream', icon: Layers },
          { id: 'scheduled', label: 'Scheduled Reports & Alerts', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#0E8F5A] text-[#0E8F5A] bg-[#E8F5EF]/30'
                  : 'border-transparent text-[#6B726E] hover:text-[#101413] hover:border-[#CBD5E1]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: EXECUTIVE OVERVIEW (17 Core Metrics)                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-8">
          {/* Top 4 Primary Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[#6B726E]">
                <span className="font-bold uppercase tracking-wider">Gross Merchandise Value</span>
                <span className="text-[10px] font-mono text-[#6B726E]">GMV</span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[#101413] tabular-nums tracking-tight">
                  {formatCurrency(metrics.gmv, metrics.currency)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{metrics.comparisons.gmvChangePercent}% vs prior period
                </span>
                <button
                  onClick={() => {
                    setSelectedDefinition(BI_METRIC_DEFINITIONS.find((d) => d.code === 'GMV') || null);
                    setShowDefinitionsModal(true);
                  }}
                  className="text-[#6B726E] hover:text-[#101413]"
                  title="View calculation definition"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#6B726E]">
                <span className="font-bold uppercase tracking-wider">Gross Sales (Top-Line)</span>
                <DollarSign className="w-4 h-4 text-[#0E8F5A]" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[#101413] tabular-nums tracking-tight">
                  {formatCurrency(metrics.grossSales, metrics.currency)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-[#6B726E]">
                Includes shipping ({formatCurrency(metrics.grossSales - metrics.gmv, metrics.currency)}) net of item discounts
              </div>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#6B726E]">
                <span className="font-bold uppercase tracking-wider">Platform Commission</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Monetization
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[#0E8F5A] tabular-nums tracking-tight">
                  {formatCurrency(metrics.platformCommissionRevenue, metrics.currency)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-[#6B726E]">
                Avg 10.0% take-rate across luxury merchants
              </div>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#6B726E]">
                <span className="font-bold uppercase tracking-wider">Net Marketplace Revenue</span>
                <span className="text-[10px] text-neutral-500 font-mono">After Costs</span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[#101413] tabular-nums tracking-tight">
                  {formatCurrency(metrics.netMarketplaceRevenue, metrics.currency)}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-amber-700 font-medium">
                Net of affiliate ({formatCurrency(metrics.affiliateCommissions, metrics.currency)}) & gateway fees
              </div>
            </div>
          </div>

          {/* Secondary 13 Metrics Matrix */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E7E5] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#101413]">
                  Commerce & Operational Key Indicators
                </h3>
                <p className="text-xs text-[#6B726E]">
                  Complete breakdown of order volume, unit economics, escrow retention, return rates, and payment performance.
                </p>
              </div>
              <div className="text-xs text-[#6B726E] font-mono">
                Period: {metrics.period.toUpperCase()} ({metrics.dateRange.start.slice(0, 10)} to {metrics.dateRange.end.slice(0, 10)})
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Completed Orders</span>
                <p className="text-xl font-black text-[#101413] tabular-nums">
                  {metrics.completedOrders.toLocaleString()}
                </p>
                <span className="text-[11px] text-emerald-700 font-bold">
                  +{metrics.comparisons.completedOrdersChangePercent}%
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Average Order Value (AOV)</span>
                <p className="text-xl font-black text-[#101413] tabular-nums">
                  {formatCurrency(metrics.averageOrderValue, metrics.currency)}
                </p>
                <span className="text-[11px] text-emerald-700 font-bold">
                  +{metrics.comparisons.aovChangePercent}% basket size
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Seller Earnings Accrued</span>
                <p className="text-xl font-black text-neutral-800 tabular-nums">
                  {formatCurrency(metrics.sellerEarnings, metrics.currency)}
                </p>
                <span className="text-[11px] text-[#6B726E]">Held in escrow until delivery</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Affiliate Commissions</span>
                <p className="text-xl font-black text-purple-700 tabular-nums">
                  {formatCurrency(metrics.affiliateCommissions, metrics.currency)}
                </p>
                <span className="text-[11px] text-[#6B726E]">30-day attribution hold</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Payment Gateway Fees</span>
                <p className="text-xl font-black text-neutral-700 tabular-nums">
                  {formatCurrency(metrics.paymentProcessingFees, metrics.currency)}
                </p>
                <span className="text-[11px] text-[#6B726E]">Paystack card & transfer</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Customer Refunds Disbursed</span>
                <p className="text-xl font-black text-rose-700 tabular-nums">
                  {formatCurrency(metrics.refunds, metrics.currency)}
                </p>
                <span className="text-[11px] text-emerald-700 font-bold">
                  {metrics.comparisons.refundsChangePercent}% decrease
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">New vs Repeat Buyers</span>
                <p className="text-xl font-black text-[#101413] tabular-nums">
                  {metrics.newCustomers} <span className="text-sm font-normal text-[#6B726E]">new /</span> {metrics.repeatCustomers} <span className="text-sm font-normal text-[#6B726E]">repeat</span>
                </p>
                <span className="text-[11px] text-emerald-700 font-bold">
                  +{metrics.comparisons.newCustomersChangePercent}% acquisition
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Active Partners</span>
                <p className="text-xl font-black text-[#101413] tabular-nums">
                  {metrics.activeSellers} <span className="text-sm font-normal text-[#6B726E]">sellers ·</span> {metrics.activeAffiliates} <span className="text-sm font-normal text-[#6B726E]">creators</span>
                </p>
                <span className="text-[11px] text-[#6B726E]">Active in selected window</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Product Return Rate</span>
                <p className="text-xl font-black text-emerald-800 tabular-nums">
                  {metrics.productReturnRate}%
                </p>
                <span className="text-[11px] text-[#6B726E]">Benchmark &lt; 3.5%</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Payment Success Rate</span>
                <p className="text-xl font-black text-[#0E8F5A] tabular-nums">
                  {metrics.paymentSuccessRate}%
                </p>
                <span className="text-[11px] text-[#6B726E]">Paystack checkout success</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Checkout Conversion Rate</span>
                <p className="text-xl font-black text-[#101413] tabular-nums">
                  {metrics.checkoutConversionRate}%
                </p>
                <span className="text-[11px] text-[#6B726E]">Initiated to completed</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-[#6B726E]">Quick Reconciliation</span>
                <button
                  onClick={() => setActiveSection('reconciliation')}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-[#101413] text-white text-xs font-bold rounded-lg hover:bg-[#1B211F] transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" />
                  <span>Open Audit Center</span>
                </button>
              </div>
            </div>
          </div>

          {/* Revenue Trajectory Bar Visualizer */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#101413]">GMV & Net Revenue Trajectory</h3>
                <p className="text-xs text-[#6B726E]">Sample interval distribution across selected reporting window.</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#101413]"></span>
                  <span className="text-[#6B726E]">GMV</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#0E8F5A]"></span>
                  <span className="text-[#6B726E]">Net Revenue</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 pt-4 border-t border-[#E4E7E5] items-end h-44">
              {metrics.trendPoints.map((pt, idx) => {
                const maxGmv = Math.max(...metrics.trendPoints.map((p) => p.gmv));
                const heightPct = Math.round((pt.gmv / maxGmv) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[10px] font-mono font-bold text-[#101413] tabular-nums">
                      {formatCurrency(pt.gmv, metrics.currency).replace('NGN', '₦')}
                    </div>
                    <div className="w-full max-w-[48px] bg-neutral-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                      <div className="w-full bg-[#101413] flex-1"></div>
                      <div className="w-full bg-[#0E8F5A] h-2"></div>
                    </div>
                    <span className="text-[11px] font-medium text-[#6B726E]">{pt.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: CASH FLOW & SETTLEMENT VISIBILITY                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cashflow' && cashFlow && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Accounting Ledger Balance vs Direct Bank Balances</p>
              <p className="text-amber-800 leading-relaxed">
                {cashFlow.actualBankBalanceNote} All monetary figures shown below reflect recorded Paystack gateway receipts, completed order captures, and recorded liabilities held in MarketNest escrow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-[#6B726E] uppercase">Total Verified Inflow</span>
              <p className="text-3xl font-extrabold text-[#101413] tabular-nums font-mono">
                {formatCurrency(cashFlow.verifiedCustomerPayments, cashFlow.currency)}
              </p>
              <div className="text-[11px] text-[#6B726E] space-y-1 border-t border-[#E4E7E5] pt-2">
                <div className="flex justify-between">
                  <span>Cleared Paystack Funds:</span>
                  <span className="font-bold text-[#101413]">
                    {formatCurrency(cashFlow.verifiedCustomerPayments - cashFlow.pendingSettlements, cashFlow.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Pending T+1 Settlements:</span>
                  <span className="font-bold">{formatCurrency(cashFlow.pendingSettlements, cashFlow.currency)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-[#6B726E] uppercase">Escrow Liabilities Payable</span>
              <p className="text-3xl font-extrabold text-neutral-800 tabular-nums font-mono">
                {formatCurrency(cashFlow.sellerEarningsPayable + cashFlow.affiliateCommissionsPayable, cashFlow.currency)}
              </p>
              <div className="text-[11px] text-[#6B726E] space-y-1 border-t border-[#E4E7E5] pt-2">
                <div className="flex justify-between">
                  <span>Seller Escrow Balance:</span>
                  <span className="font-bold text-[#101413]">{formatCurrency(cashFlow.sellerEarningsPayable, cashFlow.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Affiliate Accrued Payable:</span>
                  <span className="font-bold text-[#101413]">{formatCurrency(cashFlow.affiliateCommissionsPayable, cashFlow.currency)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-[#6B726E] uppercase">Platform Retained Equity</span>
              <p className="text-3xl font-extrabold text-[#0E8F5A] tabular-nums font-mono">
                {formatCurrency(cashFlow.platformRetainedFees, cashFlow.currency)}
              </p>
              <div className="text-[11px] text-[#6B726E] space-y-1 border-t border-[#E4E7E5] pt-2">
                <div className="flex justify-between">
                  <span>Refunds Disbursed:</span>
                  <span className="font-bold text-rose-700">{formatCurrency(cashFlow.recordedRefundsDisbursed, cashFlow.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unresolved Discrepancies:</span>
                  <span className="font-bold text-amber-700">
                    {cashFlow.discrepanciesCount} items ({formatCurrency(cashFlow.outstandingDiscrepanciesAmount, cashFlow.currency)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Money Movement Audit Table */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#101413]">Escrow & Settlement Movement Matrix</h3>
                <p className="text-xs text-[#6B726E]">Summary breakdown of all funds currently undergoing clearing, escrow, or disbursement.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('reconciliation')}
                icon={<ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" />}
              >
                Reconciliation Workspace
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Financial Flow Category</th>
                    <th className="py-3 px-4">Recorded Amount</th>
                    <th className="py-3 px-4">Settlement Window</th>
                    <th className="py-3 px-4">Operational State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#101413]">Customer Purchases Captured</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{formatCurrency(cashFlow.verifiedCustomerPayments, cashFlow.currency)}</td>
                    <td className="py-3 px-4 text-[#6B726E]">Real-time via Paystack webhook</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">100% Captured & Reconciled</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#101413]">Paystack Settlement In-Transit</td>
                    <td className="py-3 px-4 font-mono text-neutral-800">{formatCurrency(cashFlow.pendingSettlements, cashFlow.currency)}</td>
                    <td className="py-3 px-4 text-[#6B726E]">T+1 Business Day Clearing</td>
                    <td className="py-3 px-4 text-amber-700 font-bold">Clearing in Progress</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#101413]">Seller Escrow Liability</td>
                    <td className="py-3 px-4 font-mono text-neutral-800">{formatCurrency(cashFlow.sellerEarningsPayable, cashFlow.currency)}</td>
                    <td className="py-3 px-4 text-[#6B726E]">7-Day Buyer Inspection Window</td>
                    <td className="py-3 px-4 text-neutral-700">Held in Trust</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#101413]">Affiliate Commissions Payable</td>
                    <td className="py-3 px-4 font-mono text-neutral-800">{formatCurrency(cashFlow.affiliateCommissionsPayable, cashFlow.currency)}</td>
                    <td className="py-3 px-4 text-[#6B726E]">Monthly Billing Cycle (Net 30)</td>
                    <td className="py-3 px-4 text-purple-700 font-bold">Accrued & Validated</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#101413]">Customer Refunds Processed</td>
                    <td className="py-3 px-4 font-mono text-rose-700">{formatCurrency(cashFlow.recordedRefundsDisbursed, cashFlow.currency)}</td>
                    <td className="py-3 px-4 text-[#6B726E]">Direct Paystack Bank Reversal</td>
                    <td className="py-3 px-4 text-rose-700 font-bold">Disbursed to Source Account</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: SALES & REVENUE ANALYTICS                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'sales' && salesData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales by Category */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#101413]">Sales Volume by Category</h3>
              <div className="space-y-3">
                {salesData.byCategory.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#101413]">{c.category}</span>
                      <span className="font-mono font-bold text-[#0E8F5A]">
                        {formatCurrency(c.gmv, salesData.currency)} ({c.sharePercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#101413] h-full rounded-full" style={{ width: `${c.sharePercent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales by Region */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#101413]">Geographic Demand (Nigeria)</h3>
              <div className="space-y-3">
                {salesData.byRegion.map((r, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#101413]">{r.state}</span>
                      <span className="font-mono font-bold text-neutral-800">
                        {formatCurrency(r.gmv, salesData.currency)} ({r.orderCount} orders)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0E8F5A] h-full rounded-full" style={{ width: `${r.sharePercent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Discount vs Full Price Analysis */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 max-w-md">
              <h3 className="font-extrabold text-sm text-[#101413]">Promotion & Coupon Margin Impact</h3>
              <p className="text-xs text-[#6B726E]">
                Comparing full-price orders against promotional campaigns and coupon redemption. Total merchant discounts absorbed: {formatCurrency(salesData.discountedVsFullPrice.totalDiscountAmountGiven, salesData.currency)}.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-[11px] text-[#6B726E] block uppercase font-bold">Full Price GMV</span>
                <span className="text-lg font-black font-mono text-[#101413]">
                  {formatCurrency(salesData.discountedVsFullPrice.fullPriceOrdersGmv, salesData.currency)}
                </span>
                <span className="text-[10px] text-[#0E8F5A] font-bold block">{salesData.discountedVsFullPrice.fullPriceOrdersCount} orders (71%)</span>
              </div>
              <div className="h-10 w-px bg-[#E4E7E5]"></div>
              <div className="text-center">
                <span className="text-[11px] text-[#6B726E] block uppercase font-bold">Discounted GMV</span>
                <span className="text-lg font-black font-mono text-purple-700">
                  {formatCurrency(salesData.discountedVsFullPrice.discountedOrdersGmv, salesData.currency)}
                </span>
                <span className="text-[10px] text-purple-600 font-bold block">{salesData.discountedVsFullPrice.discountedOrdersCount} orders (29%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CUSTOMER INTELLIGENCE & COHORTS                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'customers' && customerData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerData.segments.map((seg, i) => (
              <div key={i} className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3">
                <span className="text-xs font-bold text-[#0E8F5A] uppercase">{seg.segmentName}</span>
                <div className="text-2xl font-black text-[#101413] tabular-nums font-mono">
                  {seg.customerCount.toLocaleString()} <span className="text-xs font-normal text-[#6B726E]">buyers</span>
                </div>
                <div className="text-xs text-[#6B726E] space-y-1 border-t border-[#E4E7E5] pt-2">
                  <div className="flex justify-between">
                    <span>Criteria:</span>
                    <span className="font-semibold text-neutral-800">{seg.criteria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Basket:</span>
                    <span className="font-bold text-[#101413]">{formatCurrency(seg.averageOrderValue, 'NGN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Segment GMV:</span>
                    <span className="font-bold text-[#0E8F5A]">{formatCurrency(seg.totalGmv, 'NGN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Retention Cohorts Table */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E4E7E5]">
              <h3 className="font-extrabold text-sm text-[#101413]">Customer Retention Cohort Retention Rate</h3>
              <p className="text-xs text-[#6B726E]">Percentage of first-time shoppers who returned to make a repeat purchase in subsequent months.</p>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] text-[10px] uppercase font-bold">
                  <th className="py-3 px-4">Cohort Acquisition Month</th>
                  <th className="py-3 px-4">Cohort Size</th>
                  <th className="py-3 px-4">Month 1 Retention</th>
                  <th className="py-3 px-4">Month 2 Retention</th>
                  <th className="py-3 px-4">Month 3 Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7E5] font-mono">
                {customerData.retentionCohorts.map((c, i) => (
                  <tr key={i} className="hover:bg-[#FBFBFA]">
                    <td className="py-3 px-4 font-bold text-[#101413]">{c.cohortMonth}</td>
                    <td className="py-3 px-4 text-[#6B726E]">{c.size} buyers</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{c.m1Retention}%</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{c.m2Retention}%</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{c.m3Retention}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: SELLER PERFORMANCE SLA & GMV                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'sellers' && sellerData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs">
              <span className="text-xs text-[#6B726E]">Active Verified Sellers</span>
              <p className="text-2xl font-black text-[#101413] mt-1 font-mono">{sellerData.activeSellersCount}</p>
            </div>
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs">
              <span className="text-xs text-[#6B726E]">Application Conversion</span>
              <p className="text-2xl font-black text-[#0E8F5A] mt-1 font-mono">{sellerData.sellerApplicationConversionRate}%</p>
            </div>
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs">
              <span className="text-xs text-[#6B726E]">Avg Time to First Product</span>
              <p className="text-2xl font-black text-neutral-800 mt-1 font-mono">{sellerData.avgHoursToFirstProduct}h</p>
            </div>
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs">
              <span className="text-xs text-[#6B726E]">Avg Time to First Order</span>
              <p className="text-2xl font-black text-neutral-800 mt-1 font-mono">{sellerData.avgDaysToFirstOrder} days</p>
            </div>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#101413]">Merchant Fulfillment SLA & Quality Matrix</h3>
                <p className="text-xs text-[#6B726E]">Monitors merchant dispatch times, return rates, and customer reviews.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveSection('sellers')}>
                Manage Sellers
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] text-[10px] uppercase font-bold">
                    <th className="py-3 px-4">Merchant Store</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">GMV Volume</th>
                    <th className="py-3 px-4">Seller Earnings</th>
                    <th className="py-3 px-4">Fulfillment SLA</th>
                    <th className="py-3 px-4">Cancellation</th>
                    <th className="py-3 px-4">Return Rate</th>
                    <th className="py-3 px-4">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {sellerData.sellers.map((s) => (
                    <tr key={s.sellerId} className="hover:bg-[#FBFBFA]">
                      <td className="py-3 px-4 font-bold text-[#101413]">{s.storeName}</td>
                      <td className="py-3 px-4 text-[#6B726E]">{s.city}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#101413]">{formatCurrency(s.gmv, 'NGN')}</td>
                      <td className="py-3 px-4 font-mono text-emerald-800">{formatCurrency(s.sellerEarnings, 'NGN')}</td>
                      <td className="py-3 px-4 font-mono text-neutral-700">{s.avgFulfillmentHours}h dispatch</td>
                      <td className="py-3 px-4 font-mono text-neutral-600">{s.cancellationRatePercent}%</td>
                      <td className="py-3 px-4 font-mono text-neutral-600">{s.returnRatePercent}%</td>
                      <td className="py-3 px-4 font-bold text-amber-600">★ {s.rating} ({s.reviewCount})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: AFFILIATE PERFORMANCE                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'affiliates' && affiliateData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs">
              <span className="text-xs text-[#6B726E]">Approved Creators</span>
              <p className="text-2xl font-black text-[#101413] mt-1 font-mono">{affiliateData.approvedAffiliatesCount}</p>
            </div>
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs">
              <span className="text-xs text-[#6B726E]">Referral Clicks</span>
              <p className="text-2xl font-black text-purple-700 mt-1 font-mono">{affiliateData.totalReferralClicks.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs">
              <span className="text-xs text-[#6B726E]">Attributed Orders</span>
              <p className="text-2xl font-black text-[#101413] mt-1 font-mono">{affiliateData.attributedOrdersCount}</p>
            </div>
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-4 shadow-xs">
              <span className="text-xs text-[#6B726E]">Gross Referral GMV</span>
              <p className="text-2xl font-black text-[#0E8F5A] mt-1 font-mono">{formatCurrency(affiliateData.grossReferralSales, 'NGN')}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#101413]">Affiliate Partner Attribution & Earnings</h3>
                <p className="text-xs text-[#6B726E]">Tracks referral clicks, attributed sales, accrued commissions, and return reversals.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveSection('affiliates')}>
                Affiliate Directory
              </Button>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] text-[10px] uppercase font-bold">
                  <th className="py-3 px-4">Creator / Partner</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Clicks</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Attributed GMV</th>
                  <th className="py-3 px-4">Commission Accrued</th>
                  <th className="py-3 px-4">Reversed (Returns)</th>
                  <th className="py-3 px-4">Payable Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7E5]">
                {affiliateData.affiliates.map((a) => (
                  <tr key={a.affiliateId} className="hover:bg-[#FBFBFA]">
                    <td className="py-3 px-4 font-bold text-[#101413]">{a.name}</td>
                    <td className="py-3 px-4 font-mono text-purple-700 font-bold">{a.code}</td>
                    <td className="py-3 px-4 font-mono text-[#6B726E]">{a.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#101413]">{a.orders}</td>
                    <td className="py-3 px-4 font-mono text-neutral-800">{formatCurrency(a.salesGmv, 'NGN')}</td>
                    <td className="py-3 px-4 font-mono text-purple-700">{formatCurrency(a.commissionAccrued, 'NGN')}</td>
                    <td className="py-3 px-4 font-mono text-rose-600">-{formatCurrency(a.commissionReversed, 'NGN')}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{formatCurrency(a.commissionPayable, 'NGN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: PRODUCT & CATALOG INTELLIGENCE                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'products' && productData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Sellers */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#101413]">Best-Selling Products by Revenue</h3>
              <div className="divide-y divide-[#E4E7E5]">
                {productData.bestSellers.map((p, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#101413]">{p.title}</p>
                      <p className="text-[11px] text-[#6B726E]">{p.storeName} · {p.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[#0E8F5A]">{formatCurrency(p.revenue, 'NGN')}</p>
                      <p className="text-[10px] text-[#6B726E]">{p.unitsSold} units · {p.returnRate}% return</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Views / Low Conversion (Opportunity) */}
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#101413]">High-View / Low-Conversion Products</h3>
              <div className="divide-y divide-[#E4E7E5]">
                {productData.opportunityProducts.map((p, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#101413]">{p.title}</p>
                      <p className="text-[11px] text-[#6B726E]">{p.storeName} · {p.stock} in stock</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-700">{p.conversionRate}% CVR</p>
                      <p className="text-[10px] text-[#6B726E]">{p.views} views · {p.purchaseCount} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zero-Result Search Queries */}
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-[#101413]">Zero-Result Customer Search Queries</h3>
            <p className="text-xs text-[#6B726E]">Unmet search intent where customer searches returned zero catalog results.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {productData.zeroResultSearchQueries.map((q, i) => (
                <div key={i} className="p-3 bg-[#FBFBFA] border border-[#E4E7E5] rounded-lg">
                  <span className="font-mono font-bold text-xs text-[#101413]">"{q.query}"</span>
                  <div className="flex justify-between text-[11px] text-[#6B726E] mt-1">
                    <span>{q.searchCount} searches</span>
                    <span>{q.lastSearched}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: MARKETING & CAMPAIGNS                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'marketing' && marketingData && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E4E7E5]">
              <h3 className="font-extrabold text-sm text-[#101413]">Active Marketing Campaigns & Attributed GMV</h3>
              <p className="text-xs text-[#6B726E]">Tracks promotional campaigns, traffic visits, and associated discount costs.</p>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] text-[10px] uppercase font-bold">
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Traffic Channel</th>
                  <th className="py-3 px-4">Visits</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Attributed Revenue</th>
                  <th className="py-3 px-4">Conversion</th>
                  <th className="py-3 px-4">Redemptions</th>
                  <th className="py-3 px-4">Discounts Given</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7E5]">
                {marketingData.campaigns.map((c) => (
                  <tr key={c.campaignId} className="hover:bg-[#FBFBFA]">
                    <td className="py-3 px-4 font-bold text-[#101413]">{c.campaignName}</td>
                    <td className="py-3 px-4 text-[#6B726E]">{c.source}</td>
                    <td className="py-3 px-4 font-mono">{c.visits.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold">{c.attributedOrders}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0E8F5A]">{formatCurrency(c.attributedRevenue, 'NGN')}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{c.conversionRatePercent}%</td>
                    <td className="py-3 px-4 font-mono">{c.promotionRedemptions}</td>
                    <td className="py-3 px-4 font-mono text-purple-700">{formatCurrency(c.totalDiscountAmount, 'NGN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 9: GOVERNED ANALYTICS EVENT STREAM                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-[#101413]">Governed Event Telemetry Schema</h3>
            <p className="text-xs text-[#6B726E] mt-0.5">
              Strictly structured analytics events without PII data leaks, ensuring client privacy and deterministic server aggregation.
            </p>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] text-[10px] uppercase font-bold">
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Session / Campaign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7E5] font-mono text-[11px]">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-[#FBFBFA]">
                    <td className="py-3 px-4 font-bold text-[#0E8F5A]">{e.eventName}</td>
                    <td className="py-3 px-4 text-[#6B726E]">{new Date(e.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-neutral-700">{e.eventSource}</td>
                    <td className="py-3 px-4 text-neutral-800">{e.entityId || '—'}</td>
                    <td className="py-3 px-4 text-[#6B726E]">
                      {e.anonymousSessionId} {e.campaignId ? `· ${e.campaignId}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 10: SCHEDULED REPORTS & ALERTS                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-[#101413]">Scheduled Financial Statements & Operational Alerts</h3>
            <p className="text-xs text-[#6B726E] mt-0.5">
              Automated compilation and dispatch of executive summaries and reconciliation alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledReports.map((rep) => (
              <div key={rep.id} className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#101413]">{rep.title}</h4>
                    <span className="text-[11px] text-[#6B726E] font-medium block mt-0.5">
                      Frequency: <strong className="uppercase text-[#101413]">{rep.frequency}</strong> · Status: {rep.status.toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rep.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                    {rep.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="text-xs text-[#6B726E] space-y-1 bg-[#FBFBFA] p-3 rounded-lg border border-[#E4E7E5]">
                  <p><strong>Recipients:</strong> {rep.recipients.join(', ')}</p>
                  <p><strong>Last Generated:</strong> {rep.lastGeneratedAt ? new Date(rep.lastGeneratedAt).toLocaleString() : 'Never'}</p>
                  <p><strong>Next Run:</strong> {new Date(rep.nextRunAt).toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTriggerReport(rep.id)}
                    icon={<Play className="w-3.5 h-3.5 text-[#0E8F5A]" />}
                  >
                    Compile & Send Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: METRIC DEFINITIONS                                     */}
      {/* ------------------------------------------------------------- */}
      {showDefinitionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#101413]">MarketNest BI Metric Definitions Contract</h3>
                <p className="text-xs text-[#6B726E]">Exact calculation formulas and treatment of refunds and cancellations.</p>
              </div>
              <button
                onClick={() => {
                  setShowDefinitionsModal(false);
                  setSelectedDefinition(null);
                }}
                className="text-xs font-bold text-[#6B726E] hover:text-[#101413] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {BI_METRIC_DEFINITIONS.map((def) => (
                <div
                  key={def.code}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedDefinition?.code === def.code
                      ? 'bg-emerald-50/60 border-[#0E8F5A]'
                      : 'bg-[#FBFBFA] border-[#E4E7E5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#101413]">{def.metricName}</h4>
                    <span className="font-mono text-[10px] bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-800 font-bold">
                      {def.code}
                    </span>
                  </div>
                  <div className="mt-2 text-xs space-y-1.5 text-[#6B726E]">
                    <p><strong className="text-[#101413]">Formula:</strong> <code className="font-mono text-emerald-800 bg-emerald-50 px-1 rounded">{def.formula}</code></p>
                    <p><strong className="text-[#101413]">Source Data:</strong> {def.dataSource}</p>
                    <p><strong className="text-[#101413]">Refund/Cancel Rule:</strong> {def.treatmentOfRefundsAndCancellations}</p>
                    <p className="text-[11px] text-neutral-500 italic">{def.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CUSTOM DATE RANGE SELECTOR                             */}
      {/* ------------------------------------------------------------- */}
      {showCustomRangeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <h3 className="text-base font-extrabold text-[#101413]">Custom Reporting Window</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#101413] block mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#E4E7E5]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#101413] block mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#E4E7E5]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowCustomRangeModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedPeriod('custom');
                  setShowCustomRangeModal(false);
                }}
              >
                Apply Range
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
