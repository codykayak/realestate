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
];

export const DEFAULT_MISSED_TEMPLATE = {
  id: 'missed',
  label: 'Missed callback',
  body:
    "Hi {{firstName}}, sorry we missed your call! We'd love to connect about {{address}}. Text or call back when you can. Reply STOP to opt out.",
};

export function mergeTemplate(body, lead, config = {}) {
  const name = String(lead?.name ?? '').trim();
  const firstName = name.split(/\s+/)[0] || 'there';
  const address = [lead?.address, lead?.city, lead?.state].filter(Boolean).join(', ').trim() || 'your property';
  const agentName = config.agentName?.trim() || 'Macro REI';

  return body
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{name\}\}/g, name || firstName)
    .replace(/\{\{address\}\}/g, address)
    .replace(/\{\{agentName\}\}/g, agentName)
    .replace(/\{\{city\}\}/g, String(lead?.city ?? '').trim())
    .replace(/\{\{state\}\}/g, String(lead?.state ?? '').trim());
}

/** SMS count for the active phone on this lead */
export function smsCountForPhone(lead, phone) {
  if (!lead || !phone) return lead?.smsCount ?? 0;
  const key = phone.replace(/\D/g, '').slice(-10);
  if (lead.smsCountsByPhone?.[key] != null) return lead.smsCountsByPhone[key];
  return lead.smsCount ?? 0;
}

export function formatPhoneKey(phone) {
  return String(phone ?? '').replace(/\D/g, '').slice(-10);
}
