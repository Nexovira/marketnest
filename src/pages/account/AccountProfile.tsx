/**
 * @file src/pages/account/AccountProfile.tsx
 * Customer profile editing with Firestore persistence and email status indicators.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { Button } from '../../components/ui/Button';
import { User, ShieldCheck, Mail, Phone, Clock } from 'lucide-react';

export const AccountProfile: React.FC = () => {
  const { profile, firebaseUser, updateCustomerProfile } = useAuth();
  const { showToast, navigateTo } = useMarket();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile || firebaseUser) {
      const names = (profile?.name || firebaseUser?.displayName || '').split(' ');
      setFirstName(profile?.firstName || names[0] || '');
      setLastName(profile?.lastName || names.slice(1).join(' ') || '');
      setDisplayName(profile?.name || firebaseUser?.displayName || '');
      setPhoneNumber(profile?.phoneNumber || '');
    }
  }, [profile, firebaseUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const compiledName = `${firstName.trim()} ${lastName.trim()}`.trim() || displayName;
      await updateCustomerProfile({
        name: compiledName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: compiledName,
        phoneNumber: phoneNumber.trim()
      });
      showToast('Profile Updated', 'Your customer profile has been saved.', 'success');
    } catch {
      showToast('Error', 'Could not update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isVerified = firebaseUser?.emailVerified;

  return (
    <div className="max-w-2xl bg-white border border-[#E4E7E5] rounded-xl p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#101413]">Personal Profile</h2>
        <p className="text-xs text-[#6B726E] mt-1">
          Update your contact details and merchant communication preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#101413] mb-1.5">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#101413] mb-1.5">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block font-semibold text-[#101413] mb-1.5">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How your name appears on verified reviews"
            className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md px-3.5 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block font-semibold text-[#101413] mb-1.5">
            Nigerian Phone Number (For Rider Dispatch)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234 803 123 4567"
              className="w-full bg-[#F7F5F0] border border-[#E4E7E5] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#101413] focus:outline-none focus:border-[#0E8F5A] focus:bg-white"
            />
          </div>
        </div>

        {/* Read-Only Email with Verification Badge */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-semibold text-[#101413]">Email Address</label>
            {isVerified ? (
              <span className="text-[11px] font-semibold text-[#0E8F5A] bg-[#E8F5EF] px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo('verify-email')}
                className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" /> Unverified · Verify now
              </button>
            )}
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#6B726E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              disabled
              value={firebaseUser?.email || ''}
              className="w-full bg-slate-100 border border-[#E4E7E5] rounded-md pl-9 pr-3.5 py-2 text-xs text-[#6B726E] cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-[#6B726E] mt-1">
            Registered via Firebase Authentication. Contact MarketNest security to update primary email.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#E4E7E5] flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              if (profile) {
                setFirstName(profile.firstName || '');
                setLastName(profile.lastName || '');
                setDisplayName(profile.name || '');
                setPhoneNumber(profile.phoneNumber || '');
              }
            }}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            type="submit"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
