import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import re  # noqa: E402

from nhatnguyet import en, le_hoi  # noqa: E402
from so_sanh import so_mon  # noqa: E402


class TestLeHoi(unittest.TestCase):
    def test_ca_kiem(self):
        dat, tong, lech = so_mon("le-hoi", lambda vao: le_hoi.le_hoi_trong_nam(vao["nam"]) or None)
        print("\nle-hoi: %d/%d ca đạt" % (dat, tong))
        self.assertGreater(tong, 0)
        self.assertEqual(dat, tong, "\n".join(lech))

    def test_tet_2026(self):
        self.assertTrue(any(x["id"] == "tet-nguyen-dan" for x in le_hoi.le_hoi_theo_ngay(17, 2, 2026)))



def _doc_ics(ics):
    """Đọc ngược iCalendar theo RFC 5545: nối dòng gập, tách thuộc tính."""
    assert ics.endswith("\r\n") and not re.search(r"[^\r]\n", ics)
    for dong in ics[:-2].split("\r\n"):
        assert len(dong.encode("utf-8")) <= 75, dong
    cal, events, cur = [], [], None
    for dong in re.sub(r"\r\n[ \t]", "", ics[:-2]).split("\r\n"):
        m = re.match(r"^([A-Z-]+)((?:;[^:]*)?):(.*)$", dong)
        assert m, dong
        p = (m.group(1), m.group(2), m.group(3))
        if p[0] == "BEGIN" and p[2] == "VEVENT":
            cur = []
        elif p[0] == "END" and p[2] == "VEVENT":
            events.append(cur)
            cur = None
        else:
            (cur if cur is not None else cal).append(p)
    return cal, events


def _go(s):
    return re.sub(r"\\(.)", lambda m: "\n" if m.group(1) in "nN" else m.group(1), s)


class TestFestivalsIcs(unittest.TestCase):
    def test_ics_hop_le(self):
        for lang in ("en", "vi", "zh"):
            ics = en.festivals_ics(2027, lang=lang)
            self.assertEqual(ics, en.festivals_ics(2027, lang=lang))
            cal, events = _doc_ics(ics)
            d = {k: v for k, _, v in cal}
            self.assertEqual(d["VERSION"], "2.0")
            self.assertIn("nhatnguyet.org", _go(d["X-WR-CALDESC"]))
            ds = en.festivals(2027, lang=lang)
            self.assertEqual(len(events), len(ds))
            uids = set()
            for ev, f in zip(events, ds):
                e = {k: (pa, v) for k, pa, v in ev}
                self.assertEqual(e["UID"][1], "%s-2027@nhatnguyet.org" % f["id"])
                uids.add(e["UID"][1])
                self.assertEqual(e["DTSTART"][0], ";VALUE=DATE")
                self.assertEqual(_go(e["SUMMARY"][1]), f["name"])
                self.assertRegex(e["DTSTAMP"][1], r"^\d{8}T\d{6}Z$")
            self.assertEqual(len(uids), len(events))

    def test_cli_ics(self):
        from nhatnguyet.__main__ import run
        out = run(["festivals", "2027", "--ics"], color=False, width=88)
        self.assertEqual(out + "\n", en.festivals_ics(2027))

    def test_khoa_tieng_anh(self):
        pv = le_hoi.provinces()
        self.assertEqual(len(pv), 34)
        codes = {p["code"] for p in pv}
        ds = en.festivals(2027)
        for f in ds:
            for p in f["provinces"]:
                self.assertIn(p["code"], codes)
            for v in f["venues"]:
                self.assertEqual(v["coordinates"] is None, v["sourceUrl"] is None)
        self.assertTrue(any(f["provinces"] for f in ds))
        ma_viet = {"le-tet", "tin-nguong", "khac", "quoc-gia", "vung", "dia-phuong", "dai-dien", "co", "khong",
                   "chuan", "pho-bien-nhat", "cong-bo-theo-nam", "theo-nam", "bien-tap"}

        def di(v, fid):
            if isinstance(v, str):
                self.assertNotIn(v, ma_viet, fid)
            elif isinstance(v, list):
                for x in v:
                    di(x, fid)
            elif isinstance(v, dict):
                for x in v.values():
                    di(x, fid)
        for lang in ("en", "vi", "zh"):
            for f in en.festivals(2027, lang=lang):
                self.assertIn(f["group"], ("holiday", "folk-religion", "other"))
                self.assertIn(f["scope"], ("national", "regional", "local", "representative", ""))
                di({k: v for k, v in f.items() if k != "raw"}, f["id"])
        self.assertTrue(any(f["nationwide"] for f in ds))


if __name__ == "__main__":
    unittest.main()
