/**
 * Form submission via EmailJS.
 *
 * Setup (one-time):
 *  1. Create a free account at https://emailjs.com
 *  2. Add Email Service (Gmail) → get SERVICE_ID
 *  3. Create Email Template — use variables: {{form_type}}, {{from_name}},
 *     {{from_email}}, {{from_phone}}, {{message}}, {{reply_to}}
 *  4. Get your Public Key from Account → API Keys
 *  5. Add to .env.local (and Cloud Run env vars):
 *       VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
 *       VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
 *       VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
 */

import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const CONFIGURED = SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY;

if (!CONFIGURED) {
  console.warn('[submitForm] EmailJS not configured. Add VITE_EMAILJS_* env vars to send emails.');
}

/**
 * Submit a form by email.
 * @param {string} formType  - 'cash-offer' | 'investor' | 'alert' | 'referral'
 * @param {object} data      - form field values
 * @returns {Promise<void>}
 */
export async function submitForm(formType, data) {
  const labels = {
    'cash-offer': '💰 New Cash Offer Request',
    'investor':   '🤝 New Investor Application',
    'alert':      '🔔 New Deal Alert Sign-up',
    'referral':   '💵 New $1,000 Referral Submission',
  };

  // Build a readable message body from all form fields
  const message = Object.entries(data)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').trim()}: ${v}`)
    .join('\n');

  if (!CONFIGURED) {
    // Fallback: open mailto link so nothing is lost even without EmailJS
    const subject = encodeURIComponent(labels[formType] ?? formType);
    const body    = encodeURIComponent(message);
    window.open(`mailto:cody@macrorei.com?subject=${subject}&body=${body}`, '_blank');
    return;
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      form_type:  labels[formType] ?? formType,
      from_name:  data.name || data.referrerName || data.yourName || 'Unknown',
      from_email: data.email || data.referrerEmail || '',
      from_phone: data.phone || data.referrerPhone || '',
      message,
      reply_to:   data.email || data.referrerEmail || 'cody@macrorei.com',
    },
    PUBLIC_KEY,
  );
}
