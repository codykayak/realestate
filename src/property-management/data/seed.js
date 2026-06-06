/**
 * Demo tenant seed data. Loaded once into the local store so the build-and-pitch
 * experience has realistic content (residents, conversations, leasing leads,
 * work orders, and a property knowledge base) without any setup.
 */

import { genId } from './store';
import { defaultFeatureState } from '../config/featureRegistry';

export const DEMO_TENANT = {
  id: 'demo',
  name: 'Maple Grove Residential',
  properties: [
    { id: 'p1', name: 'Maple Grove Apartments', units: 184, city: 'Eugene', state: 'OR' },
    { id: 'p2', name: 'Riverbend Commons', units: 96, city: 'Springfield', state: 'OR' },
  ],
  branding: { accent: '#f5a623' },
};

export function seedSettings() {
  return {
    tenant: DEMO_TENANT,
    features: defaultFeatureState(),
    onboardingComplete: false,
    companyProfile: null,
  };
}

export function seedKnowledge() {
  const k = (question, answer, tags) => ({
    id: genId('kb'),
    question,
    answer,
    tags,
    createdAt: Date.now(),
  });
  return [
    k('When is rent due?', 'Rent is due on the 1st of each month and is considered late after the 5th. A late fee of $50 applies after the grace period.', ['rent', 'due', 'late', 'payment']),
    k('How do I pay rent?', 'You can pay rent online through the resident portal, by check at the leasing office, or via auto-pay. Online payments post same-day.', ['rent', 'pay', 'portal', 'payment', 'autopay']),
    k('What are the pool hours?', 'The pool is open daily from 8:00 AM to 10:00 PM, Memorial Day through Labor Day. Children under 14 must be accompanied by an adult.', ['pool', 'amenity', 'hours']),
    k('What is the pet policy?', 'We are pet-friendly! Up to 2 pets per home, 50 lb limit each. There is a $300 pet deposit and $35/month pet rent. Breed restrictions apply.', ['pet', 'dog', 'cat', 'policy', 'deposit']),
    k('How do I submit a maintenance request?', 'Reply here describing the issue (a photo helps!) and we will create a work order automatically, or submit through the resident portal. Emergencies are handled 24/7.', ['maintenance', 'repair', 'work order', 'request']),
    k('Where do I pick up packages?', 'Packages are held in the parcel room next to the leasing office. You will get a text with a pickup code when a package arrives. The room is accessible 6 AM–10 PM.', ['package', 'mail', 'parcel', 'delivery']),
    k('What are the office hours?', 'The leasing office is open Monday–Friday 9 AM–6 PM and Saturday 10 AM–4 PM. After hours, this assistant can help or escalate emergencies.', ['office', 'hours', 'leasing']),
    k('How do I renew my lease?', 'Renewal offers are sent 90 days before your lease ends. Let us know you are interested and we will send your renewal terms to e-sign.', ['lease', 'renew', 'renewal']),
    k('Is parking included?', 'One assigned surface spot is included per unit. Covered parking and garages are available for an additional monthly fee, subject to availability.', ['parking', 'garage', 'spot']),
    k('What utilities are included?', 'Water, sewer, and trash are billed monthly via utility allocation. Electricity and gas are set up by the resident directly with the provider.', ['utilities', 'water', 'electric', 'trash']),
  ];
}

export function seedResidents() {
  const r = (name, unit, property, phone, email, balance, leaseEnd) => ({
    id: genId('res'),
    name, unit, property, phone, email,
    balance, leaseEnd,
    createdAt: Date.now(),
  });
  return [
    r('Jordan Avery', '112', 'Maple Grove Apartments', '(541) 555-0142', 'jordan.a@example.com', 0, '2026-09-30'),
    r('Priya Natarajan', '208', 'Maple Grove Apartments', '(541) 555-0177', 'priya.n@example.com', 1450, '2026-07-31'),
    r('Marcus Lee', '34', 'Riverbend Commons', '(541) 555-0190', 'marcus.l@example.com', 0, '2026-12-31'),
    r('Sofia Reyes', '156', 'Maple Grove Apartments', '(541) 555-0118', 'sofia.r@example.com', 75, '2027-01-31'),
  ];
}

export function seedConversations() {
  const now = Date.now();
  const conv = (resident, channel, messages, status) => ({
    id: genId('conv'),
    resident,
    channel,
    status,
    messages,
    createdAt: now,
    updatedAt: now,
  });
  return [
    conv('Jordan Avery', 'sms', [
      { from: 'resident', text: 'what time does the pool close?', at: now - 1000 * 60 * 60 },
      { from: 'ai', text: 'The pool is open daily 8:00 AM–10:00 PM (Memorial Day–Labor Day). Enjoy! 🏊', at: now - 1000 * 60 * 60 + 4000, confidence: 0.94 },
    ], 'auto-resolved'),
    conv('Priya Natarajan', 'email', [
      { from: 'resident', text: 'I think my upstairs neighbor is being really loud at night and I want to file a formal complaint.', at: now - 1000 * 60 * 30 },
    ], 'needs-human'),
    conv('Marcus Lee', 'sms', [
      { from: 'resident', text: 'how do I set up autopay for rent', at: now - 1000 * 60 * 10 },
      { from: 'ai', text: 'You can enable auto-pay in the resident portal under Payments → Auto-Pay. Online payments post same-day. Want the portal link?', at: now - 1000 * 60 * 10 + 3000, confidence: 0.88 },
    ], 'auto-resolved'),
  ];
}

export function seedLeasingLeads() {
  const lead = (name, unitType, income, credit, moveIn, stage, pets) => ({
    id: genId('lead'),
    name, unitType, income, credit, moveIn, stage, pets,
    createdAt: Date.now(),
  });
  return [
    lead('Taylor Brooks', '1BR', 5200, 712, '2026-07-01', 'new', false),
    lead('Devon Carter', '2BR', 6800, 668, '2026-07-15', 'prescreen', true),
    lead('Alex Morgan', 'Studio', 2100, 640, '2026-06-20', 'prescreen', false),
    lead('Riley Quinn', '2BR', 7400, 745, '2026-08-01', 'tour', false),
  ];
}

export function seedWorkOrders() {
  const wo = (resident, unit, issue, category, priority, status) => ({
    id: genId('wo'),
    resident, unit, issue, category, priority, status,
    createdAt: Date.now(),
  });
  return [
    wo('Sofia Reyes', '156', 'Kitchen sink is leaking under the cabinet', 'Plumbing', 'normal', 'open'),
    wo('Jordan Avery', '112', 'No heat coming from the unit, it is 58 degrees inside', 'HVAC', 'emergency', 'dispatched'),
    wo('Marcus Lee', '34', 'Garbage disposal stopped working, makes a humming sound', 'Appliance', 'low', 'self-help-sent'),
  ];
}
