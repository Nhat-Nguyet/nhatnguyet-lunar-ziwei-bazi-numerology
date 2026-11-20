// Kiểm lệnh dòng lệnh: chữ in ra, khung lưới thẳng hàng, JSON, màu, lỗi.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { HELP, VERSION, parseArgs, run } from "../src/cli.ts";
import { displayWidth, truncate, wrap, wrapItems } from "../src/render.ts";
import { castZiWei } from "@nhatnguyet/tu-vi";

const KHONG_MAU = { color: false, width: 88 };
const boMau = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

test("cli: the 4x4 Zi Wei grid lines up in three languages and several widths", () => {
  for (const lang of ["en", "vi", "zh"]) {
    for (const width of [72, 88, 120]) {
      const out = run(["ziwei", "1990-09-19", "20:00", "male", "--lang", lang, "--name", "Nguyen Van An"], { color: false, width });
      const dong = out.split("\n");
      const luoi = dong.slice(0, dong.findIndex((x) => x.startsWith("└")) + 1);
      const rong = displayWidth(luoi[0]);
      for (const x of luoi) assert.equal(displayWidth(x), rong, `${lang} ${width}: ${x}`);
      assert.ok(rong <= width, `${lang} ${width}: width ${rong}`);
      assert.equal((luoi[0].match(/┬/g) ?? []).length, 3);
      assert.equal(luoi.filter((x) => x.startsWith("├")).length, 3);
      for (const x of dong) assert.ok(displayWidth(x) <= Math.max(width, rong), `${lang} ${width}: line too wide: ${x}`);
    }
  }
  const en = run(["ziwei", "1990-09-19", "20:00", "male"], KHONG_MAU);
  assert.match(en, /Life Palace/);
  assert.match(en, /Xu double hour/);
  assert.match(en, /Ding Hai Xun Kong/);
  assert.match(en, /Moon Ex Ji/);
  const han = run(["ziwei", "1990-09-19", "20:00", "male", "--terms", "han"], KHONG_MAU);
  assert.match(han, /丁亥 旬空/);
  assert.match(han, /Moon Ex 忌/);
  assert.match(run(["ziwei", "1990-09-19", "20:00", "male", "--terms", "vi"], KHONG_MAU), /Đinh Hợi Tuần/);
  for (const a of ["zi_wei", "zi-wei", "cast_ziwei", "cast_zi_wei"]) assert.equal(run([a, "1990-09-19", "20:00", "male"], KHONG_MAU), en, a);
  assert.match(run(["tuvi", "1990-09-19", "20:00", "nam", "--lang", "vi"], KHONG_MAU), /Mệnh/);
  assert.match(run(["ziwei", "1990-09-19", "20:00", "male", "--lang", "zh"], KHONG_MAU), /命宫/);
});

test("cli: the grid has every main star of the chart", () => {
  const ls = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
  const out = run(["ziwei", "1990-09-19", "20:00", "male", "--year", "2026"], { color: false, width: 140 });
  for (const p of ls.palaces) for (const s of p.stars) if (s.kind === "major") assert.ok(out.includes(s.name), s.name);
  assert.match(out, /Year 2026 \(Bing Wu\)/);
});

