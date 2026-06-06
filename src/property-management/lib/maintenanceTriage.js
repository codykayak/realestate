/**
 * AI maintenance triage.
 *
 * Classifies a free-text maintenance request into a category + priority,
 * detects emergencies (a liability-reduction feature), and suggests resident
 * self-help that can deflect a truck roll. Deterministic and local today;
 * the same signature accepts an LLM + photo-vision backend later.
 */

const CATEGORY_RULES = [
  { category: 'HVAC', re: /\b(heat|heating|furnace|ac|a\/c|air condition|hvac|thermostat|cold|hot|no air)\b/i },
  { category: 'Plumbing', re: /\b(leak|leaking|water|toilet|sink|drain|clog|pipe|faucet|sewage|flush|running)\b/i },
  { category: 'Electrical', re: /\b(power|outlet|electric|breaker|light|spark|wiring|fuse|gfci)\b/i },
  { category: 'Appliance', re: /\b(fridge|refrigerator|stove|oven|dishwasher|disposal|washer|dryer|microwave|appliance)\b/i },
  { category: 'Locks/Doors', re: /\b(lock|key|door|window|latch|hinge|broken handle)\b/i },
  { category: 'Pest', re: /\b(pest|bug|roach|ant|mouse|mice|rat|infest|spider)\b/i },
];

const EMERGENCY_RE = /\b(gas|smell of gas|carbon monoxide|fire|smoke|flood|flooding|burst|no heat|sewage backup|sparks|electrical fire|break in|broke in|cannot lock|won'?t lock|locked out)\b/i;

const SELF_HELP = {
  Appliance: {
    match: /\b(disposal|garbage disposal)\b/i,
    tip: 'Garbage disposal humming but not spinning? Turn it off, then press the small red RESET button on the underside of the unit. If it stays stuck, use the hex key in the bottom-center slot to free it. This resolves most disposal tickets without a visit.',
  },
  Electrical: {
    match: /\b(outlet|gfci|no power|dead outlet|bathroom outlet|kitchen outlet)\b/i,
    tip: 'Dead outlet in a kitchen/bathroom/garage? Look for a GFCI outlet (with TEST/RESET buttons) nearby and press RESET. Also check the breaker panel for a tripped breaker. This fixes most "no power to one outlet" tickets.',
  },
  HVAC: {
    match: /\b(thermostat|not cooling|not heating)\b/i,
    tip: 'No heat/cooling? Confirm the thermostat is set to HEAT/COOL and the temperature is set past the current room temp, and try fresh thermostat batteries. If the air handler fan runs but no temperature change, we will dispatch a tech.',
  },
};

export function triageRequest(text, config = {}) {
  const { selfHelpDeflection = true, technicians = [], onCallTechId } = config;
  const onCall = technicians.find((t) => t.id === onCallTechId) || technicians[0] || null;
  const isEmergency = EMERGENCY_RE.test(text);

  let category = 'General';
  for (const rule of CATEGORY_RULES) {
    if (rule.re.test(text)) { category = rule.category; break; }
  }

  let priority = 'normal';
  if (isEmergency) priority = 'emergency';
  else if (/\b(asap|urgent|today|right now|leaking everywhere|won'?t stop)\b/i.test(text)) priority = 'high';
  else if (/\b(whenever|no rush|minor|small|cosmetic)\b/i.test(text)) priority = 'low';

  let selfHelp = null;
  if (selfHelpDeflection && !isEmergency) {
    const candidate = SELF_HELP[category];
    if (candidate && candidate.match.test(text)) selfHelp = candidate.tip;
  }

  return {
    category,
    priority,
    isEmergency,
    selfHelp,
    recommendedStatus: isEmergency ? 'dispatched' : selfHelp ? 'self-help-sent' : 'open',
    routing: isEmergency
      ? 'Escalate now: on-call emergency maintenance + notify property manager.'
      : `Route to ${category} queue (${priority} priority).`,
  };
}

export default triageRequest;
