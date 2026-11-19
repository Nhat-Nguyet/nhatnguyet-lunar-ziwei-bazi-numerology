#!/usr/bin/env python3
"""Truncation error of the VSOP87D Earth series used by the engine.

Compares the truncated series of the engine (python/nhatnguyet/_mat_troi_bang.py)
with the complete VSOP87D Earth file distributed by IMCCE, every two days from
1900 to 2100, and writes results-vsop.json next to this script.

It also measures the precession embedded in VSOP87D: versions C and D are
referred to the mean ecliptic and equinox of date, "deduced from the [J2000
frame] by precessional moving" (VSOP87 README), without naming the precession
quantities. The Earth's longitude in VSOP87D (of date) minus VSOP87B (J2000),
fitted by a cubic in Julian centuries over 1900-2100, gives the general
precession in longitude that the series embeds; it is compared with Lieske et
al. (1977, IAU 1976) and Capitaine et al. (2003, P03).

    python3 docs/paper/vsop_budget.py [path/to/VSOP87D.ear [path/to/VSOP87B.ear]]

Without paths the files are downloaded from
https://ftp.imcce.fr/pub/ephem/planets/vsop87/ into a temporary directory;
their SHA-256 is checked against the values below. Standard library only.
"""

import hashlib
import json
import math
import os
import sys
import tempfile
import urllib.request
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "python"))

from nhatnguyet import _mat_troi_bang as tb  # noqa: E402

URL = "https://ftp.imcce.fr/pub/ephem/planets/vsop87/VSOP87D.ear"
SHA256 = "8b160c859136d467f2be7fc29efa8a9652e95516dfbde00e4c739d7ddc90ca91"
URL_B = "https://ftp.imcce.fr/pub/ephem/planets/vsop87/VSOP87B.ear"
SHA256_B = "30a05a74b8bf65aeffffea7d329934b648dfbe186a06f6cce12b0d9403f896bb"
P_LIESKE = (5029.0966, 1.11113)      # Lieske et al. 1977, p_A = 5029.0966" T + 1.11113" T^2
P_P03 = (5028.796195, 1.1054348)     # Capitaine et al. 2003
ARCSEC = 180 * 3600 / math.pi
# Mean motion of the Sun in longitude, arcsec per day, to turn an angle into time.
MEAN_MOTION = 360 * 3600 / 365.2422


def load(path):
    series = {1: [], 3: []}  # variable 1 = L, 3 = R
    var = power = None
    with open(path, encoding="ascii") as f:
        for line in f:
            if line.startswith(" VSOP87"):
                parts = line.split()
                var = int(parts[parts.index("VARIABLE") + 1])
                power = int(line.split("*T**")[1].split()[0])
                if var in series:
                    while len(series[var]) <= power:
                        series[var].append([])
                continue
            if var in series:
                a, b, c = (float(x) for x in line.split()[-3:])
                series[var][power].append((a, b, c))
    return series[1], series[3]


def evaluate(table, tau):
    s = 0.0
    for p in range(len(table) - 1, -1, -1):
        x = 0.0
        for a, b, c in table[p]:
            x += a * math.cos(b + c * tau)
        s = s * tau + x
    return s


def fetch(path, url, sha, name):
    if path is None:
        path = os.path.join(tempfile.mkdtemp(), name)
        urllib.request.urlretrieve(url, path)
    with open(path, "rb") as f:
        digest = hashlib.sha256(f.read()).hexdigest()
    if digest != sha:
        sys.exit("%s: SHA-256 %s, expected %s" % (name, digest, sha))
    return path


def polyfit(xs, ys, deg):
    """Least squares polynomial (coefficients from the constant term up)."""
    n = deg + 1
    m = [[sum(x ** (i + j) for x in xs) for j in range(n)] for i in range(n)]
    v = [sum(y * x ** i for x, y in zip(xs, ys)) for i in range(n)]
    for i in range(n):
        p = max(range(i, n), key=lambda q: abs(m[q][i]))
        m[i], m[p], v[i], v[p] = m[p], m[i], v[p], v[i]
        for q in range(n):
            if q != i:
                f = m[q][i] / m[i][i]
                m[q] = [a - f * b for a, b in zip(m[q], m[i])]
                v[q] -= f * v[i]
    return [v[i] / m[i][i] for i in range(n)]


