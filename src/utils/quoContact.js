/**
 * Quo (OpenPhone) deep links and helpers for the dialer.
 * @see https://support.quo.com/core-concepts/integrations/deep-linking
 */

import { phoneDigits } from './nativeContact';

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function encodePhoneParam(raw) {
  const digits = phoneDigits(raw);
  if (!digits) return '';
  if (digits.length === 10) return encodeURIComponent(`+1${digits}`);
  if (digits.length === 11 && digits[0] === '1') return encodeURIComponent(`+${digits}`);
  return encodeURIComponent(String(raw ?? '').trim());
}

/**
 * Open Quo mobile app to dial, or fall back to tel: on desktop.
 * @param {string} toPhone
 * @param {string} [fromPhone] Quo line (caller ID)
 */
export function openQuoCall(toPhone, fromPhone) {
  const to = encodePhoneParam(toPhone);
  if (!to) return false;

  if (isMobileDevice()) {
    const from = fromPhone ? `&from=${encodePhoneParam(fromPhone)}` : '';
    window.location.href = `openphone://dial?number=${to}${from}&action=call`;
    return true;
  }

  const digits = phoneDigits(toPhone);
  if (digits.length < 7) return false;
  window.location.href = `tel:${digits}`;
  return true;
}

/**
 * Open Quo mobile app to compose a text (fallback to native SMS).
 * @param {string} toPhone
 * @param {string} [fromPhone]
 * @param {string} [body]
 */
export function openQuoMessage(toPhone, fromPhone, body = '') {
  const to = encodePhoneParam(toPhone);
  if (!to) return false;

  if (isMobileDevice()) {
    const from = fromPhone ? `&from=${encodePhoneParam(fromPhone)}` : '';
    const text = body?.trim() ? `&text=${encodeURIComponent(body)}` : '';
    window.location.href = `openphone://message?number=${to}${from}${text}`;
    return true;
  }

  const digits = phoneDigits(toPhone);
  if (digits.length < 7) return false;
  const sep = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? '&'
    : '?';
  const url = body?.trim()
    ? `sms:${digits}${sep}body=${encodeURIComponent(body)}`
    : `sms:${digits}`;
  window.location.href = url;
  return true;
}
