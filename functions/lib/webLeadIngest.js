import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getLeadsDocRef } from './leadsPath.js';
import { getQuoConfig } from './quoStore.js';
import { getTwilioConfig } from './twilioStore.js';
import { toE164, phoneKey } from './templates.js';
import { leadBlocksSms } from './sendSmsCore.js';

const NURTURE_STEPS = [
  { hours: 24, templateId: 'intro', trigger: 'web_nurture_d1' },
  { hours: 72, templateId: 'followup', trigger: 'web_nurture_d3' },
];

function parseAddress(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return { address: '', city: '', state: 'OR', zip: '' };

  const zipMatch = text.match(/\b(\d{5})(?:-\d{4})?\b/);
  const zip = zipMatch?.[1] ?? '';

  const stateMatch = text.match(/\b(OR|Oregon)\b/i);
  const state = stateMatch ? 'OR' : '';

  const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const city = parts.length >= 3 ? parts[parts.length - 2].replace(/\bOR\b/i, '').trim() : parts[1];
    return {
      address: parts[0],
      city: city || '',
      state: state || 'OR',
      zip,
    };
  }

  return { address: text, city: '', state: state || 'OR', zip };
}

function buildNotes({ formType, details, attribution = {}, extra = {} }) {
  const lines = [
    `Inbound: ${formType || 'website'}`,
    details ? `Details: ${details}` : null,
    attribution.landingPage ? `Landing: ${attribution.landingPage}` : null,
    attribution.citySlug ? `City page: ${attribution.citySlug}` : null,
    attribution.situationSlug ? `Situation page: ${attribution.situationSlug}` : null,
    attribution.utm_source ? `UTM source: ${attribution.utm_source}` : null,
    attribution.utm_medium ? `UTM medium: ${attribution.utm_medium}` : null,
    attribution.utm_campaign ? `UTM campaign: ${attribution.utm_campaign}` : null,
    attribution.utm_content ? `UTM content: ${attribution.utm_content}` : null,
    attribution.utm_term ? `UTM term: ${attribution.utm_term}` : null,
    attribution.gclid ? `gclid: ${attribution.gclid}` : null,
    attribution.fbclid ? `fbclid: ${attribution.fbclid}` : null,
    attribution.referrer ? `Referrer: ${attribution.referrer}` : null,
    extra.referrerName ? `Referrer: ${extra.referrerName}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

/**
 * @param {string} uid
 */
async function resolveVoipProvider(uid) {
  const quo = await getQuoConfig(uid);
  if (quo?.onboardingComplete) return 'quo';
  const twilio = await getTwilioConfig(uid);
  if (twilio?.onboardingComplete) return 'twilio';
  return null;
}

/**
 * @param {string} uid
 * @param {number} leadId
 * @param {object} lead
 */
async function scheduleWebNurture(uid, leadId, lead) {
  if (leadBlocksSms(lead)) return { scheduled: 0 };

  const phone = toE164(lead.phone);
  if (!phone) return { scheduled: 0 };

  const provider = await resolveVoipProvider(uid);
  if (!provider) return { scheduled: 0, skipped: 'voip_not_ready' };

  const db = getFirestore();
  const existing = await db.collection(`users/${uid}/scheduledSms`)
    .where('leadId', '==', leadId)
    .where('status', '==', 'pending')
    .get();
  const hasNurture = existing.docs.some((d) => String(d.data().trigger ?? '').startsWith('web_nurture'));
  if (hasNurture) return { scheduled: 0, skipped: 'already_scheduled' };

  let count = 0;
  const now = Date.now();
  for (const step of NURTURE_STEPS) {
    await db.collection(`users/${uid}/scheduledSms`).add({
      leadId,
      leadName: lead.name ?? '',
      phone,
      templateId: step.templateId,
      sendAt: new Date(now + step.hours * 60 * 60 * 1000),
      status: 'pending',
      provider,
      trigger: step.trigger,
      createdByUid: uid,
      createdByEmail: 'web-lead@macrorei.com',
      createdAt: FieldValue.serverTimestamp(),
    });
    count += 1;
  }
  return { scheduled: count, provider };
}

/**
 * @param {string} uid
 * @param {object} payload
 */
export async function ingestWebLead(uid, payload) {
  const name = String(payload.name ?? '').trim();
  const phone = String(payload.phone ?? '').trim();
  const email = String(payload.email ?? '').trim();
  const addressRaw = String(payload.address ?? payload.propertyAddress ?? '').trim();
  const details = String(payload.details ?? payload.message ?? '').trim();
  const formType = String(payload.formType ?? payload.type ?? 'website').trim();
  const attribution = payload.attribution ?? {};

  if (!phone && !email) {
    throw new Error('Phone or email is required.');
  }

  const parsed = parseAddress(addressRaw);
  const ref = await getLeadsDocRef(uid);
  const snap = await ref.get();
  const leads = snap.exists ? [...(snap.data().leads ?? [])] : [];
  const pKey = phone ? phoneKey(phone) : '';

  let leadId;
  let duplicate = false;

  if (pKey) {
    const idx = leads.findIndex((l) => phoneKey(l.phone) === pKey);
    if (idx !== -1) {
      duplicate = true;
      leadId = leads[idx].id;
      const prev = leads[idx];
      leads[idx] = {
        ...prev,
        name: name || prev.name,
        email: email || prev.email,
        address: parsed.address || prev.address,
        city: parsed.city || prev.city,
        state: parsed.state || prev.state,
        zip: parsed.zip || prev.zip,
        notes: `${prev.notes ? `${prev.notes}\n\n` : ''}--- ${new Date().toISOString()} ---\n${buildNotes({ formType, details, attribution, extra: payload })}`,
        leadSource: formType,
        utm: attribution,
        lastInboundAt: new Date().toISOString(),
        status: prev.status === 'Dead' ? 'New' : prev.status,
      };
    }
  }

  if (!duplicate) {
    leadId = leads.reduce((max, l) => Math.max(max, Number(l.id) || 0), 0) + 1;
    const lead = {
      id: leadId,
      name,
      phone,
      email,
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      notes: buildNotes({ formType, details, attribution, extra: payload }),
      status: 'New',
      leadSource: formType,
      utm: attribution,
      webLead: true,
      submittedAt: new Date().toISOString(),
      callCount: 0,
      smsCount: 0,
      smsCountsByPhone: {},
      doNotCall: false,
      doNotText: false,
      smsOptOut: false,
    };
    leads.push(lead);
  }

  await ref.set({
    leads,
    leadCount: leads.length,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  const lead = leads.find((l) => l.id === leadId);
  const nurture = await scheduleWebNurture(uid, leadId, lead);

  const db = getFirestore();
  await db.collection('webLeadEvents').add({
    targetUid: uid,
    leadId,
    duplicate,
    formType,
    attribution,
    nurture,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { leadId, duplicate, nurture };
}

/**
 * Queue lead when inbox UID is not configured yet.
 * @param {object} payload
 */
export async function queueWebLead(payload) {
  const db = getFirestore();
  const doc = await db.collection('webLeadQueue').add({
    ...payload,
    status: 'queued',
    createdAt: FieldValue.serverTimestamp(),
  });
  return { queuedId: doc.id };
}
