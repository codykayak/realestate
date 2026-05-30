import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase';

export function useAuth() {
  const [user, setUser]     = useState(undefined); // undefined = still loading
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) { setUser(null); return; }
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  // Save/update user profile in Firestore on first sign-up or new Google login
  async function saveProfile(firebaseUser, extra = {}) {
    if (!isFirebaseConfigured || !db) return;
    const ref  = doc(db, 'users', firebaseUser.uid, 'data', 'profile');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:         firebaseUser.uid,
        displayName: firebaseUser.displayName || extra.displayName || '',
        email:       firebaseUser.email || '',
        phone:       extra.phone || '',
        photoURL:    firebaseUser.photoURL || '',
        createdAt:   serverTimestamp(),
        plan:        'free',
      });
    }
  }

  // ── Email / Password Sign Up ──────────────────────────────────────────────
  async function signUpWithEmail({ name, email, password, phone }) {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await saveProfile(cred.user, { displayName: name, phone });
      return cred.user;
    } catch (e) {
      setError(friendlyError(e));
      return null;
    }
  }

  // ── Email / Password Sign In ──────────────────────────────────────────────
  async function signInWithEmail({ email, password }) {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (e) {
      setError(friendlyError(e));
      return null;
    }
  }

  // ── Google Sign In ────────────────────────────────────────────────────────
  async function signInWithGoogle() {
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await saveProfile(cred.user);
      return cred.user;
    } catch (e) {
      setError(friendlyError(e));
      return null;
    }
  }

  // ── Password reset ────────────────────────────────────────────────────────
  async function resetPassword(email) {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (e) {
      setError(friendlyError(e));
      return false;
    }
  }

  async function signOutUser() {
    await signOut(auth);
  }

  return {
    user,
    loading: user === undefined,
    error,
    setError,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    signOutUser,
  };
}

// Turn Firebase error codes into plain English
function friendlyError(e) {
  const code = e?.code ?? '';
  const map = {
    'auth/email-already-in-use':    'That email is already registered. Try signing in instead.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-not-found':          'No account found with that email.',
    'auth/wrong-password':          'Incorrect password. Try again or reset it.',
    'auth/invalid-credential':      'Incorrect email or password.',
    'auth/too-many-requests':       'Too many attempts. Please wait a minute and try again.',
    'auth/popup-closed-by-user':    'Sign-in window was closed. Please try again.',
    'auth/network-request-failed':  'Network error. Check your connection and try again.',
  };
  return map[code] ?? (e?.message || 'Something went wrong. Please try again.');
}
