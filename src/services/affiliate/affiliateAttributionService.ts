/**
 * @file src/services/affiliate/affiliateAttributionService.ts
 * Manages client-side affiliate tracking, 30-day attribution windows,
 * and persistence across browsing journeys, cart, and checkout.
 */

export const AFFILIATE_STORAGE_KEY = 'marketnest_affiliate_attribution_v1';
export const DEFAULT_ATTRIBUTION_WINDOW_DAYS = 30;

export interface StoredReferral {
  code: string;
  affiliateId?: string;
  linkId?: string;
  campaignId?: string;
  timestamp: number;
  expiresAt: number;
  landingUrl?: string;
}

/**
 * Parses and captures affiliate referral code from the current URL if present.
 * Validates against expiration and saves to local storage.
 */
export const captureReferralFromUrl = async (
  currentPath: string = window.location.pathname,
  search: string = window.location.search
): Promise<StoredReferral | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(search);
    const refCode = params.get('ref') || params.get('affiliate') || params.get('partner');
    const linkId = params.get('link') || params.get('src') || undefined;
    const campaignId = params.get('campaign') || undefined;

    if (!refCode || !refCode.trim()) {
      return getStoredReferral();
    }

    const cleanCode = refCode.trim().toUpperCase();
    const now = Date.now();
    const expiresAt = now + DEFAULT_ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    const referralData: StoredReferral = {
      code: cleanCode,
      linkId,
      campaignId,
      timestamp: now,
      expiresAt,
      landingUrl: currentPath
    };

    // Store in localStorage
    localStorage.setItem(AFFILIATE_STORAGE_KEY, JSON.stringify(referralData));

    // Record click event on server asynchronously (fire-and-forget, privacy-preserving)
    trackClickEventOnServer(referralData, currentPath).catch((err) => {
      console.warn('[Affiliate] Click tracking notice:', err);
    });

    return referralData;
  } catch (err) {
    console.warn('[Affiliate] Error capturing referral:', err);
    return null;
  }
};

/**
 * Returns the currently active stored referral if still within the attribution window.
 */
export const getStoredReferral = (): StoredReferral | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(AFFILIATE_STORAGE_KEY);
    if (!raw) return null;

    const parsed: StoredReferral = JSON.parse(raw);
    const now = Date.now();

    // Check attribution window expiry (30 days)
    if (parsed.expiresAt && now > parsed.expiresAt) {
      localStorage.removeItem(AFFILIATE_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

/**
 * Clears current affiliate attribution (e.g. after order placement or manual test reset).
 */
export const clearStoredReferral = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AFFILIATE_STORAGE_KEY);
  }
};

/**
 * Records click event with deduplication to server endpoint.
 */
async function trackClickEventOnServer(referral: StoredReferral, landingPath: string): Promise<void> {
  const sessionIdKey = 'marketnest_affiliate_session';
  let sessionId = sessionStorage.getItem(sessionIdKey);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem(sessionIdKey, sessionId);
  }

  // Deduplicate rapid repeat clicks for the same session and code
  const lastTrackedKey = `mn_last_track_${referral.code}_${referral.linkId || 'default'}`;
  const lastTrackedTime = parseInt(sessionStorage.getItem(lastTrackedKey) || '0', 10);
  if (Date.now() - lastTrackedTime < 5 * 60 * 1000) {
    // Within 5 minutes, skip duplicate tracking event
    return;
  }
  sessionStorage.setItem(lastTrackedKey, Date.now().toString());

  await fetch('/api/affiliate/track-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: referral.code,
      linkId: referral.linkId,
      campaignId: referral.campaignId,
      landingPath,
      referrer: document.referrer || '',
      sessionId
    })
  });
}
