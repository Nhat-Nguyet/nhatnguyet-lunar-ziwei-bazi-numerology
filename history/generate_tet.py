"""Regenerate tet-1900-2100.csv: the date of Tết (lunar New Year) computed by
the Nhat Nguyet engine at UTC+7, at UTC+8 and at the Beijing meridian
(116°25′ E, local mean time UTC+7h45m40s), next to the Tết actually used in
Vietnam where a source documents it.

    python3 history/generate_tet.py            # rewrite the CSV
    python3 history/generate_tet.py --check    # compare with the CSV, exit 1 on drift
    python3 history/generate_tet.py --summary  # print the figures quoted in README

Standard library only, plus the Python package in ../python (run from source).
The historical columns are NOT computed: they are sourced facts declared by
hand in ATTESTED below, each with source ids that point to the README.

tet_utc7 is the engine's published date. tet_utc8 and tet_beijing_meridian are
computed with exact containment (ExactCalendar): the engine's new moons, and
the major solar terms solved without rounding from the engine's solar-term module,
assigned to civil days at that offset. The engine's own month test (the 30°
sector of a low-precision solar longitude at local midnight) agrees with it at
UTC+7 and UTC+8; at the Beijing meridian it places month 11 of 1984 wrongly and
would give Tết 1985 on 21 January.
"""

from __future__ import annotations

import csv
import bisect
import datetime as dt
import io
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "python"))

from nhatnguyet import am_lich  # noqa: E402

CSV_PATH = os.path.join(HERE, "tet-1900-2100.csv")
FIRST_YEAR, LAST_YEAR = 1900, 2100

# Source ids; full references with URLs and quotes are in README.md (Sources).
SOURCES = {
    "S1": "Decision 121-CP (1967), Government Council of the DRV",
    "S2": "Aslaksen, The Mathematics of the Chinese Calendar (2010), pp. 28-29",
    "S4": "Le Thanh Lan, The Calendars of Southeast Asia 3: Vietnam (JAHH 22, 2019)",
    "S5": "IANA tz database, file asia, Vietnam notes (after Tran Tien Binh 2005)",
    "S6": "Nhan Dan, 03/02/2025 (Quang Tho), retrospective article",
    "S7": "VnExpress, 21/07/2006, quoting Tran Tien Binh (State Calendar Board)",
    "S8": "Ho Ngoc Duc, Computing the Vietnamese lunar calendar",
    "S9": "Tien Phong, 29/04/2005",
    "S10": "NASA, Espenak, Six Millennium Catalog of Phases of the Moon",
}

# Calendar rule ids. A rule that is a meridian gives a computable date; the
# Nguyễn court calendar (Hiệp Kỷ, Khâm Thiên Giám) does not map to one.
# The almanac meridian is not the civil clock time: the tz database (S5) and
# Tiền Phong (S9) document clock time only.
RULE_NGUYEN = "nguyen-court-calendar"
RULE_BEIJING = "beijing-meridian-116e25"
RULE_VN_UTC7 = "utc+7-decision-121-cp"

# Beijing meridian, 116°25′ E, as a time offset in hours (S2).
BEIJING_LMT = (116 + 25 / 60) / 15

# (first lunar year, last lunar year, rule north, rule south, sources).
# 1946-1967 and the South until 1975: Aslaksen writes that "traditionally" the
# Vietnamese used the Chinese calendar "based on the longitude of Beijing
# (116°25′ East)" and that in 1968 the South reckoned the new moon at that
# meridian (S2). He does not give the period, and Decision 121-CP art. 2
# says the lunar calendars before 1968 had "many bases" (S1), so these rows
# are the rule by inference, not a record of printed almanacs. Tết in
# 1946-1964 is the same at UTC+7, UTC+8 and the Beijing meridian.
PERIODS = [
    (1900, 1945, RULE_NGUYEN, RULE_NGUYEN, "S4"),
    (1946, 1954, RULE_BEIJING, RULE_BEIJING, "S1 S2"),
    (1955, 1967, RULE_BEIJING, RULE_BEIJING, "S1 S2"),
    (1968, 1975, RULE_VN_UTC7, RULE_BEIJING, "S1 S2"),
    (1976, 2100, RULE_VN_UTC7, RULE_VN_UTC7, "S1"),
]

