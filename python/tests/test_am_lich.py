import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import am_lich as al  # noqa: E402
from so_sanh import so_mon  # noqa: E402


def tinh(vao):
    phep = vao["phep"]
    if phep == "duong-sang-am" and "muiGio" in vao:
        return {"am": al.solar_to_lunar(vao["dd"], vao["mm"], vao["yyyy"], vao["muiGio"])}
    if phep == "duong-sang-am":
        dd, mm, yy = vao["dd"], vao["mm"], vao["yyyy"]
        am = al.solar_to_lunar(dd, mm, yy, 7)
        return {
            "am": am,
            "canChiNgay": al.day_can_chi(dd, mm, yy),
            "canChiThang": al.lunar_month_can_chi(am["month"], am["year"]),
            "canChiNam": al.year_can_chi(am["year"]),
            "tietKhi": al.tiet_khi_cua_ngay(dd, mm, yy)["ten"],
            "saoNhiThapBatTu": al.sao_cua_ngay(dd, mm, yy)["ten"],
        }
    if phep == "am-sang-duong":
        duong, ok = al.lunar_to_solar(vao["ngay"], vao["thang"], vao["nam"], vao["nhuan"], vao.get("muiGio", 7))
        return {"hopLe": ok, "duong": duong}
    if phep == "moc-tiet-khi":
        return al.moc_tiet_khi_trong_nam(vao["nam"])
    raise ValueError("phép lạ: %s" % phep)


class TestAmLich(unittest.TestCase):
    def _chay(self, phep):
        dat, tong, lech = so_mon("am-lich", tinh, lambda v: v["phep"] == phep)
        print("\nam-lich %s: %d/%d vectors pass" % (phep, dat, tong))
        self.assertGreater(tong, 0)
        self.assertEqual(dat, tong, "\n".join(lech))

    def test_duong_sang_am(self):
        self._chay("duong-sang-am")

    def test_am_sang_duong(self):
        self._chay("am-sang-duong")

    def test_moc_tiet_khi(self):
        self._chay("moc-tiet-khi")

    def test_ham_phu(self):
        # Vài bất biến của các hàm mức thấp mà Bát Tự và Tử Vi dùng lại.
        self.assertEqual(al.year_can_chi(2026)["label"], "Bính Ngọ")
        self.assertEqual(al.ngu_hanh_nap_am(0, 0), ("Kim", "Metal", "Hải Trung Kim"))
        self.assertEqual(al.ngu_hanh_nap_am(0, 1), ("", "", ""))
        self.assertEqual(len(al.luc_thap_hoa_giap(1900, 2100)), 60)
        self.assertEqual(al.hanh_sinh_ra("Kim"), "Thổ")
        self.assertEqual(al.hanh_khac_lai("Kim"), "Hỏa")
        self.assertEqual(al.jd_to_date(al.jd_from_date(29, 2, 2024)), {"day": 29, "month": 2, "year": 2024})
        self.assertEqual(al.sao_cua_ngay(21, 9, 2026)["ten"], "Tâm")
        dang, ke = al.moc_tiet_khi_quanh_ngay(1, 1, 2026)
        self.assertEqual(dang["ten"], "Đông Chí")
        self.assertEqual(ke["ten"], "Tiểu Hàn")


if __name__ == "__main__":
    unittest.main()
