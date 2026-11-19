#!/usr/bin/env python3
"""A current Delta T prediction, from Skyfield's built-in model.

Skyfield (Rhodes 2019) builds Delta T from three pieces: the IERS daily values
it ships (finals2000A, observed values plus the IERS short-term prediction; in
Skyfield 1.55 they run from 1973-01-02 to 2027-01-23), the Morrison et al.
(2021) splines (Table S15, addendum 2020 to Stephenson et al. 2016) before
1973, and after the IERS table a cubic spline that leaves the last IERS value
with its last-year slope and joins the long-term parabola of Stephenson et al.
(2016), Delta T = -320 + 32.5 u^2 s with u = (year - 1825)/100, at a
multiple of 100 years (2800 for this table). After 2027 it is therefore a
smooth extrapolation of the present trend, not a physical forecast; the paper
uses it as the second Delta T model next to Espenak-Meeus.

    python3 docs/paper/delta_t_forecast.py

Needs skyfield (pip install skyfield; tested with 1.55). Writes
data/delta-t-skyfield.tsv: Delta T every half year 1900-2101 and at the TT
instant of each DE440 new moon of data/de440-new-moons-1901-2100.tsv.
"""

import os

import skyfield
from skyfield.api import load

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")


def main():
    ts = load.timescale(builtin=True)
    t0, t1 = ts.delta_t_table[0][0], ts.delta_t_table[0][-1]
    rows = []
    for i in range(403):  # 1900.0 to 2101.0
        y = 1900 + 0.5 * i
        rows.append(("grid", "%.1f" % y, "%.6f" % float(ts.J(y).delta_t)))
    for line in open(os.path.join(DATA, "de440-new-moons-1901-2100.tsv"), encoding="utf-8"):
        if line.startswith("#"):
            continue
        d, t, jtt = line.rstrip("\n").split("\t")
        rows.append(("new_moon", "%s %s" % (d, t), "%.6f" % float(ts.tt_jd(float(jtt)).delta_t)))
    with open(os.path.join(DATA, "delta-t-skyfield.tsv"), "w", encoding="utf-8") as f:
        f.write("# Delta T (s) from Skyfield %s, load.timescale(builtin=True): IERS daily values\n"
                "# %s to %s (TT), Morrison et al. (2021) splines before, spline to the long-term\n"
                "# parabola of Stephenson et al. (2016) after. Written by delta_t_forecast.py.\n"
                "# kind: grid (key = decimal year, Julian epoch) or new_moon (key = NASA UT row of\n"
                "# data/de440-new-moons-1901-2100.tsv; Delta T at the DE440 TT instant).\n"
                % (skyfield.__version__, ts.tt_jd(t0).utc_strftime("%Y-%m-%d"),
                   ts.tt_jd(t1).utc_strftime("%Y-%m-%d")))
        f.write("# kind\tkey\tdelta_t_s\n")
        for row in rows:
            f.write("\t".join(row) + "\n")
    print("wrote", len(rows), "rows; skyfield", skyfield.__version__)


if __name__ == "__main__":
    main()
