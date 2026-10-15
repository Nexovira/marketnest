/**
 * @file src/pages/admin/AdminMessagesPage.tsx
 * Customer <-> Seller Inquiries & Live Conversation Oversight for MarketNest Admins.
 * Allows support admins to monitor disputes, reply directly, and maintain communications integrity.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Conversation, ChatMessage } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  User,
  Store,
  Send,
  AlertTriangle
} from 'lucide-react';

export const AdminMessagesPage: React.FC = () => {
  const { adminProfile } = useAdmin();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations?userId=admin');
      if (res.ok) {
        const json = await res.json();
        setConversations(json.data || []);
        if (json.data?.length > 0 && !selectedConversation) {
          setSelectedConversation(json.data[0]);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data || []);
      }
    } catch {
      // Fallback
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: adminProfile.id,
          senderName: `${adminProfile.name} (Support Admin)`,
          senderType: 'admin',
          text: replyText.trim()
        })
      });
      if (res.ok) {
        setReplyText('');
        await loadMessages(selectedConversation.id);
      }
    } catch {
      // Fallback
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#101413]">Customer & Merchant Inquiries Monitor</h2>
        <p className="text-xs text-[#6B726E]">
          Inspect live marketplace communications, detect potential off-platform payment attempts, and intervene in disputes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-[#E4E7E5] rounded-xl overflow-hidden min-h-[550px]">
        {/* Left: Conversation List */}
        <div className="border-r border-[#E4E7E5] flex flex-col">
          <div className="p-3 border-b border-[#E4E7E5] bg-[#FBFBFA]">
            <span className="text-xs font-bold text-[#101413]">
              Active Threads ({conversations.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E4E7E5]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#6B726E]">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6B726E]">No conversations recorded.</div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConversation(c)}
                  className={`w-full text-left p-3.5 hover:bg-[#F7F5F0] transition-colors cursor-pointer ${
                    selectedConversation?.id === c.id ? 'bg-[#E8F5EF]/40 border-l-3 border-[#0E8F5A]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#101413]">{c.customerName}</span>
                    <span className="text-[10px] text-[#6B726E]">
                      {new Date(c.updatedAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B726E] flex items-center gap-1">
                    <Store className="w-3 h-3 text-[#0E8F5A]" />
                    <span>Store: {c.storeName || 'Merchant'}</span>
                  </div>
                  <p className="text-xs text-[#101413] truncate mt-1">{c.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message Thread */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[#E4E7E5] bg-[#FBFBFA] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#101413]">
                    Thread: {selectedConversation.customerName} ↔ {selectedConversation.storeName || 'Merchant'}
                  </h4>
                  <p className="text-[11px] text-[#6B726E]">
                    Order Inquiry • Topic: {selectedConversation.orderId ? `Order #${selectedConversation.orderId}` : 'General Inquiry'}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                  Escrow Monitored
                </span>
              </div>

              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBFBFA]/30 max-h-[420px]">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#6B726E]">No messages in thread.</div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = m.senderRole === 'admin';
                    const isCustomer = m.senderRole === 'customer';
                    return (
                      <div
                        key={m.id}
                        className={`max-w-[75%] p-3 rounded-xl text-xs space-y-1 ${
                          isAdmin
                            ? 'ml-auto bg-[#101413] text-white'
                            : isCustomer
                            ? 'mr-auto bg-[#F7F5F0] text-[#101413] border border-[#E4E7E5]'
                            : 'ml-auto bg-[#E8F5EF] text-[#101413] border border-[#A7E2C9]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                          <span className="font-bold">{m.senderName}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{m.message}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Admin Intervention Reply Bar */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-[#E4E7E5] flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Intervene or reply as Admin Support..."
                  className="flex-1 px-3 py-2 text-xs border border-[#E4E7E5] rounded-lg focus:outline-none focus:border-[#0E8F5A]"
                />
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={sending}
                  className="text-xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Reply
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[#6B726E]">
              Select a conversation thread from the left pane to review messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
