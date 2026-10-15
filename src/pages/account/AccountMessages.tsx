/**
 * @file src/pages/account/AccountMessages.tsx
 * Buyer Inquiries & Store Messaging Center for MarketNest.
 * Connects customers directly with verified merchants for pre-sale questions and order status.
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { Button } from '../../components/ui/Button';
import {
  MessageSquare,
  Send,
  Store,
  ShieldCheck,
  Search,
  ArrowLeft,
  Clock
} from 'lucide-react';

interface ChatThread {
  id: string;
  storeName: string;
  storeLogo: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: {
    id: string;
    sender: 'customer' | 'seller';
    text: string;
    time: string;
  }[];
}

export const AccountMessages: React.FC = () => {
  const { profile, firebaseUser } = useAuth();
  const { showToast } = useMarket();

  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'thread_1',
      storeName: 'Alara Atelier Lagos',
      storeLogo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Good day! Yes, size 44 is currently in stock at our Victoria Island showroom.',
      lastMessageTime: '10:45 AM',
      unread: false,
      messages: [
        {
          id: 'm1',
          sender: 'customer',
          text: 'Hello Alara! Does the handcrafted leather loafer run true to size or should I size up?',
          time: '10:30 AM'
        },
        {
          id: 'm2',
          sender: 'seller',
          text: 'Good day! Yes, size 44 is currently in stock at our Victoria Island showroom. They fit true to Nigerian standard sizing. We can dispatch same-day if ordered before 2 PM.',
          time: '10:45 AM'
        }
      ]
    },
    {
      id: 'thread_2',
      storeName: 'Aso-Oke Heritage',
      storeLogo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Your custom weaving order is progressing smoothly! Will dispatch tomorrow.',
      lastMessageTime: 'Yesterday',
      unread: false,
      messages: [
        {
          id: 'm21',
          sender: 'seller',
          text: 'Your custom weaving order is progressing smoothly! Will dispatch tomorrow.',
          time: 'Yesterday'
        }
      ]
    }
  ]);

  const [activeThreadId, setActiveThreadId] = useState<string | null>('thread_1');
  const [inputText, setInputText] = useState('');

  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'customer' as const,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              lastMessage: newMsg.text,
              lastMessageTime: 'Just now',
              messages: [...t.messages, newMsg]
            }
          : t
      )
    );

    setInputText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-5 border-b border-[#E4E7E5]">
        <h2 className="text-xl font-bold text-[#101413]">Store Conversations</h2>
        <p className="text-xs text-[#6B726E] mt-1">
          Direct messaging with verified merchants for product specs, custom fits, and order inquiries.
        </p>
      </div>

      <div className="bg-white border border-[#E4E7E5] rounded-xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Threads List (4 cols) */}
        <div className="md:col-span-5 border-r border-[#E4E7E5] flex flex-col">
          <div className="p-3 border-b border-[#E4E7E5] bg-[#FBFBFA]">
            <span className="text-xs font-bold text-[#101413]">Active Merchants</span>
          </div>

          <div className="divide-y divide-[#E4E7E5] flex-1 overflow-y-auto">
            {threads.map((thread) => {
              const isSelected = thread.id === activeThreadId;
              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F7F5F0]' : 'hover:bg-[#FBFBFA]'
                  }`}
                >
                  <img
                    src={thread.storeLogo}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-[#E4E7E5] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-xs text-[#101413] truncate">{thread.storeName}</h4>
                      <span className="text-[10px] text-[#A0A5A3] shrink-0">{thread.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-[#6B726E] truncate">{thread.lastMessage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Pane (7 cols) */}
        <div className="md:col-span-7 flex flex-col">
          {activeThread ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#E4E7E5] bg-[#FBFBFA] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeThread.storeLogo}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-[#E4E7E5]"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#101413] flex items-center gap-1.5">
                      {activeThread.storeName}
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0E8F5A]" />
                    </h4>
                    <span className="text-[11px] text-[#6B726E]">Typically replies within 1 hour</span>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-white max-h-[380px]">
                {activeThread.messages.map((m) => {
                  const isCust = m.sender === 'customer';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCust ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                          isCust
                            ? 'bg-[#101413] text-white rounded-br-xs'
                            : 'bg-[#F7F5F0] text-[#101413] border border-[#E4E7E5] rounded-bl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-[#A0A5A3] mt-1 px-1">{m.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-[#E4E7E5] bg-[#FBFBFA] flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question about sizing, availability, or dispatch..."
                  className="flex-1 bg-white border border-[#E4E7E5] rounded-lg px-3 py-2 text-xs text-[#101413] focus:outline-hidden focus:border-[#101413]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!inputText.trim()}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#6B726E]">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
