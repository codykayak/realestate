import { getFirestore } from 'firebase-admin/firestore';
import twilio from 'twilio';
import { DEFAULT_MISSED_TEMPLATE, DEFAULT_TEMPLATES } from './templates.js';

const TWILIO_DOC = 'twilio';

/**
 * @param {string} uid
 */
export async function getTwilioConfig(uid) {
  const snap = await getFirestore().doc(`users/${uid}/data/${TWILIO_DOC}`).get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data?.accountSid || !data?.authToken || !data?.phoneNumber) return null;
  return {
    ...data,
    templates: data.templates?.length ? data.templates : DEFAULT_TEMPLATES,
    missedCallTemplate: data.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE,
    ringSeconds: data.ringSeconds ?? 25,
    autoMissedCallSms: data.autoMissedCallSms !== false,
    missedCallCooldownHours: data.missedCallCooldownHours ?? 24,
  };
}

/**
 * @param {string} uid
 * @param {import('twilio').twiml.MessagingResponse | object} config
 */
export function twilioClient(config) {
  return twilio(config.accountSid, config.authToken);
}

/**
 * @param {import('express').Request} req
 * @param {string} authToken
 * @param {string} url
 */
export function validateTwilioRequest(req, authToken, url) {
  const signature = req.get('X-Twilio-Signature');
  if (!signature) return false;
  return twilio.validateRequest(authToken, signature, url, req.body ?? {});
}

/**
 * @param {string} uid
 * @param {string} region
 * @param {string} projectId
 */
export function webhookUrls(uid, region, projectId) {
  const base = `https://${region}-${projectId}.cloudfunctions.net`;
  const q = `uid=${encodeURIComponent(uid)}`;
  return {
    voiceUrl: `${base}/twilioVoice?${q}`,
    dialStatusUrl: `${base}/twilioDialStatus?${q}`,
  };
}

/**
 * @param {string} uid
 * @param {number} leadId
 * @param {string} phoneDigits
 * @param {{ smsCount?: number, smsCountsByPhone?: Record<string, number> }} patch
 */
export async function patchLeadSms(uid, leadId, phoneDigits, patch) {
  const ref = getFirestore().doc(`users/${uid}/data/leads`);
  const snap = await ref.get();
  if (!snap.exists) return;
  const leads = snap.data().leads ?? [];
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return;

  const lead = leads[idx];
  const key = phoneDigits.replace(/\D/g, '').slice(-10);
  const byPhone = { ...(lead.smsCountsByPhone ?? {}) };
  if (key) byPhone[key] = (byPhone[key] ?? 0) + 1;

  leads[idx] = {
    ...lead,
    smsCount: (lead.smsCount ?? 0) + 1,
    lastSmsAt: new Date().toISOString(),
    smsCountsByPhone: patch.smsCountsByPhone ?? byPhone,
    ...patch,
  };

  await ref.set({ leads, updatedAt: new Date() }, { merge: true });
}

/**
 * @param {string} uid
 * @param {string} fromPhone
 */
export async function findLeadByPhone(uid, fromPhone) {
  const snap = await getFirestore().doc(`users/${uid}/data/leads`).get();
  if (!snap.exists) return null;
  const key = fromPhone.replace(/\D/g, '').slice(-10);
  if (!key) return null;

  for (const lead of snap.data().leads ?? []) {
    const nums = [];
    if (lead.phone) nums.push(lead.phone);
    for (const p of lead.phones ?? []) {
      if (p.number) nums.push(p.number);
    }
    for (const n of nums) {
      if (n.replace(/\D/g, '').slice(-10) === key) return lead;
    }
  }
  return null;
}

/**
 * @param {string} uid
 * @param {string} toPhone
 * @param {string} trigger
 */
export async function recentAutoSms(uid, toPhone, trigger) {
  const key = toPhone.replace(/\D/g, '').slice(-10);
  const since = new Date();
  since.setHours(since.getHours() - 24);

  const q = await getFirestore()
    .collection(`users/${uid}/smsLogs`)
    .where('phoneKey', '==', key)
    .where('trigger', '==', trigger)
    .where('createdAt', '>=', since)
    .limit(1)
    .get();

  return !q.empty;
}

export { DEFAULT_TEMPLATES, DEFAULT_MISSED_TEMPLATE };
