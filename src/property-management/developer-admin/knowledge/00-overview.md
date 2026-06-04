# Macro REI Property Management — Developer Overview

**Product:** Macro REI (white-label name via `VITE_PM_PRODUCT_NAME`)  
**Mount path:** `/property-management` (override with `VITE_PM_BASE_PATH`)  
**Live URL:** https://macrorei.com/property-management  

## What this module is

Macro REI is an **AI operations layer** for multifamily property management. It does **not** replace your Property Management System (PMS). It sits on top of Yardi, RealPage, AppFolio, or Entrata and automates:

| Area | What it does today |
|------|-------------------|
| **Communications** | Keyword/RAG-style FAQ deflection over the knowledge base; sensitive topics always escalate to staff |
| **Leasing** | Pre-screen knockout rules (income, credit, pets) |
| **Maintenance** | Triage: category, priority, emergency detection, self-help deflection, status labels |
| **Residents** | CSV/Excel import (working); PMS sync (stub adapters) |
| **Owner portal** | NOI-style metrics and demo financials |

## Critical truth for developers (read first)

1. **"Dispatched" does not send anything yet.** It is a **status label** on a work order stored in the tenant data store. There is no SMS, email, Yardi write-back, or vendor API call when status becomes `dispatched`.
2. **Yardi (and other PMS) integrations are stubbed.** The setup wizard captures connection *intent* and stores non-secret metadata. Live sync requires implementing `integrations/adapters/pmsAdapter.js` and server-side Cloud Functions.
3. **Data today is browser `localStorage`** keyed `pm:{tenantId}:{collection}`. Firestore is documented and rules exist; the Firestore store implementation is the next infrastructure step.
4. **All AI logic is deterministic** in `lib/faqEngine.js`, `lib/maintenanceTriage.js`, `lib/prescreen.js`. Signatures are async and provider-agnostic so you can swap in OpenAI/Anthropic without changing page components.

## Where code lives (portable module)

Everything is under `src/property-management/**`. The host site (`src/main.jsx`) imports **only** `property-management/index.jsx`. No imports from the host into the module — copy the folder to migrate.

```
property-management/
  index.jsx              ← router + sidebar (only host touchpoint)
  config/appConfig.js    ← white-label env vars
  config/featureRegistry.js
  context/PmContext.jsx  ← tenant state + mutations
  data/store.js          ← localStorage (swappable for Firestore)
  integrations/          ← manifests + adapters
  lib/                   ← triage, FAQ, prescreen
  pages/                 ← user-facing screens
  developer-admin/       ← THIS knowledge base + tools (not customer-facing)
```

## Who should use Developer Admin

- Engineers implementing PMS sync, dispatch webhooks, or LLM backends
- DevOps setting `VITE_PM_*` per white-label deployment
- Product owners planning customization without forking the UI
