// Kiểm chartToText của tu-vi: khuôn văn bản, và bản Python ra ĐÚNG TỪNG BYTE.
import { test } from "node:test";
import assert from "node:assert/strict";
import { vanBanPython } from "../../../kiem/van-ban-python.ts";
import type { CaVanBan } from "../../../kiem/van-ban-python.ts";
import { castZiWei, chartToText, lapLaSoTuVi } from "../src/index.ts";

const LA_EN: Record<string, unknown>[] = [
  { date: "1990-09-19", time: "20:00", gender: "male", name: "Nguyen Van An" },
  { date: "1985-01-21", time: "10:00", gender: "female" },
  { date: "2023-04-10", time: "23:30", gender: "male", name: "Trần Bình" },
  { date: "1968-01-29", time: "12:00", gender: "female" },
  { date: "2000-08-16", time: "04:15", gender: "female", name: "Lý Mai" },
  { date: "1957-05-31", hourBranch: 7, gender: "male" },
  { date: "2030-02-03", time: "09:00", gender: "male" },
  { date: "1900-10-09", time: "00:30", gender: "female" },
];
const LA_THO: Record<string, unknown>[] = [
  { hoTen: "Lê Thị Hoa", gioiTinh: "Nữ", dd: 13, mm: 2, yyyy: 1985, gio: 3 },
  { hoTen: "", gioiTinh: "Nam", dd: 1, mm: 1, yyyy: 2001, gio: 0 },
];
// Lựa chọn phái (schools): ghi chú, Hỏa Linh, tháng nhuận, Thiên Trù, Thiên Thương.
const LA_PHAI: Record<string, unknown>[] = [
  { date: "1990-09-19", time: "20:00", gender: "female", schools: { fireBell: "quanshu", leapMonth: "split-at-15", transformations: "zhongzhou" } },
  { date: "2023-04-10", time: "10:00", gender: "male", schools: { leapMonth: "split-at-15" } },
  { date: "1993-08-15", time: "06:00", gender: "male", schools: { heavenlyKitchen: "chinese", injuryMessenger: "zhongzhou" } },
  { date: "1980-03-01", time: "00:30", gender: "female", schools: { transformations: "quanshu", fireBell: "swap-for-yin-male-yang-female", leapMonth: "next-month" } },
];

function cacCa(): CaVanBan[] {
  const ca: CaVanBan[] = [];
  LA_EN.forEach((vao, i) => {
    for (const lang of ["vi", "en", "zh"] as const) {
      for (const detail of ["full", "summary"] as const) {
        ca.push({ mon: "tu-vi", cach: "en", vao, lang, detail, ...(i % 2 === 0 && detail === "full" ? { year: 2026 + i } : {}) });
      }
    }
  });
  ca.push({ mon: "tu-vi", cach: "en", vao: { ...LA_EN[0], lang: "zh" } });
  // Cách viết can chi của bản Anh: tuỳ chọn của chartToText, của castZiWei, và lá số tiếng Việt in ra tiếng Anh.
  LA_EN.slice(0, 4).forEach((vao, i) => {
    for (const terms of ["han", "vi", "pinyin"] as const) ca.push({ mon: "tu-vi", cach: "en", vao, lang: "en", terms, ...(i === 0 ? { year: 2026 } : {}) });
  });
  ca.push({ mon: "tu-vi", cach: "en", vao: { ...LA_EN[2], terms: "han" } });
  ca.push({ mon: "tu-vi", cach: "en", vao: { ...LA_EN[3], lang: "vi" }, lang: "en" });
  ca.push({ mon: "tu-vi", cach: "tho", vao: LA_THO[0], terms: "han" });
  for (const vao of LA_THO) for (const lang of [undefined, "vi", "zh"] as const) ca.push({ mon: "tu-vi", cach: "tho", vao, lang });
  LA_PHAI.forEach((vao, i) => {
    for (const lang of ["vi", "en", "zh"] as const) ca.push({ mon: "tu-vi", cach: "en", vao, lang, ...(i % 2 ? {} : { year: 2026 }) });
  });
  ca.push({ mon: "tu-vi", cach: "en", vao: LA_PHAI[0], lang: "en", terms: "han", detail: "summary" });
  ca.push({ mon: "tu-vi", cach: "tho", vao: { ...LA_THO[0], schools: { fireBell: "quanshu", heavenlyKitchen: "chinese" } }, lang: "zh" });
  return ca;
}

