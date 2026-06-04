# Deployment & Environment

## Build

```bash
npm install
npm run build
```

Output: `dist/` — static SPA including `/property-management/*` routes.

## Env files

Copy `.env.example` → `.env.local`. PM-relevant vars prefixed `VITE_PM_`.

Firebase PM project (optional):

```
VITE_PM_FIREBASE_API_KEY=
VITE_PM_FIREBASE_AUTH_DOMAIN=
VITE_PM_FIREBASE_PROJECT_ID=
...
VITE_PM_FIRESTORE_DB=property-managment
```

## Routing on macrorei.com

`src/main.jsx` mounts:

```jsx
<Route path="/property-management/*" element={<PropertyManagement />} />
```

Client-side routing — nginx/ hosting must rewrite unknown paths to `index.html` for deep links like `/property-management/maintenance`.

## Developer Admin URL

`/property-management/developer-admin`

Not linked in customer-facing marketing; sidebar link labeled **Developer admin** (small, foot of nav).

## Git / Cloud Agent

Repo: `codykayak/realestate`. Run `./scripts/setup-git-auth.sh` before push. PRs target `main`.

## Optional: Developer Assistant API

Set `VITE_PM_DEV_OPENAI_API_KEY` in deployment **only if** you want server-side key (prefer Cloud Function in production).

Developer Admin UI also accepts a key in sessionStorage for local testing — never commit keys.

## Cursor IDE integration

Cursor cannot be embedded in an iframe on third-party sites (X-Frame-Options). Developer Admin provides:

- **Copy context for Cursor** — bundles relevant docs + current config into clipboard
- Link to open repo in Cursor Cloud Agents
- Deep links to files in GitHub

Use Cursor Cloud Agent on `codykayak/realestate` with this knowledge base as reference.
