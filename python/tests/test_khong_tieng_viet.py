"""Bản tiếng Anh không còn chữ Việt: quét mọi chuỗi của kết quả ``lang="en"``
(cách viết mặc định "pinyin" và "han") trên MỌI ca kiểm Tử Vi, Bát Tự, thần số
học, Kinh Dịch, phong thuỷ, mỗi ca thứ bảy của âm lịch và lễ hội 1900 tới 2100,
tìm ký tự Latin có dấu tiếng Việt. Ký tự nào cũng là lỗi.

Bỏ qua, có chủ đích:
- khoá ``raw`` (đối tượng gốc tiếng Việt) và ``nameVi`` (khoá tên Việt ổn định);
- họ tên người (``name`` ở gốc lá số Tử Vi và hồ sơ thần số học);
- tên và mô tả lễ hội (tên riêng Việt Nam giữ đủ dấu ở bản Anh, như quy ước
  của site); các trường mã của lễ hội (group, scope, level, calendar) vẫn quét.

Phép đo cũ (``ba_ngon_ngu.py``) chỉ đòi khoá ``...En`` khác rỗng nên đếm tên
Hán Việt ("Canh Ngọ", "Hóa Kỵ") là đã dịch; phép này đo đầu ra.
"""

import os
import re
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import en, fengshui, iching  # noqa: E402
from nhatnguyet.van_ban import chart_to_text  # noqa: E402
from so_sanh import doc_ca_kiem  # noqa: E402

CO_DAU = re.compile("[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ"
                    "ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]")
BO_KHOA = {"raw", "nameVi"}
PY = frozenset({"pinyin"})
TERMS = (None, "han")


def quet(v, duong, loi, bo_duong=(), bo_khoa=frozenset()):
    if isinstance(v, str):
        if CO_DAU.search(v):
            loi.append("%s: %s" % (duong, v[:120]))
    elif isinstance(v, dict):
        for k, x in v.items():
            d = duong + "." + k
            if k in BO_KHOA or k in bo_khoa or d in bo_duong:
                continue
            quet(x, d, loi, bo_duong, bo_khoa)
    elif isinstance(v, (list, tuple)):
        for x in v:
            quet(x, duong + "[]", loi, bo_duong, bo_khoa)


def ngay(v):
    return "%04d-%02d-%02d" % (v["yyyy"], v["mm"], v["dd"])


