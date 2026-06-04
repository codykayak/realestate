# Maintenance: "Dispatched" Status — Where Does It Go?

## Short answer

**Nowhere external.** When Staytus (or the UI) shows **Dispatched**, the work order's `status` field is set to the string `dispatched` in the tenant store. No webhook fires, no Yardi work order is created, no vendor receives a page.

The word **dispatched** describes **intent** (escalate immediately), not a completed integration.

---

## How status is assigned

### 1. AI triage on create (`lib/maintenanceTriage.js`)

```javascript
recommendedStatus: isEmergency ? 'dispatched' : selfHelp ? 'self-help-sent' : 'open',
routing: isEmergency
  ? 'Escalate now: on-call emergency maintenance + notify property manager.'
  : `Route to ${category} queue (${priority} priority).`,
```

| Condition | Status | Routing string (display only) |
|-----------|--------|-------------------------------|
| Emergency keywords (gas, fire, flood, no heat, sewage, lockout, …) | `dispatched` | "Escalate now: on-call emergency maintenance + notify property manager." |
| Self-help match (disposal, GFCI, thermostat tips) | `self-help-sent` | "Route to {category} queue …" |
| Otherwise | `open` | "Route to {category} queue …" |

Emergency detection regex: `EMERGENCY_RE` in `maintenanceTriage.js`.

### 2. Manual status changes (`pages/Maintenance.jsx`)

Staff can only toggle **Close** / **Reopen** (`closed` ↔ `open`). There is **no UI** to manually set `dispatched` after creation — only triage sets it on submit.

### 3. Seed demo data

`data/seed.js` includes a sample HVAC emergency with `status: 'dispatched'` for the pitch demo.

---

## What `routing` is

`routing` is a **human-readable string** stored on the work order (`wo.routing`) and shown in the triage preview banner. It is **not** parsed by any router. It does not select a queue ID, email address, or integration endpoint.

---

## Where dispatch *should* go (implementation guide)

To make "Dispatched" mean something in production, implement a **dispatch pipeline** triggered when status becomes `dispatched` (or priority is `emergency`):

### Option A — PMS write-back (recommended for Yardi shops)

1. User connects Yardi in Settings → Integrations.
2. Implement `createWorkOrder(payload)` in a real Yardi adapter.
3. On `upsertWorkOrder` when `status === 'dispatched'`, call Cloud Function → Yardi Interface → create service request / work order.
4. Store returned Yardi WO id on `workOrders/{id}.externalId`.

**Yardi manifest capabilities today:** `residents.read`, `leases.read`, `workorders.write` (see `integrations/registry.js`).

### Option B — Notifications (fastest MVP)

Cloud Function on work order write:

| Channel | Target | Payload |
|---------|--------|---------|
| SMS (Twilio) | On-call phone from tenant settings | Unit, issue, resident phone |
| Email (SendGrid) | Property manager distribution list | Same |
| Slack webhook | `#maintenance-emergencies` | Same |

### Option C — Vendor / field service

Integrate ServiceChannel, Building Engines, or internal tech roster:

- Map `category` → vendor assignment rules (JSON in tenant settings).
- POST to vendor API with SLA based on `priority`.

### Option D — Staytus or third-party status UI

If the customer uses **Staytus** as their status board:

- Staytus is **not** in the codebase today.
- You would sync Macro REI `workOrders` → Staytus API (or vice versa) via a scheduled job or webhook.
- Map Macro REI `dispatched` → Staytus equivalent status id in integration config.

---

## Recommended config schema (future)

Add to `featureRegistry` maintenance `config`:

```json
{
  "selfHelpDeflection": true,
  "emergencyAlerts": true,
  "dispatch": {
    "onEmergencyStatus": ["sms", "yardi-workorder"],
    "onDispatchedStatus": ["email"],
    "queues": {
      "HVAC": { "email": "hvac-vendor@example.com", "yardiCategory": "HVAC" },
      "Plumbing": { "email": "plumbing@example.com" }
    },
    "onCallPhone": "+15551234567",
    "notifyPmEmail": "pm@client.com"
  }
}
```

Wire in `PmContext` `upsertWorkOrder` wrapper or a Firestore `onWrite` trigger — **not** in the Maintenance page UI.

---

## Category & priority rules (customization)

Edit `CATEGORY_RULES`, `EMERGENCY_RE`, and `SELF_HELP` in `lib/maintenanceTriage.js`.

For per-tenant rules without code deploy:

1. Store JSON rules in Firestore `tenants/{id}/settings.maintenanceRules`.
2. Change `triageRequest(text, config)` to accept `config.categoryRules` arrays from tenant settings.
3. Developer Admin includes a **Triage Playground** to test rules before saving.

---

## Testing dispatch behavior locally

1. Open Maintenance → New request.
2. Enter: `I smell gas in the kitchen`.
3. Observe triage: category, `emergency` priority, status **Dispatched**, routing escalation text.
4. Submit → inspect localStorage key `pm:demo:workOrders` in DevTools.
5. Confirm no network calls — expected until server pipeline exists.
