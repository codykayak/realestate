/**
 * Enterprise pitch — research-backed benchmarks and demo ROI models.
 * Sources are industry ranges used in sales conversations; label as illustrative
 * unless tied to a customer's own pilot data.
 */

export const PITCH_SOURCES = [
  { id: 'zillow', label: 'Zillow / industry speed-to-lead', note: 'Responding within minutes materially improves tour conversion vs. hours-long delays.' },
  { id: 'naa', label: 'NAA / NMHC operating surveys', note: 'Labor is the largest controllable expense in multifamily operations.' },
  { id: 'fraud', label: 'Application fraud reports (2023–2025)', note: 'Document fraud and income misrepresentation are rising; eviction costs often exceed $3k–$10k per case.' },
  { id: 'retention', label: 'Resident satisfaction → renewal', note: 'Responsive maintenance and communication correlate with higher renewal rates and lower turn costs.' },
];

/** Illustrative portfolio for calculator (midsize operator). */
export const DEFAULT_PORTFOLIO = {
  units: 2800,
  properties: 14,
  avgRent: 1650,
  staffFte: 42,
};

export function computePortfolioRoi({ units, avgRent, properties }) {
  const u = Math.max(100, Number(units) || DEFAULT_PORTFOLIO.units);
  const rent = Math.max(800, Number(avgRent) || DEFAULT_PORTFOLIO.avgRent);
  const props = Math.max(1, Number(properties) || DEFAULT_PORTFOLIO.properties);

  // Monthly inquiry volume ~ 5–8 per unit / year → ~0.55/mo per unit (conservative)
  const monthlyInquiries = Math.round(u * 0.55);
  const deflectionRate = 0.58;
  const deflected = Math.round(monthlyInquiries * deflectionRate);
  const inquirySavings = deflected * 5; // ~4 min @ loaded labor

  // Truck rolls: ~2.5 WO/unit/year; ~18% deflectable via self-help
  const monthlyWo = Math.round((u * 2.5) / 12);
  const truckRollsAvoided = Math.round(monthlyWo * 0.18);
  const maintenanceSavings = truckRollsAvoided * 145;

  // Leasing: 0.8% monthly turnover → vacancy-days saved with faster response
  const monthlyTurns = Math.max(1, Math.round(u * 0.008));
  const vacancyDaysSaved = Math.round(monthlyTurns * 2.2); // ~2 days faster lease-up
  const vacancySavings = vacancyDaysSaved * (rent / 30);

  const prescreens = Math.round(monthlyTurns * 4.5); // apps per turn + traffic
  const prescreenSavings = prescreens * 28;

  const afterHours = 1200;
  const fraudPrevention = Math.round(props * 450); // amortized bad-tenancy avoidance

  const lines = [
    { key: 'inquiries', label: 'Resident inquiry deflection', value: inquirySavings, detail: `${deflected} of ~${monthlyInquiries} inquiries/mo @ 58% deflection` },
    { key: 'maintenance', label: 'Maintenance self-help / triage', value: maintenanceSavings, detail: `~${truckRollsAvoided} avoided truck rolls/mo` },
    { key: 'vacancy', label: 'Faster lease-up (vacancy days)', value: Math.round(vacancySavings), detail: `~${vacancyDaysSaved} vacancy-days saved/mo` },
    { key: 'prescreen', label: 'Leasing pre-screen automation', value: prescreenSavings, detail: `${prescreens} applications triaged/mo` },
    { key: 'afterHours', label: 'After-hours coverage', value: afterHours, detail: 'No answering service / overtime premium' },
    { key: 'fraud', label: 'Application audit & fraud prevention', value: fraudPrevention, detail: 'Illustrative risk reduction' },
  ];

  const monthlyTotal = lines.reduce((s, l) => s + l.value, 0);
  const annualTotal = monthlyTotal * 12;
  const perUnitMonthly = monthlyTotal / u;
  const fteEquivalent = Math.round((deflected * 4 + prescreens * 28) / 60 / 160 * 10) / 10;

  return {
    units: u,
    avgRent: rent,
    properties: props,
    monthlyTotal,
    annualTotal,
    perUnitMonthly,
    fteEquivalent,
    lines,
    monthlyInquiries,
    deflectionRate,
    truckRollsAvoided,
  };
}

export const SPEED_TO_LEAD_DATA = {
  labels: ['<5 min', '5–30 min', '30–60 min', '1–4 hrs', '4+ hrs'],
  conversionIndex: [100, 72, 48, 31, 18], // indexed to fastest = 100
};

export const DEFLECTION_COMPARISON = {
  labels: ['Without AI layer', 'With ManyDoors AI (target)'],
  series: [
    { label: 'Staff-handled volume %', values: [100, 42], color: '#6b7785' },
    { label: 'Auto-resolved %', values: [0, 58], color: '#00d2d3' },
  ],
};

