#!/usr/bin/env python3
"""Compare the engine with Ho Ngoc Duc's published JavaScript, 1900-2100, UTC+7.

Ho Ngoc Duc's programs are distributed for personal, non-commercial use only,
so they are not copied into this repository. This script downloads the two
archived copies below at run time, checks their SHA-256 and keeps them under
data/raw/hnd/ (ignored by git):

  amlich-aa98.js  the astronomical algorithm (convertSolar2Lunar with
                  timeZone = 7), Internet Archive copy of 10 July 2006 of
                  http://www.informatik.uni-leipzig.de/~duc/amlich/amlich-aa98.js
  amlich-js.zip   the table-driven calendar (JavaScript/amlich-hnd.js, version 0.8,
                  getLunarDate over packed year codes for 1800-2199), Internet
                  Archive copy of 1 May 2016 of
                  http://www.informatik.uni-leipzig.de/~duc/amlich/amlich-js.zip

Both files run unmodified in an empty Node.js vm context (no require, no file
or network access). Every civil day from 1900-01-01 to 2100-12-31 is converted
by both and by the engine (Python port, time_zone = 7). The algorithm copy is
compared day by day; each difference is listed with the intermediate
quantities that explain it. The table copy follows the historical Chinese
calendar before 1968, so it is also compared with that rule computed with
exact containment (history/generate_tet.py), and the runs of days that differ
are listed.

    python3 docs/paper/hnd_compare.py [--root <library tree>]

Writes results-hnd.json. Needs Node.js and network access on the first run.
"""

import argparse
import hashlib
import io
import json
import os
import subprocess
import sys
import urllib.request
import zipfile
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(HERE, "data", "raw", "hnd")
UA = {"User-Agent": "nhatnguyet-paper-fetch/1.0 (+https://nhatnguyet.org)"}

SOURCES = OrderedDict([
    ("amlich-aa98.js", {
        "url": "http://web.archive.org/web/20060710052023id_/"
               "http://www.informatik.uni-leipzig.de:80/~duc/amlich/amlich-aa98.js",
        "original": "http://www.informatik.uni-leipzig.de/~duc/amlich/amlich-aa98.js",
        "sha256": "26ee2710d65967dba934f120dc990d780b7d55b5e6e9cc6ac8df97b06b1cea4f",
    }),
    ("amlich-js.zip", {
        "url": "http://web.archive.org/web/20160501054739id_/"
               "http://www.informatik.uni-leipzig.de/~duc/amlich/amlich-js.zip",
        "original": "http://www.informatik.uni-leipzig.de/~duc/amlich/amlich-js.zip",
        "sha256": "83968ce4357e6093678869e2720e7c0b64598ab65c9b3451463d5c6a1a576561",
        "member": "JavaScript/amlich-hnd.js",
        "member_sha256": "e22d364105af6e765f1057addcef45fbdc339f9d2f9880e7d58859de477b45ea",
    }),
])

NODE = r"""
const vm = await import("node:vm");
const fs = await import("node:fs");
const [aa98Path, hndPath, jd0, jd1] = process.argv.slice(1);
function load(p) {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(p, "latin1"), ctx, { filename: p });
  return ctx;
}
const A = load(aa98Path), H = load(hndPath);
const aa98 = [], hnd = [];
for (let jd = Number(jd0); jd <= Number(jd1); jd++) {
  const [d, m, y] = A.jdToDate(jd);
  const a = A.convertSolar2Lunar(d, m, y, 7);
  aa98.push(a.join(","));
  const h = H.getLunarDate(d, m, y);
  hnd.push([h.day, h.month, h.year, h.leap].join(","));
}
process.stdout.write(JSON.stringify({ aa98, hnd }));
"""


def sha(data):
    return hashlib.sha256(data).hexdigest()


