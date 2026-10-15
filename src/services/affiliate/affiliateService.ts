/**
 * @file src/services/affiliate/affiliateService.ts
 * Core Firestore service for Affiliate Partners on MarketNest.
 * Handles applications, profiles, link generation, campaigns, and secure queries.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  AffiliateApplication,
  AffiliateProfile,
  AffiliateLink,
  AffiliateCampaign,
  AffiliateLinkTargetType
} from '../../types';
import { DEFAULT_AFFILIATE_COMMISSION_RATE } from './affiliateCommissionService';

/**
 * Generates an uppercase unique affiliate partner code.
 * Format: MN + 4-7 alphanumeric characters (e.g. MNJAMES, MNAMINA, MN89X2)
 */
export const generateAffiliateCode = (name: string): string => {
  const cleanName = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const base = cleanName.slice(0, 5) || 'PARTNER';
  const rand = Math.floor(10 + Math.random() * 90);
  return `MN${base}${rand}`.slice(0, 10);
};

/**
 * Submits an application to join the MarketNest Affiliate Partner Program.
 */
export const submitAffiliateApplication = async (
  userId: string,
  data: {
    fullName: string;
    displayName: string;
    channel: string;
    channelUrl: string;
    audience: string;
    reason: string;
    preferredCategories: string[];
  }
): Promise<AffiliateApplication> => {
  const applicationId = `app_${userId}`;
  const nowIso = new Date().toISOString();

  const application: AffiliateApplication = {
    id: applicationId,
    userId,
    fullName: data.fullName.trim(),
    displayName: data.displayName.trim() || data.fullName.trim(),
    channel: data.channel,
    channelUrl: data.channelUrl.trim(),
    audience: data.audience.trim(),
    reason: data.reason.trim(),
    preferredCategories: data.preferredCategories,
    agreedToTerms: true,
    status: 'pending',
    submittedAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  await setDoc(doc(db, 'affiliateApplications', applicationId), application);
  return application;
};

/**
 * Fetches existing affiliate application for a user if submitted.
 */
export const getAffiliateApplication = async (
  userId: string
): Promise<AffiliateApplication | null> => {
  try {
    const snap = await getDoc(doc(db, 'affiliateApplications', `app_${userId}`));
    if (snap.exists()) {
      return snap.data() as AffiliateApplication;
    }
  } catch (err) {
    console.warn('[Affiliate] Could not fetch application:', err);
  }
  return null;
};

/**
 * Fetches an affiliate profile by authenticated user ID.
 */
export const getAffiliateProfile = async (
  userId: string
): Promise<AffiliateProfile | null> => {
  try {
    const snap = await getDoc(doc(db, 'affiliateProfiles', userId));
    if (snap.exists()) {
      return snap.data() as AffiliateProfile;
    }
  } catch (err) {
    console.warn('[Affiliate] Could not fetch affiliate profile:', err);
  }
  return null;
};

/**
 * Fetches an affiliate profile by referral code (case-insensitive query).
 */
export const getAffiliateByCode = async (
  code: string
): Promise<AffiliateProfile | null> => {
  const cleanCode = code.trim().toUpperCase();
  try {
    const q = query(
      collection(db, 'affiliateProfiles'),
      where('code', '==', cleanCode),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as AffiliateProfile;
    }
  } catch (err) {
    console.warn('[Affiliate] Could not resolve code via cloud query:', err);
  }
  return null;
};

/**
 * Creates or provisions an active test affiliate profile for development testing.
 */
export const provisionTestAffiliateProfile = async (
  userId: string,
  displayName: string,
  preferredCode?: string
): Promise<AffiliateProfile> => {
  const code = preferredCode ? preferredCode.trim().toUpperCase() : generateAffiliateCode(displayName);
  const nowIso = new Date().toISOString();

  const profile: AffiliateProfile = {
    id: userId,
    userId,
    displayName: displayName || 'MarketNest Partner',
    code,
    status: 'active',
    commissionRate: DEFAULT_AFFILIATE_COMMISSION_RATE,
    promotionalChannel: 'Instagram & Content Hub',
    channelUrl: 'https://instagram.com/marketnest_creator',
    audienceDescription: 'Fashion and design enthusiasts in Lagos, Abuja & Diaspora',
    preferredCategories: ['Fashion & Apparel', 'Home & Living', 'Jewelry & Accessories'],
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    approvedEarnings: 0,
    paidEarnings: 0,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  await setDoc(doc(db, 'affiliateProfiles', userId), profile);

  // Also create a default homepage link
  const defaultLinkId = `link_${userId}_home`;
  const defaultLink: AffiliateLink = {
    id: defaultLinkId,
    affiliateId: userId,
    code,
    targetType: 'homepage',
    targetId: 'home',
    targetName: 'MarketNest Marketplace Homepage',
    targetUrl: '/',
    url: `${window.location.origin}/?ref=${code}&src=${defaultLinkId}`,
    clicksCount: 0,
    conversionsCount: 0,
    earningsAmount: 0,
    active: true,
    createdAt: nowIso,
    updatedAt: nowIso
  };
  await setDoc(doc(db, 'affiliateLinks', defaultLinkId), defaultLink);

  return profile;
};

/**
 * Updates editable affiliate profile settings (displayName, channel info, categories).
 * Affiliates CANNOT modify commissionRate, status, or code.
 */
export const updateAffiliateProfileSettings = async (
  userId: string,
  updates: {
    displayName?: string;
    promotionalChannel?: string;
    channelUrl?: string;
    audienceDescription?: string;
    preferredCategories?: string[];
  }
): Promise<void> => {
  const nowIso = new Date().toISOString();
  await updateDoc(doc(db, 'affiliateProfiles', userId), {
    ...updates,
    updatedAt: nowIso
  });
};

/**
 * Creates a new targeted referral link for an approved affiliate.
 */
export const createAffiliateLink = async (
  affiliateId: string,
  code: string,
  params: {
    targetType: AffiliateLinkTargetType;
    targetId: string;
    targetName: string;
    targetUrl: string;
    campaignId?: string;
  }
): Promise<AffiliateLink> => {
  const linkId = `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://marketnest.ng';
  const cleanTargetUrl = params.targetUrl.startsWith('/') ? params.targetUrl : `/${params.targetUrl}`;

  // Assemble full shareable URL
  const separator = cleanTargetUrl.includes('?') ? '&' : '?';
  let shareableUrl = `${origin}${cleanTargetUrl}${separator}ref=${code}&src=${linkId}`;
  if (params.campaignId) {
    shareableUrl += `&campaign=${encodeURIComponent(params.campaignId)}`;
  }

  const nowIso = new Date().toISOString();
  const linkDoc: AffiliateLink = {
    id: linkId,
    affiliateId,
    code,
    campaignId: params.campaignId,
    targetType: params.targetType,
    targetId: params.targetId,
    targetName: params.targetName,
    targetUrl: cleanTargetUrl,
    url: shareableUrl,
    clicksCount: 0,
    conversionsCount: 0,
    earningsAmount: 0,
    active: true,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  await setDoc(doc(db, 'affiliateLinks', linkId), linkDoc);
  return linkDoc;
};

/**
 * Retrieves all referral links generated by an affiliate.
 */
export const getAffiliateLinks = async (
  affiliateId: string
): Promise<AffiliateLink[]> => {
  try {
    const q = query(
      collection(db, 'affiliateLinks'),
      where('affiliateId', '==', affiliateId)
    );
    const snap = await getDocs(q);
    const list: AffiliateLink[] = [];
    snap.forEach((d) => list.push(d.data() as AffiliateLink));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('[Affiliate] Error fetching links:', err);
    return [];
  }
};

/**
 * Toggles a link's active state.
 */
export const toggleAffiliateLinkStatus = async (
  linkId: string,
  active: boolean
): Promise<void> => {
  await updateDoc(doc(db, 'affiliateLinks', linkId), {
    active,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Returns available active promotional campaigns for affiliates.
 */
export const getActiveAffiliateCampaigns = async (): Promise<AffiliateCampaign[]> => {
  try {
    const q = query(
      collection(db, 'affiliateCampaigns'),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const list: AffiliateCampaign[] = [];
      snap.forEach((d) => list.push(d.data() as AffiliateCampaign));
      return list;
    }
  } catch (err) {
    console.warn('[Affiliate] Could not fetch cloud campaigns, returning curated defaults:', err);
  }

  // Curated seasonal marketplace campaigns
  return [
    {
      id: 'camp_independence_luxury',
      name: 'Independence Luxury Showcase 2026',
      slug: 'independence-luxury-2026',
      description: 'Promote bespoke Made-in-Nigeria fashion & hand-woven Aso-Oke with boosted commission.',
      commissionRate: 0.08, // 8.0% bonus
      status: 'active',
      bannerUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'camp_lagos_living_decor',
      name: 'Lagos Contemporary Living & Decor',
      slug: 'lagos-contemporary-living',
      description: 'Artisan handcrafted ceramic vessels, bronze sculptures, and teak furniture collections.',
      commissionRate: 0.07, // 7.0% bonus
      status: 'active',
      bannerUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};
