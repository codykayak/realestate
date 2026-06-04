/**
 * Isolated Firebase init for the Property Management module.
 *
 * This uses a SEPARATE Firebase project from the host site (MacroREI), wired
 * through `VITE_PM_FIREBASE_*` env vars, so client/resident data is never
 * mingled with the host's data. If no PM Firebase config is present, the
 * module runs fully on the local store (localStorage) — so it works the
 * instant you load it, before the new Firebase project is set up.
 *
 * We create a NAMED Firebase app ('pm') so initializing here cannot collide
 * with the host site's default Firebase app.
 */

import { initializeApp, getApps } from 'firebase/app';

const env = import.meta.env ?? {};

const pmConfig = {
  apiKey: env.VITE_PM_FIREBASE_API_KEY,
  authDomain: env.VITE_PM_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_PM_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_PM_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_PM_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_PM_FIREBASE_APP_ID,
};

export const isPmFirebaseConfigured = Boolean(
  pmConfig.apiKey && pmConfig.projectId && pmConfig.appId,
);

const PM_APP_NAME = 'pm';

let pmApp = null;
export function getPmApp() {
  if (!isPmFirebaseConfigured) return null;
  if (pmApp) return pmApp;
  const existing = getApps().find((a) => a.name === PM_APP_NAME);
  pmApp = existing || initializeApp(pmConfig, PM_APP_NAME);
  return pmApp;
}

export { pmConfig };
export default getPmApp;
