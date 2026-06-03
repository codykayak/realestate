/** @typedef {{ id: string, label: string, body: string }} SmsTemplate */

/** @type {SmsTemplate[]} */
export const DEFAULT_TEMPLATES = [
  {
    id: 'intro',
    label: 'Introduction',
    body:
      'Hi {{firstName}}, this is {{agentName}} with Macro REI. I noticed your property at {{address}}. Are you open to a quick chat about an offer? Reply STOP to opt out.',
  },
  {
    id: 'followup',
    label: 'Follow-up',
    body:
      'Hi {{firstName}}, following up about {{address}}. We buy houses as-is for cash. Interested? Reply STOP to opt out.',
  },
  {
    id: 'value',
    label: 'Value proposition',
    body:
      'Hi {{firstName}}, we help owners at {{address}} sell fast with no fees or repairs. Can I send details? Reply STOP to opt out.',
  },
  {
    id: 'appointment',
    label: 'Appointment confirmed',
    body:
      "Hi {{firstName}}, reminder: we're scheduled to connect {{appointmentTime}} regarding {{address}}. Reply if you need to reschedule. MacroREI {{agentName}}. Reply STOP to opt out.",
  },
];

/** @type {SmsTemplate} */
export const DEFAULT_MISSED_TEMPLATE = {
  id: 'missed',
  label: 'Missed callback',
  body:
    "Hi {{firstName}}, sorry we missed your call! We'd love to connect about {{address}}. Text or call back when you can. Reply STOP to opt out.",
};

/**
 * @param {string} body
 * @param {Record<string, unknown>} lead
 * @param {{ agentName?: string }} config
 */
export function mergeTemplate(body, lead, config = {}) {
  const name = String(lead.name ?? '').trim();
  const firstName = name.split(/\s+/)[0] || 'there';
  const address = [lead.address, lead.city, lead.state].filter(Boolean).join(', ').trim() || 'your property';
  const agentName = config.agentName?.trim() || 'Macro REI';
  let appointmentTime = '';
  if (lead.appointmentAt) {
    const d = new Date(lead.appointmentAt);
    if (!Number.isNaN(d.getTime())) {
      appointmentTime = d.toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        timeZone: 'America/Los_Angeles',
      });
    }
  }

  return body
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{name\}\}/g, name || firstName)
    .replace(/\{\{address\}\}/g, address)
    .replace(/\{\{agentName\}\}/g, agentName)
    .replace(/\{\{city\}\}/g, String(lead.city ?? '').trim())
    .replace(/\{\{state\}\}/g, String(lead.state ?? '').trim())
    .replace(/\{\{appointmentTime\}\}/g, appointmentTime || 'at our scheduled time');
}

/**
 * @param {string} raw
 * @returns {string} E.164 for US numbers when possible
 */
export function toE164(raw) {
  const d = String(raw ?? '').replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d[0] === '1') return `+${d}`;
  if (String(raw ?? '').startsWith('+')) return String(raw).trim();
  return d ? `+${d}` : '';
}

/** @param {string} raw @returns {string} last 10 digits */
export function phoneKey(raw) {
  const d = String(raw ?? '').replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return d.slice(1);
  return d.length >= 10 ? d.slice(-10) : d;
}
