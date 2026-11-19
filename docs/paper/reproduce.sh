#!/usr/bin/env bash
# Recompute every number and figure of the paper inside this checkout.
# Run it in a clean checkout of the release tag (v0.3.0). The tree state is
# recorded at the start (NN_TREE_DIRTY, NN_TREE_COMMIT in results.json), before
# the library comparison rewrites doi-chieu/ket-qua.json; afterwards git status
# shows only the run metadata of doi-chieu/ket-qua.json and data/ljs/ket-qua.json
# (timestamp, run time) and, if the tree was dirty, the provenance in results.json.
#
#   docs/paper/reproduce.sh            # all steps
#   SKIP_COMPARISON=1 docs/paper/reproduce.sh   # skip the 5-15 minute library comparison
#
# Needs: Python 3.9+ with numpy and jplephem (DE440), skyfield (Delta T
# prediction), matplotlib (figures); Node.js 22.18+ (TypeScript port, Ho Ngoc
# Duc's JavaScript, the library comparison). Network access for the VSOP87D and
# VSOP87B files, the DE440 kernel and Ho Ngoc Duc's archived JavaScript (all
# checked by SHA-256; the JavaScript is not redistributed, see hnd_compare.py).
set -euo pipefail
cd "$(dirname "$0")"
PAPER="$(pwd)"
ROOT="$(cd ../.. && pwd)"
PY="${PYTHON:-python3}"

if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  export NN_TREE_COMMIT="$(git -C "$ROOT" rev-parse --short=12 HEAD)"
  if [ -n "$(git -C "$ROOT" status --porcelain --untracked-files=no -- .)" ]; then
    export NN_TREE_DIRTY=1
  else
    export NN_TREE_DIRTY=0
  fi
fi

[ -f data/raw/de440s.bsp ] || "$PY" fetch_reference_data.py --only de440
"$PY" derive_imcce_terms.py >/dev/null
"$PY" vsop_budget.py >/dev/null
"$PY" de440_new_moons.py >/dev/null
"$PY" delta_t_forecast.py >/dev/null
"$PY" skyfield_check.py >/dev/null
"$PY" hnd_compare.py --root "$ROOT" >/dev/null
"$PY" cross_language_check.py --root "$ROOT" >/dev/null
if [ -z "${SKIP_COMPARISON:-}" ]; then
  (cd "$ROOT/doi-chieu" && npm ci --no-audit --no-fund >/dev/null && node chay.mjs >/dev/null)
  mkdir -p data/ljs
  cp "$ROOT/doi-chieu/ket-qua.json" "$ROOT/doi-chieu/khac-ngay-am.csv" data/ljs/
fi
"$PY" analysis.py --root "$ROOT"
echo "done; run ./build.sh for paper.md and paper.pdf"
