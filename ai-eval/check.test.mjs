// Checks of the AI evaluation set:
// 1. questions.jsonl equals a fresh run of generate.mjs (the answers follow the engine).
// 2. Shape: ids unique, three languages, hard cases explained, 1,000 to 2,000 items.
// 3. score.py scores the reference answers 100% in vi, en and zh (--self-test).
//
//   cd thu-vien-mo && node --conditions=source --test ai-eval/check.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildSet, toJsonl, updateReadme, OUT_FILE } from "./generate.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { rows, stats } = buildSet();

test("questions.jsonl matches a fresh generation", () => {
  const old = readFileSync(path.join(HERE, OUT_FILE), "utf8");
  assert.equal(old, toJsonl(rows), "questions.jsonl is out of date: run node --conditions=source ai-eval/generate.mjs");
  const readme = readFileSync(path.join(HERE, "README.md"), "utf8");
  assert.equal(readme, updateReadme(readme, rows), "README.md task table is out of date: run the generator");
});

test("the hard cases match the published comparison", () => {
  assert.equal(stats.vnCnDays, 2724);
  assert.deepEqual(stats.tetYears, [1903, 1935, 1965, 1968, 1969, 1985, 2007, 2030, 2053]);
});

test("every item is well formed", () => {
  assert.ok(rows.length >= 1000 && rows.length <= 2000, `${rows.length} items`);
  const ids = new Set();
  for (const r of rows) {
    assert.ok(!ids.has(r.id), r.id);
    ids.add(r.id);
    for (const k of ["question_en", "question_vi", "question_zh", "answer_text", "tool"]) assert.ok(r[k], `${r.id}: ${k}`);
    assert.ok(["easy", "hard"].includes(r.difficulty), r.id);
    assert.equal(r.difficulty === "hard", Boolean(r.hard_case_reason), `${r.id}: a hard item needs a reason, an easy one has none`);
    assert.doesNotMatch(JSON.stringify(r), /\u2014/, r.id);
  }
  const hard = rows.filter((r) => r.difficulty === "hard").length;
  assert.ok(hard >= rows.length / 4, `only ${hard} hard items`);
});

test("score.py gives the reference answers 100%", (t) => {
  const r = spawnSync("python3", [path.join(HERE, "score.py"), "--self-test"], { encoding: "utf8" });
  if (r.error && r.error.code === "ENOENT") return t.skip("python3 not installed");
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
