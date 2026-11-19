"""Gói xuất lớp API tiếng Anh, và năm mô-đun bí danh tiếng Anh (lunar, ziwei,
bazi, numerology, festivals) như năm gói npm cùng tên."""

import doctest
import importlib
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

import nhatnguyet  # noqa: E402
from nhatnguyet import am_lich, bat_tu, en, than_so_hoc, tu_vi, tu_vi_chuc_nang  # noqa: E402

BI_DANH = ("lunar", "ziwei", "bazi", "numerology", "festivals")


class TestBiDanh(unittest.TestCase):
    def test_goi_xuat_lop_tieng_anh(self):
        # Mọi tên trong en.__all__ không bắt đầu bằng chữ Việt lõi đều có ở gốc gói.
        for ten in en.__all__:
            self.assertTrue(hasattr(nhatnguyet, ten), ten)
        for ten in tu_vi_chuc_nang.__all__:
            self.assertIs(getattr(nhatnguyet, ten), getattr(tu_vi_chuc_nang, ten), ten)
        for ten in nhatnguyet.__all__:
            self.assertTrue(hasattr(nhatnguyet, ten), ten)
        self.assertIs(nhatnguyet.auspicious_hours, en.auspicious_hours)

    def test_mo_dun_bi_danh(self):
        for ten in BI_DANH:
            m = importlib.import_module("nhatnguyet." + ten)
            for k in m.__all__:
                self.assertTrue(hasattr(m, k), "%s.%s" % (ten, k))
            self.assertEqual(len(m.__all__), len(set(m.__all__)), ten)
        import nhatnguyet.lunar as lunar
        import nhatnguyet.ziwei as ziwei
        import nhatnguyet.bazi as bazi
        for k in am_lich.__all__:
            self.assertIs(getattr(lunar, k), getattr(am_lich, k))
        for k in tu_vi.__all__:
            self.assertIs(getattr(ziwei, k), getattr(tu_vi, k))
        for k in bat_tu.__all__:
            self.assertIs(getattr(bazi, k), getattr(bat_tu, k))
        self.assertIs(ziwei.cast_zi_wei, en.cast_zi_wei)
        self.assertIs(ziwei.horoscope, tu_vi_chuc_nang.horoscope)
        self.assertIs(lunar.auspicious_hours, en.auspicious_hours)

    def test_hai_mo_dun_goi_duoc(self):
        # numerology và festivals vừa là mô-đun vừa gọi được như hàm cùng tên.
        import nhatnguyet.festivals as fe
        import nhatnguyet.numerology as nm
        from nhatnguyet import festivals, numerology
        self.assertIs(numerology, nm)
        self.assertIs(festivals, fe)
        self.assertEqual(numerology("Nguyen Van An", "1990-09-19", today="2026-01-01"),
                         en.numerology("Nguyen Van An", "1990-09-19", today="2026-01-01"))
        self.assertEqual(festivals(2027, lang="vi"), en.festivals(2027, lang="vi"))
        self.assertIs(nm.numerology, en.numerology)
        self.assertIs(fe.festivals, en.festivals)
        self.assertIs(nm.so_duong_doi, than_so_hoc.so_duong_doi)

    def test_doctest(self):
        for ten in BI_DANH:
            kq = doctest.testmod(importlib.import_module("nhatnguyet." + ten))
            self.assertEqual(kq.failed, 0, ten)
            self.assertGreater(kq.attempted, 0, ten)
        self.assertEqual(doctest.run_docstring_examples(en.auspicious_hours, {"auspicious_hours": en.auspicious_hours}), None)


if __name__ == "__main__":
    unittest.main()
