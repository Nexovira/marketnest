/**
 * @file src/services/marketingService.ts
 * Client service connecting to the Phase 17 Marketing Automation, CRM & Retention backend.
 */

import {
  MarketingCampaign,
  MarketingSegment,
  CustomerCommunicationPreferences,
  AbandonedCart,
  MarketingTemplate,
  AutomationJob,
  ChannelProviderStatus,
  CustomerCrmProfile
} from '../types/marketing';

export interface MarketingOverviewData {
  totalCampaigns: number;
  activeCampaigns: number;
  scheduledCampaigns: number;
  totalDelivered: number;
  totalClicks: number;
  avgCtr: number;
  optOutRate: number;
  totalAttributedOrders: number;
  totalAttributedRevenue: number;
  cartRecoveryRate: number;
  recoveredCarts: number;
  totalAbandonedTracked: number;
  totalSegments: number;
  totalOptedInAudience: number;
}

export const marketingService = {
  async getOverview(): Promise<MarketingOverviewData> {
    const res = await fetch('/api/marketing/overview');
    if (!res.ok) throw new Error('Failed to load marketing overview');
    const json = await res.json();
    return json.data;
  },

  async getCampaigns(): Promise<MarketingCampaign[]> {
    const res = await fetch('/api/marketing/campaigns');
    if (!res.ok) throw new Error('Failed to load campaigns');
    const json = await res.json();
    return json.data || [];
  },

  async createCampaign(payload: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
    const res = await fetch('/api/marketing/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create campaign');
    }
    const json = await res.json();
    return json.data;
  },

  async launchCampaign(id: string): Promise<{ message: string; campaign: MarketingCampaign }> {
    const res = await fetch(`/api/marketing/campaigns/${id}/launch`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to launch campaign');
    }
    const json = await res.json();
    return { message: json.message, campaign: json.data };
  },

  async testSend(id: string, testRecipient: string): Promise<string> {
    const res = await fetch(`/api/marketing/campaigns/${id}/test-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testRecipient })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send test preview');
    }
    const json = await res.json();
    return json.message;
  },

  async getSegments(): Promise<MarketingSegment[]> {
    const res = await fetch('/api/marketing/segments');
    if (!res.ok) throw new Error('Failed to load audience segments');
    const json = await res.json();
    return json.data || [];
  },

  async getCrmCustomers(params?: { q?: string; tier?: string; optedIn?: string }): Promise<CustomerCrmProfile[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/marketing/crm/customers?${query}`);
    if (!res.ok) throw new Error('Failed to load CRM customers');
    const json = await res.json();
    return json.data || [];
  },

  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    const res = await fetch('/api/marketing/abandoned-carts');
    if (!res.ok) throw new Error('Failed to load abandoned carts');
    const json = await res.json();
    return json.data || [];
  },

  async recoverAbandonedCart(id: string): Promise<{ message: string; returnUrl: string; cart: AbandonedCart }> {
    const res = await fetch(`/api/marketing/abandoned-carts/${id}/recover`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to recover cart');
    }
    const json = await res.json();
    return { message: json.message, returnUrl: json.returnUrl, cart: json.data };
  },

  async getTemplates(): Promise<MarketingTemplate[]> {
    const res = await fetch('/api/marketing/templates');
    if (!res.ok) throw new Error('Failed to load templates');
    const json = await res.json();
    return json.data || [];
  },

  async getCustomerPreferences(userId: string): Promise<CustomerCommunicationPreferences> {
    const res = await fetch(`/api/marketing/preferences/${userId}`);
    if (!res.ok) throw new Error('Failed to load preferences');
    const json = await res.json();
    return json.data;
  },

  async updateCustomerPreferences(
    userId: string,
    data: Partial<CustomerCommunicationPreferences>
  ): Promise<CustomerCommunicationPreferences> {
    const res = await fetch(`/api/marketing/preferences/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    const json = await res.json();
    return json.data;
  },

  async getAutomationJobs(): Promise<AutomationJob[]> {
    const res = await fetch('/api/marketing/automation-jobs');
    if (!res.ok) throw new Error('Failed to load automation triggers');
    const json = await res.json();
    return json.data || [];
  },

  async toggleAutomationJob(id: string): Promise<AutomationJob> {
    const res = await fetch(`/api/marketing/automation-jobs/${id}/toggle`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle automation trigger');
    const json = await res.json();
    return json.data;
  },

  async getChannelProviderStatuses(): Promise<ChannelProviderStatus[]> {
    const res = await fetch('/api/marketing/providers/status');
    if (!res.ok) throw new Error('Failed to load provider statuses');
    const json = await res.json();
    return json.data || [];
  }
};
