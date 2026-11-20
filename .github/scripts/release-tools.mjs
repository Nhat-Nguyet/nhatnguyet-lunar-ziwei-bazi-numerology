#!/usr/bin/env node
// Release helpers. One version number is shared by every npm package and the
// Python package.
//
//   node .github/scripts/release-tools.mjs check [version]
//       every place that carries the version agrees (with `version`, or with
//       js/packages/am-lich/package.json); internal dependencies are "^version";
//       CHANGELOG.md has a section for it; the test vector counts quoted in the
//       docs and metadata match ca-kiem/; CITATION.cff cites the paper's
//       current version; SECURITY.md supports the current minor version.
//       Exit 1 on any mismatch.
//   node .github/scripts/release-tools.mjs set <version>
//       write <version> into all of those places (does not touch CHANGELOG.md).
//   node .github/scripts/release-tools.mjs notes <version>
//       print the release notes: the CHANGELOG.md section of <version> plus
//       install lines and links. Exit 1 when the section is missing or empty.
//   node .github/scripts/release-tools.mjs order
//       print the npm packages in publish order (dependencies first).
//
// No dependencies; Node 18+.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPO = "https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology";
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const write = (p, s) => writeFileSync(join(ROOT, p), s);

function packages() {
  const dir = join(ROOT, "js", "packages");
  return readdirSync(dir)
    .filter((d) => existsSync(join(dir, d, "package.json")))
    .map((d) => ({ dir: `js/packages/${d}`, json: JSON.parse(read(`js/packages/${d}/package.json`)) }))
    .filter((p) => !p.json.private);
}

// Topological order: a package comes after the @nhatnguyet packages it needs.
function publishOrder() {
  const pk = packages();
  const byName = new Map(pk.map((p) => [p.json.name, p]));
  const done = new Set();
  const out = [];
  const visit = (p) => {
    if (done.has(p.json.name)) return;
    done.add(p.json.name);
    for (const d of Object.keys(p.json.dependencies ?? {})) if (byName.has(d)) visit(byName.get(d));
    out.push(p);
  };
  // Vietnamese-named packages first, the English-named aliases last
  const alias = (p) => (p.json.description ?? "").includes("alias of");
  for (const p of [...pk.filter((p) => !alias(p)), ...pk.filter(alias)].sort((a, b) => alias(a) - alias(b) || a.json.name.localeCompare(b.json.name))) visit(p);
  return out;
}

// Places other than package.json files: [file, regex with one group for the version]
const OTHER = [
  ["python/pyproject.toml", /^version = "([^"]+)"/m],
  ["python/nhatnguyet/__init__.py", /^__version__ = "([^"]+)"/m],
  ["js/packages/cli/src/cli.ts", /^export const VERSION = "([^"]+)"/m],
  ["js/packages/mcp/src/server.ts", /^export const VERSION = "([^"]+)"/m],
  ["CITATION.cff", /^version: "([^"]+)"/m],
  [".zenodo.json", /^  "version": "([^"]+)"/m],
];

function changelogSection(version) {
  const text = read("CHANGELOG.md");
  const esc = version.replace(/\./g, "\\.");
  const m = text.match(new RegExp(`^## \\[${esc}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|^\\[[^\\]]+\\]: )`, "m"));
  return m ? m[1].trim() : null;
}

// Test vector counts. "Core" is the five suites the README and the port
// challenge count (calendar, Zi Wei, BaZi, numerology, festivals); "all" adds
// the school options, the auspicious hours, the I Ching and feng shui.
// Every file below must say "<core> core test vectors" (or shared, or test
// cases) and, where it gives the total, "<all> including school options,
// auspicious hours, I Ching and feng shui" or "<all> in all". The paper is a
// dated report: only its core count is checked, its total stays as printed.
const VECTOR_FILES = [
  "README.md",
  "CONTRIBUTING.md",
  "CITATION.cff",
  ".zenodo.json",
  "CHANGELOG.md",
  "docs/paper/paper.md",
  "ca-kiem/README.md",
  "js/packages/cli/README.md",
  "js/packages/mcp/README.md",
  "python/README.md",
];
const CORE_SUITES = ["am-lich", "tu-vi", "bat-tu", "than-so-hoc", "le-hoi"];
const FROZEN_TOTAL = new Set(["docs/paper/paper.md"]);
const ALL_PHRASE = "including school options, auspicious hours, I Ching and feng shui";

