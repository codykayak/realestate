import { defineString } from 'firebase-functions/params';
import { ingestWebLead, queueWebLead } from './webLeadIngest.js';

const leadInboxUid = defineString('LEAD_INBOX_UID', { default: '' });
const leadWebhookSecret = defineString('LEAD_WEBHOOK_SECRET', { default: '' });

const ALLOWED_ORIGINS = [
  'https://www.macrorei.com',
  'https://macrorei.com',
  /^https:\/\/.*\.macrorei\.com$/,
  'https://realestate-map-23692.web.app',
  'https://realestate-map-23692.firebaseapp.com',
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function corsOrigin(req) {
  const origin = req.get('origin') || req.get('Origin') || '';
  if (!origin) return 'https://www.macrorei.com';
  const ok = ALLOWED_ORIGINS.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin));
  return ok ? origin : 'https://www.macrorei.com';
}

export function setWebLeadCors(req, res) {
  res.set('Access-Control-Allow-Origin', corsOrigin(req));
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');
  res.set('Access-Control-Max-Age', '3600');
}

function getInboxUid() {
  return String(leadInboxUid.value() || process.env.LEAD_INBOX_UID || '').trim();
}

function getWebhookSecret() {
  return String(leadWebhookSecret.value() || process.env.LEAD_WEBHOOK_SECRET || '').trim();
}

/**
 * Public website form + external webhook (Meta/Google/Zapier).
 */
export async function handleWebLeadSubmit(req, res) {
  setWebLeadCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const secret = req.get('x-webhook-secret') || req.get('X-Webhook-Secret') || '';
  const configuredSecret = getWebhookSecret();
  const isWebhook = Boolean(configuredSecret && secret && secret === configuredSecret);

  if (configuredSecret && secret && secret !== configuredSecret) {
    res.status(403).json({ error: 'Invalid webhook secret' });
    return;
  }

  if (body.website && String(body.website).trim()) {
    res.status(200).json({ ok: true, ignored: 'honeypot' });
    return;
  }

  const uid = getInboxUid();
  try {
    if (!uid) {
      const queued = await queueWebLead({ ...body, source: isWebhook ? 'webhook' : 'website' });
      res.status(202).json({
        ok: true,
        queued: true,
        queuedId: queued.queuedId,
        message: 'Lead saved to queue. Set LEAD_INBOX_UID on Cloud Functions to route into the app.',
      });
      return;
    }

    const result = await ingestWebLead(uid, body);
    res.status(200).json({
      ok: true,
      leadId: result.leadId,
      duplicate: result.duplicate,
      nurture: result.nurture,
    });
  } catch (e) {
    console.error('[submitWebLead]', e);
    res.status(400).json({ error: e.message || 'Could not ingest lead' });
  }
}
