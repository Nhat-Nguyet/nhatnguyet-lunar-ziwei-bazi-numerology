import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  allHexagrams,
  castCoins,
  castFromNumbers,
  changed,
  dailyHexagram,
  hexagram,
  hexagramNumber,
  mutual,
  najia,
  opposite,
  reverse,
  text,
  trigram,
} from "../src/index.ts";

const VIET = /[ăâđêôơưạảãậẩẫầấắằẳẵặẹẻẽếềểễệịỉĩọỏõốồổỗộớờởỡợụủũứừửữựỳỵỷỹĂÂĐÊÔƠƯ]/;

/** Mọi chuỗi trong một kết quả, trừ các khoá cố ý mang chữ Việt hay dấu thanh bính âm. */
function chu(x: unknown): string {
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return x.map(chu).join("|");
  if (x && typeof x === "object") {
    return Object.entries(x).filter(([k]) => !["nameVi", "raw", "pinyin"].includes(k)).map(([, v]) => chu(v)).join("|");
  }
  return "";
}

test("hexagram: every way to name one", () => {
  const h = hexagram(11);
  assert.deepEqual([h.name, h.pinyin, h.nameHan, h.nameVi, h.symbol], ["Peace", "Tài", "泰", "Địa Thiên Thái", "䷊"]);
  for (const v of ["Peace", "peace", "泰", "Địa Thiên Thái", "dia thien thai", "Thái", "tai", "Tài", "111000", [1, 1, 1, 0, 0, 0], [true, true, true, false, false, false], { number: 11 }]) {
    assert.equal(hexagramNumber(v as never), 11, JSON.stringify(v));
  }
  assert.equal(hexagramNumber("The Creative"), 1);
  assert.equal(hexagramNumber("Creative"), 1);
  assert.equal(hexagramNumber("Kùn"), 47);
  assert.equal(hexagramNumber([9, 8, 7, 6, 7, 8]), 63);
  for (const m of ["lu", "Lǚ", "jian", "yi"]) assert.throws(() => hexagram(m), /ambiguous/);
  assert.throws(() => hexagram(65), RangeError);
  assert.throws(() => hexagram("no such name"), RangeError);
  assert.throws(() => hexagram(1, { lang: "fr" as "en" }), TypeError);
  assert.equal(allHexagrams().length, 64);
  assert.deepEqual(allHexagrams().map((x) => x.number), Array.from({ length: 64 }, (_, i) => i + 1));
});

test("hexagram: names in three languages and three term styles", () => {
  assert.equal(hexagram(1, { lang: "vi" }).name, "Thuần Càn");
  assert.equal(hexagram(6, { lang: "zh" }).name, "讼");
  assert.equal(hexagram(1).upper.name, "Qian");
  assert.equal(hexagram(1, { terms: "han" }).upper.name, "乾");
  assert.equal(hexagram(1, { terms: "vi" }).upper.name, "Càn");
  assert.equal(hexagram(58, { lang: "zh" }).palace.name, "兑");
  assert.equal(hexagram(14).palace.generationName, "Returning soul");
  assert.equal(trigram("Thunder").number, 4);
  assert.equal(trigram([0, 0, 1]).name, "Gen");
  assert.equal(trigram("坎", { lang: "zh" }).image, "水");
  for (let n = 1; n <= 64; n++) assert.ok(!VIET.test(chu(hexagram(n))), String(n));
});

test("derived hexagrams", () => {
  assert.equal(reverse(3).number, 4);
  assert.equal(opposite(1).number, 2);
  assert.equal(mutual(1).number, 1);
  assert.equal(changed(1, [1]).number, 44);
  assert.equal(changed(1, [1, 1]).number, 44);
  assert.deepEqual(allHexagrams().filter((h) => reverse(h).number === h.number).map((h) => h.number), [1, 2, 27, 28, 29, 30, 61, 62]);
  assert.throws(() => changed(1, [7]), RangeError);
});

