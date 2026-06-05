/**
 * Native device handlers — used when Twilio SMS is not fully configured.
 * Opens the phone's built-in dialer, SMS app, or email client.
 */

import { DEFAULT_EMAIL_TEMPLATES, mergeEmailTemplate } from './emailTemplates';

export function phoneDigits(phone) {
  return String(phone ?? '').replace(/\D/g, '');
}

export function openNativeCall(phone) {
  const digits = phoneDigits(phone);
  if (digits.length < 7) return false;
  window.location.href = `tel:${digits}`;
  return true;
}

export function openNativeSms(phone, body = '') {
  const digits = phoneDigits(phone);
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

export function openNativeEmail(lead, template, agentName = 'Macro REI') {
  const email = (lead?.email || '').trim();
  if (!email) return false;
  const tpl = template ?? DEFAULT_EMAIL_TEMPLATES[0];
  const { subject, body } = mergeEmailTemplate(tpl, lead, agentName);
  const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
  return true;
}
