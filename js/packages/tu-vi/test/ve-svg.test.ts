import { test } from "node:test";
import assert from "node:assert/strict";
import { bam, chuTrongHinh, docHoacGhiBam, loiXml } from "../../../kiem/ve-svg.ts";
import { CHINH_TINH_NAME_EN, TEN_CUNG_THEO_OFFSET, TU_VUNG_SAO, lapLaSoTuVi, renderChartSvg, veLaSoSvg } from "../src/index.ts";
import type { CaVe } from "../../../kiem/ve-svg.ts";
import { starEn } from "../src/ten-en.ts";

const CUNG_ZH = ["命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫", "迁移宫", "奴仆宫", "官禄宫", "田宅宫", "福德宫", "父母宫"];
const CHINH_TINH = Object.keys(CHINH_TINH_NAME_EN);

// Lá mẫu: tên Việt có dấu, giờ Tý (ghi chú giờ Tý), Âm Nữ, năm nhuận, sinh trước Tết.
const CAC_VAO = [
  { hoTen: "Nguyen Van An", gioiTinh: "Nam", dd: 19, mm: 9, yyyy: 1990, gio: 10 },
  { hoTen: "", gioiTinh: "Nữ", dd: 1, mm: 1, yyyy: 2000, gio: 0 },
  { hoTen: "Trần Thị Bích Ngọc", gioiTinh: "Nữ", dd: 29, mm: 2, yyyy: 1984, gio: 6 },
  { hoTen: "Lê Hoàng Phúc", gioiTinh: "Nam", dd: 15, mm: 8, yyyy: 1975, gio: 3 },
  // Lựa chọn phái (schools): thêm hàng "Phái" ở giữa, hàng khít lại; chuỗi dài co chữ tới 8.
  { hoTen: "Phạm Quý", gioiTinh: "Nam", dd: 15, mm: 8, yyyy: 1993, gio: 3, schools: { fireBell: "swap-for-yin-male-yang-female", transformations: "zhongzhou", heavenlyKitchen: "chinese", injuryMessenger: "zhongzhou" } },
  { hoTen: "", gioiTinh: "Nữ", dd: 10, mm: 4, yyyy: 2023, gio: 5, schools: { leapMonth: "split-at-15" } },
];

function laSo(v: Record<string, unknown>) {
  return lapLaSoTuVi(v.hoTen as string, v.gioiTinh as string, v.dd as number, v.mm as number, v.yyyy as number, v.gio as number, v.schools as never);
}
function ve(c: CaVe): string {
  return veLaSoSvg(laSo(c.vao), { lang: c.lang, theme: c.theme, width: c.width, terms: c.terms });
}

const CA = docHoacGhiBam("tu_vi", CAC_VAO, ve, true);

test("SVG is valid, has a <title> and matches the hash shared with Python", () => {
  assert.ok(CA.length >= 24);
  for (const c of CA) {
    const svg = ve(c);
    assert.equal(loiXml(svg), null, JSON.stringify(c.vao));
    assert.match(svg, /<title id="nn-tieu-de">[^<]+<\/title>/);
    assert.ok(svg.includes(`lang="${c.lang}"`));
    assert.ok(!svg.includes("—"), "no em dash");
    assert.equal(bam(svg), c.sha256, `${JSON.stringify(c.vao)} ${c.lang} ${c.terms ?? ""} ${c.theme}`);
  }
});

test("12 palaces and 14 main stars, right language", () => {
  for (const v of CAC_VAO) {
    const ls = laSo(v);
    for (const lang of ["vi", "en", "zh"] as const) {
      const chu = chuTrongHinh(veLaSoSvg(ls, { lang }));
      const tat = chu.join("\n");
      const cung = lang === "vi" ? TEN_CUNG_THEO_OFFSET.map((c) => c.vi) : lang === "en" ? TEN_CUNG_THEO_OFFSET.map((c) => c.en) : CUNG_ZH;
      for (const t of cung) assert.ok(chu.includes(t), `${lang}: palace missing ${t}`);
      for (const s of CHINH_TINH) {
        const ten = lang === "vi" ? s : lang === "en" ? starEn(s, CHINH_TINH_NAME_EN[s]) : TU_VUNG_SAO[s].zh;
        assert.ok(chu.some((x) => x.startsWith(ten)), `${lang}: main star missing ${ten}`);
      }
      if (lang === "zh") {
        assert.ok(!tat.includes("Life Palace") && !tat.includes("Mệnh ở"), "Chinese version mixes in English or Vietnamese");
      }
      if (lang === "en") assert.ok(!tat.includes("Phu Thê") && !tat.includes("Dương lịch"), "English version mixes in Vietnamese");
      if (lang === "vi") assert.ok(!tat.includes("Life Palace") && !tat.includes("命宫"), "Vietnamese version mixes in another language");
    }
  }
});

test("width only changes the display size; English aliases", () => {
  const ls = laSo(CAC_VAO[0]);
  const a = veLaSoSvg(ls, { width: 360 });
  assert.ok(a.includes(`width="360" height="370.1"`));
  assert.equal(renderChartSvg(ls, { lang: "en" }), veLaSoSvg(ls, { lang: "en" }));
  assert.equal(veLaSoSvg(ls), veLaSoSvg(ls, { lang: "vi", theme: "light", width: 720 }));
});
