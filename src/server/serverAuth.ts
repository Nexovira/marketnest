/**
 * @file src/server/serverAuth.ts
 * Server-side authentication bootstrap for MarketNest.
 * Authenticates the backend process as an authorized platform service account
 * so server-authoritative administrative actions, metric aggregations, and webhook
 * listeners operate securely under Firestore rules.
 */

import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';

const SERVER_SERVICE_EMAIL = process.env.SYSTEM_SERVICE_EMAIL || 'system.service@marketnest.app';
const SERVER_SERVICE_PASSWORD = process.env.SYSTEM_SERVICE_PASSWORD || 'MarketNest_Internal_Server_2026!';

let authPromise: Promise<boolean> | null = null;

export async function ensureServerAuth(): Promise<boolean> {
  // If already authenticated as server service account, return immediately
  if (auth.currentUser && auth.currentUser.email === SERVER_SERVICE_EMAIL) {
    return true;
  }

  // Prevent multiple concurrent sign-in requests
  if (authPromise) {
    return authPromise;
  }

  authPromise = (async () => {
    try {
      await signInWithEmailAndPassword(auth, SERVER_SERVICE_EMAIL, SERVER_SERVICE_PASSWORD);
      return true;
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, SERVER_SERVICE_EMAIL, SERVER_SERVICE_PASSWORD);
          return true;
        } catch (createErr: any) {
          // If created concurrently by another process, try one more sign-in
          if (createErr?.code === 'auth/email-already-in-use') {
            await signInWithEmailAndPassword(auth, SERVER_SERVICE_EMAIL, SERVER_SERVICE_PASSWORD);
            return true;
          }
          console.warn('[ServerAuth] Failed to provision service credential:', createErr?.message || createErr);
        }
      } else {
        console.warn('[ServerAuth] Failed to sign in server service account:', err?.message || err);
      }
      return false;
    } finally {
      authPromise = null;
    }
  })();

  return authPromise;
}