class TestKhongTiengViet(unittest.TestCase):
    def _bao(self, loi):
        if loi:
            self.fail("%d Vietnamese strings in the English output, for example:\n%s" % (len(loi), "\n".join(sorted(set(loi))[:30])))

    def test_tu_vi(self):
        loi = []
        for i, c in enumerate(doc_ca_kiem("tu-vi")["ca"]):
            v = c["vao"]
            for t in TERMS:
                ch = en.cast_zi_wei(ngay(v), v["gioiTinh"], hour_branch_index=v["gio"], view_year=v["namXem"], terms=t)
                ra = {"chart": ch, "decades": en.decade_luck(ch), "year": en.yearly_luck(ch),
                      "stars": en.yearly_stars(ch), "patterns": en.find_patterns(ch)}
                quet(ra, "$", loi, {"$.chart.name"})
                if i % 25 == 0:
                    quet(chart_to_text(ch, year=v["namXem"]), "$.text", loi)
                    quet(en.zi_wei_svg(ch), "$.svg", loi)
        self._bao(loi)

    def test_bat_tu(self):
        loi = []
        for i, c in enumerate(doc_ca_kiem("bat-tu")["ca"]):
            v = c["vao"]
            time = None if v.get("gio") is None else "%02d:%02d" % (v["gio"], v.get("phut") or 0)
            for t in TERMS:
                ch = en.cast_bazi(ngay(v), v["gioiTinh"], time=time, terms=t)
                quet({"chart": ch, "minor": en.minor_luck(ch, v["namXem"])}, "$", loi)
                if i % 25 == 0:
                    quet(chart_to_text(ch), "$.text", loi)
                    quet(en.bazi_svg(ch), "$.svg", loi)
        self._bao(loi)

    def test_am_lich(self):
        loi = []
        n = 0
        for c in doc_ca_kiem("am-lich")["ca"]:
            v = c["vao"]
            if v["phep"] != "duong-sang-am":
                continue
            n += 1
            if n % 7:
                continue
            for t in TERMS:
                quet(en.to_lunar(ngay(v), terms=t), "$", loi)
                quet(en.day_pillar(ngay(v), terms=t), "$", loi)
                quet(en.auspicious_hours(ngay(v), terms=t), "$", loi)
        for y in range(1900, 2101, 25):
            quet(en.solar_terms(y), "$", loi, {"$[].nameVi"})
        self._bao(loi)

    def test_than_so_hoc(self):
        loi = []
        for c in doc_ca_kiem("than-so-hoc")["ca"]:
            v = c["vao"]
            r = en.numerology(v["hoTen"], ngay(v), today=(v["namXem"], v["thangXem"], v["ngayXem"]))
            quet(r, "$", loi, {"$.name"})
        self._bao(loi)

    def test_le_hoi_ma(self):
        loi = []
        for y in range(1900, 2101, 10):
            for f in en.festivals(y):
                quet({k: f[k] for k in ("id", "date", "calendar", "fixedDate", "level", "group", "scope")}, "$", loi)
                self.assertIn(f["group"], ("holiday", "folk-religion", "other"))
                self.assertIn(f["scope"], ("national", "local", None))
        self._bao(loi)


    def test_iching(self):
        # pinyin có dấu thanh (Qián, Lǚ) là chủ ý: dấu thanh trùng vài chữ có
        # dấu tiếng Việt nên bỏ khoá ấy; mọi khoá khác vẫn quét.
        loi = []
        for t in TERMS:
            quet(iching.all_hexagrams(terms=t), "$", loi, bo_khoa=PY)
            for n in range(1, 9):
                quet(iching.trigram(n, terms=t), "$", loi, bo_khoa=PY)
        for i, c in enumerate(doc_ca_kiem("iching")["ca"]):
            v = c["vao"]
            op = v["op"]
            for t in TERMS:
                if op == "lines":
                    quet(iching.cast_coins(lines=v["lines"], terms=t), "$", loi, bo_khoa=PY)
                elif op == "numbers":
                    quet(iching.cast_from_numbers(v["a"], v["b"], v["c"], terms=t), "$", loi, bo_khoa=PY)
                elif op == "najia":
                    quet(iching.najia(v["lines"], date=ngay(v), terms=t), "$", loi, bo_khoa=PY)
                elif op == "daily" and i % 7 == 0:
                    quet(iching.daily_hexagram(ngay(v), terms=t), "$", loi, bo_khoa=PY)
            if op == "lines" and i % 25 == 0:
                svg = iching.render_hexagram_svg(v["lines"])
                for q in iching.all_hexagrams():
                    svg = svg.replace(">%s %s<" % (q["nameHan"], q["pinyin"]), "><")
                quet(svg, "$.svg", loi)
        for n in (1, 2, 11, 64):
            quet(iching.text(n), "$.text", loi, bo_khoa=PY)
        self._bao(loi)

    def test_fengshui(self):
        loi = []
        son = {x["nameVi"]: x["id"] for x in fengshui.mountains24(lang="vi")}
        for i, c in enumerate(doc_ca_kiem("fengshui")["ca"]):
            v = c["vao"]
            p = v["phep"]
            for t in TERMS:
                if p == "cung-phi":
                    g = fengshui.life_gua(ngay(v), "female" if v["gioiTinh"] == "Nữ" else "male", terms=t)
                    quet(g, "$", loi)
                    if i % 50 == 0:
                        quet(fengshui.render_compass_svg(gua=g, facing=180, terms=t), "$.svg", loi)
                elif p == "son-theo-do":
                    quet(fengshui.mountain_at(v["do"], terms=t), "$", loi)
                elif p == "tinh-ban" and 1 <= v["van"] <= 9 and v["toa"] in son:
                    ch = fengshui.flying_star_chart(period=v["van"], sitting=son[v["toa"]], terms=t)
                    quet(ch, "$", loi)
                    if i % 20 == 0:
                        quet(fengshui.render_flying_star_svg(ch, terms=t), "$.svg", loi)
                elif p == "trach" and v["toa"] in son:
                    quet(fengshui.house_gua(sitting=son[v["toa"]], terms=t), "$", loi)
                elif p == "phi-tinh-nam":
                    quet(fengshui.annual_stars(v["nam"]), "$", loi)
                elif p == "van":
                    quet(fengshui.period_of(v["nam"]), "$", loi)
                elif p == "lo-ban" and i % 3 == 0 and v["kichThuocMm"] > 0:
                    for r in ("luban", "clear-opening", "dinglan"):
                        quet(fengshui.luban_ruler(v["kichThuocMm"] / 10, ruler=r, terms=t), "$", loi)
        for t in TERMS:
            quet(fengshui.luban_rulers(terms=t), "$", loi)
            quet(fengshui.mountains24(terms=t), "$", loi)
            quet(fengshui.nine_stars(terms=t), "$", loi)
        self._bao(loi)


if __name__ == "__main__":
    unittest.main()
