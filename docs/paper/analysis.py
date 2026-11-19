#!/usr/bin/env python3
"""Every number and figure of the paper "Computing the Vietnamese lunisolar
calendar" (docs/paper/paper.md), recomputed from public data.

Inputs
  --root <tree>   the library tree whose engine is evaluated (default: the tree
                  that contains this script). The release run uses a clean
                  checkout of the release tag (see build.sh).
  <tree>/python/nhatnguyet          Python port of the engine
  <tree>/ca-kiem/am-lich*.json      shared test vectors (engine version)
  <tree>/history/tet-1900-2100.csv  history dataset
  data/ (next to this script):
    imcce-terms-utc.tsv, imcce-terms-tt.tsv   derived by derive_imcce_terms.py
    nasa-new-moons-1901-2100.tsv              NASA GSFC new moons, UT
    usno-equinox-solstice-1900-2100.tsv       USNO equinoxes and solstices, UT
    de440-new-moons-1901-2100.tsv             derived by de440_new_moons.py
    vsop-truncation-at-terms.tsv              derived by vsop_budget.py
    delta-t-skyfield.tsv                      written by delta_t_forecast.py
    raw/iers-eopc04.txt.gz, raw/iers-leap-second.dat, raw/miriade-sun-utc-*.csv.gz
    ljs/ket-qua.json, ljs/khac-ngay-am.csv    output of doi-chieu/chay.mjs
                                              run on the same tree

Output: results.json and, when matplotlib is installed, figures/*.svg, *.png.

The working-tree state recorded in results.json (versions.tree_dirty,
tree_commit) is read from NN_TREE_DIRTY and NN_TREE_COMMIT when reproduce.sh
sets them, i.e. before doi-chieu/chay.mjs rewrites its output files; run
directly, the script asks git.

    python3 docs/paper/analysis.py [--root <tree>] [--no-figures]

The calendar computation uses only the Python standard library.
"""

import argparse
import bisect
import csv
import glob
import gzip
import hashlib
import json
import math
import os
import random
import re
import subprocess
import sys
from collections import Counter, OrderedDict
from functools import lru_cache

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")

ap = argparse.ArgumentParser()
ap.add_argument("--root", default=os.path.normpath(os.path.join(HERE, "..", "..")))
ap.add_argument("--no-figures", action="store_true")
ARGS = ap.parse_args()
ROOT = os.path.abspath(ARGS.root)
sys.path.insert(0, os.path.join(ROOT, "python"))

from nhatnguyet import am_lich as al  # noqa: E402
from nhatnguyet import PHIEN_BAN_DONG_CO, __version__  # noqa: E402
from nhatnguyet import _mat_troi_bang as tb  # noqa: E402

sys.path.insert(0, os.path.join(ROOT, "history"))
import generate_tet as gt  # noqa: E402  (ExactCalendar: exact containment)

TZ_VN, TZ_CN = 7.0, 8.0
TZ_BJ = (116 + 25 / 60.0) / 15.0          # Beijing meridian, 116 deg 25 min E
MIN_PER_DAY = 1440.0
MEAN_MOTION_AS = 360 * 3600 / 365.2422     # arcsec of solar longitude per day
ORIG_NEW_MOON = al.new_moon


# ---------------------------------------------------------------- input helpers

def read_tsv(path):
    with open(path, encoding="utf-8") as f:
        return [l.rstrip("\n").split("\t") for l in f if l.strip() and not l.startswith("#")]


def jd_of(date, time):
    """Julian date of a civil date and time (any scale)."""
    y, m, d = (int(x) for x in date.split("-"))
    p = time.split(":")
    s = float(p[2]) if len(p) > 2 else 0.0
    return al.jd_from_date(d, m, y) - 0.5 + (int(p[0]) * 3600 + int(p[1]) * 60 + s) / 86400.0


def civil_day(jd, tz):
    return int(math.floor(jd + 0.5 + tz / 24.0))


def min_to_midnight(jd, tz):
    m = ((jd + 0.5 + tz / 24.0) % 1.0) * MIN_PER_DAY
    return min(m, MIN_PER_DAY - m)


def iso(jdn):
    d = al.jd_to_date(jdn)
    return "%04d-%02d-%02d" % (d["year"], d["month"], d["day"])


def lunar(jdn, tz):
    """Lunar date: the engine at UTC+7; at other offsets the rule with exact
    containment (history/generate_tet.py), since the engine's sector test is
    verified only at UTC+7 (and UTC+8, Section 6.5)."""
    if tz == TZ_VN:
        d = al.jd_to_date(jdn)
        return al.solar_to_lunar(d["day"], d["month"], d["year"], tz)
    return gt.exact(tz).lunar(jdn)


def lunar_engine(jdn, tz):
    d = al.jd_to_date(jdn)
    return al.solar_to_lunar(d["day"], d["month"], d["year"], tz)


def year_of(jd):
    return al.jd_to_date(int(math.floor(jd + 0.5)))["year"]


# ---------------------------------------------------------------- statistics

def nearest_rank(s, pct):
    return s[max(int(math.ceil(pct / 100.0 * len(s))) - 1, 0)]


def r(x, d):
    return round(x, d) + 0.0


