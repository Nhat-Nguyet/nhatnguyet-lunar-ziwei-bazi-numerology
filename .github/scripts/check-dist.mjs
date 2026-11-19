#!/usr/bin/env node
// Check the BUILT JavaScript packages (dist/, as they go to npm) on the Node
// version running this script: every test vector of ca-kiem/ against the core
// functions, a few calls of the English API, the CLI and the MCP server load.
// The TypeScript test suite (`npm test`) needs Node 22.18+ to run .ts files;
// this script is plain JavaScript so that CI can cover Node 18 and 20 too.
//
//   node .github/scripts/check-dist.mjs
//       against js/packages/*/dist (run `npm ci && npm run build` in js/ first)
//   node .github/scripts/check-dist.mjs --published 0.3.0
//       `npm install` the published packages in a temporary folder first
//
// No dependencies; Node 18+. Exit code 1 when anything fails.
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const argv = process.argv.slice(2);
const published = argv[0] === "--published" ? argv[1] : null;
if (argv[0] === "--published" && !published) {
  console.error("--published needs a version");
  process.exit(2);
}

const PKGS = ["am-lich", "tu-vi", "bat-tu", "than-so-hoc", "le-hoi", "cli", "mcp", "widgets"];
let base = join(ROOT, "js");
let tmp = null;
if (published) {
  tmp = mkdtempSync(join(tmpdir(), "nn-dist-"));
  base = tmp;
  writeFileSync(join(tmp, "package.json"), JSON.stringify({ name: "check-dist", private: true, type: "module" }));
  const r = spawnSync("npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts", ...PKGS.map((p) => `@nhatnguyet/${p}@${published}`)], {
    cwd: tmp,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) process.exit(1);
}
const require = createRequire(join(base, "package.json"));
const load = (p) => import(pathToFileURL(require.resolve(`@nhatnguyet/${p}`)).href);

let failures = 0;
function fail(msg) {
  failures++;
  console.error("FAIL " + msg);
}
function ok(msg) {
  console.log("ok   " + msg);
}