def fetch(name, spec):
    os.makedirs(DIR, exist_ok=True)
    path = os.path.join(DIR, name)
    if not os.path.exists(path):
        req = urllib.request.Request(spec["url"], headers=UA)
        with urllib.request.urlopen(req, timeout=120) as r:
            data = r.read()
        with open(path, "wb") as f:
            f.write(data)
    data = open(path, "rb").read()
    if sha(data) != spec["sha256"]:
        sys.exit("SHA-256 mismatch for %s: %s" % (name, sha(data)))
    return path, data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.normpath(os.path.join(HERE, "..", "..")))
    root = os.path.abspath(ap.parse_args().root)
    sys.path.insert(0, os.path.join(root, "python"))
    from nhatnguyet import am_lich as al

    aa98_path, _ = fetch("amlich-aa98.js", SOURCES["amlich-aa98.js"])
    _, zdata = fetch("amlich-js.zip", SOURCES["amlich-js.zip"])
    spec = SOURCES["amlich-js.zip"]
    member = zipfile.ZipFile(io.BytesIO(zdata)).read(spec["member"])
    if sha(member) != spec["member_sha256"]:
        sys.exit("SHA-256 mismatch for %s" % spec["member"])
    hnd_path = os.path.join(DIR, "amlich-hnd.js")
    with open(hnd_path, "wb") as f:
        f.write(member)

    jd0 = al.jd_from_date(1, 1, 1900)
    jd1 = al.jd_from_date(31, 12, 2100)
    out = subprocess.run(["node", "--input-type=module", "-e", NODE, aa98_path, hnd_path,
                          str(jd0), str(jd1)], check=True, capture_output=True, text=True)
    js = json.loads(out.stdout)

    def engine(jd):
        d = al.jd_to_date(jd)
        r = al.solar_to_lunar(d["day"], d["month"], d["year"], 7.0)
        return "%d,%d,%d,%d" % (r["day"], r["month"], r["year"], 1 if r["leap"] else 0)

    diffs = {"aa98": [], "hnd": []}
    for i, jd in enumerate(range(jd0, jd1 + 1)):
        e = engine(jd)
        for key in ("aa98", "hnd"):
            if js[key][i] != e:
                d = al.jd_to_date(jd)
                diffs[key].append(OrderedDict([
                    ("date", "%04d-%02d-%02d" % (d["year"], d["month"], d["day"])),
                    ("engine", e), (key, js[key][i])]))

    # Cause of each difference of the algorithm copy: its month-start search
    # tries the estimated lunation k+1 and then k only, so when the estimate is
    # two lunations ahead the month start stays after the day (lunar day <= 0).
    for row in diffs["aa98"]:
        y, m, dd = (int(x) for x in row["date"].split("-"))
        jd = al.jd_from_date(dd, m, y)
        k = int(al._san((jd - al._SOC_GOC) / al._THANG_SOC))
        row["jdn"] = jd
        row["new_moon_day_k_plus_1"] = int(al.get_new_moon_day(k + 1, 7.0))
        row["new_moon_day_k"] = int(al.get_new_moon_day(k, 7.0))
        row["new_moon_day_k_minus_1"] = int(al.get_new_moon_day(k - 1, 7.0))
        row["cause"] = ("estimate two lunations ahead: new-moon day of k is after the day, "
                        "the published code steps back once (if), the engine until it is not (while)")

    # The table copy: it is not the UTC+7 calendar before 1968. Compare it with
    # the calendar rule in force in China at the time, computed with exact
    # containment (history/generate_tet.py): Beijing meridian before 1929,
    # UTC+8 from 1929, and UTC+7 (Decision 121-CP) from 1968.
    sys.path.insert(0, os.path.join(root, "history"))
    import generate_tet as gt

    def by_rule(jd):
        y = al.jd_to_date(jd)["year"]
        if y < 1929:
            return "beijing-meridian", gt.exact(gt.BEIJING_LMT).lunar(jd)
        if y < 1968:
            return "utc+8", gt.exact(8.0).lunar(jd)
        return "utc+7", gt.exact(7.0).lunar(jd)

    runs = []
    for i, jd in enumerate(range(jd0, jd1 + 1)):
        rule, x = by_rule(jd)
        expect = "%d,%d,%d,%d" % (x["day"], x["month"], x["year"], 1 if x["leap"] else 0)
        if js["hnd"][i] == expect:
            continue
        d = al.jd_to_date(jd)
        date = "%04d-%02d-%02d" % (d["year"], d["month"], d["day"])
        if runs and runs[-1]["_jd"] == jd - 1:
            run = runs[-1]
        else:
            run = OrderedDict([("first", date), ("last", date), ("days", 0), ("rule", rule),
                               ("by_rule_first", expect), ("table_first", js["hnd"][i])])
            runs.append(run)
        run["last"] = date
        run["days"] += 1
        run["_jd"] = jd
    for run in runs:
        del run["_jd"]

    days = jd1 - jd0 + 1
    res = OrderedDict([
        ("range", "1900-01-01 to 2100-12-31"), ("time_zone", 7), ("days", days),
        ("sources", OrderedDict((k, OrderedDict((kk, vv) for kk, vv in v.items()))
                                for k, v in SOURCES.items())),
        ("node", subprocess.run(["node", "--version"], capture_output=True, text=True).stdout.strip()),
        ("aa98_agree", days - len(diffs["aa98"])), ("aa98_differences", diffs["aa98"]),
        ("hnd_table_agree_utc7", days - len(diffs["hnd"])),
        ("hnd_table_differ_utc7_days", len(diffs["hnd"])),
        ("hnd_table_differ_utc7_before_1968_days", sum(1 for x in diffs["hnd"] if x["date"] < "1968")),
        ("hnd_table_rule", "Beijing meridian before 1929, UTC+8 1929-1967, UTC+7 from 1968 (exact containment)"),
        ("hnd_table_differ_from_rule_days", sum(r["days"] for r in runs)),
        ("hnd_table_differ_from_rule", runs),
    ])
    with open(os.path.join(HERE, "results-hnd.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("aa98: %d of %d agree; table vs UTC+7: %d differ; table vs rule: %d runs" % (
        res["aa98_agree"], days, res["hnd_table_differ_utc7_days"], len(runs)))


if __name__ == "__main__":
    main()
