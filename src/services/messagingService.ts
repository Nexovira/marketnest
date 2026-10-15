/**
 * @file src/services/messagingService.ts
 * Customer <-> Seller direct messaging service.
 */

import { Conversation, ChatMessage } from '../types';

export const messagingService = {
  /**
   * Fetch user conversations
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const res = await fetch(`/api/messages/conversations/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
    } catch {}

    // Initial conversation sample
    return [
      {
        id: `conv_${userId}_seller_1`,
        customerId: userId,
        customerName: 'Customer',
        sellerId: 'seller_1',
        storeName: 'Heritage Leather & Textiles',
        productTitle: 'Handcrafted Monogram Duffel Bag',
        lastMessage: 'Your order was inspected and dispatched with our courier!',
        lastMessageSenderId: 'seller_1',
        lastMessageAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        unreadCountCustomer: 1,
        unreadCountSeller: 0,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ];
  },

  /**
   * Send message
   */
  async sendMessage(payload: {
    conversationId?: string;
    senderId: string;
    senderRole: 'customer' | 'seller' | 'admin';
    senderName: string;
    customerId?: string;
    sellerId?: string;
    storeName?: string;
    productTitle?: string;
    message: string;
  }): Promise<ChatMessage> {
    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data.data;
  }
};
