/**
 * Marketing copy, asset paths, and SEO metadata for the PM gateway
 * and feature detail pages at /property-management.
 */

import { localBusinessJsonLd, getPmSiteUrl } from './localBusiness.js';

/** Served from /public — SVG logos are transparent; avoid manydoors-logo.png (opaque). */
export const GATEWAY_ASSETS = {
  heroVideo: '/manydoors-ai_property-management-realestate.mp4',
  softwareImage: '/manydoors-ai-software-property-management.png',
  investorImage: '/manydoorsai-property-management-investor-software-ai.png',
  opsTeamImage: '/pm-pitch/pm-pitch-operations-team.png',
  logo: '/manydoors-logo-mark.svg',
};

export const US_SUPPORT = {
  headline: 'U.S.-based support teams on call',
  body:
    'ManyDoors AI is built and supported in the United States. Your portfolio gets a dedicated onboarding specialist, live chat during business hours, and an on-call escalation path for production issues — not an offshore ticket queue.',
  bullets: [
    'Human support for setup, integrations, and knowledge-base tuning',
    'Continuous platform updates — new AI models, PMS connectors, and compliance patches ship regularly',
    'SLA-backed response for enterprise portfolios (roadmap)',
  ],
};

export const FEATURE_PAGES = [
  {
    slug: 'communications',
    icon: 'chat',
    title: 'AI Resident Communication',
    tagline: 'Deflect 50–70% of repetitive inquiries — 24/7 without overtime',
    metaDescription:
      'ManyDoors AI resident communication deflects FAQ-style SMS and email volume around the clock. Property-specific knowledge base, PMS-aware answers, and human escalation for Fair Housing and emergencies.',
    savings: {
      time: '4+ staff hours saved per 100 inquiries deflected',
      money: '$3,000–$8,000/mo illustrative savings on a 2,800-unit portfolio',
    },
    sections: [
      {
        heading: 'Stop paying for nights and weekends',
        body:
          'Residents message when it is convenient for them — not when your office is open. ManyDoors answers balance, lease, amenity, and policy questions instantly from your property knowledge base, so staff focus on exceptions instead of repetition.',
      },
      {
        heading: 'Confidence-gated escalation',
        body:
          'Sensitive topics (Fair Housing, legal threats, emergencies) always route to a human. Every AI draft is logged for audit. When integrated with your PMS, answers can include live balance, lease end, and work-order status.',
      },
    ],
    metrics: [
      { label: 'Target deflection', value: '50–70%', sub: 'FAQ-style inquiry volume' },
      { label: 'Response time', value: '<30 sec', sub: 'vs. hours for manual inbox' },
      { label: 'After-hours coverage', value: '$0', sub: 'marginal cost per message' },
    ],
    chartKey: 'deflection',
  },
  {
    slug: 'leasing',
    icon: 'key',
    title: 'Automated Leasing',
    tagline: 'Speed-to-lead, pre-screen, and fraud audit in one pipeline',
    metaDescription:
      'ManyDoors AI automated leasing responds to ILS and website leads in minutes, runs knockout pre-screening, and audits applications for fraud — cutting vacancy days and bad tenancy risk.',
    savings: {
      time: '25+ minutes saved per application triaged automatically',
      money: '$450+ per avoided bad tenancy (illustrative fraud prevention)',
    },
    sections: [
      {
        heading: 'Win the first five minutes',
        body:
          'Industry data shows responding within minutes materially improves tour conversion versus multi-hour delays. ManyDoors instant-replies to every lead, qualifies interest, and schedules tours while your team is on site or off the clock.',
      },
      {
        heading: 'Pre-screen before humans touch the file',
        body:
          'Income-to-rent, pets, move-in timing, and jurisdiction-specific knockout rules filter unqualified applicants automatically. Screening provider integrations (SmartMove, Experian-class) sit on the roadmap for adverse-action workflows.',
      },
    ],
    metrics: [
      { label: 'Vacancy days saved', value: '2+', sub: 'per lease (illustrative)' },
      { label: 'Lead response', value: '<5 min', sub: 'target speed-to-lead' },
      { label: 'Apps triaged/mo', value: '40+', sub: 'per 100 units turnover' },
    ],
    chartKey: 'speedToLead',
  },
  {
    slug: 'maintenance',
    icon: 'wrench',
    title: 'AI Maintenance Triage',
    tagline: 'Emergencies first, truck rolls only when needed',
    metaDescription:
      'ManyDoors AI maintenance triage categorizes work orders, detects emergencies, routes on-call technicians, and deflects fixable issues with guided self-help — saving truck rolls and resident frustration.',
    savings: {
      time: '30+ minutes saved per self-help deflected ticket',
      money: '$145+ saved per avoided truck roll (illustrative)',
    },
    sections: [
      {
        heading: 'Triage that thinks like your best coordinator',
        body:
          'Free-text requests (and photos when vision is enabled) are classified by category and priority. Gas leaks, floods, no-heat, and lockouts hit the emergency path immediately with on-call tech assignment from your roster.',
      },
      {
        heading: 'Self-help before dispatch',
        body:
          'GFCI resets, disposal jams, thermostat settings — guided steps resolve 15–25% of tickets without a visit. Residents get faster fixes; your NOI keeps maintenance spend predictable.',
      },
    ],
    metrics: [
      { label: 'Truck rolls avoided', value: '15–25%', sub: 'via self-help deflection' },
      { label: 'Emergency detection', value: 'Instant', sub: 'gas, flood, heat, lockout' },
      { label: 'Open WO visibility', value: 'Live', sub: 'status loops to residents' },
    ],
    chartKey: 'maintenance',
  },
  {
    slug: 'owner-portal',
    icon: 'chart',
    title: 'Owner Portal & NOI Reporting',
    tagline: 'Defend every dollar in the owner meeting',
    metaDescription:
      'ManyDoors AI owner portal delivers real-time NOI, budget variance, AI impact metrics, and one-click PDF reports — so renewals become a data decision, not a debate.',
    savings: {
      time: '8+ hours saved per monthly owner reporting cycle',
      money: 'Higher retention via transparent, defensible NOI storytelling',
    },
    sections: [
      {
        heading: 'NOI you can defend',
        body:
          'Trailing-twelve NOI vs budget, operating margin, and property-level drill-down give owners and asset managers the same picture your team sees. AI impact lines show exactly where automation saved labor and vacancy.',
      },
      {
        heading: 'White-label ready',
        body:
          'Per-owner branding, portfolio roll-ups, and exportable PDF reports mean your investor relations team spends less time in spreadsheets and more time on acquisitions.',
      },
    ],
    metrics: [
      { label: 'Report generation', value: '1-click', sub: 'PDF owner packages' },
      { label: 'NOI visibility', value: 'MTD/YTD', sub: 'vs budget & prior year' },
      { label: 'AI impact', value: 'Itemized', sub: 'labor, vacancy, maintenance' },
    ],
    chartKey: 'noi',
    image: GATEWAY_ASSETS.investorImage,
  },
  {
    slug: 'us-support',
    icon: 'shield',
    title: 'U.S. Support & Always-On Updates',
    tagline: 'Real people, constant improvements, no stale software',
    metaDescription:
      'ManyDoors AI is supported by U.S.-based teams with on-call escalation, continuous platform updates, and compliance-aware releases for multifamily operators.',
    savings: {
      time: 'Faster go-live with guided onboarding (days, not months)',
      money: 'Avoid legacy PMS add-on lock-in with an agnostic AI layer',
    },
    sections: [
      {
        heading: US_SUPPORT.headline,
        body: US_SUPPORT.body,
      },
      {
        heading: 'Shipped updates, not annual releases',
        body:
          'New deflection models, connector improvements, and Fair Housing guardrails land continuously. Your knowledge base and integrations improve over time without a rip-and-replace project.',
      },
    ],
    metrics: [
      { label: 'Support', value: 'U.S.', sub: 'onboarding & escalation' },
      { label: 'Updates', value: 'Continuous', sub: 'models & integrations' },
      { label: 'Compliance', value: 'Built-in', sub: 'FHA, TCPA, FCRA paths' },
    ],
    chartKey: 'support',
    image: GATEWAY_ASSETS.opsTeamImage,
  },
];

export const FEATURE_BY_SLUG = Object.fromEntries(FEATURE_PAGES.map((f) => [f.slug, f]));

export function gatewayJsonLd(config, path = '/property-management') {
  const url = getPmSiteUrl(config, path);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: config.productName,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: config.productTagline,
      url,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Live build-and-pitch demo — contact for portfolio pricing',
      },
      provider: {
        '@id': `${url}#localbusiness`,
      },
    },
    localBusinessJsonLd(config, path),
  ];
}

export function featureJsonLd(config, feature, basePath) {
  const site = getPmSiteUrl(config);
  const path = `${basePath}/features/${feature.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${feature.title} | ${config.productName}`,
    description: feature.metaDescription,
    url: `${site}${path}`,
    isPartOf: {
      '@type': 'SoftwareApplication',
      name: config.productName,
      url: `${site}${basePath}`,
    },
  };
}
