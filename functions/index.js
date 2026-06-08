import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import twilio from 'twilio';
import {
  getTwilioConfig,
  twilioClient,
  validateTwilioRequest,
  webhookUrls,
  patchLeadSms,
  findLeadByPhone,
  recentAutoSms,
} from './lib/twilioStore.js';
import { mergeTemplate, toE164, phoneKey, DEFAULT_TEMPLATES } from './lib/templates.js';
import { sendSmsToLead, leadBlocksSms } from './lib/sendSmsCore.js';
import { getQuoConfig, verifyQuoCredentials } from './lib/quoStore.js';
import { sendQuoSmsToLead } from './lib/sendQuoSmsCore.js';
import { CALLABLE_OPTIONS, REGION } from './lib/callableOpts.js';
import { getLeadsDocRef } from './lib/leadsPath.js';
import { handlePmGatewayChat } from './lib/pmGatewayChatHandler.js';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

initializeApp();

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'realestate-map-23692';

function quoErrorMessage(err) {
  const status = err?.status;
  const msg = err?.message ?? String(err);
  if (status === 401 || err?.code === '0400401' || err?.code === '0200401') {
    return 'Invalid Quo API key. Generate a new key in Quo → Workspace Settings → API.';
  }
  if (status === 403) return 'This API key does not have access to the selected Quo number.';
  if (status === 404) return 'Quo resource not found. Check your phone number or Phone Number ID.';
  return msg || 'Quo API request failed.';
}

function twilioErrorMessage(err) {
  const code = err?.code ?? err?.status;
  const msg = err?.message ?? String(err);
  if (code === 20003 || /authenticate/i.test(msg)) {
    return 'Invalid Account SID or Auth Token. Copy both again from Twilio Console.';
  }
  if (code === 20404) return 'Twilio account not found. Check the Account SID.';
  return msg || 'Twilio API request failed.';
}

function requireAuth(request) {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Sign in to use SMS features.');
  }
  return request.auth.uid;
}

function publicUrl(req, functionName) {
  const q = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  return `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${functionName}${q}`;
}

// ── HTTP: ManyDoors PM gateway site chat (Gemini + site knowledge) ─────────
export const pmGatewayChat = onRequest(
  { region: REGION, invoker: 'public', secrets: [geminiApiKey] },
  handlePmGatewayChat,
);

// ── Callable: return webhook URLs for Twilio Console setup ─────────────────
export const getTwilioSetup = onCall(CALLABLE_OPTIONS, async (request) => {
  const uid = requireAuth(request);
  return {
    webhooks: webhookUrls(uid, REGION, PROJECT_ID),
    projectId: PROJECT_ID,
    region: REGION,
  };
});

// ── Callable: verify Account SID + Auth Token ───────────────────────────────
export const testTwilioCredentials = onCall(CALLABLE_OPTIONS, async (request) => {
  requireAuth(request);
  const { accountSid, authToken, phoneNumber } = request.data ?? {};
  const sid = String(accountSid ?? '').trim();
  const token = String(authToken ?? '').trim();
  if (!sid || !token) {
    throw new HttpsError('invalid-argument', 'Account SID and Auth Token are required.');
  }
  if (!sid.startsWith('AC')) {
    throw new HttpsError('invalid-argument', 'Account SID must start with AC.');
  }
  try {
    const client = twilio(sid, token);
    const account = await client.api.v2010.accounts(sid).fetch();
    let phoneOk = null;
    if (phoneNumber) {
      const e164 = toE164(phoneNumber);
      const nums = await client.incomingPhoneNumbers.list({ phoneNumber: e164, limit: 1 });
      phoneOk = nums.length > 0;
    }
    return {
      ok: true,
      friendlyName: account.friendlyName ?? 'Twilio',
      phoneVerified: phoneOk,
      phoneWarning: phoneOk === false
        ? 'This Auth Token works, but the Twilio number was not found on the account. Check the number or subaccount.'
        : null,
    };
  } catch (e) {
    console.error('[testTwilioCredentials]', e);
    throw new HttpsError('invalid-argument', twilioErrorMessage(e));
  }
});

// ── Callable: verify Quo API key ────────────────────────────────────────────
export const testQuoCredentials = onCall(CALLABLE_OPTIONS, async (request) => {
  requireAuth(request);
  const { apiKey, phoneNumber, phoneNumberId } = request.data ?? {};
  const key = String(apiKey ?? '').trim();
  if (!key) {
    throw new HttpsError('invalid-argument', 'Quo API key is required.');
  }
  try {
    const result = await verifyQuoCredentials(key, phoneNumberId || phoneNumber);
    return result;
  } catch (e) {
    console.error('[testQuoCredentials]', e);
    throw new HttpsError('invalid-argument', quoErrorMessage(e));
  }
});

