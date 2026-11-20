// So lớp API tiếng Anh và lệnh dòng lệnh của bản TypeScript với bản Python:
// cùng kết quả JSON (bỏ raw; thứ tự khoá không tính) trên ca kiểm của Tử Vi,
// Bát Tự, âm lịch, lễ hội, ở mọi cách viết can chi (terms), và cùng từng byte
// chữ in ra của lệnh dòng lệnh.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { boRaw, chayPython } from "../../../kiem/en-python.ts";
import type { ViecPython } from "../../../kiem/en-python.ts";
import { auspiciousHours, toLunar } from "@nhatnguyet/am-lich";
import { castZiWei, decadeLuck, findPatterns, yearlyLuck, yearlyStars } from "@nhatnguyet/tu-vi";
import { castBaZi, minorLuck } from "@nhatnguyet/bat-tu";
import { festivals } from "@nhatnguyet/le-hoi";
import { run } from "../src/cli.ts";

const docCa = (mon: string) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../../../../ca-kiem/${mon}.json`, import.meta.url)), "utf8")).ca as { vao: Record<string, any> }[]; // eslint-disable-line @typescript-eslint/no-explicit-any
const p2 = (n: number) => String(n).padStart(2, "0");
const ngay = (v: Record<string, number>) => `${String(v.yyyy).padStart(4, "0")}-${p2(v.mm)}-${p2(v.dd)}`;

type Lang = "vi" | "en" | "zh";
type Terms = "pinyin" | "han" | "vi" | undefined;
const CACH: [Lang, Terms][] = [["en", undefined], ["en", "han"], ["en", "vi"]];

function cacViec(): { viec: ViecPython; ts: () => unknown }[] {
  const ds: { viec: ViecPython; ts: () => unknown }[] = [];
  const tv = docCa("tu-vi");
  tv.filter((_, i) => i % 19 === 0).forEach((c, i) => {
    const v = c.vao;
    const cach: [Lang, Terms][] = i % 10 === 0 ? [...CACH, ["vi", undefined], ["zh", undefined]] : CACH;
    for (const [lang, terms] of cach) {
      const a = { date: ngay(v), gender: v.gioiTinh, hourBranch: v.gio, lang, terms, viewYear: v.namXem, name: i % 3 ? "" : "Lê Hoa" };
      ds.push({
        viec: { ham: "zi_wei", thamSo: a },
        ts: () => {
          const ch = castZiWei({ date: a.date, gender: a.gender, hourBranch: a.hourBranch, lang, terms, viewYear: a.viewYear, name: a.name });
          return { chart: ch, decades: decadeLuck(ch), year: yearlyLuck(ch), stars: yearlyStars(ch), patterns: findPatterns(ch) };
        },
      });
    }
  });
  docCa("bat-tu").filter((_, i) => i % 19 === 0).forEach((c, i) => {
    const v = c.vao;
    const time = v.gio === null || v.gio === undefined ? null : `${p2(v.gio)}:${p2(v.phut ?? 0)}`;
    const cach: [Lang, Terms][] = i % 10 === 0 ? [...CACH, ["vi", undefined], ["zh", undefined]] : CACH;
    for (const [lang, terms] of cach) {
      const a = { date: ngay(v), gender: v.gioiTinh, time, lang, terms, year: v.namXem };
      ds.push({
        viec: { ham: "bazi", thamSo: a },
        ts: () => {
          const ch = castBaZi({ date: a.date, gender: a.gender, time, lang, terms });
          return { chart: ch, minor: minorLuck(ch, a.year) };
        },
      });
    }
  });
  // Lựa chọn phái (schools): lớp tiếng Anh nhận cùng khoá camelCase ở hai bản.
  const PHAI_TV: Record<string, unknown>[] = [
    { date: "1990-09-19", gender: "female", hourBranch: 10, viewYear: 2026, schools: { fireBell: "quanshu", leapMonth: "split-at-15", transformations: "zhongzhou" } },
    { date: "2023-04-10", gender: "male", hourBranch: 5, viewYear: 2024, schools: { leapMonth: "split-at-15" } },
    { date: "1993-08-15", gender: "male", hourBranch: 3, viewYear: 2026, schools: { heavenlyKitchen: "chinese", injuryMessenger: "zhongzhou" } },
    // Lịch âm của nước, múi giờ khác (country, timeZone): Tết 1985 lệch một ngày,
    // tháng nhuận 2023 của lịch Trung Quốc, giờ Tý.
    { date: "1985-01-21", gender: "male", hourBranch: 5, viewYear: 2026, country: "CN" },
    { date: "1985-01-21", gender: "female", hourBranch: 0, viewYear: 2026, timeZone: 8 },
    { date: "2023-04-10", gender: "male", hourBranch: 5, viewYear: 2024, country: "KR", schools: { leapMonth: "split-at-15" } },
    { date: "1990-09-19", gender: "female", hourBranch: 10, viewYear: 2026, country: "VN" },
  ];
  for (const b of PHAI_TV) {
    for (const [lang, terms] of [...CACH, ["vi", undefined], ["zh", undefined]] as [Lang, Terms][]) {
      const a = { ...b, lang, terms };
      ds.push({
        viec: { ham: "zi_wei", thamSo: a },
        ts: () => {
          const ch = castZiWei(a as never);
          return { chart: ch, decades: decadeLuck(ch), year: yearlyLuck(ch), stars: yearlyStars(ch), patterns: findPatterns(ch) };
        },
      });
    }
  }
  for (const lang of ["en", "vi", "zh"] as const) {
    const a = { date: "2024-01-01", gender: "male", time: "23:30", lang, year: 2026, schools: { ziHour: "split-at-midnight" } };
    ds.push({
      viec: { ham: "bazi", thamSo: a },
      ts: () => {
        const ch = castBaZi(a as never);
        return { chart: ch, minor: minorLuck(ch, a.year) };
      },
    });
  }
  docCa("am-lich").filter((c, i) => c.vao.phep === "duong-sang-am" && i % 373 === 0).forEach((c, i) => {
    for (const [lang, terms] of [...CACH, ["zh", undefined] as [Lang, Terms]]) {
      const a = { date: ngay(c.vao), lang, terms, country: i % 2 ? "CN" : undefined };
      ds.push({ viec: { ham: "to_lunar", thamSo: a }, ts: () => toLunar(a.date, { lang, terms, country: a.country }) });
    }
  });
  docCa("auspicious-hours").filter((_, i) => i % 97 === 0).forEach((c) => {
    for (const [lang, terms] of [...CACH, ["vi", undefined], ["zh", undefined]] as [Lang, Terms][]) {
      const a = { date: ngay(c.vao), lang, terms };
      ds.push({ viec: { ham: "auspicious_hours", thamSo: a }, ts: () => auspiciousHours(a.date, { lang, terms }) });
    }
  });
  for (const year of [1900, 2026, 2100]) {
    for (const lang of ["en", "vi", "zh"] as const) ds.push({ viec: { ham: "festivals", thamSo: { year, lang } }, ts: () => festivals(year, { lang }) });
  }
  const lenh: string[][] = [
    ["ziwei", "1990-09-19", "20:00", "male", "--name", "Nguyen Van An", "--year", "2026"],
    ["cast_ziwei", "1985-01-21", "23:30", "female", "--terms", "han", "--year", "2027"],
    ["ziwei", "2000-02-29", "06:10", "male", "--terms", "vi"],
    ["ziwei", "1990-09-19", "20:00", "male", "--lang", "zh"],
    ["bazi", "1990-09-19", "20:00", "male"],
    ["bazi", "1990-09-19", "female", "--terms", "han"],
    ["cast_bazi", "1968-01-29", "12:00", "male", "--terms", "vi"],
    ["lunar", "2027-02-06", "--country", "CN"],
    ["lunar_convert", "1985-01-21", "--terms", "han"],
    ["solar", "2023-02-01", "--leap"],
    ["solar", "2027-01-01", "--terms", "vi", "--country", "KR"],
    ["solar_terms", "2027", "--country", "JP"],
    ["festivals", "2027"],
    ["festivals", "2027", "--lang", "vi"],
    ["hours", "2027-02-06"],
    ["hours", "2027-02-06", "--lang", "vi"],
    ["auspicious_hours", "1900-01-01", "--lang", "zh"],
    ["hours", "2027-02-06", "--terms", "han", "--json"],
    ["ziwei", "1990-09-19", "20:00", "male", "--json", "--terms", "han"],
    ["ziwei", "1990-09-19", "20:00", "female", "--fire-bell", "quanshu", "--leap-month", "split-at-15", "--transformations", "zhongzhou"],
    ["ziwei", "1993-08-15", "06:00", "male", "--heavenly-kitchen", "chinese", "--injury-messenger", "zhongzhou", "--lang", "vi"],
    ["ziwei", "2023-04-10", "10:00", "male", "--leap-month=next-month", "--json", "--lang", "zh"],
    ["bazi", "2024-01-01", "23:30", "male", "--zi-hour", "split-at-midnight"],
    ["bazi", "2024-01-01", "23:30", "male", "--zi-hour", "split-at-midnight", "--json", "--lang", "zh"],
    ["ziwei", "1985-01-21", "10:00", "male", "--country", "CN"],
    ["ziwei", "1985-01-21", "10:00", "female", "--country", "JP", "--json", "--lang", "vi"],
    ["hexagram", "11"],
    ["hexagram", "Thai", "--lang", "vi"],
    ["hexagram", "64", "--lang", "zh"],
    ["hexagram", "29", "--terms", "han", "--json"],
    ["cast", "--lines", "987678", "--date", "2026-11-19"],
    ["six_lines_chart", "--lines", "9,6,6,9,7,8", "--date", "1950-06-01", "--lang", "vi"],
    ["cast", "--lines", "777777", "--date", "2100-12-31", "--lang", "zh"],
    ["cast", "--lines", "686868", "--date", "2026-02-04", "--terms", "vi", "--json"],
    ["daily-hexagram", "2026-11-19"],
    ["daily_hexagram", "2026-01-03", "--lang", "vi"],
    ["daily-hexagram", "1900-01-01", "--lang", "zh", "--json"],
    ["kua", "1990-09-19", "female"],
    ["kua", "1990-01-20", "male", "--lang", "vi"],
    ["life_gua", "1985", "female", "--lang", "zh", "--json"],
    ["flying-stars", "--period", "9", "--facing", "wu"],
    ["flying_star_chart", "--year", "2026", "--facing", "200", "--lang", "vi"],
    ["flying-stars", "--period", "8", "--sitting", "gen", "--lang", "zh", "--json"],
    ["luban", "80"],
    ["luban_ruler", "120.5", "--lang", "vi"],
    ["luban", "81", "--ruler", "clear-opening", "--lang", "zh", "--json"],
  ];
  for (const argv of lenh) {
    for (const width of [72, 120]) ds.push({ viec: { ham: "cli", thamSo: { argv, width } }, ts: () => run(argv, { color: false, width }) });
  }
  return ds;
}

test("English API and command line: Python prints the same as TypeScript", (t) => {
  const ds = cacViec();
  const py = chayPython(ds.map((x) => x.viec));
  if (!py) return t.skip("không có python3");
  assert.equal(py.length, ds.length);
  ds.forEach((x, i) => {
    const ts = x.ts();
    if (typeof ts === "string") assert.equal(py[i], ts, JSON.stringify(x.viec));
    else assert.deepEqual(py[i], boRaw(ts), JSON.stringify(x.viec));
  });
  assert.ok(ds.length > 300, String(ds.length));
});
