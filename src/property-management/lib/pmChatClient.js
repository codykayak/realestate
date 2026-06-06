/**
 * Client for the Gemini-powered site chat API (Firebase Cloud Function).
 */

const REGION = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
const PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'realestate-map-23692';
const DEFAULT_URL = `https://${REGION}-${PROJECT}.cloudfunctions.net/pmGatewayChat`;

export function getPmChatApiUrl() {
  return (import.meta.env.VITE_PM_CHAT_URL || DEFAULT_URL).replace(/\/$/, '');
}

/**
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @returns {Promise<string>}
 */
export async function sendPmChatMessage(messages) {
  const url = getPmChatApiUrl();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Chat request failed (${res.status})`);
  }
  if (!data.reply) {
    throw new Error('No reply from chat service');
  }
  return data.reply;
}
