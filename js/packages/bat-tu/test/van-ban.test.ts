// Kiểm chartToText của bat-tu: khuôn văn bản, và bản Python ra ĐÚNG TỪNG BYTE.
import { test } from "node:test";
import assert from "node:assert/strict";
import { vanBanPython } from "../../../kiem/van-ban-python.ts";
import type { CaVanBan } from "../../../kiem/van-ban-python.ts";
import { castBaZi, chartToText, lapLaSoBatTu } from "../src/index.ts";

const LA_EN: Record<string, unknown>[] = [
  { date: "1990-09-19", time: "20:00", gender: "male" },
  { date: "1990-09-19", gender: "female" },
  { date: "1985-02-04", time: "06:10", gender: "male" },
  { date: "2023-04-10", time: "23:30", gender: "female" },
  { date: "1968-01-29", time: "12:00", gender: "male" },
  { date: "2001-12-22", time: "00:05", gender: "female" },
];
const LA_THO: Record<string, unknown>[] = [
  { dd: 13, mm: 2, yyyy: 1985, gio: 7, phut: 45, gioiTinh: "Nữ" },
  { dd: 1, mm: 1, yyyy: 2001, gioiTinh: "Nam" },
];

function cacCa(): CaVanBan[] {
  const ca: CaVanBan[] = [];
  for (const vao of LA_EN) for (const lang of ["vi", "en", "zh"] as const) for (const detail of ["full", "summary"] as const) ca.push({ mon: "bat-tu", cach: "en", vao, lang, detail });
  ca.push({ mon: "bat-tu", cach: "en", vao: { ...LA_EN[0], lang: "vi" } });
  for (const vao of LA_THO) for (const lang of [undefined, "zh"] as const) ca.push({ mon: "bat-tu", cach: "tho", vao, lang });
  return ca;
}

function chayTs(ca: CaVanBan): string {
  const v = ca.vao as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const c = ca.cach === "en" ? castBaZi(v as never) : lapLaSoBatTu(v.dd, v.mm, v.yyyy, v.gio ?? null, v.phut ?? 0, v.gioiTinh);
  return chartToText(c, { lang: ca.lang, detail: ca.detail });
}

test("chartToText: khuôn văn bản Bát Tự", () => {
  for (const ca of cacCa()) {
    const s = chayTs(ca);
    const dong = s.trimEnd().split("\n");
    assert.match(dong.at(-1)!, /Nhat Nguyet \(nhatnguyet\.org\)$|Nhật Nguyệt \(nhatnguyet\.org\)$/);
    assert.equal(dong.filter((x) => x.startsWith("### ")).length, 4, "đủ bốn trụ");
    assert.ok(s.endsWith("\n") && !s.includes("\n\n\n"));
    assert.ok(!s.includes("—") && !s.includes("undefined") && !s.includes("null"), s);
  }
  const en = chayTs({ mon: "bat-tu", cach: "en", vao: LA_EN[0], lang: "en" });
  assert.match(en, /^### Day pillar: Đinh Hợi\n- Stem: Đinh \(Fire\), Ten God: Day Master$/m);
  assert.match(en, /^- 1\. Bính Tuất, from age 6 \(1996-2005\); Ten God: Rob Wealth; Day Master's stage: Nurture$/m);
  const vi = chayTs({ mon: "bat-tu", cach: "en", vao: LA_EN[1], lang: "vi", detail: "summary" });
  assert.match(vi, /^### Trụ giờ: chưa biết giờ$/m);
});

test("chartToText: Python ra đúng từng byte như TypeScript", (t) => {
  const ca = cacCa();
  const py = vanBanPython(ca);
  if (!py) return t.skip("không có python3");
  ca.forEach((c, i) => assert.equal(py[i], chayTs(c), JSON.stringify(c)));
});
