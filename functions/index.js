import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
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

initializeApp();

const REGION = process.env.FUNCTION_REGION || 'us-central1';
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'realestate-map-23692';

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

// ── Callable: return webhook URLs for Twilio Console setup ─────────────────
export const getTwilioSetup = onCall({ region: REGION, cors: true }, async (request) => {
  const uid = requireAuth(request);
  return {
    webhooks: webhookUrls(uid, REGION, PROJECT_ID),
    projectId: PROJECT_ID,
    region: REGION,
  };
});

// ── Callable: verify Account SID + Auth Token ───────────────────────────────
export const testTwilioCredentials = onCall({ region: REGION, cors: true }, async (request) => {
  requireAuth(request);
  const { accountSid, authToken } = request.data ?? {};
  if (!accountSid || !authToken) {
    throw new HttpsError('invalid-argument', 'Account SID and Auth Token are required.');
  }
  try {
    const client = twilio(accountSid, authToken);
    const account = await client.api.accounts(accountSid).fetch();
    return { ok: true, friendlyName: account.friendlyName };
  } catch (e) {
    throw new HttpsError('invalid-argument', e.message || 'Invalid Twilio credentials.');
  }
});

// ── Callable: send SMS from dialer ──────────────────────────────────────────
export const sendSms = onCall({ region: REGION, cors: true }, async (request) => {
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
    const snap = await getFirestore().doc(`users/${uid}/data/leads`).get();
    lead = snap.data()?.leads?.find((l) => l.id === leadId) ?? null;
  }
  if (!lead) throw new HttpsError('not-found', 'Lead not found.');

  const dest = toPhone || lead.phone;
  const to = toE164(dest);
  if (!to) throw new HttpsError('invalid-argument', 'No valid phone number for this lead.');

  const body = mergeTemplate(template.body, lead, config);
  const client = twilioClient(config);
  const from = toE164(config.phoneNumber);

  let message;
  try {
    message = await client.messages.create({ to, from, body });
  } catch (e) {
    throw new HttpsError('internal', e.message || 'Twilio send failed.');
  }

  const pKey = phoneKey(to);
  await patchLeadSms(uid, leadId, pKey, {});

  await getFirestore().collection(`users/${uid}/smsLogs`).add({
    leadId,
    leadName: lead.name ?? '',
    phone: to,
    phoneKey: pKey,
    templateId,
    body,
    twilioSid: message.sid,
    status: message.status,
    trigger: 'manual',
    direction: 'outbound',
    createdAt: FieldValue.serverTimestamp(),
  });

  const snap = await getFirestore().doc(`users/${uid}/data/leads`).get();
  const updated = snap.data()?.leads?.find((l) => l.id === leadId);

  return {
    sid: message.sid,
    status: message.status,
    body,
    smsCount: updated?.smsCount ?? 1,
    smsCountsByPhone: updated?.smsCountsByPhone ?? { [pKey]: 1 },
  };
});

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
  const tmpl = config.missedCallTemplate;
  const body = mergeTemplate(tmpl.body, lead ?? { name: '', address: '' }, config);

  const client = twilioClient(config);
  try {
    const message = await client.messages.create({
      to: caller,
      from: toE164(config.phoneNumber),
      body,
    });

    if (lead) {
      await patchLeadSms(uid, lead.id, pKey, {});
    }

    await getFirestore().collection(`users/${uid}/smsLogs`).add({
      leadId: lead?.id ?? null,
      leadName: lead?.name ?? '',
      phone: caller,
      phoneKey: pKey,
      templateId: tmpl.id ?? 'missed',
      body,
      twilioSid: message.sid,
      status: message.status,
      trigger: 'missed_inbound',
      direction: 'outbound',
      dialCallStatus: dialStatus,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error('[twilioDialStatus] SMS failed:', e);
  }
});
