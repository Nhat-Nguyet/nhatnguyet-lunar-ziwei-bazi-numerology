// Kiểm chartToText của than-so-hoc: khuôn văn bản, và bản Python ra ĐÚNG TỪNG BYTE.
import { test } from "node:test";
import assert from "node:assert/strict";
import { vanBanPython } from "../../../kiem/van-ban-python.ts";
import type { CaVanBan } from "../../../kiem/van-ban-python.ts";
import { chartToText, numerology, tinhHoSoThanSoHocSau } from "../src/index.ts";

const HO_SO: Record<string, unknown>[] = [
  { name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" },
  { name: "Lê Thị Hoa", birthDate: "1985-02-13", today: "2027-01-01" },
  { name: "Mary Ann Smith", birthDate: "2004-11-29", today: "2026-06-30" },
];
const THO: Record<string, unknown>[] = [{ hoTen: "Phạm Minh Tuấn", dd: 22, mm: 11, yyyy: 1978, namXem: 2026, thangXem: 11, ngayXem: 19 }];

function cacCa(): CaVanBan[] {
  const ca: CaVanBan[] = [];
  for (const vao of HO_SO) for (const lang of ["vi", "en", "zh"] as const) for (const detail of ["full", "summary"] as const) ca.push({ mon: "than-so-hoc", cach: "en", vao, lang, detail });
  for (const vao of THO) for (const lang of [undefined, "vi"] as const) ca.push({ mon: "than-so-hoc", cach: "tho", vao, lang });
  return ca;
}

function chayTs(ca: CaVanBan): string {
  const v = ca.vao as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = ca.cach === "en" ? numerology(v as never) : tinhHoSoThanSoHocSau(v.hoTen, v.dd, v.mm, v.yyyy, v.namXem, v.thangXem, v.ngayXem);
  return chartToText(r, { lang: ca.lang, detail: ca.detail });
}

test("chartToText: khuôn văn bản thần số học", () => {
  for (const ca of cacCa()) {
    const s = chayTs(ca);
    assert.match(s.trimEnd().split("\n").at(-1)!, /\(nhatnguyet\.org\)$/);
    assert.ok(s.endsWith("\n") && !s.includes("\n\n\n") && !s.includes("—") && !s.includes("undefined"), s);
  }
  const en = chayTs({ mon: "than-so-hoc", cach: "en", vao: HO_SO[0], lang: "en" });
  assert.match(en, /^- Life Path: 11\n- Expression \(Destiny\): 3$/m);
  assert.match(en, /^- Personal Year \(2026\): 2$/m);
  assert.match(en, /^- 4: 1 \(for life\)$/m);
});

test("chartToText: Python ra đúng từng byte như TypeScript", (t) => {
  const ca = cacCa();
  const py = vanBanPython(ca);
  if (!py) return t.skip("không có python3");
  ca.forEach((c, i) => assert.equal(py[i], chayTs(c), JSON.stringify(c)));
});
