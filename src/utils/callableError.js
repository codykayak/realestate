/**
 * Turn Firebase httpsCallable errors into plain English.
 * @param {unknown} err
 */
export function parseCallableError(err) {
  const e = /** @type {{ code?: string, message?: string, details?: unknown }} */ (err);
  const code = String(e?.code ?? '').replace(/^functions\//, '');
  const detail = typeof e?.details === 'string' ? e.details : '';

  if (code === 'unauthenticated') {
    return 'Please sign in to the app again, then retry Twilio setup.';
  }
  if (code === 'permission-denied') {
    return 'Permission denied. Check that you are signed in.';
  }
  if (code === 'invalid-argument' && e?.message && e.message !== 'internal') {
    return e.message;
  }
  if (code === 'failed-precondition') {
    return e?.message || 'Setup requirements not met.';
  }
  if (code === 'not-found' || (code === 'internal' && /not found|404/i.test(String(e?.message)))) {
    return 'SMS backend is not deployed yet. Tap "Save & continue" below, or ask your admin to run: firebase deploy --only functions';
  }
  if (code === 'unavailable') {
    return 'Cannot reach Cloud Functions. Check your connection and try again.';
  }
  if (code === 'internal') {
    if (detail) return String(detail);
    const msg = String(e?.message ?? '');
    if (/404|not found|NOT_FOUND/i.test(msg)) {
      return 'SMS Cloud Functions are not deployed yet (404). Tap Save & continue below — your credentials will still save.';
    }
    return 'Could not reach Twilio verify (Cloud Functions). Tap Save & continue below to finish setup without the API test.';
  }
  if (e?.message && e.message !== 'internal') {
    return e.message;
  }
  return 'Something went wrong. Check credentials or use Save & continue.';
}

export function validateQuoFields({ apiKey, phoneNumber, phoneNumberId }) {
  const key = String(apiKey ?? '').trim();
  if (key.length < 20) {
    return 'Paste your full Quo API key from Workspace Settings → API.';
  }
  const digits = (p) => String(p ?? '').replace(/\D/g, '');
  const hasNumber = digits(phoneNumber).length >= 10;
  const hasId = /^PN/i.test(String(phoneNumberId ?? '').trim());
  if (!hasNumber && !hasId) {
    return 'Enter your Quo phone number (E.164) or Phone Number ID (starts with PN).';
  }
  return null;
}

export function validateTwilioFields({ accountSid, authToken, phoneNumber, agentPhone }) {
  const sid = String(accountSid ?? '').trim();
  const token = String(authToken ?? '').trim();
  if (!sid.startsWith('AC') || sid.length < 34) {
    return 'Account SID should start with AC and be about 34 characters.';
  }
  if (token.length < 32) {
    return 'Auth Token looks too short. Copy the full token from Twilio Console.';
  }
  const digits = (p) => String(p ?? '').replace(/\D/g, '');
  if (digits(phoneNumber).length < 10) {
    return 'Enter your Twilio phone number (10+ digits).';
  }
  if (digits(agentPhone).length < 10) {
    return 'Enter your cell number for inbound call forwarding.';
  }
  return null;
}