test("cli: ANSI codes only with colour on; --json drops raw", () => {
  const mau = run(["ziwei", "1990-09-19", "20:00", "male"], { color: true, width: 88 });
  assert.match(mau, /\x1b\[/);
  assert.equal(boMau(mau), run(["ziwei", "1990-09-19", "20:00", "male"], KHONG_MAU));
  assert.doesNotMatch(run(["ziwei", "1990-09-19", "20:00", "male", "--no-color"], { color: true, width: 88 }), /\x1b\[/);
  const j = JSON.parse(run(["ziwei", "1990-09-19", "20:00", "male", "--json"], KHONG_MAU));
  assert.equal(j.chart.palaces.length, 12);
  assert.equal(j.chart.raw, undefined);
  assert.equal(j.decades.length, 12);
});

test("cli: bazi, lunar, solar, terms, numerology, festivals", () => {
  const bz = run(["bazi", "1990-09-19", "20:00", "male"], KHONG_MAU);
  assert.match(bz, /Day Master: Ding \(Yin Fire\)/);
  assert.match(bz, /Hour Geng Xu/);
  assert.match(run(["bazi", "1990-09-19", "20:00", "male", "--terms", "vi"], KHONG_MAU), /Hour Canh Tuất/);
  assert.equal(run(["cast_bazi", "1990-09-19", "20:00", "male"], KHONG_MAU), bz);
  assert.match(run(["bazi", "1990-09-19", "female"], KHONG_MAU), /time unknown/);
  const ln = run(["lunar", "2027-02-06", "--country", "CN"], KHONG_MAU);
  assert.match(ln, /2027-01-01/);
  assert.match(ln, /CN \(UTC\+8\)/);
  assert.match(run(["lunar", "1985-01-21", "--country", "CN"], KHONG_MAU), /1984-12-01/);
  // solar in bảng như lunar, dựng từ ngày dương vừa đổi.
  const so = run(["solar", "2027-01-01"], KHONG_MAU);
  assert.equal(so, run(["lunar", "2027-02-06"], KHONG_MAU));
  assert.match(so, /Gregorian\s+│ 2027-02-06/);
  assert.match(run(["solar", "2023-02-01", "--leap"], KHONG_MAU), /2023-02 \(leap\)-01/);
  assert.equal(JSON.parse(run(["solar", "2023-02-01", "--leap", "--json"], KHONG_MAU)).date, "2023-03-22");
  assert.equal(run(["lunar_convert", "2027-02-06"], KHONG_MAU), run(["lunar", "2027-02-06"], KHONG_MAU));
  assert.equal(run(["solar_terms", "2027"], KHONG_MAU), run(["terms", "2027"], KHONG_MAU));
  assert.match(ln, /Ding Wei · Goat/);
  assert.match(run(["terms", "2027", "--country", "CN"], KHONG_MAU), /2027-02-04 │ 09:46/);
  const nm = run(["numerology", "Nguyen Van An", "1990-09-19", "--today", "2026-11-19"], KHONG_MAU);
  assert.match(nm, /Life Path\s+11/);
  assert.match(nm, /9999/);
  const fe = run(["festivals", "2027"], KHONG_MAU);
  assert.match(fe, /2027-02-06 │ 1\/1 lunar/);
  assert.match(run(["festivals", "2027", "--lang", "zh"], KHONG_MAU), /节日 2027/);
  assert.deepEqual(JSON.parse(run(["lunar", "2027-02-06", "--json"], KHONG_MAU)).year, 2027);
});

test("cli: help, errors, argument parsing", () => {
  assert.equal(run([], KHONG_MAU), HELP);
  assert.equal(run(["--help"], KHONG_MAU), HELP);
  assert.match(run(["-v"], KHONG_MAU), /^\d+\.\d+\.\d+$/);
  assert.throws(() => run(["nope"], KHONG_MAU), /unknown command/);
  assert.throws(() => run(["ziwei", "1990-09-19"], KHONG_MAU), /usage/);
  assert.throws(() => run(["ziwei", "1990-09-19", "25:00", "male"], KHONG_MAU), /time out of range/);
  assert.deepEqual(parseArgs(["lunar", "2027-02-06", "--country=KR", "--json"]), { command: "lunar", positional: ["2027-02-06"], flags: { country: "KR", json: true } });
});

test("cli: runs as a program, exit code 1 on error, NO_COLOR", () => {
  const tep = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
  const out = execFileSync(process.execPath, ["--conditions=source", tep, "lunar", "2027-02-06"], { env: { ...process.env, FORCE_COLOR: "1", NO_COLOR: "1" } }).toString();
  assert.match(out, /Start of Spring/);
  assert.doesNotMatch(out, /\x1b\[/);
  const mau = execFileSync(process.execPath, ["--conditions=source", tep, "lunar", "2027-02-06"], { env: { ...process.env, FORCE_COLOR: "1", NO_COLOR: undefined } }).toString();
  assert.match(mau, /\x1b\[/);
  assert.throws(() => execFileSync(process.execPath, ["--conditions=source", tep, "bogus"], { stdio: "pipe" }), (e: { status: number }) => e.status === 1);
});

test("cli: CJK display width, truncation, wrapping", () => {
  assert.equal(displayWidth("命宫"), 4);
  assert.equal(displayWidth("Mệnh"), 4);
  assert.equal(displayWidth(truncate("Celestial Mechanism", 10)), 10);
  assert.ok(wrap("天机 旺 紫微 庙 太阴 庙", 6).every((x) => displayWidth(x) <= 6));
  assert.deepEqual(wrapItems(["Tả Phù", "Hữu Bật", "Văn Xương"], ", ", 16), ["Tả Phù, Hữu Bật,", "Văn Xương"]);
});

test("cli: --svg writes an SVG, --theme dark", () => {
  const ghi: Record<string, string> = {};
  const env = { color: false, width: 88, writeFile: (p: string, d: string) => void (ghi[p] = d) };
  const txt = run(["ziwei", "1990-09-19", "20:00", "male", "--svg", "a.svg", "--theme", "dark"], env);
  assert.equal(txt, run(["ziwei", "1990-09-19", "20:00", "male"], KHONG_MAU));
  assert.equal(ghi["a.svg"], castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }).toSvg({ theme: "dark" }) + "\n");
  run(["bazi", "1990-09-19", "20:00", "male", "--svg", "b.svg"], env);
  run(["numerology", "An", "1990-09-19", "--svg", "c.svg", "--today", "2026-01-01"], env);
  for (const k of ["b.svg", "c.svg"]) assert.match(ghi[k], /^<svg /);
});

test("cli: school flags (--fire-bell, --leap-month, --zi-hour...)", () => {
  const j = JSON.parse(run(["ziwei", "1990-09-19", "20:00", "female", "--fire-bell", "quanshu", "--heavenly-kitchen", "chinese", "--json"], KHONG_MAU));
  assert.deepEqual(j.chart.schools, { fireBell: "quanshu", heavenlyKitchen: "chinese" });
  assert.deepEqual(j.chart.palaces, JSON.parse(JSON.stringify(castZiWei({ date: "1990-09-19", time: "20:00", gender: "female", schools: { fireBell: "quanshu", heavenlyKitchen: "chinese" } }).palaces)));
  assert.match(run(["ziwei", "1990-09-19", "20:00", "female", "--leap-month", "split-at-15"], KHONG_MAU), /School options/);
  const b = JSON.parse(run(["bazi", "2024-01-01", "23:30", "male", "--zi-hour", "split-at-midnight", "--json"], KHONG_MAU));
  assert.equal(b.pillars.day.label, "Jia Zi");
  assert.match(HELP, /--fire-bell vietnamese\|quanshu/);
  assert.throws(() => run(["ziwei", "1990-09-19", "20:00", "female", "--fire-bell", "toan-thu"], KHONG_MAU), /invalid fireBell/);
});

test("cli: --version is the package.json version (release-tools set writes both)", () => {
  const goi = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
  assert.equal(VERSION, goi.version);
  assert.equal(run(["--version"], KHONG_MAU), goi.version);
});

test("cli: hours prints twelve double hours, six auspicious, aligned", () => {
  for (const lang of ["en", "vi", "zh"]) {
    const out = run(["hours", "2027-02-06", "--lang", lang], KHONG_MAU);
    const dong = out.split("\n");
    assert.equal(dong.length, 1 + 12 + 2, lang);
    const rong = displayWidth(dong[1]);
    for (const x of dong.slice(1)) assert.equal(displayWidth(x), rong, `${lang}: ${x}`);
  }
  const en = run(["hours", "2027-02-06"], KHONG_MAU);
  assert.match(en, /^AUSPICIOUS HOURS {2}2027-02-06 · Day Bing Chen/);
  assert.equal((en.match(/│ auspicious /g) ?? []).length, 6);
  assert.match(en, /Chen \(Dragon\) +│ 07:00-08:59 │ auspicious +│ Qing Long/);
  const j = JSON.parse(run(["auspicious_hours", "2027-02-06", "--json", "--terms", "han"], KHONG_MAU));
  assert.equal(j.hours[4].spirit, "青龙");
  assert.match(HELP, /nhatnguyet hours <YYYY-MM-DD>/);
});

test("cli: I Ching commands (hexagram, cast, daily-hexagram)", () => {
  const h = run(["hexagram", "11"], KHONG_MAU);
  assert.match(h, /^HEXAGRAM 11 ䷊ Peace/);
  assert.match(h, /Judgment \(Zhou Yi\) │ 泰：小往大來，吉亨。/);
  assert.match(h, /━━━━━━━  3  world/);
  for (const a of ["Peace", "泰", "Thai", "Tài", "Địa Thiên Thái"]) assert.equal(run(["hexagram", ...a.split(" ")], KHONG_MAU), h, a);
  assert.match(run(["hexagram", "11", "--lang", "vi"], KHONG_MAU), /^QUẺ 11 ䷊ Địa Thiên Thái/);
  assert.match(run(["hexagram", "11", "--lang", "zh"], KHONG_MAU), /^卦 11 ䷊ 泰/);
  assert.equal(JSON.parse(run(["hexagram", "11", "--json"], KHONG_MAU)).mutual.number, 54);

  const c = run(["cast", "--lines", "987678", "--date", "2026-11-19"], KHONG_MAU);
  assert.match(c, /63 ䷾ After Completion → 31 ䷞ Influence/);
  assert.match(c, /Moving lines: 1, 4/);
  assert.match(c, /day Ding You · month Ji Hai · void Chen, Si/);
  assert.match(c, /1 {5}━━━━━━━ ○ {2}Vermilion Bird {2}Offspring {6}Ji Mao Wood {4}supported/);
  assert.match(c, /1 {2}Mao Wood Offspring → Chen Earth Officer\/Ghost/);
  assert.equal(run(["six_lines_chart", "--lines", "9,8,7,6,7,8", "--date", "2026-11-19"], KHONG_MAU), c);
  const j = JSON.parse(run(["cast", "--lines", "777777", "--date", "2026-11-19", "--json"], KHONG_MAU));
  assert.equal(j.cast.primary.number, 1);
  assert.equal(j.cast.changed, null);
  assert.equal(j.chart.lines.length, 6);
  // không --lines: gieo ngẫu nhiên, vẫn đủ sáu hào
  assert.equal(JSON.parse(run(["cast", "--date", "2026-11-19", "--json"], KHONG_MAU)).cast.lines.length, 6);
  assert.throws(() => run(["cast", "--lines", "98767", "--date", "2026-11-19"], KHONG_MAU));

  const d = run(["daily-hexagram", "2026-11-19"], KHONG_MAU);
  assert.match(d, /Hexagram {12}│ 21 ䷔ Biting Through/);
  assert.match(d, /55 of 60 · minister/);
  assert.match(run(["daily_hexagram", "2026-01-03"], KHONG_MAU), /Change during the day │ 02:15 24 ䷗ Return → 3 ䷂ Difficulty at the Beginning/);
});

test("cli: feng shui commands (kua, flying-stars, luban)", () => {
  const k = run(["kua", "1990-09-19", "female"], KHONG_MAU);
  assert.match(k, /Kua number 8 · ☶ Gen \(Mountain\) · West group · Earth/);
  assert.match(k, /│ Southwest │ 202\.5°-247\.5° │ Sheng Qi 生气 │ Generating Qi {3}│ favorable {3}│/);
  assert.match(run(["kua", "1990-01-20", "male"], KHONG_MAU), /Born before the lunar New Year, so the lunar year is 1989\./);
  assert.equal(JSON.parse(run(["life_gua", "1990", "male", "--json"], KHONG_MAU)).number, 1);
  assert.match(run(["kua", "1990-09-19", "female", "--lang", "vi"], KHONG_MAU), /Cung phi 8 · ☶ Cấn \(Núi\)/);

  const f = run(["flying-stars", "--period", "9", "--facing", "wu"], KHONG_MAU);
  assert.match(f, /period 9 · sitting Zi \(North\) · facing Wu \(South\)/);
  assert.match(f, /Double Stars at Sitting/);
  const grid = f.split("\n").filter((x) => /^[┌├└│]/.test(x));
  for (const x of grid) assert.equal(displayWidth(x), displayWidth(grid[0]), x);
  // sơn, hướng / vận của chín cung, Nam ở trên: 63/8 18/4 81/6 | 72/7 54/9 36/2 | 27/3 99/5 45/1
  const so = grid.filter((x) => /│ \d/.test(x)).map((x) => x.split("│").slice(1, -1).map((o) => o.trim()));
  assert.deepEqual(so.flat(), ["6  3", "1  8", "8  1", "8", "4", "6", "7  2", "5  4", "3  6", "7", "9", "2", "2  7", "9  9", "4  5", "3", "5", "1"]);
  assert.equal(run(["flying-stars", "--period", "9", "--facing", "180"], KHONG_MAU), f);
  assert.match(run(["flying-stars", "--year", "2026", "--sitting", "zi"], KHONG_MAU), /period 9 · year 2026/);
  assert.throws(() => run(["flying-stars", "--facing", "wu"], KHONG_MAU), /usage/);

  const l = run(["luban", "80"], KHONG_MAU);
  // Cung nhỏ: bính âm và chữ Hán giản thể, dòng dưới là nghĩa tiếng Anh; cung lớn cũng in giản thể (福禄, không 福祿).
  assert.match(l, /│ 42\.9cm Luban rule {9}│ Hai 害 {5}│ Kou She 口舌 {4}│ unfavorable │ 69\.7, 80\.5 cm {8}│/);
  assert.match(l, /│ {27}│ {12}│ Quarrels {8}│/);
  assert.match(l, /│ Fu Lu 福禄 │ Fu Gui 富贵 /);
  assert.equal(l.split("\n").filter((x) => x.startsWith("│")).length, 6);
  const lHan = run(["luban", "80", "--terms", "han"], KHONG_MAU);
  assert.match(lHan, /│ 福禄 {3}│ 富贵 {12}│/);
  assert.match(run(["luban", "80", "--lang", "zh"], KHONG_MAU), /│ 福禄 │ 富贵 │/);
  assert.match(run(["luban", "80", "--lang", "vi"], KHONG_MAU), /│ Phúc Lộc 福禄 │ Phú quý 富贵 /);
  assert.equal(JSON.parse(run(["luban", "81", "--ruler", "luban", "--json"], KHONG_MAU)).sector.name, "Ben");
  assert.equal(JSON.parse(run(["luban", "81", "--json"], KHONG_MAU)).length, 3);
});

test("cli: --svg for the I Ching and feng shui commands", () => {
  const ghi: Record<string, string> = {};
  const env = { color: false, width: 88, writeFile: (p: string, d: string) => (ghi[p] = d) };
  run(["hexagram", "11", "--svg", "h.svg"], env);
  run(["cast", "--lines", "987678", "--date", "2026-11-19", "--svg", "c.svg", "--theme", "dark"], env);
  run(["daily-hexagram", "2026-11-19", "--svg", "d.svg"], env);
  run(["kua", "1990-09-19", "female", "--svg", "k.svg"], env);
  run(["flying-stars", "--period", "9", "--facing", "wu", "--svg", "f.svg"], env);
  for (const k of ["h.svg", "c.svg", "d.svg", "k.svg", "f.svg"]) {
    assert.match(ghi[k], /^<svg /, k);
    assert.ok(ghi[k].endsWith("</svg>\n"), k);
  }
});
