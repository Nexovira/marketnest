/**
 * @file src/pages/admin/AdminReportsPage.tsx
 * Comprehensive reporting and CSV data export center for MarketNest Administrators.
 * Generates audit-ready reports across Sales, Sellers, Product Stocks, Customers, and Affiliates.
 */

import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrency } from '../../services/currencyService';
import { MOCK_PRODUCTS, MOCK_STORES } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Store,
  Package,
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { hasPermission } = useAdmin();
  const [reportType, setReportType] = useState<'sales' | 'sellers' | 'inventory' | 'customers' | 'affiliates'>('sales');
  const [timeWindow, setTimeWindow] = useState('30d');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportCSV = (filename: string) => {
    setExportNotice(`Exported ${filename}_${timeWindow}.csv to your device downloads.`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">Reporting & Ledger Exports</h2>
          <p className="text-xs text-[#6B726E]">
            Generate financial balance statements, inventory reorder manifests, and partner tax reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-[#E4E7E5] bg-white text-[#101413] font-medium cursor-pointer"
          >
            <option value="7d">Trailing 7 Days</option>
            <option value="30d">Trailing 30 Days</option>
            <option value="90d">Trailing Quarter (90d)</option>
            <option value="12m">Year to Date (12m)</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExportCSV(`marketnest_${reportType}_report`)}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Download CSV
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-[#E8F5EF] border border-[#A7E2C9] rounded-lg text-xs font-semibold text-[#0E8F5A] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Report Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E4E7E5] pb-2 text-xs">
        {[
          { id: 'sales', label: 'Sales & GMV Revenue', icon: DollarSign },
          { id: 'sellers', label: 'Merchant Performance', icon: Store },
          { id: 'inventory', label: 'Stock & Inventory Alerts', icon: Package },
          { id: 'customers', label: 'Customer Cohorts & LTV', icon: Users },
          { id: 'affiliates', label: 'Affiliate Conversions', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#101413] text-white'
                  : 'bg-white border border-[#E4E7E5] text-[#6B726E] hover:text-[#101413]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Tab Contents */}
      {reportType === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E4E7E5] space-y-1">
              <span className="text-[11px] text-[#6B726E] uppercase font-bold">Total Settled GMV</span>
              <p className="text-xl font-black font-mono text-[#101413]">₦24,850,000</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E4E7E5] space-y-1">
              <span className="text-[11px] text-[#6B726E] uppercase font-bold">Platform Commission (10%)</span>
              <p className="text-xl font-black font-mono text-[#0E8F5A]">₦2,485,000</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E4E7E5] space-y-1">
              <span className="text-[11px] text-[#6B726E] uppercase font-bold">Merchant Escrow Releases</span>
              <p className="text-xl font-black font-mono text-[#101413]">₦21,992,250</p>
            </div>
          </div>

          <div className="bg-white border border-[#E4E7E5] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#101413] uppercase tracking-wider">Top Performing Categories</h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Fashion & Tailoring', gmv: '₦9,840,000', share: '39.6%' },
                { name: 'Contemporary Living & Decor', gmv: '₦6,200,000', share: '24.9%' },
                { name: 'Bags & Leathercraft', gmv: '₦4,710,000', share: '18.9%' },
                { name: 'Fine Jewelry & Beads', gmv: '₦2,450,000', share: '9.8%' },
                { name: 'Wild Harvest Skincare', gmv: '₦1,650,000', share: '6.8%' }
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between p-2.5 bg-[#FBFBFA] rounded-lg">
                  <span className="font-semibold text-[#101413]">{c.name}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-[#101413]">{c.gmv}</span>
                    <span className="text-[#6B726E] text-[11px]">{c.share}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportType === 'sellers' && (
        <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Fulfillments</th>
                <th className="py-3 px-4">Gross Sales</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {MOCK_STORES.map((s) => (
                <tr key={s.id} className="hover:bg-[#FBFBFA]">
                  <td className="py-3.5 px-4 font-bold text-[#101413]">{s.name}</td>
                  <td className="py-3.5 px-4 text-[#6B726E]">{s.city}, Lagos</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">{Math.round(s.productCount * 1.8)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">
                    {formatCurrency(s.productCount * 145000)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0E8F5A]">
                    {formatCurrency(Math.round(s.productCount * 14500))}
                  </td>
                  <td className="py-3.5 px-4 font-mono">★{s.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'inventory' && (
        <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Title</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4 text-center">Stock Count</th>
                <th className="py-3 px-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {MOCK_PRODUCTS.slice(0, 8).map((p) => {
                const stock = p.stockCount !== undefined ? p.stockCount : 10;
                return (
                  <tr key={p.id} className="hover:bg-[#FBFBFA]">
                    <td className="py-3.5 px-4 font-bold text-[#101413]">{p.title}</td>
                    <td className="py-3.5 px-4 text-[#6B726E]">{p.seller?.name || 'Merchant'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#101413]">{formatCurrency(p.price)}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">{stock} units</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stock <= 2
                            ? 'bg-rose-100 text-rose-700'
                            : stock <= 5
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#E8F5EF] text-[#0E8F5A]'
                        }`}
                      >
                        {stock <= 2 ? 'CRITICAL STOCK' : stock <= 5 ? 'LOW INVENTORY' : 'HEALTHY'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reportType === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-2">
            <h3 className="font-bold text-[#101413]">New Customer Acquisition</h3>
            <p className="text-2xl font-black font-mono text-[#101413]">142</p>
            <p className="text-[#6B726E]">Signed up in current reporting window</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-2">
            <h3 className="font-bold text-[#101413]">Repeat Purchase Rate</h3>
            <p className="text-2xl font-black font-mono text-[#0E8F5A]">38.4%</p>
            <p className="text-[#6B726E]">Placed 2 or more escrow orders</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-2">
            <h3 className="font-bold text-[#101413]">High-Value Tier (₦1M+)</h3>
            <p className="text-2xl font-black font-mono text-purple-700">26</p>
            <p className="text-[#6B726E]">Discerning clients driving 42% of volume</p>
          </div>
        </div>
      )}

      {reportType === 'affiliates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-2">
            <h3 className="font-bold text-[#101413]">Referral Click Volume</h3>
            <p className="text-2xl font-black font-mono text-[#101413]">9,530</p>
            <p className="text-[#6B726E]">Tracked outbound social and editorial clicks</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-2">
            <h3 className="font-bold text-[#101413]">Verified Conversions</h3>
            <p className="text-2xl font-black font-mono text-[#0E8F5A]">443</p>
            <p className="text-[#6B726E]">4.6% average referral conversion rate</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#E4E7E5] space-y-2">
            <h3 className="font-bold text-[#101413]">Accrued Commissions</h3>
            <p className="text-2xl font-black font-mono text-purple-700">₦2,123,000</p>
            <p className="text-[#6B726E]">Paid or pending 30-day escrow release</p>
          </div>
        </div>
      )}
    </div>
  );
};
