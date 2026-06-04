/**
 * Integration registry — the heart of the "check a box, paste your keys" setup.
 *
 * Each integration ships a MANIFEST describing what it is and which fields/
 * secrets it needs. The setup wizard renders itself entirely from these
 * manifests, so adding a new provider later means adding one manifest (+ a
 * real adapter when ready) — no wizard UI changes required.
 *
 * SECURITY: secret fields are NEVER persisted in the browser/local store.
 * In production the wizard posts secrets to a Cloud Function which stores them
 * encrypted (Secret Manager) per tenant, and all real provider calls happen
 * server-side. Here, "Connected" status is tracked but secrets are discarded.
 */

export const CATEGORY = {
  pms: 'Property Management System',
  sms: 'Text Messaging',
  email: 'Email',
  screening: 'Tenant Screening',
  import: 'Data Import',
};

const f = (key, label, type, opts = {}) => ({ key, label, type, ...opts });

export const MANIFESTS = [
  // ── Property Management Systems ──────────────────────────────────────────
  {
    id: 'yardi',
    category: 'pms',
    name: 'Yardi Voyager',
    blurb: 'Sync residents, units, leases, and balances; write work orders back.',
    status: 'stub',
    capabilities: ['residents.read', 'leases.read', 'workorders.write'],
    fields: [
      f('serverUrl', 'Voyager Server URL', 'url', { required: true, placeholder: 'https://www.yardiasp.com/...' }),
      f('database', 'Database', 'text', { required: true }),
      f('username', 'API Username', 'text', { required: true }),
      f('password', 'API Password', 'secret', { required: true }),
      f('platform', 'Interface Platform', 'text', { placeholder: 'SQL Server / Voyager 7S' }),
    ],
  },
  {
    id: 'realpage',
    category: 'pms',
    name: 'RealPage',
    blurb: 'Connect RealPage to sync property, unit, and resident data.',
    status: 'stub',
    capabilities: ['residents.read', 'leases.read'],
    fields: [
      f('pmcId', 'PMC ID', 'text', { required: true }),
      f('siteId', 'Site ID', 'text', { required: true }),
      f('apiKey', 'API Key', 'secret', { required: true }),
    ],
  },
  {
    id: 'appfolio',
    category: 'pms',
    name: 'AppFolio',
    blurb: 'Pull residents, units, and work orders from AppFolio.',
    status: 'stub',
    capabilities: ['residents.read', 'workorders.write'],
    fields: [
      f('databaseName', 'Database Name', 'text', { required: true, placeholder: 'yourco' }),
      f('clientId', 'Client ID', 'text', { required: true }),
      f('clientSecret', 'Client Secret', 'secret', { required: true }),
    ],
  },
  {
    id: 'entrata',
    category: 'pms',
    name: 'Entrata',
    blurb: 'Integrate Entrata for residents, leases, and maintenance.',
    status: 'stub',
    capabilities: ['residents.read', 'leases.read', 'workorders.write'],
    fields: [
      f('domain', 'Entrata Domain', 'url', { required: true, placeholder: 'https://yourco.entrata.com' }),
      f('username', 'API Username', 'text', { required: true }),
      f('password', 'API Password', 'secret', { required: true }),
    ],
  },

  // ── Messaging ────────────────────────────────────────────────────────────
  {
    id: 'twilio',
    category: 'sms',
    name: 'Twilio SMS',
    blurb: 'Send/receive resident texts and power AI auto-responses over SMS.',
    status: 'available',
    capabilities: ['sms.send', 'sms.receive'],
    fields: [
      f('accountSid', 'Account SID', 'text', { required: true, placeholder: 'AC…' }),
      f('authToken', 'Auth Token', 'secret', { required: true }),
      f('fromNumber', 'From Number', 'tel', { required: true, placeholder: '+1…' }),
    ],
  },
  {
    id: 'sendgrid',
    category: 'email',
    name: 'SendGrid Email',
    blurb: 'Send/receive resident email and power AI auto-responses over email.',
    status: 'stub',
    capabilities: ['email.send'],
    fields: [
      f('apiKey', 'API Key', 'secret', { required: true }),
      f('fromEmail', 'From Email', 'email', { required: true }),
      f('fromName', 'From Name', 'text', {}),
    ],
  },

  // ── Screening ──────────────────────────────────────────────────────────────
  {
    id: 'smartmove',
    category: 'screening',
    name: 'TransUnion SmartMove',
    blurb: 'Credit, criminal, and eviction screening for leasing pre-qualification.',
    status: 'stub',
    capabilities: ['screening.run'],
    fields: [
      f('clientId', 'Client ID', 'text', { required: true }),
      f('apiKey', 'API Key', 'secret', { required: true }),
    ],
  },

  // ── Import fallback (always works) ──────────────────────────────────────────
  {
    id: 'fileimport',
    category: 'import',
    name: 'CSV / Excel Import',
    blurb: 'No PMS yet? Import residents and units from CSV, XLS, or XLSX. Always available.',
    status: 'available',
    capabilities: ['residents.read'],
    fields: [],
    noCredentials: true,
  },
];

export const MANIFEST_MAP = Object.fromEntries(MANIFESTS.map((m) => [m.id, m]));

export function manifestsByCategory() {
  const groups = {};
  for (const m of MANIFESTS) {
    (groups[m.category] ||= []).push(m);
  }
  return groups;
}
