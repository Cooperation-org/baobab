#!/usr/bin/env bash
# Render each kind from this checkout and run its tests. Run before every push that
# touches template/.
#   scripts/check.sh            both
#   scripts/check.sh dashboard  one
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
out="$(mktemp -d "${TMPDIR:-/tmp}/template-check.XXXXXX")"
trap 'rm -rf "$out"' EXIT
kinds="${*:-backend dashboard}"

for kind in $kinds; do
  echo "== $kind"
  uvx copier copy --trust --defaults --quiet -d kind="$kind" -d slug=check -d name=Check "$here" "$out/$kind"
  cd "$out/$kind"
  uv venv -q .venv
  uv pip install -q -p .venv -r requirements.txt
  .venv/bin/python manage.py makemigrations --check --dry-run --settings=config.settings_test >/dev/null
  .venv/bin/pytest -q
  cd "$here"
done
echo "== all passed"
