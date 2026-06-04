# Customization Roadmap — Adding Value & Future-Proofing

## Tier 1 — No code (ops)

- [ ] Set `VITE_PM_*` branding per client deployment
- [ ] Populate knowledge base with property-specific FAQs
- [ ] Tune feature toggles per tenant in Settings
- [ ] Import residents via CSV until PMS live

## Tier 2 — Configuration (small code)

- [ ] Per-tenant `maintenanceRules` JSON in Firestore settings
- [ ] `dispatch` config object + Cloud Function notifications
- [ ] Lower/raise FAQ `confidenceThreshold` per property
- [ ] Custom pre-screen multiples per asset class

## Tier 3 — Integrations (medium)

- [ ] Yardi adapter + scheduled resident sync
- [ ] Work order write-back on `dispatched`
- [ ] Twilio inbound → auto `answerInquiry` → conversation thread
- [ ] SendGrid for email channel

## Tier 4 — Platform (large)

- [ ] Multi-tenant auth + member roles (rules exist)
- [ ] Runtime branding from Storage
- [ ] Staytus / vendor marketplace sync
- [ ] LLM with audit log and human-in-the-loop for all auto-sends
- [ ] Webhook egress: `POST /tenant/hooks/workorder.created` for client automation

## Programming "where items go" — decision matrix

| Event | Recommended destination | Config location |
|-------|-------------------------|-----------------|
| Emergency maintenance | SMS on-call + Yardi WO + email PM | `maintenance.config.dispatch` |
| Normal maintenance | Category queue email / internal board | `dispatch.queues[category]` |
| Low confidence FAQ | Staff inbox (Communications) | `communications.config` |
| Sensitive FAQ | Staff only, no AI send | `faqEngine` (hardcoded — do not disable) |
| Pre-screen fail | Leasing stage `rejected` + optional email | `leasing.config` |
| Pre-screen pass | Stage `tour` + calendar link | `leasing.config` |
| New leasing lead | CRM webhook / email leasing@ | new integration manifest |
| CSV import row | `residents` upsert | file import only |

## Avoid forks

Use feature registry + tenant config + server adapters instead of copying `pages/`. The module was built to lift-and-drop.

## Compliance notes

- Fair Housing: never auto-respond to discrimination-related inquiries.
- Emergencies: always allow human override; log escalation timestamps.
- SMS: TCPA consent tracking when Twilio goes live (not in demo store).
