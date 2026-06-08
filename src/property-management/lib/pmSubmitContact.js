/**
 * Contact form submission for the PM module (self-contained — no host imports).
 * Uses EmailJS when configured; falls back to mailto.
 */

import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const CONFIGURED = SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY;

const DEFAULT_TO = 'info@manydoorsai.com';

/**
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.phone
 * @param {string} data.portfolioSize
 * @param {string} data.bestTime
 * @param {string} data.cityState
 * @param {string} [data.name]
 */
export async function submitPmContact(data, supportEmail = DEFAULT_TO) {
  const message = [
    `Portfolio size: ${data.portfolioSize || '—'}`,
    `City / state: ${data.cityState || '—'}`,
    `Best time to call: ${data.bestTime || '—'}`,
    `Phone: ${data.phone || '—'}`,
    `Email: ${data.email || '—'}`,
    data.name ? `Name: ${data.name}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  if (!CONFIGURED) {
    const subject = encodeURIComponent('ManyDoors AI — Contact request');
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    return;
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      form_type: 'ManyDoors AI — Contact request',
      from_name: data.name || 'ManyDoors prospect',
      from_email: data.email || supportEmail,
      from_phone: data.phone || '',
      message,
      reply_to: data.email || supportEmail,
    },
    PUBLIC_KEY,
  );
}
