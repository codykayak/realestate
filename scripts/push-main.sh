#!/usr/bin/env bash
set -euo pipefail
"$(dirname "$0")/setup-git-auth.sh"
cd "$(dirname "$0")/.."
git checkout main
git pull origin main
git push origin main "$@"
