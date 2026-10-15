/**
 * @file src/pages/admin/AdminSupportPage.tsx
 * Customer Support Operations Management Center for MarketNest Administrators.
 * Enables case triage, priority assignment, customer-facing replies, and internal notes.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SupportTicket, SupportTicketStatus, SupportTicketPriority } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Headphones,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Send,
  Lock,
  MessageSquare,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AdminSupportPage: React.FC = () => {
  const { adminProfile, requestConfirm } = useAdmin();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const json = await res.json();
        setTickets(json.data || []);
        if (json.data?.length > 0 && !selectedTicket) {
          setSelectedTicket(json.data[0]);
        }
      }
    } catch (err) {
      console.warn('Error loading support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: adminProfile.id,
          senderName: isInternalNote ? `${adminProfile.name} (Staff)` : `${adminProfile.name} (Support Specialist)`,
          senderRole: 'admin',
          message: replyText.trim(),
          isInternalNote
        })
      });

      if (res.ok) {
        setReplyText('');
        setIsInternalNote(false);
        // Refresh ticket
        const refRes = await fetch(`/api/support/tickets/${selectedTicket.id}`);
        if (refRes.ok) {
          const json = await refRes.json();
          setSelectedTicket(json.data);
          setTickets((prev) => prev.map((t) => (t.id === json.data.id ? json.data : t)));
        }
      }
    } catch {
      // Ignore
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = (ticket: SupportTicket, nextStatus: SupportTicketStatus) => {
    requestConfirm({
      title: `Update Ticket Status: ${nextStatus.toUpperCase()}`,
      description: `Change support ticket "${ticket.subject}" status to ${nextStatus}.`,
      onConfirm: async () => {
        const res = await fetch(`/api/support/tickets/${ticket.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStatus,
            assignedTo: adminProfile.name
          })
        });

        if (res.ok) {
          const json = await res.json();
          setSelectedTicket(json.data);
          setTickets((prev) => prev.map((t) => (t.id === json.data.id ? json.data : t)));
        }
      }
    });
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchCust = t.customerName.toLowerCase().includes(q);
      const matchEmail = t.customerEmail.toLowerCase().includes(q);
      const matchOrder = t.orderId?.toLowerCase().includes(q);
      if (!matchSub && !matchCust && !matchEmail && !matchOrder) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#101413]">Customer Support & Escalations Hub</h2>
          <p className="text-xs text-[#6B726E]">
            Investigate delivery inquiries, size exchanges, payment verifications, and merchant complaints.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadTickets}>
          Refresh Tickets
        </Button>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-[#E4E7E5] rounded-xl overflow-hidden min-h-[600px]">
        {/* Left Column: Tickets Queue (4 cols) */}
        <div className="lg:col-span-5 border-r border-[#E4E7E5] flex flex-col">
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-[#E4E7E5] bg-[#FBFBFA] space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket, customer, order ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E4E7E5] rounded-lg focus:outline-none focus:border-[#0E8F5A] bg-white"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#6B726E]">
                <Filter className="w-3 h-3" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[11px] font-semibold border border-[#E4E7E5] rounded-md px-2 py-1 bg-white text-[#101413] focus:outline-none"
              >
                <option value="all">All Statuses ({tickets.length})</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E4E7E5]">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#6B726E]">Loading support queue...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#6B726E]">No tickets match criteria.</div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-4 hover:bg-[#F7F5F0] transition-colors cursor-pointer space-y-1.5 ${
                    selectedTicket?.id === t.id ? 'bg-[#E8F5EF]/30 border-l-3 border-[#0E8F5A]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#101413] truncate max-w-[200px]">
                      {t.customerName}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        t.status === 'resolved'
                          ? 'bg-[#E8F5EF] text-[#0E8F5A]'
                          : t.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-[#101413] line-clamp-1">{t.subject}</h4>

                  <div className="flex items-center justify-between text-[11px] text-[#6B726E] pt-1">
                    <span className="capitalize">{t.category}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Case Details & Thread (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-white">
          {selectedTicket ? (
            <>
              {/* Ticket Top Action Bar */}
              <div className="p-4 border-b border-[#E4E7E5] bg-[#FBFBFA] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#6B726E]">#{selectedTicket.id}</span>
                    <h3 className="font-bold text-sm text-[#101413]">{selectedTicket.subject}</h3>
                  </div>
                  <p className="text-xs text-[#6B726E]">
                    Customer: <strong className="text-[#101413]">{selectedTicket.customerName}</strong> ({selectedTicket.customerEmail})
                    {selectedTicket.orderId && (
                      <> • Order: <strong className="text-[#101413]">{selectedTicket.orderId}</strong></>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'resolved' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedTicket, 'resolved')}
                      className="text-xs"
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {selectedTicket.status === 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedTicket, 'in_progress')}
                      className="text-xs"
                    >
                      Reopen Ticket
                    </Button>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[440px] bg-[#FBFBFA]/40">
                {selectedTicket.messages?.map((m) => {
                  const isInternal = m.isInternalNote;
                  const isAdmin = m.senderRole === 'admin';
                  const isCustomer = m.senderRole === 'customer';

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl text-xs space-y-1.5 max-w-[85%] ${
                        isInternal
                          ? 'mx-auto w-full bg-amber-50/80 border border-amber-200 text-amber-900'
                          : isAdmin
                          ? 'ml-auto bg-[#101413] text-white'
                          : 'mr-auto bg-white border border-[#E4E7E5] text-[#101413]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-80">
                        <span className="font-bold flex items-center gap-1">
                          {isInternal && <Lock className="w-3 h-3 text-amber-700" />}
                          {m.senderName}
                        </span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply / Internal Note Input */}
              <form onSubmit={handleSendReply} className="p-3.5 border-t border-[#E4E7E5] bg-white space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="noteType"
                      checked={!isInternalNote}
                      onChange={() => setIsInternalNote(false)}
                      className="text-[#0E8F5A] focus:ring-[#0E8F5A]"
                    />
                    <span>Customer Reply (Visible to customer)</span>
                  </label>

                  <label className="flex items-center gap-1.5 font-medium cursor-pointer text-amber-800">
                    <input
                      type="radio"
                      name="noteType"
                      checked={isInternalNote}
                      onChange={() => setIsInternalNote(true)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <Lock className="w-3 h-3" />
                    <span>Internal Staff Note (Hidden from customer)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? 'Write internal staff investigation notes...'
                        : 'Reply to customer inquiry...'
                    }
                    className={`flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none ${
                      isInternalNote
                        ? 'border-amber-300 bg-amber-50/30 focus:border-amber-500'
                        : 'border-[#E4E7E5] focus:border-[#0E8F5A]'
                    }`}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={sending}
                    className={`text-xs shrink-0 ${
                      isInternalNote ? 'bg-amber-700 hover:bg-amber-800' : ''
                    }`}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    {isInternalNote ? 'Save Note' : 'Send Reply'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-xs text-[#6B726E]">
              Select a ticket from the left queue to review and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminSupportPage;
