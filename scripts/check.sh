#!/usr/bin/env bash
# Render each kind from this checkout and run what it ships with: pytest for frame and
# root, typecheck + build for frond. Run before every push that touches template/.
#   scripts/check.sh            all three
#   scripts/check.sh frame      one
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$(mktemp -d "${TMPDIR:-/tmp}/baobab-check.XXXXXX")"
trap 'rm -rf "$out"' EXIT
kinds="${*:-frame root frond}"

for kind in $kinds; do
  echo "== $kind"
  extra=()
  [ "$kind" = frond ] && extra=(-d backend=root)
  uvx copier copy --trust --defaults --quiet -d kind="$kind" -d slug=check -d name=Check "${extra[@]}" "$here" "$out/$kind"
  cd "$out/$kind"
  if [ "$kind" = frond ]; then
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
