// Hai hình SVG: hợp lệ, đúng ngôn ngữ, và ra cùng băm với bản Python (băm ghim ở
// python/tests/ve_svg_fengshui.json; sinh lại bằng CAP_NHAT_VE_SVG=1).
import { test } from "node:test";
import assert from "node:assert/strict";
import { bam, chuTrongHinh, docHoacGhiBam, loiXml } from "../../../kiem/ve-svg.ts";
import type { CaVe } from "../../../kiem/ve-svg.ts";
import { flyingStarChart, lifeGua, houseGua, renderCompassSvg, renderFlyingStarSvg } from "../src/index.ts";

// Hình mẫu: la bàn trống, cung phi kèm hướng nhà, trạch nhà quay bắc lên, hai tinh bàn.
const CAC_VAO: Record<string, unknown>[] = [
  { hinh: "compass" },
  { hinh: "compass", lifeGua: ["1990-09-19", "female"], facing: 180 },
  { hinh: "compass", houseSitting: "Càn", orientation: "north-up" },
  { hinh: "compass", gua: 3, facing: "Tốn" },
  { hinh: "chart", period: 9, facing: "Ngọ" },
  { hinh: "chart", period: 8, facing: 37 },
  { hinh: "chart", year: 1990, sitting: "Tân" },
];

function ve(c: CaVe): string {
  const v = c.vao as Record<string, any>;
  const o = { lang: c.lang, terms: c.terms, theme: c.theme, width: c.width };
  if (v.hinh === "chart") {
    const input = { period: v.period, year: v.year, facing: v.facing, sitting: v.sitting };
    return v.year ? renderFlyingStarSvg(flyingStarChart(input), o) : renderFlyingStarSvg(input, o);
  }
  const gua = v.lifeGua ? lifeGua(v.lifeGua[0], v.lifeGua[1]) : v.houseSitting ? houseGua({ sitting: v.houseSitting }) : v.gua;
  return renderCompassSvg({ ...o, gua, facing: v.facing, orientation: v.orientation });
}

const CA = docHoacGhiBam("fengshui", CAC_VAO, ve, true);

test("SVG is valid, has a <title> and matches the hash shared with Python", () => {
  assert.ok(CA.length >= 40);
  for (const c of CA) {
    const svg = ve(c);
    assert.equal(loiXml(svg), null, JSON.stringify(c.vao));
    assert.match(svg, /<title id="nn-tieu-de">[^<]+<\/title>/);
    assert.ok(svg.includes(`lang="${c.lang}"`));
    assert.ok(!svg.includes("—"), "no em dash");
    assert.equal(bam(svg), c.sha256, `${JSON.stringify(c.vao)} ${c.lang} ${c.theme} ${c.terms ?? ""}`);
  }
});

test("compass shows 24 mountains, 8 stars of the gua; chart shows 27 stars", () => {
  const t = chuTrongHinh(renderCompassSvg({ gua: 1 }));
  // Tên du niên hai chữ vẽ thành hai dòng để vừa vòng (Yan Nian ở phía Tây từng bị che).
  for (const s of ["Zi", "Gui", "Ren", "Xun", "Sheng", "Qi", "Jue", "Ming", "Gua 1 · Kan"]) assert.ok(t.includes(s), s);
  const vi = chuTrongHinh(renderCompassSvg({ gua: 1, lang: "vi" }));
  for (const s of ["Tý", "Nhâm", "Sinh", "Khí", "Tuyệt", "Mệnh"]) assert.ok(vi.includes(s), s);
  const zhSao = chuTrongHinh(renderCompassSvg({ gua: 1, lang: "zh" }));
  for (const s of ["生气", "绝命"]) assert.ok(zhSao.includes(s), s);
  const zh = chuTrongHinh(renderFlyingStarSvg({ period: 9, facing: "wu" }, { lang: "zh" }));
  assert.ok(zh.includes("9运 · 坐子向午"));
  assert.ok(zh.includes("双星到坐"));
  const so = chuTrongHinh(renderFlyingStarSvg({ period: 9, facing: "wu" })).filter((x) => /^[1-9]$/.test(x));
  assert.equal(so.length, 27);
  assert.throws(() => renderCompassSvg({ theme: "blue" as never }), TypeError);
  assert.throws(() => renderCompassSvg({ orientation: "east-up" as never }), TypeError);
});
