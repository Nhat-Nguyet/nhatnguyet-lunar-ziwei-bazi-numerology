#!/usr/bin/env node
// Draw assets/cli-demo.svg: an animated terminal recording of the command
// line, made from its real output (ANSI colours included). No dependencies.
//
//   node .github/scripts/make-cli-demo.mjs [--cli "<command>"] [--out <file>]
//
// --cli is how to start the command line: by default the local build
// (js/packages/cli/dist/cli.js, run `npm run build` in js/ first); for a
// published version: --cli "npx -y @nhatnguyet/cli@0.3.0". The prompt in the
// picture always shows "npx @nhatnguyet/cli".
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const opt = (name, dflt) => (args.includes(name) ? args[args.indexOf(name) + 1] : dflt);
const CLI = opt("--cli", `node ${JSON.stringify(join(ROOT, "js", "packages", "cli", "dist", "cli.js"))}`);
const OUT = opt("--out", join(ROOT, "assets", "cli-demo.svg"));

// Scenes: the arguments, and whether to stop after the grid and its legend
// (the Zi Wei output goes on with the year, ten-year periods and patterns).
const SCENES = [
  { args: "lunar 1985-01-21 --country CN", gridOnly: false, hold: 2.6 },
  { args: "ziwei 1990-09-19 20:00 male", gridOnly: true, hold: 6 },
];
const gridEnd = (lines) => {
  const bottom = lines.findIndex((l) => l.replace(/\x1b\[[0-9;]*m/g, "").startsWith("└"));
  const blank = lines.findIndex((l, i) => i > bottom && !l.replace(/\x1b\[[0-9;]*m/g, "").trim());
  return bottom < 0 ? lines.length : blank < 0 ? lines.length : blank;
};

// ---------------------------------------------------------------- layout
const FONT = 13.5;
const CW = 8.1; // cell width at this size for common monospace fonts
const LH = 17.5;
const PAD = 18;
const BAR = 34;
const COLS = 88;
const TYPE = 0.045; // seconds per typed character
const LINE = 0.028; // seconds per output line
const PAUSE = 0.6; // after typing, before output

const PALETTE = {
  fg: "#D7E1DE",
  dim: "#7F918C",
  bg: "#0F1E1D",
  bar: "#182A28",
  prompt: "#7CC7BF",
  31: "#EE8D78", // red
  32: "#7CCB98", // green
  33: "#E6B866", // yellow
  34: "#8DB8E6", // blue
  35: "#D7A6E6", // magenta
  36: "#7CC7BF", // cyan
  37: "#E8EEEC", // white
};

// Terminal columns of one code point (box drawing and Vietnamese are 1; CJK 2).
const width = (s) => {
  let w = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x300 && cp <= 0x36f) continue;
    w += (cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0xa4cf) || (cp >= 0xac00 && cp <= 0xd7a3) || (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xff00 && cp <= 0xff60) ? 2 : 1;
  }
  return w;
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// One line with ANSI SGR codes into [{ text, color, bold }]
function segments(line) {
  const out = [];
  let st = { color: null, bold: false, dim: false };
  let pos = 0;
  for (const m of line.matchAll(/\x1b\[([0-9;]*)m/g)) {
    if (m.index > pos) out.push({ text: line.slice(pos, m.index), ...st });
    for (const c of (m[1] || "0").split(";").map(Number)) {
      if (c === 0) st = { color: null, bold: false, dim: false };
      else if (c === 1) st = { ...st, bold: true };
      else if (c === 2) st = { ...st, dim: true };
      else if (c === 22) st = { ...st, bold: false, dim: false };
      else if (c === 39) st = { ...st, color: null };
      else if ((c >= 30 && c <= 37) || (c >= 90 && c <= 97)) st = { ...st, color: c >= 90 ? c - 60 : c };
    }
    pos = m.index + m[0].length;
  }
  if (pos < line.length) out.push({ text: line.slice(pos), ...st });
  return out.filter((s) => s.text);
}

function run(a) {
  const env = { ...process.env, FORCE_COLOR: "1" };
  delete env.NO_COLOR;
  return execSync(`${CLI} ${a}`, { cwd: ROOT, encoding: "utf8", env })
    .replace(/\n+$/, "")
    .split("\n");
}

// ---------------------------------------------------------------- timeline
let t = 0.8;
const scenes = SCENES.map((s) => {
  const all = run(s.args);
  const out = s.gridOnly ? all.slice(0, gridEnd(all)) : all;
  const cmd = `npx @nhatnguyet/cli ${s.args}`;
  const start = t;
  const typeEnd = start + cmd.length * TYPE;
  const outStart = typeEnd + PAUSE;
  const end = outStart + out.length * LINE + s.hold;
  t = end + 0.4;
  return { cmd, out, start, typeEnd, outStart, end };
});
const DUR = Math.round(t * 10) / 10;
const maxLines = Math.max(...scenes.map((s) => s.out.length)) + 1;
const W = Math.round(PAD * 2 + COLS * CW);
const H = Math.round(BAR + PAD + maxLines * LH + PAD);

// keyframes: visible from `from` to `to` seconds of a DUR-second loop
const frames = new Map();
const cls = (from, to) => {
  const a = ((from / DUR) * 100).toFixed(2);
  const b = ((to / DUR) * 100).toFixed(2);
  const key = `${a}-${b}`;
  if (!frames.has(key)) frames.set(key, { name: `k${frames.size}`, a, b });
  return frames.get(key).name;
};

const body = [];
const yOf = (row) => BAR + PAD + (row + 1) * LH - 4;
for (const s of scenes) {
  // prompt and typed command, one character at a time
  const y = yOf(0);
  body.push(`<text class="${cls(s.start, s.end)}" x="${PAD}" y="${y}" fill="${PALETTE.prompt}" font-weight="700">$</text>`);
  [...s.cmd].forEach((ch, i) => {
    if (ch === " ") return;
    body.push(`<text class="${cls(s.start + (i + 1) * TYPE, s.end)}" x="${(PAD + (i + 2) * CW).toFixed(1)}" y="${y}">${esc(ch)}</text>`);
  });
  // output lines, each stretched to its exact column count so borders line up
  s.out.forEach((line, r) => {
    const segs = segments(line);
    const plain = segs.map((g) => g.text).join("");
    if (!plain.trim()) return;
    const spans = segs
      .map((g) => {
        const fill = g.color ? PALETTE[g.color] : g.dim ? PALETTE.dim : null;
        const attrs = `${fill ? ` fill="${fill}"` : ""}${g.bold ? ' font-weight="700"' : ""}`;
        return attrs ? `<tspan${attrs}>${esc(g.text)}</tspan>` : esc(g.text);
      })
      .join("");
    body.push(`<text class="${cls(s.outStart + r * LINE, s.end)}" x="${PAD}" y="${yOf(r + 1)}" textLength="${(width(plain) * CW).toFixed(1)}" lengthAdjust="spacingAndGlyphs">${spans}</text>`);
  });
}

const css = [...frames.values()]
  .map((f) => `@keyframes ${f.name}{0%,${f.a}%{opacity:0}${(+f.a + 0.01).toFixed(2)}%,${f.b}%{opacity:1}${(+f.b + 0.01).toFixed(2)}%,100%{opacity:0}}.${f.name}{animation:${f.name} ${DUR}s linear infinite}`)
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Nhat Nguyet command line</title>
<desc id="d">Terminal recording: "npx @nhatnguyet/cli lunar 1985-01-21 --country CN" prints the Chinese lunar date (1984-12-01, still the 12th month while Vietnam celebrates Tết), then "npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male" prints a Zi Wei Dou Shu chart as a 4x4 grid.</desc>
<style>
text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"DejaVu Sans Mono","Liberation Mono",monospace;font-size:${FONT}px;fill:${PALETTE.fg};white-space:pre;opacity:0}
${css}
@media (prefers-reduced-motion:reduce){text{animation:none!important}.final{opacity:1}}
</style>
<rect width="${W}" height="${H}" rx="10" fill="${PALETTE.bg}"/>
<rect width="${W}" height="${BAR}" rx="10" fill="${PALETTE.bar}"/>
<rect y="${BAR - 10}" width="${W}" height="10" fill="${PALETTE.bar}"/>
<circle cx="20" cy="${BAR / 2}" r="6" fill="#EE8D78"/><circle cx="40" cy="${BAR / 2}" r="6" fill="#E6B866"/><circle cx="60" cy="${BAR / 2}" r="6" fill="#7CCB98"/>
<text x="${W / 2}" y="${BAR / 2 + 4.5}" text-anchor="middle" fill="${PALETTE.dim}" style="opacity:1;font-size:12px">nhatnguyet</text>
${body.join("\n")}
</svg>
`;
// With reduced motion, show the last scene as a still picture.
const last = scenes.at(-1);
const lastClasses = new Set();
for (const f of frames.values()) if (f.b === ((last.end / DUR) * 100).toFixed(2)) lastClasses.add(f.name);
const final = svg.replace(/<text class="(k\d+)"/g, (m, k) => (lastClasses.has(k) ? `<text class="${k} final"` : m));
writeFileSync(OUT, final);
console.log(`${OUT}: ${W}x${H}, ${DUR} s loop, ${body.length} text elements, ${(final.length / 1024).toFixed(1)} KB`);
