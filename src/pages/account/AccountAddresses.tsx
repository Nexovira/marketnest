/**
 * @file src/pages/account/AccountAddresses.tsx
 * Customer address book management backed by Firestore with Nigerian states selector.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import {
  getCustomerAddresses,
  saveCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress
} from '../../lib/firestore';
import { Address } from '../../types';
import { Button } from '../../components/ui/Button';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, X, Phone, ShieldCheck } from 'lucide-react';

const NIGERIAN_STATES = [
  'Lagos',
  'Abuja / FCT',
  'Oyo',
  'Rivers',
  'Kano',
  'Kaduna',
  'Ogun',
  'Osun',
  'Enugu',
  'Delta',
  'Anambra',
  'Edo',
  'Plateau',
  'Akwa Ibom',
  'Kwara',
  'Ondo',
  'Cross River',
  'Abia',
  'Imo',
  'Benue'
];

interface AccountAddressesProps {
  onAddressCountChange?: (count: number) => void;
}

export const AccountAddresses: React.FC<AccountAddressesProps> = ({ onAddressCountChange }) => {
  const { firebaseUser } = useAuth();
  const { showToast } = useMarket();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadAddresses = async () => {
    if (!firebaseUser) return;
    setIsLoading(true);
    try {
      const fetched = await getCustomerAddresses(firebaseUser.uid);
      // Fallback demo address if empty
      if (fetched.length === 0) {
        const demoAddr: Address = {
          id: 'addr_default_lagos',
          fullName: firebaseUser.displayName || 'Valued Customer',
          phone: '+234 803 123 4567',
          street: '14 Admiralty Way, Lekki Phase 1',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          postalCode: '105102',
          isDefault: true
        };
        await saveCustomerAddress(firebaseUser.uid, demoAddr);
        setAddresses([demoAddr]);
        onAddressCountChange?.(1);
      } else {
        setAddresses(fetched);
        onAddressCountChange?.(fetched.length);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [firebaseUser]);

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName(firebaseUser?.displayName || '');
    setPhone('');
    setStreetAddress('');
    setCity('Lagos');
    setState('Lagos');
    setPostalCode('');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFullName(addr.fullName || '');
    setPhone(addr.phone || '');
    setStreetAddress(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode || '');
    setIsDefault(!!addr.isDefault);
    setIsModalOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteCustomerAddress(firebaseUser.uid, addressId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      onAddressCountChange?.(addresses.length - 1);
      showToast('Address Deleted', 'Delivery address has been removed.', 'info');
    } catch {
      showToast('Error', 'Could not delete address.', 'error');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!firebaseUser) return;
    try {
      await setDefaultCustomerAddress(firebaseUser.uid, addressId);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === addressId }))
      );
      showToast('Default Updated', 'Primary shipping address has been updated.', 'success');
    } catch {
      showToast('Error', 'Could not set default address.', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    setIsSaving(true);
    try {
      const addressData: Omit<Address, 'id'> & { id?: string } = {
        id: editingAddress?.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: streetAddress.trim(),
        city: city.trim(),
        state,
        country: 'Nigeria',
        postalCode: postalCode.trim(),
        isDefault
      };

      const saved = await saveCustomerAddress(firebaseUser.uid, addressData);

      if (editingAddress) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === saved.id ? saved : isDefault ? { ...a, isDefault: false } : a))
        );
        showToast('Address Updated', 'Shipping address has been updated.', 'success');
      } else {
        setAddresses((prev) => [...prev, saved]);
        onAddressCountChange?.(addresses.length + 1);
        showToast('Address Added', 'New delivery address has been saved.', 'success');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to save address. Please check fields.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Saved Addresses</h2>
          <p className="text-xs text-[#6B726E]">
            Manage delivery destinations for seamless checkout across Nigeria.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Address
        </Button>
      </div>

      {/* Address Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 rounded-xl bg-[#F7F5F0] animate-pulse" />
          <div className="h-40 rounded-xl bg-[#F7F5F0] animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-xl border bg-white flex flex-col justify-between transition-all ${
                addr.isDefault
                  ? 'border-[#0E8F5A] ring-1 ring-[#0E8F5A]/20 shadow-xs'
                  : 'border-[#E4E7E5] hover:border-[#CBD5E1]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#101413]">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-1 text-[#6B726E] hover:text-[#101413] cursor-pointer"
                      aria-label="Edit address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="p-1 text-[#6B726E] hover:text-rose-600 cursor-pointer"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#6B726E]">
                  <p className="text-[#101413]">{addr.street}</p>
                  <p>{addr.city}, {addr.state} State, Nigeria</p>
                  {addr.postalCode && <p className="tabular-nums">Postal Code: {addr.postalCode}</p>}
                  <p className="flex items-center gap-1 text-[#101413] pt-1 tabular-nums font-medium">
                    <Phone className="w-3 h-3 text-[#6B726E]" />
                    {addr.phone}
                  </p>
                </div>
              </div>

              {!addr.isDefault && (
                <div className="mt-4 pt-3 border-t border-[#E4E7E5]">
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-[#0E8F5A] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Set as default address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-[#101413]/50 backdrop-blur-xs"
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-[#E4E7E5] my-8 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E5]">
                <h3 className="text-base font-bold text-[#101413]">
                  {editingAddress ? 'Edit Address' : 'Add New Nigerian Address'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-[#6B726E] hover:text-[#101413] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#101413] mb-1">
                    Contact Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#101413] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#101413] mb-1">
                    Street Address & Landmarks
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House number, street, estate, nearby landmark"
                    className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#101413] mb-1">
                      City / Area
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lekki, Ikeja, Maitama"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#101413] mb-1">
                      State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#101413] mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Nigeria"
                      className="w-full bg-slate-100 border border-[#E4E7E5] rounded px-3 py-2 text-xs text-[#6B726E] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#101413] mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="100001"
                      className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded px-3 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#101413]">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded accent-[#0E8F5A]"
                    />
                    <span>Set as primary default address for Lagos & Nationwide shipping</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-[#E4E7E5] flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    type="submit"
                  >
                    Save Address
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