// ── Callable: send SMS from dialer via Quo ───────────────────────────────────
export const sendQuoSms = onCall(CALLABLE_OPTIONS, async (request) => {
  const uid = requireAuth(request);
  const { leadId, templateId, toPhone, leadSnapshot } = request.data ?? {};

  if (leadId == null || !templateId) {
    throw new HttpsError('invalid-argument', 'leadId and templateId are required.');
  }

  const config = await getQuoConfig(uid);
  if (!config?.onboardingComplete) {
    throw new HttpsError('failed-precondition', 'Complete Quo setup before sending texts.');
  }

  const template = (config.templates ?? DEFAULT_TEMPLATES).find((t) => t.id === templateId);
  if (!template) {
    throw new HttpsError('invalid-argument', 'Unknown template.');
  }

  let lead = leadSnapshot;
  if (!lead) {
    const snap = await (await getLeadsDocRef(uid)).get();
    lead = snap.data()?.leads?.find((l) => l.id === leadId) ?? null;
  }
  if (!lead) throw new HttpsError('not-found', 'Lead not found.');
  if (leadBlocksSms(lead)) {
    throw new HttpsError('failed-precondition', 'Lead is marked do-not-text or SMS opt-out.');
  }

  const actor = { uid, email: request.auth.token?.email ?? '' };
  let result;
  try {
    result = await sendQuoSmsToLead(uid, config, lead, templateId, template.body, toPhone, 'manual', actor);
  } catch (e) {
    throw new HttpsError('internal', e.message || 'Quo send failed.');
  }

  const snap = await (await getLeadsDocRef(uid)).get();
  const updated = snap.data()?.leads?.find((l) => l.id === leadId);

  return {
    sid: result.message.id,
    status: result.message.status,
    body: result.body,
    smsCount: updated?.smsCount ?? 1,
    smsCountsByPhone: updated?.smsCountsByPhone ?? { [phoneKey(result.to)]: 1 },
    provider: 'quo',
  };
});

// ── Callable: send SMS from dialer ──────────────────────────────────────────
export const sendSms = onCall(CALLABLE_OPTIONS, async (request) => {
  const uid = requireAuth(request);
  const { leadId, templateId, toPhone, leadSnapshot } = request.data ?? {};

  if (leadId == null || !templateId) {
    throw new HttpsError('invalid-argument', 'leadId and templateId are required.');
  }

  const config = await getTwilioConfig(uid);
  if (!config?.onboardingComplete) {
    throw new HttpsError('failed-precondition', 'Complete Twilio setup before sending texts.');
  }

  const template = (config.templates ?? DEFAULT_TEMPLATES).find((t) => t.id === templateId);
  if (!template) {
    throw new HttpsError('invalid-argument', 'Unknown template.');
  }

  let lead = leadSnapshot;
  if (!lead) {
    const snap = await (await getLeadsDocRef(uid)).get();
    lead = snap.data()?.leads?.find((l) => l.id === leadId) ?? null;
  }
  if (!lead) throw new HttpsError('not-found', 'Lead not found.');
  if (leadBlocksSms(lead)) {
    throw new HttpsError('failed-precondition', 'Lead is marked do-not-text or SMS opt-out.');
  }

  const actor = { uid, email: request.auth.token?.email ?? '' };
  let result;
  try {
    result = await sendSmsToLead(uid, config, lead, templateId, template.body, toPhone, 'manual', actor);
  } catch (e) {
    throw new HttpsError('internal', e.message || 'Twilio send failed.');
  }

  const snap = await (await getLeadsDocRef(uid)).get();
  const updated = snap.data()?.leads?.find((l) => l.id === leadId);

  return {
    sid: result.message.sid,
    status: result.message.status,
    body: result.body,
    smsCount: updated?.smsCount ?? 1,
    smsCountsByPhone: updated?.smsCountsByPhone ?? { [phoneKey(result.to)]: 1 },
  };
});

const APPOINTMENT_REMINDER_MS = 3 * 60 * 60 * 1000;

