// Kiểm máy chủ MCP bằng client chính thức của SDK qua stdio: đủ mười bốn công cụ,
// mô tả nói rõ giờ Việt Nam, kết quả trùng thư viện, lỗi đầu vào thành isError.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { readFileSync } from "node:fs";
import { auspiciousHours } from "@nhatnguyet/am-lich";
import { castZiWei, chartToText } from "@nhatnguyet/tu-vi";
import { dailyHexagram, najia } from "@nhatnguyet/iching";
import { flyingStarChart, lifeGua } from "@nhatnguyet/fengshui";
import { VERSION } from "../src/server.ts";

const BIN = fileURLToPath(new URL("../src/bin.ts", import.meta.url));
const client = new Client({ name: "nhatnguyet-test", version: "0.0.0" });

before(async () => {
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ["--conditions=source", BIN], stderr: "pipe" }));
});
after(async () => {
  await client.close();
});

type KQ = { content: { type: string; text: string }[]; isError?: boolean };
async function goi(name: string, args: Record<string, unknown>): Promise<KQ> {
  return (await client.callTool({ name, arguments: args })) as KQ;
}

test("fourteen tools (plus the cast_zi_wei alias), English descriptions state Vietnam time", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), [
    "auspicious_hours", "cast_bazi", "cast_zi_wei", "cast_ziwei", "daily_hexagram", "festivals", "flying_star_chart", "hexagram", "life_gua",
    "luban_ruler", "lunar_convert", "numerology", "render_chart_svg", "six_lines_chart", "solar_terms",
  ]);
  for (const t of tools) {
    assert.ok(t.description && t.description.length > 80, t.name);
    assert.equal(t.annotations?.readOnlyHint, true);
  }
  const mo = (n: string) => tools.find((t) => t.name === n)!.description!;
  assert.match(mo("lunar_convert"), /UTC\+7/);
  assert.match(mo("cast_ziwei"), /23:00 to 00:59/);
  assert.match(mo("cast_zi_wei"), /Same as cast_ziwei/);
  assert.match(mo("cast_bazi"), /day at 23:00/);
  assert.match(client.getInstructions() ?? "", /Do not compute lunar dates/);
});

test("auspicious_hours: twelve double hours, six auspicious, same as auspiciousHours", async () => {
  const r = await goi("auspicious_hours", { date: "2027-02-06" });
  const ra = JSON.parse(r.content[0].text);
  assert.deepEqual(ra, JSON.parse(JSON.stringify(auspiciousHours("2027-02-06"))));
  assert.equal(ra.hours.filter((h: { auspicious: boolean }) => h.auspicious).length, 6);
  assert.equal(ra.hours[4].spirit, "Qing Long");
  const vi = JSON.parse((await goi("auspicious_hours", { date: "2027-02-06", lang: "vi" })).content[0].text);
  assert.equal(vi.hours[4].spirit, "Thanh Long");
  assert.equal(r.content[1].text, "Data: Nhat Nguyet (nhatnguyet.org)");
  const loi = await goi("auspicious_hours", { date: "2027-02-30" });
  assert.equal(loi.isError, true);
});

test("lunar_convert, solar_terms: Vietnamese calendar by default, other countries by country", async () => {
  const vn = JSON.parse((await goi("lunar_convert", { date: "1985-01-21" })).content[0].text);
  assert.deepEqual([vn.year, vn.month, vn.day, vn.timeZone], [1985, 1, 1, 7]);
  const cn = JSON.parse((await goi("lunar_convert", { date: "1985-01-21", country: "CN", lang: "zh" })).content[0].text);
  assert.deepEqual([cn.year, cn.month, cn.day, cn.yearName], [1984, 12, 1, "甲子"]);
  const ve = JSON.parse((await goi("lunar_convert", { date: "2023-02-01", direction: "lunar_to_solar", leap: true })).content[0].text);
  assert.equal(ve.date, "2023-03-22");
  const r = await goi("solar_terms", { year: 2027, country: "CN" });
  const ds = JSON.parse(r.content[0].text);
  assert.equal(ds.length, 24);
  assert.equal(ds[2].name, "Start of Spring");
  assert.equal(r.content[1].text, "Data: Nhat Nguyet (nhatnguyet.org)");
});

