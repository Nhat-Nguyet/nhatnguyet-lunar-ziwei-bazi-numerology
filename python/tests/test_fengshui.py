"""Phong thuỷ: lớp lõi khớp MỌI ca của ca-kiem/fengshui.json (lõi Go), lớp
tiếng Anh chỉ đổi cách viết của đáp án ấy, và hai hình SVG ra cùng băm với bản
TypeScript (ve_svg_fengshui.json, do js/packages/fengshui/test/svg.test.ts sinh)."""

import hashlib
import json
import os
import sys
import unittest
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import fengshui as F  # noqa: E402
from nhatnguyet._phong_thuy import tinh_ca_kiem  # noqa: E402
from so_sanh import doc_ca_kiem, so_mon  # noqa: E402

_THU_MUC = os.path.dirname(os.path.abspath(__file__))
_SVG = "{http://www.w3.org/2000/svg}"
_QI_VI = {"prosperous": "Vượng khí", "growing": "Sinh khí", "retreating": "Thoái khí", "killing": "Sát khí", "dead": "Tử khí"}


def _ca(phep):
    return [c for c in doc_ca_kiem("fengshui")["ca"] if c["vao"]["phep"] == phep]


class TestCaKiem(unittest.TestCase):
    def test_ca_kiem(self):
        dat, tong, lech = so_mon("fengshui", tinh_ca_kiem)
        print("\nfengshui: %d/%d vectors pass" % (dat, tong))
        self.assertEqual(tong, doc_ca_kiem("fengshui")["soCa"])
        self.assertEqual(dat, tong, "\n".join(lech))


class TestTiengAnh(unittest.TestCase):
    def test_life_gua(self):
        for c in _ca("cung-phi"):
            v, ra = c["vao"], c["ra"]
            d = (v["yyyy"], v["mm"], v["dd"])
            if ra.get("loi"):
                with self.assertRaises(ValueError):
                    F.life_gua(d, v["gioiTinh"])
                continue
            g = F.life_gua(d, v["gioiTinh"], lang="vi")
            k = ra["ketQua"]
            self.assertEqual((g["lunarYear"], g["number"], g["trigram"]["nameVi"]), (ra["namAm"], k["kua"], k["que"]))
            sao = k["huongTot"] + k["huongXau"]
            self.assertEqual([(x["directionName"], x["nameVi"]) for x in g["directions"]], [(s["huong"], s["tenSao"]) for s in sao])
        a = F.life_gua("1990-09-19", "female")
        self.assertEqual((a["number"], a["trigram"]["name"], a["element"]), (8, "Gen", "Earth"))
        self.assertEqual(F.life_gua(1990, "female")["number"], 8)
        self.assertIn("before the lunar New Year", F.life_gua("1990-01-20", "male")["note"])
        with self.assertRaises(ValueError):
            F.life_gua("2200-01-01", "male")

    def test_house_mountains(self):
        for c in _ca("trach"):
            h = F.house_gua(sitting=c["vao"]["toa"], lang="vi")
            self.assertEqual((h["number"], h["trigram"]["nameVi"]), (c["ra"]["trach"]["kua"], c["ra"]["trach"]["que"]))
        for c in _ca("son-theo-do"):
            self.assertEqual(F.mountain_at(c["vao"]["do"], lang="vi")["nameVi"], c["ra"]["ten"])
        self.assertEqual(F.house_gua(facing=180)["trigram"]["pinyin"], "Kan")
        self.assertEqual(F.find_mountain("巽")["id"], "xun")
        self.assertEqual([m["name"] for m in F.mountains24(lang="zh")][:4], ["子", "癸", "丑", "艮"])

    def test_flying_stars(self):
        n = 0
        for c in _ca("tinh-ban"):
            v, ra = c["vao"], c["ra"]
            if ra.get("loi"):
                with self.assertRaises(ValueError):
                    F.flying_star_chart(period=v["van"], sitting=v["toa"])
                continue
            tb = ra["tinhBan"]
            ch = F.flying_star_chart(period=v["van"], sitting=v["toa"], lang="vi")
            self.assertEqual([0] + [p["base"] for p in ch["palaces"]], tb["vanBan"])
            self.assertEqual([0] + [p["mountain"] for p in ch["palaces"]], tb["sonTinh"])
            self.assertEqual([0] + [p["facing"] for p in ch["palaces"]], tb["huongTinh"])
            self.assertEqual(ch["patternName"] or "", tb["cach"])
            self.assertEqual([_QI_VI[p["qi"]["mountain"]] for p in ch["palaces"]], [ra["khi"][s] for s in tb["sonTinh"][1:]])
            self.assertEqual([g["usable"] for g in ch["castleGates"]], [g["dungDuoc"] for g in ra["thanhMon"]["cung"]])
            n += 1
        self.assertEqual(n, 216)
        for c in _ca("phi-tinh-nam"):
            self.assertEqual([0] + [p["star"] for p in F.annual_stars(c["vao"]["nam"])["palaces"]], c["ra"]["sao"])
        for c in _ca("van"):
            self.assertEqual(F.period_of(c["vao"]["nam"])["period"], c["ra"]["so"])
        self.assertEqual(F.flying_star_chart(year=2026, facing=180)["pattern"], "double-sitting")

    def test_luban(self):
        ma = {"THONG_THUY": "clear-opening", "DUONG_TRACH": "luban", "AM_PHAN": "dinglan"}
        for c in _ca("lo-ban"):
            v, ra = c["vao"], c["ra"]
            r_id = ma.get(v["loaiThuoc"])
            if not r_id or not v["kichThuocMm"] > 0 or int(v["kichThuocMm"] * 10 + 0.5) / 10 != v["kichThuocMm"]:
                continue
            r = F.luban_ruler(v["kichThuocMm"], ruler=r_id, unit="mm", lang="vi")
            self.assertEqual((r["cycle"], r["sector"]["nameVi"], r["auspicious"], (r["subSector"] or {}).get("nameVi")),
                             (ra["chuKyThu"], ra["cung"], ra["tot"], ra.get("cungNho")))
            self.assertEqual([g["lengthMm"] for g in r["nearestAuspicious"]], [g["mm"] for g in ra.get("ganNhatTot", [])])
        sub = F.luban_ruler(80, ruler="luban")["subSector"]
        self.assertEqual(sub, {"name": "Kou She", "pinyin": "Kou She", "nameEn": "Quarrels", "nameVi": "Khẩu thiệt",
                               "nameZh": "口舌"})
        self.assertEqual(F.luban_ruler(80, ruler="luban", terms="han")["subSector"]["name"], "口舌")
        self.assertEqual(F.luban_ruler(80, ruler="luban", lang="vi")["subSector"]["name"], "Khẩu thiệt")
        self.assertEqual(F.luban_ruler(80, ruler="luban", lang="zh")["subSector"]["name"], "口舌")
        ten = [x for r in F.luban_rulers() for s in r["sectors"] for x in s["subSectors"]]
        self.assertEqual(len(ten), 8 * 5 + 8 * 4)
        for x in ten:
            self.assertEqual(x["name"], x["pinyin"])
            self.assertEqual(len(x["pinyin"].split(" ")), len(x["nameZh"]), x["pinyin"])
            self.assertTrue(x["nameEn"] and x["nameEn"].isascii(), x["nameEn"])
        a = F.luban_ruler(82, ruler="clear-opening")
        self.assertEqual((a["lengthMm"], a["sector"]["name"]), (820, "Fu Lu"))
        with self.assertRaises(ValueError):
            F.luban_ruler(0)

    def test_khong_gach_dai(self):
        s = json.dumps([F.life_gua("1990-09-19", "male", lang=l) for l in ("vi", "en", "zh")] +
                       [F.luban_rulers(lang="zh"), F.flying_star_chart(period=8, facing=45)], ensure_ascii=False)
        self.assertNotIn("—", s)


