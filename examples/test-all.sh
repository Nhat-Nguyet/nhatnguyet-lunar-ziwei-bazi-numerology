#!/usr/bin/env bash
# Builds and tests every template in examples/ against the LOCAL packages of
# this repository (js/packages/* and python/), not the versions on npm or PyPI.
#
#   bash examples/test-all.sh                 # all templates
#   bash examples/test-all.sh nextjs-lunar-calendar  # one (also: telegram-bot, google-sheets, jupyter)
#
# Each template is copied to $WORK (default: $TMPDIR/nhatnguyet-examples), so no
# node_modules, .next, out or virtualenv ever lands in the repository.
# SKIP_BUILD=1 skips rebuilding js/packages/am-lich and tu-vi (when dist/ is up to date).
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/.." && pwd)
WORK=${WORK:-${TMPDIR:-/tmp}/nhatnguyet-examples}
ONLY=${1:-all}
export NEXT_TELEMETRY_DISABLED=1 npm_config_audit=false npm_config_fund=false npm_config_update_notifier=false
mkdir -p "$WORK"

want() { [ "$ONLY" = all ] || [ "$ONLY" = "$1" ]; }
say() { printf '\n== %s\n' "$*"; }

# Copy a template to $WORK and point its file: dependencies at the absolute
# path of the local packages (the relative paths only work from examples/<name>).
copy_template() {
  local name=$1 dst="$WORK/$1"
  rm -rf "$dst"
  mkdir -p "$dst"
  (cd "$HERE/$name" && tar cf - --exclude node_modules --exclude .next --exclude out --exclude .venv .) | (cd "$dst" && tar xf -)
  if [ -f "$dst/package.json" ]; then
    SRC="$HERE/$name" node -e '
      const fs = require("fs"), path = require("path");
      const file = process.argv[1], pkg = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const key of ["dependencies", "devDependencies"])
        for (const [n, v] of Object.entries(pkg[key] || {}))
          if (v.startsWith("file:")) pkg[key][n] = "file:" + path.resolve(process.env.SRC, v.slice(5));
      fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
    ' "$dst/package.json"
  fi
}

if want nextjs-lunar-calendar || want telegram-bot || want google-sheets; then
  if [ "${SKIP_BUILD:-0}" != 1 ]; then
    say "build js/packages (am-lich, tu-vi: the packages the templates use)"
    (cd "$ROOT/js" && { [ -d node_modules ] || npm install --no-audit --no-fund; } \
      && npm run build -w @nhatnguyet/am-lich >/dev/null && npm run build -w @nhatnguyet/tu-vi >/dev/null)
  fi
fi

if want nextjs-lunar-calendar; then
  say "nextjs-lunar-calendar: install, unit tests, next build (static export)"
  copy_template nextjs-lunar-calendar
  (cd "$WORK/nextjs-lunar-calendar" && npm install --silent && npm test && npm run build)
  page="$WORK/nextjs-lunar-calendar/out/index.html"
  grep -q "Vietnamese lunar calendar" "$page"
  grep -q "Zi Wei Dou Shu chart" "$page"
  echo "out/index.html: $(wc -c < "$page") bytes, $(ls "$WORK/nextjs-lunar-calendar/out/_next/static/chunks" | wc -l | tr -d ' ') JS chunks"
fi

if want telegram-bot; then
  say "telegram-bot: install, command handlers and bot wiring (no network)"
  copy_template telegram-bot
  (cd "$WORK/telegram-bot" && npm install --silent && npm test)
fi

if want google-sheets; then
  say "google-sheets: Code.gs is up to date, custom functions run in Node"
  copy_template google-sheets
  (cd "$WORK/google-sheets" && npm install --silent && npm run check && npm test)
fi

if want jupyter; then
  say "jupyter: execute the notebook in a virtualenv with the local Python package"
  copy_template jupyter
  venv="$WORK/venv"
  [ -x "$venv/bin/python" ] || python3 -m venv "$venv"
  "$venv/bin/python" -m pip install -q --upgrade pip
  "$venv/bin/python" -m pip install -q --force-reinstall --no-deps "$ROOT/python"   # local package first
  "$venv/bin/python" -m pip install -q -r "$HERE/jupyter/requirements.txt" nbconvert==7.17.2 ipykernel==7.4.0
  "$venv/bin/python" -c "import matplotlib.pyplot"   # build the font cache now, not inside a cell
  "$venv/bin/python" -m ipykernel install --prefix "$venv" --name nhatnguyet-examples >/dev/null
  (cd "$WORK/jupyter" && "$venv/bin/python" -m jupyter nbconvert --to notebook --execute \
      --ExecutePreprocessor.kernel_name=nhatnguyet-examples --ExecutePreprocessor.record_timing=False \
      --output executed.ipynb tet-vietnam-vs-china.ipynb)
  "$venv/bin/python" "$HERE/jupyter/compare_outputs.py" "$HERE/jupyter/tet-vietnam-vs-china.ipynb" "$WORK/jupyter/executed.ipynb"
fi

say "all templates passed"