function chayTs(ca: CaVanBan): string {
  const v = ca.vao as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const c = ca.cach === "en" ? castZiWei(v as never) : lapLaSoTuVi(v.hoTen, v.gioiTinh, v.dd, v.mm, v.yyyy, v.gio, v.schools);
  return chartToText(c, { lang: ca.lang, detail: ca.detail, year: ca.year, terms: ca.terms });
}

test("chartToText: khuôn văn bản Tử Vi", () => {
  for (const ca of cacCa()) {
    const s = chayTs(ca);
    const dong = s.trimEnd().split("\n");
    const lang = ca.lang ?? (ca.cach === "en" ? ((ca.vao.lang as string) ?? "en") : "en");
    assert.equal(dong.at(-1), { vi: "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)", en: "Data: Nhat Nguyet (nhatnguyet.org)", zh: "数据：Nhat Nguyet (nhatnguyet.org)" }[lang]);
    assert.equal(dong.filter((x) => x.startsWith("### ")).length, 12, "đủ 12 cung");
    assert.ok(s.endsWith("\n") && !s.includes("\n\n\n"), "không dòng trống kép");
    assert.ok(!s.includes("—") && !s.includes("undefined") && !s.includes("null"), s);
  }
  const en = chayTs({ mon: "tu-vi", cach: "en", vao: LA_EN[0], lang: "en", year: 2026 });
  assert.match(en, /^### Life Palace \(Hai, Ding Hai\) · Xun Kong void\n- Major stars: Moon \(Exalted, Hua Ji\)$/m);
  assert.match(en, /^- Major stars: none\. Opposite palace \(Career, Mao\): Sun \(Prosperous, Hua Lu\), Celestial Beam \(Prosperous\)$/m);
  assert.match(en, /^## Year 2026 \(Bing Wu\), East Asian age 37$/m);
  const han = chayTs({ mon: "tu-vi", cach: "en", vao: LA_EN[0], lang: "en", terms: "han" });
  assert.match(han, /^### Life Palace \(亥, 丁亥\) · 旬空 void\n- Major stars: Moon \(Exalted, 化忌\)$/m);
  const hv = chayTs({ mon: "tu-vi", cach: "en", vao: LA_EN[0], lang: "en", terms: "vi" });
  assert.match(hv, /^### Life Palace \(Hợi, Đinh Hợi\) · Tuần void\n- Major stars: Moon \(Exalted, Hóa Kỵ\)$/m);
  const zh = chayTs({ mon: "tu-vi", cach: "en", vao: LA_EN[0], lang: "zh", detail: "summary" });
  assert.match(zh, /^### 命宫 \(亥, 丁亥\) · 旬空\n- 主星：太阴 \(庙, 化忌\)$/m);
  assert.ok(!zh.includes("## 大限"), "bản tóm tắt không có đại vận");
  const nhuan = chayTs({ mon: "tu-vi", cach: "en", vao: LA_EN[2], lang: "en" });
  assert.match(nhuan, /^- Birth date \(lunar\): 2023-02-20 \(leap month\)$/m);
  assert.throws(() => chartToText(castZiWei(LA_EN[0] as never), { detail: "short" as never }), TypeError);
});

test("chartToText: Python ra đúng từng byte như TypeScript", (t) => {
  const ca = cacCa();
  const py = vanBanPython(ca);
  if (!py) return t.skip("không có python3");
  assert.equal(py.length, ca.length);
  ca.forEach((c, i) => assert.equal(py[i], chayTs(c), JSON.stringify(c)));
});
