#!/usr/bin/env node
// Check that the seven READMEs stay in sync with README.md (English, the
// reference). For every translation it compares:
//   - headings: same number and same levels, in the same order;
//   - code blocks: same number, same info string, and byte-identical content
//     (after removing the common indentation), except the blocks listed in
//     ALLOWED below, which may differ on purpose;
//   - Markdown tables: same number of tables and same number of rows in each;
//   - images (<img> and ![]()): same number, and the same files once the
//     language suffix of a chart (-vi, -zh) is removed;
//   - external links: the same set of URLs once the language branch of
//     nhatnguyet.org (/en, /zh) and a ?lang= parameter are removed, and once
//     the label of an img.shields.io badge and the thousands separator of
//     its number are removed (both are translated).
//
// It also checks the counts that drift when the data changes. They are read
// from the source files (du-lieu/terminology/terminology.json,
// ai-eval/questions.jsonl, ca-kiem/*.json, du-lieu/le-hoi-viet-nam.json and the
// festival test vectors); README.md must state them in the sentences listed in
// FACTS below, and every translation must carry each of these numbers as many
// times as README.md does (thousands separators ignored: 17,291 = 17.291 =
// 17 291).
//
// Usage: node cong-cu/kiem-readme.mjs [repo folder]   (exit 1 on any mismatch)
// No dependencies; Node 18+.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const REFERENCE = "README.md";
const TRANSLATIONS = ["README.vi.md", "README.zh.md", "README.ja.md", "README.ko.md", "README.fr.md", "README.th.md"];

// Code blocks that may differ from the English one at the same position.
// Key: "<file>#<block number, 1-based>". Value: why. Keep this list short:
// a code block that prints the same thing in every language must be identical.
const ALLOWED = {};

