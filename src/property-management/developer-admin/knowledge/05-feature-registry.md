# Feature Registry & Per-Tenant Customization

## File: `config/featureRegistry.js`

Each feature defines:

- `id`, `name`, `description`, `category`, `icon`, `route`
- `defaultEnabled`, `locked` (cannot disable)
- `config` — default tunables

Categories: Core, Owner & Reporting, AI Automation, Operations, Administration.

## How toggles persist

`PmContext.setFeatureEnabled(featureId, boolean)` writes to `settings.features` in localStorage (or Firestore settings doc in production).

`resolveFeatures(savedState)` merges saved state with registry defaults.

## Per-feature config examples

### Communications (`communications`)

```javascript
{
  autoPilot: true,
  confidenceThreshold: 0.6,  // FAQ match threshold for auto-reply
  afterHoursOnly: false,       // reserved for future scheduling
}
```

Used in `Communications.jsx` → `answerInquiry({ threshold: cfg.confidenceThreshold })`.

### Leasing (`leasing`)

```javascript
{
  incomeToRentMultiple: 3,
  minCreditScore: 620,
  petsAllowed: true,
  autoScreen: true,
}
```

Used in `lib/prescreen.js` via `Leasing.jsx`.

### Maintenance (`maintenance`)

```javascript
{
  selfHelpDeflection: true,
  emergencyAlerts: true,
}
```

Passed to `triageRequest(issue, cfg)`.

## Adding a new feature (checklist)

1. Add object to `FEATURES` array with unique `id` and `route`.
2. Create `pages/YourPage.jsx`.
3. Register in `PAGE_MAP` in `index.jsx`.
4. Add seed data if needed.
5. Document in Developer Admin knowledge base.
6. Optional: gate by `tier` when billing exists.

## Future-proofing: plans and tiers

Registry comments mention `tier` for plan gating — not enforced yet. Pattern:

```javascript
{ id: 'owner', tier: 'pro', defaultEnabled: false }
```

Filter in `resolveFeatures` based on `tenant.plan`.

## Client user input → where it goes

| User action | Stored in | Processed by |
|-------------|-----------|--------------|
| Resident SMS (simulated) | `conversations` | `faqEngine.answerInquiry` |
| Maintenance request | `workOrders` | `maintenanceTriage.triageRequest` |
| Leasing lead | `leasingLeads` | `prescreen.prescreenApplicant` |
| KB article edit | `knowledge` | FAQ scoring |
| CSV import | `residents` | `fileImport.importResidentsFromFile` |
| Integration connect | `integrations` | stub/real adapter |

**Programming destinations** for each row is the customization surface — see maintenance dispatch doc and integrations doc.