test("cast_ziwei (and the old cast_zi_wei) returns chartToText and compact JSON", async () => {
  const cu = await goi("cast_zi_wei", { date: "1990-09-19", time: "20:00", gender: "male", name: "Nguyen Van An", year: 2026 });
  const r = await goi("cast_ziwei", { date: "1990-09-19", time: "20:00", gender: "male", name: "Nguyen Van An", year: 2026 });
  assert.equal(r.isError, undefined);
  const ky = chartToText(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", name: "Nguyen Van An" }), { year: 2026 });
  assert.equal(r.content[0].text, ky);
  assert.deepEqual(cu.content, r.content);
  const han = await goi("cast_ziwei", { date: "1990-09-19", time: "20:00", gender: "male", terms: "han", detail: "summary" });
  assert.match(han.content[0].text, /^- Major stars: Moon \(Exalted, 化忌\)$/m);
  const j = JSON.parse(r.content[1].text);
  assert.equal(j.palaces[j.lifePalace].stars[0].name, "Moon");
  assert.equal("raw" in j, false);
  const zh = await goi("cast_zi_wei", { date: "1990-09-19", hour_branch: 10, gender: "male", lang: "zh", detail: "summary" });
  assert.match(zh.content[0].text, /^- 主星：太阴 \(庙, 化忌\)$/m);
});

test("cast_bazi, numerology, festivals", async () => {
  const b = await goi("cast_bazi", { date: "1990-09-19", gender: "female" });
  assert.match(b.content[0].text, /^### Hour pillar: time unknown$/m);
  assert.equal(JSON.parse(b.content[1].text).pillars.day.label, "Ding Hai");
  const bv = await goi("cast_bazi", { date: "1990-09-19", gender: "female", terms: "vi" });
  assert.equal(JSON.parse(bv.content[1].text).pillars.day.label, "Đinh Hợi");
  const n = await goi("numerology", { name: "Nguyen Van An", birth_date: "1990-09-19", today: "2026-11-19" });
  assert.match(n.content[0].text, /^- Life Path: 11$/m);
  assert.equal(JSON.parse(n.content[1].text).personalYear, 2);
  const f = JSON.parse((await goi("festivals", { year: 2027, month: 2, lang: "zh" })).content[0].text);
  assert.ok(f.some((x: { id: string; date: string; name: string }) => x.id === "tet-nguyen-dan" && x.date === "2027-02-06" && x.name === "越南春节"));
  assert.ok(f.every((x: { date: string }) => x.date.startsWith("2027-02")));
});

test("render_chart_svg and input errors", async () => {
  for (const args of [
    { kind: "ziwei", date: "1990-09-19", time: "20:00", gender: "male", theme: "dark" },
    { kind: "zi_wei", date: "1990-09-19", time: "20:00", gender: "male", terms: "han" },
    { kind: "bazi", date: "1990-09-19", gender: "male", name: "An" },
    { kind: "numerology", name: "Nguyen Van An", birth_date: "1990-09-19", today: "2026-11-19", lang: "vi" },
  ]) {
    const r = await goi("render_chart_svg", args);
    assert.ok(r.content[0].text.startsWith("<svg ") && r.content[0].text.endsWith("</svg>"), args.kind);
  }
  const loi = await goi("cast_zi_wei", { date: "1990-02-30", time: "20:00", gender: "male" });
  assert.equal(loi.isError, true);
  assert.match(loi.content[0].text, /^Error: /);
  const thieu = await goi("render_chart_svg", { kind: "zi_wei", date: "1990-09-19" });
  assert.equal(thieu.isError, true);
  const sai = await goi("lunar_convert", { date: "19-9-1990" });
  assert.equal(sai.isError, true);
});

test("school options: fire_bell, leap_month..., zi_hour; an unknown value is isError", async () => {
  const r = await goi("cast_ziwei", { date: "1990-09-19", time: "20:00", gender: "female", fire_bell: "quanshu", transformations: "zhongzhou" });
  const j = JSON.parse(r.content[1].text);
  assert.deepEqual(j.schools, { fireBell: "quanshu", transformations: "zhongzhou" });
  const mong = castZiWei({ date: "1990-09-19", time: "20:00", gender: "female", schools: { fireBell: "quanshu", transformations: "zhongzhou" } });
  assert.equal(r.content[0].text, chartToText(mong));
  assert.match(r.content[0].text, /School options \(not the default\): Fire and Bell stars: both forward \(Quan Shu\)/);
  const md = JSON.parse((await goi("cast_ziwei", { date: "1990-09-19", time: "20:00", gender: "female" })).content[1].text);
  assert.equal(md.schools, undefined);
  const b = JSON.parse((await goi("cast_bazi", { date: "2024-01-01", time: "23:30", gender: "male", zi_hour: "split-at-midnight" })).content[1].text);
  assert.deepEqual([b.pillars.day.label, b.pillars.hour.label, b.schools], ["Jia Zi", "Bing Zi", { ziHour: "split-at-midnight" }]);
  const svg = await goi("render_chart_svg", { kind: "ziwei", date: "1990-09-19", time: "20:00", gender: "female", leap_month: "split-at-15" });
  assert.match(svg.content[0].text, />Schools</);
  const sai = await goi("cast_ziwei", { date: "1990-09-19", time: "20:00", gender: "female", fire_bell: "tan-bien" });
  assert.equal(sai.isError, true);
});

test("server VERSION matches package.json (release-tools set writes both)", () => {
  const goi = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
  assert.equal(VERSION, goi.version);
  assert.equal(client.getServerVersion()?.version, goi.version);
});

test("I Ching tools: hexagram, six_lines_chart, daily_hexagram", async () => {
  const h = JSON.parse((await goi("hexagram", { hexagram: "Peace" })).content[0].text);
  assert.equal(h.hexagram.number, 11);
  assert.equal(h.mutual.name, "The Marrying Maiden");
  assert.equal(h.text.judgment.zh, "泰：小往大來，吉亨。");
  assert.equal(JSON.parse((await goi("hexagram", { hexagram: 11, lang: "vi" })).content[0].text).hexagram.name, "Địa Thiên Thái");
  assert.equal((await goi("hexagram", { hexagram: "Lu" })).isError, true);

  const r = await goi("six_lines_chart", { lines: [9, 8, 7, 6, 7, 8], date: "2026-11-19" });
  const kq = JSON.parse(r.content[0].text);
  assert.deepEqual(kq.chart, JSON.parse(JSON.stringify(najia([9, 8, 7, 6, 7, 8], { date: "2026-11-19" }), (k, v) => (k === "raw" ? undefined : v))));
  assert.equal(kq.cast.changed.name, "Influence");
  assert.equal(r.content[1].text, "Data: Nhat Nguyet (nhatnguyet.org)");
  assert.equal(JSON.parse((await goi("six_lines_chart", { date: "2026-11-19" })).content[0].text).cast.lines.length, 6);
  assert.equal((await goi("six_lines_chart", { lines: [9, 8, 7], date: "2026-11-19" })).isError, true);

  const d = JSON.parse((await goi("daily_hexagram", { date: "2026-11-19" })).content[0].text);
  assert.equal(d.hexagram.number, dailyHexagram("2026-11-19").hexagram.number);
  assert.equal(d.hexagram.name, "Biting Through");
});

test("feng shui tools: life_gua, flying_star_chart, luban_ruler", async () => {
  const g = JSON.parse((await goi("life_gua", { birth_date: "1990-09-19", gender: "female" })).content[0].text);
  assert.equal(g.number, 8);
  assert.deepEqual(g, JSON.parse(JSON.stringify(lifeGua("1990-09-19", "female"))));
  assert.equal(JSON.parse((await goi("life_gua", { lunar_year: 1989, gender: "male" })).content[0].text).number, 2);
  assert.equal((await goi("life_gua", { gender: "male" })).isError, true);

  const c = JSON.parse((await goi("flying_star_chart", { period: 9, facing: "wu" })).content[0].text);
  assert.equal(c.pattern, "double-sitting");
  assert.deepEqual(c, JSON.parse(JSON.stringify(flyingStarChart({ period: 9, facing: 180 }))));
  assert.equal(JSON.parse((await goi("flying_star_chart", { year: 2026, sitting: 0 })).content[0].text).period, 9);
  assert.equal((await goi("flying_star_chart", { facing: "wu" })).isError, true);

  const l = JSON.parse((await goi("luban_ruler", { length: 80 })).content[0].text);
  assert.equal(l.length, 3);
  const one = JSON.parse((await goi("luban_ruler", { length: 800, unit: "mm", ruler: "luban" })).content[0].text);
  assert.deepEqual(one.nearestAuspicious.map((x: { lengthCm: number }) => x.lengthCm), [69.7, 80.5]);
});
