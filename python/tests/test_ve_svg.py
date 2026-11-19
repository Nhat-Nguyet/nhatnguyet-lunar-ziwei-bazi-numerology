"""Kiểm ba hình SVG (Tử Vi, Bát Tự, Thần số học) của bản Python.

Bộ băm SHA-256 ở ``ve_svg_<môn>.json`` do bản TypeScript sinh
(``js/kiem/ve-svg.ts``): Python ra cùng băm nghĩa là hai bản vẽ ĐÚNG TỪNG
BYTE như nhau. Ngoài ra đọc lại mỗi hình bằng bộ phân tích XML thật và soát
nội dung: đủ 12 cung, 14 chính tinh, đúng ngôn ngữ.
"""

import hashlib
import json
import os
import sys
import unittest
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from nhatnguyet import bat_tu, tu_vi  # noqa: E402
from nhatnguyet.bat_tu_ve_svg import render_bazi_svg, ve_bat_tu_svg  # noqa: E402
from nhatnguyet.than_so_hoc_ve_svg import render_numerology_svg, ve_than_so_hoc_svg  # noqa: E402
from nhatnguyet.tu_vi_ve_svg import render_chart_svg, ve_la_so_svg  # noqa: E402

_THU_MUC = os.path.dirname(os.path.abspath(__file__))
_SVG = "{http://www.w3.org/2000/svg}"

_CHINH_TINH = {
    "Tử Vi": ("Purple Star", "紫微"), "Thiên Cơ": ("Celestial Mechanism", "天机"),
    "Thái Dương": ("Sun", "太阳"), "Vũ Khúc": ("Military Song", "武曲"),
    "Thiên Đồng": ("Celestial Blessing", "天同"), "Liêm Trinh": ("Purity", "廉贞"),
    "Thiên Phủ": ("Celestial Treasury", "天府"), "Thái Âm": ("Moon", "太阴"),
    "Tham Lang": ("Greedy Wolf", "贪狼"), "Cự Môn": ("Giant Gate", "巨门"),
    "Thiên Tướng": ("Celestial General", "天相"), "Thiên Lương": ("Celestial Beam", "天梁"),
    "Thất Sát": ("Seven Killings", "七杀"), "Phá Quân": ("Army Breaker", "破军"),
}
_CUNG = [
    ("Mệnh", "Life Palace", "命宫"), ("Huynh Đệ", "Siblings", "兄弟宫"), ("Phu Thê", "Spouse", "夫妻宫"),
    ("Tử Tức", "Children", "子女宫"), ("Tài Bạch", "Wealth", "财帛宫"), ("Tật Ách", "Health", "疾厄宫"),
    ("Thiên Di", "Travel", "迁移宫"), ("Nô Bộc", "Friends/Subordinates", "奴仆宫"), ("Quan Lộc", "Career", "官禄宫"),
    ("Điền Trạch", "Property", "田宅宫"), ("Phúc Đức", "Fortune/Virtue", "福德宫"), ("Phụ Mẫu", "Parents", "父母宫"),
]
_NN = {"vi": 0, "en": 1, "zh": 2}


def _doc_bam(mon):
    with open(os.path.join(_THU_MUC, "ve_svg_%s.json" % mon), encoding="utf-8") as f:
        return json.load(f)["ca"]


