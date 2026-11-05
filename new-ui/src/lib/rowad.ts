import { useSyncExternalStore } from 'react';

/**
 * «روّاد قيمة» feature state (server: App\Services\RowadService::featuresFor, config/rowad.php).
 * Credits, plans, top-up and TTS are open to Rowad members now and to everyone from publicLaunchAt.
 */
export interface RowadFeatures {
  newFeatures: boolean;
  earlyAccess: boolean;
  rowadBadgeAt: string | null;
  rowadPriceUntil: string | null;
  rowadPriceActive: boolean;
  publicLaunchAt: string;
  earlyWindowEndsAt?: string;
}

const DEFAULT_LAUNCH = '2026-11-27T00:00:00+02:00';   // Africa/Cairo; the server value replaces it

let state: { features: RowadFeatures | null; launchAt: string; isAdmin: boolean; ready: boolean } = {
  features: null, launchAt: DEFAULT_LAUNCH, isAdmin: false, ready: false
};
const listeners = new Set<() => void>();
const set = (patch: Partial<typeof state>) => { state = { ...state, ...patch }; listeners.forEach(l => l()); };

/** Signed-in user's features (from /auth/me or a sign-in answer); null = visitor */
export const setRowadFeatures = (features: RowadFeatures | null, isAdmin = false) =>
  set({ features, isAdmin, ready: true, launchAt: features?.publicLaunchAt || state.launchAt });
/** Visitor: only the launch date matters (from /api/v1/site-status) */
export const setPublicLaunchAt = (iso?: string) => { if (iso) set({ launchAt: iso }); };
export const markRowadReady = () => set({ ready: true });

const compute = () => {
  const launched = Date.now() >= new Date(state.launchAt).getTime();
  return {
    ...state,
    canUse: Boolean(state.features?.newFeatures) || state.isAdmin || launched,
    badgeAt: state.features?.rowadBadgeAt || null
  };
};
let snapshot = compute();
listeners.add(() => { snapshot = compute(); });

/** { canUse, ready, features, badgeAt } — `ready` is false until the signed-in account has loaded */
export const useRowad = () => useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => snapshot);

/** «رائد قيمة منذ نوفمبر 2026» */
export const rowadSince = (iso: string) =>
  new Date(iso).toLocaleDateString('ar', { month: 'long', year: 'numeric', timeZone: 'Africa/Cairo', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
