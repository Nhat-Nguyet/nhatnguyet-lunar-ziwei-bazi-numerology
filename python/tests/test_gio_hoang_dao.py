"""Giờ hoàng đạo: hàm lõi khớp ca kiểm auspicious-hours.json của lõi Go, lớp
tiếng Anh auspicious_hours chỉ đổi cách viết của chính kết quả ấy."""

import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import auspicious_hours  # noqa: E402
from nhatnguyet._gio_hoang_dao import AUSPICIOUS_SPIRITS, gio_hoang_dao_kem_than  # noqa: E402
from so_sanh import doc_ca_kiem, so_mon  # noqa: E402


class TestGioHoangDao(unittest.TestCase):
    def test_ca_kiem(self):
        dat, tong, lech = so_mon("auspicious-hours", lambda v: gio_hoang_dao_kem_than(v["dd"], v["mm"], v["yyyy"]))
        print("\nauspicious-hours: %d/%d vectors pass" % (dat, tong))
        self.assertEqual(tong, doc_ca_kiem("auspicious-hours")["soCa"])
        self.assertEqual(dat, tong, "\n".join(lech))

    def test_lop_tieng_anh(self):
        for c in doc_ca_kiem("auspicious-hours")["ca"][:200]:
            v, ra = c["vao"], c["ra"]
            d = (v["yyyy"], v["mm"], v["dd"])
            vi = auspicious_hours(d, lang="vi")
            zh = auspicious_hours(d, lang="zh")
            self.assertEqual(vi["day"], ra["canChiNgay"])
            self.assertEqual(zh["day"], ra["canChiNgayZh"])
            for i, g in enumerate(ra["gio"]):
                self.assertEqual(vi["hours"][i]["branch"], g["chi"])
                self.assertEqual(vi["hours"][i]["auspicious"], g["hoangDao"])
                self.assertEqual(vi["hours"][i]["spirit"], g["than"])
                self.assertEqual(zh["hours"][i]["spirit"], g["thanZh"])
                self.assertEqual(vi["hours"][i]["auspicious"], g["thuTuThan"] in AUSPICIOUS_SPIRITS)

    def test_tieng_anh_2027_02_06(self):
        r = auspicious_hours("2027-02-06")
        self.assertEqual((r["date"], r["day"], r["dayBranch"]), ("2027-02-06", "Bing Chen", "Chen"))
        self.assertEqual(r["hours"][0], {"index": 0, "branch": "Zi", "animal": "Rat", "range": "23:00-00:59",
                                         "auspicious": False, "spirit": "Tian Lao", "spiritIndex": 8})
        self.assertEqual(["%s %s %s" % (h["branch"], h["range"], h["spirit"]) for h in r["hours"] if h["auspicious"]],
                         ["Yin 03:00-04:59 Si Ming", "Chen 07:00-08:59 Qing Long", "Si 09:00-10:59 Ming Tang",
                          "Shen 15:00-16:59 Jin Kui", "You 17:00-18:59 Bao Guang", "Hai 21:00-22:59 Yu Tang"])
        self.assertEqual(auspicious_hours("2027-02-06", terms="han")["hours"][4]["spirit"], "青龙")
        with self.assertRaises(ValueError):
            auspicious_hours("2027-02-30")


if __name__ == "__main__":
    unittest.main()
