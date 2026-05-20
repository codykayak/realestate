import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';

export function useAuth() {
  const [user, setUser]       = useState(undefined); // undefined = loading
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) { setUser(null); return; }
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  async function signInWithGoogle() {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError(e.message);
    }
  }

  async function signOutUser() {
    await signOut(auth);
  }

  return { user, loading: user === undefined, error, signInWithGoogle, signOutUser };
}
