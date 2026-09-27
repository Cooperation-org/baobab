#!/usr/bin/env bash
# Render each kind from this checkout and run what it ships with: pytest for dashboard and
# backend, typecheck + build for frontend. Run before every push that touches template/.
#   scripts/check.sh            all three
#   scripts/check.sh dashboard  one
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$(mktemp -d "${TMPDIR:-/tmp}/template-check.XXXXXX")"
trap 'rm -rf "$out"' EXIT
kinds="${*:-dashboard backend frontend}"

for kind in $kinds; do
  echo "== $kind"
  extra=()
  [ "$kind" = frontend ] && extra=(-d backend=new)
  uvx copier copy --trust --defaults --quiet -d kind="$kind" -d slug=check -d name=Check "${extra[@]}" "$here" "$out/$kind"
  cd "$out/$kind"
  if [ "$kind" = frontend ]; then
    cp .env.example .env
    npm ci --silent --no-audit --no-fund
    npx tsc -b
    npx vite build --logLevel error
    test -f dist/embed/kit.js && test -f dist/embed/check.js
  else
    uv venv -q .venv
    uv pip install -q -p .venv -r requirements.txt
    .venv/bin/python manage.py makemigrations --check --dry-run --settings=config.settings_test >/dev/null
    .venv/bin/pytest -q
  fi
  cd "$here"
done
echo "== all passed"
