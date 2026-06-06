# ManyDoors AI — Property Management Module

A **self-contained, white-label, multi-tenant** application for midsize
multifamily property management, mounted at **`/property-management`**.

It is an **AI operations layer** that sits *on top of* a property manager's
existing system of record (Yardi / RealPage / AppFolio / Entrata) rather than
replacing it. It automates the repetitive, text-based work that bottlenecks
understaffed teams:

- **AI Resident Communication** — unified SMS + email inbox that auto-answers
  repetitive inquiries from a property knowledge base and escalates anything
  sensitive (complaints, legal, Fair Housing, emergencies) to staff.
- **Automated Leasing** — lead-to-lease pipeline with configurable pre-screen
  knockout rules and an application-audit / fraud-screening surface.
- **AI Maintenance Triage** — classifies requests, detects emergencies, suggests
  resident self-help to deflect truck rolls, and routes to the right queue.
- **Residents & Units**, **Knowledge Base**, and **Settings/Integrations**.

## Design principles

### Compartmentalized & migratable
Everything lives under `src/property-management/**` and imports **nothing** from
the host site. The host references exactly one entry point
(`src/property-management/index.jsx`) via a lazy route. To migrate this into
another company's site (or its own repo), copy the folder, mount it at a route,
and change env values — no code changes.

### Multi-tenant & white-label
All data is namespaced by `tenantId`. Branding (name, logo, accent) and the
mounted base path come from `VITE_PM_*` env vars (see `.env.example`). Each
operator is its own tenant.

### Manifest-driven integrations ("check a box, paste your keys")
Each provider ships a **manifest** (`integrations/registry.js`) declaring its
fields/secrets. The **setup wizard renders itself** from those manifests, so
adding a provider later = add a manifest + a real adapter. PMS adapters share a
common interface (`integrations/adapters/pmsAdapter.js`); CSV/Excel import is a
fully working fallback (`integrations/adapters/fileImport.js`).

> **Security:** provider secrets are never persisted in the browser. The wizard
> is built to post secrets to a Cloud Function for encrypted storage (Secret
> Manager) with all real provider calls happening server-side. Only connection
> *status* is kept client-side.

### Future-proof feature registry
`config/featureRegistry.js` declares every capability as a feature with
per-tenant enable/config. Navigation and settings render from this list, so new
features are additive and individually toggetable per property manager.

### AI-ready, runs today
The FAQ deflection, pre-screen, and maintenance-triage logic
(`lib/*.js`) are deterministic and run client-side now, behind async,
provider-agnostic interfaces — swap in an LLM + retrieval later without touching
the UI.

## Data & persistence
Today the module runs on a tenant-scoped **localStorage** store
(`data/store.js`) so it works instantly with no setup, seeded with demo data
(`data/seed.js`). When a **separate** Firebase project is configured via
`VITE_PM_FIREBASE_*`, a Firestore-backed store can be dropped in behind the same
API. The PM Firebase app is initialized as a **named app** (`pm`) so it never
collides with the host site's Firebase.

## Folder map
```
property-management/
  index.jsx                 # entry point + router + sidebar (host imports only this)
  config/                   # appConfig (white-label) + featureRegistry (future-proof)
  context/PmContext.jsx     # tenant + store + features + collections
  data/                     # store (localStorage now) + seed
  firebase/pmFirebase.js    # isolated, separate Firebase project
  integrations/             # manifest registry + adapters (CSV/Excel real, PMS stubs)
  lib/                      # faqEngine, prescreen, maintenanceTriage (AI-ready)
  components/               # Icon, Page, SetupWizard
  pages/                    # Dashboard, Communications, Leasing, Maintenance,
                            #   Residents, KnowledgeBase, Settings
  pm.module.css             # scoped styles
```
