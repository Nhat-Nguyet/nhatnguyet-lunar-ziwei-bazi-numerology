"""Kiểm lệnh ``python -m nhatnguyet``: lưới thẳng hàng, JSON, màu, lỗi."""

import json
import os
import re
import subprocess
import sys
import unittest

THU_MUC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, THU_MUC)

from nhatnguyet.__main__ import HELP, display_width, parse_args, run, wrap_items  # noqa: E402

KHONG_MAU = {"color": False, "width": 88}


class TestCli(unittest.TestCase):
    def test_luoi_thang_hang(self):
        for lang in ("en", "vi", "zh"):
            for width in (72, 88, 120):
                out = run(["ziwei", "1990-09-19", "20:00", "male", "--lang", lang], color=False, width=width)
                dong = out.split("\n")
                luoi = dong[: next(i for i, x in enumerate(dong) if x.startswith("└")) + 1]
                rong = display_width(luoi[0])
                self.assertTrue(all(display_width(x) == rong for x in luoi), (lang, width))
                self.assertLessEqual(rong, width)
                self.assertTrue(all(display_width(x) <= max(width, rong) for x in dong), (lang, width))
        self.assertIn("Life Palace", run(["ziwei", "1990-09-19", "20:00", "male"], **KHONG_MAU))
        self.assertIn("命宫", run(["tuvi", "1990-09-19", "20:00", "nam", "--lang", "zh"], **KHONG_MAU))

    def test_mau_va_json(self):
        mau = run(["ziwei", "1990-09-19", "20:00", "male"], color=True, width=88)
        self.assertIn("\x1b[", mau)
        self.assertEqual(re.sub(r"\x1b\[[0-9;]*m", "", mau), run(["ziwei", "1990-09-19", "20:00", "male"], **KHONG_MAU))
        self.assertNotIn("\x1b[", run(["lunar", "2027-02-06", "--no-color"], color=True, width=88))
        j = json.loads(run(["ziwei", "1990-09-19", "20:00", "male", "--json"], **KHONG_MAU))
        self.assertEqual(len(j["chart"]["palaces"]), 12)
        self.assertNotIn("raw", j["chart"])

    def test_cac_lenh(self):
        self.assertIn("Day Master: Đinh (Yin Fire)", run(["bazi", "1990-09-19", "20:00", "male"], **KHONG_MAU))
        self.assertIn("time unknown", run(["bazi", "1990-09-19", "female"], **KHONG_MAU))
        self.assertIn("CN (UTC+8)", run(["lunar", "2027-02-06", "--country", "CN"], **KHONG_MAU))
        self.assertEqual(run(["solar", "2027-01-01"], **KHONG_MAU), "2027-02-06")
        self.assertRegex(run(["numerology", "Nguyen Van An", "1990-09-19", "--today", "2026-11-19"], **KHONG_MAU), r"Life Path\s+11")
        self.assertIn("2027-02-06 │ 1/1 lunar", run(["festivals", "2027"], **KHONG_MAU))
        self.assertIn("09:46", run(["terms", "2027", "--country", "CN"], **KHONG_MAU))

    def test_tro_giup_loi(self):
        self.assertEqual(run([], **KHONG_MAU), HELP)
        with self.assertRaisesRegex(ValueError, "unknown command"):
            run(["nope"], **KHONG_MAU)
        with self.assertRaisesRegex(ValueError, "usage"):
            run(["ziwei", "1990-09-19"], **KHONG_MAU)
        self.assertEqual(parse_args(["lunar", "x", "--country=KR", "--json"]), ("lunar", ["x"], {"country": "KR", "json": True}))
        self.assertEqual(wrap_items(["Tả Phù", "Hữu Bật", "Văn Xương"], ", ", 16), ["Tả Phù, Hữu Bật,", "Văn Xương"])

    def test_svg(self):
        ghi = {}
        txt = run(["ziwei", "1990-09-19", "20:00", "male", "--svg", "a.svg", "--theme", "dark"], color=False, width=88,
                  write_file=lambda p, d: ghi.__setitem__(p, d))
        self.assertEqual(txt, run(["ziwei", "1990-09-19", "20:00", "male"], **KHONG_MAU))
        from nhatnguyet import en
        c = en.cast_zi_wei("1990-09-19", "male", time="20:00")
        self.assertEqual(ghi["a.svg"], en.zi_wei_svg(c, theme="dark") + "\n")

    def test_chay_nhu_chuong_trinh(self):
        env = dict(os.environ, NO_COLOR="1", FORCE_COLOR="1", PYTHONIOENCODING="utf-8")
        r = subprocess.run([sys.executable, "-m", "nhatnguyet", "lunar", "2027-02-06"], cwd=THU_MUC, env=env,
                           capture_output=True, text=True, encoding="utf-8")
        self.assertEqual(r.returncode, 0)
        self.assertIn("Start of Spring", r.stdout)
        self.assertNotIn("\x1b[", r.stdout)
        r = subprocess.run([sys.executable, "-m", "nhatnguyet", "bogus"], cwd=THU_MUC, capture_output=True, text=True)
        self.assertEqual(r.returncode, 1)


if __name__ == "__main__":
    unittest.main()
