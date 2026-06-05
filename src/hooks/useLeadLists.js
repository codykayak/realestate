/**
 * Per-user lead list library — each list is a named CSV/Excel import with its own leads[].
 * Path: /users/{uid}/leadLists/{listId}
 */

import { useCallback } from 'react';
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import {
  loadListsLocal, saveListsLocal, loadActiveListIdLocal, saveActiveListIdLocal,
} from '../utils/listStorage';

function listCol(uid) {
  return collection(db, 'users', uid, 'leadLists');
}

function listDoc(uid, listId) {
  return doc(db, 'users', uid, 'leadLists', listId);
}

function settingsDoc(uid) {
  return doc(db, 'users', uid, 'data', 'settings');
}

function newListId() {
  return `list_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toListMeta(id, data) {
  const { leads, previewRows, ...rest } = data ?? {};
  return { id, ...rest, leadCount: rest.leadCount ?? leads?.length ?? 0 };
}

export function useLeadLists(uid) {
  const listAll = useCallback(async () => {
    if (uid && isFirebaseConfigured) {
      const snap = await getDocs(listCol(uid));
      return snap.docs
        .map((d) => toListMeta(d.id, d.data()))
        .sort((a, b) => {
          const ta = a.updatedAt?.toMillis?.() ?? a.updatedAt ?? 0;
          const tb = b.updatedAt?.toMillis?.() ?? b.updatedAt ?? 0;
          return tb - ta;
        });
    }
    const local = loadListsLocal();
    return Object.entries(local)
      .map(([id, data]) => toListMeta(id, data))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [uid]);

  const loadList = useCallback(async (listId) => {
    if (!listId) return null;
    if (uid && isFirebaseConfigured) {
      const snap = await getDoc(listDoc(uid, listId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    }
    const local = loadListsLocal();
    const data = local[listId];
    return data ? { id: listId, ...data } : null;
  }, [uid]);

  const saveList = useCallback(async (listId, payload) => {
    const meta = {
      ...payload,
      updatedAt: uid && isFirebaseConfigured ? serverTimestamp() : Date.now(),
      leadCount: payload.leads?.length ?? payload.leadCount ?? 0,
    };
    if (uid && isFirebaseConfigured) {
      await setDoc(listDoc(uid, listId), meta, { merge: true });
      return;
    }
    const local = loadListsLocal();
    local[listId] = { ...local[listId], ...meta };
    saveListsLocal(local);
  }, [uid]);

  const createList = useCallback(async ({ name, fileName, headers, selectedHeaders, leads, previewRows }) => {
    const id = newListId();
    const now = Date.now();
    const payload = {
      name: name || fileName || 'Untitled list',
      fileName: fileName || '',
      headers: headers ?? [],
      selectedHeaders: selectedHeaders ?? headers ?? [],
      previewRows: previewRows ?? [],
      leads: leads ?? [],
      createdAt: uid && isFirebaseConfigured ? serverTimestamp() : now,
      updatedAt: uid && isFirebaseConfigured ? serverTimestamp() : now,
      leadCount: leads?.length ?? 0,
    };
    if (uid && isFirebaseConfigured) {
      await setDoc(listDoc(uid, id), payload);
    } else {
      const local = loadListsLocal();
      local[id] = payload;
      saveListsLocal(local);
    }
    saveActiveListIdLocal(id);
    if (uid && isFirebaseConfigured) {
      await setDoc(settingsDoc(uid), { activeListId: id }, { merge: true });
    }
    return id;
  }, [uid]);

  const deleteList = useCallback(async (listId) => {
    if (uid && isFirebaseConfigured) {
      await deleteDoc(listDoc(uid, listId));
      const snap = await getDoc(settingsDoc(uid));
      if (snap.exists() && snap.data().activeListId === listId) {
        await setDoc(settingsDoc(uid), { activeListId: null }, { merge: true });
      }
    } else {
      const local = loadListsLocal();
      delete local[listId];
      saveListsLocal(local);
    }
    if (loadActiveListIdLocal() === listId) saveActiveListIdLocal(null);
  }, [uid]);

  const getActiveListId = useCallback(async () => {
    if (uid && isFirebaseConfigured) {
      try {
        const snap = await getDoc(settingsDoc(uid));
        if (snap.exists() && snap.data().activeListId) {
          return snap.data().activeListId;
        }
      } catch (e) {
        console.error('[lists] getActiveListId:', e);
      }
    }
    return loadActiveListIdLocal();
  }, [uid]);

  const setActiveListId = useCallback(async (listId) => {
    saveActiveListIdLocal(listId);
    if (uid && isFirebaseConfigured) {
      try {
        await setDoc(settingsDoc(uid), { activeListId: listId ?? null }, { merge: true });
      } catch (e) {
        console.error('[lists] setActiveListId:', e);
      }
    }
  }, [uid]);

  /** Migrate legacy single-doc leads into first list. */
  const migrateLegacyLeads = useCallback(async (legacyLeads) => {
    if (!legacyLeads?.length) return null;
    const existing = await listAll();
    if (existing.length > 0) return existing[0]?.id ?? null;
    return createList({
      name: 'Imported leads',
      fileName: 'legacy-import',
      headers: legacyLeads[0]?._headers ?? [],
      selectedHeaders: legacyLeads[0]?._headers ?? [],
      leads: legacyLeads,
      previewRows: legacyLeads.slice(0, 5).map((l) => l._raw ?? l),
    });
  }, [listAll, createList]);

  return {
    listAll, loadList, saveList, createList, deleteList,
    getActiveListId, setActiveListId, migrateLegacyLeads,
  };
}
