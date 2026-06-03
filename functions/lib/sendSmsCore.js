import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { twilioClient, patchLeadSms } from './twilioStore.js';
import { mergeTemplate, toE164, phoneKey } from './templates.js';

export function leadBlocksSms(lead) {
  return Boolean(lead?.smsOptOut || lead?.doNotText);
}

/**
 * @param {string} uid
 * @param {object} config
 * @param {object} lead
 * @param {string} templateId
 * @param {string} templateBody
 * @param {string} [toPhone]
 * @param {string} trigger
 * @param {{ uid?: string, email?: string }} actor
 */
export async function sendSmsToLead(uid, config, lead, templateId, templateBody, toPhone, trigger, actor = {}) {
  if (leadBlocksSms(lead)) {
    throw new Error('This lead is marked do-not-text or SMS opt-out.');
  }

  const dest = toPhone || lead.phone;
  const to = toE164(dest);
  if (!to) throw new Error('No valid phone number.');

  const body = mergeTemplate(templateBody, lead, config);
  const client = twilioClient(config);
  const message = await client.messages.create({
    to,
    from: toE164(config.phoneNumber),
    body,
  });

  const pKey = phoneKey(to);
  if (lead.id != null) await patchLeadSms(uid, lead.id, pKey, {});

  await getFirestore().collection(`users/${uid}/smsLogs`).add({
    leadId: lead.id ?? null,
    leadName: lead.name ?? '',
    phone: to,
    phoneKey: pKey,
    templateId,
    body,
    twilioSid: message.sid,
    status: message.status,
    trigger,
    direction: 'outbound',
    createdByUid: actor.uid ?? null,
    createdByEmail: actor.email ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { message, body, to };
}
