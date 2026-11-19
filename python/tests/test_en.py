"""Kiểm lớp API tiếng Anh (nhatnguyet.en): đối chiếu với hàm tiếng Việt và các
khoá En/Zh của ca kiểm (khi ca kiểm có)."""

import datetime
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import nhatnguyet  # noqa: E402
from nhatnguyet import am_lich, bat_tu, en, le_hoi, than_so_hoc, tu_vi  # noqa: E402
from so_sanh import doc_ca_kiem  # noqa: E402
from nhatnguyet.tu_vi_ten_en import STAR_EN_FIX  # noqa: E402

# TODO(zh): sao mà lõi chưa trả chữ Trung và bảng TU_VUNG không dùng được (cùng
# chữ Việt mang nghĩa khác): bản zh tạm để tên tiếng Anh. Lõi đủ zh thì rỗng.
SAO_CHUA_CO_ZH = {"Phúc Đức"}
TRU = (("year", "truNam"), ("month", "truThang"), ("day", "truNgay"), ("hour", "truGio"))


class TestAmLich(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ca = doc_ca_kiem("am-lich")["ca"]

    def test_to_lunar_khop_ca_kiem(self):
        n = kiem = 0
        for c in self.ca:
            v = c["vao"]
            if v["phep"] != "duong-sang-am":
                continue
            n += 1
            if n % 7:
                continue
            r = en.to_lunar((v["yyyy"], v["mm"], v["dd"]), time_zone=v.get("muiGio"), lang="vi")
            self.assertEqual({k: r[k] for k in ("day", "month", "year", "leap")}, c["ra"]["am"])
            if "canChiNam" in c["ra"]:
                self.assertEqual(r["yearName"], c["ra"]["canChiNam"]["label"])
                self.assertEqual(r["monthName"], c["ra"]["canChiThang"]["label"])
                self.assertEqual(r["dayName"], c["ra"]["canChiNgay"]["label"])
            kiem += 1
        self.assertGreater(kiem, 1000)

    def test_to_solar_khop_lunar_to_solar(self):
        kiem = 0
        for c in self.ca[::3]:
            v = c["vao"]
            if v["phep"] != "am-sang-duong":
                continue
            tz = v.get("muiGio", 7)
            ra = c["ra"]
            if not ra["hopLe"]:
                with self.assertRaises(ValueError):
                    en.to_solar(v["nam"], v["thang"], v["ngay"], v["nhuan"], time_zone=tz)
                continue
            sd = ra["duong"]
            l = am_lich.solar_to_lunar(sd["day"], sd["month"], sd["year"], tz)
            if (l["day"], l["month"], l["year"], l["leap"]) == (v["ngay"], v["thang"], v["nam"], v["nhuan"]):
                r = en.to_solar(v["nam"], v["thang"], v["ngay"], v["nhuan"], time_zone=tz)
                self.assertEqual({k: r[k] for k in ("day", "month", "year")}, sd)
                kiem += 1
            else:
                with self.assertRaisesRegex(ValueError, "29 days|has no leap month" if v["nhuan"] else "29 days"):
                    en.to_solar(v["nam"], v["thang"], v["ngay"], v["nhuan"], time_zone=tz)
        self.assertGreater(kiem, 300)

    def test_solar_terms_khop_ca_kiem_va_doi_gio(self):
        for c in self.ca:
            v = c["vao"]
            if v["phep"] != "moc-tiet-khi" or v["nam"] % 25:
                continue
            vi = en.solar_terms(v["nam"], lang="vi")
            enl = en.solar_terms(v["nam"])
            jp = en.solar_terms(v["nam"], country="JP")
            for i, m in enumerate(c["ra"]):
                self.assertEqual(vi[i]["date"], "%04d-%02d-%02d" % (m["ngay"]["year"], m["ngay"]["month"], m["ngay"]["day"]))
                self.assertEqual(vi[i]["time"], "%02d:%02d" % (m["gio"], m["phut"]))
                self.assertEqual(vi[i]["name"], m["ten"])
                self.assertEqual(enl[i]["name"], m["tenEn"])
                a = datetime.datetime.fromisoformat(vi[i]["date"] + "T" + vi[i]["time"])
                b = datetime.datetime.fromisoformat(jp[i]["date"] + "T" + jp[i]["time"])
                self.assertEqual(b - a, datetime.timedelta(hours=2))

    def test_nuoc_va_con_giap(self):
        vn, cn = en.to_lunar("1985-01-21"), en.to_lunar("1985-01-21", country="CN")
        self.assertEqual((vn["month"], vn["day"]), (1, 1))
        goc = am_lich.solar_to_lunar(21, 1, 1985, 8)
        self.assertEqual((cn["year"], cn["month"], cn["day"]), (goc["year"], goc["month"], goc["day"]))
        self.assertEqual(en.to_lunar("2023-02-01")["zodiac"], "Cat")
        self.assertEqual(en.to_lunar("2023-02-01", country="CN")["zodiac"], "Rabbit")
        with self.assertRaisesRegex(ValueError, "unsupported country"):
            en.to_lunar("2027-02-06", country="TH")

    def test_doc_ngay_gio(self):
        self.assertEqual(en.parse_date(datetime.date(1990, 9, 19)), {"year": 1990, "month": 9, "day": 19})
        self.assertEqual(en.parse_date({"year": 1990, "month": 9, "day": 19}), {"year": 1990, "month": 9, "day": 19})
        with self.assertRaisesRegex(ValueError, "no such date"):
            en.parse_date("2023-02-29")
        with self.assertRaises(ValueError):
            en.parse_date("19/09/1990")
        self.assertEqual(en.parse_time("8:05"), {"hour": 8, "minute": 5})
        self.assertIsNone(en.parse_time(None))
        with self.assertRaises(ValueError):
            en.parse_time("24:00")
        for h in range(24):
            self.assertEqual(en.hour_branch(h)["index"], bat_tu.chi_gio_tu_gio_dong_ho(h))
        self.assertEqual(en.hour_branch("23:30"), {"index": 0, "name": "Zi", "animal": "Rat", "range": "23:00-00:59"})
        self.assertEqual(en.hour_branch("23:30", terms="vi")["name"], "Tý")
        self.assertEqual(en.hour_branch("23:30", terms="han")["name"], "子")
        self.assertEqual(en.day_pillar("1990-09-19")["label"], "Ding Hai")
        self.assertEqual(en.day_pillar("1990-09-19", terms="han")["label"], "丁亥")
        self.assertEqual(en.to_lunar("2027-02-06", terms="vi")["yearName"], "Đinh Mùi")
        with self.assertRaises(ValueError):
            en.to_lunar("2027-02-06", terms="wade-giles")
        self.assertEqual(en.day_pillar("1990-09-19", lang="zh")["label"], "丁亥")
        self.assertEqual(en.year_pillar(2026, lang="zh")["label"], "丙午")

    def test_xuat_o_goi(self):
        for ten in ("cast_zi_wei", "cast_bazi", "to_lunar", "numerology", "festivals"):
            self.assertTrue(callable(getattr(nhatnguyet, ten)))


class TestTuVi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mau = [c for i, c in enumerate(doc_ca_kiem("tu-vi")["ca"]) if i % 10 == 0 and not c["ra"].get("loi")]

    def _cast(self, c, lang):
        v = c["vao"]
        return en.cast_zi_wei((v["yyyy"], v["mm"], v["dd"]), "female" if v["gioiTinh"] == "Nữ" else "male",
                              time="%02d:00" % (v["gio"] * 2), view_year=v["namXem"], lang=lang)

    def test_khop_ham_goc_va_ca_kiem(self):
        thieu = set()
        for c in self.mau:
            v, ra = c["vao"], c["ra"]
            vi, e, z = (self._cast(c, l) for l in ("vi", "en", "zh"))
            self.assertEqual(vi["raw"], tu_vi.lap_la_so_tu_vi("", v["gioiTinh"], v["dd"], v["mm"], v["yyyy"], v["gio"]))
            self.assertEqual(vi["hour"]["index"], v["gio"])
            for i, cg in enumerate(ra["laSo"]["cung"]):
                self.assertEqual(vi["palaces"][i]["name"], cg["tenCung"])
                self.assertEqual(e["palaces"][i]["name"], cg["tenCungEn"])
                if cg.get("tenCungZh"):
                    self.assertEqual(z["palaces"][i]["name"], cg["tenCungZh"])
                for k, s in enumerate(cg["sao"]):
                    # Lớp tiếng Anh sửa ba tên sao của lõi (tu_vi_ten_en.STAR_EN_FIX).
                    self.assertEqual(e["palaces"][i]["stars"][k]["name"], STAR_EN_FIX.get(s["ten"], s["tenEn"]))
                    if s.get("tenZh") and z["palaces"][i]["stars"][k]["name"] != s["tenZh"]:
                        thieu.add(s["ten"])
            dv = en.decade_luck(e)
            self.assertEqual([d["fromAge"] for d in dv], [d["tuTuoi"] for d in ra["daiVan"]])
            self.assertEqual([d["palace"] for d in dv], [d["tenCungEn"] for d in ra["daiVan"]])
            y = en.yearly_luck(e)
            self.assertEqual(y["age"], ra["hanNam"]["tuoiMu"])
            self.assertEqual(y["minorLimit"]["index"], ra["hanNam"]["tieuVanViTri"])
            self.assertEqual([(s["code"], s["palaceIndex"]) for s in en.yearly_stars(e)], [(en.YEARLY_STAR_CODE_EN[s["ma"]], s["viTri"]) for s in ra["saoLuu"]])
            self.assertEqual([p["nameVi"] for p in en.find_patterns(e)], [p["ten"] for p in ra["cachCuc"]])
        self.assertTrue(thieu <= SAO_CHUA_CO_ZH, thieu)

    def test_loi_va_gio_ty(self):
        with self.assertRaisesRegex(ValueError, "pass time"):
            en.cast_zi_wei("1990-09-19", "male")
        with self.assertRaisesRegex(ValueError, "gender"):
            en.cast_zi_wei("1990-09-19", "x", time="20:00")
        with self.assertRaisesRegex(ValueError, "branch 10"):
            en.cast_zi_wei("1990-09-19", "f", time="20:00", hour_branch_index=3)
        a = en.cast_zi_wei("1990-09-19", "male", time="23:30")
        b = en.cast_zi_wei("1990-09-19", "male", time="00:10")
        self.assertEqual(a["raw"], b["raw"])
        self.assertEqual(len(a["notes"]), 2)

    def test_country_va_time_zone(self):
        # Mặc định là lịch Việt Nam như trước; "VN" hay time_zone=7 ra đúng như vậy.
        vn = en.cast_zi_wei("1985-01-21", "male", time="10:00", view_year=2026)
        self.assertEqual(en.cast_zi_wei("1985-01-21", "male", time="10:00", view_year=2026, country="VN"), vn)
        self.assertEqual(en.cast_zi_wei("1985-01-21", "male", time="10:00", view_year=2026, time_zone=7), vn)
        self.assertNotIn("timeZone", vn)
        self.assertEqual(vn["lunar"], {"year": 1985, "month": 1, "day": 1, "leap": False})
        # Lịch Trung Quốc (UTC+8): mùng 1 tháng Chạp năm Giáp Tý, Kim Tứ Cục, Mệnh ở Thân.
        cn = en.cast_zi_wei("1985-01-21", "male", time="10:00", country="CN")
        self.assertEqual(cn["lunar"], {"year": 1984, "month": 12, "day": 1, "leap": False})
        self.assertEqual(cn["timeZone"], 8)
        self.assertEqual(cn["bureau"]["name"], "Metal Four")
        self.assertEqual(cn["palaces"][cn["lifePalace"]]["branch"], "Shen")
        self.assertEqual(cn["solarDate"], "1985-01-21")
        self.assertTrue(cn["notes"][0].endswith("lunar calendar of CN (UTC+8)."), cn["notes"][0])
        tz8 = en.cast_zi_wei("1985-01-21", "male", time="10:00", time_zone=8)
        self.assertTrue(tz8["notes"][0].endswith("lunar calendar at UTC+8."), tz8["notes"][0])
        with self.assertRaisesRegex(ValueError, "unsupported country"):
            en.cast_zi_wei("1985-01-21", "male", time="10:00", country="XX")


class TestBatTu(unittest.TestCase):
    def test_khop_ham_goc_va_ca_kiem(self):
        for c in doc_ca_kiem("bat-tu")["ca"][::9]:
            v, ra = c["vao"], c["ra"]["laSo"]
            t = None if "gio" not in v else "%02d:%02d" % (v["gio"], v["phut"])
            g = "female" if v["gioiTinh"] == "Nữ" else "male"
            vi, e, z = (en.cast_bazi((v["yyyy"], v["mm"], v["dd"]), g, time=t, lang=l) for l in ("vi", "en", "zh"))
            self.assertEqual(vi["raw"], bat_tu.lap_la_so_bat_tu(v["dd"], v["mm"], v["yyyy"], v.get("gio"), v["phut"], v["gioiTinh"]))
            for k, kv in TRU:
                tr = ra.get(kv)
                if not tr:
                    self.assertIsNone(vi["pillars"][k])
                    continue
                self.assertEqual(vi["pillars"][k]["label"], tr["label"])
                self.assertEqual(e["pillars"][k]["tenGod"], tr["thapThanCanEn"])
                if tr.get("labelZh"):
                    self.assertEqual(z["pillars"][k]["label"], tr["labelZh"])
                if tr.get("napAmTenEn"):
                    self.assertEqual(e["pillars"][k]["naYin"], tr["napAmTenEn"])
                if tr.get("thanSatZh") is not None:
                    self.assertEqual(z["pillars"][k]["stars"], tr["thanSatZh"])
            # Câu tiếng Anh của lõi, chữ Việt còn sót đổi theo cách viết (mặc định
            # pinyin), mốc tiết "04:37 on 8/9/1990" thành ISO "1990-09-08 04:37".
            dvr = ra["daiVan"]
            nm = dvr["tietMocNgay"]
            gm = "%02d:%02d" % (dvr["tietMocGio"], dvr["tietMocPhut"])
            cu = "(%s on %d/%d/%d)" % (gm, nm["day"], nm["month"], nm["year"])
            self.assertTrue(nm["year"] == 0 or cu in dvr["lyDoEn"], dvr["lyDoEn"])
            moi = "(%04d-%02d-%02d %s)" % (nm["year"], nm["month"], nm["day"], gm)
            self.assertEqual(e["luck"]["explanation"], en._bt_en_text(dvr["lyDoEn"], "pinyin").replace(cu, moi))
            self.assertNotRegex(e["luck"]["explanation"], r" on \d+/\d+/\d{4}")
            self.assertEqual([p["fromYear"] for p in e["luck"]["pillars"]], [p["namTu"] for p in ra["daiVan"]["cacVan"]])
            tv = en.minor_luck(e, v["namXem"])
            goc = bat_tu.tinh_tieu_van_bat_tu(e["raw"], v["namXem"])
            self.assertEqual(tv is None, goc is None)
            if tv:
                self.assertEqual(tv["label"], en.stem_branch_name(goc["label"], "en"))
                self.assertEqual(en.minor_luck(e, v["namXem"], terms="vi")["label"], goc["label"])

    def test_tru_ngay_doi_luc_23h(self):
        a = en.cast_bazi("1990-09-19", "male", time="23:10")
        b = en.cast_bazi("1990-09-20", "male", time="01:00")
        self.assertEqual(a["pillars"]["day"]["label"], b["pillars"]["day"]["label"])
        self.assertIsNone(en.cast_bazi("1990-09-19", "female")["pillars"]["hour"])


class TestThanSoHocLeHoi(unittest.TestCase):
    def test_numerology_khop_ca_kiem(self):
        for c in doc_ca_kiem("than-so-hoc")["ca"]:
            v, ra = c["vao"], c["ra"]
            r = en.numerology(v["hoTen"], (v["yyyy"], v["mm"], v["dd"]), today=(v["namXem"], v["thangXem"], v["ngayXem"]))
            self.assertEqual(r["raw"], than_so_hoc.tinh_ho_so_than_so_hoc_sau(
                v["hoTen"], v["dd"], v["mm"], v["yyyy"], v["namXem"], v["thangXem"], v["ngayXem"]))
            self.assertEqual((r["lifePath"], r["expression"], r["soulUrge"], r["personality"]),
                             (ra["soDuongDoi"], ra["soSuMenh"], ra["soLinhHon"], ra["soNhanCach"]))
            self.assertEqual(r["karmicDebt"], ra.get("soNoNghiepNgaySinh"))
        with self.assertRaises(ValueError):
            en.numerology("", "1990-09-19")

    def test_festivals_khop_ca_kiem(self):
        for c in doc_ca_kiem("le-hoi")["ca"][::10]:
            f = en.festivals(c["vao"]["nam"], lang="vi")
            self.assertEqual(sorted((x["date"], x["id"]) for x in f), sorted((x["ngay"], x["id"]) for x in (c["ra"] or [])))
            self.assertEqual([x["date"] for x in f], sorted(x["date"] for x in f))
        tet = next(x for x in en.festivals(2027) if x["id"] == "tet-nguyen-dan")
        self.assertEqual((tet["date"], tet["calendar"], tet["name"]), ("2027-02-06", "lunar", tet["raw"]["ten_en"]))
        self.assertEqual(len(en.festivals(2027)), len(le_hoi.le_hoi_trong_nam(2027)))


class TestSvg(unittest.TestCase):
    def test_svg_tu_ket_qua_tieng_anh(self):
        from nhatnguyet import render_bazi_svg, render_chart_svg, render_numerology_svg
        c = en.cast_zi_wei("1990-09-19", "male", time="20:00", lang="zh")
        self.assertEqual(en.zi_wei_svg(c), render_chart_svg(c["raw"], lang="zh"))
        self.assertEqual(en.zi_wei_svg(c["raw"], theme="dark"), render_chart_svg(c["raw"], lang="en", theme="dark"))
        b = en.cast_bazi("1990-09-19", "male", time="20:00", lang="vi")
        self.assertEqual(en.bazi_svg(b, name="An"), render_bazi_svg(b["raw"], lang="vi", ho_ten="An"))
        r = en.numerology("Nguyen Van An", "1990-09-19", today="2026-11-19")
        vao = {"hoTen": "Nguyen Van An", "dd": 19, "mm": 9, "yyyy": 1990, "namXem": 2026}
        self.assertEqual(en.numerology_svg(r, theme="dark"), render_numerology_svg(vao, lang="en", theme="dark"))



class TestSchools(unittest.TestCase):
    """Lựa chọn phái (schools) ở lớp tiếng Anh: khoá camelCase hay snake_case."""

    def test_zi_wei(self):
        goc = en.cast_zi_wei("1990-09-19", "female", time="20:00", view_year=2026)
        self.assertNotIn("schools", goc)
        for s in (None, {}, {"fireBell": "vietnamese", "leapMonth": "whole"}, {"fire_bell": "vietnamese"}):
            c = en.cast_zi_wei("1990-09-19", "female", time="20:00", view_year=2026, schools=s)
            self.assertEqual(c, goc)
        cam = en.cast_zi_wei("1990-09-19", "female", time="20:00", view_year=2026,
                             schools={"fireBell": "quanshu", "transformations": "zhongzhou"})
        ran = en.cast_zi_wei("1990-09-19", "female", time="20:00", view_year=2026,
                             schools={"fire_bell": "quanshu", "transformations": "zhongzhou"})
        self.assertEqual(cam, ran)
        self.assertEqual(cam["schools"], {"fireBell": "quanshu", "transformations": "zhongzhou"})
        self.assertEqual(list(cam)[-2:], ["raw", "schools"])
        self.assertEqual(cam["notes"][-1], "School options (not the default): Fire and Bell stars: both forward "
                                           "(Quan Shu); Four Transformations: Zhongzhou.")
        zh = en.cast_zi_wei("2023-04-10", "male", time="10:00", lang="zh", schools={"leap_month": "split-at-15"})
        self.assertEqual(zh["notes"][-1], "非默认的流派选项：闰月：以十五日为界。")
        self.assertEqual(zh["raw"]["placementMonth"], 3)
        self.assertNotEqual(en.yearly_luck(zh, 2026), en.yearly_luck(en.cast_zi_wei("2023-04-10", "male", time="10:00", lang="zh"), 2026))
        with self.assertRaisesRegex(ValueError, "invalid leapMonth \"split\", expected one of: whole, split-at-15, next-month"):
            en.cast_zi_wei("1990-09-19", "female", time="20:00", schools={"leap_month": "split"})
        with self.assertRaisesRegex(ValueError, "unknown school option \"zi_hour\""):
            en.cast_zi_wei("1990-09-19", "female", time="20:00", schools={"zi_hour": "split-at-midnight"})

    def test_bazi(self):
        goc = en.cast_bazi("2024-01-01", "male", time="23:30")
        self.assertEqual(en.cast_bazi("2024-01-01", "male", time="23:30", schools={"zi_hour": "next-day-from-23"}), goc)
        c = en.cast_bazi("2024-01-01", "male", time="23:30", schools={"zi_hour": "split-at-midnight"})
        self.assertEqual(c["schools"], {"ziHour": "split-at-midnight"})
        self.assertEqual((goc["pillars"]["day"]["label"], c["pillars"]["day"]["label"]), ("Yi Chou", "Jia Zi"))
        self.assertEqual(c["pillars"]["hour"]["label"], goc["pillars"]["hour"]["label"])
        self.assertIn("day pillar at midnight", c["notes"][0])
        with self.assertRaisesRegex(ValueError, "invalid ziHour"):
            en.cast_bazi("2024-01-01", "male", time="23:30", schools={"ziHour": "midnight"})


class TestYearRange(unittest.TestCase):
    """The English API refuses years outside 1900 to 2100, as the TypeScript one."""

    def test_ngoai_khoang(self):
        msg = "outside the supported range: years 1900 to 2100"
        for f in (lambda: en.to_lunar("2200-01-01"), lambda: en.to_lunar("1899-12-31"),
                  lambda: en.to_solar(2101, 1, 1), lambda: en.solar_terms(1899), lambda: en.solar_term_on("2101-01-01"),
                  lambda: en.auspicious_hours("2200-01-01"), lambda: en.festivals(2300),
                  lambda: en.cast_zi_wei("1899-12-31", "male", time="08:00"),
                  lambda: en.cast_bazi("2101-01-01", "female"),
                  lambda: en.numerology("An", "1899-01-01"),
                  lambda: en.numerology("An", "1990-01-01", today="2200-01-01")):
            with self.assertRaisesRegex(ValueError, msg):
                f()
        self.assertEqual(en.to_lunar("1900-01-01")["solarTerm"], "Winter Solstice")
        self.assertEqual(en.to_lunar("2100-12-31")["solarTerm"], "Winter Solstice")
        self.assertEqual(len(en.solar_terms(1900)), 24)
        self.assertEqual(len(en.solar_terms(2100)), 24)

    def test_thang_nhuan_khong_co(self):
        with self.assertRaisesRegex(ValueError, "2024 has no leap month 2; the lunar year 2024 has no leap month"):
            en.to_solar(2024, 2, 1, leap=True)
        with self.assertRaisesRegex(ValueError, "2025 has no leap month 2; the leap month of 2025 is month 6"):
            en.to_solar(2025, 2, 1, leap=True)
        self.assertEqual(en.to_solar(2025, 6, 1, leap=True)["date"], "2025-07-25")

    def test_scope_null(self):
        ds = en.festivals(2027)
        self.assertTrue(any(f["scope"] is None for f in ds))
        self.assertTrue(all(f["raw"]["pham_vi"] == "" for f in ds if f["scope"] is None))


if __name__ == "__main__":
    unittest.main()
