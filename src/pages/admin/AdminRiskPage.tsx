/**
 * @file src/pages/admin/AdminRiskPage.tsx
 * MarketNest Central Risk Management, Fraud Prevention & Governance Center.
 * Route: /admin/risk
 * Implements:
 * - Executive Risk Overview (Prevented Fraud Losses, Severity Distribution, Trend Analytics)
 * - Human-in-the-Loop Case Management & Investigation Dossiers (Score Factor breakdowns)
 * - Proportional Governance Enforcement (Order Holds, Escrow Adjustments, Commission Quarantine)
 * - Buyer vs Seller Dispute Resolution & Paystack Chargeback 72h Tracking
 * - Seller Compliance SLA Monitoring & Affiliate Attribution Integrity
 * - Live Explainable Rules Evaluation Simulator
 * - Immutable Governance Audit Trail with Anti-Formula-Injection CSV Export
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  RiskOverviewSummary,
  RiskCase,
  RiskCaseCategory,
  RiskSeverity,
  MarketplaceDispute,
  SellerGovernanceMetrics,
  AffiliateIntegrityMetrics,
  RiskAuditLog,
  GovernanceActionType,
  RiskEvaluationPayload,
  RiskEvaluationResult
} from '../../types';
import { riskService } from '../../services/riskService';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Download,
  Clock,
  UserCheck,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Lock,
  RefreshCw,
  Send,
  Flag,
  Percent,
  Activity,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle,
  CreditCard
} from 'lucide-react';

type RiskTab =
  | 'overview'
  | 'cases'
  | 'disputes'
  | 'sellers'
  | 'affiliates'
  | 'simulator'
  | 'audit-logs';

export const AdminRiskPage: React.FC = () => {
  const { adminProfile, hasPermission, requestConfirm } = useAdmin();

  // Navigation State
  const [activeTab, setActiveTab] = useState<RiskTab>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data State
  const [overview, setOverview] = useState<RiskOverviewSummary | null>(null);
  const [cases, setCases] = useState<RiskCase[]>([]);
  const [disputes, setDisputes] = useState<MarketplaceDispute[]>([]);
  const [sellers, setSellers] = useState<SellerGovernanceMetrics[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateIntegrityMetrics[]>([]);
  const [auditLogs, setAuditLogs] = useState<RiskAuditLog[]>([]);

  // Filter State for Cases Queue
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUserRole, setSelectedUserRole] = useState<string>('all');

  // Case Dossier Modal State
  const [selectedCase, setSelectedCase] = useState<RiskCase | null>(null);
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);

  // Governance Action Dialog State
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [selectedActionType, setSelectedActionType] = useState<GovernanceActionType>('order_fulfillment_hold');
  const [actionReason, setActionReason] = useState<string>('');
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);

  // Dispute Mediation Modal State
  const [selectedDispute, setSelectedDispute] = useState<MarketplaceDispute | null>(null);
  const [mediationRuling, setMediationRuling] = useState<'refund_buyer' | 'favor_seller' | 'escalate_chargeback'>('refund_buyer');
  const [mediationNotes, setMediationNotes] = useState<string>('');
  const [isMediating, setIsMediating] = useState<boolean>(false);

  // Escrow Adjustment Modal State
  const [selectedSeller, setSelectedSeller] = useState<SellerGovernanceMetrics | null>(null);
  const [newEscrowDays, setNewEscrowDays] = useState<number>(14);
  const [escrowReason, setEscrowReason] = useState<string>('');
  const [isAdjustingEscrow, setIsAdjustingEscrow] = useState<boolean>(false);

  // Affiliate Quarantine Modal State
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateIntegrityMetrics | null>(null);
  const [quarantineAction, setQuarantineAction] = useState<'quarantine' | 'release' | 'clawback'>('quarantine');
  const [quarantineAmount, setQuarantineAmount] = useState<number>(45000);
  const [quarantineReason, setQuarantineReason] = useState<string>('');
  const [isAdjustingQuarantine, setIsAdjustingQuarantine] = useState<boolean>(false);

  // Rule Simulator State
  const [simPayload, setSimPayload] = useState<RiskEvaluationPayload>({
    amountMinorUnits: 38500000,
    customerEmail: 'adeleke99@tempmail.io',
    customerState: 'Kano',
    shippingState: 'Lagos',
    failedPaymentCount: 2,
    promoCode: 'WELCOME15',
    affiliateRef: 'TECHHUB25'
  });
  const [simResult, setSimResult] = useState<RiskEvaluationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Feedback State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Data Load
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ov, cs, ds, sl, af, lg] = await Promise.all([
        riskService.getRiskOverview(),
        riskService.getRiskCases({
          category: selectedCategory,
          severity: selectedSeverity,
          status: selectedStatus,
          userRole: selectedUserRole,
          search: searchQuery
        }),
        riskService.getDisputes(),
        riskService.getSellerGovernance(),
        riskService.getAffiliateIntegrity(),
        riskService.getAuditLogs()
      ]);
      setOverview(ov);
      setCases(cs);
      setDisputes(ds);
      setSellers(sl);
      setAffiliates(af);
      setAuditLogs(lg);
    } catch (err) {
      console.error('[AdminRiskPage] Error loading risk data:', err);
      showToast('error', 'Failed to load risk telemetry. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedSeverity, selectedStatus, selectedUserRole, searchQuery]);

  // Handle Note Submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNoteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      const newNote = await riskService.addInvestigationNote(selectedCase.id, {
        adminId: adminProfile.id,
        adminName: adminProfile.name,
        adminRole: adminProfile.role,
        content: newNoteContent
      });
      setSelectedCase((prev) =>
        prev ? { ...prev, internalNotes: [...prev.internalNotes, newNote] } : null
      );
      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCase.id
            ? { ...c, internalNotes: [...c.internalNotes, newNote] }
            : c
        )
      );
      setNewNoteContent('');
      showToast('success', 'Investigation note recorded.');
      // Refresh logs
      const updatedLogs = await riskService.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      showToast('error', err.message || 'Error saving note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Handle Governance Action Execution
  const handleExecuteAction = async () => {
    if (!selectedCase || !actionReason.trim()) {
      showToast('error', 'Explicit rationale is mandatory for governance enforcement.');
      return;
    }

    setIsExecutingAction(true);
    try {
      const actionRecord = await riskService.applyGovernanceAction(selectedCase.id, {
        actionType: selectedActionType,
        reason: actionReason,
        administeredBy: {
          id: adminProfile.id,
          name: adminProfile.name,
          role: adminProfile.role
        }
      });

      setSelectedCase((prev) =>
        prev
          ? {
              ...prev,
              status: 'action_taken',
              actionsTaken: [...prev.actionsTaken, actionRecord]
            }
          : null
      );

      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCase.id
            ? { ...c, status: 'action_taken', actionsTaken: [...c.actionsTaken, actionRecord] }
            : c
        )
      );

      setActionModalOpen(false);
      setActionReason('');
      showToast('success', `Governance action "${actionRecord.actionLabel}" applied.`);
      const updatedLogs = await riskService.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      showToast('error', err.message || 'Error applying governance action.');
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Handle Case Whitelist / Resolution
  const handleResolveCase = async (resolutionType: 'clear' | 'whitelist') => {
    if (!selectedCase) return;

    requestConfirm({
      title: resolutionType === 'whitelist' ? 'Whitelist Entity & Clear Case' : 'Close & Clear Risk Case',
      description: `Confirm resolution for ${selectedCase.caseNumber}. This will reverse temporary holds and mark the dossier as resolved.`,
      confirmText: 'Resolve & Audit',
      requireReason: true,
      onConfirm: async (reason?: string) => {
        try {
          const updated = await riskService.resolveRiskCase(selectedCase.id, {
            resolutionType,
            rationale: reason || 'Verified legitimate activity after secondary evidence inspection.',
            adminName: adminProfile.name
          });
          setSelectedCase(updated);
          setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          showToast('success', `Case ${updated.caseNumber} resolved as cleared.`);
          const updatedLogs = await riskService.getAuditLogs();
          setAuditLogs(updatedLogs);
        } catch (err: any) {
          showToast('error', err.message || 'Error resolving case.');
        }
      }
    });
  };

  // Handle Dispute Mediation
  const handleMediateDispute = async () => {
    if (!selectedDispute || !mediationNotes.trim()) {
      showToast('error', 'Mediation rationale notes are required.');
      return;
    }

    setIsMediating(true);
    try {
      const updated = await riskService.mediateDispute(selectedDispute.id, {
        ruling: mediationRuling,
        notes: mediationNotes,
        adminName: adminProfile.name
      });
      setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDispute(null);
      setMediationNotes('');
      showToast('success', `Dispute ruling recorded for ${updated.disputeNumber}.`);
      const updatedLogs = await riskService.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      showToast('error', err.message || 'Error meditating dispute.');
    } finally {
      setIsMediating(false);
    }
  };

  // Handle Seller Escrow Adjustment
  const handleAdjustEscrow = async () => {
    if (!selectedSeller || !escrowReason.trim()) {
      showToast('error', 'Rationale reason is required.');
      return;
    }

    setIsAdjustingEscrow(true);
    try {
      const updated = await riskService.updateSellerEscrowHold(selectedSeller.sellerId, {
        escrowHoldingDays: newEscrowDays,
        reason: escrowReason,
        adminName: adminProfile.name
      });
      setSellers((prev) => prev.map((s) => (s.sellerId === updated.sellerId ? updated : s)));
      setSelectedSeller(null);
      setEscrowReason('');
      showToast('success', `Seller escrow period updated to ${newEscrowDays} days.`);
      const updatedLogs = await riskService.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      showToast('error', err.message || 'Error updating seller escrow.');
    } finally {
      setIsAdjustingEscrow(false);
    }
  };

  // Handle Affiliate Quarantine Adjustment
  const handleAdjustQuarantine = async () => {
    if (!selectedAffiliate || !quarantineReason.trim()) {
      showToast('error', 'Rationale reason is required.');
      return;
    }

    setIsAdjustingQuarantine(true);
    try {
      const updated = await riskService.adjustAffiliateCommission(selectedAffiliate.affiliateId, {
        action: quarantineAction,
        amountMinorUnits: quarantineAmount * 100,
        reason: quarantineReason,
        adminName: adminProfile.name
      });
      setAffiliates((prev) => prev.map((a) => (a.affiliateId === updated.affiliateId ? updated : a)));
      setSelectedAffiliate(null);
      setQuarantineReason('');
      showToast('success', `Affiliate commission status adjusted.`);
      const updatedLogs = await riskService.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      showToast('error', err.message || 'Error adjusting affiliate commission.');
    } finally {
      setIsAdjustingQuarantine(false);
    }
  };

  // Run Simulator
  const handleRunSimulator = async () => {
    setIsSimulating(true);
    try {
      const res = await riskService.evaluateTransaction(simPayload);
      setSimResult(res);
      showToast('success', `Evaluated. Risk Score: ${res.riskScore}/100.`);
    } catch (err) {
      showToast('error', 'Error evaluating simulated transaction.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Export CSV
  const handleExportAuditLogs = () => {
    try {
      const csvContent = riskService.exportAuditLogsCsv(auditLogs);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `marketnest-risk-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', 'Sanitized governance audit trail exported.');
    } catch (err) {
      showToast('error', 'Failed to generate CSV export.');
    }
  };

  const getSeverityBadge = (severity: RiskSeverity, score?: number) => {
    const scoreText = score !== undefined ? ` • ${score}` : '';
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            CRITICAL{scoreText}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            HIGH{scoreText}
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
            MODERATE{scoreText}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            LOW{scoreText}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Open Queue</span>;
      case 'under_investigation':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">In Investigation</span>;
      case 'action_taken':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Action Enforced</span>;
      case 'resolved_cleared':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Cleared / Whitelisted</span>;
      case 'escalated':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">Escalated (Regulatory)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-[#101413]">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-[#E8F5EF] text-[#0E8F5A] border border-[#0E8F5A]/30'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {toastMessage.text}
        </div>
      )}

      {/* Top Header & Platform Mission */}
      <div className="bg-[#101413] text-white p-6 rounded-xl shadow-xs border border-[#1B211F]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-[#0E8F5A]/20 text-[#0E8F5A] rounded-lg border border-[#0E8F5A]/30">
                <ShieldAlert className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Risk Center & Marketplace Governance</h1>
              <span className="ml-2 px-2.5 py-0.5 bg-[#0E8F5A] text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                Phase 14 Live
              </span>
            </div>
            <p className="text-sm text-[#A0A6A3] max-w-2xl">
              Explainable fraud detection, human-in-the-loop dispute mediation, and proportional trust & safety enforcement.
              Protects buyers, merchants, and affiliate partners with immutable audit governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="bg-[#1B211F] text-white border-[#2A3330] hover:bg-[#252E2B] text-xs h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Signals
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportAuditLogs}
              className="bg-[#0E8F5A] text-white hover:bg-[#0E8F5A]/90 text-xs h-9 border-none font-medium"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Audit Trail (CSV)
            </Button>
          </div>
        </div>

        {/* Dense Operational Subtabs */}
        <div className="flex items-center gap-1 mt-6 border-t border-[#1B211F] pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Risk Overview & Signals', icon: Activity },
            { id: 'cases', label: `Investigation Queue (${cases.filter((c) => c.status !== 'resolved_cleared').length})`, icon: ShieldAlert },
            { id: 'disputes', label: `Disputes & Chargebacks (${disputes.length})`, icon: RotateCcw },
            { id: 'sellers', label: 'Seller Governance & SLA', icon: UserCheck },
            { id: 'affiliates', label: 'Affiliate Attribution Integrity', icon: Sparkles },
            { id: 'simulator', label: 'Rules & Risk Simulator', icon: Lock },
            { id: 'audit-logs', label: 'Governance Audit Trail', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RiskTab)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#0E8F5A] text-white shadow-xs'
                    : 'text-[#A0A6A3] hover:text-white hover:bg-[#1B211F]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. OVERVIEW & HEALTH TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Key Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#6B726E] font-medium">
                <span>Prevented Fraud Loss</span>
                <ShieldCheck className="w-4 h-4 text-[#0E8F5A]" />
              </div>
              <div className="mt-2 text-xl font-bold text-[#101413]">
                {formatCurrency(overview.preventedFraudLossMinorUnits / 100, 'NGN')}
              </div>
              <p className="mt-1 text-xs text-[#0E8F5A] flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Protected in escrow holds
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#6B726E] font-medium">
                <span>Active Risk Queue</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 text-xl font-bold text-[#101413]">
                {overview.totalOpenCases} Cases
              </div>
              <p className="mt-1 text-xs text-[#6B726E]">
                <strong className="text-red-700">{overview.criticalCases} Critical</strong> • {overview.highPriorityCases} High priority
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#6B726E] font-medium">
                <span>Disputes & Regulatory Holds</span>
                <RotateCcw className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2 text-xl font-bold text-[#101413]">
                {overview.openDisputes} Active
              </div>
              <p className="mt-1 text-xs text-red-600 font-medium">
                {overview.pendingChargebacks} Paystack 72h window ticking
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#6B726E] font-medium">
                <span>Quarantined Commissions</span>
                <Percent className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 text-xl font-bold text-[#101413]">
                {formatCurrency(overview.quarantinedFundsMinorUnits / 100, 'NGN')}
              </div>
              <p className="mt-1 text-xs text-[#6B726E]">
                False positive rate: <span className="font-semibold text-[#101413]">{overview.falsePositiveRatePercent}%</span>
              </p>
            </div>
          </div>

          {/* Severity & Incident Distribution Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#101413]">Risk Severity & Category Matrix</h3>
                  <p className="text-xs text-[#6B726E]">Real-time explainable triage across verified operational records</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-[#E8F5EF] text-[#0E8F5A] rounded font-medium">
                  {overview.ruleTriggers24h} Signal Triggers (24h)
                </span>
              </div>

              {/* Progress Distribution */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6B726E]">
                  <span>Severity Distribution</span>
                  <span>{overview.totalOpenCases} cases triage breakdown</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  <div style={{ width: '28%' }} className="bg-red-600" title="Critical (28%)" />
                  <div style={{ width: '30%' }} className="bg-amber-500" title="High (30%)" />
                  <div style={{ width: '28%' }} className="bg-yellow-400" title="Moderate (28%)" />
                  <div style={{ width: '14%' }} className="bg-emerald-500" title="Low (14%)" />
                </div>
                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical ({overview.severityDistribution.critical})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High ({overview.severityDistribution.high})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Moderate ({overview.severityDistribution.moderate})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low ({overview.severityDistribution.low})</span>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="border border-[#E4E7E5] rounded-lg overflow-hidden mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                    <tr>
                      <th className="p-2.5 font-semibold">Governance Domain</th>
                      <th className="p-2.5 font-semibold text-center">Incidents</th>
                      <th className="p-2.5 font-semibold">Typical Enforcement Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7E5]">
                    {overview.categoryDistribution.map((cat) => (
                      <tr key={cat.category} className="hover:bg-gray-50/60">
                        <td className="p-2.5 font-medium text-[#101413]">{cat.categoryLabel}</td>
                        <td className="p-2.5 text-center font-bold">{cat.count}</td>
                        <td className="p-2.5 text-[#6B726E]">
                          {cat.category === 'payment_fraud' && 'Order hold & secondary phone verification'}
                          {cat.category === 'seller_abuse' && 'Escrow hold extension (7d -> 21d)'}
                          {cat.category === 'affiliate_fraud' && 'Commission quarantine & attribution audit'}
                          {cat.category === 'promotion_abuse' && 'Cluster voucher deduplication & block'}
                          {cat.category === 'dispute_chargeback' && 'Carrier delivery waybill compilation'}
                          {cat.category === 'counterfeit_catalog' && 'Shadow moderation & invoice request'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7-Day Trend Analytics */}
            <div className="p-5 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#101413]">7-Day Resolution Velocity</h3>
                <p className="text-xs text-[#6B726E]">Flagged vs Actioned vs Cleared</p>
              </div>

              <div className="space-y-3">
                {overview.recentTrends.map((trend) => (
                  <div key={trend.date} className="flex items-center justify-between text-xs pb-1.5 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-[#6B726E] w-16">{trend.date}</span>
                    <div className="flex-1 mx-3 flex items-center gap-1.5">
                      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden flex">
                        <div style={{ width: `${(trend.flagged / 10) * 100}%` }} className="bg-amber-400" title={`Flagged: ${trend.flagged}`} />
                        <div style={{ width: `${(trend.cleared / 10) * 100}%` }} className="bg-emerald-500" title={`Cleared: ${trend.cleared}`} />
                      </div>
                    </div>
                    <span className="text-[#101413] font-semibold text-right w-24">
                      {trend.flagged} flag / {trend.cleared} clear
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E4E7E5] text-xs text-[#6B726E] space-y-1">
                <p className="font-semibold text-[#101413] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" /> Non-Destructive Safeguard Policy
                </p>
                <p>
                  Zero automatic account suspensions solely based on numeric scores.
                  Human investigator verification is mandatory before irreversible decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CASE DOSSIERS & INVESTIGATION QUEUE TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          {/* Dense Filter Bar */}
          <div className="p-4 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#6B726E]" />
              <input
                type="text"
                placeholder="Search case #, customer email, order number, seller store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent border-none focus:outline-hidden placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-1.5 bg-[#F7F5F0] border border-[#E4E7E5] rounded-md font-medium text-[#101413]"
              >
                <option value="all">All Risk Categories</option>
                <option value="payment_fraud">Payment Fraud</option>
                <option value="seller_abuse">Seller Governance</option>
                <option value="affiliate_fraud">Affiliate Integrity</option>
                <option value="promotion_abuse">Promotion Abuse</option>
                <option value="dispute_chargeback">Chargebacks</option>
                <option value="counterfeit_catalog">Counterfeit Catalog</option>
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="p-1.5 bg-[#F7F5F0] border border-[#E4E7E5] rounded-md font-medium text-[#101413]"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-1.5 bg-[#F7F5F0] border border-[#E4E7E5] rounded-md font-medium text-[#101413]"
              >
                <option value="all">All Case Statuses</option>
                <option value="open">Open</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="action_taken">Action Enforced</option>
                <option value="resolved_cleared">Cleared</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={selectedUserRole}
                onChange={(e) => setSelectedUserRole(e.target.value)}
                className="p-1.5 bg-[#F7F5F0] border border-[#E4E7E5] rounded-md font-medium text-[#101413]"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="affiliate">Affiliate</option>
              </select>
            </div>
          </div>

          {/* Cases Data Table */}
          <div className="bg-white rounded-xl border border-[#E4E7E5] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                  <tr>
                    <th className="p-3 font-semibold">Case Reference</th>
                    <th className="p-3 font-semibold">Subject & Target Entity</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold text-center">Score & Severity</th>
                    <th className="p-3 font-semibold">Exposure (₦)</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {cases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#6B726E]">
                        No active risk cases match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    cases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 font-mono font-medium text-[#101413]">
                          <div>{c.caseNumber}</div>
                          <span className="text-[10px] text-[#6B726E]">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="font-semibold text-[#101413] truncate">{c.title}</div>
                          <div className="text-[#6B726E] text-[11px] truncate">
                            {c.targetEntity.name} ({c.targetEntity.email})
                          </div>
                          {c.linkedIds.orderNumber && (
                            <span className="inline-block mt-0.5 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-mono">
                              {c.linkedIds.orderNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[#6B726E]">{c.categoryLabel}</td>
                        <td className="p-3 text-center">
                          {getSeverityBadge(c.severity, c.riskScore)}
                        </td>
                        <td className="p-3 font-mono font-medium text-[#101413]">
                          {formatCurrency(c.financialImpact.amountMinorUnits / 100, 'NGN')}
                        </td>
                        <td className="p-3">{getStatusBadge(c.status)}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCase(c)}
                            className="text-xs h-7 px-2.5 bg-white border-[#E4E7E5] hover:bg-[#E8F5EF] hover:text-[#0E8F5A]"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Inspect Dossier
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DISPUTES & CHARGEBACK MANAGEMENT TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-purple-600 text-white rounded-lg">
                <RotateCcw className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-purple-950">Active Buyer-Seller Mediation & Chargebacks</h3>
                <p className="text-xs text-purple-800">
                  Admin mediators enforce impartial resolutions, evidence reviews, and regulatory 72-hour Paystack claim submissions.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white text-purple-900 border border-purple-200 rounded-md text-xs font-semibold">
              3 Under Adjudication
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {disputes.map((d) => (
              <div key={d.id} className="p-5 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E7E5] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#101413]">{d.disputeNumber}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        {d.reasonLabel}
                      </span>
                      {d.chargebackReference && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Paystack Regulatory 72h Window Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B726E] mt-0.5">
                      Order: <strong className="font-mono text-[#101413]">{d.orderNumber}</strong> • Claim Amount:{' '}
                      <strong className="text-[#101413]">{formatCurrency(d.amountMinorUnits / 100, d.currency)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B726E]">
                      Deadline: <strong className="text-[#101413]">{new Date(d.deadline).toLocaleString()}</strong>
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedDispute(d);
                        setMediationNotes(d.adminMediationNotes || '');
                      }}
                      className="bg-[#0E8F5A] text-white hover:bg-[#0E8F5A]/90 text-xs h-8"
                    >
                      Mediate & Rule
                    </Button>
                  </div>
                </div>

                {/* Buyer Claim vs Seller Response */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E4E7E5] space-y-1">
                    <div className="font-bold text-[#101413] flex items-center justify-between">
                      <span>Buyer Statement: {d.buyerName}</span>
                      <span className="text-[#6B726E] font-normal">{d.buyerEmail}</span>
                    </div>
                    <p className="text-[#6B726E]">{d.buyerClaim}</p>
                    {d.buyerEvidenceUrls.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {d.buyerEvidenceUrls.map((img, i) => (
                          <a
                            key={i}
                            href={img}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 underline font-medium"
                          >
                            <FileText className="w-3 h-3" /> Proof Photo #{i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#E4E7E5] space-y-1">
                    <div className="font-bold text-[#101413] flex items-center justify-between">
                      <span>Seller Response: {d.sellerStoreName}</span>
                      <span className="text-emerald-700 font-medium">Verified Merchant</span>
                    </div>
                    <p className="text-[#6B726E]">{d.sellerResponse || 'Awaiting merchant evidence upload...'}</p>
                    {d.sellerEvidenceUrls && d.sellerEvidenceUrls.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {d.sellerEvidenceUrls.map((img, i) => (
                          <a
                            key={i}
                            href={img}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 underline font-medium"
                          >
                            <FileText className="w-3 h-3" /> Dispatch Waybill #{i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mediation Notes if already annotated */}
                {d.adminMediationNotes && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <div>
                      <strong>Internal Mediation Note:</strong> {d.adminMediationNotes}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. SELLER GOVERNANCE & SLA TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'sellers' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs">
            <h3 className="font-bold text-sm text-[#101413]">Seller Compliance & Escrow Holding Rules</h3>
            <p className="text-xs text-[#6B726E] mt-0.5">
              Tracks merchant fulfillment SLA (96-hour dispatch rule), cancellation rate, dispute ratios, and counterfeit notices.
              Escrow release duration automatically delays from standard 7 days up to 21 days for high-risk merchants.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E4E7E5] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                  <tr>
                    <th className="p-3 font-semibold">Merchant Store</th>
                    <th className="p-3 font-semibold text-center">Risk Score</th>
                    <th className="p-3 font-semibold text-center">Fulfillment SLA</th>
                    <th className="p-3 font-semibold text-center">Cancellation %</th>
                    <th className="p-3 font-semibold text-center">Dispute Rate</th>
                    <th className="p-3 font-semibold text-center">Escrow Hold</th>
                    <th className="p-3 font-semibold">Held Escrow (₦)</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {sellers.map((s) => (
                    <tr key={s.sellerId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-medium text-[#101413]">
                        <div>{s.storeName}</div>
                        <span className="text-[10px] text-[#6B726E]">{s.sellerEmail}</span>
                      </td>
                      <td className="p-3 text-center">{getSeverityBadge(s.riskScore >= 75 ? 'critical' : s.riskScore >= 40 ? 'moderate' : 'low', s.riskScore)}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={s.orderFulfillmentRate < 90 ? 'text-red-600' : 'text-emerald-700'}>
                          {s.orderFulfillmentRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center text-[#6B726E]">{s.cancellationRate}%</td>
                      <td className="p-3 text-center text-[#6B726E]">{s.disputeRate}%</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold ${
                            s.escrowHoldingDays > 7
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {s.escrowHoldingDays} Days
                        </span>
                      </td>
                      <td className="p-3 font-mono font-medium text-[#101413]">
                        {formatCurrency(s.pendingHoldAmountMinorUnits / 100, 'NGN')}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSeller(s);
                            setNewEscrowDays(s.escrowHoldingDays === 7 ? 14 : 7);
                          }}
                          className="text-xs h-7 px-2 bg-white border-[#E4E7E5] hover:bg-gray-100"
                        >
                          Adjust Escrow Hold
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

      {/* ------------------------------------------------------------- */}
      {/* 5. AFFILIATE ATTRIBUTION INTEGRITY TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'affiliates' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-blue-600 text-white rounded-lg">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-blue-950">Affiliate Attribution Integrity Monitor</h3>
                <p className="text-xs text-blue-800">
                  Detects self-referral attempts, click-farming bot traffic, and unnatural sub-5-second conversions.
                  Commissions are quarantined for 14-day anti-fraud verification before final payout approval.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E4E7E5] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                  <tr>
                    <th className="p-3 font-semibold">Affiliate Partner</th>
                    <th className="p-3 font-semibold">Code</th>
                    <th className="p-3 font-semibold text-center">Integrity Score</th>
                    <th className="p-3 font-semibold text-center">Self-Referrals</th>
                    <th className="p-3 font-semibold text-center">IP Matches</th>
                    <th className="p-3 font-semibold">Quarantined (₦)</th>
                    <th className="p-3 font-semibold">Active Payable (₦)</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {affiliates.map((a) => (
                    <tr key={a.affiliateId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-medium text-[#101413]">
                        <div>{a.affiliateName}</div>
                        <span className="text-[10px] text-[#6B726E]">{a.affiliateEmail}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#0E8F5A]">{a.affiliateCode}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            a.integrityScore < 70
                              ? 'bg-red-100 text-red-800'
                              : a.integrityScore < 90
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {a.integrityScore} / 100
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-red-700">{a.selfReferralAttempts}</td>
                      <td className="p-3 text-center text-[#6B726E]">{a.suspiciousIpMatches}</td>
                      <td className="p-3 font-mono font-bold text-amber-800">
                        {formatCurrency(a.quarantinedCommissionsMinorUnits / 100, 'NGN')}
                      </td>
                      <td className="p-3 font-mono font-medium text-[#101413]">
                        {formatCurrency(a.activeCommissionsMinorUnits / 100, 'NGN')}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAffiliate(a);
                            setQuarantineAmount(a.quarantinedCommissionsMinorUnits > 0 ? a.quarantinedCommissionsMinorUnits / 100 : 25000);
                          }}
                          className="text-xs h-7 px-2.5 bg-white border-[#E4E7E5] hover:bg-gray-100"
                        >
                          Quarantine / Release
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

      {/* ------------------------------------------------------------- */}
      {/* 6. RISK RULES & SIMULATOR TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-[#101413]">Live Transparent Rules Evaluator</h3>
              <p className="text-xs text-[#6B726E]">
                Test transaction payloads against MarketNest explainable scoring rules.
                Inspect point delta calculations and decision thresholds before committing orders.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Order Amount (₦ NGN)</label>
                <input
                  type="number"
                  value={simPayload.amountMinorUnits / 100}
                  onChange={(e) =>
                    setSimPayload({ ...simPayload, amountMinorUnits: Number(e.target.value) * 100 })
                  }
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Customer Email Address</label>
                <input
                  type="text"
                  value={simPayload.customerEmail}
                  onChange={(e) => setSimPayload({ ...simPayload, customerEmail: e.target.value })}
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B726E] font-medium mb-1">Customer Account State</label>
                  <input
                    type="text"
                    value={simPayload.customerState || ''}
                    onChange={(e) => setSimPayload({ ...simPayload, customerState: e.target.value })}
                    className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[#6B726E] font-medium mb-1">Delivery Destination State</label>
                  <input
                    type="text"
                    value={simPayload.shippingState || ''}
                    onChange={(e) => setSimPayload({ ...simPayload, shippingState: e.target.value })}
                    className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B726E] font-medium mb-1">Prior Failed Auth Count</label>
                  <input
                    type="number"
                    value={simPayload.failedPaymentCount || 0}
                    onChange={(e) =>
                      setSimPayload({ ...simPayload, failedPaymentCount: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#6B726E] font-medium mb-1">Applied Promo Code</label>
                  <input
                    type="text"
                    value={simPayload.promoCode || ''}
                    onChange={(e) => setSimPayload({ ...simPayload, promoCode: e.target.value })}
                    className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Affiliate Referral Code</label>
                <input
                  type="text"
                  value={simPayload.affiliateRef || ''}
                  onChange={(e) => setSimPayload({ ...simPayload, affiliateRef: e.target.value })}
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg uppercase"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleRunSimulator}
                disabled={isSimulating}
                className="w-full bg-[#0E8F5A] text-white hover:bg-[#0E8F5A]/90 py-2.5 font-semibold text-xs"
              >
                {isSimulating ? 'Evaluating Signals...' : 'Execute Explainable Risk Evaluation'}
              </Button>
            </div>
          </div>

          {/* Simulator Output Result */}
          <div className="p-5 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-[#101413]">Evaluation Output & Factor Audit</h3>
              <p className="text-xs text-[#6B726E]">Granular evidence breakdown produced by rules engine</p>
            </div>

            {simResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E4E7E5] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#6B726E]">Composite Risk Score</span>
                    <div className="text-3xl font-extrabold text-[#101413] mt-0.5">
                      {simResult.riskScore} <span className="text-sm font-normal text-[#6B726E]">/ 100</span>
                    </div>
                  </div>
                  <div>
                    {getSeverityBadge(simResult.severity)}
                    <div className="mt-1 text-xs text-right font-medium text-[#101413]">
                      Action: {simResult.recommendation.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-xs text-[#101413]">Explainable Scoring Factors:</h4>
                  {simResult.factors.length === 0 ? (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs">
                      Zero high-risk signals detected. Transaction qualifies for immediate auto-clearance.
                    </div>
                  ) : (
                    simResult.factors.map((f) => (
                      <div
                        key={f.id}
                        className="p-3 bg-white rounded-lg border border-[#E4E7E5] text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-[#101413]">{f.factorName}</div>
                          <p className="text-[#6B726E] text-[11px] mt-0.5">{f.reason}</p>
                        </div>
                        <span className="font-mono font-bold text-red-600 shrink-0">+{f.scoreDelta} pts</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-[#6B726E]">
                  <strong>System Summary:</strong> {simResult.summary}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#6B726E] text-xs">
                Configure parameters and click "Execute Explainable Risk Evaluation" to view real-time score factor decomposition.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. IMMUTABLE GOVERNANCE AUDIT LOG TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-[#E4E7E5] shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#101413]">Governance Audit Trail</h3>
              <p className="text-xs text-[#6B726E]">
                Immutable, append-only administrative actions record for compliance and auditing.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAuditLogs}
              className="text-xs h-8 border-[#E4E7E5] hover:bg-gray-100"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Sanitized CSV
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-[#E4E7E5] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F0] border-b border-[#E4E7E5] text-[#6B726E]">
                  <tr>
                    <th className="p-3 font-semibold">Timestamp</th>
                    <th className="p-3 font-semibold">Administrator</th>
                    <th className="p-3 font-semibold">Action Enforced</th>
                    <th className="p-3 font-semibold">Entity Target</th>
                    <th className="p-3 font-semibold">State Transition</th>
                    <th className="p-3 font-semibold">Mandatory Rationale</th>
                    <th className="p-3 font-semibold text-right">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7E5]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-mono text-[#6B726E] text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-medium text-[#101413]">
                        {log.actorName} <span className="text-[#6B726E] text-[10px]">({log.actorRole})</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-xs text-[#0E8F5A]">{log.action}</td>
                      <td className="p-3 font-mono text-[11px] text-[#101413]">
                        {log.entityType}: {log.entityId}
                      </td>
                      <td className="p-3 text-[11px] text-[#6B726E]">
                        <span className="line-through">{log.previousState}</span> →{' '}
                        <span className="font-semibold text-[#101413]">{log.newState}</span>
                      </td>
                      <td className="p-3 max-w-xs text-[11px] text-[#6B726E] truncate" title={log.reason}>
                        {log.reason}
                      </td>
                      <td className="p-3 font-mono text-right text-[#6B726E] text-[10px]">{log.clientIp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CASE DOSSIER MODAL (Human-in-the-Loop Investigation) */}
      {/* ------------------------------------------------------------- */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E4E7E5] text-xs">
            {/* Modal Header */}
            <div className="p-6 bg-[#101413] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#0E8F5A]">{selectedCase.caseNumber}</span>
                  {getSeverityBadge(selectedCase.severity, selectedCase.riskScore)}
                  {getStatusBadge(selectedCase.status)}
                </div>
                <h2 className="text-base font-bold">{selectedCase.title}</h2>
                <p className="text-xs text-[#A0A6A3]">
                  Detected via: <strong className="text-white">{selectedCase.detectionEngine}</strong> • Target:{' '}
                  <strong className="text-white">{selectedCase.targetEntity.name}</strong> ({selectedCase.targetEntity.email})
                </p>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#1B211F]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Score Factor Decomposition */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-2">
                  <h3 className="font-bold text-sm text-[#101413]">Explainable Risk Factors Decomposition</h3>
                  <span className="font-mono font-bold text-base text-red-600">
                    Total Score: {selectedCase.riskScore} / 100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCase.scoreBreakdown.map((factor) => (
                    <div key={factor.id} className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E4E7E5] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#101413]">{factor.factorName}</span>
                        <span className="font-mono font-bold text-red-700">+{factor.scoreDelta} pts</span>
                      </div>
                      <p className="text-[#6B726E] text-[11px]">{factor.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Identifiers & Financial Exposure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-[#E4E7E5]">
                <div>
                  <span className="text-[#6B726E] text-[11px]">Financial Exposure</span>
                  <div className="font-bold text-sm font-mono text-[#101413]">
                    {formatCurrency(selectedCase.financialImpact.amountMinorUnits / 100, selectedCase.financialImpact.currency)}
                  </div>
                </div>
                {selectedCase.linkedIds.orderNumber && (
                  <div>
                    <span className="text-[#6B726E] text-[11px]">Linked Order</span>
                    <div className="font-mono font-bold text-sm text-blue-700">
                      {selectedCase.linkedIds.orderNumber}
                    </div>
                  </div>
                )}
                {selectedCase.linkedIds.sellerName && (
                  <div>
                    <span className="text-[#6B726E] text-[11px]">Associated Merchant</span>
                    <div className="font-bold text-sm text-[#101413]">{selectedCase.linkedIds.sellerName}</div>
                  </div>
                )}
              </div>

              {/* Enforced Governance Actions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-2">
                  <h3 className="font-bold text-sm text-[#101413]">Enforced Governance Actions</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActionModalOpen(true)}
                    className="bg-[#0E8F5A] text-white hover:bg-[#0E8F5A]/90 text-xs h-7"
                  >
                    + Enforce Action
                  </Button>
                </div>

                {selectedCase.actionsTaken.length === 0 ? (
                  <p className="text-[#6B726E] italic">No active restrictive action has been enforced on this record yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCase.actionsTaken.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-amber-950 flex items-center gap-2">
                            <span>{act.actionLabel}</span>
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                              {act.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-amber-800 text-[11px] mt-0.5">{act.reason}</p>
                          <span className="text-[10px] text-[#6B726E]">
                            By: {act.administeredBy.name} • {new Date(act.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Internal Investigation Notes Thread */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#101413] border-b border-[#E4E7E5] pb-2">
                  Administrative Investigation Notes
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCase.internalNotes.length === 0 ? (
                    <p className="text-[#6B726E] italic">No investigator notes recorded yet.</p>
                  ) : (
                    selectedCase.internalNotes.map((n) => (
                      <div key={n.id} className="p-3 bg-[#F7F5F0] rounded-lg border border-[#E4E7E5] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#101413]">{n.adminName} ({n.adminRole})</span>
                          <span className="text-[#6B726E]">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[#101413]">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Record factual investigation note, telephone verification, or carrier update..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="flex-1 p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg text-xs"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmittingNote || !newNoteContent.trim()}
                    className="bg-[#101413] text-white hover:bg-[#1B211F] text-xs px-4"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Record Note
                  </Button>
                </form>
              </div>

              {/* Resolution Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E4E7E5]">
                <div className="text-[11px] text-[#6B726E]">
                  Case Status: <strong>{selectedCase.status.toUpperCase()}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveCase('clear')}
                    className="text-xs text-[#0E8F5A] border-[#0E8F5A]/40 hover:bg-[#E8F5EF]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Resolve / Clear Hold
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleResolveCase('whitelist')}
                    className="bg-[#0E8F5A] text-white hover:bg-[#0E8F5A]/90 text-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Whitelist Entity
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* GOVERNANCE ACTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E7E5] space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#101413]">Enforce Governance Action</h3>
            <p className="text-[#6B726E]">
              Select proportional enforcement. Every action generates an immutable audit record and complies with MarketNest proportionality guidelines.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Enforcement Action Type</label>
                <select
                  value={selectedActionType}
                  onChange={(e) => setSelectedActionType(e.target.value as GovernanceActionType)}
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg font-medium"
                >
                  <option value="order_fulfillment_hold">Hold Order Fulfillment (Pre-dispatch)</option>
                  <option value="escrow_hold_extended">Extend Seller Escrow Holding Period</option>
                  <option value="affiliate_commission_quarantined">Quarantine Affiliate Commission (14d)</option>
                  <option value="secondary_verification_requested">Request Secondary Phone / NIN Verification</option>
                  <option value="seller_listing_shadowed">Shadow-Moderate Catalog Listing</option>
                  <option value="warning_notice">Issue Official Advisory Warning</option>
                  <option value="payout_disbursement_frozen">Freeze Payout Disbursement</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B726E] font-medium mb-1">
                  Mandatory Audit Rationale (Detailed reason required)
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="State factual justification citing detected signals or evidence..."
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                <strong>Two-Person Verification Rule:</strong> Severe actions (e.g. payout freezing) are subject to secondary supervisory review under platform security standards.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActionModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isExecutingAction || !actionReason.trim()}
                  onClick={handleExecuteAction}
                  className="bg-red-700 text-white hover:bg-red-800 text-xs"
                >
                  {isExecutingAction ? 'Enforcing...' : 'Confirm & Enforce Action'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DISPUTE MEDIATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E7E5] space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#101413]">
              Admin Dispute Mediation: {selectedDispute.disputeNumber}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Mediation Decision Ruling</label>
                <select
                  value={mediationRuling}
                  onChange={(e) => setMediationRuling(e.target.value as any)}
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg font-medium"
                >
                  <option value="refund_buyer">Rule in Buyer Favour (Issue Full Refund)</option>
                  <option value="favor_seller">Rule in Seller Favour (Release Escrow to Merchant)</option>
                  <option value="escalate_chargeback">Escalate to Paystack Regulatory Chargeback Defense</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Mediation Findings & Justification</label>
                <textarea
                  rows={3}
                  value={mediationNotes}
                  onChange={(e) => setMediationNotes(e.target.value)}
                  placeholder="Detail inspection findings from waybill photos, carrier transit logs, or buyer receipts..."
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDispute(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isMediating || !mediationNotes.trim()}
                  onClick={handleMediateDispute}
                  className="bg-[#0E8F5A] text-white hover:bg-[#0E8F5A]/90 text-xs"
                >
                  {isMediating ? 'Submitting...' : 'Commit Binding Ruling'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SELLER ESCROW ADJUSTMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7E5] space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#101413]">
              Adjust Escrow Holding Days: {selectedSeller.storeName}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Escrow Delay Duration</label>
                <select
                  value={newEscrowDays}
                  onChange={(e) => setNewEscrowDays(Number(e.target.value))}
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg font-medium"
                >
                  <option value={7}>Standard 7 Days (Good standing)</option>
                  <option value={14}>Extended 14 Days (Moderate SLA backlog)</option>
                  <option value={21}>High-Risk 21 Days (Substantial dispute backlog)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Mandatory Audit Justification</label>
                <textarea
                  rows={3}
                  value={escrowReason}
                  onChange={(e) => setEscrowReason(e.target.value)}
                  placeholder="Cite order backlog volume or dispute rates..."
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedSeller(null)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isAdjustingEscrow || !escrowReason.trim()}
                  onClick={handleAdjustEscrow}
                  className="bg-[#101413] text-white text-xs"
                >
                  {isAdjustingEscrow ? 'Saving...' : 'Apply Escrow Rule'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AFFILIATE QUARANTINE MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#E4E7E5] space-y-4 text-xs">
            <h3 className="font-bold text-sm text-[#101413]">
              Manage Commission Quarantine: {selectedAffiliate.affiliateName} ({selectedAffiliate.affiliateCode})
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Quarantine Action</label>
                <select
                  value={quarantineAction}
                  onChange={(e) => setQuarantineAction(e.target.value as any)}
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg font-medium"
                >
                  <option value="quarantine">Quarantine Commission (14-Day Hold)</option>
                  <option value="release">Release & Approve to Payable</option>
                  <option value="clawback">Clawback / Cancel Commission (Fraud Confirmed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Amount (₦ NGN)</label>
                <input
                  type="number"
                  value={quarantineAmount}
                  onChange={(e) => setQuarantineAmount(Number(e.target.value))}
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[#6B726E] font-medium mb-1">Mandatory Audit Justification</label>
                <textarea
                  rows={2}
                  value={quarantineReason}
                  onChange={(e) => setQuarantineReason(e.target.value)}
                  placeholder="Reason for quarantine, approval, or clawback..."
                  className="w-full p-2 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedAffiliate(null)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isAdjustingQuarantine || !quarantineReason.trim()}
                  onClick={handleAdjustQuarantine}
                  className="bg-[#0E8F5A] text-white text-xs"
                >
                  {isAdjustingQuarantine ? 'Saving...' : 'Apply Status'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminRiskPage;
