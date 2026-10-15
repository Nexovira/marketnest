/**
 * @file src/pages/admin/AdminAiInsightsPage.tsx
 * Admin AI Intelligence Command Center for MarketNest.
 * Incorporates:
 * - Aggregated Marketplace Diagnostics (checkout friction, category velocity)
 * - AI Content Moderation Queue with human-in-the-loop decisions
 * - Automation Jobs Tracker (idempotent inventory alerts & reconciliation)
 * - AI Provider Usage, Latency & Cost Controls
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { aiService } from '../../services/aiService';
import {
  AIAdminMarketplaceInsight,
  AIModerationRecommendation,
  AIUsageMetrics,
  AutomationJob
} from '../../types';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  BarChart3,
  ShieldAlert,
  Cpu,
  Clock,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';

export const AdminAiInsightsPage: React.FC = () => {
  const { setActiveSection } = useAdmin();

  const [activeTab, setActiveTab] = useState<'insights' | 'moderation' | 'automation' | 'usage'>('insights');
  const [insights, setInsights] = useState<AIAdminMarketplaceInsight[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<AIUsageMetrics | null>(null);
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Moderation state
  const [moderationText, setModerationText] = useState('100% replica luxury sneakers direct from factory');
  const [moderationResult, setModerationResult] = useState<AIModerationRecommendation | null>(null);
  const [scanningModeration, setScanningModeration] = useState(false);
  const [runningJob, setRunningJob] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [insData, usageData, jobsData] = await Promise.all([
        aiService.getAdminMarketplaceInsights(),
        aiService.getAiUsageMetrics(),
        aiService.getAutomationJobs()
      ]);
      setInsights(insData || []);
      setUsageMetrics(usageData || null);
      setJobs(jobsData || []);
    } catch (err) {
      console.warn('Error loading AI insights data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleScanModeration = async () => {
    if (!moderationText.trim()) return;
    setScanningModeration(true);
    try {
      const res = await aiService.scanContentModeration({
        targetId: 'listing_scan_preview',
        targetType: 'product',
        title: 'Custom Scanned Merchant Item',
        text: moderationText
      });
      setModerationResult(res);
    } catch (err) {
      console.warn('Moderation scan error:', err);
    } finally {
      setScanningModeration(false);
    }
  };

  const handleTriggerAutomation = async (type: string, entityType: string, entityId: string) => {
    setRunningJob(true);
    try {
      await aiService.runAutomationJob(type, entityType, entityId);
      await loadAllData();
    } catch (err) {
      console.warn('Trigger automation error:', err);
    } finally {
      setRunningJob(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#101413] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E8F5A]/20 text-[#A7E2C9] text-xs font-semibold border border-[#0E8F5A]/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>MarketNest Enterprise Intelligence & Automation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AI Operations & Cost Controls
          </h1>
          <p className="text-xs sm:text-sm text-[#A0A5A3] leading-relaxed">
            Authorized admin portal for platform diagnostics, content moderation scanning, automated background jobs, and real-time LLM token cost telemetry.
          </p>
        </div>

        {usageMetrics && (
          <div className="mt-4 sm:mt-0 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
            <span className="text-[10px] font-bold text-white/80 block uppercase tracking-wider">
              Cumulative Cost
            </span>
            <div className="text-xl font-extrabold text-[#A7E2C9] my-0.5">
              ${usageMetrics.estimatedCostUsd}
            </div>
            <span className="text-[10px] text-white/60 block">
              {usageMetrics.totalRequests} Requests · {usageMetrics.avgLatencyMs}ms Avg Latency
            </span>
          </div>
        )}
      </div>

      {/* Operational Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7E5] overflow-x-auto pb-1">
        {[
          { id: 'insights', label: 'Platform Diagnostics', icon: Activity },
          { id: 'moderation', label: 'Content Moderation Scan', icon: ShieldAlert },
          { id: 'automation', label: 'Automation Jobs Queue', icon: Zap },
          { id: 'usage', label: 'Usage & Cost Accounting', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#101413] text-white shadow-xs'
                  : 'text-[#6B726E] hover:text-[#101413] hover:bg-[#F7F5F0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Platform Diagnostics */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#101413]">Cross-Platform Operational Bottlenecks</h3>
                <p className="text-xs text-[#6B726E]">
                  Aggregated telemetry across checkout flows, logistics hubs, and buyer dispute tickets.
                </p>
              </div>
              <button
                onClick={loadAllData}
                className="flex items-center gap-1.5 text-xs text-[#0E8F5A] font-semibold hover:underline cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Insights</span>
              </button>
            </div>

            <div className="divide-y divide-[#E4E7E5]">
              {insights.map((ins) => (
                <div key={ins.id} className="p-6 space-y-4 hover:bg-[#FBFBFA] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {ins.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-bold text-sm text-[#101413]">{ins.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-[#0E8F5A] bg-[#E8F5EF] px-2.5 py-0.5 rounded-md">
                      {ins.metricSummary}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F7F5F0] rounded-xl p-3.5 space-y-1">
                      <span className="text-[10px] font-bold text-[#6B726E] uppercase block">
                        Observed Empirical Trend
                      </span>
                      <p className="text-xs text-[#101413] leading-relaxed">
                        {ins.observedTrend}
                      </p>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 space-y-1">
                      <span className="text-[10px] font-bold text-[#0E8F5A] uppercase block">
                        Suggested Administrative Intervention
                      </span>
                      <p className="text-xs text-[#101413] leading-relaxed">
                        {ins.suggestedIntervention}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#6B726E]">
                    <span>Sample: {ins.sampleSize} ({ins.period})</span>
                    {ins.reportLink && (
                      <button
                        onClick={() => {
                          if (ins.reportLink?.includes('operations')) setActiveSection('operations');
                          else if (ins.reportLink?.includes('support')) setActiveSection('support');
                        }}
                        className="font-bold text-[#0E8F5A] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Content Moderation Scan */}
      {activeTab === 'moderation' && (
        <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#101413]">AI-Assisted Content Quality & Moderation Scanner</h3>
            <p className="text-xs text-[#6B726E]">
              Evaluate candidate product listings, customer reviews, or chat messages against counterfeit indicators, off-platform payment circumvention, and hazardous materials.
            </p>
          </div>

          <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-4 space-y-3">
            <label className="block text-xs font-bold text-[#101413]">
              Sample Content to Scan
            </label>
            <textarea
              rows={3}
              value={moderationText}
              onChange={(e) => setModerationText(e.target.value)}
              placeholder="Paste product description or review text to evaluate..."
              className="w-full bg-white border border-[#E4E7E5] rounded-lg p-3 text-xs text-[#101413] focus:outline-hidden focus:border-[#101413]"
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                loading={scanningModeration}
                onClick={handleScanModeration}
                leftIcon={<ShieldAlert className="w-4 h-4" />}
              >
                Scan with AI Guardrails
              </Button>
            </div>
          </div>

          {moderationResult && (
            <div className="border border-[#E4E7E5] rounded-xl p-5 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      moderationResult.riskScore >= 70
                        ? 'bg-rose-500'
                        : moderationResult.riskScore >= 30
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <h4 className="font-bold text-sm text-[#101413]">
                    Scan Result: Risk Score {moderationResult.riskScore} / 100
                  </h4>
                </div>
                <span
                  className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                    moderationResult.suggestedAction === 'flag_for_review'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Recommendation: {moderationResult.suggestedAction.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-[#6B726E] leading-relaxed">
                {moderationResult.rationale}
              </p>

              {moderationResult.flagReasons.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 block">Flagged Violations:</span>
                  <ul className="text-xs text-rose-900 list-disc list-inside space-y-0.5">
                    {moderationResult.flagReasons.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-[#FBFBFA] border border-[#E4E7E5] rounded-lg p-3 text-[11px] text-[#6B726E] flex items-center justify-between">
                <span>Human-in-the-Loop Policy: AI cannot unilaterally suspend accounts or remove listings without staff verification.</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setModerationResult(null)}>
                    Dismiss
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#101413] hover:bg-[#1B211F] text-white"
                    onClick={() => {
                      alert('Listing added to Admin Moderation Review queue.');
                      setModerationResult(null);
                    }}
                  >
                    Confirm Human Action
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Automation Jobs Queue */}
      {activeTab === 'automation' && (
        <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden space-y-0">
          <div className="p-5 border-b border-[#E4E7E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-[#101413]">Idempotent Automation Jobs</h3>
              <p className="text-xs text-[#6B726E]">
                Reliable background tasks executing stock threshold alerts, affiliate reconciliation, and retry queues.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                loading={runningJob}
                onClick={() => handleTriggerAutomation('inventory_alert', 'product', 'prod_leather_loafers')}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Trigger Inventory Scan
              </Button>
              <Button
                variant="outline"
                size="sm"
                loading={runningJob}
                onClick={() => handleTriggerAutomation('affiliate_reconciliation', 'commission', 'comm_latest')}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Reconcile Affiliates
              </Button>
            </div>
          </div>

          <div className="divide-y divide-[#E4E7E5]">
            {jobs.map((job) => (
              <div key={job.id} className="p-5 hover:bg-[#FBFBFA] transition-colors flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#101413]">{job.id}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {job.status}
                    </span>
                    <span className="text-xs text-[#6B726E] font-mono capitalize">
                      {job.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B726E]">
                    Target Entity: <span className="font-semibold text-[#101413]">{job.entityType}</span> ({job.entityId})
                    {job.details && ` · ${JSON.stringify(job.details)}`}
                  </p>
                  <span className="text-[10px] text-[#A0A5A3]">
                    Scheduled: {new Date(job.scheduledAt).toLocaleString()} · Attempt {job.attemptCount}/{job.maxRetries}
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#0E8F5A] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AI Usage & Cost Accounting */}
      {activeTab === 'usage' && usageMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-[#6B726E]">Total Invocations</span>
              <div className="text-2xl font-bold text-[#101413]">{usageMetrics.totalRequests}</div>
              <span className="text-[11px] text-[#0E8F5A] font-semibold">{usageMetrics.successfulRequests} successful</span>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-[#6B726E]">Average Latency</span>
              <div className="text-2xl font-bold text-[#101413]">{usageMetrics.avgLatencyMs} ms</div>
              <span className="text-[11px] text-[#6B726E]">Across all live endpoints</span>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-[#6B726E]">Total Tokens Processed</span>
              <div className="text-2xl font-bold text-[#101413]">
                {(usageMetrics.estimatedPromptTokens + usageMetrics.estimatedCompletionTokens).toLocaleString()}
              </div>
              <span className="text-[11px] text-[#6B726E]">
                {usageMetrics.estimatedPromptTokens.toLocaleString()} in / {usageMetrics.estimatedCompletionTokens.toLocaleString()} out
              </span>
            </div>

            <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-[#6B726E]">Estimated Gemini Cost</span>
              <div className="text-2xl font-bold text-[#0E8F5A]">
                ${usageMetrics.estimatedCostUsd}
              </div>
              <span className="text-[11px] text-[#6B726E]">~₦{(usageMetrics.estimatedCostUsd * 1550).toFixed(2)} NGN</span>
            </div>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#101413]">Endpoint Breakdown</h3>
                <p className="text-xs text-[#6B726E]">Invocation volume and latency per feature module.</p>
              </div>
              <div className="text-xs font-mono bg-[#F7F5F0] px-3 py-1 rounded text-[#101413]">
                Active Engine: <strong>{usageMetrics.activeProvider}</strong>
              </div>
            </div>

            <div className="divide-y divide-[#E4E7E5]">
              {usageMetrics.featureBreakdown.map((feat, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#101413] capitalize">{feat.feature.replace('_', ' ')}</span>
                    <span className="text-[11px] text-[#6B726E] block font-mono">
                      {feat.tokens.toLocaleString()} tokens · {feat.avgLatencyMs}ms avg
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#101413]">{feat.requests} calls</span>
                    <span className="text-[10px] text-emerald-600 block">{feat.failures} errors</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
