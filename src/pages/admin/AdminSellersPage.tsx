/**
 * @file src/pages/admin/AdminSellersPage.tsx
 * Merchant directory and seller moderation portal for MarketNest Administrators.
 * Displays stores, revenue, ratings, products, and provides non-destructive suspension controls.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { formatCurrency } from '../../services/currencyService';
import { Button } from '../../components/ui/Button';
import { RatingStars } from '../../components/ui/RatingStars';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import {
  Store,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Package,
  ShoppingBag,
  MapPin,
  ExternalLink,
  X,
  DollarSign
} from 'lucide-react';

export const AdminSellersPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission, setActiveSection } = useAdmin();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Inspection Drawer
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSellers(search, statusFilter);
      setSellers(data);
    } catch (err) {
      console.warn('Error loading sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSellers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleToggleSuspend = (seller: any) => {
    const isSuspending = seller.status !== 'suspended';
    const nextStatus = isSuspending ? 'suspended' : 'active';

    requestConfirm({
      title: isSuspending ? 'Suspend Merchant Store' : 'Reactivate Merchant Store',
      description: isSuspending
        ? `Are you sure you want to suspend "${seller.storeName}"? Their storefront will be hidden and product purchases blocked. Historical orders and financial ledger remain intact.`
        : `Reactivate "${seller.storeName}"? Their storefront will become publicly active.`,
      confirmText: isSuspending ? 'Suspend Seller' : 'Reactivate Seller',
      danger: isSuspending,
      requireReason: isSuspending,
      onConfirm: async (reason) => {
        await adminService.updateSellerStatus(seller.id, { status: nextStatus, reason }, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadSellers();
        if (selectedSeller && selectedSeller.id === seller.id) {
          setSelectedSeller({ ...selectedSeller, status: nextStatus });
        }
      }
    });
  };

  const handleToggleHideStore = (seller: any) => {
    const nextHide = !seller.storeHidden;
    requestConfirm({
      title: nextHide ? 'Hide Merchant Storefront' : 'Unhide Merchant Storefront',
      description: nextHide
        ? `Temporarily hide "${seller.storeName}" from public browse directories while leaving merchant account active?`
        : `Make "${seller.storeName}" visible in public directories?`,
      confirmText: nextHide ? 'Hide Store' : 'Make Visible',
      danger: false,
      requireReason: false,
      onConfirm: async () => {
        await adminService.updateSellerStatus(seller.id, { hideStore: nextHide }, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadSellers();
        if (selectedSeller && selectedSeller.id === seller.id) {
          setSelectedSeller({ ...selectedSeller, storeHidden: nextHide });
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">Verified Merchant Stores</h2>
          <p className="text-xs text-[#6B726E]">
            Oversee active merchants, ratings, inventory scale, and store moderation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSection('seller-applications')}
          >
            Applications Queue
          </Button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store, seller, or email..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-white focus:outline-hidden focus:border-[#101413] w-56 sm:w-64"
            />
          </div>

          <div className="inline-flex rounded-lg border border-[#E4E7E5] bg-white p-0.5 text-xs">
            {['all', 'active', 'under_review', 'suspended'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-md font-medium uppercase text-[11px] transition-colors cursor-pointer ${
                  statusFilter === f ? 'bg-[#101413] text-white font-bold' : 'text-[#6B726E]'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E4E7E5] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFA] border-b border-[#E4E7E5] text-[#6B726E] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Store & Merchant</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4">Estimated GMV</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B726E]">
                    <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading merchants...
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B726E]">
                    No merchants found matching your query.
                  </td>
                </tr>
              ) : (
                sellers.map((s) => {
                  const isSuspended = s.status === 'suspended';

                  return (
                    <tr key={s.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#F7F5F0] border border-[#E4E7E5] flex items-center justify-center font-bold text-xs shrink-0 text-[#101413]">
                            <Store className="w-4 h-4 text-[#0E8F5A]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#101413]">{s.storeName}</span>
                              {s.verified && <VerifiedBadge size="sm" />}
                              {s.storeHidden && (
                                <span className="text-[9px] bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded font-bold">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#6B726E]">{s.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B726E]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span>{s.city || 'Lagos'}, {s.state || 'Lagos'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums">
                        {s.productsCount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#101413]">
                          <span>★</span>
                          <span>{s.rating ? s.rating.toFixed(2) : '4.85'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101413] tabular-nums">
                        {formatCurrency(s.totalRevenue || 0)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-700'
                              : s.status === 'under_review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#E8F5EF] text-[#0E8F5A]'
                          }`}
                        >
                          {isSuspended ? 'Suspended' : s.status === 'under_review' ? 'Under Review' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSeller(s)}
                          >
                            Inspect
                          </Button>

                          {hasPermission('sellers.suspend') && (
                            <Button
                              variant={isSuspended ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => handleToggleSuspend(s)}
                            >
                              {isSuspended ? 'Reactivate' : 'Suspend'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELLER INSPECTION DRAWER */}
      {selectedSeller && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-[#101413]/60 backdrop-blur-xs flex justify-end animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-[#E4E7E5] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] flex items-center justify-center font-bold text-sm">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101413] flex items-center gap-1.5">
                    <span>{selectedSeller.storeName}</span>
                    {selectedSeller.verified && <VerifiedBadge size="sm" />}
                  </h3>
                  <span className="text-[11px] text-[#6B726E] font-mono">{selectedSeller.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-[#6B726E] hover:text-[#101413] p-1.5 rounded hover:bg-[#F7F5F0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#FBFBFA] rounded-xl border border-[#E4E7E5] text-center">
                <div>
                  <span className="text-[#6B726E] block text-[10px] uppercase font-bold">Gross Volume</span>
                  <span className="text-base font-black font-mono tabular-nums text-[#101413]">
                    {formatCurrency(selectedSeller.totalRevenue || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B726E] block text-[10px] uppercase font-bold">Platform Fee</span>
                  <span className="text-base font-black font-mono tabular-nums text-[#0E8F5A]">
                    {formatCurrency(Math.round((selectedSeller.totalRevenue || 0) * 0.1))}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B726E] block text-[10px] uppercase font-bold">Products</span>
                  <span className="text-base font-black font-mono tabular-nums text-[#101413]">
                    {selectedSeller.productsCount || 0}
                  </span>
                </div>
              </div>

              {/* Store Identity */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E]">
                  Merchant Details
                </h4>
                <div className="bg-white p-4 rounded-lg border border-[#E4E7E5] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6B726E]">Seller Contact:</span>
                    <span className="font-semibold text-[#101413]">{selectedSeller.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B726E]">Email:</span>
                    <span className="font-semibold text-[#101413]">{selectedSeller.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B726E]">Location:</span>
                    <span className="font-medium text-[#101413]">
                      {selectedSeller.city}, {selectedSeller.state}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B726E]">Storefront Status:</span>
                    <span className="font-bold text-[#101413]">
                      {selectedSeller.storeHidden ? 'Hidden from directory' : 'Visible & active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6B726E]">
                  Storefront Moderation
                </h4>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleHideStore(selectedSeller)}
                    className="w-full p-3 rounded-lg border border-[#E4E7E5] hover:bg-[#FBFBFA] flex items-center justify-between transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      {selectedSeller.storeHidden ? (
                        <Eye className="w-4 h-4 text-[#0E8F5A]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#6B726E]" />
                      )}
                      <div>
                        <span className="font-bold text-[#101413] block">
                          {selectedSeller.storeHidden ? 'Unhide Storefront' : 'Hide Storefront'}
                        </span>
                        <span className="text-[11px] text-[#6B726E]">
                          {selectedSeller.storeHidden
                            ? 'Display storefront back in marketplace search and store lists'
                            : 'Temporarily remove from public directories without suspending'}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E4E7E5] bg-[#FBFBFA] flex items-center justify-between">
              <span className="text-[11px] text-[#6B726E]">Risk Operations</span>
              {hasPermission('sellers.suspend') && (
                <Button
                  variant={selectedSeller.status === 'suspended' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={() => handleToggleSuspend(selectedSeller)}
                >
                  {selectedSeller.status === 'suspended' ? 'Reactivate Seller' : 'Suspend Seller'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
