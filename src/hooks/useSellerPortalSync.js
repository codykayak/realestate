import { useCallback } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { buildSellerPortalDoc } from '../utils/sellerPortal';

/**
 * Sync seller-facing portal doc when agents update sellerDeal on a lead.
 */
export function useSellerPortalSync(uid, orgId) {
  const syncPortal = useCallback(async (lead) => {
    if (!uid || !isFirebaseConfigured || !lead?.sellerDeal?.enabled) return;
    const token = lead.sellerDeal.token;
    if (!token) return;
    const payload = {
      ...buildSellerPortalDoc({ token, lead, ownerUid: uid, orgId }),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'sellerPortals', token), payload, { merge: true });
  }, [uid, orgId]);

  const removePortal = useCallback(async (token) => {
    if (!token || !isFirebaseConfigured) return;
    try {
      await deleteDoc(doc(db, 'sellerPortals', token));
    } catch (e) {
      console.warn('[SellerPortal] remove:', e);
    }
  }, []);

  return { syncPortal, removePortal };
}
