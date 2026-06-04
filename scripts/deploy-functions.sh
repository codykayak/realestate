#!/usr/bin/env bash
# Deploy Twilio/SMS Cloud Functions + Firestore rules to production.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v firebase >/dev/null 2>&1; then
  echo "Install Firebase CLI: npm install -g firebase-tools"
  exit 1
fi

echo "Installing function dependencies…"
(cd functions && npm ci)

echo "Deploying functions + Firestore rules…"
firebase deploy --only functions,firestore:rules --project realestate-map-23692

echo ""
echo "Done. Test: https://www.macrorei.com/app → Dialer → Twilio setup → Save & verify (optional)"
