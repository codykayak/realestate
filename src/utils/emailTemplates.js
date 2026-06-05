/** Email templates — merge tokens match SMS templates. */

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    id: 'intro',
    label: 'Introduction',
    subject: 'Quick question about {{address}}',
    body: `Hi {{firstName}},\n\nI'm reaching out regarding {{address}}. I'd love to connect when you have a moment.\n\nBest,\n{{agentName}}`,
  },
  {
    id: 'followup',
    label: 'Follow-up',
    subject: 'Following up — {{address}}',
    body: `Hi {{firstName}},\n\nJust following up on my note about {{address}}. Happy to answer any questions.\n\n{{agentName}}`,
  },
];

export function mergeEmailTemplate(tpl, lead, agentName = 'Macro REI') {
  const name = (lead?.name || '').trim();
  const firstName = name.split(/\s+/)[0] || 'there';
  const address = lead?.address || lead?._addressForGeocode || 'your property';
  const vars = {
    '{{firstName}}': firstName,
    '{{name}}': name || firstName,
    '{{address}}': address,
    '{{agentName}}': agentName,
    '{{city}}': String(lead?.city ?? '').trim(),
    '{{state}}': String(lead?.state ?? '').trim(),
  };
  let subject = tpl.subject ?? '';
  let body = tpl.body ?? '';
  for (const [token, val] of Object.entries(vars)) {
    subject = subject.split(token).join(val);
    body = body.split(token).join(val);
  }
  return { subject, body };
}

export function openEmailClient(lead, template, agentName) {
  const email = (lead?.email || '').trim();
  if (!email) return false;
  const { subject, body } = mergeEmailTemplate(template, lead, agentName);
  const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
  return true;
}