def _ve(c):
    v = c["vao"]
    o = {"lang": c["lang"], "terms": c.get("terms"), "theme": c["theme"], "width": c.get("width")}
    if v["hinh"] == "chart":
        inp = {"period": v.get("period"), "year": v.get("year"), "facing": v.get("facing"), "sitting": v.get("sitting")}
        if v.get("year"):
            return F.render_flying_star_svg(F.flying_star_chart(**inp), **o)
        return F.render_flying_star_svg(inp, **o)
    if v.get("lifeGua"):
        gua = F.life_gua(v["lifeGua"][0], v["lifeGua"][1])
    elif v.get("houseSitting"):
        gua = F.house_gua(sitting=v["houseSitting"])
    else:
        gua = v.get("gua")
    return F.render_compass_svg(gua=gua, facing=v.get("facing"), orientation=v.get("orientation"), **o)


class TestSvg(unittest.TestCase):
    def test_bam_khop_typescript(self):
        with open(os.path.join(_THU_MUC, "ve_svg_fengshui.json"), encoding="utf-8") as f:
            ca = json.load(f)["ca"]
        self.assertGreaterEqual(len(ca), 40)
        for c in ca:
            svg = _ve(c)
            ET.fromstring(svg)
            self.assertNotIn("—", svg)
            self.assertEqual(hashlib.sha256(svg.encode("utf-8")).hexdigest(), c["sha256"], json.dumps(c, ensure_ascii=False))

    def test_noi_dung(self):
        goc = ET.fromstring(F.render_compass_svg(gua=1, lang="vi"))
        chu = ["".join(t.itertext()) for t in goc.iter(_SVG + "text")]
        # Tên du niên hai chữ vẽ thành hai dòng để vừa vòng (như bản TypeScript).
        for s in ("Tý", "Nhâm", "Sinh", "Khí", "Tuyệt", "Mệnh"):
            self.assertIn(s, chu)


if __name__ == "__main__":
    unittest.main()
