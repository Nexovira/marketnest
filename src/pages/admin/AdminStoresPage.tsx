/**
 * @file src/pages/admin/AdminStoresPage.tsx
 * Merchant storefront governance portal for MarketNest Administrators.
 * Inspect public seller landing pages, verified merchant badges, and visibility settings.
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { adminService } from '../../services/admin/adminService';
import { useMarket } from '../../context/MarketContext';
import { formatCurrency } from '../../services/currencyService';
import { Button } from '../../components/ui/Button';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import {
  Store,
  Search,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
  Package,
  Star
} from 'lucide-react';

export const AdminStoresPage: React.FC = () => {
  const { requestConfirm, adminProfile, hasPermission } = useAdmin();
  const { navigateTo } = useMarket();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSellers(search);
      setStores(data);
    } catch (err) {
      console.warn('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [search]);

  const handleToggleHide = (store: any) => {
    const nextHidden = !store.storeHidden;
    requestConfirm({
      title: nextHidden ? `Hide Store: ${store.storeName}` : `Unhide Store: ${store.storeName}`,
      description: nextHidden
        ? `Temporarily hide "${store.storeName}" from public browse directories while keeping merchant account and orders intact?`
        : `Make "${store.storeName}" visible on public store directories?`,
      confirmText: nextHidden ? 'Hide Storefront' : 'Make Visible',
      danger: false,
      requireReason: false,
      onConfirm: async () => {
        await adminService.updateSellerStatus(store.id, { hideStore: nextHidden }, {
          id: adminProfile.id,
          name: adminProfile.name
        });
        loadStores();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-[#101413] tracking-tight">Public Merchant Storefronts</h2>
          <p className="text-xs text-[#6B726E]">
            Monitor customer-facing seller stores, verification status, and catalog distribution.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores..."
            className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E4E7E5] bg-white focus:outline-hidden focus:border-[#101413] w-56 sm:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-[#6B726E]">
            <div className="w-6 h-6 border-2 border-[#101413] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading storefronts...
          </div>
        ) : stores.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-[#6B726E]">
            No storefronts match your query.
          </div>
        ) : (
          stores.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-[#E4E7E5] rounded-xl p-5 space-y-4 shadow-2xs hover:border-[#101413] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-[#E8F5EF] text-[#0E8F5A] border border-[#A7E2C9] flex items-center justify-center font-bold text-sm shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-[#101413] text-sm">{s.storeName}</h3>
                        {s.verified && <VerifiedBadge size="sm" />}
                      </div>
                      <span className="text-[11px] text-[#6B726E] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{s.city || 'Lagos'}, {s.state || 'Lagos'}</span>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      s.storeHidden
                        ? 'bg-neutral-200 text-neutral-700'
                        : 'bg-[#E8F5EF] text-[#0E8F5A]'
                    }`}
                  >
                    {s.storeHidden ? 'Hidden' : 'Public'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#FBFBFA] p-2.5 rounded-lg border border-[#E4E7E5] text-center text-xs">
                  <div>
                    <span className="text-[#6B726E] block text-[10px]">Products</span>
                    <span className="font-bold font-mono text-[#101413]">{s.productsCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[#6B726E] block text-[10px]">Rating</span>
                    <span className="font-bold font-mono text-[#101413]">
                      ★{s.rating ? s.rating.toFixed(2) : '4.9'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B726E] block text-[10px]">Orders</span>
                    <span className="font-bold font-mono text-[#101413]">{s.ordersCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E4E7E5]">
                <button
                  onClick={() => navigateTo('storefront')}
                  className="text-xs font-bold text-[#0E8F5A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Preview Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {hasPermission('sellers.suspend') && (
                  <Button
                    variant={s.storeHidden ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleToggleHide(s)}
                  >
                    {s.storeHidden ? 'Unhide' : 'Hide'}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
