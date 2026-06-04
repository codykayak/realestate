# Data Layer — localStorage & Firestore

## Current store (`data/store.js`)

```javascript
localStorage key: pm:{tenantId}:{collection}
```

Collections:

| Key | Contents |
|-----|----------|
| `settings` | Tenant, feature flags, onboarding |
| `residents` | Roster |
| `conversations` | SMS/email threads |
| `leasingLeads` | Pipeline |
| `workOrders` | Maintenance tickets |
| `knowledge` | FAQ entries |
| `integrations` | Connection status (no secrets) |

API: `createStore(tenantId)` → `list`, `upsert`, `remove`, `getSettings`, `saveSettings`, etc.

## Swapping to Firestore

1. Configure `VITE_PM_FIREBASE_*` and `VITE_PM_FIRESTORE_DB=property-managment`.
2. Implement `createFirestoreStore(tenantId)` with same method signatures.
3. Export factory that picks backend based on env.
4. Add Auth gate before `PmProvider` renders.

See `FIREBASE_SETUP.md` and `firestore.pm.rules`.

## Secrets path

`tenants/{tenantId}/secrets/{provider}` — **client cannot read**. Cloud Functions use Admin SDK.

## Export / import tenant data (developer)

Browser console:

```javascript
Object.keys(localStorage).filter(k => k.startsWith('pm:demo:')).forEach(k => console.log(k, localStorage.getItem(k)));
```

For migrations, build a one-off script using Admin SDK to write seed documents.

## Indexes

Single-field sorts work out of the box. Composite queries need console-linked index creation when errors appear.
