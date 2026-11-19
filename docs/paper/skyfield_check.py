#!/usr/bin/env python3
"""Independent check of de440_new_moons.py with Skyfield.

de440_new_moons.py reduces DE440 with IAU 1976 precession and first-order
aberration. This script solves the same 2,474 conjunctions in apparent
geocentric ecliptic longitude of date with Skyfield (Rhodes 2019) on the same
kernel: IAU 2006 precession, IAU 2000A nutation, relativistic aberration and
light deflection. All events are iterated together (Newton with the mean
relative motion of the Moon, then secant steps) to 1e-9 day.

    python3 docs/paper/skyfield_check.py

Needs numpy and skyfield; reads data/raw/de440s.bsp (checksum in
data/raw/SHA256SUMS) and data/de440-new-moons-1901-2100.tsv. Writes
results-skyfield.json.
"""

import json
import os
from collections import OrderedDict

import numpy as np
import skyfield
from skyfield.api import load, load_file
from skyfield.framelib import ecliptic_frame

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    rows = [l.rstrip("\n").split("\t") for l in open(os.path.join(HERE, "data", "de440-new-moons-1901-2100.tsv"),
                                                       encoding="utf-8") if not l.startswith("#")]
    ours = np.array([float(r[2]) for r in rows])
    ts = load.timescale(builtin=True)
    eph = load_file(os.path.join(HERE, "data", "raw", "de440s.bsp"))
    earth, sun, moon = eph["earth"], eph["sun"], eph["moon"]

    def diff(jd):
        t = ts.tt_jd(jd)
        e = earth.at(t)
        lm = e.observe(moon).apparent().frame_latlon(ecliptic_frame)[1].degrees
        ls = e.observe(sun).apparent().frame_latlon(ecliptic_frame)[1].degrees
        return (lm - ls + 180.0) % 360.0 - 180.0

    jd = ours.copy()
    d = diff(jd)
    prev_jd, prev_d = jd, d
    jd = jd - d / 12.19
    for _ in range(20):
        d = diff(jd)
        slope = (d - prev_d) / np.where(jd != prev_jd, jd - prev_jd, 1.0)
        slope = np.where(np.abs(slope) > 1.0, slope, 12.19)
        prev_jd, prev_d = jd, d
        step = d / slope
        jd = jd - step
        if np.max(np.abs(step)) < 1e-9:
            break
    delta = (ours - jd) * 86400.0
    edge = OrderedDict()
    for r, x in zip(rows, delta):
        if r[0][:7] in ("1944-06", "1967-07", "2054-05", "2072-12", "2077-11", "2085-10"):
            edge["%s %s" % (r[0], r[1])] = round(float(x), 3)
    out = OrderedDict([
        ("skyfield", skyfield.__version__), ("events", len(rows)),
        ("reduction", "IAU 2006/2000A, relativistic aberration, light deflection, ecliptic and equinox of date"),
        ("script_minus_skyfield_tt_s", OrderedDict([
            ("mean", round(float(delta.mean()), 3)), ("rms", round(float(np.sqrt((delta ** 2).mean())), 3)),
            ("max_abs", round(float(np.abs(delta).max()), 3))])),
        ("edge_months_s", edge)])
    with open(os.path.join(HERE, "results-skyfield.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1)
        f.write("\n")
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
