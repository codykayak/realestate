# Motivated Seller Lead Mapping Tool

A lightweight web app for real estate investors to upload a CSV of motivated seller leads and instantly see them as clickable pins on an interactive map of Eugene, Oregon.

## Features

- **CSV upload** — drag & drop or browse; handles flexible/varied column names automatically
- **MapLibre GL dark map** — OpenFreeMap dark basemap, no API key required
- **Auto-geocoding** — resolves addresses to coordinates using OpenStreetMap Nominatim
- **Clickable pins** — color-coded by lead status; clicking opens a detail sidebar
- **Lead detail sidebar** — shows all CSV data, editable status and notes
- **Persists to localStorage** — reloads your leads on refresh, no backend needed

## Stack

- React + Vite
- MapLibre GL JS
- PapaParse (CSV parsing)
- OpenFreeMap (free dark basemap tiles)
- Nominatim / OpenStreetMap (free geocoding)

## Supported CSV columns (flexible naming)

| Field | Accepted column names |
|---|---|
| Address | address, street, property_address, situs |
| City | city, town |
| State | state, st |
| ZIP | zip, zipcode, postal_code |
| Name | name, owner, seller, contact |
| Phone | phone, cell, mobile, telephone |
| Email | email, email_address |
| Price | price, asking_price, arv, value |
| Equity | equity, est_equity |
| MLS # | mls, mls_number |
| Status | status, lead_status |
| Notes | notes, comments, memo |

All other columns are preserved and shown in the detail panel.

## Lead Statuses

New → Contacted → Negotiating → Under Contract → Closed / Dead

Each status has a distinct pin color on the map.

## Local Development

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Production Build

```bash
npm run build
# Output in dist/
```

## Deploy to Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/seller-map

gcloud run deploy seller-map \
  --image gcr.io/YOUR_PROJECT/seller-map \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --port 8080
```

## Twilio SMS (Dialer)

Each user connects **their own** Twilio account via the in-app onboarding wizard (Dialer → **💬 Setup**).

**Features**

- **Txt Now** — pick 1 of 3 templates; name and address auto-fill from the lead spreadsheet
- **SMS tally** — `smsCount` per lead and per phone number (`smsCountsByPhone`), shown in Dialer and Sheets (like call counts)
- **Missed callback auto-text** — when a lead calls your Twilio number and you don’t answer, a template is sent (24h dedupe)

**Deploy Cloud Functions** (required for SMS to work in production):

```bash
cd functions && npm ci && cd ..
firebase login
firebase deploy --only functions,firestore:rules --project realestate-map-23692
```

Add GitHub secret `FIREBASE_TOKEN` (`firebase login:ci`) to auto-deploy via `.github/workflows/deploy-firebase-functions.yml`.

**Twilio Console** — paste the Voice webhook URL from onboarding into your Twilio phone number’s “A call comes in” setting.

### Dialer features (requires Functions deploy)

- Lead flags: **Do not call**, **Do not text**, **SMS opted out** — blocks Call / Txt Now
- **Activity timeline** — calls, texts, and notes per lead
- **Export CSV** on Sheets tab
- **Appointment reminder** — schedules confirmation text **3 hours before** appointment (`processScheduledSms` runs every 5 minutes)
- Call/text logs include **team member email** (Firebase Auth — each login has its own lead list)

```bash
firebase deploy --only functions,firestore:rules,firestore:indexes --project realestate-map-23692
```

## Geocoding Notes

- Uses [Nominatim](https://nominatim.openstreetmap.org/) (free, no API key)
- Rate-limited to 1 request/second per OSM usage policy
- For large CSVs (100+ leads), consider batching with a paid geocoder (Google Maps, Geocodio, etc.)
- Geocoded coordinates are saved to localStorage so addresses aren't re-geocoded on refresh
