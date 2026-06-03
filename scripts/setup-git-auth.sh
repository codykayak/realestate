#!/usr/bin/env bash
# Configure git + gh to push codykayak/realestate (bypasses cursor[bot] URL rewrite).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

# Valid classic PAT: ghp_ + ~36 chars (skip placeholder / truncated secrets)
is_valid_pat() {
  [[ "${1:-}" == ghp_* ]] && [[ ${#1} -ge 36 ]]
}

pick_first_valid_pat() {
  for candidate in "$@"; do
    if is_valid_pat "$candidate"; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

load_token() {
  local from_file_june="" from_file_gh=""

  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    from_file_june="${junerealestate:-}"
    from_file_gh="${GH_TOKEN:-}"
  fi

  # Only junerealestate (+ .env.local / GH_TOKEN). Ignore REALESTATE_GITHUB_TOKEN so a
  # stale Cursor secret cannot override a valid junerealestate PAT.
  pick_first_valid_pat \
    "${junerealestate:-}" \
    "${GH_TOKEN:-}" \
    "$from_file_june" \
    "$from_file_gh"
}

TOKEN="$(load_token)" || {
  cat >&2 <<'EOF'
No GitHub PAT found for realestate pushes.

Set ONE of these (recommended order):
  1. Cursor → Cloud Agents → Secrets → junerealestate = ghp_... (Runtime secret, full token)
  2. File:  .env.local with junerealestate=ghp_...

Ignore REALESTATE_GITHUB_TOKEN in Cursor if you cannot delete it — this script skips it.

Start a NEW Cloud Agent after changing secrets (repo: codykayak/realestate).

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
