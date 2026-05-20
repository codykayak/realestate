/**
 * Firestore lead persistence — per-user, data-isolated.
 *
 * Document path:  /users/{uid}/data/leads
 * Stores a stripped lead array (no _raw, _headers — reduces payload size).
 *
 * Call logs stored as:  /users/{uid}/callLogs/{autoId}
 */

import { useState, useEffect, useCallback } from 'react';
import {
  doc, getDoc, setDoc, addDoc, collection,
  query, where, orderBy, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

// Fields to drop before saving to Firestore (reduce document size)
const STRIP = new Set(['_raw', '_headers', '_addressSource']);

function stripLead(lead) {
  const out = {};
  for (const [k, v] of Object.entries(lead)) {
    if (!STRIP.has(k)) out[k] = v;
  }
  return out;
}

function leadsDocRef(uid) {
  return doc(db, 'users', uid, 'data', 'leads');
}

export function useFirestoreLeads(uid) {
  const [syncing, setSyncing] = useState(false);

  // Load leads from Firestore
  const loadLeads = useCallback(async () => {
    if (!isFirebaseConfigured || !uid) return null;
    try {
      const snap = await getDoc(leadsDocRef(uid));
      if (!snap.exists()) return null;
      return snap.data().leads ?? null;
    } catch (e) {
      console.error('[Firestore] loadLeads:', e);
      return null;
    }
  }, [uid]);

  // Save leads to Firestore
  const saveLeads = useCallback(async (leads) => {
    if (!isFirebaseConfigured || !uid || !leads) return;
    setSyncing(true);
    try {
      await setDoc(leadsDocRef(uid), {
        leads: leads.map(stripLead),
        updatedAt: serverTimestamp(),
        leadCount: leads.length,
      });
    } catch (e) {
      console.error('[Firestore] saveLeads:', e);
    } finally {
      setSyncing(false);
    }
  }, [uid]);

  // Clear leads from Firestore
  const clearLeads = useCallback(async () => {
    if (!isFirebaseConfigured || !uid) return;
    try {
      await setDoc(leadsDocRef(uid), { leads: [], updatedAt: serverTimestamp(), leadCount: 0 });
    } catch (e) {
      console.error('[Firestore] clearLeads:', e);
    }
  }, [uid]);

  // Log a call
  const logCall = useCallback(async ({ leadId, leadName, phone, outcome, note }) => {
    if (!isFirebaseConfigured || !uid) return;
    try {
      await addDoc(collection(db, 'users', uid, 'callLogs'), {
        leadId,
        leadName:  leadName ?? '',
        phone:     phone ?? '',
        outcome,
        note:      note ?? '',
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error('[Firestore] logCall:', e);
    }
  }, [uid]);

  // Fetch today's call logs (for stats)
  const getTodayCallLogs = useCallback(async () => {
    if (!isFirebaseConfigured || !uid) return [];
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const q = query(
        collection(db, 'users', uid, 'callLogs'),
        where('timestamp', '>=', start),
        orderBy('timestamp', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('[Firestore] getTodayCallLogs:', e);
      return [];
    }
  }, [uid]);

  return { loadLeads, saveLeads, clearLeads, logCall, getTodayCallLogs, syncing };
}