async function patchLeadFields(uid, leadId, patch) {
  const ref = await getLeadsDocRef(uid);
  const snap = await ref.get();
  if (!snap.exists) return;
  const leads = snap.data().leads ?? [];
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return;
  leads[idx] = { ...leads[idx], ...patch };
  await ref.set({ leads, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

/** Schedule appointment confirmation SMS 3 hours before appointmentAt */
export const scheduleAppointmentSms = onCall(CALLABLE_OPTIONS, async (request) => {
  const uid = requireAuth(request);
  const { leadId, appointmentAt, toPhone } = request.data ?? {};
  if (leadId == null || !appointmentAt) {
    throw new HttpsError('invalid-argument', 'leadId and appointmentAt are required.');
  }

  const appt = new Date(appointmentAt);
  if (Number.isNaN(appt.getTime())) {
    throw new HttpsError('invalid-argument', 'Invalid appointment date.');
  }

  const quoConfig = await getQuoConfig(uid);
  const twilioConfig = quoConfig?.onboardingComplete ? null : await getTwilioConfig(uid);
  const config = quoConfig?.onboardingComplete ? quoConfig : twilioConfig;
  const provider = quoConfig?.onboardingComplete ? 'quo' : 'twilio';
  if (!config?.onboardingComplete) {
    throw new HttpsError('failed-precondition', 'Complete Quo or Twilio setup first.');
  }

  const snap = await (await getLeadsDocRef(uid)).get();
  const lead = snap.data()?.leads?.find((l) => l.id === leadId);
  if (!lead) throw new HttpsError('not-found', 'Lead not found.');
  if (leadBlocksSms(lead)) {
    throw new HttpsError('failed-precondition', 'Lead is marked do-not-text or SMS opt-out.');
  }

  const sendAt = new Date(appt.getTime() - APPOINTMENT_REMINDER_MS);
  if (sendAt.getTime() <= Date.now()) {
    throw new HttpsError('failed-precondition', 'Appointment must be more than 3 hours from now to schedule a reminder.');
  }

  const pending = await getFirestore()
    .collection(`users/${uid}/scheduledSms`)
    .where('leadId', '==', leadId)
    .where('status', '==', 'pending')
    .get();
  for (const doc of pending.docs) {
    await doc.ref.update({ status: 'cancelled', cancelledAt: FieldValue.serverTimestamp() });
  }

  const template = (config.templates ?? DEFAULT_TEMPLATES).find((t) => t.id === 'appointment')
    ?? DEFAULT_TEMPLATES.find((t) => t.id === 'appointment');

  const phone = toPhone || lead.phone;
  const docRef = await getFirestore().collection(`users/${uid}/scheduledSms`).add({
    leadId,
    leadName: lead.name ?? '',
    phone: toE164(phone),
    templateId: 'appointment',
    appointmentAt: appt.toISOString(),
    sendAt,
    status: 'pending',
    provider,
    createdByUid: uid,
    createdByEmail: request.auth.token?.email ?? '',
    createdAt: FieldValue.serverTimestamp(),
  });

  await patchLeadFields(uid, leadId, {
    appointmentAt: appt.toISOString(),
    scheduledSmsId: docRef.id,
    scheduledSmsSendAt: sendAt.toISOString(),
  });

  return {
    scheduledSmsId: docRef.id,
    sendAt: sendAt.toISOString(),
    appointmentAt: appt.toISOString(),
    previewTemplate: mergeTemplate(template.body, { ...lead, appointmentAt: appt.toISOString() }, config),
  };
});

export const cancelScheduledAppointmentSms = onCall(CALLABLE_OPTIONS, async (request) => {
  const uid = requireAuth(request);
  const { leadId } = request.data ?? {};
  if (leadId == null) throw new HttpsError('invalid-argument', 'leadId required.');

  const pending = await getFirestore()
    .collection(`users/${uid}/scheduledSms`)
    .where('leadId', '==', leadId)
    .where('status', '==', 'pending')
    .get();
  for (const doc of pending.docs) {
    await doc.ref.update({ status: 'cancelled', cancelledAt: FieldValue.serverTimestamp() });
  }
  await patchLeadFields(uid, leadId, { scheduledSmsId: null, scheduledSmsSendAt: null });
  return { cancelled: pending.size };
});

/** Every 5 minutes — send due appointment reminder texts */
export const processScheduledSms = onSchedule(
  { schedule: 'every 5 minutes', region: REGION, timeZone: 'America/Los_Angeles' },
  async () => {
    const now = new Date();
    const db = getFirestore();

    const due = await db.collectionGroup('scheduledSms')
      .where('status', '==', 'pending')
      .where('sendAt', '<=', now)
      .limit(40)
      .get();

    for (const doc of due.docs) {
      const data = doc.data();
      const uid = doc.ref.parent.parent?.id;
      if (!uid) continue;

      try {
        const provider = data.provider ?? 'twilio';
        const config = provider === 'quo'
          ? await getQuoConfig(uid)
          : await getTwilioConfig(uid);
        if (!config) {
          await doc.ref.update({ status: 'failed', error: `${provider} not configured` });
          continue;
        }

        const leadSnap = await (await getLeadsDocRef(uid)).get();
        const lead = leadSnap.data()?.leads?.find((l) => l.id === data.leadId)
          ?? { id: data.leadId, name: data.leadName, appointmentAt: data.appointmentAt };

        if (leadBlocksSms(lead)) {
          await doc.ref.update({ status: 'cancelled', error: 'Lead opted out' });
          continue;
        }

        const template = (config.templates ?? DEFAULT_TEMPLATES).find((t) => t.id === 'appointment')
          ?? DEFAULT_TEMPLATES.find((t) => t.id === 'appointment');

        const sendFn = provider === 'quo' ? sendQuoSmsToLead : sendSmsToLead;
        const result = await sendFn(
          uid,
          config,
          { ...lead, appointmentAt: data.appointmentAt },
          'appointment',
          template.body,
          data.phone,
          'appointment_reminder',
          { uid: data.createdByUid, email: data.createdByEmail },
        );

        await doc.ref.update({
          status: 'sent',
          sentAt: FieldValue.serverTimestamp(),
          twilioSid: result.message.sid ?? null,
          quoMessageId: result.message.id ?? null,
          provider,
        });
      } catch (e) {
        console.error('[processScheduledSms]', doc.id, e);
        await doc.ref.update({ status: 'failed', error: String(e.message ?? e) });
      }
    }
  },
);

// ── HTTP: inbound voice → ring agent cell ───────────────────────────────────
export const twilioVoice = onRequest({ region: REGION }, async (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    res.status(400).send('Missing uid');
    return;
  }

  const config = await getTwilioConfig(uid);
  if (!config) {
    res.status(404).type('text/xml').send('<Response><Say>Service not configured.</Say></Response>');
    return;
  }

  const url = publicUrl(req, 'twilioVoice');
  if (!validateTwilioRequest(req, config.authToken, url)) {
    res.status(403).send('Forbidden');
    return;
  }

  const agent = toE164(config.agentPhone);
  if (!agent) {
    res.status(400).type('text/xml').send('<Response><Say>No agent phone configured.</Say></Response>');
    return;
  }

  const { dialStatusUrl } = webhookUrls(uid, REGION, PROJECT_ID);
  const timeout = Math.min(60, Math.max(10, Number(config.ringSeconds) || 25));

  const vr = new twilio.twiml.VoiceResponse();
  const dial = vr.dial({
    timeout,
    action: dialStatusUrl,
    method: 'POST',
    callerId: toE164(config.phoneNumber),
  });
  dial.number(agent);

  res.type('text/xml').send(vr.toString());
});

// ── HTTP: after dial attempt — auto-SMS on missed inbound ───────────────────
export const twilioDialStatus = onRequest({ region: REGION }, async (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    res.status(400).send('Missing uid');
    return;
  }

  const config = await getTwilioConfig(uid);
  if (!config) {
    res.status(404).send('Not configured');
    return;
  }

  const url = publicUrl(req, 'twilioDialStatus');
  if (!validateTwilioRequest(req, config.authToken, url)) {
    res.status(403).send('Forbidden');
    return;
  }

  const vr = new twilio.twiml.VoiceResponse();
  res.type('text/xml').send(vr.toString());

  const dialStatus = req.body?.DialCallStatus;
  const missed = ['no-answer', 'busy', 'failed', 'canceled'].includes(dialStatus);
  if (!missed || !config.autoMissedCallSms) return;

  const callerRaw = req.body?.From;
  const caller = toE164(callerRaw);
  if (!caller) return;

  const pKey = phoneKey(caller);
  const already = await recentAutoSms(uid, caller, 'missed_inbound');
  if (already) return;

  const lead = await findLeadByPhone(uid, caller);
  if (lead && leadBlocksSms(lead)) return;

  const tmpl = config.missedCallTemplate;
  try {
    await sendSmsToLead(
      uid,
      config,
      lead ?? { name: '', address: '' },
      tmpl.id ?? 'missed',
      tmpl.body,
      caller,
      'missed_inbound',
      {},
    );
    if (lead) await patchLeadSms(uid, lead.id, pKey, {});
  } catch (e) {
    console.error('[twilioDialStatus] SMS failed:', e);
  }
});
