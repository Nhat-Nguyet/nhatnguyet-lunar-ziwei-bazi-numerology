import { test } from "node:test";
import assert from "node:assert/strict";
import { bam, chuTrongHinh, docHoacGhiBam, loiXml } from "../../../kiem/ve-svg.ts";
import type { CaVe } from "../../../kiem/ve-svg.ts";
import { renderNumerologySvg, tinhHoSoThanSoHocSau, veThanSoHocSvg } from "../src/index.ts";
import type { VaoVeThanSoHoc } from "../src/index.ts";

// Lá mẫu: số chủ 11 và nợ nghiệp 19; tên Việt dài có dấu; ngày 29/2; tên một chữ.
const CAC_VAO = [
  { hoTen: "Nguyen Van An", dd: 19, mm: 9, yyyy: 1990, namXem: 2026 },
  { hoTen: "Trần Thị Bích Ngọc", dd: 29, mm: 2, yyyy: 1984, namXem: 2026 },
  { hoTen: "Nguyễn Phạm Hoàng Khánh Thiên Trường", dd: 13, mm: 11, yyyy: 2004, namXem: 2030 },
  { hoTen: "Lê", dd: 1, mm: 1, yyyy: 2000, namXem: 2026 },
];

function ve(c: CaVe): string {
  return veThanSoHocSvg(c.vao as unknown as VaoVeThanSoHoc, { lang: c.lang, theme: c.theme, width: c.width });
}

const CA = docHoacGhiBam("than_so_hoc", CAC_VAO, ve);

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

test("all numbers, pinnacles, challenges, personal year, name table; right language", () => {
  const v = CAC_VAO[0];
  const hs = tinhHoSoThanSoHocSau(v.hoTen, v.dd, v.mm, v.yyyy, v.namXem, 1, 1);
  const vi = chuTrongHinh(veThanSoHocSvg(v));
  for (const s of ["Số chủ đạo", "Sứ mệnh", "Linh hồn", "Nhân cách", "Thái độ", "Ngày sinh", "Trưởng thành", "Năm cá nhân 2026", "Đỉnh cao", "Thử thách", "Biểu đồ ngày sinh", "Bảng quy đổi họ tên", "Số chủ", "Nợ nghiệp 19"]) {
    assert.ok(vi.includes(s), `vi lacks ${s}`);
  }
  assert.ok(vi.includes(String(hs.soDuongDoi)) && vi.includes(String(hs.soNamCaNhan)));
  for (const c of "NGUYENVANAN") assert.ok(vi.includes(c), `name table lacks ${c}`);
  const en = chuTrongHinh(veThanSoHocSvg(v, { lang: "en" })).join("\n");
  for (const s of ["Life Path", "Expression", "Soul Urge", "Personality", "Pinnacle", "Challenge", "Personal year 2026", "Name chart"]) assert.ok(en.includes(s), `en lacks ${s}`);
  assert.ok(!en.includes("Sứ mệnh"), "English version mixes in Vietnamese");
  const zh = chuTrongHinh(veThanSoHocSvg(v, { lang: "zh" })).join("\n");
  for (const s of ["生命灵数", "使命数", "灵魂数", "人格数", "巅峰数", "挑战数", "个人年数"]) assert.ok(zh.includes(s), `zh lacks ${s}`);
  assert.ok(!zh.includes("Life Path") && !zh.includes("Sứ mệnh"), "Chinese version mixes in another language");
});

test("English aliases", () => {
  assert.equal(renderNumerologySvg(CAC_VAO[1], { lang: "en" }), veThanSoHocSvg(CAC_VAO[1], { lang: "en" }));
});