// ---------------------------------------------------------------- comparison
// Same rules as js/kiem/so-sanh.ts: drop `khoaBo` keys at every level, key
// order ignored, arrays in order, numbers within 1e-9.
function normalize(v, drop) {
  const flat = v === undefined ? null : JSON.parse(JSON.stringify(v));
  const walk = (x) => {
    if (Array.isArray(x)) return x.map(walk);
    if (x !== null && typeof x === "object") {
      const out = {};
      for (const [k, y] of Object.entries(x)) if (!drop.has(k)) out[k] = walk(y);
      return out;
    }
    return x;
  };
  return walk(flat);
}
function diff(a, b, path = "ra") {
  if (typeof a === "number" && typeof b === "number") return a === b || Math.abs(a - b) <= 1e-9 ? null : `${path}: expected ${a}, got ${b}`;
  const kind = (x) => (x === null ? "null" : Array.isArray(x) ? "array" : typeof x);
  if (kind(a) !== kind(b)) return `${path}: expected ${kind(a)}, got ${kind(b)}`;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return `${path}: expected ${a.length} items, got ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = diff(a[i], b[i], `${path}[${i}]`);
      if (d) return d;
    }
    return null;
  }
  if (a !== null && typeof a === "object") {
    for (const k of Object.keys(a)) if (!(k in b)) return `${path}.${k}: missing key`;
    for (const k of Object.keys(b)) if (!(k in a)) return `${path}.${k}: extra key`;
    for (const k of Object.keys(a)) {
      const d = diff(a[k], b[k], `${path}.${k}`);
      if (d) return d;
    }
    return null;
  }
  return a === b ? null : `${path}: expected ${JSON.stringify(a)}, got ${JSON.stringify(b)}`;
}
function vectors(name, compute, expected = (ra) => ra) {
  const file = JSON.parse(readFileSync(join(ROOT, "ca-kiem", name + ".json"), "utf8"));
  const drop = new Set(file.khoaBo);
  let pass = 0;
  let first = null;
  for (const c of file.ca) {
    let d;
    try {
      d = diff(normalize(expected(c.ra), drop), normalize(compute(c.vao), drop));
    } catch (e) {
      d = "threw: " + e.message;
    }
    if (d === null) pass++;
    else if (!first) first = `input ${JSON.stringify(c.vao)}: ${d}`;
  }
  if (pass === file.ca.length && pass === file.soCa) ok(`${name}: ${pass}/${file.soCa} vectors pass`);
  else fail(`${name}: ${pass}/${file.soCa} vectors pass; first difference: ${first}`);
}

// ---------------------------------------------------------------- run
try {
  const L = await load("am-lich");
  const T = await load("tu-vi");
  const B = await load("bat-tu");
  const N = await load("than-so-hoc");
  const F = await load("le-hoi");

  vectors("am-lich", (v) => {
    if (v.phep === "duong-sang-am") {
      if (v.muiGio !== undefined) return { am: L.solarToLunar(v.dd, v.mm, v.yyyy, v.muiGio) };
      const am = L.solarToLunar(v.dd, v.mm, v.yyyy, 7);
      return {
        am,
        canChiNgay: L.dayCanChi(v.dd, v.mm, v.yyyy),
        canChiThang: L.lunarMonthCanChi(am.month, am.year),
        canChiNam: L.yearCanChi(am.year),
        tietKhi: L.tietKhiCuaNgay(v.dd, v.mm, v.yyyy).ten,
        saoNhiThapBatTu: L.saoCuaNgay(v.dd, v.mm, v.yyyy).ten,
      };
    }
    if (v.phep === "am-sang-duong") return L.lunarToSolar(v.ngay, v.thang, v.nam, v.nhuan, v.muiGio ?? 7);
    if (v.phep === "moc-tiet-khi") return L.mocTietKhiTrongNam(v.nam);
    throw new Error("unknown operation " + v.phep);
  });
  // The core function of auspicious-hours is internal: compare the English
  // API's day, flags and spirits (lang "vi") with the same fields of the vectors.
  vectors("auspicious-hours", (v) => {
    const r = L.auspiciousHours({ year: v.yyyy, month: v.mm, day: v.dd }, { lang: "vi" });
    return { canChiNgay: r.day, gio: r.hours.map((h) => ({ chi: h.branch, hoangDao: h.auspicious, thuTuThan: h.spiritIndex, than: h.spirit })) };
  }, (ra) => ({ canChiNgay: ra.canChiNgay, gio: ra.gio.map((g) => ({ chi: g.chi, hoangDao: g.hoangDao, thuTuThan: g.thuTuThan, than: g.than })) }));
  const ziwei = (schools) => (v) => {
    let laSo;
    try {
      laSo = T.lapLaSoTuVi("", v.gioiTinh, v.dd, v.mm, v.yyyy, v.gio, schools ? v.schools : undefined);
    } catch {
      if (!schools) return { loi: true };
      throw new Error("lapLaSoTuVi threw");
    }
    return { laSo, daiVan: T.daiVan(laSo), hanNam: T.tinhHanNam(laSo, v.namXem), saoLuu: T.tinhSaoLuu(laSo, v.namXem), cachCuc: T.nhanDienCachCuc(laSo) };
  };
  vectors("tu-vi", ziwei(false));
  vectors("tu-vi-phai", ziwei(true));
  const bazi = (schools) => (v) => {
    const gio = typeof v.gio === "number" ? v.gio : null;
    let laSo;
    try {
      laSo = B.lapLaSoBatTu(v.dd, v.mm, v.yyyy, gio, v.phut, v.gioiTinh, schools ? v.schools : undefined);
    } catch (e) {
      if (e instanceof B.LoiThieuGioiTinh) return { loi: true };
      throw e;
    }
    const tieuVan = B.tinhTieuVanBatTu(laSo, v.namXem);
    return tieuVan ? { laSo, tieuVan } : { laSo };
  };
  vectors("bat-tu", bazi(false));
  vectors("bat-tu-phai", bazi(true));
  vectors("than-so-hoc", (v) => N.tinhHoSoThanSoHocSau(v.hoTen, v.dd, v.mm, v.yyyy, v.namXem, v.thangXem, v.ngayXem));
  vectors("le-hoi", (v) => {
    const r = F.leHoiTrongNam(v.nam);
    return r.length ? r : null;
  });

  // English API: a few answers that the READMEs print.
  const check = (name, got, want) => (JSON.stringify(got) === JSON.stringify(want) ? ok(name) : fail(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`));
  const t = L.toLunar("2027-02-06");
  check("toLunar 2027-02-06", [t.year, t.month, t.day, t.yearName], [2027, 1, 1, "Ding Wei"]);
  check("toLunar 1985-01-21 in China", L.toLunar("1985-01-21", { country: "CN" }).day, 1);
  check("castZiWei twelve palaces", T.castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }).palaces.length, 12);
  check("castBaZi day pillar", B.castBaZi({ date: "1990-09-19", time: "20:00", gender: "female" }).pillars.day.label, L.dayPillar("1990-09-19").label);
  check("numerology life path", N.numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19" }).lifePath, 11);
  check("festivals 2027", F.festivals(2027).length, 164);
  try {
    L.toLunar("2200-01-01");
    fail("toLunar 2200-01-01 should throw");
  } catch (e) {
    check("toLunar 2200-01-01 throws RangeError", e instanceof RangeError, true);
  }

  // Packages that only need to load on this Node version.
  for (const p of ["widgets", "mcp", "cli"]) {
    await load(p);
    ok(`@nhatnguyet/${p} loads`);
  }
  const cli = join(dirname(require.resolve("@nhatnguyet/cli")), "cli.js");
  const r = spawnSync(process.execPath, [cli, "lunar", "2027-02-06", "--json"], { encoding: "utf8" });
  if (r.status === 0 && JSON.parse(r.stdout).yearName === "Ding Wei") ok("nhatnguyet lunar 2027-02-06 --json");
  else fail(`nhatnguyet lunar: exit ${r.status} ${r.stderr}`);
} catch (e) {
  fail(e && e.stack ? e.stack : String(e));
} finally {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} check(s) failed on Node ${process.version}` : `\nAll checks pass on Node ${process.version}`);
process.exit(failures ? 1 : 0);
