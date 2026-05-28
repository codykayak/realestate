import { CONTACT_EMAIL } from '../constants/brand';

/** Open the visitor's email client with a message addressed to Cody. */
export function sendFormToContact({ subject, fields }) {
  const body = Object.entries(fields)
    .filter(([, value]) => value != null && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) params.set('body', body);

  window.location.href = `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}
