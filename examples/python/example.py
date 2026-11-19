"""Nhat Nguyet from Python: pip install nhatnguyet, then python example.py.

Writes chart.svg, bazi.svg and numerology.svg next to this file.
"""
from pathlib import Path

from nhatnguyet import (
    bazi_svg, cast_bazi, cast_zi_wei, numerology, numerology_svg, to_lunar, zi_wei_svg,
)

here = Path(__file__).resolve().parent
birth = dict(date="1990-09-19", time="20:00", gender="male")

# Lunar calendar: the same day can differ between Vietnam (UTC+7) and China (UTC+8).
vn = to_lunar("1985-01-21")
cn = to_lunar("1985-01-21", country="CN")
print(f"1985-01-21  Vietnam: {vn['year']}-{vn['month']}-{vn['day']}  China: {cn['year']}-{cn['month']}-{cn['day']}")

chart = cast_zi_wei(name="Nguyen Van An", **birth)
life = chart["palaces"][chart["lifePalace"]]
majors = ", ".join(s["name"] for s in life["stars"] if s["kind"] == "major")
print(f"Zi Wei: {chart['bureau']['name']}, Life palace in {life['branch']}: {majors}")
(here / "chart.svg").write_text(zi_wei_svg(chart), encoding="utf-8")

bz = cast_bazi(**birth)
print("BaZi:", " | ".join(str((bz["pillars"].get(p) or {}).get("label")) for p in ("year", "month", "day", "hour")))
(here / "bazi.svg").write_text(bazi_svg(bz, name="Nguyen Van An"), encoding="utf-8")

n = numerology("Nguyen Van An", birth["date"], today="2026-11-19")
print(f"Numerology: life path {n['lifePath']}, expression {n['expression']}")
(here / "numerology.svg").write_text(numerology_svg(n), encoding="utf-8")
