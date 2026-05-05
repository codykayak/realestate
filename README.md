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

## Geocoding Notes

- Uses [Nominatim](https://nominatim.openstreetmap.org/) (free, no API key)
- Rate-limited to 1 request/second per OSM usage policy
- For large CSVs (100+ leads), consider batching with a paid geocoder (Google Maps, Geocodio, etc.)
- Geocoded coordinates are saved to localStorage so addresses aren't re-geocoded on refresh
