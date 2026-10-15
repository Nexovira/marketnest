/**
 * @file src/pages/admin/AdminPromotionsPage.tsx
 * Promotion & Coupon Management Center for MarketNest Administrators.
 * Displays active and scheduled discount codes, redemption counts, and creation controls.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Promotion } from '../../types';
import { formatCurrency } from '../../utils/money';
import { Button } from '../../components/ui/Button';
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Copy,
  Trash2,
  Search
} from 'lucide-react';

export const AdminPromotionsPage: React.FC = () => {
  const { requestConfirm, adminProfile } = useAdmin();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const json = await res.json();
        setPromotions(json.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filtered = promotions.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#101413]">Coupons & Marketplace Promotions</h2>
          <p className="text-xs text-[#6B726E]">
            Configure discount vouchers, monitor usage velocity, and deploy seasonal promotional campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadPromotions}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border border-[#E4E7E5] rounded-xl flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by promo name or coupon code..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E4E7E5] rounded-lg focus:outline-none focus:border-[#0E8F5A]"
          />
        </div>

        <div className="text-xs text-[#6B726E]">
          Total active coupons: <strong>{promotions.length}</strong>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6B726E]">Loading promotions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E4E7E5] rounded-xl space-y-2">
          <Tag className="w-8 h-8 text-[#0E8F5A] mx-auto" />
          <h3 className="text-sm font-bold text-[#101413]">No promotions found</h3>
          <p className="text-xs text-[#6B726E]">Deploy your first promotion code to incentivize customer purchasing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((promo) => (
            <div
              key={promo.id}
              className="p-5 bg-white border border-[#E4E7E5] rounded-xl hover:shadow-sm transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-[#E8F5EF] text-[#0E8F5A]">
                      <Tag className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                      {promo.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0E8F5A] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCode === promo.code ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#101413]">{promo.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#F7F5F0] border border-[#E4E7E5] px-2 py-0.5 rounded text-[#101413]">
                      {promo.code}
                    </span>
                    <span className="text-xs font-bold text-[#101413]">
                      {promo.type === 'percentage'
                        ? `${promo.value}% OFF`
                        : `${formatCurrency(promo.value)} OFF`}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#FBFBFA] rounded-lg text-xs space-y-1.5 border border-[#E4E7E5]/60">
                  <div className="flex justify-between text-[#6B726E]">
                    <span>Scope</span>
                    <span className="font-medium text-[#101413] capitalize">{promo.scope}</span>
                  </div>
                  {promo.minimumOrderAmount && (
                    <div className="flex justify-between text-[#6B726E]">
                      <span>Min Order</span>
                      <span className="font-medium text-[#101413]">
                        {formatCurrency(promo.minimumOrderAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B726E]">
                    <span>Redemptions</span>
                    <span className="font-medium text-[#101413]">
                      {promo.usedCount} / {promo.usageLimit || '∞'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#6B726E] pt-2 border-t border-[#E4E7E5] flex items-center justify-between">
                <span>Expires: {new Date(promo.endAt).toLocaleDateString('en-GB')}</span>
                <span className="text-[#0E8F5A] font-semibold">Active in Checkout</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
