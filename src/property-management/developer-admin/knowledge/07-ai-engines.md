# AI Engines — Current Logic & LLM Migration

## Design pattern

All engines:

- Live in `lib/`
- Export async functions
- Accept `config` from feature registry
- Return structured objects (route, confidence, status, etc.)

Pages never call OpenAI directly.

---

## FAQ engine (`lib/faqEngine.js`)

**`answerInquiry({ text, knowledge, threshold })`**

1. `detectSensitive(text)` — if match → `route: 'human'` (mandatory compliance).
2. Tokenize inquiry; score each KB entry by keyword overlap + tags.
3. If confidence ≥ threshold → `route: 'auto'` with `answer` text.
4. Else → `route: 'human'`.

Sensitive intents: complaint, legal, discrimination, emergency, financial-hardship.

**LLM upgrade:** embed KB chunks; retrieve top-k; LLM answers only if no sensitive intent; log citations.

---

## Maintenance triage (`lib/maintenanceTriage.js`)

**`triageRequest(text, config)`**

Returns: `category`, `priority`, `isEmergency`, `selfHelp`, `recommendedStatus`, `routing`.

**LLM upgrade:** classify with structured JSON output; validate against allowlist categories; keep emergency regex as safety net.

---

## Pre-screen (`lib/prescreen.js`)

**`prescreenApplicant(applicant, config)`**

Knockout rules: income vs rent multiple, min credit, pets.

**Upgrade:** call TransUnion SmartMove when manifest connected.

---

## AI Impact metrics (`lib/aiImpact.js`)

Dashboard/Owner portal ROI estimates — uses live counts + assumed hourly rates. Not customer billing.

---

## Developer Admin AI assistant

Separate from production engines:

- Searches this knowledge base (keyword + optional OpenAI).
- Does not modify tenant data unless you use config generator copy-paste.
- API keys entered in session only (not committed to repo).