def stats(e, d=2):
    n = len(e)
    a = sorted(abs(x) for x in e)
    med = a[n // 2] if n % 2 else (a[n // 2 - 1] + a[n // 2]) / 2
    return OrderedDict([
        ("n", n), ("mean", r(sum(e) / n, d)), ("mae", r(sum(a) / n, d)),
        ("rmse", r(math.sqrt(sum(x * x for x in e) / n), d)), ("median_abs", r(med, d)),
        ("p95_abs", r(nearest_rank(a, 95), d)), ("p99_abs", r(nearest_rank(a, 99), d)),
        ("min", r(min(e), d)), ("max", r(max(e), d)), ("max_abs", r(a[-1], d)),
        ("n_negative", sum(1 for x in e if x < 0))])


PERIODS4 = ((1900, 1949), (1950, 1999), (2000, 2049), (2050, 2100))


def by_period(e, years, d):
    out = OrderedDict()
    for a, b in PERIODS4:
        s = [x for x, y in zip(e, years) if a <= y <= b]
        if s:
            out["%d-%d" % (a, b)] = OrderedDict([("n", len(s)), ("mean", r(sum(s) / len(s), d)),
                                                 ("mae", r(sum(abs(x) for x in s) / len(s), d))])
    return out


def linfit(xs, ys):
    """Least squares y = a + b x; returns a, b, residual RMS, standard error of b."""
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxx = sum((x - mx) ** 2 for x in xs)
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx
    a = my - b * mx
    res = [y - a - b * x for x, y in zip(xs, ys)]
    rms = math.sqrt(sum(v * v for v in res) / n)
    se = math.sqrt(sum(v * v for v in res) / (n - 2) / sxx)
    return a, b, rms, se, res


def trend(e, years):
    """Linear trend of an error series against time (centuries from 2000)."""
    xs = [(y - 2000) / 100.0 for y in years]
    a, b, rms, se, _ = linfit(xs, e)
    return OrderedDict([("at_2000", r(a, 2)), ("per_century", r(b, 2)), ("per_century_se", r(se, 2)),
                        ("residual_rms", r(rms, 2))])


def block_sensitivity(e, years, blocks=(1, 10, 25, 50), n=2000, seed=20261119):
    """95% percentile interval of the mean under a block bootstrap, for several
    block lengths. Reported as a sensitivity analysis only: the 4,824 instants
    are the whole population of 1900-2100, not a sample."""
    out = OrderedDict()
    for blk in blocks:
        groups = OrderedDict()
        for x, y in zip(e, years):
            groups.setdefault((y - 1900) // blk, []).append(x)
        keys = list(groups)
        rng = random.Random(seed)
        means = []
        for _ in range(n):
            s = []
            for _ in keys:
                s.extend(groups[keys[rng.randrange(len(keys))]])
            means.append(sum(s) / len(s))
        means.sort()
        out["%d" % blk] = [r(means[int(0.025 * n)], 2), r(means[int(0.975 * n) - 1], 2)]
    return OrderedDict([("resamples", n), ("seed", seed), ("mean_interval_by_block_years", out)])


# ---------------------------------------------------------------- engine pieces

TERMS = {tk["kinhDo"]: tk for tk in al.all_tiet_khi()}
NEWTON_STEPS = []


def term_ut_unrounded(lon, year):
    """Instant (JD, UT) of the engine's solar term, before rounding: the same
    Newton iteration as am_lich._moc_tiet_khi_dem."""
    tk, target = TERMS[lon], float(lon)

    def off(jd):
        d = al.kinh_do_mat_troi_ut(jd - TZ_VN / 24) - target
        return (d + 180) % 360 - 180

    jd = float(al.jd_from_date(20, 3, year)) + tk["index"] * 365.2422 / 24
    if tk["index"] >= 19:
        jd -= 365.2422
    for i in range(30):
        step = off(jd) / (360 / 365.2422)
        jd -= step
        if abs(step) * 1440 < 0.001:
            NEWTON_STEPS.append(i + 1)
            break
    return jd - TZ_VN / 24


def term_ut_rounded(lon, year):
    m = al.moc_tiet_khi(TERMS[lon], year)
    n = m["ngay"]
    return al.jd_from_date(n["day"], n["month"], n["year"]) - 0.5 + (m["gio"] * 60 + m["phut"] - TZ_VN * 60) / MIN_PER_DAY


def term_tt(lon, guess):
    """Instant (JDE, TT) at which the engine's apparent longitude reaches lon."""
    jd = guess
    for _ in range(30):
        d = (al.kinh_do_bieu_kien_tt(jd) - lon + 180) % 360 - 180
        step = d / (360 / 365.2422)
        jd -= step
        if abs(step) * 86400 < 1e-4:
            break
    return jd


def dk_days(k):
    """Embedded Delta T of the new-moon series (eq. 10), days."""
    t = k / 1236.85
    return -0.000278 + 0.000265 * t + 0.000262 * t * t


def series_tt(k):
    """The series' instant before its Delta T is subtracted (JDE_k + C)."""
    return ORIG_NEW_MOON(k) + dk_days(k)


def em_dt_days(jd):
    return al.delta_t_giay(al.nam_thap_phan(jd)) / 86400.0


def new_moon_em(k):
    """Counterfactual: the same series with Espenak-Meeus Delta T."""
    s = series_tt(k)
    return s - em_dt_days(s)


def k_of(jd):
    return round((jd - al._SOC_GOC) / al._THANG_SOC)


# ---------------------------------------------------------------- 1. solar terms

def solar_terms(imcce_utc, imcce_tt, usno, trunc):
    out = OrderedDict()
    ut_e, rnd_e, yrs, tt_e, ddt, closest = [], [], [], [], [], []
    wrong_day = 0
    for (d, t, k, dtu), (dtt, ttt, k2) in zip(imcce_utc, imcce_tt):
        assert k == k2
        ref_ut, ref_tt, lon = jd_of(d, t), jd_of(dtt, ttt), int(k)
        y = int(d[:4])
        eng_ut = term_ut_unrounded(lon, y)
        e = (eng_ut - ref_ut) * 86400
        q = term_ut_rounded(lon, y)
        ut_e.append(e)
        rnd_e.append((q - ref_ut) * MIN_PER_DAY)
        yrs.append(y)
        eng_tt = term_tt(lon, ref_tt)
        tt_e.append((eng_tt - ref_tt) * 86400)
        ddt.append(al.delta_t_giay(al.nam_thap_phan(ref_ut)) - float(dtu))  # engine minus IMCCE Delta T
        if civil_day(q, TZ_VN) != civil_day(ref_ut, TZ_VN):
            wrong_day += 1
        closest.append((min_to_midnight(ref_ut, TZ_VN), d, t, lon, e, ref_ut))
    out["ut_unrounded_seconds"] = stats(ut_e, 1)
    out["ut_published_minutes"] = stats(rnd_e, 2)
    out["published_over_1_min"] = sum(1 for e in rnd_e if abs(round(e, 6)) > 1)
    out["civil_day_differs_utc7"] = wrong_day
    closest.sort()
    c = closest[0]
    out["within_1_min_of_hanoi_midnight"] = sum(1 for x in closest if x[0] < 1)
    out["within_5_min_of_hanoi_midnight"] = sum(1 for x in closest if x[0] < 5)
    eng = c[5] + c[4] / 86400.0

    def signed_to_midnight(jd):  # seconds before (+) or after (-) the nearest Hanoi midnight
        f = ((jd + 0.5 + TZ_VN / 24.0) % 1.0) * 86400.0
        return 86400.0 - f if f > 43200 else -f
    out["closest_to_hanoi_midnight"] = OrderedDict([
        ("imcce_utc", "%s %s" % (c[1], c[2][:10])), ("longitude", c[3]),
        ("seconds_to_midnight", r(c[0] * 60, 2)), ("engine_minus_imcce_s", r(c[4], 2)),
        ("engine_seconds_before_midnight", r(signed_to_midnight(eng), 2)),
        ("imcce_seconds_before_midnight", r(signed_to_midnight(c[5]), 2))])
    out["ut_unrounded_by_period"] = by_period(ut_e, yrs, 1)
    out["ut_trend"] = trend(ut_e, yrs)
    out["ut_block_sensitivity"] = block_sensitivity(ut_e, yrs)
    # TT decomposition
    out["tt_seconds"] = stats(tt_e, 1)
    out["tt_by_period"] = by_period(tt_e, yrs, 1)
    out["tt_trend"] = trend(tt_e, yrs)
    out["delta_t_engine_minus_imcce_s"] = stats(ddt, 1)
    out["delta_t_engine_minus_imcce_by_period"] = by_period(ddt, yrs, 1)
    recon = [a - (b - c) for a, b, c in zip(ut_e, tt_e, ddt)]
    out["decomposition_max_abs_residual_s"] = r(max(abs(x) for x in recon), 2)
    # truncation removed
    tr = {(row[0], row[2]): float(row[4]) for row in trunc}
    tt_trunc = [e - tr[(dtt, k)] for e, (dtt, _, k) in zip(tt_e, imcce_tt)]
    out["tt_truncation_removed_seconds"] = stats(tt_trunc, 1)
    out["tt_truncation_removed_trend"] = trend(tt_trunc, yrs)
    # precession hypothesis: IAU 1976 vs P03 rate of general precession in
    # longitude, 5029.0966 - 5028.796195 = 0.300405 arcsec per century
    rate = 5029.0966 - 5028.796195
    tt_prec = []
    for e, (dtt, ttt, k) in zip(tt_trunc, imcce_tt):
        tcy = (jd_of(dtt, ttt) - 2451545.0) / 36525.0
        dl = rate * tcy                      # engine longitude minus P03-based longitude, arcsec
        tt_prec.append(e + dl / MEAN_MOTION_AS * 86400)
    out["precession_rate_difference_arcsec_per_century"] = r(rate, 6)
    out["precession_equivalent_s_per_century"] = r(rate / MEAN_MOTION_AS * 86400, 2)
    out["tt_corrected_seconds"] = stats(tt_prec, 1)
    out["tt_corrected_by_period"] = by_period(tt_prec, yrs, 1)
    out["tt_corrected_trend"] = trend(tt_prec, yrs)
    # 18.6-year term: fit a + b*T + c*sin(Omega) + d*cos(Omega) to the corrected residual
    rows = []
    for e, (dtt, ttt, _k) in zip(tt_prec, imcce_tt):
        tcy = (jd_of(dtt, ttt) - 2451545.0) / 36525.0
        om = math.radians(125.04452 - 1934.136261 * tcy)
        rows.append((1.0, tcy, math.sin(om), math.cos(om), e))
    coef = lstsq([row[:4] for row in rows], [row[4] for row in rows])
    resid = [row[4] - sum(c * v for c, v in zip(coef, row[:4])) for row in rows]
    out["node_term_amplitude_s"] = r(math.hypot(coef[2], coef[3]), 2)
    out["node_fit_residual_rms_s"] = r(math.sqrt(sum(v * v for v in resid) / len(resid)), 2)
    # USNO
    u_raw, u_rnd, iu = [], [], []
    imap = {(d[:4], int(k)): jd_of(d, t) for d, t, k, _ in imcce_utc}
    uy = []
    for d, t, k in usno:
        ref = jd_of(d, t)
        y, k = int(d[:4]), int(k)
        u_raw.append((term_ut_unrounded(k, y) - ref) * MIN_PER_DAY)
        u_rnd.append((term_ut_rounded(k, y) - ref) * MIN_PER_DAY)
        iu.append((imap[(d[:4], k)] - ref) * MIN_PER_DAY)
        uy.append(y)
    out["usno_unrounded_minutes"] = stats(u_raw, 2)
    out["usno_published_minutes"] = stats(u_rnd, 2)
    big = [y for e, y in zip(u_rnd, uy) if abs(round(e, 6)) >= 2]
    out["usno_published_2_min"] = OrderedDict([("count", len(big)), ("first_year", min(big) if big else None),
                                               ("last_year", max(big) if big else None)])
    out["imcce_minus_usno_minutes"] = stats(iu, 2)
    out["imcce_minus_usno_by_period"] = by_period(iu, uy, 2)
    out["imcce_minus_usno_max_abs_before_2080"] = r(max(abs(x) for x, y in zip(iu, uy) if y < 2080), 2)
    out["imcce_minus_usno_max_abs_from_2080"] = r(max(abs(x) for x, y in zip(iu, uy) if y >= 2080), 2)
    out["newton_max_steps"] = max(NEWTON_STEPS)
    series = OrderedDict([("years", yrs), ("ut", ut_e), ("tt", tt_e), ("tt_corrected", tt_prec),
                          ("published", rnd_e), ("ddt", ddt)])
    return out, series


def lstsq(a, b):
    """Normal equations for a small dense least squares problem."""
    n = len(a[0])
    m = [[sum(row[i] * row[j] for row in a) for j in range(n)] for i in range(n)]
    v = [sum(row[i] * y for row, y in zip(a, b)) for i in range(n)]
    for i in range(n):  # Gauss-Jordan
        p = max(range(i, n), key=lambda q: abs(m[q][i]))
        m[i], m[p], v[i], v[p] = m[p], m[i], v[p], v[i]
        for q in range(n):
            if q != i:
                f = m[q][i] / m[i][i]
                m[q] = [x - f * y for x, y in zip(m[q], m[i])]
                v[q] -= f * v[i]
    return [v[i] / m[i][i] for i in range(n)]


# ---------------------------------------------------------------- 2. Delta T

def iers_delta_t():
    """Observed Delta T = 32.184 + (TAI-UTC) - (UT1-UTC) on 1 January of each
    year 1973-2026 from IERS EOP 20 C04 and the Bulletin C leap second table."""
    leaps = []
    for line in open(os.path.join(DATA, "raw", "iers-leap-second.dat"), encoding="ascii"):
        if line.strip() and not line.startswith("#"):
            p = line.split()
            leaps.append((float(p[0]), float(p[4])))  # MJD, TAI-UTC
    ut1 = {}
    with gzip.open(os.path.join(DATA, "raw", "iers-eopc04.txt.gz"), "rt", encoding="ascii") as f:
        for line in f:
            if line.startswith("#") or not line.strip():
                continue
            p = line.split()
            if p[1] == "1" and p[2] == "1":
                ut1[int(p[0])] = (float(p[4]), float(p[7]))
    out = OrderedDict()
    for y in sorted(ut1):
        mjd, d = ut1[y]
        tai = [v for m, v in leaps if m <= mjd]
        if y < 1973 or not tai:
            continue
        out[str(y)] = r(32.184 + tai[-1] - d, 2)
    return out


def miriade_delta_t():
    """TT-UTC reported by Miriade at the sample nearest to 1 January of each year."""
    vals = {}
    for p in sorted(glob.glob(os.path.join(DATA, "raw", "miriade-sun-utc-*.csv.gz"))):
        with gzip.open(p, "rt", encoding="utf-8") as f:
            for line in f:
                if line[:1].isdigit():
                    c = line.split(",")
                    vals[float(c[0])] = float(c[1])
    keys = sorted(vals)
    out = OrderedDict()
    for y in range(1900, 2101):
        j = al.jd_from_date(1, 1, y) - 0.5
        best = (min(keys, key=lambda x: abs(x - j))
                if y % 5 == 0 or 1973 <= y <= 2026 or y in (2072, 2085) else None)
        if best is not None:
            out[str(y)] = r(vals[best], 2)
    return out


def skyfield_delta_t():
    """Delta T from Skyfield's built-in model (delta_t_forecast.py): a grid
    by decimal year and a value at each DE440 new moon, keyed by the NASA row."""
    grid, nm, head = OrderedDict(), {}, []
    with open(os.path.join(DATA, "delta-t-skyfield.tsv"), encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):
                head.append(line)
                continue
            kind, key, v = line.rstrip("\n").split("\t")
            (grid if kind == "grid" else nm)[key] = float(v)
    version = re.search(r"Skyfield (\S+),", head[0]).group(1)
    return grid, nm, version


SKY_GRID, SKY_NM, SKY_VERSION = skyfield_delta_t()


def sky_dt(year):
    """Skyfield Delta T at a decimal year, linear between half-year grid points."""
    a = math.floor(year * 2) / 2
    b = a + 0.5
    va, vb = SKY_GRID["%.1f" % a], SKY_GRID.get("%.1f" % b, SKY_GRID["%.1f" % a])
    return va + (vb - va) * (year - a) / 0.5


def delta_t_section():
    obs = iers_delta_t()
    mir = miriade_delta_t()
    table = OrderedDict()
    for y in (1900, 1950, 2000, 2025, 2050, 2072, 2085, 2100):
        k = round((al.jd_from_date(1, 7, y) - al._SOC_GOC) / al._THANG_SOC)
        table[str(y)] = OrderedDict([
            ("series_dk", r(dk_days(k) * 86400, 1)), ("espenak_meeus", r(al.delta_t_giay(y + 0.5), 1)),
            ("miriade", mir.get(str(y))), ("skyfield", r(sky_dt(y + 0.5), 1)), ("observed", obs.get(str(y)))])
    # After which year is the series' delta_k closer to the Skyfield prediction
    # than Espenak-Meeus is (for every later year)?
    closer = []
    for y in range(2026, 2101):
        k = (al.jd_from_date(1, 7, y) - al._SOC_GOC) / al._THANG_SOC
        sk = sky_dt(y + 0.5)
        closer.append((y, abs(dk_days(k) * 86400 - sk) < abs(al.delta_t_giay(y + 0.5) - sk)))
    cross = next((y for y, _ in closer if all(c for yy, c in closer if yy >= y)), None)
    sky_obs = [sky_dt(float(y)) - obs[y] for y in obs if int(y) <= 2025]
    common = [y for y in obs if y in mir and int(y) <= 2025]
    em_obs = [al.delta_t_giay(float(y)) - obs[y] for y in common]
    mi_obs = [mir[y] - obs[y] for y in common]
    k25 = round((al.jd_from_date(1, 1, 2025) - al._SOC_GOC) / al._THANG_SOC)
    return OrderedDict([
        ("table", table), ("observed", obs), ("miriade", mir),
        ("compare_years", "%s-%s" % (common[0], common[-1])),
        ("espenak_meeus_minus_observed", OrderedDict([("mean", r(sum(em_obs) / len(em_obs), 2)),
                                                       ("max_abs", r(max(abs(x) for x in em_obs), 2)),
                                                       ("at_2025", r(al.delta_t_giay(2025.0) - obs["2025"], 2))])),
        ("miriade_minus_observed", OrderedDict([("mean", r(sum(mi_obs) / len(mi_obs), 2)),
                                                ("max_abs", r(max(abs(x) for x in mi_obs), 2))])),
        ("series_dk_minus_observed_2025", r(dk_days(k25) * 86400 - obs["2025"], 1)),
        ("skyfield_version", SKY_VERSION),
        ("skyfield_minus_observed_max_abs_1973_2025", r(max(abs(x) for x in sky_obs), 2)),
        ("series_dk_closer_to_skyfield_than_em_from", cross),
        ("espenak_meeus_minus_skyfield", OrderedDict(
            (str(y), r(al.delta_t_giay(y + 0.5) - sky_dt(y + 0.5), 1)) for y in (2050, 2072, 2085, 2100))),
    ])


# ---------------------------------------------------------------- 3. new moons

def nasa_delta_t():
    """NASA's Delta T column (to the minute) per year, from the raw pages."""
    out = {}
    for p in sorted(glob.glob(os.path.join(DATA, "raw", "nasa-phases-*.html.gz"))):
        with gzip.open(p, "rt", encoding="latin-1") as f:
            for line in f:
                m = re.search(r"\b(\d{4})\b.*?(\d\d)h(\d\d)m\s*$", re.sub(r"<[^>]+>", "", line).rstrip())
                if m:
                    out[int(m.group(1))] = int(m.group(2)) * 60 + int(m.group(3))
    return out


def new_moons(nasa, de440):
    out = OrderedDict()
    pub, em, ser_tt, nasa_vs_de, dk_em, yrs = [], [], [], [], [], []
    ok_pub = ok_em = ok_pub_de = ok_em_de = 0
    mism_pub, mism_em, mism_pub_de, mism_em_de = [], [], [], []
    detail = []
    for (d, t), (_d2, _t2, jtt) in zip(nasa, de440):
        ref = jd_of(d, t)
        de_tt = float(jtt)
        de_ut = de_tt - em_dt_days(de_tt)
        k = k_of(ref)
        n_pub, n_em, s = ORIG_NEW_MOON(k), new_moon_em(k), series_tt(k)
        y = int(d[:4])
        yrs.append(y)
        pub.append((n_pub - ref) * MIN_PER_DAY)
        em.append((n_em - ref) * MIN_PER_DAY)
        ser_tt.append((s - de_tt) * MIN_PER_DAY)
        nasa_vs_de.append((ref - de_ut) * MIN_PER_DAY)
        dk_em.append((em_dt_days(s) - dk_days(k)) * 86400)
        for (val, okname, lst, against) in ((n_pub, "pub", mism_pub, ref), (n_em, "em", mism_em, ref),
                                             (n_pub, "pubde", mism_pub_de, de_ut), (n_em, "emde", mism_em_de, de_ut)):
            if civil_day(val, TZ_VN) == civil_day(against, TZ_VN):
                if okname == "pub":
                    ok_pub += 1
                elif okname == "em":
                    ok_em += 1
                elif okname == "pubde":
                    ok_pub_de += 1
                else:
                    ok_em_de += 1
            else:
                lst.append(OrderedDict([
                    ("nasa_ut", "%s %s" % (d, t)), ("reference_hanoi_day", iso(civil_day(against, TZ_VN))),
                    ("engine_hanoi_day", iso(civil_day(val, TZ_VN))),
                    ("engine_minus_reference_min", r((val - against) * MIN_PER_DAY, 2)),
                    ("series_minus_de440_tt_s", r((s - de_tt) * 86400, 1)),
                    ("espenak_meeus_minus_dk_s", r((em_dt_days(s) - dk_days(k)) * 86400, 1)),
                    ("de440_hanoi_time", "%s" % hanoi_time(de_ut))]))
    out["published_vs_nasa_minutes"] = stats(pub, 2)
    out["published_vs_nasa_by_period"] = by_period(pub, yrs, 2)
    out["published_first_day_on_nasa_day"] = ok_pub
    out["published_mismatches_vs_nasa"] = mism_pub
    out["series_tt_vs_de440_minutes"] = stats(ser_tt, 2)
    out["series_tt_vs_de440_by_period"] = by_period(ser_tt, yrs, 2)
    out["espenak_meeus_minus_dk_seconds"] = stats(dk_em, 1)
    out["espenak_meeus_minus_dk_by_period"] = by_period(dk_em, yrs, 1)
    out["nasa_minus_de440_ut_minutes"] = stats(nasa_vs_de, 2)
    out["nasa_minus_de440_beyond_rounding_s"] = r((max(abs(x) for x in nasa_vs_de) - 0.5) * 60, 0)
    out["harmonised_vs_nasa_minutes"] = stats(em, 2)
    out["harmonised_vs_nasa_by_period"] = by_period(em, yrs, 2)
    out["harmonised_first_day_on_nasa_day"] = ok_em
    out["harmonised_mismatches_vs_nasa"] = mism_em
    out["published_first_day_on_de440_day"] = ok_pub_de
    out["published_mismatches_vs_de440"] = mism_pub_de
    out["harmonised_first_day_on_de440_day"] = ok_em_de
    out["harmonised_mismatches_vs_de440"] = mism_em_de
    out["n"] = len(pub)
    # NASA's own Delta T column versus Espenak-Meeus (both in minutes)
    nd = nasa_delta_t()
    diffs = [abs(nd[y] - round(al.delta_t_giay(y + 0.5) / 60.0)) for y in nd if 1901 <= y <= 2100]
    out["nasa_delta_t_years"] = len(diffs)
    out["nasa_delta_t_rounded_minutes_differ_from_em"] = sum(1 for x in diffs if x > 0)
    out["nasa_within_5_min_of_hanoi_midnight"] = sum(1 for d, t in nasa if min_to_midnight(jd_of(d, t), TZ_VN) < 5)
    out["nasa_within_5_min_of_beijing_midnight"] = sum(1 for d, t in nasa if min_to_midnight(jd_of(d, t), TZ_CN) < 5)
    out["nasa_16_to_17_ut"] = sum(1 for d, t in nasa if t.startswith("16:"))
    series = OrderedDict([("years", yrs), ("published", pub), ("series_tt", ser_tt), ("dk_em", dk_em)])
    return out, series


def de440_two_delta_t(nasa, de440):
    """DE440 new moons converted to UT with two Delta T models: Espenak-Meeus
    and Skyfield's (observed values to 2026, extrapolated after). Months whose
    first day depends on the reference or on the Delta T model."""
    rows = []
    for (d, t), (_d2, _t2, jtt) in zip(nasa, de440):
        de_tt = float(jtt)
        sky = SKY_NM["%s %s" % (d, t)]
        k = k_of(jd_of(d, t))
        rows.append(OrderedDict([
            ("nasa_ut", "%s %s" % (d, t)), ("year", int(d[:4])),
            ("nasa", jd_of(d, t)), ("de_em", de_tt - em_dt_days(de_tt)), ("de_sky", de_tt - sky / 86400.0),
            ("pub", ORIG_NEW_MOON(k)), ("harm", new_moon_em(k)),
            ("series_minus_de440_tt_s", r((series_tt(k) - de_tt) * 86400, 1)),
            ("espenak_meeus_minus_dk_s", r((em_dt_days(series_tt(k)) - dk_days(k)) * 86400, 1)),
            ("skyfield_minus_dk_s", r(sky - dk_days(k) * 86400, 1)),
            ("espenak_meeus_dt_s", r(em_dt_days(de_tt) * 86400, 1)), ("skyfield_dt_s", r(sky, 1))]))
    day = lambda jd: civil_day(jd, TZ_VN)  # noqa: E731
    out = OrderedDict()
    past = [x for x in rows if x["year"] <= 2025]
    out["observed_era_years"] = "1901-2025"
    out["observed_era_events"] = len(past)
    for name in ("pub", "harm"):
        out["%s_mismatches_vs_de440_skyfield_1901_2025" % name] = [
            x["nasa_ut"] for x in past if day(x[name]) != day(x["de_sky"])]
        out["%s_mismatches_vs_de440_skyfield_2026_2100" % name] = [
            x["nasa_ut"] for x in rows if x["year"] > 2025 and day(x[name]) != day(x["de_sky"])]
    out["de440_day_depends_on_delta_t_model"] = [x["nasa_ut"] for x in rows if day(x["de_em"]) != day(x["de_sky"])]
    edge = []
    for x in rows:
        days = {day(x[k]) for k in ("nasa", "de_em", "de_sky", "pub", "harm")}
        if len(days) == 1 and not x["nasa_ut"].startswith("2054-05"):
            continue
        if x["year"] <= 2025:
            verdict = "engine error" if day(x["pub"]) != day(x["de_sky"]) else "engine agrees with DE440"
        elif day(x["de_em"]) != day(x["de_sky"]):
            verdict = "DE440 day depends on the ΔT model"
        else:
            verdict = ("engine on the DE440 day under both ΔT models" if day(x["pub"]) == day(x["de_em"])
                       else "engine off the DE440 day under both ΔT models")

        def to_midnight(jd):  # seconds before (+) or after (-) the nearest Hanoi midnight
            f = ((jd + 0.5 + TZ_VN / 24.0) % 1.0) * 86400.0
            return r(86400.0 - f if f > 43200 else -f, 0)
        edge.append(OrderedDict([
            ("nasa_ut", x["nasa_ut"]), ("nasa_hanoi_day", iso(day(x["nasa"]))),
            ("de440_hanoi_espenak_meeus", hanoi_time(x["de_em"])), ("de440_hanoi_skyfield", hanoi_time(x["de_sky"])),
            ("engine_hanoi_day", iso(day(x["pub"]))), ("harmonised_hanoi_day", iso(day(x["harm"]))),
            ("engine_minus_de440_skyfield_min", r((x["pub"] - x["de_sky"]) * MIN_PER_DAY, 2)),
            ("engine_minus_de440_em_min", r((x["pub"] - x["de_em"]) * MIN_PER_DAY, 2)),
            ("series_minus_de440_tt_s", x["series_minus_de440_tt_s"]),
            ("espenak_meeus_minus_dk_s", x["espenak_meeus_minus_dk_s"]),
            ("skyfield_minus_dk_s", x["skyfield_minus_dk_s"]),
            ("espenak_meeus_dt_s", x["espenak_meeus_dt_s"]), ("skyfield_dt_s", x["skyfield_dt_s"]),
            ("de440_s_before_midnight_em", to_midnight(x["de_em"])),
            ("de440_s_before_midnight_skyfield", to_midnight(x["de_sky"])),
            ("verdict", verdict)]))
    out["edge_months"] = edge
    out["edge_by_month"] = OrderedDict((e["nasa_ut"][:7], e) for e in edge)
    return out


def hanoi_time(jd):
    j = jd + 0.5 + TZ_VN / 24
    s = round((j % 1.0) * 86400)
    return "%s %02d:%02d:%02d" % (iso(int(math.floor(j))), s // 3600 % 24, s // 60 % 60, s % 60)


# ---------------------------------------------------------------- 4. counterfactual: series with Espenak-Meeus Delta T

@lru_cache(maxsize=None)
def tet(year, tz):
    if tz != TZ_VN:
        return gt.exact(tz).tet(year)
    d, _ = al.lunar_to_solar(1, 1, year, False, tz)
    return al.jd_from_date(d["day"], d["month"], d["year"])


@lru_cache(maxsize=None)
def leap_month(year, tz):
    if tz != TZ_VN:
        return gt.exact(tz).leap_month(year)
    for m in range(1, 13):
        a, ok = al.lunar_to_solar(1, m, year, True, tz)
        if ok and a != al.lunar_to_solar(1, m, year, False, tz)[0]:
            return m
    return 0


def calendar_snapshot(tz):
    first, last = al.jd_from_date(1, 1, 1900), al.jd_from_date(31, 12, 2100)
    days = [lunar(j, tz) for j in range(first, last + 1)]
    starts = [first + i for i, x in enumerate(days) if x["day"] == 1]
    return days, starts


def counterfactual_em():
    tet.cache_clear()
    leap_month.cache_clear()
    base_days, base_starts = calendar_snapshot(TZ_VN)
    base_tet = {y: tet(y, TZ_VN) for y in range(1900, 2101)}
    base_leap = {y: leap_month(y, TZ_VN) for y in range(1900, 2101)}
    al.new_moon = new_moon_em
    try:
        tet.cache_clear()
        leap_month.cache_clear()
        days, starts = calendar_snapshot(TZ_VN)
        em_tet = {y: tet(y, TZ_VN) for y in range(1900, 2101)}
        em_leap = {y: leap_month(y, TZ_VN) for y in range(1900, 2101)}
    finally:
        al.new_moon = ORIG_NEW_MOON
        tet.cache_clear()
        leap_month.cache_clear()
    diff_days = sum(1 for a, b in zip(base_days, days) if a != b)
    moved = sorted(set(base_starts) ^ set(starts))
    return OrderedDict([
        ("days_differ", diff_days),
        ("month_starts_published", len(base_starts)), ("month_starts_counterfactual", len(starts)),
        ("month_starts_moved", len([s for s in base_starts if s not in set(starts)])),
        ("moved_month_starts", [iso(s) for s in sorted(set(base_starts) - set(starts))]),
        ("tet_years_differ", [y for y in base_tet if base_tet[y] != em_tet[y]]),
        ("leap_years_differ", [y for y in base_leap if base_leap[y] != em_leap[y]]),
    ])


# ---------------------------------------------------------------- 5. rebuilt calendar

def rebuild(nasa, major, tz, near_nm=5.0, near_mt=30.0):
    nm = [jd_of(d, t) for d, t in nasa]
    nm_day = [civil_day(p, tz) for p in nm]
    m11 = []
    for p, k in major:
        if k != 270:
            continue
        dd = civil_day(p, tz)
        for i in range(len(nm_day) - 1):
            if nm_day[i] <= dd < nm_day[i + 1]:
                m11.append(i)
                break
    months = []
    for a, b in zip(m11, m11[1:]):
        assert b - a in (12, 13)
        risky = False
        for p, _ in major:
            dd = civil_day(p, tz)
            if dd < nm_day[a] - 1 or dd > nm_day[b] + 1:
                continue
            for j in range(a, b + 1):
                if abs(dd - nm_day[j]) <= 1 and (min_to_midnight(p, tz) < near_mt or min_to_midnight(nm[j], tz) < near_nm):
                    risky = True
        leap = -1
        if b - a == 13:
            for j in range(a + 1, b):
                if not any(nm_day[j] <= civil_day(p, tz) < nm_day[j + 1] for p, _ in major):
                    leap = j
                    break
        month = 11
        months.append((nm_day[a], 11, False, risky or min_to_midnight(nm[a], tz) < near_nm))
        for j in range(a + 1, b):
            if j != leap:
                month = month % 12 + 1
            months.append((nm_day[j], month, j == leap, risky or min_to_midnight(nm[j], tz) < near_nm))
    return months


def rebuilt_calendar(nasa, major):
    out = OrderedDict()
    for name, tz in (("utc7", TZ_VN), ("utc8", TZ_CN)):
        months = rebuild(nasa, major, tz)
        ok = leaps = near = other = 0
        lst = []
        for start, month, leap, risky in months:
            x = lunar_engine(start, tz)
            if x["day"] == 1 and x["month"] == month and x["leap"] == leap:
                ok += 1
                leaps += leap
            elif risky:
                near += 1
                lst.append(iso(start))
            else:
                other += 1
        out[name] = OrderedDict([("months", len(months)), ("first", iso(months[0][0])), ("last", iso(months[-1][0])),
                                 ("match", ok), ("leap_months_matched", leaps), ("near_midnight", near),
                                 ("near_midnight_list", lst), ("other", other)])
    return out


def sector_band():
    """Low-precision geometric longitude of the sector test (am_lich.sun_longitude,
    evaluated at a UT instant without Delta T) minus the engine's apparent
    longitude, every day 1900-2100, in arcsec and in minutes of time."""
    d = []
    jd = float(al.jd_from_date(1, 1, 1900))
    end = al.jd_from_date(31, 12, 2100)
    while jd <= end:
        g = math.degrees(al.sun_longitude(jd))
        d.append(((g - al.kinh_do_mat_troi_ut(jd) + 180) % 360 - 180) * 3600)
        jd += 1.0
    lo, hi, mean = min(d), max(d), sum(d) / len(d)
    to_min = lambda a: a / MEAN_MOTION_AS * MIN_PER_DAY  # noqa: E731
    return OrderedDict([("samples", len(d)), ("min_arcsec", r(lo, 1)), ("max_arcsec", r(hi, 1)),
                        ("mean_arcsec", r(mean, 1)), ("min_minutes", r(to_min(lo), 1)),
                        ("max_minutes", r(to_min(hi), 1)), ("mean_minutes", r(to_min(mean), 1))])


def sector_exposure(major, band, tz=TZ_VN):
    """Major terms whose instant could be put on the wrong side of a civil
    midnight by the sector test, and that lie within one day of an engine
    month start. The geometric longitude leads the apparent one by
    `max_minutes` at most and lags it by `-min_minutes` at most, so the
    exposed terms are those up to max_minutes after a midnight or up to
    -min_minutes before one."""
    after, before = band["max_minutes"], -band["min_minutes"]
    cnt, lst = 0, []
    for p, k in major:
        m = ((p + 0.5 + tz / 24.0) % 1.0) * MIN_PER_DAY      # minutes after the civil midnight
        if not (m < after or MIN_PER_DAY - m < before):
            continue
        dd = civil_day(p, tz)
        if any(lunar(x, tz)["day"] == 1 for x in (dd - 1, dd, dd + 1)):
            cnt += 1
            lst.append(iso(dd))
    return cnt, lst


def sector_direct_check(major):
    """Month by month: the sector of the low-precision longitude at 00:00 of
    the first day of each month (engine new moons) against the sector implied
    by the IMCCE major terms (the last major term dated before that day), at
    UTC+7, UTC+8 and the Beijing meridian. Month 11 and the leap month depend
    on the calendar only through these sectors, so equal sectors at every
    month start mean an identical calendar."""
    first = al.jd_from_date(1, 1, 1900)
    last = al.jd_from_date(31, 12, 2100)
    k0 = int(math.floor((first - al._SOC_GOC) / al._THANG_SOC)) - 1
    k1 = int(math.floor((last - al._SOC_GOC) / al._THANG_SOC)) + 1
    out = OrderedDict()
    for name, tz in (("utc7", TZ_VN), ("utc8", TZ_CN), ("beijing", TZ_BJ)):
        term_days = sorted((civil_day(p, tz), k) for p, k in major)
        days = [x[0] for x in term_days]
        n, bad = 0, []
        for k in range(k0, k1 + 1):
            st = int(al.get_new_moon_day(k, tz))
            if not (first <= st <= last):
                continue
            i = bisect.bisect_left(days, st) - 1
            if i < 0:
                continue
            n += 1
            ref = (term_days[i][1] // 30) % 12
            if int(al.get_sun_longitude(st, tz)) != ref:
                bad.append(iso(st))
        out[name] = OrderedDict([("months", n), ("sector_differs", len(bad)), ("first_days", bad)])
    return out


# ---------------------------------------------------------------- 6. meridians

def zone_comparison(tz_a, tz_b, first_year, last_year):
    first, last = al.jd_from_date(1, 1, first_year), al.jd_from_date(31, 12, last_year)
    days, runs, prev, by_year, starts = 0, 0, False, Counter(), []
    for j in range(first, last + 1):
        a, b = lunar(j, tz_a), lunar(j, tz_b)
        differ = a != b
        if differ:
            days += 1
            by_year[al.jd_to_date(j)["year"]] += 1
            if not prev:
                runs += 1
                starts.append(iso(j))
        prev = differ
    tets = [y for y in range(first_year, last_year + 1) if tet(y, tz_a) != tet(y, tz_b)]
    leaps = [y for y in range(first_year, last_year + 1) if leap_month(y, tz_a) != leap_month(y, tz_b)]
    return OrderedDict([("days_total", last - first + 1), ("days_differ", days),
                        ("percent", r(100.0 * days / (last - first + 1), 2)), ("runs", runs),
                        ("run_starts", starts), ("tet_years_differ", tets), ("leap_years_differ", leaps)]), by_year


def utc7_vs_utc8():
    out, by_year = zone_comparison(TZ_VN, TZ_CN, 1900, 2100)
    out.pop("run_starts")
    periods = OrderedDict()
    for a, b in ((1900, 1945), (1946, 1967), (1968, 1975), (1976, 2025), (2026, 2100)):
        n_days = al.jd_from_date(31, 12, b) - al.jd_from_date(1, 1, a) + 1
        dd = sum(by_year[y] for y in range(a, b + 1))
        periods["%d-%d" % (a, b)] = OrderedDict([("days", n_days), ("days_differ", dd),
                                                 ("percent", r(100.0 * dd / n_days, 2)),
                                                 ("tet_years_differ", [y for y in out["tet_years_differ"] if a <= y <= b])])
    out["by_period"] = periods
    out["leap_years_utc7_1900_2100"] = sum(1 for y in range(1900, 2101) if leap_month(y, TZ_VN))
    return out


def beijing_sections():
    a, _ = zone_comparison(TZ_BJ, TZ_CN, 1946, 1975)
    b, _ = zone_comparison(TZ_BJ, TZ_VN, 1946, 1975)
    t1968 = OrderedDict((name, iso(tet(1968, tz))) for name, tz in
                        (("utc7", TZ_VN), ("beijing", TZ_BJ), ("utc8", TZ_CN)))
    eng_bj = al.lunar_to_solar(1, 1, 1985, False, TZ_BJ)[0]
    return OrderedDict([("beijing_lmt_hours", r(TZ_BJ, 4)), ("beijing_vs_utc8_1946_1975", a),
                        ("beijing_vs_utc7_1946_1975", b), ("tet_1968", t1968),
                        ("tet_1985_exact", iso(tet(1985, TZ_BJ))),
                        ("tet_1985_engine_sector_test", "%04d-%02d-%02d" % (eng_bj["year"], eng_bj["month"], eng_bj["day"]))])


# ---------------------------------------------------------------- 7. lunar-javascript

def ljs_dir():
    p = os.path.join(DATA, "ljs")
    return p if os.path.exists(os.path.join(p, "ket-qua.json")) else os.path.join(ROOT, "doi-chieu")


def lunar_javascript():
    d = ljs_dir()
    with open(os.path.join(d, "ket-qua.json"), encoding="utf-8") as f:
        k = json.load(f)
    by_tz, by_same = Counter(), Counter()
    with open(os.path.join(d, "khac-ngay-am.csv"), encoding="utf-8") as f:
        for row in csv.DictReader(f):
            y = int(row["ngay_duong"][:4])
            vn = row["nhat_nguyet_vn_utc7"] != row["lunar_javascript"]
            cn = row["nhat_nguyet_cn_utc8"] != row["lunar_javascript"]
            if vn and not cn:
                by_tz[y] += 1
            elif vn:
                by_same[y] += 1
    lam, tk = k["lichAm"], k["tietKhi"]
    out = OrderedDict()
    out["versions"] = k["phienBan"]
    out["engine_version_used"] = k["phienBan"]["nhatNguyet"]["dongCo"]
    out["days"] = lam["soNgay"]
    out["vn_vs_ljs"] = lam["nhatNguyetVN_lunarJavascript"]
    out["cn_vs_ljs"] = lam["nhatNguyetCN_lunarJavascript"]
    out["vn_days_explained_by_time_zone"] = sum(by_tz.values())
    out["vn_days_not_explained_by_time_zone"] = sum(by_same.values())
    out["vn_days_not_explained_years"] = sorted(by_same)
    out["ljs_solar_terms_vs_imcce"] = OrderedDict((key, tk["lunarJavascript"][key]) for key in
                                                  ("soMoc", "lechTrungBinhPhut", "lonNhatPhut", "khacNgayGiaoTiet"))
    out["tet_years_differ"] = [t["nam"] for t in k["tet"]["khacVN"]]
    out["leap_years_differ"] = [t["nam"] for t in k["thangNhuan"]["khacVN"]]
    lc = k["tuVi"]["truong"]["laSo"]
    out["tu_vi"] = OrderedDict([("charts", k["tuVi"]["soLa"]), ("differ", lc["khac"]),
                                ("percent", r(lc["phanTramKhac"], 2)), ("time_zone", lc["doMuiGio"]),
                                ("leap_rule", lc["doThangNhuan"]), ("other", lc["conLai"])])
    # the 150 days at UTC+8: Beijing local mean time
    bj = OrderedDict()
    for row in lam["ngayLechCN"]:
        y, m, dd = (int(x) for x in row["ngay"].split("-"))
        l = lunar(al.jd_from_date(dd, m, y), TZ_BJ)
        got = "%04d-%02d-%02d" % (l["year"], l["month"], l["day"])
        bj.setdefault(str(y), OrderedDict([("days", 0), ("equal_at_beijing_lmt", 0)]))
        bj[str(y)]["days"] += 1
        bj[str(y)]["equal_at_beijing_lmt"] += int(got == row["lunarJavascript"])
    out["cn_residual_by_year"] = bj
    out["cn_residual_years"] = [int(y) for y in bj]
    return out, by_tz, by_same


# ---------------------------------------------------------------- 8. misc

def midnight_sensitivity(nasa, major_all):
    windows = (0.5, 1, 2, 5, 10)
    nm = [(int(d[:4]), min_to_midnight(jd_of(d, t), TZ_VN)) for d, t in nasa]
    st = [(year_of(p), min_to_midnight(p, TZ_VN)) for p, k in major_all if k % 30 == 0]
    out = OrderedDict()
    for name, rows in (("new_moons", nm), ("major_terms", st)):
        out[name] = OrderedDict()
        for label, a, b in (("past", 1900, 2025), ("future", 2026, 2100)):
            sel = [m for y, m in rows if a <= y <= b]
            out[name][label] = OrderedDict([("events", len(sel))] + [
                ("within_%s_min" % w, sum(1 for m in sel if m < w)) for w in windows])
    tet_all = []
    for d, t in nasa:
        p = jd_of(d, t)
        x = lunar(civil_day(p, TZ_VN), TZ_VN)
        if x["day"] == 1 and x["month"] == 1 and not x["leap"]:
            tet_all.append((int(d[:4]), min_to_midnight(p, TZ_VN)))
    for label, a, b in (("past", 1901, 2025), ("future", 2026, 2100)):
        y, m = min(((y, m) for y, m in tet_all if a <= y <= b), key=lambda q: q[1])
        out["tet_closest_" + label] = OrderedDict([("year", y), ("minutes", r(m, 1))])
    return out


def history_table():
    with open(os.path.join(ROOT, "history", "tet-1900-2100.csv"), encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    st = Counter(row["as_used_status"] for row in rows)
    att = [OrderedDict([("year", int(x["year"])), ("north", x["tet_as_used_north"]), ("south", x["tet_as_used_south"]),
                        ("status", x["as_used_status"]), ("rule_north", x["rule_north"]), ("rule_south", x["rule_south"]),
                        ("by_rule_north", x["tet_by_rule_north"]), ("by_rule_south", x["tet_by_rule_south"])])
           for x in rows if x["as_used_status"] != "computed (no historical source)"]
    return OrderedDict([("rows", len(rows)), ("status_counts", OrderedDict(sorted(st.items()))), ("documented", att)])


def test_vectors():
    out = OrderedDict()
    total, versions = 0, set()
    for path in sorted(glob.glob(os.path.join(ROOT, "ca-kiem", "*.json"))):
        name = os.path.basename(path)[:-5]
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        out[name] = len(d["ca"])
        total += len(d["ca"])
        if name.startswith("am-lich"):
            versions.add(d.get("phienBanDongCo"))
        if name == "am-lich":
            ops = Counter((c["vao"].get("phep"), c["vao"].get("muiGio", 7)) for c in d["ca"])
            out["am-lich_by_operation"] = OrderedDict(
                ("%s@UTC+%s" % (op, tz), n) for (op, tz), n in sorted(ops.items()))
    # core suites: what the README and CONTRIBUTING call the test vectors; the
    # total adds the school options (*-phai) and the auspicious hours
    out["core"] = sum(out[k] for k in ("am-lich", "tu-vi", "bat-tu", "than-so-hoc", "le-hoi"))
    out["total"] = total
    out["calendar_vector_engine_versions"] = sorted(versions)
    return out


def sha256(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def git(*args):
    try:
        return subprocess.check_output(["git"] + list(args), cwd=ROOT, stderr=subprocess.DEVNULL, text=True).strip()
    except Exception:  # noqa: BLE001
        return ""


# ---------------------------------------------------------------- figures

BLUE, ORANGE, AQUA, INK, MUTED, GRID = "#2a78d6", "#eb6834", "#1baf7a", "#0b0b0b", "#52514e", "#e4e3df"


def style(ax):
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color(MUTED)
    ax.tick_params(colors=MUTED, labelsize=8)
    ax.yaxis.grid(True, color=GRID, linewidth=0.6)
    ax.set_axisbelow(True)


def save(fig, name):
    for ext in ("svg", "png"):
        fig.savefig(os.path.join(HERE, "figures", name + "." + ext), dpi=200, bbox_inches="tight",
                    metadata={"Date": None} if ext == "svg" else None)


def figures(st, nm, dts, by_tz, by_same, tet_years):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    matplotlib.rcParams.update({"font.family": "DejaVu Sans", "font.size": 8.5, "text.color": INK,
                                "axes.labelcolor": INK, "svg.hashsalt": "nhatnguyet", "svg.fonttype": "path"})
    os.makedirs(os.path.join(HERE, "figures"), exist_ok=True)
    for old in glob.glob(os.path.join(HERE, "figures", "*")):
        os.remove(old)
    yrs = st["years"]

    # Figure 1: distribution, split by era
    fig, (a, b) = plt.subplots(1, 2, figsize=(7.0, 2.6))
    pre = [e for e, y in zip(st["ut"], yrs) if y < 2005]
    post = [e for e, y in zip(st["ut"], yrs) if y >= 2005]
    bins = range(int(math.floor(min(st["ut"]))), int(math.ceil(max(st["ut"]))) + 1)
    a.hist(pre, bins=bins, color=BLUE, edgecolor="white", linewidth=0.4, label="1900 to 2004 (%d)" % len(pre))
    a.hist(post, bins=bins, color=ORANGE, edgecolor="white", linewidth=0.4, alpha=0.85,
           label="2005 to 2100 (%d)" % len(post))
    a.set_xlabel("engine minus IMCCE, UT, seconds (before rounding)")
    a.set_ylabel("solar terms")
    a.set_title("(a) by era of ΔT", fontsize=9, loc="left")
    a.legend(frameon=False, fontsize=7)
    style(a)
    b.hist(st["published"], bins=[x / 10 for x in range(-10, 11)], color=BLUE, edgecolor="white", linewidth=0.4)
    b.set_xlabel("engine minus IMCCE, UT, minutes (published minute)")
    b.set_title("(b) after rounding to the minute", fontsize=9, loc="left")
    style(b)
    fig.tight_layout()
    save(fig, "fig1-solar-term-error-histogram")
    plt.close(fig)

    # Figure 2: solar-term error against time, UT and TT, and after corrections
    fig, (a, b) = plt.subplots(2, 1, figsize=(7.0, 4.4), sharex=True)
    a.scatter(yrs, st["ut"], s=2.2, color=BLUE, linewidths=0, alpha=0.5, rasterized=True, label="UT (as published)")
    a.scatter(yrs, st["tt"], s=2.2, color=ORANGE, linewidths=0, alpha=0.5, rasterized=True, label="TT (no ΔT)")
    a.axhline(0, color=MUTED, linewidth=0.8)
    a.set_ylabel("seconds")
    a.set_ylim(-20, 13)
    a.set_yticks([-20, -10, 0, 10])
    a.set_title("(a) solar terms, engine minus IMCCE, before rounding", fontsize=9, loc="left")
    a.legend(frameon=False, fontsize=7, loc="lower left", markerscale=3)
    style(a)
    b.scatter(yrs, st["tt_corrected"], s=2.2, color=AQUA, linewidths=0, alpha=0.6, rasterized=True)
    b.axhline(0, color=MUTED, linewidth=0.8)
    b.set_ylabel("seconds")
    b.set_ylim(-20, 13)
    b.set_yticks([-20, -10, 0, 10])
    b.set_xlabel("year")
    b.set_title("(b) TT, after removing the VSOP87D truncation and the precession-rate difference",
                fontsize=9, loc="left")
    style(b)
    fig.tight_layout()
    save(fig, "fig2-solar-terms-by-year")
    plt.close(fig)

    # Figure 4: new moons, decomposition
    fig, (a, b) = plt.subplots(2, 1, figsize=(7.0, 4.4), sharex=True)
    ny = nm["years"]
    a.scatter(ny, nm["published"], s=2.2, color=ORANGE, linewidths=0, alpha=0.6, rasterized=True)
    a.axhline(0, color=MUTED, linewidth=0.8)
    a.set_ylabel("minutes")
    a.set_title("(a) published new moons (series with its own ΔT), minus NASA, UT", fontsize=9, loc="left")
    style(a)
    b.scatter(ny, nm["series_tt"], s=2.2, color=BLUE, linewidths=0, alpha=0.6, rasterized=True,
              label="series minus DE440, TT")
    b.plot(ny, [x / 60.0 for x in nm["dk_em"]], color=INK, linewidth=1.0,
           label="Espenak–Meeus ΔT minus series ΔT")
    b.axhline(0, color=MUTED, linewidth=0.8)
    b.set_ylabel("minutes")
    b.set_xlabel("year")
    b.set_title("(b) the two components", fontsize=9, loc="left")
    b.legend(frameon=False, fontsize=7, loc="upper left", markerscale=3)
    style(b)
    fig.tight_layout()
    save(fig, "fig4-new-moons")
    plt.close(fig)

    # Figure 3: Delta T models
    fig, ax = plt.subplots(figsize=(7.0, 2.8))
    ys = [1900 + i * 0.5 for i in range(401)]
    ax.axvspan(2005, 2100, color=GRID, alpha=0.6, linewidth=0)
    ax.plot(ys, [al.delta_t_giay(y) for y in ys], color=BLUE, linewidth=1.5, label="Espenak–Meeus (solar terms)")
    ax.plot(ys, [dk_days((al.jd_from_date(1, 1, int(y)) - al._SOC_GOC) / al._THANG_SOC) * 86400 for y in ys],
            color=ORANGE, linewidth=1.5, label="new-moon series, eq. (10)")
    mir = dts["miriade"]
    ax.plot([int(y) for y in mir], list(mir.values()), color=AQUA, linewidth=1.2, label="IMCCE Miriade (TT−UTC)")
    ax.plot([1900 + i * 0.5 for i in range(401)], [SKY_GRID["%.1f" % (1900 + i * 0.5)] for i in range(401)],
            color=INK, linewidth=1.0, linestyle=(0, (4, 2)), label="Skyfield %s (current prediction)" % SKY_VERSION)
    obs = dts["observed"]
    ax.scatter([int(y) for y in obs], list(obs.values()), s=6, color=INK, zorder=3, label="observed (IERS), 1973–2026")
    ax.text(2008, 190, "extrapolated", color=MUTED, fontsize=7.5)
    ax.set_xlim(1900, 2100)
    ax.set_ylabel("ΔT, seconds")
    ax.set_xlabel("year")
    ax.legend(frameon=False, fontsize=7, loc="upper left")
    style(ax)
    fig.tight_layout()
    save(fig, "fig3-delta-t")
    plt.close(fig)

    # Figure 5: days per year differing from lunar-javascript (stacked)
    years = list(range(1900, 2101))
    tzv = [by_tz.get(y, 0) for y in years]
    sv = [by_same.get(y, 0) for y in years]
    fig, ax = plt.subplots(figsize=(7.0, 2.6))
    ax.bar(years, tzv, width=0.85, color=BLUE, label="explained by UTC+7 vs UTC+8")
    ax.bar(years, sv, width=0.85, bottom=tzv, color=ORANGE, label="same zone, still different (stacked)")
    top = max(t + s for t, s in zip(tzv, sv))
    ax.vlines(tet_years, top * 1.04, top * 1.12, color=INK, linewidth=0.9, label="year with a different Tết")
    ax.set_ylim(0, top * 1.15)
    ax.set_xlim(1898, 2102)
    ax.set_ylabel("days per year")
    ax.set_xlabel("Gregorian year")
    ax.legend(frameon=False, fontsize=7.5, loc="upper center", bbox_to_anchor=(0.5, -0.22), ncol=3)
    style(ax)
    fig.tight_layout()
    save(fig, "fig5-differences-timeline")
    plt.close(fig)


# ---------------------------------------------------------------- main

def main():
    imcce_utc = read_tsv(os.path.join(DATA, "imcce-terms-utc.tsv"))
    imcce_tt = read_tsv(os.path.join(DATA, "imcce-terms-tt.tsv"))
    usno = read_tsv(os.path.join(DATA, "usno-equinox-solstice-1900-2100.tsv"))
    nasa = [row[:2] for row in read_tsv(os.path.join(DATA, "nasa-new-moons-1901-2100.tsv"))]
    de440 = read_tsv(os.path.join(DATA, "de440-new-moons-1901-2100.tsv"))
    trunc = read_tsv(os.path.join(DATA, "vsop-truncation-at-terms.tsv"))
    assert [x[:2] for x in de440] == nasa
    major_all = [(jd_of(d, t), int(k)) for d, t, k, _ in imcce_utc]
    major = [(p, k) for p, k in major_all if k % 30 == 0]

    res = OrderedDict()
    ca = sorted(glob.glob(os.path.join(ROOT, "ca-kiem", "am-lich*.json")))
    vec_versions = sorted({json.load(open(p, encoding="utf-8")).get("phienBanDongCo") for p in ca})
    res["versions"] = OrderedDict([
        ("engine", PHIEN_BAN_DONG_CO), ("python_package", __version__),
        ("calendar_vectors_engine", vec_versions[0] if len(vec_versions) == 1 else vec_versions),
        ("tree_dirty", (os.environ["NN_TREE_DIRTY"] == "1") if "NN_TREE_DIRTY" in os.environ
         else bool(git("status", "--porcelain", "--untracked-files=no", "--", "."))),
        ("tree_commit", os.environ.get("NN_TREE_COMMIT") or git("rev-parse", "--short=12", "HEAD"))])
    if res["versions"]["calendar_vectors_engine"] != PHIEN_BAN_DONG_CO:
        sys.stderr.write("warning: engine %s, calendar vectors %s\n" % (PHIEN_BAN_DONG_CO, vec_versions))
    res["series_terms"] = OrderedDict([
        ("vsop87d_L_by_power", [len(p) for p in tb.VSOP87D_TRAI_DAT_L]),
        ("vsop87d_R_by_power", [len(p) for p in tb.VSOP87D_TRAI_DAT_R]),
        ("vsop87d_L", sum(len(p) for p in tb.VSOP87D_TRAI_DAT_L)),
        ("vsop87d_R", sum(len(p) for p in tb.VSOP87D_TRAI_DAT_R)),
        ("nutation_iau1980", len(tb.CHUONG_DONG_IAU1980)),
        ("new_moon_periodic_terms", 13)])
    res["constants"] = OrderedDict([
        ("mean_motion_arcsec_per_day", r(MEAN_MOTION_AS, 2)),
        ("uniform_rounding_sd_s", r(60 / math.sqrt(12), 1)),
        ("beijing_lmt_hours", r(TZ_BJ, 4))])

    st, st_series = solar_terms(imcce_utc, imcce_tt, usno, trunc)
    res["solar_terms"] = st
    res["delta_t"] = delta_t_section()
    nm, nm_series = new_moons(nasa, de440)
    res["new_moons"] = nm
    res["de440_two_delta_t"] = de440_two_delta_t(nasa, de440)
    res["counterfactual_em_delta_t"] = counterfactual_em()
    res["rebuilt_calendar"] = rebuilt_calendar(nasa, major)
    band = sector_band()
    cnt, lst = sector_exposure(major, band)
    res["sector_test"] = OrderedDict([("band", band), ("major_terms_near_month_boundary", cnt), ("days", lst),
                                      ("direct_check", sector_direct_check(major))])
    res["utc7_vs_utc8"] = utc7_vs_utc8()
    res["beijing"] = beijing_sections()
    res["midnight"] = midnight_sensitivity(nasa, major_all)
    # Daily motion of the apparent longitude, for the Newton contraction factor
    lo, hi = 1e9, -1e9
    jd = float(al.jd_from_date(1, 1, 1900))
    prev = al.kinh_do_mat_troi_ut(jd)
    while jd < al.jd_from_date(31, 12, 2100):
        jd += 1.0
        cur = al.kinh_do_mat_troi_ut(jd)
        v = (cur - prev) % 360
        lo, hi = min(lo, v), max(hi, v)
        prev = cur
    vbar = 360 / 365.2422
    kk = max(abs(1 - lo / vbar), abs(1 - hi / vbar))
    res["solar_motion"] = OrderedDict([("min_deg_per_day", r(lo, 4)), ("max_deg_per_day", r(hi, 4)),
                                       ("max_contraction", r(kk, 4)), ("min_factor", r(1 / kk, 1)),
                                       ("residual_bound_s", r(0.06 / (1 / kk), 4))])
    ljs, by_tz, by_same = lunar_javascript()
    res["lunar_javascript"] = ljs
    res["history"] = history_table()
    res["test_vectors"] = test_vectors()
    files = [os.path.join(DATA, n) for n in ("imcce-terms-utc.tsv", "imcce-terms-tt.tsv", "nasa-new-moons-1901-2100.tsv",
                                             "usno-equinox-solstice-1900-2100.tsv", "de440-new-moons-1901-2100.tsv",
                                             "vsop-truncation-at-terms.tsv", "delta-t-skyfield.tsv")]
    res["data_files"] = OrderedDict((os.path.basename(p), OrderedDict([("rows", len(read_tsv(p))), ("sha256", sha256(p))]))
                                    for p in files)

    with open(os.path.join(HERE, "results.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("results.json written; engine", PHIEN_BAN_DONG_CO, "tree", res["versions"]["tree_commit"],
          "dirty" if res["versions"]["tree_dirty"] else "clean")
    if not ARGS.no_figures:
        figures(st_series, nm_series, res["delta_t"], by_tz, by_same, ljs["tet_years_differ"])


if __name__ == "__main__":
    main()
