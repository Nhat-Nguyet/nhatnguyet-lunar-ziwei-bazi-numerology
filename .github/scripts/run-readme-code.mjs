#!/usr/bin/env node
// Run the code in the READMEs and compare it with the output they print.
//
//   node .github/scripts/run-readme-code.mjs [files...]
//       against the packages in this repository: js/packages/*/dist (run
//       `npm run build` in js/ first) and python/ on PYTHONPATH.
//   node .github/scripts/run-readme-code.mjs --source [files...]
//       same, but loads js/packages/*/src/*.ts (no build needed).
//   node .github/scripts/run-readme-code.mjs --published 0.3.0 [files...]
//       in a fresh temporary folder: `npm install @nhatnguyet/<pkg>@0.3.0` for
//       every package the blocks import (and @nhatnguyet/cli), a virtualenv
//       with `pip install nhatnguyet==0.3.0`, then the same checks. This is
//       what catches a README that promises an API the registry does not have.
//
// Other options: --network also runs blocks that download from Hugging Face
// (they import `datasets`); --list prints the checks without running them.
// Default files: README.md, js/packages/*/README.md, python/README.md,
// docs/api-en.md. Exit code 1 when any check fails.
//
// What is checked:
//   1. A js, ts, python or bash block followed by a ```text block (only blank
//      lines, <details>, <summary> and </details> in between): the block's
//      stdout must equal the text block. For bash, each command line is run on
//      its own and each output must equal the text block; when the text block
//      is shorter, it must be the first lines of the output (a truncated
//      display, e.g. "Below the grid it prints...").
//   2. A ```text block whose lines start with "$ ": a transcript. Each "$"
//      command is run and must print the lines below it.
//   3. In js and ts blocks, a one-line expression statement with a literal in
//      a comment (`toLunar("2027-02-06");  // {"year":2027,...}`, the literal
//      may continue on the next `//` lines): the value must deep-equal it.
//      Prose after the literal is ignored. Same in python blocks with `#`.
//   4. Python blocks written as a doctest (`>>>`): run with doctest.
//   5. Command lines (nhatnguyet, npx @nhatnguyet/cli, python -m nhatnguyet)
//      in a bash block with no output block: they must exit with status 0.
//
// HTML comment markers on the line just before a block:
//   <!-- run: skip -->         never run this block
//   <!-- run: same-output -->  this block must print what the previous
//                              checked block prints (e.g. the Python twin of
//                              a JavaScript example)
//
// No dependencies; Node 22.18+ (type stripping for ts blocks), Python 3.9+.
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const JS = join(ROOT, "js");

// ---------------------------------------------------------------- options
const argv = process.argv.slice(2);
const opts = { published: null, source: false, network: false, list: false, files: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--published") opts.published = argv[++i];
  else if (a === "--source") opts.source = true;
  else if (a === "--network") opts.network = true;
  else if (a === "--list") opts.list = true;
  else if (a.startsWith("--")) die(`unknown option ${a}`);
  else opts.files.push(a);
}
if (opts.published === "") die("--published needs a version");
if (!opts.files.length) {
  opts.files = ["README.md"];
  const pk = join(JS, "packages");
  for (const d of readdirSync(pk).sort()) if (existsSync(join(pk, d, "README.md"))) opts.files.push(`js/packages/${d}/README.md`);
  opts.files.push("python/README.md", "docs/api-en.md");
}

function die(msg) {
  console.error(msg);
  process.exit(2);
}

// ---------------------------------------------------------------- parse
const RUNNABLE = new Set(["js", "javascript", "mjs", "ts", "typescript", "python", "py", "bash", "sh", "shell", "console"]);
const lang = (info) => {
  const l = info.split(/\s+/)[0].toLowerCase();
  if (["js", "javascript", "mjs"].includes(l)) return "js";
  if (["ts", "typescript"].includes(l)) return "ts";
  if (["python", "py"].includes(l)) return "python";
  if (["bash", "sh", "shell", "console"].includes(l)) return "bash";
  return l;
};

function parseBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)(```+|~~~+)\s*([^`]*)$/);
    if (!m) continue;
    const [, ind, fence, info] = m;
    const body = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      if (lines[j].trim().startsWith(fence) && lines[j].trim().replace(/[`~]/g, "") === "") break;
      body.push(lines[j].startsWith(ind) ? lines[j].slice(ind.length) : lines[j].trimStart());
    }
    let k = i - 1;
    while (k >= 0 && lines[k].trim() === "") k--;
    const marker = k >= 0 ? (lines[k].match(/<!--\s*run:\s*([\w-]+)\s*-->/) || [])[1] : undefined;
    blocks.push({ start: i + 1, end: j + 1, info: info.trim(), lang: lang(info.trim()), body: body.join("\n"), marker });
    i = j;
  }
  // which lines lie between two blocks (to pair a block with its output)
  for (let b = 0; b + 1 < blocks.length; b++) {
    const between = lines.slice(blocks[b].end, blocks[b + 1].start - 1);
    blocks[b].gapOk = between.every((l) => /^\s*(<\/?details>|<summary>.*<\/summary>|)\s*$/.test(l));
  }
  return blocks;
}

// ---------------------------------------------------------------- literals
// A tiny parser for JavaScript literals (JSON plus single quotes, unquoted
// keys, undefined). It must consume the whole string; anything else (an
// identifier, an operator) is not a literal. eval would accept `{} <- 15`.
function parseLiteral(s) {
  let p = 0;
  const ws = () => { while (p < s.length && /\s/.test(s[p])) p++; };
  const fail = () => { throw new Error("not a literal"); };
  function str() {
    const q = s[p++];
    let out = "";
    while (p < s.length && s[p] !== q) {
      if (s[p] === "\\") {
        const e = s[++p];
        const map = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", "\\": "\\", "'": "'", '"': '"', "/": "/" };
        if (e === "u") { out += String.fromCharCode(parseInt(s.slice(p + 1, p + 5), 16)); p += 5; continue; }
        if (!(e in map)) fail();
        out += map[e]; p++; continue;
      }
      if (s[p] === "\n") fail();
      out += s[p++];
    }
    if (s[p] !== q) fail();
    p++;
    return out;
  }
  function value() {
    ws();
    const c = s[p];
    if (c === "{") {
      p++; const o = {}; ws();
      if (s[p] === "}") { p++; return o; }
      for (;;) {
        ws();
        let k;
        if (s[p] === '"' || s[p] === "'") k = str();
        else { const m = s.slice(p).match(/^[A-Za-z_$][\w$]*/); if (!m) fail(); k = m[0]; p += k.length; }
        ws(); if (s[p++] !== ":") fail();
        o[k] = value(); ws();
        if (s[p] === ",") { p++; ws(); if (s[p] === "}") { p++; return o; } continue; }
        if (s[p] === "}") { p++; return o; }
        fail();
      }
    }
    if (c === "[") {
      p++; const a = []; ws();
      if (s[p] === "]") { p++; return a; }
      for (;;) {
        ws();
        if (s.startsWith("...", p) || s.startsWith("…", p)) {
          p += s.startsWith("...", p) ? 3 : 1; ws();
          if (s[p++] !== "]") fail();
          return { $prefix: a }; // [a, b, ...]: the rest is not shown
        }
        a.push(value()); ws();
        if (s[p] === ",") { p++; ws(); if (s[p] === "]") { p++; return a; } continue; }
        if (s[p] === "]") { p++; return a; }
        fail();
      }
    }
    if (c === '"' || c === "'") return str();
    const m = s.slice(p).match(/^(-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?|true|false|null|undefined)(?![\w$])/);
    if (!m) fail();
    p += m[0].length;
    return { true: true, false: false, null: null, undefined: undefined }.hasOwnProperty(m[0])
      ? { true: true, false: false, null: null, undefined: undefined }[m[0]]
      : Number(m[0]);
  }
  const v = value();
  ws();
  if (p !== s.length) fail();
  return v;
}

// The longest prefix of a comment that is a literal, so that prose after it
// ("<- Tết", "(ten: ...)") is ignored. Returns undefined when none.
function leadingLiteral(text) {
  const t = text.trim();
  if (!/^[\[{"'\-\d]|^(true|false|null)\b/.test(t)) return undefined;
  for (let i = t.length; i > 0; i--) {
    if (i < t.length && !/\s/.test(t[i])) continue;
    if (!/[\]}"'\p{L}\p{N}]/u.test(t[i - 1])) continue;
    try {
      return { value: parseLiteral(t.slice(0, i)) };
    } catch {}
  }
  return undefined;
}

// ---------------------------------------------------------------- js blocks
// Rewrite `expr;  // literal` into an assertion. Returns { code, asserts }.
function instrumentJs(body) {
  const lines = body.split("\n");
  const parts = lines.map(splitComment); // [code, comment]
  const out = [];
  let asserts = 0;
  let prevCode = ";"; // last code text seen, to know where a statement starts
  for (let i = 0; i < lines.length; i++) {
    const [code0] = parts[i];
    const code = code0.trim();
    if (!code) { out.push(lines[i]); continue; }
    const starts = /[;{}]$/.test(prevCode) && !/^[.?:+\-*/|&,)\]}=]/.test(code)
      && !/^(const|let|var|import|export|return|if|else|for|while|await\s+import|function|class)\b/.test(code);
    // the statement runs to the first line whose code ends with ";" with brackets balanced
    let k = i;
    let joined = code;
    if (starts) {
      while (!(balanced(joined) && /;$/.test(joined)) && k + 1 < lines.length) {
        k++;
        joined += "\n" + parts[k][0];
        if (balanced(joined) && /;\s*$/.test(parts[k][0])) break;
      }
    }
    if (!starts || !balanced(joined) || !/;\s*$/.test(parts[k][0])) {
      out.push(lines[i]);
      prevCode = code;
      continue;
    }
    const trailing = parts[k][1] ?? "";
    const cont = [];
    for (let j = k + 1; j < lines.length && /^\s*\/\//.test(lines[j]); j++) cont.push(lines[j].replace(/^\s*\/\/ ?/, ""));
    const cands = [trailing, cont.join("\n"), trailing + "\n" + cont.join("\n")].filter((c) => c.trim());
    let lit;
    for (const c of cands) if ((lit = leadingLiteral(c))) break;
    if (!lit) {
      out.push(lines[i]);
      prevCode = code;
      continue;
    }
    asserts++;
    const expr = [...lines.slice(i, k), parts[k][0]].join("\n").trim().replace(/;\s*$/, "");
    const indent = lines[i].match(/^\s*/)[0];
    const exprLines = expr.split("\n");
    out.push(`${indent}__nnExpect(${i + 1}, () => (${exprLines.join("\n")}), ${JSON.stringify(lit.value) ?? "undefined"}, ${JSON.stringify(exprLines.map((l) => splitComment(l)[0].trim()).join(" "))});`);
    // keep the line count, so that error positions still point at the README
    for (let n = i + exprLines.length; n <= k; n++) out.push("");
    i = k;
    prevCode = ";";
  }
  return { code: out.join("\n"), asserts };
}

// [code, comment or undefined] of one line: the first // outside a string.
function splitComment(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if (c === "/" && line[i + 1] === "/") return [line.slice(0, i), line.slice(i + 2)];
  }
  return [line, undefined];
}