test("casting", () => {
  const seq = [0.1, 0.1, 0.1, ...Array(15).fill(0.9)];
  const c = castCoins({ rng: () => seq.shift() as number });
  assert.deepEqual(c.lines, [9, 6, 6, 6, 6, 6]);
  assert.deepEqual(c.moving, [1, 2, 3, 4, 5, 6]);
  const d = castCoins({ lines: [9, 8, 7, 6, 7, 8] });
  assert.deepEqual([d.primary.number, d.changed?.number], [63, 31]);
  assert.equal(castCoins({ lines: [7, 7, 7, 7, 7, 7] }).changed, null);
  assert.throws(() => castCoins({ lines: [5, 7, 7, 7, 7, 7] }), RangeError);
  assert.throws(() => castCoins({ rng: () => 1 }), RangeError);
  assert.ok(castCoins().lines.every((v) => v >= 6 && v <= 9));
  const n = castFromNumbers(2026, 11, 19);
  assert.deepEqual(n.lines, [9, 8, 7, 7, 7, 8]);
  assert.deepEqual([n.upper.name, n.lower.name, n.primary.number, n.changed?.number], ["Dui", "Li", 49, 31]);
  assert.throws(() => castFromNumbers(1.5, 1, 1), RangeError);
});

test("najia: chart, languages, date range", () => {
  const c = najia(castCoins({ lines: [9, 8, 7, 6, 7, 8] }), { date: "2026-11-19" });
  assert.deepEqual([c.day, c.month, c.void], ["Ding You", "Ji Hai", ["Chen", "Si"]]);
  assert.deepEqual(c.lines.map((l) => l.relationCode), c.raw.lines.map((l) => ({ "Phụ Mẫu": "parent", "Huynh Đệ": "sibling", "Tử Tôn": "offspring", "Thê Tài": "wealth", "Quan Quỷ": "officer" })[l.relation]));
  assert.equal(c.lines.filter((l) => l.world).length, 1);
  assert.equal(c.lines[c.world - 1].world, true);
  assert.ok(!VIET.test(chu(c)));
  const z = najia([9, 8, 7, 6, 7, 8], { date: "2026-11-19", lang: "zh" });
  assert.equal(z.day, "丁酉");
  const v = najia(63, { date: "2026-11-19", lang: "vi" });
  assert.equal(v.lines[0].relation, "Tử Tôn");
  assert.equal(v.changed, null);
  assert.deepEqual(najia(castFromNumbers(2026, 11, 19), { date: "2026-11-19" }).lines.map((l) => l.moving), [true, false, false, false, false, false]);
  assert.throws(() => najia(1, { date: "1899-12-31" }), RangeError);
  assert.throws(() => najia(1, {} as never), TypeError);
});

test("dailyHexagram: a continuous cycle through 2026", () => {
  const d = dailyHexagram("2026-11-19");
  assert.deepEqual([d.hexagram.name, d.cycleIndex, d.role, d.rulingLine], ["Biting Through", 55, "minister", 4]);
  assert.ok(!VIET.test(chu(d)));
  let truoc = dailyHexagram("2026-01-01");
  for (let t = Date.UTC(2026, 0, 2); t <= Date.UTC(2026, 11, 31); t += 86400000) {
    const s = new Date(t).toISOString().slice(0, 10);
    const x = dailyHexagram(s);
    const buoc = (x.cycleIndex - truoc.cycleIndex + 60) % 60;
    assert.ok(buoc === 0 || buoc === 1, s);
    if (x.change) assert.equal(x.change.after.number, buoc === 1 ? x.hexagram.number : dailyHexagram(new Date(t + 86400000).toISOString().slice(0, 10)).hexagram.number);
    truoc = x;
  }
  assert.throws(() => dailyHexagram("2101-01-01"), RangeError);
});

test("text: 64 judgments, 386 line statements, public domain only", () => {
  let so = 0;
  for (let n = 1; n <= 64; n++) {
    const t = text(n);
    assert.equal(t.lines.length, n <= 2 ? 7 : 6);
    so += t.lines.length;
    for (const l of t.lines) {
      assert.match(l.zh, /^(初[六九]|[六九][二三四五]|上[六九]|用[六九])[：，]/);
      assert.equal(l.label, l.zh.slice(0, 2));
      assert.ok(l.en && l.en.length > 10);
    }
    assert.ok(t.judgment.en);
  }
  assert.equal(so, 386);
  assert.equal(text("Peace").number, 11);
  assert.match(text(1).source.en, /Legge \(1882\)/);
  assert.match(text(1).source.zh, /Zhou Yi/);
});

