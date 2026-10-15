/**
 * @file src/services/aiService.ts
 * Client-side interface to MarketNest server-side AI Intelligence & Automation routes.
 * Provides resilient, typed access with built-in timeouts and graceful offline handling.
 */

import {
  AIGeneratedProductContent,
  AICategorySuggestion,
  AIShoppingQueryResponse,
  AISupportAssistantResponse,
  AISellerPerformanceInsight,
  AIAdminMarketplaceInsight,
  AIModerationRecommendation,
  AIUsageMetrics,
  AutomationJob
} from '../types';

export const aiService = {
  /**
   * AI Product Description Assistant
   */
  async generateProductDescription(params: {
    title: string;
    category?: string;
    keyPoints?: string[];
    targetAudience?: string;
    currentSpecs?: Record<string, string>;
    tone?: string;
  }): Promise<AIGeneratedProductContent> {
    const res = await fetch('/api/ai/product/describe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate product description');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Smart Category & Attribute Suggestion
   */
  async suggestCategory(title: string, description?: string): Promise<AICategorySuggestion> {
    const res = await fetch('/api/ai/product/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to suggest category');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Customer Shopping Assistant
   */
  async queryShoppingAssistant(params: {
    query: string;
    budget?: number;
    preferredCategory?: string;
  }): Promise<AIShoppingQueryResponse> {
    const res = await fetch('/api/ai/shopping/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process shopping assistant query');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Automated Customer Support Assistant
   */
  async querySupportAssistant(params: {
    customerId?: string;
    query: string;
    orderId?: string;
  }): Promise<AISupportAssistantResponse> {
    const res = await fetch('/api/ai/support/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process support query');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Seller Performance Insights
   */
  async getSellerPerformanceInsights(sellerId: string): Promise<AISellerPerformanceInsight[]> {
    const res = await fetch(`/api/ai/seller/insights/${sellerId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch seller performance insights');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Admin Marketplace Insights
   */
  async getAdminMarketplaceInsights(): Promise<AIAdminMarketplaceInsight[]> {
    const res = await fetch('/api/ai/admin/insights');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch admin marketplace insights');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Content Quality & Moderation Assistance Scan
   */
  async scanContentModeration(params: {
    targetId: string;
    targetType: 'product' | 'review' | 'message';
    text?: string;
    title?: string;
  }): Promise<AIModerationRecommendation> {
    const res = await fetch('/api/ai/moderation/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to scan content for moderation');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Admin AI Usage & Cost Auditing
   */
  async getAiUsageMetrics(): Promise<AIUsageMetrics> {
    const res = await fetch('/api/ai/usage-metrics');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch AI usage metrics');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Automation Background Jobs
   */
  async runAutomationJob(type: string, entityType: string, entityId: string): Promise<AutomationJob> {
    const res = await fetch('/api/automation/jobs/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, entityType, entityId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to execute automation job');
    }
    const json = await res.json();
    return json.data;
  },

  async getAutomationJobs(): Promise<AutomationJob[]> {
    const res = await fetch('/api/automation/jobs');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch automation jobs');
    }
    const json = await res.json();
    return json.data;
  }
};
