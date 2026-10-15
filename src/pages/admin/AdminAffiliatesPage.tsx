/**
 * @file src/pages/admin/AdminAffiliatesPage.tsx
 * Affiliate partner management portal for MarketNest Administrators.
 * Displays partner profiles, unique codes, click and conversion traffic, and earnings.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MousePointerClick,
  ShoppingBag,
  Percent,
  Copy,
  DollarSign
} from 'lucide-react';

export const AdminAffiliatesPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission, setActiveSection } = useAdmin();
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadAffiliates = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAffiliates();
      setAffiliates(data);
    } catch (err) {
      console.warn('Error loading affiliates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAffiliates();
  }, []);

  const filtered = affiliates.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (a.displayName || '').toLowerCase().includes(q) ||
      (a.code || '').toLowerCase().includes(q) ||
      (a.promotionalChannel || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">Affiliate Partner Network</h2>
          <p className="text-xs text-[#6B726E]">
            Monitor creator referral traffic, unique codes, conversions, and paid commissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSection('affiliate-applications')}
          >
            Applications Queue
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSection('commissions')}
          >
            Commissions Ledger
          </Button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by partner or code..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-white focus:outline-hidden focus:border-[#101413] w-56 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Affiliate Partner</th>
                <th className="py-3 px-4">Partner Code</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-center">Clicks</th>
                <th className="py-3 px-4 text-center">Conversions</th>
                <th className="py-3 px-4">Rate</th>
                <th className="py-3 px-4">Total Earned</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading affiliate partners...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B726E]">
                    No affiliates found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((aff) => {
                  const isSuspended = aff.status === 'suspended';

                  return (
                    <tr key={aff.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#101413] block">{aff.displayName}</span>
                            <span className="text-[10px] text-[#6B726E] font-mono">{aff.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">
                        <span className="bg-[#F7F5F0] border border-[#E4E7E5] px-2 py-0.5 rounded text-xs tracking-wider">
                          {aff.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E]">
                        <span className="font-medium text-[#101413]">{aff.promotionalChannel}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                        {aff.totalClicks?.toLocaleString() || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-[#0E8F5A]">
                        {aff.totalConversions || 0}
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums font-semibold">
                        {((aff.commissionRate || 0.05) * 100).toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413] tabular-nums">
                        {formatCurrency(aff.totalEarnings || 0)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {isSuspended ? 'Suspended' : 'Active Partner'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
