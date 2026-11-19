#!/usr/bin/env bash
# Build paper.md and paper.pdf from paper.src.md: fill.py inserts every number
# from results.json and results-vsop.json, pandoc (with citeproc and the
# Harvard CSL style) writes standalone HTML, Chrome headless prints the PDF.
#
#   ./reproduce.sh           # every results-*.json and the figures (see there)
#   ./build.sh               # paper.md, paper.pdf
#
# PANDOC and CHROME may point to the binaries; pandoc 3.x is needed
# (pip install pypandoc_binary ships one). No TeX installation is needed.
set -euo pipefail
cd "$(dirname "$0")"

PANDOC="${PANDOC:-pandoc}"
if [ -z "${CHROME:-}" ]; then
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$c" >/dev/null 2>&1 || [ -x "$c" ]; then CHROME="$c"; break; fi
  done
fi
: "${CHROME:?set CHROME to a Chrome or Chromium binary}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

python3 fill.py paper.src.md results.json results-vsop.json results-imcce.json results-de440.json results-crosslang.json results-hnd.json results-skyfield.json > "$TMP/paper.md"
mv "$TMP/paper.md" paper.md
python3 fill.py response-to-referee.src.md results.json results-vsop.json results-imcce.json results-de440.json results-crosslang.json results-hnd.json results-skyfield.json > response-to-referee.md

"$PANDOC" paper.md \
  --standalone --citeproc --bibliography=references.bib --csl=harvard-cite-them-right.csl \
  --number-sections --mathml --embed-resources --css=paper.css \
  --metadata=link-citations:true \
  -o "$TMP/paper.html"

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --user-data-dir="$TMP/profile" \
  --print-to-pdf="$TMP/paper.pdf" "file://$TMP/paper.html" >/dev/null 2>&1 || true
[ -s "$TMP/paper.pdf" ] || { echo "Chrome did not write the PDF" >&2; exit 1; }

mv "$TMP/paper.pdf" paper.pdf
echo "paper.pdf written"
