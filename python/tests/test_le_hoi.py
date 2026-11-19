import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import le_hoi  # noqa: E402
from so_sanh import so_mon  # noqa: E402


class TestLeHoi(unittest.TestCase):
    def test_ca_kiem(self):
        dat, tong, lech = so_mon("le-hoi", lambda vao: le_hoi.le_hoi_trong_nam(vao["nam"]) or None)
        print("\nle-hoi: %d/%d ca đạt" % (dat, tong))
        self.assertGreater(tong, 0)
        self.assertEqual(dat, tong, "\n".join(lech))

    def test_tet_2026(self):
        self.assertTrue(any(x["id"] == "tet-nguyen-dan" for x in le_hoi.le_hoi_theo_ngay(17, 2, 2026)))


if __name__ == "__main__":
    unittest.main()
