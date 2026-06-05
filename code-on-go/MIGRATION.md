# Migrating Code on Go to its own repository

This project lives under `realestate/code-on-go/` for now. It is **fully self-contained** and can move to a dedicated repo in one step.

## What to copy

Copy the entire `code-on-go/` folder:

```
code-on-go/
├── mobile/
├── backend/
├── shared/
├── firebase/
├── package.json
├── docker-compose.yml
├── .gitignore
├── README.md
└── MIGRATION.md
```

Do **not** depend on anything outside this folder (no imports from parent `realestate` src).

## Migration steps

### 1. Create new GitHub repo

Example: `codykayak/code-on-go`

### 2. Extract and push

```bash
# From realestate repo root
cp -r code-on-go /tmp/code-on-go-standalone
cd /tmp/code-on-go-standalone
rm -rf mobile/node_modules backend/node_modules node_modules
git init
git add .
git commit -m "Initial Code on Go monorepo"
git remote add origin git@github.com:codykayak/code-on-go.git
git push -u origin main
```

### 3. Firebase project

Create a **new** Firebase project (recommended) or add iOS/Android apps to an existing one:

- Enable **Authentication** (Email, Google, or GitHub)
- Enable **Firestore**
- Deploy rules: `firebase deploy --only firestore:rules` from `firebase/`

Backend uses **Firebase Admin** with a service account on Cloud Run (ADC).

### 4. Cloud Run service

Deploy `backend/` as its own service — see README. Set secrets via Secret Manager:

- `GITHUB_PAT` per user → stored encrypted, not in env vars globally
- LLM keys → per-user in Secret Manager or encrypted Firestore + KMS

### 5. Mobile app config

Update `mobile/app.json`:

```json
"extra": {
  "apiBaseUrl": "https://code-on-go-api-xxxxx.run.app"
}
```

Or use EAS secrets: `EXPO_PUBLIC_API_URL`.

### 6. EAS Build (optional)

```bash
cd mobile
npx eas-cli init
npx eas build --platform android
```

## Workspace naming

npm workspaces use scoped packages:

- `@code-on-go/shared`
- `@code-on-go/backend`
- `@code-on-go/mobile`

Rename the scope in all `package.json` files if you rebrand.

## CI split

Suggested GitHub Actions in the new repo:

| Workflow | Trigger | Action |
|----------|---------|--------|
| `backend.yml` | push to `main` | build + deploy Cloud Run |
| `mobile.yml` | tag `v*` | EAS build |
| `typecheck.yml` | PR | `npm run typecheck` |

## Data boundary

| Data | Lives on phone | Lives on backend |
|------|----------------|------------------|
| Firebase ID token | Session only | Verified per request |
| GitHub PAT | Never (sent once at onboarding) | Encrypted store |
| LLM API keys | Never | Encrypted store |
| Repo file mirror | Never | Firestore + git workspace |
| Chat history | Cached in UI | Firestore |

This keeps the mobile app a true thin client.
