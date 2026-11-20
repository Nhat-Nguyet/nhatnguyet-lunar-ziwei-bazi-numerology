// Phép kiểm bộ thuật ngữ:
// 1. Tệp đã commit khớp đúng từng byte với bản sinh lại từ bảng của thư viện
//    (bảng đổi mà quên chạy sinh.mjs là đỏ).
// 2. Mọi tên mà các hàm công khai của thư viện TRẢ RA (lá số Tử Vi, Bát Tự
//    trên toàn bộ ca kiểm, lịch âm và tiết khí 1900 tới 2100, thần số học, lễ
//    hội), ở cả ba thứ tiếng, đều có trong bộ thuật ngữ. Đo đầu ra, không đo
//    bảng: thêm một tên vào thư viện mà không vào bộ thuật ngữ là đỏ.
//
// Glossary checks: the committed files equal a fresh generation, and every
// name the libraries output (vi, en, zh) is in the glossary.
//
//   cd thu-vien-mo && node --conditions=source --test du-lieu/terminology/

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as AL from "../../js/packages/am-lich/src/index.ts";
import * as TV from "../../js/packages/tu-vi/src/index.ts";
import * as BT from "../../js/packages/bat-tu/src/index.ts";
import * as TSH from "../../js/packages/than-so-hoc/src/index.ts";
import * as LH from "../../js/packages/le-hoi/src/index.ts";
import { festivals } from "../../js/packages/le-hoi/src/en.ts";
import * as YI from "../../js/packages/iching/src/index.ts";
import * as FS from "../../js/packages/fengshui/src/index.ts";
import { generate } from "./generate.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const LANGS = ["vi", "en", "zh"];

const { rows, files } = generate();

test("committed files match a fresh generation", () => {
  for (const [name, content] of Object.entries(files)) {
    const old = readFileSync(path.join(HERE, name), "utf8");
    assert.equal(old, content, `${name} is out of date: run node --conditions=source du-lieu/terminology/generate.mjs`);
  }
});

test("every row is complete", () => {
  for (const r of rows) {
    assert.ok(r.vi && r.en, r.id);
    if (r.category !== "festival-category") assert.ok(r.zh && r.han && r.pinyin, r.id);
    assert.equal(r.en_alt.split("|").length, r.en_alt_source.split("|").length, r.id);
    assert.doesNotMatch(Object.values(r).join(" "), /\u2014/, r.id);
  }
});

// ---------------------------------------------------------------- thu tên

const SET = { vi: new Set(), en: new Set(), zh: new Set() };
for (const r of rows) {
  SET.vi.add(r.vi);
  for (const a of r.vi_alt.split("|")) if (a) SET.vi.add(a);
  SET.en.add(r.en);
  if (r.zh) SET.zh.add(r.zh);
  if (r.category === "festival-category") {
    // festivals() trả giá trị tiếng Anh ở mọi lang (mã của bộ dữ liệu nằm ở raw).
    for (const l of ["vi", "zh"]) {
      SET[l].add(r.code);
      SET[l].add(r.en);
    }
  }
}

/** Tên thư viện trả, gom theo ngôn ngữ: chỗ phát ra (để báo) theo từng tên. */
const EMITTED = { vi: new Map(), en: new Map(), zh: new Map() };
function collect(lang, where, ...names) {
  for (const t of names.flat()) {
    if (t === undefined || t === null || t === "") continue;
    if (!EMITTED[lang].has(t)) EMITTED[lang].set(t, where);
  }
}

function collectCalendar() {
  for (const lang of LANGS) {
    for (let y = 1900; y <= 2100; y++) {
      for (const t of AL.solarTerms(y, { lang })) collect(lang, "solarTerms().name", t.name);
      for (const m of [1, 2, 5, 8, 11]) {
        for (const d of [1, 9, 17, 25]) {
          for (const country of ["VN", "CN"]) {
            const l = AL.toLunar({ year: y, month: m, day: d }, { lang, country });
            collect(lang, "toLunar() names", l.yearName, l.monthName, l.dayName, l.zodiac, l.solarTerm);
          }
        }
      }
    }
    for (let k = 0; k < 60; k++) {
      const p = AL.pillarFromIndex(k % 10, k % 12, lang);
      collect(lang, "pillarFromIndex()", p.label, p.stem, p.branch, p.stemElement, p.branchElement, p.naYin, p.naYinElement);
    }
    for (let h = 0; h < 24; h++) {
      const b = AL.hourBranch(h, lang);
      collect(lang, "hourBranch()", b.name, b.animal);
    }
    for (let d = 1; d <= 12; d++) {
      const r = AL.auspiciousHours({ year: 2027, month: 1, day: d }, { lang });
      collect(lang, "auspiciousHours()", r.day, r.dayBranch);
      for (const h of r.hours) collect(lang, "auspiciousHours().hours", h.branch, h.animal, h.spirit);
    }
  }
  for (let i = 0; i < 28; i++) {
    const s = AL.saoCuaNgay(1 + i, 1, 2026);
    collect("vi", "saoCuaNgay()", s.ten, s.chom);
    collect("en", "saoCuaNgay()", s.tenEn, s.chomEn);
  }
}

