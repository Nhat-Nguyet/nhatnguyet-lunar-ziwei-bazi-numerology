// Kiểm máy chủ MCP bằng client chính thức của SDK qua stdio: đủ bảy công cụ,
// mô tả nói rõ giờ Việt Nam, kết quả trùng thư viện, lỗi đầu vào thành isError.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { castZiWei, chartToText } from "@nhatnguyet/tu-vi";

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

test("bảy công cụ, mô tả tiếng Anh nói rõ giờ Việt Nam", async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["cast_bazi", "cast_zi_wei", "festivals", "lunar_convert", "numerology", "render_chart_svg", "solar_terms"]);
  for (const t of tools) {
    assert.ok(t.description && t.description.length > 80, t.name);
    assert.equal(t.annotations?.readOnlyHint, true);
  }
  const mo = (n: string) => tools.find((t) => t.name === n)!.description!;
  assert.match(mo("lunar_convert"), /UTC\+7/);
  assert.match(mo("cast_zi_wei"), /23:00 to 00:59/);
  assert.match(mo("cast_bazi"), /day at 23:00/);
  assert.match(client.getInstructions() ?? "", /Do not compute lunar dates/);
});

test("lunar_convert, solar_terms: lịch Việt Nam mặc định, nước khác theo country", async () => {
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

test("cast_zi_wei trả chartToText và JSON gọn", async () => {
  const r = await goi("cast_zi_wei", { date: "1990-09-19", time: "20:00", gender: "male", name: "Nguyen Van An", year: 2026 });
  assert.equal(r.isError, undefined);
  const ky = chartToText(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", name: "Nguyen Van An" }), { year: 2026 });
  assert.equal(r.content[0].text, ky);
  const j = JSON.parse(r.content[1].text);
  assert.equal(j.palaces[j.lifePalace].stars[0].name, "Moon");
  assert.equal("raw" in j, false);
  const zh = await goi("cast_zi_wei", { date: "1990-09-19", hour_branch: 10, gender: "male", lang: "zh", detail: "summary" });
  assert.match(zh.content[0].text, /^- 主星：太阴 \(庙, 化忌\)$/m);
});

test("cast_bazi, numerology, festivals", async () => {
  const b = await goi("cast_bazi", { date: "1990-09-19", gender: "female" });
  assert.match(b.content[0].text, /^### Hour pillar: time unknown$/m);
  assert.equal(JSON.parse(b.content[1].text).pillars.day.label, "Đinh Hợi");
  const n = await goi("numerology", { name: "Nguyen Van An", birth_date: "1990-09-19", today: "2026-11-19" });
  assert.match(n.content[0].text, /^- Life Path: 11$/m);
  assert.equal(JSON.parse(n.content[1].text).personalYear, 2);
  const f = JSON.parse((await goi("festivals", { year: 2027, month: 2, lang: "zh" })).content[0].text);
  assert.ok(f.some((x: { id: string; date: string; name: string }) => x.id === "tet-nguyen-dan" && x.date === "2027-02-06" && x.name === "越南春节"));
  assert.ok(f.every((x: { date: string }) => x.date.startsWith("2027-02")));
});

test("render_chart_svg và lỗi đầu vào", async () => {
  for (const args of [
    { kind: "zi_wei", date: "1990-09-19", time: "20:00", gender: "male", theme: "dark" },
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
