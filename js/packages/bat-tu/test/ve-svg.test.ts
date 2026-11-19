import { test } from "node:test";
import assert from "node:assert/strict";
import { bam, chuTrongHinh, docHoacGhiBam, loiXml } from "../../../kiem/ve-svg.ts";
import type { CaVe } from "../../../kiem/ve-svg.ts";
import { lapLaSoBatTu, renderBaziSvg, veBatTuSvg } from "../src/index.ts";

// Lá mẫu: có giờ, chưa biết giờ, giờ Tý muộn (23h, đổi ngày), sinh trước Lập Xuân.
const CAC_VAO = [
  { hoTen: "Nguyen Van An", dd: 19, mm: 9, yyyy: 1990, gio: 20, phut: 0, gioiTinh: "Nam" },
  { hoTen: "", dd: 1, mm: 1, yyyy: 2000, gio: null, phut: 0, gioiTinh: "Nữ" },
  { hoTen: "Trần Thị Bích Ngọc", dd: 29, mm: 2, yyyy: 1984, gio: 6, phut: 30, gioiTinh: "Nữ" },
  { hoTen: "Lê Hoàng Phúc", dd: 3, mm: 2, yyyy: 1955, gio: 23, phut: 30, gioiTinh: "Nam" },
  // Lựa chọn phái ziHour "split-at-midnight": dòng tiết sinh thêm "đổi ngày lúc nửa đêm".
  { hoTen: "", dd: 1, mm: 1, yyyy: 2024, gio: 23, phut: 30, gioiTinh: "Nam", schools: { ziHour: "split-at-midnight" } },
];

function laSo(v: Record<string, unknown>) {
  return lapLaSoBatTu(v.dd as number, v.mm as number, v.yyyy as number, v.gio as number | null, v.phut as number, v.gioiTinh as string, v.schools as never);
}
function ve(c: CaVe): string {
  return veBatTuSvg(laSo(c.vao), { lang: c.lang, theme: c.theme, width: c.width, hoTen: c.vao.hoTen as string, terms: c.terms });
}

const CA = docHoacGhiBam("bat_tu", CAC_VAO, ve, true);

test("SVG is valid, has a <title> and matches the hash shared with Python", () => {
  assert.ok(CA.length >= 24);
  for (const c of CA) {
    const svg = ve(c);
    assert.equal(loiXml(svg), null, JSON.stringify(c.vao));
    assert.match(svg, /<title id="nn-tieu-de">[^<]+<\/title>/);
    assert.ok(svg.includes(`lang="${c.lang}"`));
    assert.ok(!svg.includes("—"), "no em dash");
    assert.equal(bam(svg), c.sha256, `${JSON.stringify(c.vao)} ${c.lang} ${c.theme}`);
  }
});

test("four pillars, hidden stems, ten gods, ten luck periods, right language", () => {
  const ls = laSo(CAC_VAO[0]);
  const vi = chuTrongHinh(veBatTuSvg(ls));
  for (const s of ["Trụ năm", "Trụ tháng", "Trụ ngày", "Trụ giờ", "Canh", "Ngọ", "Ất", "Dậu", "Đinh", "Hợi", "Tuất", "Nhật chủ", "Chính Tài", "Đại vận", "Lộ Bàng Thổ"]) {
    assert.ok(vi.includes(s), `vi lacks ${s}`);
  }
  for (const v of ls.daiVan.cacVan) assert.ok(vi.includes(`${v.tuoiTu} tuổi`), `luck period missing ${v.tuoiTu}`);
  for (const t of [ls.truNam, ls.truThang, ls.truNgay, ls.truGio!]) {
    for (const tc of t.tangCan) assert.ok(vi.includes(tc.thapThan), `hidden-stem ten god missing ${tc.thapThan}`);
  }
  const en = chuTrongHinh(veBatTuSvg(ls, { lang: "en" })).join("\n");
  for (const s of ["Year", "Month", "Day", "Hour", "Day Master", "Direct Wealth", "Luck pillars", "Yang Metal"]) assert.ok(en.includes(s), `en lacks ${s}`);
  assert.ok(!en.includes("Trụ năm") && !en.includes("Đại vận"), "English version mixes in Vietnamese");
  const zh = chuTrongHinh(veBatTuSvg(ls, { lang: "zh" })).join("\n");
  for (const s of ["年柱", "日主", "庚", "午", "乙", "酉", "丁", "亥", "戌", "正财", "大运", "路旁土"]) assert.ok(zh.includes(s), `zh lacks ${s}`);
  assert.ok(!zh.includes("Year") && !zh.includes("Trụ năm") && !zh.includes("Canh"), "Chinese version mixes in another language");
});

test("unknown time shows an unknown hour column; English aliases", () => {
  const ls = laSo(CAC_VAO[1]);
  assert.ok(chuTrongHinh(veBatTuSvg(ls)).includes("Chưa rõ giờ"));
  assert.equal(renderBaziSvg(ls, { lang: "en" }), veBatTuSvg(ls, { lang: "en" }));
});
