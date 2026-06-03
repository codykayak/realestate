import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Firebase web config is intentionally public — security comes from
// Firestore rules + Auth, not from keeping this config private.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? 'AIzaSyBjh7Pku7t-GXrsZCthCXncXBWYz8zIQYE',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? 'realestate-map-23692.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID        ?? 'realestate-map-23692',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET    ?? 'realestate-map-23692.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '321595206421',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID            ?? '1:321595206421:web:1e117ba957113d51e0571c',
};

export const isFirebaseConfigured = true;

const app             = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const storage  = getStorage(app);
export const functions = getFunctions(
  app,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1',
);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