// Bản Python phải trả đúng các khoá và giá trị này (bỏ raw).
const PY = join(dirname(fileURLToPath(import.meta.url)), "../../../../python");
const MA_PY = String.raw`
import json, sys
from nhatnguyet import iching as I
def bo(x):
    if isinstance(x, dict): return {k: bo(v) for k, v in x.items() if k != "raw"}
    if isinstance(x, list): return [bo(v) for v in x]
    return x
ra = []
for v in json.load(sys.stdin):
    f, a = v["f"], v["a"]
    if f == "hexagram": r = I.hexagram(a["x"], lang=a.get("lang"), terms=a.get("terms"))
    elif f == "trigram": r = I.trigram(a["x"], lang=a.get("lang"), terms=a.get("terms"))
    elif f == "mutual": r = I.mutual(a["x"], lang=a.get("lang"))
    elif f == "opposite": r = I.opposite(a["x"], lang=a.get("lang"))
    elif f == "reverse": r = I.reverse(a["x"], lang=a.get("lang"))
    elif f == "changed": r = I.changed(a["x"], a["moving"], lang=a.get("lang"))
    elif f == "cast": r = I.cast_coins(lines=a["lines"], lang=a.get("lang"), terms=a.get("terms"))
    elif f == "numbers": r = I.cast_from_numbers(a["a"], a["b"], a["c"], lang=a.get("lang"))
    elif f == "najia": r = I.najia(a["x"], date=a["date"], lang=a.get("lang"), terms=a.get("terms"))
    elif f == "daily": r = I.daily_hexagram(a["date"], lang=a.get("lang"), terms=a.get("terms"))
    else: r = I.text(a["x"])
    ra.append(bo(r))
sys.stdout.write(json.dumps(ra, ensure_ascii=False))
`;

test("Python returns the same keys and values", (t) => {
  try {
    execFileSync("python3", ["-c", "import sys; assert sys.version_info >= (3, 9)"], { stdio: "ignore" });
  } catch {
    t.skip("no python3");
    return;
  }
  type Viec = { f: string; a: Record<string, unknown>; ts: () => unknown };
  const viec: Viec[] = [];
  const them = (f: string, a: Record<string, unknown>, ts: () => unknown) => viec.push({ f, a, ts });
  for (const lang of ["en", "vi", "zh"] as const) {
    for (const terms of lang === "en" ? (["pinyin", "han", "vi"] as const) : ([undefined] as const)) {
      for (const x of [1, 14, 38, "Peace", "111000", [1, 0, 1, 0, 1, 0]]) them("hexagram", { x, lang, terms }, () => hexagram(x as never, { lang, terms }));
      for (const x of [1, 6, "Thunder"]) them("trigram", { x, lang, terms }, () => trigram(x, { lang, terms }));
      them("cast", { lines: [9, 8, 7, 6, 7, 8], lang, terms }, () => castCoins({ lines: [9, 8, 7, 6, 7, 8], lang, terms }));
      for (const [x, date] of [[[9, 8, 7, 6, 7, 8], "2026-11-19"], [[6, 6, 9, 9, 7, 8], "1900-01-01"], [52, "2100-12-31"], [[7, 7, 7, 8, 8, 9], "1985-01-21"]] as const) {
        them("najia", { x, date, lang, terms }, () => najia(x as never, { date, lang, terms }));
      }
      for (const date of ["2026-11-19", "2026-12-21", "2026-12-22", "1954-07-23", "1900-01-01", "2100-12-31"]) {
        them("daily", { date, lang, terms }, () => dailyHexagram(date, { lang, terms }));
      }
    }
    them("mutual", { x: 3, lang }, () => mutual(3, { lang }));
    them("opposite", { x: 3, lang }, () => opposite(3, { lang }));
    them("reverse", { x: 3, lang }, () => reverse(3, { lang }));
    them("changed", { x: 3, moving: [2, 5], lang }, () => changed(3, [2, 5], { lang }));
    them("numbers", { a: -7, b: 0, c: 13, lang }, () => castFromNumbers(-7, 0, 13, { lang }));
  }
  for (const x of [1, 2, 64]) them("text", { x }, () => text(x));
  const out = execFileSync("python3", ["-c", MA_PY], {
    input: JSON.stringify(viec.map(({ f, a }) => ({ f, a }))),
    cwd: PY,
    env: { ...process.env, PYTHONPATH: PY, PYTHONIOENCODING: "utf-8" },
    maxBuffer: 64 * 1024 * 1024,
  });
  const py = JSON.parse(out.toString("utf8")) as unknown[];
  const boRaw = (x: unknown) => JSON.parse(JSON.stringify(x, (k, v) => (k === "raw" ? undefined : v)));
  viec.forEach((v, i) => assert.deepEqual(py[i], boRaw(v.ts()), v.f + " " + JSON.stringify(v.a)));
});
