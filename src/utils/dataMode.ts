/**
 * @file src/utils/dataMode.ts
 * Data mode management ensuring strict separation between production data and test/seed data.
 * Guarantees that synthetic figures or placeholder records are never disguised as production figures.
 */

export type DataMode = 'production' | 'seed';

const DATA_MODE_STORAGE_KEY = 'marketnest_admin_data_mode';

/**
 * Get current admin data mode
 */
export function getAdminDataMode(): DataMode {
  if (typeof window === 'undefined') return 'production';
  const saved = localStorage.getItem(DATA_MODE_STORAGE_KEY);
  if (saved === 'seed') return 'seed';
  return 'production';
}

/**
 * Set admin data mode
 */
export function setAdminDataMode(mode: DataMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DATA_MODE_STORAGE_KEY, mode);
  // Dispatch custom event for reactive updates across components
  window.dispatchEvent(new CustomEvent('marketnest:datamode-change', { detail: mode }));
}

/**
 * Check if the application is running in production
 */
export function isProductionEnvironment(): boolean {
  return (
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
  );
}
