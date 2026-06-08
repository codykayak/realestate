import { runPmGeminiChat } from './pmGeminiChat.js';

const ALLOWED_ORIGINS = [
  'https://www.macrorei.com',
  'https://macrorei.com',
  /^https:\/\/.*\.macrorei\.com$/,
  'https://www.manydoorsai.com',
  'https://manydoorsai.com',
  /^https:\/\/.*\.manydoorsai\.com$/,
  'https://realestate-map-23692.web.app',
  'https://realestate-map-23692.firebaseapp.com',
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function corsOrigin(req) {
  const origin = req.get('origin') || req.get('Origin') || '';
  if (!origin) return ALLOWED_ORIGINS[0];
  const ok = ALLOWED_ORIGINS.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin));
  return ok ? origin : ALLOWED_ORIGINS[0];
}

export function setCors(req, res) {
  res.set('Access-Control-Allow-Origin', corsOrigin(req));
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');
}

export async function handlePmGatewayChat(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages } = req.body ?? {};
    if (!Array.isArray(messages) || !messages.length) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const sanitized = messages
      .slice(-20)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    const reply = await runPmGeminiChat(sanitized);
    res.status(200).json({ reply });
  } catch (e) {
    console.error('[pmGatewayChat]', e);
    res.status(500).json({ error: e.message || 'Chat failed' });
  }
}