# Tết dates stated by a source: year -> (north, south, status, sources).
# Empty means the source is silent. Outside 1955-1975 north and south are the
# whole country. "attested": a source states the date; "reported (secondary)":
# only a later retrospective source states it. 1985 is not listed: the State
# Calendar Board statement (S7) concerns the 1984 leap month, and Hồ Ngọc Đức
# (S8) computes the date with the algorithm under test, so neither attests
# the Tết that was observed.
ATTESTED = {
    1965: ("1965-02-02", "", "reported (secondary)", "S6"),
    1968: ("1968-01-29", "1968-01-30", "attested", "S2"),
    2007: ("2007-02-17", "2007-02-17", "attested", "S7"),
}

# New moon before Tết (NASA, UT, to the minute) for the years where Tết at
# UTC+7 and UTC+8 differ.
NASA_NEW_MOON_UT = {
    1903: "1903-01-28 16:39",
    1916: "1916-02-03 16:05",
    1935: "1935-02-03 16:27",
    1965: "1965-02-01 16:36",
    1968: "1968-01-29 16:29",
    1969: "1969-02-16 16:25",
    1985: "1985-01-21 02:28",
    2007: "2007-02-17 16:14",
    2030: "2030-02-02 16:07",
    2053: "2053-02-18 16:31",
}

COLUMNS = [
    "year", "year_name_vi", "tet_utc7", "tet_utc8", "tet_beijing_meridian",
    "utc7_utc8_differ", "diff_days",
    "nasa_new_moon_ut", "split", "rule_north", "rule_south",
    "tet_by_rule_north", "tet_by_rule_south",
    "tet_as_used_north", "tet_as_used_south", "as_used_status", "sources",
]


MEAN_MOTION_DEG_PER_DAY = 360 / 365.2422


def major_term_ut(year: int, longitude: int) -> float:
    """UT Julian date at which the engine's apparent solar longitude reaches
    `longitude` (a multiple of 30°) in Gregorian year `year`, unrounded
    (Newton iteration with the mean motion as derivative, to 1e-8 day)."""
    jd = am_lich.jd_from_date(20, 3, year) - 0.5 + (longitude % 360) / MEAN_MOTION_DEG_PER_DAY
    if jd > am_lich.jd_from_date(31, 12, year) + 0.5:
        jd -= 365.2422
    for _ in range(50):
        d = (am_lich.kinh_do_mat_troi_ut(jd) - longitude + 180) % 360 - 180
        step = d / MEAN_MOTION_DEG_PER_DAY
        jd -= step
        if abs(step) < 1e-8:
            break
    return jd


