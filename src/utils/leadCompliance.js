/** @param {Record<string, unknown> | null | undefined} lead */
export function isSmsBlocked(lead) {
  if (!lead) return false;
  return Boolean(lead.smsOptOut || lead.doNotText);
}

/** @param {Record<string, unknown> | null | undefined} lead */
export function isCallBlocked(lead) {
  if (!lead) return false;
  return Boolean(lead.doNotCall);
}

export function complianceLabel(lead) {
  const tags = [];
  if (lead?.doNotCall) tags.push('Do not call');
  if (lead?.doNotText) tags.push('Do not text');
  if (lead?.smsOptOut) tags.push('SMS opted out');
  return tags;
}
