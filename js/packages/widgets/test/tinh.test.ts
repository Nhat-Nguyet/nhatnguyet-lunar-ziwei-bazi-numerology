// Phần tính của @nhatnguyet/widgets phải ra đúng con số widget nhúng trên
// nhatnguyet.org đang hiện. Bộ ca test/fixtures/doi-chieu-site.json là đầu
// ra thật của API site (đổi lịch, giờ hoàng đạo, Tết sắp tới) cho 50 ngày từ
// 1901 tới 2098, gồm mốc quanh Tết và tháng nhuận.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  chuCanChiNgay,
  docLang,
  docNgay,
  gioHoangDao,
  khungGio,
  muiGio,
  ngayLich,
  nhanAm,
  tenCanhGio,
  tetSapToi,
  thangLich,
  thangNam,
} from "../src/tinh.ts";

const CHI_VI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const BO = JSON.parse(readFileSync(new URL("./fixtures/doi-chieu-site.json", import.meta.url), "utf8")) as {
  ca: {
    ngay: string;
    am: { day: number; month: number; year: number; leap: boolean };
    canChiNgay: string;
    tietKhi: string | null;
    gioHoangDao: string[];
    tet: { ngay: string; soNgay: number; laMungMot: boolean; laGiaoThua: boolean; canChiNam: string };
  }[];
};

test("ngày âm, can chi, tiết khí khớp widget trên site", () => {
  assert.ok(BO.ca.length >= 50);
  for (const c of BO.ca) {
    const sd = docNgay(c.ngay)!;
    const n = ngayLich(sd);
    assert.deepEqual(n.am, c.am, c.ngay);
    assert.equal(`${n.canChiNgay.can} ${n.canChiNgay.chi}`, c.canChiNgay, c.ngay);
    if (c.tietKhi) assert.equal(n.tietKhi.ten, c.tietKhi, c.ngay);
  }
});

test("giờ hoàng đạo khớp widget trên site", () => {
  for (const c of BO.ca) {
    const tot = gioHoangDao(docNgay(c.ngay)!).filter((g) => g.hoangDao).map((g) => CHI_VI[g.chi]);
    assert.deepEqual(tot, c.gioHoangDao, c.ngay);
  }
});

test("Tết sắp tới khớp widget trên site", () => {
  for (const c of BO.ca) {
    const k = tetSapToi(docNgay(c.ngay)!);
    const p = (n: number) => String(n).padStart(2, "0");
    assert.equal(`${k.tet.year}-${p(k.tet.month)}-${p(k.tet.day)}`, c.tet.ngay, c.ngay);
    assert.equal(k.soNgayConLai, c.tet.soNgay, c.ngay);
    assert.equal(k.laMungMot, c.tet.laMungMot, c.ngay);
    assert.equal(k.laGiaoThua, c.tet.laGiaoThua, c.ngay);
    assert.equal(`${k.canChiNam.can} ${k.canChiNam.chi}`, c.tet.canChiNam, c.ngay);
  }
});

test("chữ ba thứ tiếng", () => {
  const am = { day: 11, month: 10, year: 2026, leap: false };
  assert.equal(nhanAm("vi", am), "11/10 âm lịch");
  assert.equal(nhanAm("en", am), "Lunar day 11, month 10");
  assert.equal(nhanAm("zh", am), "农历十月十一");
  assert.equal(nhanAm("zh", { day: 1, month: 1, year: 2027, leap: false }, true), "农历2027年正月初一");
  assert.equal(nhanAm("zh", { day: 25, month: 4, year: 2020, leap: true }), "农历闰四月廿五");
  assert.equal(thangNam("en", 11, 2026), "November 2026");
  assert.equal(thangNam("zh", 11, 2026), "2026年11月");
  assert.equal(thangNam("vi", 11, 2026), "Tháng 11 · 2026");
  const sd = docNgay("2026-11-19")!;
  assert.equal(chuCanChiNgay("vi", sd), "ngày Đinh Dậu");
  assert.equal(chuCanChiNgay("en", sd), "Day Đinh Dậu");
  assert.equal(chuCanChiNgay("zh", sd), "丁酉日");
  assert.equal(tenCanhGio("en", 3), "Cat");
  assert.equal(tenCanhGio("zh", 0), "子");
  assert.equal(khungGio("vi", 0), "23h-1h");
  assert.equal(khungGio("en", 6), "11:00-13:00");
});

test("thuộc tính lạ rơi về mặc định an toàn", () => {
  assert.equal(docLang("fr"), "vi");
  assert.equal(docLang("zh"), "zh");
  assert.equal(docNgay("2026-02-30"), null);
  assert.equal(docNgay("19/11/2026"), null);
  assert.equal(muiGio(undefined), 7);
  assert.equal(muiGio("cn"), 8);
  assert.equal(muiGio("XX"), 7);
});

test("lưới tháng: tuần bắt đầu từ Thứ Hai, đủ ngày", () => {
  const t = thangLich(11, 2026);
  assert.equal(t.ngay.length, 30);
  assert.equal(t.dauTuan, 6); // 1/11/2026 là Chủ nhật
  const t2 = thangLich(2, 2028);
  assert.equal(t2.ngay.length, 29);
});

test("Tết theo múi giờ nước: Trung Quốc và Việt Nam lệch năm 2030", () => {
  // Tết 2030: Việt Nam 2/2, Trung Quốc 3/2 (điểm sóc rơi giữa hai múi giờ).
  const vn = tetSapToi({ day: 1, month: 12, year: 2029 }, 7).tet;
  const cn = tetSapToi({ day: 1, month: 12, year: 2029 }, 8).tet;
  assert.deepEqual(vn, { day: 2, month: 2, year: 2030 });
  assert.deepEqual(cn, { day: 3, month: 2, year: 2030 });
});
