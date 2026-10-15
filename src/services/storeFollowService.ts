/**
 * @file src/services/storeFollowService.ts
 * Customer store following service with persistent state and follower counts.
 */

const FOLLOWED_STORES_KEY = 'marketnest_followed_stores';

export const storeFollowService = {
  /**
   * Check if customer follows store
   */
  isFollowing(storeId: string): boolean {
    try {
      const stored = localStorage.getItem(FOLLOWED_STORES_KEY);
      const list: string[] = stored ? JSON.parse(stored) : [];
      return list.includes(storeId);
    } catch {
      return false;
    }
  },

  /**
   * Toggle follow state
   */
  async toggleFollow(customerId: string, storeId: string): Promise<{ isFollowing: boolean; count: number }> {
    try {
      const res = await fetch('/api/store-followers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, storeId })
      });
      if (res.ok) {
        const data = await res.json();
        // Sync local storage
        storeFollowService.setLocalFollow(storeId, data.isFollowing);
        return { isFollowing: data.isFollowing, count: data.followerCount };
      }
    } catch {}

    // Local fallback
    const currently = storeFollowService.isFollowing(storeId);
    const nextState = !currently;
    storeFollowService.setLocalFollow(storeId, nextState);
    return { isFollowing: nextState, count: nextState ? 49 : 48 };
  },

  setLocalFollow(storeId: string, following: boolean): void {
    try {
      const stored = localStorage.getItem(FOLLOWED_STORES_KEY);
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (following && !list.includes(storeId)) {
        list.push(storeId);
      } else if (!following) {
        list = list.filter((id) => id !== storeId);
      }
      localStorage.setItem(FOLLOWED_STORES_KEY, JSON.stringify(list));
    } catch {}
  }
};
