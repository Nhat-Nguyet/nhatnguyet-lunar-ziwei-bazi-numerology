#!/usr/bin/env python3
"""Derive the 24 solar-term instants per year from the raw IMCCE Miriade
samples (data/raw/miriade-sun-{utc,tt}-*.csv.gz, written by
fetch_reference_data.py).

For every multiple of 15 degrees the four samples around the crossing (two
before, two after) are interpolated with a cubic Lagrange polynomial in the
unwrapped longitude and the crossing is located by bisection to 1e-9 day.

Writes:
  data/imcce-terms-utc.tsv   date and time UTC (to 0.001 s), longitude, TT-UTC (s)
  data/imcce-terms-tt.tsv    date and time TT (to 0.001 s), longitude
  results-imcce.json         counts, checksums, agreement with the published
                             instants in doi-chieu/du-lieu/, and the sampling
                             sensitivity (4-day step instead of 2-day)

    python3 docs/paper/derive_imcce_terms.py

Standard library only.
"""

import glob
import gzip
import hashlib
import json
import math
import os
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
RAW = os.path.join(HERE, "data", "raw")


def dms(s):
    s = s.strip()
    sign = -1 if s.startswith("-") else 1
    d, m, sec = s.lstrip("+-").split()
    return sign * (int(d) + int(m) / 60.0 + float(sec) / 3600.0)


def load(scale):
    rows = []
    for path in sorted(glob.glob(os.path.join(RAW, "miriade-sun-%s-*.csv.gz" % scale)),
                       key=lambda p: int(p.rsplit("-", 1)[1].split(".")[0])):
        with gzip.open(path, "rt", encoding="utf-8") as f:
            for line in f:
                if not line[:1].isdigit():
                    continue
                c = line.split(",")
                rows.append((float(c[0]), float(c[1]), dms(c[2])))
    rows.sort()
    out, last = [], None
    for r in rows:  # drop duplicated epochs at the joins
        if last is None or r[0] > last + 1e-9:
            out.append(r)
            last = r[0]
    return out


def unwrap(vals):
    out, off, prev = [], 0.0, None
    for v in vals:
        if prev is not None and v + off < out[-1] - 180:
            off += 360
        out.append(v + off)
        prev = v
    return out


def lagrange(xs, ys, x):
    s = 0.0
    for i in range(4):
        t = ys[i]
        for j in range(4):
            if j != i:
                t *= (x - xs[j]) / (xs[i] - xs[j])
        s += t
    return s


def crossings(rows):
    """List of (jd, target_deg, tt_minus_utc) for every 15-degree crossing."""
    jds = [r[0] for r in rows]
    lon = unwrap([r[2] for r in rows])
    out = []
    for i in range(1, len(rows) - 2):
        a, b = lon[i], lon[i + 1]
        k = math.floor(a / 15.0) + 1
        target = 15.0 * k
        if not (a < target <= b):
            continue
        xs, ys = jds[i - 1:i + 3], lon[i - 1:i + 3]
        lo, hi = jds[i], jds[i + 1]
        for _ in range(60):
            mid = (lo + hi) / 2
            if lagrange(xs, ys, mid) < target:
                lo = mid
            else:
                hi = mid
        jd = (lo + hi) / 2
        dt = lagrange(xs, [r[1] for r in rows[i - 1:i + 3]], jd)
        out.append((jd, int(round(target)) % 360, dt))
    return out


def jd_to_civil(jd):
    z = math.floor(jd + 0.5)
    f = jd + 0.5 - z
    a = z
    if z >= 2299161:
        al = math.floor((z - 1867216.25) / 36524.25)
        a = z + 1 + al - math.floor(al / 4)
    b = a + 1524
    c = math.floor((b - 122.1) / 365.25)
    d = math.floor(365.25 * c)
    e = math.floor((b - d) / 30.6001)
    day = b - d - math.floor(30.6001 * e)
    month = e - 1 if e < 14 else e - 13
    year = c - 4716 if month > 2 else c - 4715
    ms = round(f * 86400000)
    if ms >= 86400000:  # carry
        return jd_to_civil(math.floor(jd + 0.5) + 0.5)
    return "%04d-%02d-%02d" % (year, month, day), ms


