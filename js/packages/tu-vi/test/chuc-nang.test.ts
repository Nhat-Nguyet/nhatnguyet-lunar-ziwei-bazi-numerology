// Kiểm hàm tra cứu của API tiếng Anh (src/chuc-nang.ts): đúng lõi (đại vận,
// hạn năm, tiểu vận, nguyệt hạn, phi tinh), JSON lá số không đổi, và bản Python
// (nhatnguyet/tu_vi_chuc_nang.py) ra JSON trùng từng byte trên cùng bộ việc.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  castZiWei, daiVan, fliesTo, flankingPalaces, flyingTransformations, horoscope, lapLaSoTuVi, palaceHas, palaceHasOneOf,
  palaceIsEmpty, palaceNotHave, palaceOf, selfTransformed, starOf, surroundingPalaces, tinhHanNam, TU_HOA_THEO_CAN, viTriSao,
} from "../src/index.ts";
import { castZiWei as castZiWeiData } from "../src/en.ts";

const THU_MUC_PY = join(dirname(fileURLToPath(import.meta.url)), "../../../../python");

test("castZiWei has methods but its JSON is unchanged", () => {
  const c = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", viewYear: 2026 });
  const d = castZiWeiData({ date: "1990-09-19", time: "20:00", gender: "male", viewYear: 2026 });
  assert.equal(JSON.stringify(c), JSON.stringify(d));
  assert.deepEqual(Object.keys(c), Object.keys(d));
  for (const k of ["horoscope", "palace", "star", "surroundingPalaces", "flankingPalaces", "flyingTransformations"]) {
    assert.equal(typeof (c as unknown as Record<string, unknown>)[k], "function", k);
  }
});

test("palace and star lookup by name in three languages", () => {
  const c = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
  const menh = c.palaces[c.lifePalace];
  for (const ten of ["Life Palace", "life palace", "Mệnh", "命宫", c.lifePalace]) assert.equal(c.palace(ten), menh, String(ten));
  assert.equal(palaceOf(c, "no such palace"), undefined);
  assert.throws(() => palaceOf(c, 12), RangeError);
  const tv = c.star("紫微")!;
  assert.equal(tv.star.nameVi, "Tử Vi");
  assert.equal(starOf(c, "Tử Vi")!.palace, tv.palace);
  assert.equal(starOf(c, "nope"), undefined);
  const s = surroundingPalaces(c, "Mệnh");
  assert.deepEqual([s.target, s.opposite, s.wealth, s.career].map((p) => p.nameVi), ["Mệnh", "Thiên Di", "Tài Bạch", "Quan Lộc"]);
  const g = flankingPalaces(c, c.lifePalace);
  assert.deepEqual([g.previous.index, g.next.index], [(c.lifePalace + 11) % 12, (c.lifePalace + 1) % 12]);
  assert.equal(palaceHas(c, tv.palace.index, ["Tử Vi"]), true);
  assert.equal(palaceHasOneOf(c, tv.palace.index, ["Purple Star", "nope"]), tv.palace.stars.some((x) => x.name === "Purple Star"));
  assert.equal(palaceNotHave(c, tv.palace.index, ["紫微"]), false);
  for (const p of c.palaces) assert.equal(palaceIsEmpty(c, p.index), !p.stars.some((x) => x.kind === "major"));
});