function vectorCounts() {
  let core = 0;
  let all = 0;
  for (const f of readdirSync(join(ROOT, "ca-kiem")).filter((f) => f.endsWith(".json"))) {
    const n = JSON.parse(read(`ca-kiem/${f}`)).ca.length;
    all += n;
    if (CORE_SUITES.includes(f.slice(0, -5))) core += n;
  }
  return { core, all };
}

function checkDocs(version, errors) {
  const { core, all } = vectorCounts();
  const fmt = (n) => n.toLocaleString("en-US");
  for (const file of VECTOR_FILES) {
    let text = read(file).replace(/<\/?[a-z][^<>]*>/g, " ").replace(/\s+/g, " ");
    // the CHANGELOG is history: only the section of this version counts
    if (file === "CHANGELOG.md") text = (changelogSection(version) ?? "").replace(/\s+/g, " ");
    const num = (s) => Number(s.replace(/,/g, ""));
    let coreSeen = 0;
    for (const m of text.matchAll(/(\d{1,3}(?:,\d{3})+) (?:core |shared )?test (?:vectors?|cases?)\b/g)) {
      coreSeen++;
      if (num(m[1]) !== core) errors.push(`${file}: "${m[0]}", ca-kiem/ has ${fmt(core)} core test vectors`);
    }
    if (!coreSeen) errors.push(`${file}: no "${fmt(core)} core test vectors"`);
    if (FROZEN_TOTAL.has(file)) continue;
    for (const m of text.matchAll(/(\d{1,3}(?:,\d{3})+) (?:including school options[\w ,]*|in all\b)/g))
      if (num(m[1]) !== all || (m[0].startsWith(m[1] + " including") && !m[0].startsWith(`${m[1]} ${ALL_PHRASE}`)))
        errors.push(`${file}: "${m[0]}", ca-kiem/ has ${fmt(all)} test vectors in all ("${fmt(all)} ${ALL_PHRASE}")`);
    if (text.includes(fmt(all)) && !new RegExp(`${fmt(all)} (?:${ALL_PHRASE}|in all)`).test(text))
      errors.push(`${file}: ${fmt(all)} must read "${fmt(all)} ${ALL_PHRASE}" (the core count is ${fmt(core)})`);
  }
  const paperVersion = read("docs/paper/paper.md").match(/^date: "Version (\d+)/m)?.[1];
  const citedVersion = read("CITATION.cff").match(/Technical report of the project, version (\d+)/)?.[1];
  if (!paperVersion || paperVersion !== citedVersion)
    errors.push(`CITATION.cff: cites the paper as version ${citedVersion ?? "?"}, docs/paper/paper.md is version ${paperVersion ?? "?"}`);
  const minor = version.split(".").slice(0, 2).join(".");
  if (!new RegExp(`^\\| ${minor.replace(".", "\\.")}\\.x \\| Yes \\|`, "m").test(read("SECURITY.md")))
    errors.push(`SECURITY.md: the supported versions table has no "| ${minor}.x | Yes |" row`);
}

function check(version) {
  const errors = [];
  const pk = packages();
  const v = version ?? pk.find((p) => p.json.name === "@nhatnguyet/am-lich").json.version;
  if (!SEMVER.test(v)) errors.push(`not a semantic version: ${v}`);
  for (const p of pk) {
    if (p.json.version !== v) errors.push(`${p.dir}/package.json: version ${p.json.version}, expected ${v}`);
    for (const [d, range] of Object.entries(p.json.dependencies ?? {})) {
      if (d.startsWith("@nhatnguyet/") && range !== `^${v}`) errors.push(`${p.dir}/package.json: dependency ${d} "${range}", expected "^${v}"`);
    }
    if (p.json.publishConfig?.access !== "public") errors.push(`${p.dir}/package.json: publishConfig.access must be "public"`);
    if (!p.json.repository?.url?.includes("Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology")) errors.push(`${p.dir}/package.json: repository.url must point to ${REPO} (npm provenance checks it)`);
  }
  for (const [file, re] of OTHER) {
    const m = read(file).match(re);
    if (!m) errors.push(`${file}: version not found`);
    else if (m[1] !== v) errors.push(`${file}: version ${m[1]}, expected ${v}`);
  }
  checkDocs(v, errors);
  const notes = changelogSection(v);
  if (!notes) errors.push(`CHANGELOG.md: no section "## [${v}] - YYYY-MM-DD" with content`);
  else if (!new RegExp(`^## \\[${v.replace(/\./g, "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}`, "m").test(read("CHANGELOG.md"))) errors.push(`CHANGELOG.md: the [${v}] heading needs a release date`);
  if (errors.length) {
    console.error(errors.map((e) => `- ${e}`).join("\n"));
    console.error(`\n${errors.length} problem(s) for version ${v}`);
    process.exit(1);
  }
  console.log(`version ${v}: ${pk.length} npm packages, Python package, metadata and test vector counts agree`);
}

function set(v) {
  if (!SEMVER.test(v ?? "")) {
    console.error("usage: release-tools.mjs set <x.y.z>");
    process.exit(2);
  }
  for (const p of packages()) {
    const file = `${p.dir}/package.json`;
    let s = read(file);
    s = s.replace(/^  "version": "[^"]+"/m, `  "version": "${v}"`);
    s = s.replace(/("@nhatnguyet\/[\w-]+": )"[^"]*"/g, `$1"^${v}"`);
    write(file, s);
  }
  for (const [file, re] of OTHER) {
    const s = read(file);
    const m = s.match(re);
    if (!m) throw new Error(`${file}: version not found`);
    write(file, s.replace(m[0], m[0].replace(m[1], v)));
  }
  console.log(`set version ${v} in ${packages().length} package.json files and ${OTHER.length} other files`);
}

function notes(v) {
  const body = changelogSection(v);
  if (!body) {
    console.error(`CHANGELOG.md has no section for ${v}`);
    process.exit(1);
  }
  // the link reference at the end of CHANGELOG.md says what to compare with
  // (not every version has a tag in the public history)
  const link = read("CHANGELOG.md").match(new RegExp(`^\\[${v.replace(/\./g, "\\.")}\\]: (\\S+)`, "m"))?.[1];
  const lines = [
    body,
    "",
    "### Install",
    "",
    "```bash",
    `npm i @nhatnguyet/ziwei@${v} @nhatnguyet/lunar@${v}   # or any @nhatnguyet/* package`,
    `pip install nhatnguyet==${v}`,
    `npx @nhatnguyet/cli@${v} --help`,
    "```",
    "",
    `npm packages are published with [provenance](https://docs.npmjs.com/generating-provenance-statements) from this release's workflow run. Full list: ${publishOrder().map((p) => `[\`${p.json.name}\`](https://www.npmjs.com/package/${p.json.name}/v/${v})`).join(", ")}; Python: [\`nhatnguyet\`](https://pypi.org/project/nhatnguyet/${v}/).`,
  ];
  if (link?.includes("/compare/")) lines.push("", `**Full diff**: ${link}`);
  console.log(lines.join("\n"));
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "check") check(arg?.replace(/^v/, ""));
else if (cmd === "set") set(arg?.replace(/^v/, ""));
else if (cmd === "notes") notes(arg?.replace(/^v/, ""));
else if (cmd === "order") console.log(publishOrder().map((p) => p.json.name).join("\n"));
else {
  console.error("usage: release-tools.mjs check [version] | set <version> | notes <version> | order");
  process.exit(2);
}
