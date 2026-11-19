"""Kiểm hàm tra cứu và vận hạn (nhatnguyet.tu_vi_chuc_nang): đúng lõi (đại vận,
hạn năm, tiểu vận, nguyệt hạn, phi tinh). Phép so từng byte với bản TypeScript
nằm ở js/packages/tu-vi/test/chuc-nang.test.ts."""

import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from nhatnguyet import en, tu_vi  # noqa: E402
from nhatnguyet import tu_vi_chuc_nang as f  # noqa: E402
from nhatnguyet.tu_vi_du_lieu import TU_HOA_THEO_CAN  # noqa: E402
from nhatnguyet.tu_vi_han import vi_tri_sao  # noqa: E402

CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]


class TestTraCuu(unittest.TestCase):
    def setUp(self):
        self.c = en.cast_zi_wei("1990-09-19", "male", time="20:00", view_year=2026)

    def test_cung_va_sao_theo_ten(self):
        c = self.c
        menh = c["palaces"][c["lifePalace"]]
        for ten in ("Life Palace", "life palace", "Mệnh", "命宫", c["lifePalace"]):
            self.assertIs(f.palace_of(c, ten), menh)
        self.assertIsNone(f.palace_of(c, "no such palace"))
        with self.assertRaises(ValueError):
            f.palace_of(c, 12)
        tv = f.star_of(c, "紫微")
        self.assertEqual(tv["star"]["nameVi"], "Tử Vi")
        self.assertIsNone(f.star_of(c, "nope"))
        s = f.surrounding_palaces(c, "Mệnh")
        self.assertEqual([s[k]["nameVi"] for k in ("target", "opposite", "wealth", "career")],
                         ["Mệnh", "Thiên Di", "Tài Bạch", "Quan Lộc"])
        g = f.flanking_palaces(c, c["lifePalace"])
        self.assertEqual([g["previous"]["index"], g["next"]["index"]],
                         [(c["lifePalace"] - 1) % 12, (c["lifePalace"] + 1) % 12])
        self.assertTrue(f.palace_has(c, tv["palace"]["index"], ["Tử Vi"]))
        self.assertFalse(f.palace_not_have(c, tv["palace"]["index"], ["紫微"]))
        for p in c["palaces"]:
            self.assertEqual(f.palace_is_empty(c, p["index"]), not any(x["kind"] == "major" for x in p["stars"]))

    def test_duong_bay_theo_bang_tu_hoa_cua_loi(self):
        raw = tu_vi.lap_la_so_tu_vi("", "Nữ", 21, 1, 1985, 5)
        for i in range(12):
            sao = list(TU_HOA_THEO_CAN[CAN.index(raw["cung"][i]["canChi"].split(" ")[0])])
            bay = f.flying_transformations(raw, i, lang="vi")
            self.assertEqual([x["star"] for x in bay], sao)
            self.assertEqual([x["self"] for x in bay], [vi_tri_sao(raw, s) == i for s in sao])
            for k, t in enumerate(("lu", "quan", "ke", "ji")):
                for j in range(12):
                    self.assertEqual(f.flies_to(raw, i, j, t), vi_tri_sao(raw, sao[k]) == j)
            self.assertEqual(f.self_transformed(raw, i), any(vi_tri_sao(raw, s) == i for s in sao))
        with self.assertRaises(ValueError):
            f.flies_to(raw, 0, 1, "fortune")

    def test_horoscope(self):
        c = self.c
        h = f.horoscope(c, "2026-11-19")
        hn = tu_vi.tinh_han_nam(c["raw"], 2026)
        self.assertEqual(h["lunar"], {"year": 2026, "month": 10, "day": 11, "leap": False})
        self.assertEqual(h["age"], hn["tuoiMu"])
        self.assertEqual(h["year"]["palaceIndex"], hn["luuNienViTri"])
        self.assertEqual(h["minorLimit"]["palaceIndex"], hn["tieuVanViTri"])
        self.assertEqual(h["month"]["palaceIndex"], hn["nguyetHan"]["thang"][9]["viTri"])
        self.assertEqual(h["year"]["palace"], "Health")
        self.assertEqual(h["year"]["palaceNames"][h["year"]["palaceIndex"]], "Life Palace")
        self.assertEqual(h["month"]["transformations"], [])
        self.assertIsNone(h["day"])
        self.assertIsNone(h["hour"])
        self.assertIsNone(f.horoscope(c, "1991-03-01")["decade"])
        self.assertEqual(f.horoscope(c, "2026-11-19", lang="zh")["year"]["stemBranch"], "丙午")


if __name__ == "__main__":
    unittest.main()