def fmt(jd):
    date, ms = jd_to_civil(jd)
    h, rem = divmod(ms, 3600000)
    m, rem = divmod(rem, 60000)
    return date, "%02d:%02d:%06.3f" % (h, m, rem / 1000.0)


def in_range(jd):
    return 2415020.5 <= jd < 2488434.5  # 1900-01-01 to 2101-01-01


def sha(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def main():
    res = OrderedDict()
    for scale in ("utc", "tt"):
        rows = load(scale)
        cr = [c for c in crossings(rows) if in_range(c[0])]
        half = [c for c in crossings(rows[::2]) if in_range(c[0])]
        halfmap = {(round(c[0]), c[1]): c[0] for c in half}
        diffs = []
        for jd, k, _ in cr:
            for key in ((round(jd), k), (round(jd) - 1, k), (round(jd) + 1, k)):
                if key in halfmap:
                    diffs.append(abs(halfmap[key] - jd) * 86400)
                    break
        path = os.path.join(HERE, "data", "imcce-terms-%s.tsv" % scale)
        with open(path, "w", encoding="utf-8") as f:
            f.write("# Solar-term instants derived from IMCCE Miriade (INPOP19), apparent geocentric\n"
                    "# ecliptic longitude of date, by derive_imcce_terms.py from data/raw/miriade-sun-%s-*.csv.gz.\n"
                    "# Time scale: %s.%s\n" % (scale, scale.upper(),
                                               " Column 4: TT-UTC reported by Miriade (s), interpolated."
                                               if scale == "utc" else ""))
            f.write("# date\ttime\tlongitude_deg%s\n" % ("\ttt_minus_utc_s" if scale == "utc" else ""))
            for jd, k, dt in cr:
                d, t = fmt(jd)
                f.write("%s\t%s\t%d%s\n" % (d, t, k, ("\t%.4f" % dt) if scale == "utc" else ""))
        res[scale] = OrderedDict([
            ("samples", len(rows)), ("first_sample_jd", rows[0][0]), ("last_sample_jd", rows[-1][0]),
            ("instants", len(cr)), ("file", os.path.relpath(path, ROOT)), ("sha256", sha(path)),
            ("four_day_step_max_change_s", round(max(diffs), 2)),
            ("four_day_step_matched", len(diffs)),
            # cubic Lagrange: error scales as h^4, so the 2-day error is about the
            # difference between the 4-day and 2-day results divided by (2^4 - 1)
            ("estimated_two_day_interpolation_error_s", round(max(diffs) / 15.0, 2)),
        ])
    # agreement with the instants published in doi-chieu (UTC, to the second)
    pub = {}
    for line in open(os.path.join(ROOT, "doi-chieu", "du-lieu", "imcce-tiet-khi-1900-2100.tsv"), encoding="utf-8"):
        if line.strip() and not line.startswith("#"):
            d, t, k = line.split()
            pub[(d[:4], int(k))] = (d, t)
    same, maxdiff = 0, 0.0
    for line in open(os.path.join(HERE, "data", "imcce-terms-utc.tsv"), encoding="utf-8"):
        if line.startswith("#"):
            continue
        d, t, k, _ = line.split("\t")
        p = pub.get((d[:4], int(k)))
        if not p:
            continue
        h, m, s = t.split(":")
        mine = int(h) * 3600 + int(m) * 60 + float(s)
        ph, pm, ps = (int(x) for x in p[1].split(":"))
        theirs = ph * 3600 + pm * 60 + ps
        dd = (mine - theirs) if p[0] == d else None
        if dd is not None:
            maxdiff = max(maxdiff, abs(dd))
            if abs(dd) <= 0.5 + 1e-6:
                same += 1
    res["agreement_with_published_utc_instants"] = OrderedDict([
        ("published", len(pub)), ("equal_to_the_second", same), ("max_abs_difference_s", round(maxdiff, 3))])
    res["raw_files"] = OrderedDict(
        (os.path.basename(p), sha(p)) for p in sorted(glob.glob(os.path.join(RAW, "miriade-sun-*.csv.gz"))))
    with open(os.path.join(HERE, "results-imcce.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, indent=1)
        f.write("\n")
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
