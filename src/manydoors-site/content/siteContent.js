/** Marketing copy — aligned with property-management feature registry */

export const SITE = {
  name: 'ManyDoors AI',
  tagline: 'The AI operations layer for property managers',
  domain: 'manydoorsai.com',
  supportEmail: 'hello@manydoorsai.com',
  appPath: '/property-management',
};

export const FEATURES = [
  {
    id: 'communications',
    title: 'AI Resident Communication',
    description:
      'Unified SMS and email inbox that auto-answers repetitive inquiries from your property knowledge base — pool hours, rent due, packages — and escalates sensitive issues to staff.',
    icon: 'chat',
    gradient: 'from-teal-500/20 to-cyan-500/5',
  },
  {
    id: 'leasing',
    title: 'Automated Leasing',
    description:
      'Lead-to-lease autopilot: instant response, pre-screening knockout rules, tour scheduling, and application audit to cut vacancy days and block bad applications.',
    icon: 'key',
    gradient: 'from-violet-500/20 to-purple-500/5',
  },
  {
    id: 'maintenance',
    title: 'AI Maintenance Triage',
    description:
      'Classify every request by category and urgency, detect emergencies, suggest resident self-help, and route to your on-call tech — labeled EMERGENCY when it matters.',
    icon: 'wrench',
    gradient: 'from-amber-500/20 to-orange-500/5',
  },
  {
    id: 'dashboard',
    title: 'Operations Dashboard',
    description:
      'ROI metrics at a glance: AI deflection rate, staff time saved, leasing pipeline, and open work orders — the story your owners and ops team need.',
    icon: 'grid',
    gradient: 'from-emerald-500/20 to-green-500/5',
  },
  {
    id: 'owner',
    title: 'Owner Portal',
    description:
      'White-label owner dashboard with real-time NOI, cash-on-cash, portfolio drill-down, financial charts, and one-click PDF owner reports.',
    icon: 'chart',
    gradient: 'from-blue-500/20 to-indigo-500/5',
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    description:
      'Per-property source of truth that powers every AI answer — policies, amenities, fees, and FAQs — so residents get consistent, accurate responses.',
    icon: 'book',
    gradient: 'from-rose-500/20 to-pink-500/5',
  },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Onboard your portfolio',
    body: 'Add company info, phone numbers, spreadsheets, and on-call maintenance techs. We guide you through setup — no engineering team required.',
  },
  {
    step: '02',
    title: 'Connect your stack',
    body: 'Plug in your PMS, Twilio, screening providers, and messaging tools through our integration wizard. We help configure every connection.',
  },
  {
    step: '03',
    title: 'AI runs operations',
    body: 'Residents get instant answers, leads get screened, and maintenance emergencies route to your on-call tech — while your team focuses on high-value work.',
  },
  {
    step: '04',
    title: 'We stay with you',
    body: 'Dedicated support for onboarding, integrations, and ongoing optimization. ManyDoors AI is a partner, not a black-box vendor.',
  },
];

export const SUPPORT_PILLARS = [
  {
    title: 'White-glove onboarding',
    description: 'We walk you through every step — from importing your first spreadsheet to configuring emergency routing and knowledge base content.',
  },
  {
    title: 'Integration support',
    description: 'PMS, Twilio, SendGrid, screening APIs — our team helps you connect, test, and troubleshoot until everything works in production.',
  },
  {
    title: 'Always-on partnership',
    description: 'Questions after go-live? Need a new workflow? We are always here for support, training, and integration changes as you grow.',
  },
];

export const STATS = [
  { value: '24/7', label: 'Resident AI coverage' },
  { value: '3×', label: 'Faster lead response' },
  { value: '40%', label: 'Fewer routine tickets' },
  { value: '100%', label: 'Emergency routing clarity' },
];
