/**
 * Comprehensive FAQ for ManyDoors AI — single source for the FAQ page
 * and the Gemini site chatbot knowledge corpus.
 */

export const FAQ_INTRO = {
  title: 'Frequently Asked Questions',
  subtitle:
    'Everything operators, owners, and investors ask about ManyDoors AI — from pilot rollout to ROI, integrations, compliance, and U.S. support.',
};

export const FAQ_CATEGORIES = [
  {
    id: 'overview',
    title: 'Product overview',
    items: [
      {
        q: 'What is ManyDoors AI?',
        a: 'ManyDoors AI is an AI operations layer for multifamily property management. It sits on top of the property management system (PMS) you already use and automates resident communication, leasing workflows, and maintenance triage — with owner-grade NOI reporting built in.',
      },
      {
        q: 'Who is ManyDoors AI built for?',
        a: 'Regional operators, third-party managers, and owner-operators running midsize to enterprise multifamily portfolios. It is designed for teams that want to protect NOI, reduce staff overtime, and prove ROI to owners without replacing their core PMS.',
      },
      {
        q: 'Does ManyDoors AI replace my PMS?',
        a: 'No. ManyDoors is a connective AI layer — not a ledger replacement. Your PMS remains the system of record for rent roll, GL, and work orders. ManyDoors reads (and eventually writes back) operational data while handling high-volume resident and prospect interactions.',
      },
      {
        q: 'What makes ManyDoors different from generic ChatGPT?',
        a: 'Every answer is grounded in your per-property knowledge base and optional live PMS data — not the open internet. Sensitive topics (Fair Housing, legal, emergencies) always escalate to staff. Human-in-the-loop controls let your team approve, edit, or override every AI action.',
      },
      {
        q: 'Is there a live demo?',
        a: 'Yes. Visit macrorei.com/property-management and click Enter platform to explore the full build-and-pitch demo on local sample data — dashboard, communications, leasing, maintenance, owner portal, and knowledge base.',
      },
      {
        q: 'What is the relationship between ManyDoors AI and MacroREI?',
        a: 'The live demo is hosted on macrorei.com while manydoorsai.com is the product brand. Production deployments are white-labeled per operator with isolated Firebase tenants.',
      },
    ],
  },
  {
    id: 'communications',
    title: 'AI resident communication',
    items: [
      {
        q: 'What channels does resident communication support?',
        a: 'Unified SMS and email inbox in one console. Twilio integration powers outbound and inbound SMS with TCPA-compliant opt-in, STOP/HELP handling, and 10DLC A2P registration paths.',
      },
      {
        q: 'What percentage of inquiries can AI deflect?',
        a: 'Target 50–70% deflection on FAQ-style volume (rent due dates, amenity hours, pet policy, package instructions, pool rules). Pilot metrics replace illustrative models after 30–60 days.',
      },
      {
        q: 'How does after-hours coverage work?',
        a: 'AI responds 24/7 from your property knowledge base at zero marginal cost per message — replacing answering services and overtime premiums for routine questions.',
      },
      {
        q: 'When does the AI escalate to a human?',
        a: 'Always for Fair Housing complaints, legal threats, eviction discussions, discrimination concerns, financial hardship, and emergencies (fire, flood, gas, no heat, lockouts). Low-confidence matches also route to staff.',
      },
      {
        q: 'Can residents get live balance and lease information?',
        a: 'When integrated with your PMS, answers can include current balance, lease end date, and work-order status. Without integration, the knowledge base handles policy and static FAQs.',
      },
      {
        q: 'How is the property knowledge base maintained?',
        a: 'Per-property FAQs, policies, fees, and amenities live in the Knowledge Base module. Staff edit entries; AI uses them for every deflected answer. The knowledge base is the moat — it improves with every curated answer.',
      },
    ],
  },
  {
    id: 'leasing',
    title: 'Automated leasing',
    items: [
      {
        q: 'How does speed-to-lead work?',
        a: 'ManyDoors instant-replies to ILS and website leads — target under five minutes. Industry data shows faster response materially improves tour conversion versus multi-hour delays.',
      },
      {
        q: 'What is automated pre-screening?',
        a: 'Knockout rules check income-to-rent ratio, pets, move-in date, and jurisdiction-specific criteria before a human reviews the file. Configurable thresholds per property.',
      },
      {
        q: 'Does ManyDoors detect application fraud?',
        a: 'The application audit path cross-checks pay stubs, flags document tampering, and surfaces identity mismatches. Fraud prevention is illustrative in ROI models — typically $450+ per avoided bad tenancy per property annually.',
      },
      {
        q: 'Which screening providers integrate?',
        a: 'Roadmap includes SmartMove, Experian-class providers, and adverse-action workflows compliant with FCRA. Demo runs on local data until screening keys are connected in Settings.',
      },
      {
        q: 'How much vacancy time can automation save?',
        a: 'Illustrative model: ~2+ vacancy-days saved per lease from faster response and pre-screen throughput. Replace with your pilot data after the first 30–60 days.',
      },
      {
        q: 'Can AI schedule tours?',
        a: 'Yes — leads are qualified and tour times proposed based on your rules. Staff can override from the leasing pipeline kanban at any time.',
      },
    ],
  },
  {
    id: 'maintenance',
    title: 'AI maintenance triage',
    items: [
      {
        q: 'How are work orders triaged?',
        a: 'Free-text (and photos when vision is enabled) are classified by category and priority. Emergencies are detected by keyword patterns: gas, flood, no heat, lockout, smoke, sewage, and similar.',
      },
      {
        q: 'What is self-help deflection?',
        a: 'Guided steps for fixable issues — GFCI reset, disposal jam, thermostat settings — before dispatching a tech. Target 15–25% of truck rolls avoidable via self-help.',
      },
      {
        q: 'How does on-call technician routing work?',
        a: 'Configure your technician roster with on-call designation. Emergency tickets route immediately to the on-call tech with escalation paths. Demo includes a configurable on-call dropdown in Developer Admin.',
      },
      {
        q: 'Does ManyDoors write work orders back to the PMS?',
        a: 'Read sync is available in pilot; full write-back to Yardi, RealPage, AppFolio, and Entrata is on the enterprise roadmap. Status loops to residents are supported in the demo console.',
      },
      {
        q: 'How much does each avoided truck roll save?',
        a: 'Illustrative model uses ~$145 per avoided truck roll. Actual savings depend on market labor rates and vendor contracts.',
      },
    ],
  },
  {
    id: 'owner',
    title: 'Owner portal & NOI reporting',
    items: [
      {
        q: 'What does the owner portal show?',
        a: 'Real-time NOI MTD/YTD vs budget vs prior year, operating margin, cash-on-cash, property-level drill-down, financial charts, and itemized AI impact lines.',
      },
      {
        q: 'Can I generate PDF owner reports?',
        a: 'Yes — one-click PDF packages for investor updates. Reports include NOI variance, AI savings drivers, and portfolio roll-ups.',
      },
      {
        q: 'Is the owner portal white-label?',
        a: 'Yes. Per-owner branding and custom domains are supported in enterprise deployments. Demo uses ManyDoors branding.',
      },
      {
        q: 'Where does financial data come from?',
        a: 'Demo uses simulated ledger data. Production connects to your PMS for live NOI. Budget and prior-year comparisons sync from your chart of accounts mapping.',
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations & PMS',
    items: [
      {
        q: 'Which PMS platforms are supported?',
        a: 'Manifest-driven adapters for Yardi Voyager, RealPage, AppFolio, Entrata, and file import (CSV/XLS/XLSX). New connectors ship continuously — U.S. support teams assist with mapping.',
      },
      {
        q: 'Do I need Twilio?',
        a: 'Twilio powers SMS in production. The demo runs without Twilio keys; connect in Settings → Integrations when ready for live messaging.',
      },
      {
        q: 'Is ManyDoors PMS-agnostic?',
        a: 'Yes — designed for portfolios with mixed PMS systems after acquisitions. One AI layer across properties even when ledgers differ.',
      },
      {
        q: 'How long does integration take?',
        a: 'Pilot: one property or cluster in 30–60 days with comms deflection and knowledge base. Portfolio roll-out adds leasing, maintenance, and PMS read sync. Enterprise adds write-back and SSO.',
      },
      {
        q: 'Can I import residents from a spreadsheet?',
        a: 'Yes — Residents & Units module accepts CSV, XLS, and XLSX import without a connected PMS.',
      },
    ],
  },
  {
    id: 'roi',
    title: 'ROI & pricing',
    items: [
      {
        q: 'What ROI should I expect?',
        a: 'Illustrative model for a 2,800-unit portfolio shows six-figure annual impact from inquiry deflection, maintenance self-help, faster lease-up, pre-screen automation, after-hours coverage, and fraud prevention. Run your own pilot to replace estimates.',
      },
      {
        q: 'How is ROI calculated on the gateway page?',
        a: 'Research-backed benchmarks: ~58% deflection on inquiries, ~18% maintenance deflection, ~2.2 vacancy-days saved per turn, loaded labor rates, and truck-roll costs. All labeled illustrative until pilot data is available.',
      },
      {
        q: 'What is the per-unit economics?',
        a: 'Demo model shows monthly AI impact per unit and FTE equivalent hours reclaimed — visible on the gateway KPI strip after you enter portfolio size.',
      },
      {
        q: 'How is ManyDoors priced?',
        a: 'Portfolio pricing based on unit count and modules enabled. Contact hello@manydoorsai.com for a quote. The live demo is free to explore.',
      },
      {
        q: 'Is there a pilot program?',
        a: 'Yes — start with one property or cluster for 30–60 days. Baseline deflection %, response time, and maintenance metrics before portfolio roll-out.',
      },
    ],
  },
  {
    id: 'support',
    title: 'U.S. support & updates',
    items: [
      {
        q: 'Where is ManyDoors AI supported from?',
        a: 'United States — dedicated onboarding specialists, live chat during business hours, and on-call escalation for production issues. Not an offshore ticket queue.',
      },
      {
        q: 'How often is the platform updated?',
        a: 'Continuously — new AI models, PMS connectors, and compliance patches ship regularly without annual release cycles.',
      },
      {
        q: 'Who helps tune our knowledge base?',
        a: 'U.S. support works with your onsite team during pilot and roll-out to import policies, amenities, fees, and FAQs into the per-property knowledge base.',
      },
      {
        q: 'Is enterprise SLA available?',
        a: 'Yes — SLA-backed response for large portfolios is on the enterprise roadmap. Discuss during sales conversations.',
      },
      {
        q: 'How do I get help during the demo?',
        a: 'Use the site chat assistant (powered by Gemini) for questions about the product, or email hello@manydoorsai.com. Full contact details in the footer are being updated.',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Security & compliance',
    items: [
      {
        q: 'How does ManyDoors handle Fair Housing?',
        a: 'AI never steers by protected class. Sensitive intents auto-escalate. Audit log of every automated decision. Human handoff for complaints and accommodation requests.',
      },
      {
        q: 'What about TCPA and SMS compliance?',
        a: 'Opt-in, STOP/HELP, 10DLC A2P registration, and per-resident consent tracking. Templates include required language.',
      },
      {
        q: 'How does screening compliance work?',
        a: 'FCRA adverse-action workflows when screening integrations are enabled. Disclosures per jurisdiction.',
      },
      {
        q: 'Is data isolated per operator?',
        a: 'Yes — tenant-isolated Firestore data, secrets server-side only, Firestore security rules. SOC 2 path for enterprise.',
      },
      {
        q: 'Where is demo data stored?',
        a: 'Local to your browser (localStorage) until you connect a Firebase project. Production uses a separate Firebase project from the host site.',
      },
    ],
  },
  {
    id: 'implementation',
    title: 'Implementation & onboarding',
    items: [
      {
        q: 'What does onboarding look like?',
        a: 'In-app wizard: connect PMS, Twilio, screening providers, upload knowledge base, assign on-call maintenance tech, and enable feature flags per property.',
      },
      {
        q: 'Can I enable modules gradually?',
        a: 'Yes — feature registry lets you toggle communications, leasing, maintenance, owner portal, and more per tenant without code changes.',
      },
      {
        q: 'What is the phased roll-out plan?',
        a: 'Phase 1 pilot: comms + knowledge base. Phase 2 portfolio: leasing autopilot, maintenance triage, PMS read. Phase 3 enterprise: write-back, fraud audit at scale, SSO, custom branding.',
      },
      {
        q: 'Do I need Firebase?',
        a: 'Not for the demo. Multi-user production requires a dedicated Firebase project (see FIREBASE_SETUP.md in the module).',
      },
      {
        q: 'Can multiple properties share one knowledge base?',
        a: 'Knowledge is per-property — each asset can have distinct policies, fees, and amenities. Portfolio templates speed duplication.',
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical & demo',
    items: [
      {
        q: 'What URL is the demo on?',
        a: 'https://www.macrorei.com/property-management — gateway home with Enter platform into the operations app.',
      },
      {
        q: 'What are the feature detail page URLs?',
        a: '/property-management/features/communications, /leasing, /maintenance, /owner-portal, and /us-support — each explains time/money savings and U.S. support.',
      },
      {
        q: 'What is Developer Admin?',
        a: 'Internal engineering tools: pitch deck, ROI calculator, competitor matrix, compliance checklist, and maintenance on-call configuration. Enabled by default in demo; set VITE_PM_DEV_ADMIN=false to hide.',
      },
      {
        q: 'Can I white-label the module?',
        a: 'Yes — VITE_PM_PRODUCT_NAME, VITE_PM_LOGO, VITE_PM_ACCENT, and related env vars rebrand the entire module without code forks.',
      },
      {
        q: 'What stack is ManyDoors built on?',
        a: 'React 19, Vite, Firebase (optional), Twilio SMS, and Gemini for the marketing site chatbot. PMS adapters use manifest-driven integration registry.',
      },
      {
        q: 'How does the site chatbot work?',
        a: 'The floating assistant sends your question to a Gemini-powered API backed by the full site knowledge corpus (this FAQ, feature pages, product modules, and ROI models). It answers only from that content.',
      },
    ],
  },
  {
    id: 'compare',
    title: 'Competitive positioning',
    items: [
      {
        q: 'How does ManyDoors compare to EliseAI?',
        a: 'EliseAI focuses on leasing + resident AI at enterprise scale. ManyDoors adds maintenance triage, fraud audit, and mid-market packaging with PMS-agnostic deployment.',
      },
      {
        q: 'How does ManyDoors compare to Knock, Funnel, or LeaseHawk?',
        a: 'Those tools excel at leasing CRM. ManyDoors unifies comms, leasing, and maintenance operations in one AI layer with owner NOI reporting.',
      },
      {
        q: 'What about AppFolio Realm-X or Yardi chat add-ons?',
        a: 'PMS-native AI is convenient but locks you to one vendor. ManyDoors works across mixed portfolios — ideal after acquisitions.',
      },
      {
        q: 'How does ManyDoors compare to Colleen AI?',
        a: 'Colleen focuses on collections and AR. ManyDoors covers full lead-to-lease and maintenance operations plus owner reporting.',
      },
    ],
  },
];

/** Flat list for search and JSON-LD */
export function allFaqItems() {
  return FAQ_CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, category: cat.title, categoryId: cat.id })),
  );
}

export const FAQ_COUNT = allFaqItems().length;
