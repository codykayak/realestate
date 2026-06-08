# How to open and test Code on Go

Step-by-step guide. Pick **one** way to view the app.

---

## Before you start (one time)

### 1. Install Node.js 20+

Check: `node -v` should show v20 or higher.

### 2. Install dependencies

```bash
cd code-on-go
npm install
```

### 3. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your Cursor API key for local testing:

```
cursorapi=your_cursor_api_key_here
```

On **Cloud Run**, you already have the secret named `cursorapi` — the backend reads it automatically.

You still need a **GitHub PAT** in the app onboarding (repo access). Cursor uses its own cloud VM; your PAT is for the Repo Chat tab and repo linking.

---

## Option A — Phone with Expo Go (easiest on a real device)

### Step 1: Start the backend on your computer

```bash
cd code-on-go
npm run dev:backend
```

Leave this terminal open. You should see:

```
code-on-go backend listening on :8080
```

Quick check in another terminal:

```bash
curl http://localhost:8080/health
```

Expected: `{"ok":true,"service":"code-on-go-backend"}`

### Step 2: Find your computer's IP address

- **Mac:** System Settings → Network, or run `ipconfig getifaddr en0`
- **Windows:** `ipconfig` → look for IPv4 (e.g. `192.168.1.42`)
- **Linux:** `hostname -I | awk '{print $1}'`

### Step 3: Point the app at your backend

```bash
cd code-on-go/mobile
EXPO_PUBLIC_API_URL=http://YOUR_IP:8080 npm run start
```

Replace `YOUR_IP` with the address from step 2, e.g. `http://192.168.1.42:8080`.

### Step 4: Open on your phone

1. Install **Expo Go** from the App Store or Google Play.
2. Make sure phone and computer are on the **same Wi‑Fi**.
3. Scan the **QR code** shown in the terminal (or in the browser tab Expo opens).
4. The app loads as **Code on Go**.

### Step 5: Use the app

1. **Onboarding** — GitHub PAT + repo `owner/name` (e.g. `codykayak/realestate`). LLM keys optional if you only use Cursor.
2. Bottom tabs:
   - **Cursor** — list agents, + New, pick model & repo, chat with Cursor Cloud Agent
   - **Repo Chat** — other LLMs with approve & push
   - **Settings** — dev user ID, re-run onboarding

---

## Option B — Android emulator

### Prerequisites

- Android Studio installed with an emulator (AVD)

### Steps

```bash
# Terminal 1 — backend
cd code-on-go
npm run dev:backend

# Terminal 2 — app (emulator uses 10.0.2.2 to reach host localhost)
cd code-on-go/mobile
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080 npm run start
```

Press **`a`** in the Expo terminal to open the Android emulator.

---

## Option C — iOS Simulator (Mac only)

```bash
# Terminal 1
cd code-on-go && npm run dev:backend

# Terminal 2
cd code-on-go/mobile
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run start
```

Press **`i`** to open iOS Simulator.

---

## Option D — Web browser (quick UI preview)

```bash
cd code-on-go
npm run dev:backend

# another terminal
cd code-on-go/mobile
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web
```

Opens in your browser. Good for layout checks; phone is better for real use.

---

## Testing the Cursor tab

1. Complete **onboarding** with a GitHub repo you can access.
2. Open the **Cursor** tab.
3. If you see "Cursor API key is not configured", set `cursorapi` in `backend/.env` (local) or Cloud Run secret (production).
4. Tap **+ New**.
5. Select **repository** and **model**.
6. Type a prompt, e.g. `Add a short comment at the top of README.md explaining the project`.
7. Tap **Send**.
8. Wait — you'll see "Cursor is working on your repo…" then the reply when the cloud agent finishes.
9. Past agents appear on the list; tap one to continue the conversation.

Cursor works in the cloud on your GitHub repo. You do **not** need to enter a Cursor API key on the phone.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Network request failed" on phone | Use `EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8080`, same Wi‑Fi, backend running |
| Cursor tab says key not configured | Set `cursorapi=` in `backend/.env` locally, or Cloud Run secret in prod |
| Onboarding fails on GitHub | PAT needs `repo` scope; owner/name must be exact |
| Expo won't connect | Try `npx expo start --tunnel` (slower but works across networks) |
| Backend port in use | Change `PORT=8081` in `backend/.env` and update `EXPO_PUBLIC_API_URL` |

---

## Production (Cloud Run backend already deployed)

If the API is on Cloud Run:

```bash
cd code-on-go/mobile
EXPO_PUBLIC_API_URL=https://your-service-xxxxx.run.app npm run start
```

Ensure Cloud Run has the `cursorapi` secret and CORS allows your app origin.
