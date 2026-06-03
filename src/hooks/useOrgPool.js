import { useState, useEffect, useCallback } from 'react';
import {
  doc, getDoc, setDoc, collection, query, where, getDocs,
  serverTimestamp, deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { generateInviteCode } from '../utils/orgPool';

export function useOrgPool(uid, userEmail = '') {
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrg = useCallback(async () => {
    if (!uid || !isFirebaseConfigured) {
      setOrg(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const profileSnap = await getDoc(doc(db, 'users', uid, 'data', 'profile'));
      const activeOrgId = profileSnap.data()?.activeOrgId ?? null;
      if (!activeOrgId) {
        setOrg(null);
        setMembers([]);
        return;
      }
      const orgSnap = await getDoc(doc(db, 'orgs', activeOrgId));
      if (!orgSnap.exists()) {
        setOrg(null);
        setMembers([]);
        return;
      }
      const membersSnap = await getDocs(collection(db, 'orgs', activeOrgId, 'members'));
      setOrg({ id: activeOrgId, ...orgSnap.data() });
      setMembers(membersSnap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    } catch (e) {
      console.error('[OrgPool] load:', e);
      setError('Could not load team pool.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadOrg();
  }, [loadOrg]);

  const setActiveOrgId = useCallback(async (orgId) => {
    if (!uid) return;
    await setDoc(
      doc(db, 'users', uid, 'data', 'profile'),
      { activeOrgId: orgId ?? null, updatedAt: serverTimestamp() },
      { merge: true },
    );
    await loadOrg();
  }, [uid, loadOrg]);

  const createOrg = useCallback(async (name) => {
    if (!uid) return null;
    setError(null);
    const orgId = doc(collection(db, 'orgs')).id;
    const inviteCode = generateInviteCode();
    try {
      await setDoc(doc(db, 'orgs', orgId), {
        name: name?.trim() || 'Team leads',
        ownerUid: uid,
        inviteCode,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'orgs', orgId, 'members', uid), {
        email: userEmail,
        role: 'owner',
        joinedAt: serverTimestamp(),
      });
      await setActiveOrgId(orgId);
      return orgId;
    } catch (e) {
      console.error('[OrgPool] create:', e);
      setError('Could not create team. Check Firestore rules are deployed.');
      return null;
    }
  }, [uid, userEmail, setActiveOrgId]);

  const joinOrg = useCallback(async (code) => {
    if (!uid) return false;
    setError(null);
    const trimmed = String(code ?? '').trim().toUpperCase();
    if (trimmed.length < 4) {
      setError('Enter the 6-character invite code from your team lead.');
      return false;
    }
    try {
      const q = query(collection(db, 'orgs'), where('inviteCode', '==', trimmed));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('No team found with that code.');
        return false;
      }
      const orgDoc = snap.docs[0];
      const orgId = orgDoc.id;
      await setDoc(doc(db, 'orgs', orgId, 'members', uid), {
        email: userEmail,
        role: 'agent',
        joinedAt: serverTimestamp(),
      });
      await setActiveOrgId(orgId);
      return true;
    } catch (e) {
      console.error('[OrgPool] join:', e);
      setError('Could not join team. Deploy updated Firestore rules and try again.');
      return false;
    }
  }, [uid, userEmail, setActiveOrgId]);

  const leaveOrg = useCallback(async () => {
    if (!uid || !org?.id) return;
    try {
      await deleteDoc(doc(db, 'orgs', org.id, 'members', uid));
      await setActiveOrgId(null);
    } catch (e) {
      console.error('[OrgPool] leave:', e);
      setError('Could not leave team.');
    }
  }, [uid, org?.id, setActiveOrgId]);

  const usePersonalLeads = useCallback(async () => {
    await setActiveOrgId(null);
  }, [setActiveOrgId]);

  return {
    org,
    members,
    loading,
    error,
    setError,
    activeOrgId: org?.id ?? null,
    isTeamMode: Boolean(org?.id),
    createOrg,
    joinOrg,
    leaveOrg,
    usePersonalLeads,
    reload: loadOrg,
  };
}
