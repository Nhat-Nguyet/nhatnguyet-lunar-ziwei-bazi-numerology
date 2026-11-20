"""Lớp tiếng Anh của nhatnguyet.iching: tra tên, quẻ liên quan, gieo quẻ, Lục
Hào, Quái khí, văn bản cổ, hình SVG (băm chung với bản TypeScript)."""

import hashlib
import json
import os
import re
import sys
import unittest
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from nhatnguyet import iching  # noqa: E402

_THU_MUC = os.path.dirname(os.path.abspath(__file__))
_VIET = re.compile("[ăâđêôơưạảãậẩẫầấắằẳẵặẹẻẽếềểễệịỉĩọỏõốồổỗộớờởỡợụủũứừửữựỳỵỷỹĂÂĐÊÔƠƯ]")


def _chu(x, bo=("nameVi", "raw", "pinyin")):
    if isinstance(x, dict):
        return "".join(_chu(v, bo) for k, v in x.items() if k not in bo)
    if isinstance(x, list):
        return "".join(_chu(v, bo) for v in x)
    return x if isinstance(x, str) else ""


class TestHexagram(unittest.TestCase):
    def test_lookup(self):
        h = iching.hexagram(11)
        self.assertEqual((h["name"], h["pinyin"], h["nameHan"], h["nameVi"]), ("Peace", "Tài", "泰", "Địa Thiên Thái"))
        for v in ("Peace", "peace", "泰", "Địa Thiên Thái", "dia thien thai", "Thái", "tai", "Tài",
                  [1, 1, 1, 0, 0, 0], [True, True, True, False, False, False], "111000", {"number": 11}):
            self.assertEqual(iching.hexagram_number(v), 11, v)
        self.assertEqual(iching.hexagram_number("The Creative"), 1)
        self.assertEqual(iching.hexagram_number("Creative"), 1)
        self.assertEqual(iching.hexagram_number("Kùn"), 47)
        for mo_ho in ("lu", "Lǚ", "jian", "yi"):
            with self.assertRaises(ValueError):
                iching.hexagram(mo_ho)
        with self.assertRaises(ValueError):
            iching.hexagram(65)
        with self.assertRaises(ValueError):
            iching.hexagram("no such name")
        with self.assertRaises(ValueError):
            iching.hexagram("x", lang="fr")

    def test_derived(self):
        self.assertEqual(iching.reverse(3)["number"], 4)
        self.assertEqual(iching.opposite(1)["number"], 2)
        self.assertEqual(iching.mutual(1)["number"], 1)
        self.assertEqual(iching.changed(1, [1])["number"], 44)
        tu_lat = [n for n in range(1, 65) if iching.reverse(n)["number"] == n]
        self.assertEqual(tu_lat, [1, 2, 27, 28, 29, 30, 61, 62])

    def test_cast(self):
        seq = iter([0.1, 0.1, 0.1] + [0.9] * 15)
        c = iching.cast_coins(rng=lambda: next(seq))
        self.assertEqual(c["lines"], [9, 6, 6, 6, 6, 6])
        self.assertEqual(c["moving"], [1, 2, 3, 4, 5, 6])
        c = iching.cast_coins(lines=[9, 8, 7, 6, 7, 8])
        self.assertEqual((c["primary"]["number"], c["changed"]["number"]), (63, 31))
        self.assertIsNone(iching.cast_coins(lines=[7] * 6)["changed"])
        with self.assertRaises(ValueError):
            iching.cast_coins(lines=[5, 7, 7, 7, 7, 7])
        r = iching.cast_coins()
        self.assertTrue(all(6 <= v <= 9 for v in r["lines"]))
        n = iching.cast_from_numbers(2026, 11, 19)
        self.assertEqual(n["lines"], [9, 8, 7, 7, 7, 8])
        self.assertEqual((n["upper"]["name"], n["lower"]["name"]), ("Dui", "Li"))

    def test_najia(self):
        c = iching.najia([9, 8, 7, 6, 7, 8], date="2026-11-19")
        self.assertEqual(c["lines"][0]["relation"], "Offspring")
        self.assertEqual(c["lines"][0]["changed"]["relationCode"], "officer")
        self.assertFalse(_VIET.search(_chu(c)), _VIET.search(_chu(c)))
        z = iching.najia([9, 8, 7, 6, 7, 8], date="2026-11-19", lang="zh")
        self.assertEqual(z["lines"][0]["relation"], "子孙")
        with self.assertRaises(ValueError):
            iching.najia(1, date="1899-12-31")
        with self.assertRaises(TypeError):
            iching.najia(1)

    def test_daily(self):
        d = iching.daily_hexagram("2026-11-19")
        self.assertEqual((d["hexagram"]["name"], d["cycleIndex"], d["role"]), ("Biting Through", 55, "minister"))
        self.assertFalse(_VIET.search(_chu(d)))


class TestText(unittest.TestCase):
    def test_text(self):
        t = iching.text(1)
        self.assertEqual(t["judgment"]["zh"], "乾：元亨。利貞。")
        self.assertEqual(len(t["lines"]), 7)
        self.assertEqual(t["lines"][6]["label"], "用九")
        self.assertEqual(sum(len(iching.text(n)["lines"]) for n in range(1, 65)), 386)


class TestSvg(unittest.TestCase):
    def test_bam_chung(self):
        with open(os.path.join(_THU_MUC, "ve_svg_iching.json"), encoding="utf-8") as f:
            ca = json.load(f)["ca"]
        self.assertEqual(len(ca), 36)
        for c in ca:
            v = c["vao"]
            s = iching.render_hexagram_svg(v.get("lines", v.get("n")), lang=c["lang"], theme=c["theme"],
                                           width=c.get("width"))
            self.assertEqual(hashlib.sha256(s.encode("utf-8")).hexdigest(), c["sha256"], c)
            ET.fromstring(s)


if __name__ == "__main__":
    unittest.main()
