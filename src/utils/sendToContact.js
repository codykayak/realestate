/**
 * Send a form submission via EmailJS (preferred) or mailto: fallback.
 *
 * ── EmailJS Setup (one-time, free 200 emails/month) ──────────────────────
 * 1. Sign up at https://emailjs.com
 * 2. Email Services → Add Service → connect your Gmail
 * 3. Email Templates → Create Template. Use these variables:
 *      Subject:  {{form_type}}
 *      Body:     From: {{from_name}} ({{from_phone}} / {{from_email}})
 *                {{message}}
 *      Reply-To: {{reply_to}}
 * 4. Account → API Keys → copy your Public Key
 * 5. Add to .env.local AND Cloud Run environment variables:
 *      VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
 *      VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
 *      VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
 *
 * Without those vars, forms fall back to opening the user's email client.
 */

import emailjs from '@emailjs/browser';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../firebase';
import { CONTACT_EMAIL } from '../constants/brand';
import { submitWebLead } from './submitWebLead';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const EMAIL_CONFIGURED = !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

if (!EMAIL_CONFIGURED) {
  console.info(
    '[sendToContact] EmailJS not configured — forms will open mailto: fallback.\n' +
    'To send emails directly, add VITE_EMAILJS_* to your env vars (see sendToContact.js).',
  );
}

/**
 * @param {{ subject: string, fields: Record<string,string> }} options
 */
export async function sendFormToContact({ subject, fields }) {
  const body = Object.entries(fields)
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  // ── Route into Map CMS inbox + nurture (non-blocking) ───────────────
  try {
    await submitWebLead({
      formType: subject,
      name: fields.Name || fields['Your Name'] || '',
      phone: fields.Phone || fields['Your Phone'] || '',
      email: fields.Email || fields['Your Email'] || '',
      address: fields['Property address'] || fields['Property Address'] || fields.Address || '',
      details: body,
    });
  } catch (err) {
    console.warn('[sendToContact] Web lead ingest failed (email still sent):', err);
  }

  // ── Always save to Firestore /submissions (survives email failures) ──
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'submissions'), {
        type:      subject,
        fields,
        body,
        userId:    auth?.currentUser?.uid    ?? null,
        userEmail: auth?.currentUser?.email  ?? fields['Email'] ?? fields['Your Email'] ?? null,
        timestamp: serverTimestamp(),
        read:      false,
      });
    } catch (err) {
      console.warn('[sendToContact] Firestore save failed:', err);
    }
  }

  if (EMAIL_CONFIGURED) {
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          form_type:  subject,
          from_name:  fields['Name']  || fields['Your Name']  || 'Website visitor',
          from_email: fields['Email'] || fields['Your Email'] || '',
          from_phone: fields['Phone'] || fields['Your Phone'] || '',
          message:    body,
          reply_to:   fields['Email'] || fields['Your Email'] || CONTACT_EMAIL,
        },
        PUBLIC_KEY,
      );
      console.log('[sendToContact] Email sent via EmailJS ✓');
      return;
    } catch (err) {
      console.error('[sendToContact] EmailJS error — falling back to mailto:', err);
      // Fall through to mailto
    }
  }

  // Fallback: open user's email client
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (body) params.set('body', body);
  window.open(`mailto:${CONTACT_EMAIL}?${params.toString()}`, '_blank');
}