function balanced(code) {
  let d = 0;
  let q = null;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if ("([{".includes(c)) d++;
    else if (")]}".includes(c)) d--;
  }
  return d === 0 && !q;
}

const JS_PRELUDE = `
const __nnFails = [];
// actual a against README value e: a string ending in "..." and an array
// ending in ... ({ $prefix }) only fix their beginning
function __nnEq(a, e) {
  if (typeof e === "string" && typeof a === "string" && /(\.\.\.|…)$/.test(e)) return a.startsWith(e.replace(/(\.\.\.|…)$/, ""));
  if (e && typeof e === "object" && !Array.isArray(e) && Object.keys(e).length === 1 && Array.isArray(e.$prefix))
    return Array.isArray(a) && a.length >= e.$prefix.length && e.$prefix.every((x, i) => __nnEq(a[i], x));
  if (Object.is(a, e)) return true;
  if (typeof a !== typeof e || a === null || e === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(e)) return false;
  if (Array.isArray(a)) return a.length === e.length && a.every((x, i) => __nnEq(x, e[i]));
  const ka = Object.keys(a).filter((k) => a[k] !== undefined).sort();
  const ke = Object.keys(e).filter((k) => e[k] !== undefined).sort();
  return ka.length === ke.length && ka.every((k, i) => k === ke[i] && __nnEq(a[k], e[k]));
}
function __nnExpect(line, f, expected, src) { let actual; try { actual = f(); } catch (e) { __nnFails.push({ line, src, error: String(e) }); return; } const norm = actual === undefined ? undefined : JSON.parse(JSON.stringify(actual)); if (!__nnEq(norm, expected)) __nnFails.push({ line, src, expected, actual: norm }); }
process.on("exit", () => { if (__nnFails.length) { process.stderr.write("@@NN_FAILS@@" + JSON.stringify(__nnFails) + "\\n"); process.exitCode = 1; } });
`;

