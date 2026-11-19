import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import bat_tu  # noqa: E402
from so_sanh import doc_ca_kiem, so_mon  # noqa: E402
from ba_ngon_ngu import do_ba_ngon_ngu, tom_tat_thieu  # noqa: E402


def tinh(vao):
    try:
        ls = bat_tu.lap_la_so_bat_tu(vao["dd"], vao["mm"], vao["yyyy"], vao.get("gio"),
                                     vao["phut"], vao["gioiTinh"])
    except ValueError:
        return {"loi": True}
    ra = {"laSo": ls}
    tv = bat_tu.tinh_tieu_van_bat_tu(ls, vao["namXem"])
    if tv is not None:
        ra["tieuVan"] = tv
    return ra


class TestBatTu(unittest.TestCase):
    def test_ca_kiem(self):
        dat, tong, lech = so_mon("bat-tu", tinh)
        print("\nbat-tu: %d/%d ca đạt" % (dat, tong))
        self.assertGreater(tong, 0)
        self.assertEqual(dat, tong, "\n".join(lech))

    def test_thieu_gioi_tinh(self):
        with self.assertRaises(ValueError):
            bat_tu.lap_la_so_bat_tu(1, 1, 2000, 8, 0, "")

    def test_khong_gio(self):
        ls = bat_tu.lap_la_so_bat_tu(8, 12, 2031, None, 0, "Nữ")
        self.assertNotIn("truGio", ls)
        self.assertNotIn("menhCung", ls)
        self.assertIsNone(bat_tu.tinh_tieu_van_bat_tu(ls, 2026))

    def test_thap_than(self):
        self.assertEqual(bat_tu.thap_than_cua_can("Giáp", "Canh")["ten"], "Thất Sát")
        self.assertEqual(bat_tu.thap_than_cua_can("Giáp", "Tân")["ten"], "Chính Quan")
        self.assertEqual(len(bat_tu.all_thap_than()), 10)

    def test_ba_thu_tieng(self):
        # Mọi tên (sao, cung, cục, sáng tối, thuật ngữ) trên mọi lá của ca kiểm
        # có bản chữ Hán, và bản tiếng Anh trừ tên giữ Hán Việt.
        dem = {"tong": 0, "thieu": []}
        for c in doc_ca_kiem("bat-tu")["ca"]:
            do_ba_ngon_ngu(tinh(c["vao"]), dem)
        print("\nbat-tu: %d tên, %d chỗ thiếu bản dịch" % (dem["tong"], len(dem["thieu"])))
        self.assertGreater(dem["tong"], 0)
        self.assertEqual(dem["thieu"], [], tom_tat_thieu(dem))


if __name__ == "__main__":
    unittest.main()
