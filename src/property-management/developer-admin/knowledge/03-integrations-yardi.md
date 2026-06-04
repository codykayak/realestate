# PMS Integrations — Yardi, RealPage, AppFolio, Entrata

## Current state (important)

All four PMS providers in `integrations/registry.js` have **`status: 'stub'`**. Connecting them in the UI runs `createStubAdapter()` which:

- `testConnection()` → returns `ok: false` with message that credentials are captured pending approval
- `getResidents`, `getLeases`, `createWorkOrder` → throw "integration is not active yet"

**CSV/Excel import** (`fileimport`) is the only **fully working** data path for residents/units.

---

## What happens when a user "connects" Yardi today

1. User opens **Settings → Integrations → Yardi Voyager → Connect**.
2. `SetupWizard` collects: Server URL, Database, API Username, Password, Platform.
3. User clicks **Test & connect**.
4. `getAdapter(manifest)` returns stub adapter; `testConnection()` runs.
5. **Secrets are discarded** after test (by design). Only connection metadata is saved to `integrations.yardi`:
   - `status`: `connected` or `pending`
   - `message`, `configuredFields` (non-secret keys only)
6. **No sync job runs.** No residents appear. No work orders export.

---

## What Yardi integration is *designed* to sync

From the Yardi manifest `capabilities`:

| Capability | Direction | Data entities (planned) |
|------------|-----------|-------------------------|
| `residents.read` | Yardi → Macro REI | Residents, units, lease holders, contact info |
| `leases.read` | Yardi → Macro REI | Lease start/end, rent, balances |
| `workorders.write` | Macro REI → Yardi | Maintenance requests created or dispatched in Macro REI |

### Typical Yardi Voyager interface flow (production)

1. **Credentials** stored in Secret Manager / `tenants/{tenantId}/secrets/yardi` (Admin SDK only — see `firestore.pm.rules`).
2. **Cloud Function** `syncYardiResidents` scheduled or on-demand:
   - Calls Yardi Resident/Lease APIs (Interface plugin depends on client contract).
   - Upserts into `tenants/{tenantId}/residents`.
3. **Cloud Function** `pushWorkOrderToYardi` on Firestore `workOrders` create/update when `status === 'dispatched'` or staff clicks "Push to PMS":
   - Maps Macro REI fields → Yardi service request XML/JSON.
   - Saves `externalId`, `externalSystem: 'yardi'`.

### Field mapping (implement in adapter)

| Macro REI `residents` | Yardi source (varies by interface) |
|---------------------|--------------------------------------|
| `name` | Tenant name / primary resident |
| `unit` | Unit code |
| `property` | Property code |
| `phone`, `email` | Contact fields |
| `balance` | AR balance |
| `leaseEnd` | Lease end date |
| `rent` | Current rent |

Unmapped columns from CSV import land in `_raw` — same pattern for Yardi extras.

### Work order mapping (Macro REI → Yardi)

| Macro REI | Yardi (typical) |
|---------|-----------------|
| `unit` | Unit |
| `issue` | Problem description |
| `category` | Category / trade |
| `priority` | Priority code |
| `resident` | Requestor name |
| `id` | External reference in notes |

---

## RealPage, AppFolio, Entrata

Same adapter interface (`pmsAdapter.js`). Each manifest lists its credential fields and capabilities. Implementation steps:

1. Add `createYardiAdapter(manifest, secrets)` (etc.) in `integrations/adapters/`.
2. Switch `getAdapter()` on `manifest.id`.
3. Add Cloud Functions for sync + write-back.
4. Change manifest `status` from `stub` to `available` when sandbox-tested.

---

## File import (works now)

`integrations/adapters/fileImport.js`:

- Accepts `.csv`, `.xls`, `.xlsx`
- Flexible header aliases (`name`, `unit`, `property`, …)
- Used from **Residents** page
- Replaces or merges roster via `replaceResidents` / `upsertResident`

**When PMS is connected later:** run initial full sync, then periodic delta sync; keep file import as override for one-off corrections.

---

## Security checklist

- [ ] Never store API passwords in localStorage or client-readable Firestore
- [ ] All provider HTTP calls from Cloud Functions with service account
- [ ] Rotate credentials via Settings UI → CF updates Secret Manager
- [ ] Log sync errors per tenant; surface status in Settings integration card

---

## Twilio (host site vs PM module)

The **host** Firebase project has working Twilio Cloud Functions (`functions/index.js`) for the Map/leads dialer.

The **PM module** Twilio manifest is separate — wiring PM Twilio should either:

- Reuse patterns from `sendSmsCore.js` in new PM-specific functions, or
- Share one Twilio account with per-tenant subaccounts

Resident SMS in Communications is simulated in the demo; production connects inbound webhooks → `conversations` collection → `answerInquiry`.
