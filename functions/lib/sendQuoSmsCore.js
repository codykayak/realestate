import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { patchLeadSms } from './twilioStore.js';
import { mergeTemplate, toE164, phoneKey } from './templates.js';
import { quoApiFetch } from './quoStore.js';
import { leadBlocksSms } from './sendSmsCore.js';

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
export async function sendQuoSmsToLead(uid, config, lead, templateId, templateBody, toPhone, trigger, actor = {}) {
  if (leadBlocksSms(lead)) {
    throw new Error('This lead is marked do-not-text or SMS opt-out.');
  }

  const dest = toPhone || lead.phone;
  const to = toE164(dest);
  if (!to) throw new Error('No valid phone number.');

  const body = mergeTemplate(templateBody, lead, config);
  const from = config.phoneNumberId?.trim()
    || toE164(config.phoneNumber);

  if (!from) throw new Error('Quo sender number is not configured.');

  const payload = await quoApiFetch(config.apiKey, '/v1/messages', {
    method: 'POST',
    body: JSON.stringify({
      content: body,
      from,
      to: [to],
    }),
  });

  const message = payload?.data ?? {};
  const pKey = phoneKey(to);
  if (lead.id != null) await patchLeadSms(uid, lead.id, pKey, {});

  await getFirestore().collection(`users/${uid}/smsLogs`).add({
    leadId: lead.id ?? null,
    leadName: lead.name ?? '',
    phone: to,
    phoneKey: pKey,
    templateId,
    body,
    quoMessageId: message.id ?? null,
    status: message.status ?? 'queued',
    provider: 'quo',
    trigger,
    direction: 'outbound',
    createdByUid: actor.uid ?? null,
    createdByEmail: actor.email ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { message, body, to };
}