// ---------------------------------------------------------------- python
const PY_DRIVER = String.raw`
import ast, doctest, io, json, sys, tokenize

def leading_literal(text):
    t = text.strip()
    for i in range(len(t), 0, -1):
        if i < len(t) and not t[i].isspace():
            continue
        try:
            return (ast.literal_eval(t[:i]),)
        except Exception:
            pass
    return None

def same(a, e):
    # a string ending in "..." and a list ending in ... only fix their beginning
    if isinstance(e, str) and isinstance(a, str) and (e.endswith("...") or e.endswith("\u2026")):
        return a.startswith(e.rstrip(".\u2026"))
    if isinstance(e, list) and e and e[-1] is Ellipsis:
        return isinstance(a, list) and len(a) >= len(e) - 1 and all(same(x, y) for x, y in zip(a, e[:-1]))
    if type(a) != type(e):
        return False
    if isinstance(e, (list, tuple)):
        return len(a) == len(e) and all(same(x, y) for x, y in zip(a, e))
    if isinstance(e, dict):
        return a.keys() == e.keys() and all(same(a[k], e[k]) for k in e)
    return a == e

def main():
    mode, path = sys.argv[1], sys.argv[2]
    src = open(path, encoding="utf-8").read()
    if mode == "doctest":
        parser = doctest.DocTestParser()
        test = parser.get_doctest(src, {}, sys.argv[3], sys.argv[3], 0)
        out = io.StringIO()
        runner = doctest.DocTestRunner(verbose=False)
        runner.run(test, out=out.write)
        if runner.failures:
            sys.stderr.write("@@NN_DOCTEST@@" + out.getvalue().replace('File "%s", line ' % sys.argv[3], "line "))
            sys.exit(1)
        return
    tree = ast.parse(src)
    comments = {}
    for tok in tokenize.generate_tokens(io.StringIO(src).readline):
        if tok.type == tokenize.COMMENT:
            comments[tok.start[0]] = tok.string[1:]
    g = {"__name__": "__main__"}
    fails = []
    lines = src.split("\n")
    for st in tree.body:
        lit = None
        if isinstance(st, ast.Expr) and st.lineno == st.end_lineno and st.lineno in comments:
            lit = leading_literal(comments[st.lineno])
        if lit is None:
            exec(compile(ast.Module([st], []), path, "exec"), g)
            continue
        code = lines[st.lineno - 1].split("#")[0].strip()
        try:
            actual = eval(compile(ast.Expression(st.value), path, "eval"), g)
        except Exception as e:
            fails.append({"line": st.lineno, "src": code, "error": repr(e)})
            continue
        if not same(actual, lit[0]):
            fails.append({"line": st.lineno, "src": code, "expected": repr(lit[0]), "actual": repr(actual)})
    if fails:
        sys.stderr.write("@@NN_FAILS@@" + json.dumps(fails, ensure_ascii=False) + "\n")
        sys.exit(1)

main()
`;

// ---------------------------------------------------------------- shell
function splitShell(line) {
  const args = [];
  let cur = "";
  let q = null;
  let has = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === q) q = null;
      else if (c === "\\" && q === '"' && i + 1 < line.length) cur += line[++i];
      else cur += c;
      continue;
    }
    if (c === '"' || c === "'") { q = c; has = true; continue; }
    if (c === "#" && !has && cur === "") break;
    if (/\s/.test(c)) { if (cur || has) args.push(cur); cur = ""; has = false; continue; }
    if (c === "\\" && i + 1 < line.length) { cur += line[++i]; has = true; continue; }
    cur += c;
    has = true;
  }
  if (cur || has) args.push(cur);
  return args;
}

