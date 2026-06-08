import { getFirestore } from 'firebase-admin/firestore';
import { DEFAULT_MISSED_TEMPLATE, DEFAULT_TEMPLATES, toE164 } from './templates.js';

const QUO_DOC = 'quo';
const QUO_API_BASE = 'https://api.openphone.com';

/**
 * @param {string} uid
 */
export async function getQuoConfig(uid) {
  const snap = await getFirestore().doc(`users/${uid}/data/${QUO_DOC}`).get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data?.apiKey || (!data?.phoneNumber && !data?.phoneNumberId)) return null;
  return {
    ...data,
    templates: data.templates?.length ? data.templates : DEFAULT_TEMPLATES,
    missedCallTemplate: data.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE,
    provider: 'quo',
  };
}

/**
 * @param {string} apiKey
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function quoApiFetch(apiKey, path, init = {}) {
  const url = `${QUO_API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: String(apiKey).trim(),
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!res.ok) {
    const msg = payload?.message || payload?.title || `Quo API error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.code = payload?.code;
    throw err;
  }

  return payload;
}

/**
 * @param {string} apiKey
 * @param {string} [phoneNumber]
 */
export async function verifyQuoCredentials(apiKey, phoneNumber) {
  const data = await quoApiFetch(apiKey, '/v1/phone-numbers');
  const numbers = data?.data ?? [];
  if (!numbers.length) {
    return {
      ok: true,
      phoneCount: 0,
      phoneVerified: null,
      phoneWarning: 'API key works, but no Quo phone numbers were found on this workspace.',
    };
  }

  let phoneOk = null;
  let phoneWarning = null;
  if (phoneNumber) {
    const e164 = toE164(phoneNumber);
    phoneOk = numbers.some((n) => n.number === e164 || n.id === phoneNumber);
    if (!phoneOk) {
      phoneWarning = 'API key works, but the Quo number was not found on this workspace. Check the number or use the Phone Number ID (PN…).';
    }
  }

  return {
    ok: true,
    phoneCount: numbers.length,
    phoneVerified: phoneOk,
    phoneWarning,
    numbers: numbers.map((n) => ({
      id: n.id,
      number: n.number,
      name: n.name,
    })),
  };
}

export { QUO_API_BASE };
