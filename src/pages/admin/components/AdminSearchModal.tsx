/**
 * @file src/pages/admin/components/AdminSearchModal.tsx
 * Omnisearch modal for MarketNest Administrators.
 * Enables rapid indexed search across orders, merchants, products, and customers.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { MOCK_PRODUCTS, MOCK_STORES } from '../../../data/mockData';
import { formatCurrency } from '../../../services/currencyService';
import {
  Search,
  ShoppingBag,
  Store,
  Package,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'order' | 'seller' | 'product' | 'customer' | 'payment' | 'affiliate';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  targetSection: any;
}

export const AdminSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveSection } = useAdmin();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  // Search Results
  const results: SearchResult[] = [];
  const cleanQ = query.trim().toLowerCase();

  if (cleanQ.length > 1) {
    // 1. Match Orders
    if ('mn-ord-20261006-8f92kd'.includes(cleanQ) || 'nneka'.includes(cleanQ)) {
      results.push({
        id: 'MN-ORD-20261006-8F92KD',
        type: 'order',
        title: 'Order #MN-ORD-20261006-8F92KD',
        subtitle: 'Customer: Nneka Okonjo · ₦125,000 · Paid via Card',
        badge: 'Paid',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        targetSection: 'orders'
      });
    }
    if ('mn-ord-20261006-7h21xp'.includes(cleanQ) || 'tunde'.includes(cleanQ)) {
      results.push({
        id: 'MN-ORD-20261006-7H21XP',
        type: 'order',
        title: 'Order #MN-ORD-20261006-7H21XP',
        subtitle: 'Customer: Tunde Adeleke · ₦84,000 · Processing',
        badge: 'Processing',
        badgeColor: 'bg-blue-100 text-blue-800',
        targetSection: 'orders'
      });
    }

    // 2. Match Sellers
    MOCK_STORES.forEach((s) => {
      if (s.name.toLowerCase().includes(cleanQ) || s.city.toLowerCase().includes(cleanQ)) {
        results.push({
          id: s.id,
          type: 'seller',
          title: s.name,
          subtitle: `Merchant in ${s.city}, Lagos · ${s.productCount} active products`,
          badge: s.verified ? 'Verified Store' : 'Active',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          targetSection: 'sellers'
        });
      }
    });

    // 3. Match Products
    MOCK_PRODUCTS.forEach((p) => {
      if (p.title.toLowerCase().includes(cleanQ) || p.category.toLowerCase().includes(cleanQ)) {
        results.push({
          id: p.id,
          type: 'product',
          title: p.title,
          subtitle: `${p.seller?.name || 'Merchant'} · ${formatCurrency(p.price)} · Stock: ${p.stockCount || 10}`,
          badge: p.category,
          badgeColor: 'bg-neutral-100 text-neutral-800',
          targetSection: 'products'
        });
      }
    });

    // 4. Match Customers
    const sampleCustomers = [
      { id: 'user_01', name: 'Nneka Okonjo', email: 'nneka.okonjo@gmail.com', spend: '₦1.25M' },
      { id: 'user_02', name: 'Tunde Adeleke', email: 'tunde.adeleke@yahoo.com', spend: '₦740k' },
      { id: 'user_03', name: 'Chiamaka Eze', email: 'chiamaka.eze@outlook.com', spend: '₦2.45M' }
    ];
    sampleCustomers.forEach((c) => {
      if (c.name.toLowerCase().includes(cleanQ) || c.email.toLowerCase().includes(cleanQ)) {
        results.push({
          id: c.id,
          type: 'customer',
          title: c.name,
          subtitle: `${c.email} · Lifetime Spend: ${c.spend}`,
          badge: 'Customer',
          badgeColor: 'bg-purple-100 text-purple-800',
          targetSection: 'customers'
        });
      }
    });

    // 5. Match Affiliates
    if ('mnamina'.includes(cleanQ) || 'amina'.includes(cleanQ)) {
      results.push({
        id: 'aff_01',
        type: 'affiliate',
        title: 'Amina Style Edit (MNAMINA)',
        subtitle: '84 Conversions · ₦385,000 Total Earnings',
        badge: 'Partner',
        badgeColor: 'bg-purple-100 text-purple-800',
        targetSection: 'affiliates'
      });
    }
  }

  const handleSelectResult = (res: SearchResult) => {
    setActiveSection(res.targetSection);
    setIsSearchOpen(false);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'order':
        return ShoppingBag;
      case 'seller':
        return Store;
      case 'product':
        return Package;
      case 'customer':
        return Users;
      case 'payment':
        return CreditCard;
      case 'affiliate':
        return Sparkles;
      default:
        return Search;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#101413]/70 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-[#E4E7E5] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E4E7E5] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6B726E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, sellers, products, customers, affiliates, or references..."
            className="flex-1 text-sm bg-transparent outline-hidden text-[#101413] placeholder:text-[#6B726E]"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-[#6B726E] hover:text-[#101413] p-1 rounded hover:bg-[#F7F5F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#F7F5F0]">
          {query.trim().length <= 1 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <p className="text-xs font-semibold text-[#101413]">
                Start typing to query the marketplace database
              </p>
              <p className="text-[11px] text-[#6B726E]">
                Examples: "Nneka", "MN-ORD", "Urban Finds", "Amina", "Linen"
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-1">
              <p className="text-xs font-semibold text-[#101413]">No matching entities found</p>
              <p className="text-[11px] text-[#6B726E]">
                Try searching by exact order reference, customer email, or product SKU.
              </p>
            </div>
          ) : (
            results.map((r) => {
              const Icon = getIcon(r.type);
              return (
                <button
                  key={`${r.type}_${r.id}`}
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left p-3 rounded-lg hover:bg-[#F7F5F0] transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] group-hover:bg-white border border-[#E4E7E5] flex items-center justify-center shrink-0 text-[#101413]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#101413] truncate">{r.title}</span>
                        {r.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              r.badgeColor || 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {r.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B726E] truncate mt-0.5">{r.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#101413] shrink-0 transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-[#FBFBFA] border-t border-[#E4E7E5] flex items-center justify-between text-[11px] text-[#6B726E]">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="font-mono font-bold text-neutral-700">ESC</kbd> to exit</span>
          </div>
          <span>MarketNest Global Index</span>
        </div>
      </div>
    </div>
  );
};
