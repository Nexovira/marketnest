import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { adminService } from '../../../services/admin/adminService';
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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
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

  // Debounced search over genuine database entities
  useEffect(() => {
    const cleanQ = query.trim().toLowerCase();
    if (cleanQ.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    let active = true;

    const timer = setTimeout(async () => {
      const found: SearchResult[] = [];
      try {
        const [ordersRes, prodsRes, sellersRes, custsRes] = await Promise.allSettled([
          adminService.getOrders(cleanQ),
          adminService.getProducts(cleanQ),
          adminService.getSellers(cleanQ),
          adminService.getCustomers(cleanQ)
        ]);

        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
          ordersRes.value.slice(0, 4).forEach((o: any) => {
            found.push({
              id: o.id || o.orderNumber,
              type: 'order',
              title: `Order #${o.orderNumber || o.id}`,
              subtitle: `Customer: ${o.customerName || o.shippingAddress?.fullName || 'Buyer'} · ${formatCurrency(o.total || 0)}`,
              badge: o.paymentStatus || 'Pending',
              badgeColor: o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
              targetSection: 'orders'
            });
          });
        }

        if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
          prodsRes.value.slice(0, 4).forEach((p: any) => {
            found.push({
              id: p.id,
              type: 'product',
              title: p.title || p.name,
              subtitle: `${p.sellerName || 'Merchant'} · ${formatCurrency(p.price || 0)} · Stock: ${p.stockCount ?? p.stock ?? 0}`,
              badge: p.category || 'Product',
              badgeColor: 'bg-neutral-100 text-neutral-800',
              targetSection: 'products'
            });
          });
        }

        if (sellersRes.status === 'fulfilled' && Array.isArray(sellersRes.value)) {
          sellersRes.value.slice(0, 3).forEach((s: any) => {
            found.push({
              id: s.id,
              type: 'seller',
              title: s.storeName || s.name || 'Merchant',
              subtitle: `Merchant in ${s.city || 'Lagos'} · ${s.email || ''}`,
              badge: s.verified ? 'Verified Store' : 'Active',
              badgeColor: 'bg-emerald-100 text-emerald-800',
              targetSection: 'sellers'
            });
          });
        }

        if (custsRes.status === 'fulfilled' && Array.isArray(custsRes.value)) {
          custsRes.value.slice(0, 3).forEach((c: any) => {
            found.push({
              id: c.id,
              type: 'customer',
              title: c.name || c.displayName || 'Customer',
              subtitle: `${c.email || 'Registered Buyer'}`,
              badge: 'Customer',
              badgeColor: 'bg-purple-100 text-purple-800',
              targetSection: 'customers'
            });
          });
        }

        if (active) {
          setResults(found);
          setSearching(false);
        }
      } catch {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isSearchOpen) return null;


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
