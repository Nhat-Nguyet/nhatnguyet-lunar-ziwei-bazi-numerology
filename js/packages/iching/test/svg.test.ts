import { test } from "node:test";
import assert from "node:assert/strict";
import { bam, chuTrongHinh, docHoacGhiBam, loiXml } from "../../../kiem/ve-svg.ts";
import type { CaVe } from "../../../kiem/ve-svg.ts";
import { castFromNumbers, renderHexagramSvg } from "../src/index.ts";

// Bộ hình mẫu: quẻ tĩnh, quẻ có một, nhiều, sáu hào động, quẻ tên dài.
const CAC_VAO: Record<string, unknown>[] = [
  { n: 1 },
  { n: 9 },
  { lines: [9, 8, 7, 6, 7, 8] },
  { lines: [6, 6, 6, 6, 6, 6] },
  { lines: [7, 8, 9, 7, 8, 7] },
  { n: 64 },
];

function ve(ca: CaVe): string {
  const v = ca.vao as { n?: number; lines?: number[] };
  return renderHexagramSvg((v.lines ?? v.n) as number, { lang: ca.lang, theme: ca.theme, width: ca.width });
}

test("svg: pinned SHA-256 (Python must give the same bytes)", () => {
  const ca = docHoacGhiBam("iching", CAC_VAO, ve);
  assert.equal(ca.length, CAC_VAO.length * 6);
  for (const c of ca) assert.equal(bam(ve(c)), c.sha256, JSON.stringify(c.vao) + " " + c.lang + " " + c.theme);
});

test("svg: well-formed, names in the right language, moving lines marked", () => {
  for (const vao of CAC_VAO) {
    for (const lang of ["vi", "en", "zh"] as const) {
      const s = ve({ vao, lang, theme: "light" });
      assert.equal(loiXml(s), null);
      const chu = chuTrongHinh(s);
      if (lang === "en" && vao.n === 1) assert.deepEqual(chu, ["1. The Creative", "乾 Qián"]);
      if (lang === "vi" && vao.n === 1) assert.equal(chu[0], "1. Thuần Càn");
      if (lang === "zh" && vao.n === 1) assert.deepEqual(chu, ["1. 乾", "Qián"]);
    }
  }
  const s = renderHexagramSvg([9, 8, 7, 6, 7, 8]);
  assert.equal((s.match(/<circle /g) ?? []).length, 1);
  assert.equal((s.match(/<path d="M17/g) ?? []).length, 1);
  assert.match(s, /aria-label="63\. After Completion → 31\. Influence"/);
  assert.match(renderHexagramSvg(castFromNumbers(1, 1, 1)), /→/);
  assert.match(renderHexagramSvg(1, { width: 120 }), /viewBox="0 0 200 232" width="120" role/);
  assert.throws(() => renderHexagramSvg(1, { theme: "blue" as "dark" }), TypeError);
  assert.throws(() => renderHexagramSvg(1, { width: 0 }), RangeError);
});
