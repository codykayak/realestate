/**
 * Feature registry — the future-proofing layer.
 *
 * Every capability in the module is declared here as a feature. Per-tenant
 * customization works by toggling/configuring features in tenant settings,
 * so individual property managers can have different feature sets without
 * any code forks. Adding a brand-new feature later = add an entry here +
 * a page/component; the nav and settings render themselves from this list.
 *
 * `defaultEnabled` seeds new tenants. `tier` lets us gate features by plan
 * later. `config` holds per-feature tunables (also overridable per tenant).
 */

export const FEATURE_CATEGORIES = {
  CORE: 'Core',
  OWNER: 'Owner & Reporting',
  AUTOMATION: 'AI Automation',
  OPERATIONS: 'Operations',
  ADMIN: 'Administration',
};

export const FEATURES = [
  {
    id: 'dashboard',
    name: 'Operations Dashboard',
    description: 'ROI metrics: deflection rate, time saved, pipeline, open work orders.',
    category: FEATURE_CATEGORIES.CORE,
    icon: 'grid',
    route: 'dashboard',
    defaultEnabled: true,
    locked: true,
  },
  {
    id: 'owner',
    name: 'Owner Portal',
    description:
      'White-label owner dashboard: real-time NOI (MTD/YTD vs budget vs last year), cash-on-cash, portfolio drill-down, financial charts, AI Impact, one-click PDF owner reports, and Phase-2 analytics (benchmarking, forecasting, CapEx, what-if).',
    category: FEATURE_CATEGORIES.OWNER,
    icon: 'chart',
    route: 'owner',
    defaultEnabled: true,
  },
  {
    id: 'communications',
    name: 'AI Resident Communication',
    description:
      'Unified SMS + email inbox that auto-answers repetitive inquiries from the property knowledge base and escalates anything sensitive to staff.',
    category: FEATURE_CATEGORIES.AUTOMATION,
    icon: 'chat',
    route: 'communications',
    defaultEnabled: true,
    config: {
      autoPilot: true,
      confidenceThreshold: 0.6,
      afterHoursOnly: false,
    },
  },
  {
    id: 'leasing',
    name: 'Automated Leasing',
    description:
      'Lead-to-lease autopilot: instant response, pre-screening knockout rules, tour scheduling, and application audit.',
    category: FEATURE_CATEGORIES.AUTOMATION,
    icon: 'key',
    route: 'leasing',
    defaultEnabled: true,
    config: {
      incomeToRentMultiple: 3,
      minCreditScore: 620,
      petsAllowed: true,
      autoScreen: true,
    },
  },
  {
    id: 'maintenance',
    name: 'AI Maintenance Triage',
    description:
      'Triage tickets by category/urgency, detect emergencies, suggest resident self-help, and route to the right tech or vendor.',
    category: FEATURE_CATEGORIES.OPERATIONS,
    icon: 'wrench',
    route: 'maintenance',
    defaultEnabled: true,
    config: {
      selfHelpDeflection: true,
      emergencyAlerts: true,
    },
  },
  {
    id: 'residents',
    name: 'Residents & Units',
    description: 'Import residents/units from CSV, XLS, or XLSX (or a connected PMS) and manage the roster.',
    category: FEATURE_CATEGORIES.OPERATIONS,
    icon: 'users',
    route: 'residents',
    defaultEnabled: true,
  },
  {
    id: 'knowledge',
    name: 'Knowledge Base',
    description: 'Per-property source of truth that powers every AI answer (policies, amenities, fees, FAQs).',
    category: FEATURE_CATEGORIES.AUTOMATION,
    icon: 'book',
    route: 'knowledge',
    defaultEnabled: true,
  },
  {
    id: 'settings',
    name: 'Settings & Integrations',
    description: 'Connect your PMS, messaging, and screening providers via the setup wizard; manage branding and features.',
    category: FEATURE_CATEGORIES.ADMIN,
    icon: 'settings',
    route: 'settings',
    defaultEnabled: true,
    locked: true,
  },
];

/** Map for quick lookup by id. */
export const FEATURE_MAP = Object.fromEntries(FEATURES.map((f) => [f.id, f]));

/** Seed feature-flag state for a brand-new tenant. */
export function defaultFeatureState() {
  const state = {};
  for (const f of FEATURES) {
    state[f.id] = {
      enabled: f.defaultEnabled,
      config: { ...(f.config || {}) },
    };
  }
  return state;
}

/** Merge a tenant's saved feature state over the current registry defaults. */
export function resolveFeatures(savedState = {}) {
  return FEATURES.map((f) => {
    const saved = savedState[f.id] || {};
    return {
      ...f,
      enabled: f.locked ? true : saved.enabled ?? f.defaultEnabled,
      config: { ...(f.config || {}), ...(saved.config || {}) },
    };
  });
}
