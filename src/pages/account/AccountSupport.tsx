/**
 * @file src/pages/account/AccountSupport.tsx
 * Customer Support Ticket & Helpdesk Portal for MarketNest.
 * Allows buyers to submit inquiries, track status, and chat with resolution staff.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { SupportTicket, SupportTicketCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Headphones,
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Bot
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { AISupportAssistantResponse } from '../../types';

export const AccountSupport: React.FC = () => {
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useMarket();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('delivery');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Reply message state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Automated first-line assistant state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<AISupportAssistantResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAskAi = async (customQuery?: string) => {
    const q = (customQuery || aiQuery).trim();
    if (!q) return;
    setAiLoading(true);
    setAiQuery(q);
    try {
      const res = await aiService.querySupportAssistant({
        customerId: firebaseUser?.uid || profile?.id,
        query: q
      });
      setAiResponse(res);
    } catch {
      showToast('Assistant Error', 'Could not process query.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const json = await res.json();
        setTickets(json.data || []);
      }
    } catch (err) {
      console.warn('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Validation Error', 'Please complete the subject and description.', 'warning');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        userId: firebaseUser?.uid || profile?.id || 'cust_current',
        customerName: profile?.name || firebaseUser?.displayName || 'Customer',
        customerEmail: firebaseUser?.email || profile?.email || 'customer@marketnest.ng',
        orderId: orderId.trim() || undefined,
        subject: subject.trim(),
        category,
        description: description.trim(),
        priority: 'medium'
      };

      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        showToast('Ticket Opened', 'Your support request has been submitted.', 'success');
        setShowCreateModal(false);
        setSubject('');
        setDescription('');
        setOrderId('');
        fetchTickets();
        setSelectedTicket(json.data);
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch {
      showToast('Submission Error', 'Could not open support ticket.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: firebaseUser?.uid || profile?.id || 'cust_current',
          senderName: profile?.name || firebaseUser?.displayName || 'Customer',
          senderRole: 'customer',
          message: replyText.trim(),
          isInternalNote: false
        })
      });

      if (res.ok) {
        const json = await res.json();
        setSelectedTicket(json.data);
        setReplyText('');
        fetchTickets();
      } else {
        throw new Error('Failed to send reply');
      }
    } catch {
      showToast('Message Error', 'Failed to send message.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> Investigating
          </span>
        );
      case 'resolved':
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7E5]">
        <div>
          <h2 className="text-xl font-bold text-[#101413]">Customer Support Desk</h2>
          <p className="text-xs text-[#6B726E] mt-1">
            Fast resolution for delivery tracking, escrow payments, sizing exchanges, and merchant disputes.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Open New Ticket
        </Button>
      </div>

      {/* Support SLA Banner */}
      <div className="bg-[#F7F5F0] border border-[#E4E7E5] rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#101413] text-white flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-[#101413] block">MarketNest Priority Resolution</span>
            <span className="text-[#6B726E]">Average response time under 2 hours (8:00 AM – 8:00 PM WAT).</span>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2.5 py-1 rounded-full shrink-0">
          Agents Active
        </span>
      </div>

      {/* AI First-Line Support Concierge */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#101413]">Instant Automated Support Assistant</h3>
              <p className="text-[11px] text-[#6B726E]">
                Get instant verified order status, return guidelines, and delivery waypoints.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#0E8F5A]">
            AI Concierge
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAi();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g. When will my Lagos order arrive? or How do I request a return?"
            className="flex-1 bg-[#F7F5F0] border border-[#E4E7E5] rounded-lg px-3.5 py-2 text-xs text-[#101413] focus:outline-hidden focus:bg-white focus:border-[#0E8F5A]"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={aiLoading}
            disabled={!aiQuery.trim()}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Ask Assistant
          </Button>
        </form>

        {/* Quick prompt chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#6B726E]">Suggested:</span>
          {[
            'Track my recent Lagos order',
            'How does the 7-day inspection return work?',
            'What payment rails does Paystack support?'
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAskAi(prompt)}
              className="text-[11px] font-medium bg-[#F7F5F0] hover:bg-[#E4E7E5] text-[#101413] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Answer Box */}
        {aiResponse && (
          <div className="mt-3 p-4 bg-[#FBFBFA] border border-[#E4E7E5] rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <Bot className="w-4 h-4 text-[#0E8F5A] shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="text-xs text-[#101413] leading-relaxed font-medium">
                  {aiResponse.reply}
                </p>
                {aiResponse.orderStatus && (
                  <div className="bg-white border border-[#E4E7E5] rounded-lg p-2.5 text-xs space-y-1">
                    <span className="font-bold text-[#101413] block">
                      Order #{aiResponse.orderStatus.orderNumber}
                    </span>
                    <span className="text-[#6B726E] block">
                      Carrier: {aiResponse.orderStatus.trackingCarrier} · {aiResponse.orderStatus.expectedDelivery}
                    </span>
                  </div>
                )}
                {aiResponse.suggestedActions?.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {aiResponse.suggestedActions.map((act, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (act.action === 'open_ticket') {
                            setShowCreateModal(true);
                            if (act.payload?.category) setCategory(act.payload.category);
                          }
                        }}
                      >
                        {act.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Ticket Thread View OR Ticket List */}
      {selectedTicket ? (
        <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden space-y-0">
          {/* Thread Header */}
          <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between gap-4 bg-[#FBFBFA]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg hover:bg-[#E4E7E5] text-[#6B726E] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#101413]">{selectedTicket.subject}</h3>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B726E] mt-0.5">
                  <span>Ticket #{selectedTicket.id}</span>
                  {selectedTicket.orderId && <span>Order: {selectedTicket.orderId}</span>}
                  <span className="capitalize">Category: {selectedTicket.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Stream (hide internal notes from customer) */}
          <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto bg-white">
            {selectedTicket.messages
              ?.filter((m) => !m.isInternalNote)
              .map((m) => {
                const isCustomer = m.senderRole === 'customer';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-[#101413]">{m.senderName}</span>
                      <span className="text-[10px] text-[#6B726E]">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isCustomer
                          ? 'bg-[#101413] text-white rounded-br-xs'
                          : 'bg-[#F7F5F0] text-[#101413] border border-[#E4E7E5] rounded-bl-xs'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Customer Reply Input */}
          <form onSubmit={handleSendReply} className="p-4 border-t border-[#E4E7E5] bg-[#FBFBFA] flex items-center gap-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response to support staff..."
              className="flex-1 bg-white border border-[#E4E7E5] rounded-lg px-4 py-2.5 text-xs text-[#101413] focus:outline-hidden focus:border-[#101413]"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={sendingReply}
              disabled={!replyText.trim()}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Reply
            </Button>
          </form>
        </div>
      ) : (
        /* Ticket List */
        <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E4E7E5]">
            <h3 className="font-bold text-sm text-[#101413]">Your Tickets</h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-[#6B726E]">
              Loading your inquiries...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#6B726E] mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#101413]">No Active Tickets</h3>
              <p className="text-xs text-[#6B726E] max-w-sm mx-auto">
                Need help with an order, delivery waypoint, or payment verification? Submit a ticket and our team will assist you immediately.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                Submit Inquiry
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E7E5]">
              {tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  onClick={() => setSelectedTicket(tkt)}
                  className="p-5 hover:bg-[#FBFBFA] transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#101413]">{tkt.subject}</h4>
                      {getStatusBadge(tkt.status)}
                    </div>
                    <p className="text-xs text-[#6B726E] line-clamp-1">{tkt.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#A0A5A3]">
                      <span>#{tkt.id}</span>
                      <span className="capitalize">{tkt.category}</span>
                      {tkt.orderId && <span>Order: {tkt.orderId}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A0A5A3]" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#101413]">Open Support Ticket</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#6B726E] hover:text-[#101413] text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#101413] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
                  className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                >
                  <option value="delivery">Delivery & Rider Tracking</option>
                  <option value="payment">Paystack Payment Verification</option>
                  <option value="return">Return & Exchange</option>
                  <option value="product">Product Details & Authenticity</option>
                  <option value="seller">Merchant Inquiry</option>
                  <option value="general">General Assistance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101413] mb-1">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. MN-20261004-894120"
                  className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101413] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your question"
                  className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101413] mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide all relevant details for faster resolution..."
                  className="w-full bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={creating}
                >
                  Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
