import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { DEFAULT_MISSED_TEMPLATE, DEFAULT_TEMPLATES } from '../utils/smsTemplates';

const DIALER_DOC = 'dialer';

function dialerRef(uid) {
  return doc(db, 'users', uid, 'data', DIALER_DOC);
}

export function useDialerSettings(uid) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      dialerRef(uid),
      (snap) => {
        setSettings(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [uid]);

  const templates = settings?.templates?.length ? settings.templates : DEFAULT_TEMPLATES;
  const agentName = settings?.agentName?.trim() || 'Macro REI';
  const missedCallTemplate = settings?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE;

  const saveSettings = useCallback(async (patch) => {
    if (!uid) return;
    await setDoc(
      dialerRef(uid),
      {
        ...patch,
        updatedAt: serverTimestamp(),
        templates: patch.templates ?? settings?.templates ?? DEFAULT_TEMPLATES,
        missedCallTemplate: patch.missedCallTemplate ?? settings?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE,
      },
      { merge: true },
    );
  }, [uid, settings]);

  return {
    settings,
    loading,
    templates,
    agentName,
    missedCallTemplate,
    saveSettings,
  };
}
