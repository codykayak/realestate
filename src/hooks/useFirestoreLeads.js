/**
 * Firestore lead persistence — personal or shared org pool.
 *
 * Personal:  /users/{uid}/data/leads
 * Team pool:  /orgs/{orgId}/data/leads
 *
 * Call logs remain per-user: /users/{uid}/callLogs/{autoId}
 */

import { useState, useEffect, useCallback } from 'react';
import {
  doc, getDoc, setDoc, addDoc, collection,
  query, where, orderBy, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

// Keep _raw/_headers so Info view and re-import work after reload
const STRIP = new Set(['_addressSource']);

function stripLead(lead) {
  const out = {};
  for (const [k, v] of Object.entries(lead)) {
    if (!STRIP.has(k)) out[k] = v;
  }
  return out;
}

function leadsDocRef(uid, orgId) {
  if (orgId) return doc(db, 'orgs', orgId, 'data', 'leads');
  return doc(db, 'users', uid, 'data', 'leads');
}

export function useFirestoreLeads(uid, orgId = null, editor = null) {
  const [syncing, setSyncing] = useState(false);

  const loadLeads = useCallback(async () => {
    if (!isFirebaseConfigured || !uid) return null;
    try {
      const snap = await getDoc(leadsDocRef(uid, orgId));
      if (!snap.exists()) return null;
      return snap.data().leads ?? null;
    } catch (e) {
      console.error('[Firestore] loadLeads:', e);
      return null;
    }
  }, [uid, orgId]);

  const saveLeads = useCallback(async (leads) => {
    if (!isFirebaseConfigured || !uid || !leads) return;
    setSyncing(true);
    try {
      const meta = {
        leads: leads.map(stripLead),
        updatedAt: serverTimestamp(),
        leadCount: leads.length,
      };
      if (orgId && editor) {
        meta.lastEditedBy = editor.email ?? '';
        meta.lastEditedUid = editor.uid ?? uid;
      }
      await setDoc(leadsDocRef(uid, orgId), meta);
    } catch (e) {
      console.error('[Firestore] saveLeads:', e);
    } finally {
      setSyncing(false);
    }
  }, [uid, orgId, editor]);

  const clearLeads = useCallback(async () => {
    if (!isFirebaseConfigured || !uid) return;
    try {
      await setDoc(leadsDocRef(uid, orgId), {
        leads: [],
        updatedAt: serverTimestamp(),
        leadCount: 0,
      });
    } catch (e) {
      console.error('[Firestore] clearLeads:', e);
    }
  }, [uid, orgId]);

  const logCall = useCallback(async ({ leadId, leadName, phone, outcome, note, createdByEmail, createdByUid }) => {
    if (!isFirebaseConfigured || !uid) return;
    try {
      await addDoc(collection(db, 'users', uid, 'callLogs'), {
        leadId,
        leadName:  leadName ?? '',
        phone:     phone ?? '',
        outcome,
        note:      note ?? '',
        createdByEmail: createdByEmail ?? '',
        createdByUid:   createdByUid ?? uid,
        orgId: orgId ?? null,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error('[Firestore] logCall:', e);
    }
  }, [uid, orgId]);

  const getLeadActivity = useCallback(async (leadId) => {
    if (!isFirebaseConfigured || !uid || leadId == null) return [];
    try {
      const callQ = query(
        collection(db, 'users', uid, 'callLogs'),
        where('leadId', '==', leadId),
        orderBy('timestamp', 'desc'),
      );
      const smsQ = query(
        collection(db, 'users', uid, 'smsLogs'),
        where('leadId', '==', leadId),
        orderBy('createdAt', 'desc'),
      );
      const [callSnap, smsSnap] = await Promise.all([getDocs(callQ), getDocs(smsQ)]);

      const items = [];

      for (const d of callSnap.docs) {
        const c = d.data();
        items.push({
          id: `call-${d.id}`,
          kind: 'call',
          at: c.timestamp,
          title: `Call — ${c.outcome ?? 'logged'}`,
          detail: c.note || c.phone || '',
          by: c.createdByEmail || '',
        });
      }
      for (const d of smsSnap.docs) {
        const s = d.data();
        items.push({
          id: `sms-${d.id}`,
          kind: 'sms',
          at: s.createdAt,
          title: `Text — ${s.templateId ?? 'message'}`,
          detail: s.body?.slice(0, 120) || s.phone || '',
          by: s.createdByEmail || '',
        });
      }

      items.sort((a, b) => {
        const ta = a.at?.toDate?.() ?? new Date(a.at ?? 0);
        const tb = b.at?.toDate?.() ?? new Date(b.at ?? 0);
        return tb - ta;
      });
      return items;
    } catch (e) {
      console.error('[Firestore] getLeadActivity:', e);
      return [];
    }
  }, [uid]);

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

  return { loadLeads, saveLeads, clearLeads, logCall, getTodayCallLogs, getLeadActivity, syncing };
}
