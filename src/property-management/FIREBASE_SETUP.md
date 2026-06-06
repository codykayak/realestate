# Firestore setup for the Property Management module (beginner-friendly)

This guide sets up the database that the ManyDoors AI property-management module will
use. Your Firestore database is named **`property-managment`**.

> Quick mental model: a **Firebase project** is the big container. Inside it,
> **Cloud Firestore** is the database. A database holds **collections**
> (like folders), each collection holds **documents** (like records/rows), and
> each document holds **fields** (the actual values). We keep every company's
> data under its own `tenant`, so no customer can ever see another's data.

---

## Step 1 — The Firebase project & database (explained)

You may have already done parts of this. Here's what each piece means and where
to click.

1. **Open the project.** Go to <https://console.firebase.google.com> and open
   the project that contains your `property-managment` database. (A project has
   a name like `hiveops-pm` and a Project ID — both are fine.)

2. **Confirm the Firestore database exists.** Left sidebar → **Build → Firestore
   Database**. You should see your data area. If there is a database picker at
   the top, make sure **`property-managment`** is selected (this is a *named*
   database; the default one is called `(default)`). If it doesn't exist yet,
   click **Create database**:
   - **Mode:** choose **Production mode** (starts locked; we paste rules in
     Step 3). Don't use Test mode — it leaves your data open to the world.
   - **Location:** pick a region close to your users (e.g. `us-west1`). ⚠️ This
     is **permanent** — you can't change it later.
   - If asked for a database ID/name, enter exactly **`property-managment`**.

3. **Turn on sign-in.** Left sidebar → **Build → Authentication → Get started**,
   then enable **Email/Password** and **Google**. The rules require users to be
   signed in, so this must be on.

4. **Get your web config (public keys).** Click the **gear icon → Project
   settings** → scroll to **Your apps** → if there's no web app, click the
   **`</>`** (web) icon to register one (any nickname). You'll see a `firebaseConfig`
   block. Copy those 6 values into your `.env.local` (see
   [`.env.example`](../../.env.example)):

   ```bash
   VITE_PM_FIREBASE_API_KEY=...
   VITE_PM_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
   VITE_PM_FIREBASE_PROJECT_ID=<project-id>
   VITE_PM_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app
   VITE_PM_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_PM_FIREBASE_APP_ID=...

   # Tell the app to use the NAMED database (exact spelling matters):
   VITE_PM_FIRESTORE_DB=property-managment
   ```

   These web keys are **public by design** — security comes from the rules in
   Step 3 + Authentication, not from hiding them. (Never paste real *secret* API
   keys for Yardi/Twilio/etc. here — those go server-side, see Step 5.)

---

## Step 2 — The data layout (what gets stored, and why)

You don't have to create anything by hand — the app writes these automatically
once the Firestore store is wired up. This is just so you understand what you're
looking at in the console:

```
tenants/{tenantId}                      ← one per property-management company
  • settings live on this document (name, branding, enabled features)
  ├─ members/{userId}   { role: "owner" | "admin" | "staff" }   ← who can access
  ├─ residents/{id}      ← residents & units
  ├─ conversations/{id}  ← resident SMS/email threads
  ├─ leasingLeads/{id}   ← applicants in the leasing pipeline
  ├─ workOrders/{id}     ← maintenance tickets
  ├─ knowledge/{id}      ← knowledge-base FAQ entries
  ├─ financials/{id}     ← monthly financials that feed the Owner Portal
  ├─ integrations/{id}   ← which providers are connected (NO secrets here)
  └─ secrets/{id}        ← server-only API keys/tokens (clients can't read these)
```

**Why "tenants"?** Multi-tenant means many companies can use the same app, each
walled off. A user gets access to a company only by being added to that
company's `members` list. This is exactly what the rules in Step 3 enforce.

**First record to create:** to actually log in and see data, a tenant + your
membership must exist. The safest way is from a server (Admin SDK) — but to get
going quickly you can create them by hand in the console:
1. Create collection `tenants`, add a document (e.g. ID `demo`) with a field
   `name` = "Maple Grove Residential".
2. Under that document, create a subcollection `members`, add a document whose
   **ID is your Auth user UID** (find it under Authentication → Users) with a
   field `role` = `owner`.

Now your signed-in user is an owner of tenant `demo` and the rules will let you
in.

---

## Step 3 — Security rules (copy/paste)

Open **Build → Firestore Database → (select `property-managment`) → Rules tab**,
delete what's there, paste the full contents of [`firestore.pm.rules`](../../firestore.pm.rules),
and click **Publish**.

In plain English, those rules:
- block everyone who isn't signed in;
- only let you read/write a company's data if you're a member of that company;
- only let **owners/admins** change settings, team membership, and integrations;
- make the `secrets/` area **impossible to read from the browser** (keys stay safe).

---

## Step 4 — Indexes

You don't need to create any indexes to start. Sorting one collection by a
single field (e.g. newest first) works automatically. If you ever build a query
that combines a filter **and** a sort on different fields, Firestore will show an
error in the browser console with a **one-click link** that creates the exact
index for you.

---

## Step 5 — Where provider secrets go (important)

API keys/tokens for Yardi, Twilio, screening, etc. must **never** sit in the
browser or in a client-readable Firestore field. Put them in either:
- **Google Secret Manager** (recommended), or
- the `secrets/` path written **only** by a Cloud Function (Admin SDK).

All real calls to those providers should run server-side. The module's setup
wizard is built to keep only the "Connected ✅" status on the client.

---

## Status / what's next

The module currently runs on a local (browser) store so it works with zero
setup. With the project, env values, and rules above in place, the next code
step is to add a **Firestore-backed implementation of the data layer**
(`data/store.js`) plus a sign-in gate — the module is already structured for
this (isolated `firebase/pmFirebase.js`, tenant-namespaced collections). Ask and
that can be built next.