function collectZiWei() {
  const cases = JSON.parse(readFileSync(path.join(ROOT, "ca-kiem/tu-vi.json"), "utf8")).ca;
  for (const { vao } of cases) {
    for (const lang of LANGS) {
      const c = TV.castZiWei({
        date: { year: vao.yyyy, month: vao.mm, day: vao.dd }, hourBranch: vao.gio,
        gender: vao.gioiTinh === "Nữ" ? "female" : "male", lang, viewYear: vao.namXem,
      });
      collect(lang, "castZiWei()", c.yearPillar, c.yinYang, c.bureau.name, c.naYin, c.hour.name, c.hour.animal);
      for (const p of c.palaces) {
        collect(lang, "castZiWei().palaces", p.branch, p.stemBranch, p.name);
        for (const s of p.stars) collect(lang, "castZiWei().palaces[].stars", s.name, s.brightness, s.transformation);
      }
      for (const d of TV.decadeLuck(c, { lang })) collect(lang, "decadeLuck()", d.branch, d.palace, d.majorStars);
      const y = TV.yearlyLuck(c, vao.namXem, { lang });
      collect(lang, "yearlyLuck()", y.yearPillar, y.yearPalace.branch, y.yearPalace.palace, y.minorLimit.branch, y.minorLimit.palace, y.decade?.palace);
      for (const t of y.transformations) collect(lang, "yearlyLuck().transformations", t.type, t.star, t.palace);
      for (const m of y.months) collect(lang, "yearlyLuck().months", m.branch, m.palace);
      for (const s of TV.yearlyStars(c, vao.namXem, { lang })) collect(lang, "yearlyStars()", s.name, s.branch, s.palace);
      for (const p of TV.findPatterns(c, { lang })) collect(lang, "findPatterns()", p.name);
    }
  }
}

function collectBaZiPillar(lang, where, p) {
  if (!p) return;
  collect(lang, where, p.label, p.stem, p.branch, p.stemElement, p.branchElement, p.naYin, p.naYinElement, p.tenGod, p.stage, p.selfStage, p.stars);
  for (const h of p.hiddenStems ?? []) collect(lang, where + ".hiddenStems", h.stem, h.element, h.role, h.tenGod);
}

function collectBaZi() {
  const cases = JSON.parse(readFileSync(path.join(ROOT, "ca-kiem/bat-tu.json"), "utf8")).ca;
  for (const { vao } of cases) {
    for (const lang of LANGS) {
      const time = vao.gio === undefined || vao.gio === null ? null : `${vao.gio}:${String(vao.phut ?? 0).padStart(2, "0")}`;
      const c = BT.castBaZi({ date: { year: vao.yyyy, month: vao.mm, day: vao.dd }, time, gender: vao.gioiTinh === "Nữ" ? "female" : "male", lang });
      for (const k of ["year", "month", "day", "hour"]) collectBaZiPillar(lang, `castBaZi().pillars.${k}`, c.pillars[k]);
      collect(lang, "castBaZi().dayMaster", c.dayMaster.stem, c.dayMaster.element, c.dayMaster.yinYang);
      collect(lang, "castBaZi()", c.solarTerm, c.monthTerm, c.luck.term.name);
      collectBaZiPillar(lang, "castBaZi().conception", c.conception);
      collectBaZiPillar(lang, "castBaZi().lifePalace", c.lifePalace);
      for (const s of c.symbolicStars) collect(lang, "castBaZi().symbolicStars", s.name, s.branches);
      for (const v of c.luck.pillars) collectBaZiPillar(lang, "castBaZi().luck.pillars", v);
      if (time) collectBaZiPillar(lang, "minorLuck()", BT.minorLuck(c, vao.namXem ?? 2026, { lang }));
    }
  }
}

