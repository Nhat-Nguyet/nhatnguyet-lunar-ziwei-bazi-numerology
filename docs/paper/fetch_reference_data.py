#!/usr/bin/env python3
"""Download the raw reference data used by the paper into data/raw/.

    python3 docs/paper/fetch_reference_data.py [--only miriade,miriade-json,nasa,iers,de440]

Writes, next to this script:

  data/raw/miriade-sun-{utc,tt}-<n>.csv.gz   IMCCE Miriade ephemcc, apparent
      geocentric ecliptic coordinates of the Sun of date, every 2 days from
      JD 2414960.5 (1899-11-01) for 8 x 5,000 points, with the TT-UTC column.
      Queries are printed below (MIRIADE_URL).
  data/raw/miriade-sun-tt-sample.json   the same query (TT) for two epochs in
      JSON, whose header names the planetary theory ("planetary_theory":
      "INPOP19") and the frame; the CSV output carries neither. Its first row
      is a row of miriade-sun-tt-3.csv.gz.
  data/raw/nasa-phases-{1901,2001}.html.gz   NASA GSFC phase catalogue pages
      (new moons and the Delta T column).
  data/raw/iers-eopc04.txt.gz, data/raw/iers-leap-second.dat
      IERS EOP 20 C04 (UT1-UTC) and Bulletin C leap second table.
  data/raw/de440s.bsp (not committed, 32 MB; checksum recorded in
      data/raw/SHA256SUMS) JPL DE440 short kernel from NAIF.

Every file's SHA-256 is written to data/raw/SHA256SUMS. Standard library only.
The services can change their output over time; the committed files are the
ones the paper used.
"""

import argparse
import gzip
import hashlib
import os
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "data", "raw")

MIRIADE_URL = ("https://ssp.imcce.fr/webservices/miriade/api/ephemcc.php?-name=p:Sun"
               "&-ep={ep}&-nbd=5000&-step=2d&-tscale={ts}&-observer=@500&-teph=2"
               "&-tcoor=1&-rplane=2&-mime=text/csv&-output=--jd,--ttmutc")
MIRIADE_START = 2414960.5
MIRIADE_JSON_URL = ("https://ssp.imcce.fr/webservices/miriade/api/ephemcc.php?-name=p:Sun"
                    "&-ep=2451544.5&-nbd=2&-step=2d&-tscale=TT&-observer=@500&-teph=2"
                    "&-tcoor=1&-rplane=2&-mime=json&-output=--jd,--ttmutc")
NASA_URLS = {"1901": "https://eclipse.gsfc.nasa.gov/phase/phases1901.html",
             "2001": "https://eclipse.gsfc.nasa.gov/phase/phases2001.html"}
IERS_C04 = "https://hpiers.obspm.fr/iers/eop/eopc04/eopc04.1962-now"
IERS_LEAP = "https://hpiers.obspm.fr/iers/bul/bulc/Leap_Second.dat"
DE440S = "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440s.bsp"
UA = {"User-Agent": "nhatnguyet-paper-fetch/1.0 (+https://nhatnguyet.org)"}


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r:
                return r.read()
        except Exception as exc:  # noqa: BLE001
            if i == tries - 1:
                raise
            sys.stderr.write("retry %s: %s\n" % (url, exc))
            time.sleep(5 * (i + 1))


def save_gz(name, data):
    path = os.path.join(RAW, name)
    with gzip.GzipFile(path, "wb", mtime=0) as f:
        f.write(data)
    return path


def save(name, data):
    path = os.path.join(RAW, name)
    with open(path, "wb") as f:
        f.write(data)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="miriade,miriade-json,nasa,iers,de440")
    parts = set(ap.parse_args().only.split(","))
    os.makedirs(RAW, exist_ok=True)
    written = []
    if "miriade" in parts:
        for ts in ("UTC", "TT"):
            for i in range(8):
                ep = MIRIADE_START + i * 10000
                url = MIRIADE_URL.format(ep="%.1f" % ep, ts=ts)
                written.append(save_gz("miriade-sun-%s-%d.csv.gz" % (ts.lower(), i), get(url)))
                print("miriade", ts, i, url)
    if "miriade-json" in parts:
        written.append(save("miriade-sun-tt-sample.json", get(MIRIADE_JSON_URL)))
    if "nasa" in parts:
        for k, url in NASA_URLS.items():
            written.append(save_gz("nasa-phases-%s.html.gz" % k, get(url)))
    if "iers" in parts:
        written.append(save_gz("iers-eopc04.txt.gz", get(IERS_C04)))
        written.append(save("iers-leap-second.dat", get(IERS_LEAP)))
    if "de440" in parts:
        written.append(save("de440s.bsp", get(DE440S)))
    sums = {}
    path = os.path.join(RAW, "SHA256SUMS")
    if os.path.exists(path):
        for line in open(path, encoding="ascii"):
            h, n = line.split()
            sums[n] = h
    for p in written:
        with open(p, "rb") as f:
            sums[os.path.basename(p)] = hashlib.sha256(f.read()).hexdigest()
    with open(path, "w", encoding="ascii") as f:
        for n in sorted(sums):
            f.write("%s  %s\n" % (sums[n], n))
    print("wrote", len(written), "files")


if __name__ == "__main__":
    main()
