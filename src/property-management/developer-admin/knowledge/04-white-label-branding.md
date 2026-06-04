# White-Label Branding & Logo

## How branding works today

All branding is **build-time** via Vite environment variables in `config/appConfig.js`:

| Env variable | UI effect |
|--------------|-----------|
| `VITE_PM_PRODUCT_NAME` | Sidebar product name (default: Macro REI) |
| `VITE_PM_PRODUCT_TAGLINE` | Marketing copy (not always visible in app shell) |
| `VITE_PM_COMPANY_NAME` | Subtitle under product name |
| `VITE_PM_LOGO` | Sidebar logo `<img src={config.logo}>` — path under `/public` |
| `VITE_PM_ACCENT` | CSS variable `--pm-accent` |
| `VITE_PM_ACCENT_SOFT` | `--pm-accent-soft` |
| `VITE_PM_BASE_PATH` | Router base (default `/property-management`) |
| `VITE_PM_SUPPORT_EMAIL` | Support contact |

**Settings page** displays current values read-only and notes they come from env.

## Change logo for macrorei.com deployment

1. Place image in `public/` (e.g. `public/branding/client-logo.png`).
2. Set in `.env.local` or CI secrets:
   ```
   VITE_PM_LOGO=/branding/client-logo.png
   VITE_PM_COMPANY_NAME=Your PMC Name
   VITE_PM_PRODUCT_NAME=Macro REI
   ```
3. Rebuild and deploy (`npm run build`).

SVG/PNG recommended; keep under ~40KB for fast sidebar load.

## Per-tenant runtime branding (not implemented yet)

Firestore design allows `tenants/{tenantId}` document fields:

```json
{
  "name": "Maple Grove Residential",
  "branding": {
    "logoUrl": "https://storage.../logo.png",
    "accent": "#2563eb"
  }
}
```

To enable:

1. Extend `PmContext` to merge `tenant.branding` over `APP_CONFIG` in `config` object passed to UI.
2. Store logos in Firebase Storage with signed URLs.
3. Keep env vars as deployment defaults for single-tenant builds.

## Developer Admin: Config Generator

Use the **Deployment config** tab to preview env vars and copy a `.env` block for your white-label client without editing source files.

## PDF / Owner reports

`components/OwnerReport.jsx` uses module styles; logo for PDF export would read the same `config.logo` once runtime branding exists.