def _bam(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def _chu(svg):
    """Chữ của từng thẻ <text> (gộp cả <tspan>), đọc bằng bộ phân tích XML."""
    goc = ET.fromstring(svg)
    return ["".join(t.itertext()) for t in goc.iter(_SVG + "text")]


def _tu_vi(v):
    return tu_vi.lap_la_so_tu_vi(v["hoTen"], v["gioiTinh"], v["dd"], v["mm"], v["yyyy"], v["gio"])


def _bat_tu(v):
    return bat_tu.lap_la_so_bat_tu(v["dd"], v["mm"], v["yyyy"], v["gio"], v["phut"], v["gioiTinh"])


class TestVeSvg(unittest.TestCase):
    def _kiem_chung(self, svg, ca):
        goc = ET.fromstring(svg)
        self.assertEqual(goc.tag, _SVG + "svg")
        self.assertEqual(goc.get("lang"), ca["lang"])
        tieu_de = goc.find(_SVG + "title")
        self.assertTrue(tieu_de is not None and tieu_de.text)
        self.assertNotIn("—", svg)
        self.assertEqual(_bam(svg), ca["sha256"], "%s %s %s" % (ca["vao"], ca["lang"], ca["theme"]))

    def test_tu_vi_khop_ban_ts(self):
        ca_ = _doc_bam("tu_vi")
        self.assertGreaterEqual(len(ca_), 24)
        for ca in ca_:
            svg = ve_la_so_svg(_tu_vi(ca["vao"]), lang=ca["lang"], theme=ca["theme"], width=ca.get("width"))
            self._kiem_chung(svg, ca)

    def test_bat_tu_khop_ban_ts(self):
        ca_ = _doc_bam("bat_tu")
        self.assertGreaterEqual(len(ca_), 24)
        for ca in ca_:
            svg = ve_bat_tu_svg(_bat_tu(ca["vao"]), lang=ca["lang"], theme=ca["theme"], width=ca.get("width"),
                                ho_ten=ca["vao"]["hoTen"])
            self._kiem_chung(svg, ca)

    def test_than_so_hoc_khop_ban_ts(self):
        ca_ = _doc_bam("than_so_hoc")
        self.assertGreaterEqual(len(ca_), 24)
        for ca in ca_:
            svg = ve_than_so_hoc_svg(ca["vao"], lang=ca["lang"], theme=ca["theme"], width=ca.get("width"))
            self._kiem_chung(svg, ca)

    def test_tu_vi_du_12_cung_14_chinh_tinh(self):
        for ca in _doc_bam("tu_vi")[::6]:
            ls = _tu_vi(ca["vao"])
            for lang, i in _NN.items():
                chu = _chu(ve_la_so_svg(ls, lang=lang))
                for c in _CUNG:
                    self.assertIn(c[i], chu, "%s thiếu cung %s" % (lang, c[i]))
                for vi, (en, zh) in _CHINH_TINH.items():
                    ten = (vi, en, zh)[i]
                    self.assertTrue(any(x.startswith(ten) for x in chu), "%s thiếu chính tinh %s" % (lang, ten))
                tat = "\n".join(chu)
                if lang == "zh":
                    self.assertNotIn("Life Palace", tat)
                    self.assertNotIn("Mệnh ở", tat)
                if lang == "en":
                    self.assertNotIn("Dương lịch", tat)
                if lang == "vi":
                    self.assertNotIn("命宫", tat)

    def test_bat_tu_noi_dung(self):
        ls = _bat_tu({"dd": 19, "mm": 9, "yyyy": 1990, "gio": 20, "phut": 0, "gioiTinh": "Nam"})
        vi = _chu(ve_bat_tu_svg(ls))
        for s in ("Trụ năm", "Trụ giờ", "Canh", "Ngọ", "Đinh", "Hợi", "Nhật chủ", "Đại vận", "Lộ Bàng Thổ"):
            self.assertIn(s, vi)
        zh = "\n".join(_chu(ve_bat_tu_svg(ls, lang="zh")))
        for s in ("年柱", "日主", "庚", "午", "大运"):
            self.assertIn(s, zh)
        self.assertNotIn("Trụ năm", zh)
        self.assertEqual(render_bazi_svg(ls, lang="en"), ve_bat_tu_svg(ls, lang="en"))

    def test_than_so_hoc_noi_dung(self):
        vao = {"hoTen": "Nguyen Van An", "dd": 19, "mm": 9, "yyyy": 1990, "namXem": 2026}
        vi = _chu(ve_than_so_hoc_svg(vao))
        for s in ("Số chủ đạo", "Sứ mệnh", "Linh hồn", "Nhân cách", "Năm cá nhân 2026", "Đỉnh cao", "Thử thách", "Nợ nghiệp 19"):
            self.assertIn(s, vi)
        en = "\n".join(_chu(ve_than_so_hoc_svg(vao, lang="en")))
        self.assertIn("Life Path", en)
        self.assertNotIn("Sứ mệnh", en)
        self.assertEqual(render_numerology_svg(vao, lang="zh"), ve_than_so_hoc_svg(vao, lang="zh"))

    def test_bi_danh_va_mac_dinh(self):
        ls = _tu_vi({"hoTen": "", "gioiTinh": "Nam", "dd": 1, "mm": 1, "yyyy": 1990, "gio": 6})
        self.assertEqual(render_chart_svg(ls), ve_la_so_svg(ls, lang="vi", theme="light", width=720))


if __name__ == "__main__":
    unittest.main()
