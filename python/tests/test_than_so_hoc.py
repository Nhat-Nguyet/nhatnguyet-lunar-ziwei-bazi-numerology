import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import than_so_hoc as tsh  # noqa: E402
from so_sanh import so_mon  # noqa: E402


def tinh(vao):
    return tsh.tinh_ho_so_than_so_hoc_sau(vao["hoTen"], vao["dd"], vao["mm"], vao["yyyy"],
                                          vao["namXem"], vao["thangXem"], vao["ngayXem"])


class TestThanSoHoc(unittest.TestCase):
    def test_ca_kiem(self):
        dat, tong, lech = so_mon("than-so-hoc", tinh)
        print("\nthan-so-hoc: %d/%d ca đạt" % (dat, tong))
        self.assertGreater(tong, 0)
        self.assertEqual(dat, tong, "\n".join(lech))

    def test_bo_dau(self):
        self.assertEqual(tsh.fold_vietnamese("Đặng Thùy Dương 1990"), "dang thuy duong 1990")
        self.assertEqual(tsh.strip_diacritics("Đặng Thùy Dương 1990"), "dangthuyduong")


if __name__ == "__main__":
    unittest.main()
