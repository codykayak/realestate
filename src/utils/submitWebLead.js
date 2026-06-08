import { getAttribution } from './attribution';

const REGION = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
const PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'realestate-map-23692';
const DEFAULT_URL = `https://${REGION}-${PROJECT}.cloudfunctions.net/submitWebLead`;

const ENDPOINT = import.meta.env.VITE_SUBMIT_WEB_LEAD_URL || DEFAULT_URL;

/**
 * Send a marketing form lead into the Map CMS inbox (+ optional nurture).
 * @param {object} payload
 */
export async function submitWebLead(payload) {
  const body = {
    ...payload,
    attribution: {
      ...getAttribution(),
      ...(payload.attribution ?? {}),
    },
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || `Lead submit failed (${res.status})`);
  }

  return data;
}