def main():
    path = fetch(sys.argv[1] if len(sys.argv) > 1 else None, URL, SHA256, "VSOP87D.ear")
    path_b = fetch(sys.argv[2] if len(sys.argv) > 2 else None, URL_B, SHA256_B, "VSOP87B.ear")
    full_l, full_r = load(path)
    full_lb, _ = load(path_b)

    jd0 = 2415020.5   # 1900-01-01 00:00 TT
    jd1 = 2488434.5   # 2101-01-01 00:00 TT
    d_lambda = []
    jd = jd0
    while jd < jd1:
        tau = (jd - 2451545.0) / 365250.0
        lf, lt = evaluate(full_l, tau), evaluate(tb.VSOP87D_TRAI_DAT_L, tau)
        rf, rt = evaluate(full_r, tau), evaluate(tb.VSOP87D_TRAI_DAT_R, tau)
        # longitude difference plus the change it causes in the aberration term -20.4898"/R
        d = (lt - lf) * ARCSEC + (-20.4898 / rt + 20.4898 / rf)
        d_lambda.append(d)
        jd += 2.0
    n = len(d_lambda)
    ab = sorted(abs(x) for x in d_lambda)
    max_abs = ab[-1]
    rms = math.sqrt(sum(x * x for x in d_lambda) / n)
    out = OrderedDict([
        ("source", URL), ("sha256", SHA256),
        ("terms_full_L", sum(len(p) for p in full_l)), ("terms_full_R", sum(len(p) for p in full_r)),
        ("terms_engine_L", sum(len(p) for p in tb.VSOP87D_TRAI_DAT_L)),
        ("terms_engine_R", sum(len(p) for p in tb.VSOP87D_TRAI_DAT_R)),
        ("samples", n), ("step_days", 2), ("range", "1900-01-01 to 2100-12-31 (TT)"),
        ("apparent_longitude_error_arcsec", OrderedDict([
            ("mean", round(sum(d_lambda) / n, 4)), ("rms", round(rms, 4)),
            ("p99_abs", round(ab[int(math.ceil(0.99 * n)) - 1], 4)), ("max_abs", round(max_abs, 4))])),
        ("equivalent_time_error_seconds", OrderedDict([
            ("rms", round(rms / MEAN_MOTION * 86400, 2)),
            ("max_abs", round(max_abs / MEAN_MOTION * 86400, 2))])),
    ])
    # Precession embedded in VSOP87D: Earth longitude of date minus J2000.
    xs, ys = [], []
    jd = jd0
    while jd < jd1:
        tau = (jd - 2451545.0) / 365250.0
        d = evaluate(full_l, tau) - evaluate(full_lb, tau)
        d = (d + math.pi) % (2 * math.pi) - math.pi
        xs.append((jd - 2451545.0) / 36525.0)
        ys.append(d * ARCSEC)
        jd += 10.0
    c = polyfit(xs, ys, 3)
    res = [y - sum(c[i] * x ** i for i in range(4)) for x, y in zip(xs, ys)]
    out["precession_in_vsop87d"] = OrderedDict([
        ("source_b", URL_B), ("sha256_b", SHA256_B), ("samples", len(xs)), ("step_days", 10),
        ("rate_arcsec_per_century", round(c[1], 4)), ("quadratic_arcsec_per_century2", round(c[2], 4)),
        ("residual_rms_arcsec", round(math.sqrt(sum(x * x for x in res) / len(res)), 4)),
        ("lieske1977", OrderedDict([("rate", P_LIESKE[0]), ("quadratic", P_LIESKE[1])])),
        ("p03", OrderedDict([("rate", P_P03[0]), ("quadratic", P_P03[1])])),
        ("rate_minus_lieske", round(c[1] - P_LIESKE[0], 4)),
        ("rate_minus_p03", round(c[1] - P_P03[0], 4)),
        ("lieske_minus_p03_s_per_century", round((P_LIESKE[0] - P_P03[0]) / MEAN_MOTION * 86400, 2))])
    # Effect at each IMCCE solar-term instant (TT): the engine reaches the target
    # longitude earlier by d/v when its truncated longitude exceeds the full one.
    at = []
    for line in open(os.path.join(HERE, "data", "imcce-terms-tt.tsv"), encoding="utf-8"):
        if line.startswith("#"):
            continue
        d, t, k = line.rstrip("\n").split("\t")
        y, mo, dd = (int(x) for x in d.split("-"))
        h, mi, s = t.split(":")
        a = (14 - mo) // 12
        yy, mm = y + 4800 - a, mo + 12 * a - 3
        jdn = dd + (153 * mm + 2) // 5 + 365 * yy + yy // 4 - yy // 100 + yy // 400 - 32045
        jde = jdn - 0.5 + (int(h) * 3600 + int(mi) * 60 + float(s)) / 86400.0
        tau = (jde - 2451545.0) / 365250.0
        lf, lt = evaluate(full_l, tau), evaluate(tb.VSOP87D_TRAI_DAT_L, tau)
        rf, rt = evaluate(full_r, tau), evaluate(tb.VSOP87D_TRAI_DAT_R, tau)
        dl = (lt - lf) * ARCSEC + (-20.4898 / rt + 20.4898 / rf)
        at.append((d, t, k, dl, -dl / MEAN_MOTION * 86400))
    with open(os.path.join(HERE, "data", "vsop-truncation-at-terms.tsv"), "w", encoding="utf-8") as f:
        f.write("# Effect of the VSOP87D truncation of the engine at each IMCCE solar-term instant (TT),\n"
                "# written by vsop_budget.py: longitude (truncated minus full, arcsec, including the\n"
                "# aberration term) and the resulting shift of the solar-term instant (s).\n")
        f.write("# date_tt\ttime_tt\tlongitude_deg\tdlambda_arcsec\tdt_s\n")
        for d, t, k, dl, dt in at:
            f.write("%s\t%s\t%s\t%.5f\t%.3f\n" % (d, t, k, dl, dt))
    dts = sorted(abs(x[4]) for x in at)
    out["at_solar_terms"] = OrderedDict([
        ("instants", len(at)), ("mean_dt_s", round(sum(x[4] for x in at) / len(at), 3)),
        ("rms_dt_s", round(math.sqrt(sum(x[4] ** 2 for x in at) / len(at)), 2)),
        ("max_abs_dt_s", round(dts[-1], 2))])
    with open(os.path.join(HERE, "results-vsop.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1)
        f.write("\n")
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
