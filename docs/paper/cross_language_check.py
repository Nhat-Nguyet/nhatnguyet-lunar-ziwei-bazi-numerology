#!/usr/bin/env python3
"""Bit-level agreement of the TypeScript and Python ports on unrounded values.

The shared test vectors compare dates and rounded minutes. This check compares
the unrounded floating-point values that produce them: the apparent solar
longitude (TT and UT entry points) at the 4,824 IMCCE solar-term instants, and
the new-moon series n_k for the 2,474 lunations of 1901-2100. Each value is
printed as the shortest round-trip decimal string by JavaScript, parsed back
to an IEEE 754 double in Python and compared for exact equality with the
Python value (equal doubles have the same bits).

    python3 docs/paper/cross_language_check.py [--root <library tree>]

Needs Node.js 22.18 or newer (TypeScript sources run with type stripping).
Writes results-crosslang.json.
"""

import argparse
import json
import os
import subprocess
import sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))

NODE = r"""
const [root, inputPath] = process.argv.slice(1);
const fs = await import("node:fs");
const mt = await import(root + "/js/packages/am-lich/src/mat-troi.ts");
const li = await import(root + "/js/packages/am-lich/src/lich.ts");
const inp = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const out = {
  tt: inp.jd.map((x) => String(mt.kinhDoBieuKienTT(x))),
  ut: inp.jd.map((x) => String(mt.kinhDoMatTroiUT(x))),
  nm: inp.k.map((k) => String(li.newMoon(k))),
};
process.stdout.write(JSON.stringify(out));
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.normpath(os.path.join(HERE, "..", "..")))
    root = os.path.abspath(ap.parse_args().root)
    sys.path.insert(0, os.path.join(root, "python"))
    from nhatnguyet import am_lich as al

    jd = []
    for line in open(os.path.join(HERE, "data", "imcce-terms-utc.tsv"), encoding="utf-8"):
        if line.startswith("#"):
            continue
        d, t, _k, _dt = line.rstrip("\n").split("\t")
        y, m, dd = (int(x) for x in d.split("-"))
        h, mi, s = t.split(":")
        jd.append(al.jd_from_date(dd, m, y) - 0.5 + (int(h) * 3600 + int(mi) * 60 + float(s)) / 86400.0)
    ks = list(range(13, 13 + 2474))  # 2,474 lunations from January 1901 (k = 13) on
    inp = os.path.join(HERE, ".crosslang-input.json")
    with open(inp, "w", encoding="utf-8") as f:
        json.dump({"jd": jd, "k": ks}, f)
    try:
        js = json.loads(subprocess.check_output(
            ["node", "--input-type=module", "-e", NODE, "file://" + root, inp], text=True))
    finally:
        os.remove(inp)
    py = {"tt": [al.kinh_do_bieu_kien_tt(x) for x in jd],
          "ut": [al.kinh_do_mat_troi_ut(x) for x in jd],
          "nm": [al.new_moon(k) for k in ks]}
    res = OrderedDict()
    for key, label in (("tt", "apparent_longitude_tt"), ("ut", "apparent_longitude_ut"), ("nm", "new_moon_series")):
        eq = sum(1 for a, b in zip(js[key], py[key]) if float(a) == b)
        mx = max(abs(float(a) - b) for a, b in zip(js[key], py[key]))
        res[label] = OrderedDict([("values", len(py[key])), ("bit_identical", eq), ("max_abs_difference", mx)])
    with open(os.path.join(HERE, "results-crosslang.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, indent=1)
        f.write("\n")
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
