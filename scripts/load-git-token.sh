#!/usr/bin/env bash
# Source this once per shell:  source scripts/load-git-token.sh
# Loads junerealestate / REALESTATE_GITHUB_TOKEN from .env.local (no paste needed).
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi
export GH_TOKEN="${junerealestate:-$GH_TOKEN}"
export GITHUB_TOKEN="$GH_TOKEN"
export junerealestate="${junerealestate:-$GH_TOKEN}"
