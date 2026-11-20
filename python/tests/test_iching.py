import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from nhatnguyet import _iching_core as core  # noqa: E402
from so_sanh import so_mon  # noqa: E402


def tinh(vao):
    op = vao["op"]
    if op == "trigram":
        return core.quai_tho(vao["n"])
    if op == "hexagram":
        return core.que_tho(vao["n"])
    if op == "lines":
        return core.gieo_tho(vao["lines"])
    if op == "numbers":
        return core.mai_hoa_tho(vao["a"], vao["b"], vao["c"])
    if op == "najia":
        return core.najia_tho(vao["lines"], vao["dd"], vao["mm"], vao["yyyy"])
    if op == "daily":
        return core.que_ngay_tho(vao["dd"], vao["mm"], vao["yyyy"])
    raise ValueError(op)


class TestIChingCaKiem(unittest.TestCase):
    def test_ca_kiem(self):
        dat, tong, lech = so_mon("iching", tinh)
        print("\niching: %d/%d vectors pass" % (dat, tong))
        self.assertGreater(tong, 0)
        self.assertEqual(dat, tong, "\n".join(lech))


if __name__ == "__main__":
    unittest.main()
