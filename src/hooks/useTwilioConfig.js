import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, isFirebaseConfigured } from '../firebase';
import { DEFAULT_MISSED_TEMPLATE, DEFAULT_TEMPLATES } from '../utils/smsTemplates';
import { parseCallableError } from '../utils/callableError';

const TWILIO_DOC = 'twilio';

function twilioRef(uid) {
  return doc(db, 'users', uid, 'data', TWILIO_DOC);
}

export function useTwilioConfig(uid) {
  const [config, setConfig]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [webhooks, setWebhooks]   = useState(null);
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
      twilioRef(uid),
      (snap) => {
        setConfig(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [uid]);

  const hasCredentials = Boolean(
    config?.accountSid &&
    config?.authToken &&
    config?.phoneNumber,
  );

  const isReady = Boolean(
    hasCredentials &&
    config?.onboardingComplete,
  );

  const saveConfig = useCallback(async (patch) => {
    if (!uid) return;
    await setDoc(
      twilioRef(uid),
      {
        ...patch,
        updatedAt: serverTimestamp(),
        templates: patch.templates ?? config?.templates ?? DEFAULT_TEMPLATES,
        missedCallTemplate: patch.missedCallTemplate ?? config?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE,
      },
      { merge: true },
    );
  }, [uid, config]);

  const fetchWebhooks = useCallback(async () => {
    if (!uid || !isFirebaseConfigured) return null;
    try {
      const fn = httpsCallable(functions, 'getTwilioSetup');
      const { data } = await fn();
      setWebhooks(data.webhooks);
      return data.webhooks;
    } catch (e) {
      console.error('[Twilio] getTwilioSetup:', e);
      return null;
    }
  }, [uid]);

  const testCredentials = useCallback(async ({ accountSid, authToken, phoneNumber }) => {
    const fn = httpsCallable(functions, 'testTwilioCredentials');
    try {
      const { data } = await fn({ accountSid, authToken, phoneNumber });
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
      const fn = httpsCallable(functions, 'sendSms');
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

  const scheduleAppointmentSms = useCallback(async ({ leadId, appointmentAt, toPhone }) => {
    setError(null);
    const fn = httpsCallable(functions, 'scheduleAppointmentSms');
    const { data } = await fn({ leadId, appointmentAt, toPhone });
    return data;
  }, []);

  const cancelScheduledAppointmentSms = useCallback(async (leadId) => {
    const fn = httpsCallable(functions, 'cancelScheduledAppointmentSms');
    const { data } = await fn({ leadId });
    return data;
  }, []);

  return {
    config,
    loading,
    isReady,
    webhooks,
    fetchWebhooks,
    saveConfig,
    testCredentials,
    sendSms,
    scheduleAppointmentSms,
    cancelScheduledAppointmentSms,
    sending,
    error,
    setError,
    templates: config?.templates?.length ? config.templates : DEFAULT_TEMPLATES,
    missedCallTemplate: config?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE,
  };
}
