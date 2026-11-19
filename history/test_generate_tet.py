"""Checks for history/tet-1900-2100.csv.

    python3 -m unittest discover -s history
"""

import csv
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generate_tet as g  # noqa: E402


def rows():
    with open(g.CSV_PATH, encoding="utf-8") as f:
        return {int(r["year"]): r for r in csv.DictReader(f)}


class TestTetHistory(unittest.TestCase):
    def test_csv_matches_engine(self):
        with open(g.CSV_PATH, encoding="utf-8") as f:
            self.assertEqual(f.read(), g.build_csv())

    def test_differing_years(self):
        differ = [y for y, r in rows().items() if r["utc7_utc8_differ"] == "1"]
        self.assertEqual(differ, [1903, 1916, 1935, 1965, 1968, 1969, 1985, 2007, 2030, 2053])
        self.assertEqual(sorted(g.NASA_NEW_MOON_UT), differ)

    def test_attested_dates_follow_the_rule_in_force(self):
        # Every attested date must equal the date computed under the rule the
        # sources say was in force; a mismatch means a rule or a fact is wrong.
        for year, r in rows().items():
            for side in ("north", "south"):
                used = r[f"tet_as_used_{side}"]
                if used:
                    self.assertEqual(used, r[f"tet_by_rule_{side}"], (year, side))

    def test_leap_months_1984_1985(self):
        # State Calendar Board (S7): no leap month in Vietnam in 1984, China
        # leap 10. Leap month 2 in Vietnam in 1985 is computed (S8 computes it
        # with the same algorithm), not attested.
        self.assertEqual((g.leap_month(1984, 7.0), g.leap_month(1984, 8.0)), (0, 10))
        self.assertEqual((g.leap_month(1985, 7.0), g.leap_month(1985, 8.0)), (2, 0))

    def test_1968_split(self):
        r = rows()[1968]
        self.assertEqual((r["tet_as_used_north"], r["tet_as_used_south"]),
                         ("1968-01-29", "1968-01-30"))
        # The South reckoned at the Beijing meridian in 1968 (S2), not UTC+8.
        self.assertEqual(r["rule_south"], g.RULE_BEIJING)
        self.assertEqual(r["tet_by_rule_south"], "1968-01-30")

    def test_status_values(self):
        allowed = {"attested", "reported (secondary)", "computed (no historical source)"}
        r = rows()
        for row in r.values():
            self.assertIn(row["as_used_status"], allowed)
        self.assertEqual(r[1965]["as_used_status"], "reported (secondary)")
        self.assertEqual(r[1985]["as_used_status"], "computed (no historical source)")
        self.assertEqual(r[1985]["tet_as_used_north"], "")
        self.assertEqual(r[2007]["as_used_status"], "attested")

    def test_rules_are_meridians_not_clock_time(self):
        rules = {r["rule_north"] for r in rows().values()} | {r["rule_south"] for r in rows().values()}
        self.assertEqual(rules, {g.RULE_NGUYEN, g.RULE_BEIJING, g.RULE_VN_UTC7})

    def test_every_source_id_is_declared(self):
        for r in rows().values():
            for sid in r["sources"].split():
                self.assertIn(sid, g.SOURCES)

    def test_new_moon_falls_between_vietnam_and_china_midnights(self):
        # One-day differences: the new moon falls between 16:00 and 17:00 UT,
        # before midnight at UTC+7 and after midnight at UTC+8, so the month
        # starts a day earlier in Vietnam. 1985 is the leap-month case.
        for year, stamp in g.NASA_NEW_MOON_UT.items():
            if year == 1985:
                continue
            hour = int(stamp[11:13])
            self.assertEqual(hour, 16, year)
            self.assertEqual(stamp[:10], rows()[year]["tet_utc7"], year)

    def test_exact_containment_equals_engine_at_utc7_and_utc8(self):
        # The engine's sector test is exact at UTC+7 and at UTC+8 over
        # 1900-2100: every day has the same lunar date.
        am = g.am_lich
        for tz in (7.0, 8.0):
            cal = g.ExactCalendar(tz)
            for j in range(am.jd_from_date(1, 1, 1900), am.jd_from_date(31, 12, 2100) + 1):
                d = am.jd_to_date(j)
                e = am.solar_to_lunar(d["day"], d["month"], d["year"], tz)
                x = cal.lunar(j)
                self.assertEqual((x["day"], x["month"], x["year"], x["leap"]),
                                 (e["day"], e["month"], e["year"], e["leap"]), (tz, d))

    def test_beijing_meridian_1985_uses_exact_containment(self):
        # December 1984 solstice 16:22:49 UT is 00:08 on 22 December at the
        # Beijing meridian, the day of the new moon, so month 11 starts on
        # 22 December and Tết 1985 is 20 February. The engine's sector test
        # gives 21 January at this offset; the CSV must not.
        self.assertEqual(rows()[1985]["tet_beijing_meridian"], "1985-02-20")
        am = g.am_lich
        d, _ = am.lunar_to_solar(1, 1, 1985, False, g.BEIJING_LMT)
        self.assertEqual((d["year"], d["month"], d["day"]), (1985, 1, 21))
        self.assertEqual(g.leap_month(1984, g.BEIJING_LMT), 10)


if __name__ == "__main__":
    unittest.main()
