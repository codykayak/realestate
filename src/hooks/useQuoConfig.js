import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, isFirebaseConfigured } from '../firebase';
import { DEFAULT_MISSED_TEMPLATE, DEFAULT_TEMPLATES } from '../utils/smsTemplates';
import { parseCallableError } from '../utils/callableError';

const QUO_DOC = 'quo';

function quoRef(uid) {
  return doc(db, 'users', uid, 'data', QUO_DOC);
}

export function useQuoConfig(uid) {
  const [config, setConfig]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) {
      setConfig(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      quoRef(uid),
      (snap) => {
        setConfig(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [uid]);

  const hasCredentials = Boolean(
    config?.apiKey &&
    (config?.phoneNumber || config?.phoneNumberId),
  );

  const isReady = Boolean(
    hasCredentials &&
    config?.onboardingComplete,
  );

  const saveConfig = useCallback(async (patch) => {
    if (!uid) return;
    await setDoc(
      quoRef(uid),
      {
        ...patch,
        provider: 'quo',
        updatedAt: serverTimestamp(),
        templates: patch.templates ?? config?.templates ?? DEFAULT_TEMPLATES,
        missedCallTemplate: patch.missedCallTemplate ?? config?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE,
      },
      { merge: true },
    );
  }, [uid, config]);

  const testCredentials = useCallback(async ({ apiKey, phoneNumber, phoneNumberId }) => {
    const fn = httpsCallable(functions, 'testQuoCredentials');
    try {
      const { data } = await fn({ apiKey, phoneNumber, phoneNumberId });
      return data;
    } catch (e) {
      const err = new Error(parseCallableError(e));
      err.cause = e;
      throw err;
    }
  }, []);

  const sendSms = useCallback(async ({ leadId, templateId, toPhone, leadSnapshot }) => {
    setSending(true);
    setError(null);
    try {
      const fn = httpsCallable(functions, 'sendQuoSms');
      const { data } = await fn({ leadId, templateId, toPhone, leadSnapshot });
      return data;
    } catch (e) {
      const msg = parseCallableError(e);
      setError(msg);
      throw new Error(msg);
    } finally {
      setSending(false);
    }
  }, []);

  return {
    config,
    loading,
    isReady,
    hasCredentials,
    saveConfig,
    testCredentials,
    sendSms,
    sending,
    error,
    setError,
    templates: config?.templates?.length ? config.templates : DEFAULT_TEMPLATES,
    missedCallTemplate: config?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE,
  };
}