// A command line as [program, args] if it is one of the CLIs we can run.
function cliCommand(argsIn) {
  let args = argsIn[0] === "$" ? argsIn.slice(1) : argsIn;
  if (args[0] === "npx") {
    args = args.slice(1).filter((a) => a !== "-y" && a !== "--yes");
    if (!/^@nhatnguyet\/cli(@[\w.-]+)?$/.test(args[0] ?? "")) return null;
    return { kind: "js", args: args.slice(1) };
  }
  if (args[0] === "nhatnguyet") return { kind: "js", args: args.slice(1) };
  if (/^python3?$/.test(args[0] ?? "") && args[1] === "-m" && args[2] === "nhatnguyet") return { kind: "py", args: args.slice(3) };
  return null;
}

// ---------------------------------------------------------------- environment
let env; // { node: [cmd...], js: dir, py: python, cliJs: [...], cliPy: [...], cleanup }

function sh(cmd, args, o = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 << 20, ...o });
  if (r.error) throw r.error;
  return r;
}

function retry(what, fn) {
  for (let i = 1; ; i++) {
    const r = fn();
    if (r.status === 0) return r;
    if (i === 5) die(`${what} failed:\n${r.stdout}\n${r.stderr}`);
    console.error(`${what} failed (attempt ${i}), retrying in 30 s`);
    spawnSync("sleep", ["30"]);
  }
}

