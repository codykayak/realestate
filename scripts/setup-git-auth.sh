#!/usr/bin/env bash
# Load REALESTATE_GITHUB_TOKEN from .env.local and configure git/gh for realestate pushes.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — add REALESTATE_GITHUB_TOKEN=ghp_..." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${REALESTATE_GITHUB_TOKEN:-}" ]]; then
  echo "REALESTATE_GITHUB_TOKEN not set in $ENV_FILE" >&2
  exit 1
fi

export GH_TOKEN="$REALESTATE_GITHUB_TOKEN"
export GITHUB_TOKEN="$REALESTATE_GITHUB_TOKEN"

cd "$ROOT"
git remote set-url origin "https://x-access-token:${REALESTATE_GITHUB_TOKEN}@github.com/codykayak/realestate.git"

echo "$GH_TOKEN" | gh auth login --with-token 2>/dev/null || true

touch "$ROOT/scripts/.auth-configured"
echo "Git + gh configured for codykayak/realestate (token from .env.local)."
