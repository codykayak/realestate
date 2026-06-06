# Code on Go

Lightweight mobile coding assistant — **thin client** (Expo) + **backend** (Cloud Run + Firebase).

The phone is only a chat UI. Git operations, LLM routing, and secret storage run on the server.

## Is this doable?

**Yes.** This scaffold proves the architecture:

1. Mobile sends chat + agent choice → backend
2. Backend mirrors GitHub repo (clone → Firestore/in-memory tree)
3. Backend calls the selected LLM (stub today; wire real SDKs next)
4. User **Approve & Push** → backend applies changes, commits, pushes via PAT

## Monorepo layout

```
code-on-go/
├── mobile/          # Expo React Native — chat, agent picker, approve/reject
├── backend/         # Node.js API — Git, LLM router, sessions (Cloud Run)
├── shared/          # TypeScript types shared by mobile + backend
├── firebase/        # Firestore rules & indexes (deploy separately)
├── docker-compose.yml
├── MIGRATION.md     # How to move to its own repo
└── README.md
```

## Quick start (local)

### 1. Install dependencies

```bash
cd code-on-go
npm install
```

### 2. Start the backend

```bash
cp backend/.env.example backend/.env
npm run dev:backend
```

Health check: `curl http://localhost:8080/health`

### 3. Start the mobile app

```bash
npm run dev:mobile
```

- Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator.
- On a physical device, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP, e.g. `http://192.168.1.10:8080`.

### 4. Test flow

1. **Onboarding** — enter GitHub PAT, repo `owner/name`, and at least one LLM key
2. **Chat** — pick an agent, send a message (try "update readme")
3. **Approve & Push** — when pending changes appear, approve to commit & push

**MVP auth:** `Bearer dev:<userId>` (see Settings screen). Replace with Firebase Auth ID tokens for production.

## API (v1)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| POST | `/v1/onboarding` | Save keys + clone/sync repos |
| GET | `/v1/repos` | List linked repos |
| POST | `/v1/sessions` | Start agent session |
| GET | `/v1/sessions/:id` | Session + messages |
| POST | `/v1/sessions/:id/messages` | Send chat → agent |
| POST | `/v1/sessions/:id/approve` | Apply changes + git push |
| POST | `/v1/sessions/:id/reject` | Discard pending changes |

## Production architecture

```
┌─────────────┐     HTTPS      ┌──────────────────┐
│ Expo mobile │ ─────────────► │ Cloud Run (API)  │
│  chat only  │ ◄───────────── │  Git + LLM       │
└─────────────┘                └────────┬─────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              Firebase Auth       Firestore mirror    Secret Manager
              (sessions)          (repo files)        (PAT + LLM keys)
                                        │
                                        ▼
                                   GitHub push
```

### Next implementation steps

- [ ] Firebase Auth on mobile + `verifyIdToken` on backend
- [ ] Firestore store (replace in-memory `store.ts`)
- [ ] Secret Manager for PAT/LLM keys (never store raw keys in Firestore docs)
- [ ] Real LLM SDKs in `backend/src/services/llmRouter.ts`
- [ ] GitHub App instead of PAT (better security, org repos)
- [ ] EAS Build for APK/IPA distribution

## Deploy backend to Cloud Run

```bash
cd code-on-go
gcloud run deploy code-on-go-api \
  --source . \
  --dockerfile backend/Dockerfile \
  --region us-central1 \
  --set-env-vars USE_IN_MEMORY_STORE=false,FIREBASE_PROJECT_ID=your-project
```

Or use `docker compose up --build` for local container testing.

## Migrate to standalone repo

See [MIGRATION.md](./MIGRATION.md).
