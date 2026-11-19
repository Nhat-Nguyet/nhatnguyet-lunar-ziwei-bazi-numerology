#!/usr/bin/env python3
"""New moons 1901-2100 from the JPL DE440 ephemeris, in TT.

A new moon is the instant at which the apparent geocentric ecliptic
longitudes of the Moon and the Sun are equal. For each NASA new moon in
data/nasa-new-moons-1901-2100.tsv the conjunction is solved near it:

  * barycentric positions and velocities from DE440 (de440s.bsp, read with
    jplephem); the Moon and the Sun are corrected for light time (iterated);
  * annual aberration from the Earth's barycentric velocity (first order);
  * rotation from ICRF to the mean ecliptic and equinox of date with the
    IAU 1976 precession angles and the IAU 1980 mean obliquity (Meeus 1998,
    ch. 21 and 22). Nutation in longitude shifts both bodies equally and is
    omitted; frame bias (about 0.02") is omitted.

TDB is used for TT (difference below 2 ms). Writes
data/de440-new-moons-1901-2100.tsv (TT, 0.01 s) and results-de440.json.

    python3 docs/paper/de440_new_moons.py [path/to/de440s.bsp]

Requires numpy and jplephem.
"""

import hashlib
import json
import math
import os
import sys
from collections import OrderedDict

import numpy as np
from jplephem.spk import SPK

HERE = os.path.dirname(os.path.abspath(__file__))
C_KM_S = 299792.458
AS = math.pi / (180 * 3600)


def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, s], [0, -s, c]])


def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, -s], [0, 1, 0], [s, 0, c]])


def rot_z(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, s, 0], [-s, c, 0], [0, 0, 1]])


def to_ecliptic_of_date(jd):
    t = (jd - 2451545.0) / 36525.0
    zeta = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t ** 3) * AS
    z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t ** 3) * AS
    theta = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t ** 3) * AS
    eps = (84381.448 - 46.8150 * t - 0.00059 * t * t + 0.001813 * t ** 3) * AS
    prec = rot_z(-z) @ rot_y(theta) @ rot_z(-zeta)
    return rot_x(eps) @ prec


class Ephem:
    def __init__(self, path):
        self.k = SPK.open(path)

    def pv(self, a, b, jd):
        p, v = self.k[a, b].compute_and_differentiate(jd)
        return np.asarray(p), np.asarray(v) / 86400.0  # km, km/s

    def earth(self, jd):
        p1, v1 = self.pv(0, 3, jd)
        p2, v2 = self.pv(3, 399, jd)
        return p1 + p2, v1 + v2

    def moon_bary(self, jd):
        p1, _ = self.pv(0, 3, jd)
        p2, _ = self.pv(3, 301, jd)
        return p1 + p2

    def sun_bary(self, jd):
        p, _ = self.pv(0, 10, jd)
        return p

    def apparent(self, body, jd, e, ve):
        t = jd
        for _ in range(3):
            u = body(t) - e
            t = jd - np.linalg.norm(u) / C_KM_S / 86400.0
        u = u / np.linalg.norm(u)
        beta = ve / C_KM_S
        u = u + beta - u * np.dot(u, beta)
        return u / np.linalg.norm(u)

    def elongation(self, jd):
        e, ve = self.earth(jd)
        m = self.apparent(self.moon_bary, jd, e, ve)
        s = self.apparent(self.sun_bary, jd, e, ve)
        r = to_ecliptic_of_date(jd)
        m, s = r @ m, r @ s
        lm, ls = math.atan2(m[1], m[0]), math.atan2(s[1], s[0])
        d = (lm - ls) / AS
        return (d + 648000) % 1296000 - 648000  # arcsec in [-180, 180) deg

    def conjunction(self, guess):
        a, b = guess - 0.05, guess + 0.05
        fa, fb = self.elongation(a), self.elongation(b)
        for _ in range(40):
            c = b - fb * (b - a) / (fb - fa)
            fc = self.elongation(c)
            a, fa, b, fb = b, fb, c, fc
            if abs(b - a) * 86400 < 1e-3:
                break
        return b


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "data", "raw", "de440s.bsp")
    with open(path, "rb") as f:
        digest = hashlib.sha256(f.read()).hexdigest()
    eph = Ephem(path)
    sys.path.insert(0, os.path.join(HERE, "..", "..", "python"))
    from nhatnguyet import am_lich as al  # ΔT only, to start the solver near the event

    rows = []
    for line in open(os.path.join(HERE, "data", "nasa-new-moons-1901-2100.tsv"), encoding="utf-8"):
        if line.strip() and not line.startswith("#"):
            rows.append(line.split("\t")[:2])
    out = []
    for d, t in rows:
        y, m, dd = (int(x) for x in d.split("-"))
        h, mi = (int(x) for x in t.strip().split(":")[:2])
        jd_ut = al.jd_from_date(dd, m, y) - 0.5 + (h * 60 + mi) / 1440.0
        jd_tt = eph.conjunction(jd_ut + al.delta_t_giay(al.nam_thap_phan(jd_ut)) / 86400.0)
        out.append((d, t.strip(), jd_tt))
    dst = os.path.join(HERE, "data", "de440-new-moons-1901-2100.tsv")
    with open(dst, "w", encoding="utf-8") as f:
        f.write("# New moons 1901-2100 from JPL DE440 (de440s.bsp, sha256 %s),\n" % digest)
        f.write("# computed by de440_new_moons.py: apparent geocentric conjunction in ecliptic\n"
                "# longitude of date, light time and annual aberration applied. Time scale TT\n"
                "# (Julian date). Columns 1-2 repeat the NASA UT row the event was matched to.\n")
        f.write("# nasa_date_ut\tnasa_time_ut\tjd_tt\n")
        for d, t, jd in out:
            f.write("%s\t%s\t%.7f\n" % (d, t, jd))
    with open(dst, "rb") as f:
        sha_out = hashlib.sha256(f.read()).hexdigest()
    res = OrderedDict([("kernel", "de440s.bsp"), ("kernel_sha256", digest), ("new_moons", len(out)),
                       ("file", "docs/paper/data/de440-new-moons-1901-2100.tsv"), ("sha256", sha_out)])
    with open(os.path.join(HERE, "results-de440.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, indent=1)
        f.write("\n")
    print(json.dumps(res, indent=1))


if __name__ == "__main__":
    main()