function collectNumerology() {
  for (const lang of LANGS) {
    const r = TSH.numerology({ name: "Nguyễn Văn An", birthDate: "1990-09-19", today: "2026-11-19", lang });
    collect(lang, "numerology().labels", Object.values(r.labels));
  }
}

function collectFestivals() {
  for (const lang of LANGS) {
    for (const y of [2025, 2026, 2027]) {
      for (const f of festivals(y, { lang })) collect(lang, "festivals()", f.group, f.scope, f.level, f.calendar);
    }
  }
  assert.ok(LH.DANH_SACH_LE_HOI.length > 0);
}

function collectIChing() {
  const cases = JSON.parse(readFileSync(path.join(ROOT, "ca-kiem/iching.json"), "utf8")).ca;
  const que = (lang, where, h) => {
    if (!h) return;
    collect(lang, where, h.name, h.upper.name, h.lower.name, h.palace.name, h.palace.generationName);
  };
  for (const lang of LANGS) {
    for (let n = 1; n <= 8; n++) collect(lang, "trigram()", YI.trigram(n, { lang }).name);
    for (const h of YI.allHexagrams({ lang })) que(lang, "allHexagrams()", h);
    cases.forEach(({ vao }, i) => {
      const date = vao.yyyy ? `${vao.yyyy}-${String(vao.mm).padStart(2, "0")}-${String(vao.dd).padStart(2, "0")}` : null;
      if (vao.op === "najia") {
        const c = YI.najia(vao.lines, { date, lang });
        que(lang, "najia().hexagram", c.hexagram);
        que(lang, "najia().changed", c.changed);
        for (const l of c.lines) {
          collect(lang, "najia().lines", l.relation, l.spirit, l.monthState, l.stem, l.branch, l.element);
          if (l.changed) collect(lang, "najia().lines[].changed", l.changed.relation, l.changed.branch, l.changed.element);
        }
      } else if (vao.op === "daily" && i % 11 === 0) {
        const d = YI.dailyHexagram(date, { lang });
        que(lang, "dailyHexagram()", d.hexagram);
        collect(lang, "dailyHexagram()", d.role, d.solarTerm);
      }
    });
  }
}

function collectFengShui() {
  for (const lang of LANGS) {
    for (let y = 1990; y < 1999; y++) {
      for (const gender of ["male", "female"]) {
        const g = FS.lifeGua(y, gender, { lang });
        collect(lang, "lifeGua()", g.trigram.name, g.groupName, g.element);
        for (const d of g.directions) collect(lang, "lifeGua().directions", d.starName);
      }
    }
    for (const m of FS.mountains24({ lang })) collect(lang, "mountains24()", m.name, m.trigramName, m.trigramElement);
    for (const s of FS.nineStars({ lang })) collect(lang, "nineStars()", s.name, s.element);
    for (let period = 1; period <= 9; period++) {
      for (let star = 1; star <= 9; star++) collect(lang, "starQi()", FS.starQi(period, star, { lang }).name);
      for (const m of FS.mountains24()) collect(lang, "flyingStarChart().patternName", FS.flyingStarChart({ period, sitting: m.id }, { lang }).patternName);
    }
    for (const r of FS.lubanRulers({ lang })) {
      for (const x of r.sectors) {
        collect(lang, "lubanRulers().sectors", x.name);
        for (const y of x.subSectors) collect(lang, "lubanRulers().subSectors", y.name);
      }
    }
  }
}

test("every name the libraries output is in the glossary", () => {
  collectCalendar();
  collectZiWei();
  collectBaZi();
  collectNumerology();
  collectFestivals();
  collectIChing();
  collectFengShui();
  const missing = [];
  for (const lang of LANGS) {
    for (const [t, where] of EMITTED[lang]) if (!SET[lang].has(t)) missing.push(`${lang}: ${JSON.stringify(t)} (${where})`);
  }
  assert.deepEqual(missing.slice(0, 40), [], `${missing.length} names missing from the glossary`);
  // Phép kiểm phải thật sự thu được tên ở mọi ngôn ngữ.
  for (const lang of LANGS) assert.ok(EMITTED[lang].size > 300, `${lang}: only ${EMITTED[lang].size} names collected`);
});