class ExactCalendar:
    """The calendar rule applied with exact containment at a UTC offset: a
    month starts on the civil day of the engine's new moon; month 11 is the
    month whose days contain the civil day of the December solstice; in a
    13-month year the first month after month 11 that contains no major
    term is leap. Major terms come from major_term_ut, not from a sector test."""

    def __init__(self, utc_offset: float, first_year: int = FIRST_YEAR - 2, last_year: int = LAST_YEAR + 2):
        def day(jd):
            return int(math.floor(jd + 0.5 + utc_offset / 24))

        terms = sorted((day(major_term_ut(y, lon)), lon) for y in range(first_year, last_year + 1)
                       for lon in range(0, 360, 30))
        term_days = [d for d, _ in terms]
        k0 = int(math.floor((am_lich.jd_from_date(1, 1, first_year) - am_lich._SOC_GOC) / am_lich._THANG_SOC))
        k1 = int(math.floor((am_lich.jd_from_date(31, 12, last_year) - am_lich._SOC_GOC) / am_lich._THANG_SOC)) + 2
        starts = [day(am_lich.new_moon(k)) for k in range(k0, k1 + 1)]

        def index_of(d):
            return bisect.bisect_right(starts, d) - 1

        def has_term(i):
            j = bisect.bisect_left(term_days, starts[i])
            return j < len(term_days) and term_days[j] < starts[i + 1]

        m11 = sorted({index_of(d) for d, lon in terms if lon == 270 and starts[0] <= d < starts[-1]})
        months = []  # (start day, month, leap, lunar year)
        for a, b in zip(m11, m11[1:]):
            leap = -1
            if b - a == 13:
                leap = next(j for j in range(a + 1, b) if not has_term(j))
            year = am_lich.jd_to_date(starts[a])["year"]  # lunar year of month 11
            month = 11
            for j in range(a, b):
                if j == a:
                    month = 11
                elif j != leap:
                    month = month % 12 + 1
                    if month == 1:
                        year += 1
                months.append((starts[j], month, j == leap, year))
        self.months = months
        self.starts = [m[0] for m in months]

    def lunar(self, jdn: int) -> dict:
        i = bisect.bisect_right(self.starts, jdn) - 1
        s, m, leap, y = self.months[i]
        return {"day": jdn - s + 1, "month": m, "year": y, "leap": leap}

    def tet(self, year: int) -> int:
        return next(s for s, m, leap, y in self.months if y == year and m == 1 and not leap)

    def leap_month(self, year: int) -> int:
        return next((m for s, m, leap, y in self.months if y == year and leap), 0)


_EXACT = {}


def exact(utc_offset: float) -> ExactCalendar:
    if utc_offset not in _EXACT:
        _EXACT[utc_offset] = ExactCalendar(utc_offset)
    return _EXACT[utc_offset]


def iso(jdn: int) -> str:
    d = am_lich.jd_to_date(jdn)
    return f"{d['year']:04d}-{d['month']:02d}-{d['day']:02d}"


def tet_date(year: int, utc_offset: float) -> str:
    """Tết: the engine's date at UTC+7, exact containment at other offsets."""
    if utc_offset != 7.0:
        return iso(exact(utc_offset).tet(year))
    d, ok = am_lich.lunar_to_solar(1, 1, year, False, utc_offset)
    if not ok:
        raise ValueError(f"cannot convert Tết {year}")
    return f"{d['year']:04d}-{d['month']:02d}-{d['day']:02d}"


def leap_month(year: int, utc_offset: float) -> int:
    if utc_offset != 7.0:
        return exact(utc_offset).leap_month(year)
    # lunar_to_solar ignores the leap flag in a year without a leap month, so
    # a month is leap only when its leap form starts on a different day.
    for m in range(1, 13):
        leap, ok = am_lich.lunar_to_solar(1, m, year, True, utc_offset)
        if ok and leap != am_lich.lunar_to_solar(1, m, year, False, utc_offset)[0]:
            return m
    return 0


def lunar_date(jdn: int, utc_offset: float) -> dict:
    """Lunar date of a civil day: the engine at UTC+7, exact containment elsewhere."""
    if utc_offset != 7.0:
        return exact(utc_offset).lunar(jdn)
    d = am_lich.jd_to_date(jdn)
    return am_lich.solar_to_lunar(d["day"], d["month"], d["year"], utc_offset)


def period_of(year: int):
    for first, last, north, south, sources in PERIODS:
        if first <= year <= last:
            return north, south, sources
    raise ValueError(year)


def date_by_rule(rule: str, tet7: str, tet_bj: str) -> str:
    if rule == RULE_VN_UTC7:
        return tet7
    if rule == RULE_BEIJING:
        return tet_bj
    return ""


def unique_ids(text: str) -> str:
    return " ".join(dict.fromkeys(text.split()))


