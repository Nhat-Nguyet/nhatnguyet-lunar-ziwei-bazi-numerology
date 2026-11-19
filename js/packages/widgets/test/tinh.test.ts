// Phần tính của @nhatnguyet/widgets phải ra đúng con số widget nhúng trên
// nhatnguyet.org đang hiện. Bộ ca test/fixtures/doi-chieu-site.json là đầu
// ra thật của API site (đổi lịch, giờ hoàng đạo, Tết sắp tới) cho 50 ngày từ
// 1901 tới 2098, gồm mốc quanh Tết và tháng nhuận.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auspiciousHours } from "@nhatnguyet/am-lich";
import { chuTren } from "../src/thanh-phan.ts";
import {
  canChiTheo,
  chuCanChiNgay,
  docLang,
  docTerms,
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

test("lunar date, stem-branch and solar term match the site widget", () => {
  assert.ok(BO.ca.length >= 50);
  for (const c of BO.ca) {
    const sd = docNgay(c.ngay)!;
    const n = ngayLich(sd);
    assert.deepEqual(n.am, c.am, c.ngay);
    assert.equal(`${n.canChiNgay.can} ${n.canChiNgay.chi}`, c.canChiNgay, c.ngay);
    if (c.tietKhi) assert.equal(n.tietKhi.ten, c.tietKhi, c.ngay);
  }
});

test("auspicious hours match the site widget", () => {
  for (const c of BO.ca) {
    const tot = gioHoangDao(docNgay(c.ngay)!).filter((g) => g.hoangDao).map((g) => CHI_VI[g.chi]);
    assert.deepEqual(tot, c.gioHoangDao, c.ngay);
  }
});

test("next Tết matches the site widget", () => {
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

test("text in three languages", () => {
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
  assert.equal(chuCanChiNgay("en", sd), "Day Ding You");
  assert.equal(chuCanChiNgay("en", sd, false, "han"), "Day 丁酉");
  assert.equal(chuCanChiNgay("en", sd, false, "vi"), "Day Đinh Dậu");
  assert.equal(chuCanChiNgay("zh", sd), "丁酉日");
  assert.equal(chuCanChiNgay("zh", sd, false, "vi"), "丁酉日");
  assert.equal(chuCanChiNgay("vi", sd, false, "pinyin"), "ngày Đinh Dậu");
  assert.equal(canChiTheo("en", "Đinh", "Mùi"), "Ding Wei");
  assert.equal(tenCanhGio("en", 3), "Cat");
  assert.equal(tenCanhGio("zh", 0), "子");
  assert.equal(khungGio("vi", 0), "23:00-00:59");
  assert.equal(khungGio("en", 6), "11:00-12:59");
});

test("terms attribute follows the library terms option", () => {
  assert.equal(docTerms(null, "en"), "pinyin");
  assert.equal(docTerms("han", "en"), "han");
  assert.equal(docTerms("vi", "en"), "vi");
  assert.equal(docTerms("xx", "en"), "pinyin");
  assert.equal(docTerms("pinyin", "zh"), "han");
  assert.equal(docTerms("pinyin", "vi"), "vi");
});

test("hour ranges are the library's auspiciousHours range", () => {
  for (const c of BO.ca.slice(0, 10)) {
    const sd = docNgay(c.ngay)!;
    const lib = auspiciousHours(sd).hours.map((h) => h.range);
    assert.deepEqual(gioHoangDao(sd).map((g) => g.range), lib, c.ngay);
    assert.deepEqual(gioHoangDao(sd).map((g) => khungGio("en", g.chi)), lib, c.ngay);
  }
});

// WCAG 2 contrast of the hour cells, light and dark: the inauspicious cells
// (sky colour under a paper overlay at .85, label in --nn-mucNhat) and the
// auspicious ones (label chosen by chuTren) must reach 4.5:1.
test("hour cells reach 4.5:1 contrast in light and dark themes", () => {
  const TROI = ["#1e2a44", "#243352", "#33456b", "#5a6f92", "#8fa6c0", "#c3d2df", "#e2e6e0", "#dfd9c8", "#cbb894", "#94849a", "#4e4468", "#2a2f4d"];
  const rgb = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ti = (a: number[], b: number[]) => (Math.max(L(a), L(b)) + 0.05) / (Math.min(L(a), L(b)) + 0.05);
  const tron = (tren: number[], duoi: number[], a: number) => tren.map((v, i) => v * a + duoi[i] * (1 - a));
  for (const [giay, chu] of [["#ffffff", "#4a5250"], ["#182a28", "#b4c0bd"]]) {
    for (const t of TROI) {
      const nen = tron(rgb(giay), rgb(t), 0.85);
      assert.ok(ti(rgb(chu), nen) >= 4.5, `inauspicious ${t} on ${giay}: ${ti(rgb(chu), nen).toFixed(2)}`);
    }
  }
  for (const t of TROI) assert.ok(ti(rgb(chuTren(t)), rgb(t)) >= 4.5, `auspicious ${t}: ${ti(rgb(chuTren(t)), rgb(t)).toFixed(2)}`);
  const css = readFileSync(new URL("../src/thanh-phan.ts", import.meta.url), "utf8");
  assert.match(css, /\.o \.phu\{[^}]*opacity:\.85\}/);
  assert.doesNotMatch(css, /\.o span\{[^}]*opacity/);
  const gd = readFileSync(new URL("../src/giao-dien.ts", import.meta.url), "utf8");
  assert.match(gd, /mucNhat: "#4a5250"/);
  assert.match(gd, /mucNhat: "#b4c0bd"/);
});

test("unknown attributes fall back to safe defaults", () => {
  assert.equal(docLang("zh"), "zh");
  assert.equal(docLang("en-US"), "en");
  assert.equal(docLang("VI"), "vi");
  assert.equal(docLang("zh-Hant-TW"), "zh");
  assert.equal(docLang("vie"), "en");
});

test("lang: attribute, then nearest ancestor or <html>, then browser, then en", () => {
  assert.equal(docLang(null), "en");
  assert.equal(docLang("fr"), "en");
  assert.equal(docLang(null, "vi"), "vi");
  assert.equal(docLang("zh", "vi", "en-US"), "zh");
  assert.equal(docLang(null, "en-GB", "vi-VN"), "en");
  assert.equal(docLang(null, "fr", "vi-VN"), "vi");
  assert.equal(docLang(null, null, "zh-CN"), "zh");
  assert.equal(docLang(null, "", "de-DE"), "en");
  assert.equal(docLang("", null, undefined), "en");
});

test("other attributes fall back to safe defaults", () => {
  assert.equal(docNgay("2026-02-30"), null);
  assert.equal(docNgay("19/11/2026"), null);
  assert.equal(docNgay("2101-01-01"), null);
  assert.equal(docNgay("1899-12-31"), null);
  assert.equal(muiGio(undefined), 7);
  assert.equal(muiGio("cn"), 8);
  assert.equal(muiGio("XX"), 7);
});

test("month grid: weeks start on Monday, every day present", () => {
  const t = thangLich(11, 2026);
  assert.equal(t.ngay.length, 30);
  assert.equal(t.dauTuan, 6); // 1/11/2026 là Chủ nhật
  const t2 = thangLich(2, 2028);
  assert.equal(t2.ngay.length, 29);
});

test("Tết by country time zone: China and Vietnam differ in 2030", () => {
  // Tết 2030: Việt Nam 2/2, Trung Quốc 3/2 (điểm sóc rơi giữa hai múi giờ).
  const vn = tetSapToi({ day: 1, month: 12, year: 2029 }, 7).tet;
  const cn = tetSapToi({ day: 1, month: 12, year: 2029 }, 8).tet;
  assert.deepEqual(vn, { day: 2, month: 2, year: 2030 });
  assert.deepEqual(cn, { day: 3, month: 2, year: 2030 });
});
