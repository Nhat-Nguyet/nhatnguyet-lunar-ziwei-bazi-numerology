import json
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import tu_vi  # noqa: E402
from so_sanh import doc_ca_kiem, so_mon  # noqa: E402
from ba_ngon_ngu import do_ba_ngon_ngu, tom_tat_thieu  # noqa: E402


def tinh(vao):
    try:
        ls = tu_vi.lap_la_so_tu_vi("", vao["gioiTinh"], vao["dd"], vao["mm"], vao["yyyy"], vao["gio"])
    except ValueError:
        return {"loi": True}
    nam = vao["namXem"]
    return {
        "laSo": ls,
        "daiVan": tu_vi.dai_van(ls),
        "hanNam": tu_vi.tinh_han_nam(ls, nam),
        "saoLuu": tu_vi.tinh_sao_luu(ls, nam),
        "cachCuc": tu_vi.nhan_dien_cach_cuc(ls),
    }


def tinh_phai(vao):
    """Ca kiểm tu-vi-phai: như tinh() nhưng truyền lựa chọn phái (schools)."""
    ls = tu_vi.lap_la_so_tu_vi("", vao["gioiTinh"], vao["dd"], vao["mm"], vao["yyyy"], vao["gio"], vao.get("schools"))
    nam = vao["namXem"]
    return {
        "laSo": ls,
        "daiVan": tu_vi.dai_van(ls),
        "hanNam": tu_vi.tinh_han_nam(ls, nam),
        "saoLuu": tu_vi.tinh_sao_luu(ls, nam),
        "cachCuc": tu_vi.nhan_dien_cach_cuc(ls),
    }


class TestTuViPhai(unittest.TestCase):
    def test_ca_kiem_phai(self):
        dat, tong, lech = so_mon("tu-vi-phai", tinh_phai)
        print("\ntu-vi-phai: %d/%d vectors pass" % (dat, tong))
        self.assertEqual(tong, doc_ca_kiem("tu-vi-phai")["soCa"])
        self.assertEqual(dat, tong, "\n".join(lech))

    def test_mac_dinh_giu_nguyen(self):
        # Vắng, rỗng, ghi rõ mặc định: cùng một lá số, không có khoá schools.
        goc = json.dumps(tu_vi.lap_la_so_tu_vi("", "Nữ", 15, 8, 1993, 3), ensure_ascii=False)
        for s in (None, {}, {"fireBell": "vietnamese", "leapMonth": "whole", "transformations": "vietnamese",
                             "heavenlyKitchen": "vietnamese", "injuryMessenger": "standard"}):
            self.assertEqual(json.dumps(tu_vi.lap_la_so_tu_vi("", "Nữ", 15, 8, 1993, 3, s), ensure_ascii=False), goc)
        self.assertNotIn("schools", json.loads(goc))

    def test_gia_tri_la(self):
        with self.assertRaisesRegex(ValueError, "invalid fireBell \"tan-bien\", expected one of: vietnamese, quanshu"):
            tu_vi.lap_la_so_tu_vi("", "Nam", 1, 1, 2000, 0, {"fireBell": "tan-bien"})
        with self.assertRaisesRegex(ValueError, "unknown school option \"hoaLinh\"; use fireBell, leapMonth"):
            tu_vi.lap_la_so_tu_vi("", "Nam", 1, 1, 2000, 0, {"hoaLinh": "quanshu"})

    def test_hoa_linh_tung_loi(self):
        # 19/9/1990 giờ Tuất, như test TS.
        def vi_tri(ls, ten):
            return next(c["viTri"] for c in ls["cung"] if any(s["ten"] == ten for s in c["sao"]))
        ca = [("Nam", None, 11, 5), ("Nam", "quanshu", 11, 1), ("Nữ", None, 3, 1), ("Nữ", "quanshu", 11, 1),
              ("Nữ", "swap-for-female", 1, 11), ("Nữ", "swap-for-yin-male-yang-female", 1, 11),
              ("Nam", "swap-for-female", 11, 1)]
        for gt, fb, hoa, linh in ca:
            ls = tu_vi.lap_la_so_tu_vi("", gt, 19, 9, 1990, 10, {"fireBell": fb})
            self.assertEqual((vi_tri(ls, "Hỏa Tinh"), vi_tri(ls, "Linh Tinh")), (hoa, linh), "%s %s" % (gt, fb))


class TestTuVi(unittest.TestCase):
    def test_ca_kiem(self):
        dat, tong, lech = so_mon("tu-vi", tinh)
        print("\ntu-vi: %d/%d vectors pass" % (dat, tong))
        self.assertGreater(tong, 0)
        self.assertEqual(dat, tong, "\n".join(lech))

    def test_dau_vao_sai(self):
        with self.assertRaises(ValueError):
            tu_vi.lap_la_so_tu_vi("", "Khác", 1, 1, 1990, 0)
        with self.assertRaises(ValueError):
            tu_vi.lap_la_so_tu_vi("", "Nam", 1, 1, 1990, 12)

    def test_menh_than_gio_ty_ngo_dong_cung(self):
        # Mệnh đi nghịch, Thân đi thuận từ cùng một điểm: giờ Tý và Ngọ luôn đồng cung.
        for thang in range(1, 13):
            for gio in (0, 6):
                self.assertEqual(tu_vi.vi_tri_cung_menh(thang, gio), tu_vi.vi_tri_cung_than(thang, gio))

    def test_ba_thu_tieng(self):
        # Mọi tên (sao, cung, cục, sáng tối, thuật ngữ) trên mọi lá của ca kiểm
        # có bản chữ Hán, và bản tiếng Anh trừ tên giữ Hán Việt.
        dem = {"tong": 0, "thieu": []}
        for c in doc_ca_kiem("tu-vi")["ca"]:
            do_ba_ngon_ngu(tinh(c["vao"]), dem)
        print("\ntu-vi: %d names, %d missing translations" % (dem["tong"], len(dem["thieu"])))
        self.assertGreater(dem["tong"], 0)
        self.assertEqual(dem["thieu"], [], tom_tat_thieu(dem))


if __name__ == "__main__":
    unittest.main()