def row(year: int) -> dict:
    tet7, tet8, tet_bj = tet_date(year, 7.0), tet_date(year, 8.0), tet_date(year, BEIJING_LMT)
    diff = (dt.date.fromisoformat(tet7) - dt.date.fromisoformat(tet8)).days
    north, south, period_sources = period_of(year)
    used_north, used_south, status, used_sources = ATTESTED.get(
        year, ("", "", "computed (no historical source)", ""))
    sources = unique_ids(f"{period_sources} {used_sources}")
    if year in NASA_NEW_MOON_UT:
        sources = unique_ids(f"{sources} S10")
    return {
        "year": year,
        "year_name_vi": am_lich.year_can_chi(year)["label"],
        "tet_utc7": tet7,
        "tet_utc8": tet8,
        "tet_beijing_meridian": tet_bj,
        "utc7_utc8_differ": 1 if tet7 != tet8 else 0,
        "diff_days": diff,
        "nasa_new_moon_ut": NASA_NEW_MOON_UT.get(year, ""),
        "split": 1 if 1955 <= year <= 1975 else 0,
        "rule_north": north,
        "rule_south": south,
        "tet_by_rule_north": date_by_rule(north, tet7, tet_bj),
        "tet_by_rule_south": date_by_rule(south, tet7, tet_bj),
        "tet_as_used_north": used_north,
        "tet_as_used_south": used_south,
        "as_used_status": status,
        "sources": sources,
    }


def build_csv() -> str:
    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=COLUMNS, lineterminator="\n")
    writer.writeheader()
    for year in range(FIRST_YEAR, LAST_YEAR + 1):
        writer.writerow(row(year))
    return out.getvalue()


def summary() -> dict:
    """Figures quoted in README: days whose lunar date differs between UTC+7
    and UTC+8, the runs they form, Tết years and leap months that differ."""
    day = dt.date(FIRST_YEAR, 1, 1)
    end = dt.date(LAST_YEAR, 12, 31)
    total = differ = 0
    runs = []  # [first day, last day] of each run of consecutive differing days
    previous = False
    while day <= end:
        j = am_lich.jd_from_date(day.day, day.month, day.year)
        a, b = lunar_date(j, 7.0), lunar_date(j, 8.0)
        now = a != b
        total += 1
        if now:
            differ += 1
            if previous:
                runs[-1][1] = day.isoformat()
            else:
                runs.append([day.isoformat(), day.isoformat()])
        previous = now
        day += dt.timedelta(1)
    years = range(FIRST_YEAR, LAST_YEAR + 1)
    return {
        "days": total,
        "days_differ": differ,
        "runs": len(runs),
        "tet_years_differ": [y for y in years if tet_date(y, 7.0) != tet_date(y, 8.0)],
        "leap_month_differ": [(y, leap_month(y, 7.0), leap_month(y, 8.0))
                              for y in years if leap_month(y, 7.0) != leap_month(y, 8.0)],
        "runs_2020_2035": [r for r in runs if "2020" <= r[0][:4] <= "2035"],
        "south_1955_1975_beijing_vs_utc8": beijing_vs_utc8(1955, 1975),
    }


def beijing_vs_utc8(first: int, last: int) -> dict:
    """Days and Tết years in [first, last] on which the Beijing meridian and
    UTC+8 give different lunar dates."""
    day, end = dt.date(first, 1, 1), dt.date(last, 12, 31)
    differ = 0
    while day <= end:
        j = am_lich.jd_from_date(day.day, day.month, day.year)
        if lunar_date(j, BEIJING_LMT) != lunar_date(j, 8.0):
            differ += 1
        day += dt.timedelta(1)
    years = [y for y in range(first, last + 1) if tet_date(y, BEIJING_LMT) != tet_date(y, 8.0)]
    return {"days_differ": differ, "tet_years_differ": years}


def main(argv) -> int:
    content = build_csv()
    if "--check" in argv:
        with open(CSV_PATH, encoding="utf-8") as f:
            current = f.read()
        if current != content:
            print("tet-1900-2100.csv drifted from the engine; rerun generate_tet.py", file=sys.stderr)
            return 1
        print("tet-1900-2100.csv matches the engine")
        return 0
    if "--summary" in argv:
        for key, value in summary().items():
            print(f"{key}: {value}")
        return 0
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        f.write(content)
    print(f"wrote {CSV_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
