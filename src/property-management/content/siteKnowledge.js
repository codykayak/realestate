/**
 * Compiles all public site content into a single text corpus for the
 * Gemini site chatbot. Rebuilt into functions/data/pm-knowledge.txt at prebuild.
 */

import { FAQ_CATEGORIES, FAQ_INTRO } from './faqData.js';
import { FEATURE_PAGES, US_SUPPORT } from './gatewayContent.js';
import { LOCAL_BUSINESS } from './localBusiness.js';
import { LOCATIONS, LOCATIONS_INDEX } from './locationsData.js';

const PRODUCT_SUMMARY = `
ManyDoors AI (manydoorsai.com) is AI property management software for multifamily operators.
Live demo: https://www.macrorei.com/property-management
Tagline: AI-powered property operations — maintenance triage, leasing, and resident communications.
Support email: info@manydoorsai.com
Support phone: 541-321-2630
Headquarters: Eugene, OR (serving Oregon multifamily operators; expanding nationally).
U.S.-based support teams with continuous platform updates.
Five modules: AI Resident Communication, Automated Leasing, AI Maintenance Triage, Owner Portal & NOI, U.S. Support & Updates.
Target outcomes: 50-70% inquiry deflection, 15-25% maintenance truck-roll avoidance, 2+ vacancy-days saved per lease (illustrative), one-click owner PDF reports.
Integrations: Yardi, RealPage, AppFolio, Entrata, Twilio SMS, file import CSV/XLS/XLSX.
Compliance: Fair Housing escalation, TCPA SMS, FCRA screening path, tenant-isolated data.
`.trim();

function section(title, body) {
  return `\n## ${title}\n${body}\n`;
}

/** Build the full plaintext knowledge document for Gemini context. */
export function buildSiteKnowledgeText() {
  const parts = [PRODUCT_SUMMARY, section(FAQ_INTRO.title, FAQ_INTRO.subtitle)];

  for (const cat of FAQ_CATEGORIES) {
    parts.push(`\n## FAQ: ${cat.title}\n`);
    for (const { q, a } of cat.items) {
      parts.push(`Q: ${q}\nA: ${a}\n`);
    }
  }

  parts.push(section(US_SUPPORT.headline, `${US_SUPPORT.body}\n${US_SUPPORT.bullets.join('\n')}`));

  parts.push(section(LOCATIONS_INDEX.title, `${LOCATIONS_INDEX.intro}\nHQ: ${LOCAL_BUSINESS.addressDisplay}`));
  for (const loc of LOCATIONS) {
    parts.push(`### ${loc.name}, Oregon\n${loc.metaDescription}\n${loc.marketContext}\n`);
  }

  parts.push('\n## Feature pages\n');
  for (const f of FEATURE_PAGES) {
    parts.push(`### ${f.title}\n${f.tagline}\n${f.metaDescription}\n`);
    parts.push(`Time saved: ${f.savings.time}\nMoney impact: ${f.savings.money}\n`);
    for (const s of f.sections) {
      parts.push(`${s.heading}: ${s.body}\n`);
    }
    for (const m of f.metrics) {
      parts.push(`${m.label}: ${m.value} (${m.sub})\n`);
    }
  }

  return parts.join('\n').trim();
}

export const SITE_KNOWLEDGE_TEXT = buildSiteKnowledgeText();