function parse(text) {
  const lines = text.split("\n");
  const out = { headings: [], code: [], tables: [], images: [], urls: [] };
  let inCode = false;
  let fence = "";
  let indent = 0;
  let info = "";
  let buf = [];
  let tableRows = 0;
  const prose = [];
  const closeTable = () => {
    if (tableRows) out.tables.push(tableRows);
    tableRows = 0;
  };
  for (const line of lines) {
    const f = line.match(/^(\s*)(`{3,})(.*)$/);
    if (inCode) {
      if (f && f[2].length >= fence.length && f[3].trim() === "") {
        out.code.push({ info, body: buf.map((l) => l.slice(Math.min(indent, l.length - l.trimStart().length))).join("\n") });
        inCode = false;
        buf = [];
      } else {
        buf.push(line);
      }
      continue;
    }
    if (f) {
      closeTable();
      inCode = true;
      fence = f[2];
      indent = f[1].length;
      info = f[3].trim();
      continue;
    }
    prose.push(line);
    const h = line.match(/^(#{1,6})\s/);
    if (h) out.headings.push(h[1].length);
    if (/^\s*<h([1-6])[\s>]/.test(line)) out.headings.push(Number(line.match(/<h([1-6])/)[1]));
    if (/^\s*\|/.test(line)) tableRows++;
    else closeTable();
  }
  closeTable();
  if (inCode) throw new Error("unclosed code block");
  const p = prose.join("\n");
  for (const m of p.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) out.images.push(m[1]);
  for (const m of p.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) out.images.push(m[1]);
  for (const m of p.matchAll(/https?:\/\/[^\s"'<>)\]]+/g)) out.urls.push(m[0].replace(/[.,;:]+$/, ""));
  return out;
}

const normImage = (src) =>
  src.startsWith("http")
    ? normUrl(src)
    : src.replace(/(\/(?:la-so-tu-vi|la-so-bat-tu|than-so-hoc))-(?:vi|zh)(?=(?:-toi)?\.svg$)/, "$1");

function normUrl(u) {
  return u
    .replace(/^(https:\/\/nhatnguyet\.org)\/(en|zh)(?=\/|$)/, "$1")
    .replace(/([?&])lang=[a-z]{2}(&|$)/, (_, a, b) => (b ? a : ""))
    .replace(/[?&]$/, "")
    .replace(/^(https:\/\/img\.shields\.io\/badge\/)(?:[^-]|--)+-/, "$1<label>-")
    .replace(/(\d)(?:%2C|%20|[.,])(?=\d{3}\b)/g, "$1");
}

const read = (f) => readFileSync(join(ROOT, f), "utf8");

// ---------------------------------------------------------------- counts
const fmt = (n) => n.toLocaleString("en-US");
function sourceCounts() {
  const json = (f) => JSON.parse(read(f));
  const terms = json("du-lieu/terminology/terminology.json");
  const questions = read("ai-eval/questions.jsonl").trim().split("\n").map((l) => JSON.parse(l));
  const hard = questions.filter((q) => q.difficulty === "hard").length;
  const ca = (name) => json(`ca-kiem/${name}.json`).ca;
  const n = (name) => ca(name).length;
  const core = ["am-lich", "tu-vi", "bat-tu", "than-so-hoc", "le-hoi"].reduce((a, k) => a + n(k), 0);
  const schools = n("tu-vi-phai") + n("bat-tu-phai");
  const hours = n("auspicious-hours");
  const fest = json("du-lieu/le-hoi-viet-nam.json");
  const dated = new Set();
  for (const c of ca("le-hoi")) for (const r of c.ra ?? []) if (r.ngay) dated.add(r.id);
  return {
    terms: terms.terms.length,
    questions: questions.length,
    hard,
    hardPct: Math.round((100 * hard) / questions.length),
    calendar: n("am-lich"),
    ziwei: n("tu-vi"),
    bazi: n("bat-tu"),
    numerology: n("than-so-hoc"),
    festivalYears: n("le-hoi"),
    core,
    schools,
    hours,
    all: core + schools + hours,
    festivals: fest.length,
    fixed: dated.size,
    other: fest.length - dated.size,
  };
}
const C = sourceCounts();
if (C.terms !== JSON.parse(read("du-lieu/terminology/terminology.json")).count) {
  console.log("du-lieu/terminology/terminology.json: count field disagrees with the number of terms");
  process.exit(1);
}
// [what, regex on README.md (whitespace-tolerant), expected values of its groups]
const FACTS = [
  ["terminology", /\| (\S+) terms in Vietnamese/, [C.terms]],
  ["AI evaluation questions", /\| (\S+) computed questions in English/, [C.questions]],
  ["AI evaluation hard cases", /(\S+) of them \((\d+)%\) hard cases/, [C.hard, `${C.hardPct}`]],
  ["test vectors, intro", /(\S+) shared test vectors\s*\n/, [C.core]],
  ["test vectors, badge", /test%20vectors-(\d+)%2C(\d+)-/, [String(C.core).slice(0, -3), String(C.core).slice(-3)]],
  ["test vectors, core", /holds \*\*(\S+) core cases\*\*/, [C.core]],
  ["test vectors, by suite", /: (\S+) calendar cases, (\S+) Zi\s+Wei charts, (\S+) BaZi charts, (\S+) numerology profiles and (\S+) festival years,\s+plus (\S+) cases for the school options and (\S+) days of auspicious hours\s+\((\S+) in all\)/,
    [C.calendar, C.ziwei, C.bazi, C.numerology, C.festivalYears, C.schools, C.hours, C.all]],
  ["test vectors, port challenge", /pass all (\S+) test vectors/, [C.core]],
  ["festivals, install table", /\| (\S+) Vietnamese festivals with their dates/, [C.festivals]],
  ["festivals, fixed dates", /gives the (\S+) festivals with a\s+fixed lunar or Gregorian date for any year from 1900 to 2100, out of (\S+) in\s+the dataset \(the other (\S+) are dated/,
    [C.fixed, C.festivals, C.other]],
  ["festivals, open datasets", /78 Tarot cards, (\S+) festivals/, [C.festivals]],
];
const TRACKED = new Set(Object.values(C).map(String));
// Numbers in a text, thousands separators removed; returns a count per tracked number.
function trackedNumbers(text) {
  const out = new Map();
  const flat = text.replace(/(\d)(?:[.,\u00a0\u202f ]|%2C)(?=\d{3}(?!\d))/g, "$1");
  // a number right after "3," or "10." is the decimal part of another number
  for (const m of flat.matchAll(/(?<!\d[.,])(?<!\d)\d+(?!\d)/g)) if (TRACKED.has(m[0])) out.set(m[0], (out.get(m[0]) ?? 0) + 1);
  return out;
}

const ref = parse(read(REFERENCE));
const refUrls = new Set(ref.urls.map(normUrl));
const refImages = ref.images.map(normImage);
let errors = 0;
const fail = (file, msg) => {
  errors++;
  console.log(`${file}: ${msg}`);
};

const refText = read(REFERENCE);
for (const [what, re, want] of FACTS) {
  const m = refText.match(re);
  if (!m) {
    fail(REFERENCE, `${what}: sentence not found (${re})`);
    continue;
  }
  const got = m.slice(1).map((g) => g.replace(/,/g, ""));
  const exp = want.map((w) => String(w).replace(/,/g, ""));
  if (got.join("|") !== exp.join("|"))
    fail(REFERENCE, `${what}: "${m[0].replace(/\s+/g, " ")}" but the source files give ${exp.map((x) => (/^\d{4,}$/.test(x) ? fmt(Number(x)) : x)).join(", ")}`);
}
const refNumbers = trackedNumbers(refText);

for (const file of TRANSLATIONS) {
  if (!existsSync(join(ROOT, file))) {
    fail(file, "missing");
    continue;
  }
  const t = parse(read(file));
  if (t.headings.join(",") !== ref.headings.join(","))
    fail(file, `headings ${t.headings.length} (${t.headings.join("")}) vs ${ref.headings.length} (${ref.headings.join("")})`);
  if (t.code.length !== ref.code.length) fail(file, `code blocks ${t.code.length} vs ${ref.code.length}`);
  for (let i = 0; i < Math.min(t.code.length, ref.code.length); i++) {
    const key = `${file}#${i + 1}`;
    if (t.code[i].info !== ref.code[i].info) fail(file, `code block ${i + 1}: info "${t.code[i].info}" vs "${ref.code[i].info}"`);
    else if (t.code[i].body !== ref.code[i].body && !ALLOWED[key]) {
      const a = ref.code[i].body.split("\n");
      const b = t.code[i].body.split("\n");
      const n = a.findIndex((l, j) => l !== b[j]);
      fail(file, `code block ${i + 1} (${ref.code[i].info}) differs at line ${n + 1}:\n    en: ${a[n] ?? "<end>"}\n    ${file.slice(7, 9)}: ${b[n] ?? "<end>"}`);
    }
  }
  if (t.tables.join(",") !== ref.tables.join(","))
    fail(file, `table rows [${t.tables.join(",")}] vs [${ref.tables.join(",")}]`);
  const imgs = t.images.map(normImage);
  if (imgs.join("|") !== refImages.join("|")) {
    fail(file, `images ${imgs.length} vs ${refImages.length}`);
    for (let i = 0; i < Math.max(imgs.length, refImages.length); i++)
      if (imgs[i] !== refImages[i]) console.log(`    #${i + 1}: ${imgs[i]} vs ${refImages[i]}`);
  }
  const urls = new Set(t.urls.map(normUrl));
  for (const u of refUrls) if (!urls.has(u)) fail(file, `missing link ${u}`);
  for (const u of urls) if (!refUrls.has(u)) fail(file, `extra link ${u}`);
  const nums = trackedNumbers(read(file));
  for (const k of new Set([...refNumbers.keys(), ...nums.keys()]))
    if ((nums.get(k) ?? 0) !== (refNumbers.get(k) ?? 0))
      fail(file, `the number ${fmt(Number(k))} appears ${nums.get(k) ?? 0} time(s), ${refNumbers.get(k) ?? 0} in ${REFERENCE}`);
}
for (const key of Object.keys(ALLOWED)) {
  const [file] = key.split("#");
  if (!TRANSLATIONS.includes(file)) fail(key, "ALLOWED entry for an unknown file");
}

const summary = `counts ${FACTS.length} checked against the source files, headings ${ref.headings.length}, code blocks ${ref.code.length}, tables ${ref.tables.length} (${ref.tables.reduce((a, b) => a + b, 0)} rows), images ${ref.images.length}, external links ${refUrls.size}`;
if (errors) {
  console.log(`\n${errors} mismatch(es) against ${REFERENCE} (${summary}).`);
  process.exit(1);
}
console.log(`7 READMEs in sync: ${summary}.`);