function setup(checks) {
  const baseEnv = { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0", PYTHONIOENCODING: "utf-8", PYTHONDONTWRITEBYTECODE: "1" };
  delete baseEnv.COLUMNS;
  if (!opts.published) {
    const dir = mkdtempSync(join(JS, ".readme-run-"));
    const cond = opts.source ? ["--conditions=source"] : [];
    if (!opts.source && !existsSync(join(JS, "packages/cli/dist/cli.js"))) die("js/packages/*/dist missing: run `npm run build` in js/ first, or pass --source");
    const cli = opts.source ? join(JS, "packages/cli/src/cli.ts") : join(JS, "packages/cli/dist/cli.js");
    const py = process.env.PYTHON || "python3";
    env = {
      dir, node: ["node", ...cond], py,
      cliJs: ["node", ...cond, cli], cliPy: [py, "-m", "nhatnguyet"],
      env: { ...baseEnv, PYTHONPATH: join(ROOT, "python") },
      cleanup: () => rmSync(dir, { recursive: true, force: true }),
    };
    return;
  }
  const v = opts.published;
  const dir = mkdtempSync(join(tmpdir(), "nn-published-"));
  const pkgs = new Set(["@nhatnguyet/cli"]);
  for (const c of checks) if (c.lang === "js" || c.lang === "ts") for (const m of c.code.matchAll(/from\s+["'](@nhatnguyet\/[\w-]+)/g)) pkgs.add(m[1]);
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "readme-check", private: true, type: "module" }));
  const spec = [...pkgs].sort().map((p) => `${p}@${v}`);
  console.log(`npm install ${spec.join(" ")}`);
  retry("npm install", () => sh("npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts", ...spec], { cwd: dir }));
  sh("python3", ["-m", "venv", join(dir, "venv")]);
  const py = join(dir, "venv", "bin", "python");
  const pipPkgs = [`nhatnguyet==${v}`];
  if (opts.network) pipPkgs.push("datasets", "zstandard");
  console.log(`pip install ${pipPkgs.join(" ")}`);
  retry("pip install", () => sh(py, ["-m", "pip", "install", "--quiet", "--no-cache-dir", ...pipPkgs]));
  env = {
    dir, node: ["node"], py,
    cliJs: [join(dir, "node_modules", ".bin", "nhatnguyet")], cliPy: [py, "-m", "nhatnguyet"],
    env: baseEnv,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

// ---------------------------------------------------------------- checks
function collect() {
  const checks = [];
  for (const file of opts.files) {
    const path = join(ROOT, file);
    if (!existsSync(path)) die(`no such file: ${file}`);
    const blocks = parseBlocks(readFileSync(path, "utf8"));
    let lastExpected = null;
    for (let b = 0; b < blocks.length; b++) {
      const blk = blocks[b];
      const next = blocks[b + 1];
      const where = `${file}:${blk.start}`;
      if (blk.marker === "skip") continue;
      if (blk.lang === "text" && /^\$ /.test(blk.body)) {
        checks.push({ where, kind: "transcript", lang: "bash", code: blk.body });
        continue;
      }
      if (!RUNNABLE.has(blk.info.split(/\s+/)[0].toLowerCase())) continue;
      let expected = null;
      if (next && next.lang === "text" && blk.gapOk && !/^\$ /.test(next.body)) expected = next.body;
      if (expected === null && blk.marker === "same-output") expected = lastExpected;
      if (expected !== null) lastExpected = expected;
      const net = /^\s*(from|import)\s+(datasets|huggingface_hub)\b/m.test(blk.body);
      if (net && !opts.network) {
        checks.push({ where, kind: "skipped (needs --network)", lang: blk.lang, code: blk.body, skip: true });
        continue;
      }
      if (blk.lang === "js" || blk.lang === "ts") {
        const ins = instrumentJs(blk.body);
        if (expected === null && ins.asserts === 0) continue;
        checks.push({ where, kind: expected !== null ? `output${ins.asserts ? ` + ${ins.asserts} values` : ""}` : `${ins.asserts} values`, lang: blk.lang, code: blk.body, run: ins.code, expected });
      } else if (blk.lang === "python") {
        if (/^\s*>>> /m.test(blk.body)) {
          // doctest blocks of one file share their names, like a doctest file:
          // they run together, each at its own line number in the README
          const prev = checks.find((c) => c.doctest && c.file === file);
          const padded = (prev ? prev.code : "") + "\n".repeat(Math.max(0, blk.start - (prev ? prev.code.split("\n").length : 0))) + blk.body + "\n";
          if (prev) { prev.code = padded; prev.blocks++; prev.kind = `doctest, ${prev.blocks} blocks`; }
          else checks.push({ where, file, kind: "doctest", lang: "python", code: padded, doctest: true, blocks: 1 });
        }
        else {
          const annotated = /^[^#\n]*\S[^#\n]*#\s*[\[{('"\-\d]/m.test(blk.body);
          if (expected === null && !annotated) continue;
          checks.push({ where, kind: expected !== null ? "output" : "values", lang: "python", code: blk.body, expected });
        }
      } else if (blk.lang === "bash") {
        const cmds = blk.body.split("\n").map((l) => cliCommand(splitShell(l))).filter(Boolean);
        if (!cmds.length) continue;
        checks.push({ where, kind: expected !== null ? "output" : "exit status", lang: "bash", code: blk.body, cmds, expected });
      }
    }
  }
  return checks;
}

const clean = (s) => s.replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");

function compareOutput(actual, expected) {
  const a = clean(actual);
  const e = clean(expected);
  if (a === e) return null;
  const al = a.split("\n");
  const el = e.split("\n");
  if (/^\s*(\.\.\.|…)\s*$/.test(el.at(-1))) el.pop(); // "..." marks a cut display
  if (el.length < al.length && el.every((l, i) => l === al[i])) return null; // truncated display
  const i = el.findIndex((l, k) => l !== al[k]);
  const at = i < 0 ? el.length : i;
  return `first difference at output line ${at + 1}\n    README: ${JSON.stringify(el[at] ?? "<end>")}\n    actual: ${JSON.stringify(al[at] ?? "<end>")}`;
}

function runCli(cmd) {
  const base = cmd.kind === "js" ? env.cliJs : env.cliPy;
  return sh(base[0], [...base.slice(1), ...cmd.args], { cwd: env.dir, env: env.env });
}

const cut = (v) => { const t = typeof v === "string" ? v : JSON.stringify(v); return t.length > 400 ? t.slice(0, 400) + "..." : t; };

function failsFrom(stderr) {
  const m = stderr.match(/@@NN_FAILS@@(.*)/);
  if (!m) return null;
  return JSON.parse(m[1]).map((f) => `line ${f.line}: ${f.src}\n    ${f.error ? `threw ${f.error}` : `README: ${cut(f.expected)}\n    actual: ${cut(f.actual)}`}`).join("\n  ");
}

function runCheck(c, n) {
  if (c.lang === "js" || c.lang === "ts") {
    const file = join(env.dir, `block-${n}.${c.lang === "ts" ? "mts" : "mjs"}`);
    writeFileSync(file, JS_PRELUDE + c.run);
    const r = sh(env.node[0], [...env.node.slice(1), file], { cwd: env.dir, env: env.env });
    const errs = [];
    const f = failsFrom(r.stderr);
    if (f) errs.push(f);
    else if (r.status !== 0) errs.push(`exit ${r.status}\n${r.stderr.trim().split("\n").slice(0, 15).join("\n")}`);
    if (c.expected !== null && r.status === 0) {
      const d = compareOutput(r.stdout, c.expected);
      if (d) errs.push(d);
    }
    return errs;
  }
  if (c.lang === "python") {
    const file = join(env.dir, `block-${n}.py`);
    const driver = join(env.dir, "nn_driver.py");
    writeFileSync(file, c.code);
    writeFileSync(driver, PY_DRIVER);
    const r = sh(env.py, [driver, c.doctest ? "doctest" : "run", file, c.file ?? c.where], { cwd: env.dir, env: env.env });
    const errs = [];
    const f = failsFrom(r.stderr);
    if (f) errs.push(f);
    else if (r.stderr.includes("@@NN_DOCTEST@@")) errs.push(r.stderr.split("@@NN_DOCTEST@@")[1].trim().split("\n").slice(0, 40).join("\n"));
    else if (r.status !== 0) errs.push(`exit ${r.status}\n${r.stderr.trim().split("\n").slice(-15).join("\n")}`);
    if (c.expected != null && r.status === 0) {
      const d = compareOutput(r.stdout, c.expected);
      if (d) errs.push(d);
    }
    return errs;
  }
  if (c.kind === "transcript") {
    const errs = [];
    const parts = c.code.split(/^(?=\$ )/m);
    for (const part of parts) {
      const [first, ...rest] = part.split("\n");
      const cmd = cliCommand(splitShell(first));
      if (!cmd) continue;
      const r = runCli(cmd);
      if (r.status !== 0) errs.push(`${first}\n    exit ${r.status}: ${r.stderr.trim().split("\n")[0]}`);
      else {
        const d = compareOutput(r.stdout, rest.join("\n"));
        if (d) errs.push(`${first}\n    ${d}`);
      }
    }
    return errs;
  }
  const errs = [];
  for (const cmd of c.cmds) {
    const r = runCli(cmd);
    const label = `${cmd.kind === "js" ? "nhatnguyet (npm)" : "python -m nhatnguyet"} ${cmd.args.join(" ")}`;
    if (r.status !== 0) {
      errs.push(`${label}\n    exit ${r.status}: ${r.stderr.trim().split("\n")[0]}`);
      continue;
    }
    if (c.expected !== null) {
      const d = compareOutput(r.stdout, c.expected);
      if (d) errs.push(`${label}\n    ${d}`);
    }
  }
  return errs;
}

// ---------------------------------------------------------------- main
const checks = collect();
if (opts.list) {
  for (const c of checks) console.log(`${c.where}  ${c.lang}  ${c.kind}`);
  process.exit(0);
}
setup(checks);
let failed = 0;
let ran = 0;
try {
  checks.forEach((c, n) => {
    if (c.skip) {
      console.log(`skip ${c.where} (${c.kind})`);
      return;
    }
    ran++;
    const errs = runCheck(c, n);
    if (!errs.length) console.log(`ok   ${c.where} (${c.lang}, ${c.kind})`);
    else {
      failed++;
      console.log(`FAIL ${c.where} (${c.lang}, ${c.kind})\n  ${errs.join("\n  ")}`);
    }
  });
} finally {
  env.cleanup();
}
const mode = opts.published ? `published ${opts.published}` : opts.source ? "local sources" : "local build";
console.log(`\n${ran - failed}/${ran} README checks passed (${mode})`);
process.exit(failed ? 1 : 0);