test("flying Four Transformations follow the engine table for the palace stem", () => {
  for (const [ngay, gio, gioi] of [["1990-09-19", 10, "Nam"], ["1985-01-21", 5, "Nữ"], ["2001-07-30", 0, "Nam"]] as const) {
    const raw = lapLaSoTuVi("", gioi, Number(ngay.slice(8)), Number(ngay.slice(5, 7)), Number(ngay.slice(0, 4)), gio);
    for (let i = 0; i < 12; i++) {
      const th = TU_HOA_THEO_CAN[["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"].indexOf(raw.cung[i].canChi.split(" ")[0])];
      const sao = [th.loc, th.quyen, th.khoa, th.ky];
      const bay = flyingTransformations(raw, i, { lang: "vi" });
      assert.deepEqual(bay.map((x) => x.star), sao);
      assert.deepEqual(bay.map((x) => x.palaceIndex), sao.map((s) => (viTriSao(raw, s) < 0 ? null : viTriSao(raw, s))));
      assert.deepEqual(bay.map((x) => x.self), sao.map((s) => viTriSao(raw, s) === i));
      ["lu", "quan", "ke", "ji"].forEach((t, k) => {
        for (let j = 0; j < 12; j++) assert.equal(fliesTo(raw, i, j, t), viTriSao(raw, sao[k]) === j);
      });
      assert.equal(selfTransformed(raw, i), sao.some((s) => viTriSao(raw, s) === i));
      assert.equal(selfTransformed(raw, i, ["禄", "忌"]), viTriSao(raw, sao[0]) === i && viTriSao(raw, sao[3]) === i);
    }
  }
  assert.throws(() => fliesTo(castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" }), 0, 1, "fortune"), RangeError);
});

test("horoscope takes the engine's decade, minor, yearly and monthly periods", () => {
  const c = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
  const h = c.horoscope({ date: "2026-11-19" });
  assert.deepEqual(h.lunar, { year: 2026, month: 10, day: 11, leap: false });
  const hn = tinhHanNam(c.raw, 2026);
  assert.equal(h.age, hn.tuoiMu);
  assert.equal(h.year.palaceIndex, hn.luuNienViTri);
  assert.equal(h.minorLimit.palaceIndex, hn.tieuVanViTri);
  assert.equal(h.month.palaceIndex, hn.nguyetHan.thang[9].viTri);
  const dv = daiVan(c.raw).find((x) => hn.tuoiMu >= x.tuTuoi && hn.tuoiMu <= x.denTuoi)!;
  assert.equal(h.decade!.palaceIndex, dv.viTri);
  assert.deepEqual([h.decade!.fromAge, h.decade!.toAge], [dv.tuTuoi, dv.denTuoi]);
  assert.equal(h.year.palace, "Health");
  assert.deepEqual(h.year.transformations.map((x) => x.type), ["Hua Lu", "Hua Quan", "Hua Ke", "Hua Ji"]);
  assert.equal(h.year.stars.length, 5);
  assert.deepEqual(h.month.transformations, []);
  assert.equal(h.day, null);
  assert.equal(h.hour, null);
  // Mười hai tên cung xoay: cung của phạm vi là Mệnh.
  assert.equal(h.year.palaceNames[h.year.palaceIndex], "Life Palace");
  assert.equal(h.decade!.palaceNames[h.decade!.palaceIndex], "Life Palace");
  // Trước đại vận đầu (tuổi mụ nhỏ hơn số cục): lõi không có luật đồng hạn.
  assert.equal(c.horoscope({ date: "1991-03-01" }).decade, null);
  const zh = horoscope(c, { date: "2026-11-19", lang: "zh" });
  assert.equal(zh.year.stemBranch, "丙午");
  assert.equal(zh.year.palaceNames[zh.year.palaceIndex], "命宫");
});

// ── So với bản Python ────────────────────────────────────────────────────

const MA_PY = String.raw`
import json, sys
from nhatnguyet import en
from nhatnguyet import tu_vi_chuc_nang as f

ra = []
for v in json.load(sys.stdin):
    c = en.cast_zi_wei(v["date"], v["gender"], hour_branch_index=v["hourBranch"], lang=v["lang"], view_year=2026, terms=v.get("terms"),
                       schools=v.get("schools"))
    r = {
        "h": [f.horoscope(c, d) for d in v["xem"]],
        "palace": f.palace_of(c, v["tenCung"]),
        "star": f.star_of(c, v["tenSao"]),
        "sur": f.surrounding_palaces(c, c["lifePalace"]),
        "flank": f.flanking_palaces(c, 3),
        "fly": [f.flying_transformations(c, i) for i in range(12)],
        "flies": [[f.flies_to(c, i, j, t) for j in range(12)] for i in range(12) for t in ("lu", "ji")],
        "self": [f.self_transformed(c, i) for i in range(12)],
        "empty": [f.palace_is_empty(c, i) for i in range(12)],
        "has": f.palace_has(c, c["lifePalace"], [v["tenSao"]]),
    }
    ra.append(json.dumps(r, ensure_ascii=False, separators=(",", ":")))
sys.stdout.write(json.dumps(ra, ensure_ascii=False))
`;

test("Python prints byte-identical JSON", (t) => {
  try {
    execFileSync("python3", ["-c", "import sys; assert sys.version_info >= (3, 9)"], { stdio: "ignore" });
  } catch {
    t.skip("không có python3");
    return;
  }
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const viec = [];
  const LANG = ["en", "vi", "zh"] as const;
  const TERMS = [undefined, "pinyin", "han", "vi"] as const;
  const TEN_CUNG = ["Life Palace", "命宫", "Tài Bạch", "career", "nope"];
  const TEN_SAO = ["Tử Vi", "紫微", "Purple Star", "Lộc Tồn", "Thiên Mã", "nope"];
  for (let n = 0; n < 60; n++) {
    const sinh = Date.UTC(1910, 0, 1) + rnd() * (Date.UTC(2040, 0, 1) - Date.UTC(1910, 0, 1));
    const lang = LANG[n % 3];
    viec.push({
      date: iso(sinh), gender: rnd() < 0.5 ? "male" : "female", hourBranch: Math.floor(rnd() * 12), lang,
      terms: lang === "en" ? TERMS[Math.floor(n / 3) % 4] : undefined,
      xem: [iso(sinh + 86400000 * 40), iso(sinh + rnd() * 90 * 365.25 * 864e5), "2023-04-12", "2026-11-19"],
      tenCung: TEN_CUNG[n % TEN_CUNG.length], tenSao: TEN_SAO[n % TEN_SAO.length],
      // Lựa chọn phái ở một phần năm số việc (bảng Tứ Hóa can Canh của phi tinh, tháng nhuận).
      schools: n % 5 === 0 ? { transformations: n % 2 ? "quanshu" : "zhongzhou", leapMonth: "next-month", fireBell: "quanshu" } : undefined,
    });
  }
  const out = execFileSync("python3", ["-c", MA_PY], {
    input: JSON.stringify(viec),
    cwd: THU_MUC_PY,
    env: { ...process.env, PYTHONPATH: THU_MUC_PY, PYTHONIOENCODING: "utf-8" },
    maxBuffer: 256 * 1024 * 1024,
  });
  const py = JSON.parse(out.toString("utf8")) as string[];
  viec.forEach((v, k) => {
    const c = castZiWei({ date: v.date, gender: v.gender, hourBranch: v.hourBranch, lang: v.lang, viewYear: 2026, terms: v.terms, schools: v.schools as never });
    const r = {
      h: v.xem.map((d) => horoscope(c, { date: d })),
      palace: palaceOf(c, v.tenCung) ?? null,
      star: starOf(c, v.tenSao) ?? null,
      sur: surroundingPalaces(c, c.lifePalace),
      flank: flankingPalaces(c, 3),
      fly: Array.from({ length: 12 }, (_, i) => flyingTransformations(c, i)),
      flies: Array.from({ length: 12 }, (_, i) => ["lu", "ji"].map((t) => Array.from({ length: 12 }, (_, j) => fliesTo(c, i, j, t)))).flat(),
      self: Array.from({ length: 12 }, (_, i) => selfTransformed(c, i)),
      empty: Array.from({ length: 12 }, (_, i) => palaceIsEmpty(c, i)),
      has: palaceHas(c, c.lifePalace, [v.tenSao]),
    };
    assert.equal(JSON.stringify(r), py[k], `task ${k}: ${JSON.stringify(v)}`);
  });
});
