#!/usr/bin/env bash
# Configure git + gh to push codykayak/realestate (bypasses cursor[bot] URL rewrite).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

load_token() {
  if [[ -n "${REALESTATE_GITHUB_TOKEN:-}" ]]; then
    echo "$REALESTATE_GITHUB_TOKEN"
    return
  fi
  if [[ -n "${GH_TOKEN:-}" ]] && [[ "${GH_TOKEN}" == ghp_* ]]; then
    echo "$GH_TOKEN"
    return
  fi
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    if [[ -n "${REALESTATE_GITHUB_TOKEN:-}" ]]; then
      echo "$REALESTATE_GITHUB_TOKEN"
      return
    fi
  fi
  return 1
}

TOKEN="$(load_token)" || {
  cat >&2 <<'EOF'
No GitHub PAT found for realestate pushes.

Set ONE of these (recommended order):
  1. Cursor → Cloud Agents → Secrets → REALESTATE_GITHUB_TOKEN = ghp_...
  2. Shell: export GH_TOKEN=ghp_...
  3. File:  .env.local with REALESTATE_GITHUB_TOKEN=ghp_...

Also: start this Cloud Agent from repo codykayak/realestate (not AiBhive).
EOF
  exit 1
}

export GH_TOKEN="$TOKEN"
export GITHUB_TOKEN="$TOKEN"

cd "$ROOT"
# PAT in remote URL bypasses Cursor's global url.insteadOf (cursor[bot] → 403 on realestate).
git remote set-url origin "https://x-access-token:${TOKEN}@github.com/codykayak/realestate.git"
echo "$TOKEN" | gh auth login --with-token 2>/dev/null || true

touch "$ROOT/scripts/.auth-configured"
echo "OK: git push configured for codykayak/realestate as $(gh api user -q .login 2>/dev/null || echo 'github user')."