export const MODULES = [
  {
    id: 'comms',
    icon: 'chat',
    title: 'AI Resident Communication',
    tagline: 'Deflect 50–70% of repetitive inquiries — 24/7',
    bullets: [
      'Unified SMS + email inbox with property-specific knowledge base (not generic ChatGPT)',
      'Live PMS data for balance, lease end, work-order status when integrated',
      'Confidence-gated escalation; sensitive topics (Fair Housing, legal, emergencies) always route to staff',
      'After-hours and weekend coverage at zero marginal cost per message',
    ],
    stat: '50–70%',
    statLabel: 'target deflection on FAQ-style volume',
  },
  {
    id: 'leasing',
    icon: 'key',
    title: 'Automated Leasing',
    tagline: 'Speed-to-lead + pre-screen + fraud audit',
    bullets: [
      'Instant response to ILS and website leads (<5 min beats hours — conversion lifts materially)',
      'Automated pre-screen: income-to-rent, pets, move-in date, knockout rules per jurisdiction',
      'Screening integration path: SmartMove / Experian-class providers',
      'Application audit: cross-check pay stubs, detect document tampering, flag identity mismatches',
    ],
    stat: '2+ days',
    statLabel: 'vacancy-days saved per lease (illustrative)',
  },
  {
    id: 'maintenance',
    icon: 'wrench',
    title: 'AI Maintenance Triage',
    tagline: 'Fast-track emergencies, deflect truck rolls',
    bullets: [
      'Category + priority from free-text (and photos when LLM vision is enabled)',
      'Emergency detection: gas, flood, no heat, lockout → immediate escalation path',
      'Self-help: GFCI reset, disposal, thermostat — guided steps before dispatch',
      'PMS write-back + vendor routing (roadmap): Yardi WO, status loops to residents',
    ],
    stat: '15–25%',
    statLabel: 'truck rolls avoidable via self-help',
  },
  {
    id: 'platform',
    icon: 'shield',
    title: 'Connective tissue',
    tagline: 'What makes the platform defensible',
    bullets: [
      'Per-property knowledge base — the moat that improves with every answer',
      'Manifest-driven integrations: Yardi, RealPage, AppFolio, Entrata, Twilio, screening',
      'Human-in-the-loop console — staff approve, edit, override every AI action',
      'ROI dashboard + owner reports — renewals become a data decision',
    ],
    stat: '1 layer',
    statLabel: 'on top of the PMS you already own',
  },
];

/** Five product modules surfaced on the public gateway homepage. */
export const GATEWAY_MODULES = [
  {
    id: 'comms',
    featureSlug: 'communications',
    icon: 'chat',
    title: 'AI Resident Communication',
    tagline: MODULES[0].tagline,
    bullets: MODULES[0].bullets,
    stat: MODULES[0].stat,
    statLabel: MODULES[0].statLabel,
  },
  {
    id: 'leasing',
    featureSlug: 'leasing',
    icon: 'key',
    title: 'Automated Leasing',
    tagline: MODULES[1].tagline,
    bullets: MODULES[1].bullets,
    stat: MODULES[1].stat,
    statLabel: MODULES[1].statLabel,
  },
  {
    id: 'maintenance',
    featureSlug: 'maintenance',
    icon: 'wrench',
    title: 'AI Maintenance Triage',
    tagline: MODULES[2].tagline,
    bullets: MODULES[2].bullets,
    stat: MODULES[2].stat,
    statLabel: MODULES[2].statLabel,
  },
  {
    id: 'owner',
    featureSlug: 'owner-portal',
    icon: 'chart',
    title: 'Owner Portal & NOI',
    tagline: 'Real-time NOI vs budget — owner-grade reporting',
    bullets: [
      'Real-time NOI MTD/YTD vs budget with property-level drill-down',
      'One-click PDF owner reports with itemized AI impact lines',
      'White-label branding for investor relations and asset managers',
      'Cash-on-cash and portfolio roll-ups for renewals that stick',
    ],
    stat: '1-click',
    statLabel: 'owner report generation',
  },
  {
    id: 'support',
    featureSlug: 'us-support',
    icon: 'shield',
    title: 'U.S. Support & Updates',
    tagline: 'Real people, constant improvements, no stale software',
    bullets: [
      'U.S.-based onboarding and escalation — not an offshore ticket queue',
      'Continuous platform updates: models, connectors, compliance patches',
      'Knowledge-base tuning with your team during pilot and roll-out',
      'Enterprise SLA path for large portfolios',
    ],
    stat: '24/7',
    statLabel: 'AI coverage with human backup',
  },
];

export const COMPETITORS = [
  { name: 'EliseAI', focus: 'Leasing + resident AI (enterprise-heavy)', gap: 'Maintenance + fraud audit + mid-market packaging' },
  { name: 'Knock / Funnel / LeaseHawk', focus: 'Leasing CRM + AI assistants', gap: 'Unified ops across comms + maintenance' },
  { name: 'AppFolio Realm-X / Yardi chat', focus: 'PMS-native AI add-ons', gap: 'PMS-agnostic layer; works across portfolio acquisitions' },
  { name: 'Colleen AI', focus: 'Collections / AR', gap: 'Full lead-to-lease + maintenance operations' },
];

export const COMPLIANCE = [
  { title: 'Fair Housing (FHA)', body: 'AI never steers by protected class; audit log of every automated decision; human handoff for complaints and accommodations.' },
  { title: 'TCPA / SMS', body: 'Opt-in, STOP/HELP, 10DLC A2P registration; consent tracked per resident.' },
  { title: 'FCRA / screening', body: 'Adverse action workflows when screening integrations are enabled; disclosures per jurisdiction.' },
  { title: 'SOC 2 path', body: 'Tenant-isolated data, secrets server-side only, Firestore rules — enterprise security narrative.' },
];

export const PHASING = [
  { phase: 'Pilot (30–60 days)', items: ['One property or cluster', 'Comms deflection + knowledge base', 'Baseline metrics: deflection %, response time'] },
  { phase: 'Portfolio roll-out', items: ['Leasing autopilot + pre-screen', 'Maintenance triage + dispatch rules', 'PMS read sync'] },
  { phase: 'Enterprise', items: ['Full write-back', 'Fraud audit at scale', 'SSO, custom branding, SLA'] },
];
