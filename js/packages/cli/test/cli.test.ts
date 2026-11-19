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

test("cli: lưới Tử Vi 4x4 thẳng hàng ở cả ba thứ tiếng và nhiều bề ngang", () => {
  for (const lang of ["en", "vi", "zh"]) {
    for (const width of [72, 88, 120]) {
      const out = run(["ziwei", "1990-09-19", "20:00", "male", "--lang", lang, "--name", "Nguyen Van An"], { color: false, width });
      const dong = out.split("\n");
      const luoi = dong.slice(0, dong.findIndex((x) => x.startsWith("└")) + 1);
      const rong = displayWidth(luoi[0]);
      for (const x of luoi) assert.equal(displayWidth(x), rong, `${lang} ${width}: ${x}`);
      assert.ok(rong <= width, `${lang} ${width}: rộng ${rong}`);
      assert.equal((luoi[0].match(/┬/g) ?? []).length, 3);
      assert.equal(luoi.filter((x) => x.startsWith("├")).length, 3);
      for (const x of dong) assert.ok(displayWidth(x) <= Math.max(width, rong), `${lang} ${width}: dòng quá rộng: ${x}`);
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

test("cli: lưới có đủ chính tinh của lá số", () => {
  const ls = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
  const out = run(["ziwei", "1990-09-19", "20:00", "male", "--year", "2026"], { color: false, width: 140 });
  for (const p of ls.palaces) for (const s of p.stars) if (s.kind === "major") assert.ok(out.includes(s.name), s.name);
  assert.match(out, /Year 2026 \(Bing Wu\)/);
});

test("cli: màu bật thì có mã ANSI, tắt thì không; --json bỏ raw", () => {
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

test("cli: trợ giúp, lỗi, đọc tham số", () => {
  assert.equal(run([], KHONG_MAU), HELP);
  assert.equal(run(["--help"], KHONG_MAU), HELP);
  assert.match(run(["-v"], KHONG_MAU), /^\d+\.\d+\.\d+$/);
  assert.throws(() => run(["nope"], KHONG_MAU), /unknown command/);
  assert.throws(() => run(["ziwei", "1990-09-19"], KHONG_MAU), /usage/);
  assert.throws(() => run(["ziwei", "1990-09-19", "25:00", "male"], KHONG_MAU), /time out of range/);
  assert.deepEqual(parseArgs(["lunar", "2027-02-06", "--country=KR", "--json"]), { command: "lunar", positional: ["2027-02-06"], flags: { country: "KR", json: true } });
});

test("cli: chạy như chương trình, mã thoát 1 khi lỗi, NO_COLOR", () => {
  const tep = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
  const out = execFileSync(process.execPath, ["--conditions=source", tep, "lunar", "2027-02-06"], { env: { ...process.env, FORCE_COLOR: "1", NO_COLOR: "1" } }).toString();
  assert.match(out, /Start of Spring/);
  assert.doesNotMatch(out, /\x1b\[/);
  const mau = execFileSync(process.execPath, ["--conditions=source", tep, "lunar", "2027-02-06"], { env: { ...process.env, FORCE_COLOR: "1", NO_COLOR: undefined } }).toString();
  assert.match(mau, /\x1b\[/);
  assert.throws(() => execFileSync(process.execPath, ["--conditions=source", tep, "bogus"], { stdio: "pipe" }), (e: { status: number }) => e.status === 1);
});

test("cli: đo bề rộng chữ Hán, cắt, gói dòng", () => {
  assert.equal(displayWidth("命宫"), 4);
  assert.equal(displayWidth("Mệnh"), 4);
  assert.equal(displayWidth(truncate("Celestial Mechanism", 10)), 10);
  assert.ok(wrap("天机 旺 紫微 庙 太阴 庙", 6).every((x) => displayWidth(x) <= 6));
  assert.deepEqual(wrapItems(["Tả Phù", "Hữu Bật", "Văn Xương"], ", ", 16), ["Tả Phù, Hữu Bật,", "Văn Xương"]);
});

test("cli: --svg ghi hình SVG, --theme dark", () => {
  const ghi: Record<string, string> = {};
  const env = { color: false, width: 88, writeFile: (p: string, d: string) => void (ghi[p] = d) };
  const txt = run(["ziwei", "1990-09-19", "20:00", "male", "--svg", "a.svg", "--theme", "dark"], env);
  assert.equal(txt, run(["ziwei", "1990-09-19", "20:00", "male"], KHONG_MAU));
  assert.equal(ghi["a.svg"], castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }).toSvg({ theme: "dark" }) + "\n");
  run(["bazi", "1990-09-19", "20:00", "male", "--svg", "b.svg"], env);
  run(["numerology", "An", "1990-09-19", "--svg", "c.svg", "--today", "2026-01-01"], env);
  for (const k of ["b.svg", "c.svg"]) assert.match(ghi[k], /^<svg /);
});

test("cli: cờ lựa chọn phái (--fire-bell, --leap-month, --zi-hour...)", () => {
  const j = JSON.parse(run(["ziwei", "1990-09-19", "20:00", "female", "--fire-bell", "quanshu", "--heavenly-kitchen", "chinese", "--json"], KHONG_MAU));
  assert.deepEqual(j.chart.schools, { fireBell: "quanshu", heavenlyKitchen: "chinese" });
  assert.deepEqual(j.chart.palaces, JSON.parse(JSON.stringify(castZiWei({ date: "1990-09-19", time: "20:00", gender: "female", schools: { fireBell: "quanshu", heavenlyKitchen: "chinese" } }).palaces)));
  assert.match(run(["ziwei", "1990-09-19", "20:00", "female", "--leap-month", "split-at-15"], KHONG_MAU), /School options/);
  const b = JSON.parse(run(["bazi", "2024-01-01", "23:30", "male", "--zi-hour", "split-at-midnight", "--json"], KHONG_MAU));
  assert.equal(b.pillars.day.label, "Jia Zi");
  assert.match(HELP, /--fire-bell vietnamese\|quanshu/);
  assert.throws(() => run(["ziwei", "1990-09-19", "20:00", "female", "--fire-bell", "toan-thu"], KHONG_MAU), /invalid fireBell/);
});

test("cli: --version là phiên bản trong package.json (release-tools set ghi cả hai)", () => {
  const goi = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
  assert.equal(VERSION, goi.version);
  assert.equal(run(["--version"], KHONG_MAU), goi.version);
});

test("cli: hours in mười hai canh giờ, sáu giờ hoàng đạo, thẳng hàng", () => {
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
