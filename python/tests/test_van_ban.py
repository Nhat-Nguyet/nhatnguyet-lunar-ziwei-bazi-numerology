"""Kiểm chart_to_text (văn bản cho mô hình ngôn ngữ). Bản TypeScript gọi bản
này để so ĐÚNG TỪNG BYTE (js/kiem/van-ban-python.ts); ở đây chỉ soát khuôn."""

import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from nhatnguyet import cast_bazi, cast_zi_wei, chart_to_text, numerology, tu_vi  # noqa: E402


class TestVanBan(unittest.TestCase):
    def test_tu_vi(self):
        c = cast_zi_wei(date="1990-09-19", time="20:00", gender="male", name="Nguyen Van An")
        s = chart_to_text(c, year=2026)
        self.assertTrue(s.endswith("\nData: Nhat Nguyet (nhatnguyet.org)\n"))
        self.assertEqual(sum(1 for x in s.splitlines() if x.startswith("### ")), 12)
        self.assertIn("### Life Palace (Hợi, Đinh Hợi) · Tuần void\n- Major stars: Moon (Exalted, Hóa Kỵ)\n", s)
        self.assertIn("## Year 2026 (Bính Ngọ), East Asian age 37\n", s)
        zh = chart_to_text(c, lang="zh", detail="summary")
        self.assertIn("### 命宫 (亥, 丁亥) · 旬空\n- 主星：太阴 (庙, 化忌)\n", zh)
        self.assertTrue(zh.endswith("数据：Nhat Nguyet (nhatnguyet.org)\n"))
        raw = tu_vi.lap_la_so_tu_vi("", "Nữ", 13, 2, 1985, 3)
        self.assertTrue(chart_to_text(raw, lang="vi").endswith("Dữ liệu: Nhật Nguyệt (nhatnguyet.org)\n"))
        self.assertNotIn("—", s + zh)

    def test_bat_tu_va_than_so_hoc(self):
        b = chart_to_text(cast_bazi(date="1990-09-19", gender="female", lang="vi"))
        self.assertIn("### Trụ giờ: chưa biết giờ\n", b)
        n = chart_to_text(numerology("Nguyen Van An", "1990-09-19", today="2026-11-19"))
        self.assertIn("- Life Path: 11\n", n)
        self.assertIn("- Personal Year (2026): 2\n", n)

    def test_loi(self):
        c = cast_zi_wei(date="1990-09-19", time="20:00", gender="male")
        with self.assertRaises(TypeError):
            chart_to_text(c, detail="short")
        with self.assertRaises(TypeError):
            chart_to_text({"x": 1})
        with self.assertRaises(TypeError):
            chart_to_text(cast_bazi(date="1990-09-19", gender="male"), year=2026)


if __name__ == "__main__":
    unittest.main()
