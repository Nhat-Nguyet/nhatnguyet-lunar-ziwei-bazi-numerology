// Lớp tiếng Anh: mỗi hàm chỉ đổi cách viết của đáp án lõi Go (so với chính ca
// kiểm), cộng các lỗi đầu vào và ba thứ tiếng.
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import {
  annualStars, eightDirections, findMountain, flyingStarChart, houseGua, lifeGua, lubanRuler, lubanRulers, mountainAt,
  mountains24, nineStars, periodOf, periods, starQi, trigramOf,
} from "../src/index.ts";

const tep = docCaKiem("fengshui");
const ca = (phep: string) => tep.ca.filter((c) => c.vao.phep === phep);
type R = Record<string, any>;

const DIR_VI: Record<string, string> = {
  north: "Bắc", northeast: "Đông Bắc", east: "Đông", southeast: "Đông Nam",
  south: "Nam", southwest: "Tây Nam", west: "Tây", northwest: "Tây Bắc", center: "Trung cung",
};
const QI_VI: Record<string, string> = { prosperous: "Vượng khí", growing: "Sinh khí", retreating: "Thoái khí", killing: "Sát khí", dead: "Tử khí" };

test("lifeGua matches every cung-phi vector", () => {
  let n = 0;
  for (const c of ca("cung-phi")) {
    const v = c.vao as R;
    const ra = c.ra as R;
    const date = { year: v.yyyy, month: v.mm, day: v.dd };
    if (ra.loi) {
      assert.throws(() => lifeGua(date, v.gioiTinh), TypeError);
      continue;
    }
    const g = lifeGua(date, v.gioiTinh, { lang: "vi" });
    const k = ra.ketQua;
    assert.equal(g.lunarYear, ra.namAm);
    assert.equal(g.number, k.kua);
    assert.equal(g.trigram.nameVi, k.que);
    assert.equal(g.trigram.pinyin, k.queEn);
    assert.equal(g.group, k.nhomMenh === "dong_tu_menh" ? "east" : "west");
    const sao = [...k.huongTot, ...k.huongXau];
    assert.deepEqual(g.directions.map((d) => [d.directionName, d.nameVi, d.han, d.pinyin, d.favorable]),
      sao.map((s: R, i: number) => [s.huong, s.tenSao, s.tenSaoZh, s.tenSaoEn, i < 4]));
    assert.equal(g.note !== undefined, v.yyyy !== ra.namAm);
    n++;
  }
  assert.ok(n > 1200);
});

test("lifeGua: lunar year input, names in three languages, errors", () => {
  const a = lifeGua("1990-09-19", "female");
  assert.equal(a.number, 8);
  assert.equal(a.trigram.name, "Gen");
  assert.equal(a.element, "Earth");
  assert.equal(lifeGua(1990, "female").number, 8);
  assert.equal(lifeGua("1990-01-20", "male").lunarYear, 1989);
  assert.match(lifeGua("1990-01-20", "male").note ?? "", /before the lunar New Year/);
  assert.equal(lifeGua("1990-09-19", "f", { lang: "zh" }).trigram.name, "艮");
  assert.equal(lifeGua("1990-09-19", "f", { terms: "han" }).directions[0].starName, "生气");
  assert.equal(lifeGua("1990-09-19", "f", { terms: "vi" }).directions[0].starName, "Sinh Khí");
  assert.throws(() => lifeGua("2200-01-01", "male"), RangeError);
  assert.throws(() => lifeGua(1899, "male"), RangeError);
  assert.throws(() => lifeGua("1990-02-30", "male"), RangeError);
  assert.throws(() => lifeGua("1990-09-19", "x"), TypeError);
  assert.throws(() => lifeGua("1990-09-19", "male", { lang: "fr" as never }), TypeError);
});

test("eightDirections and trigramOf", () => {
  const d = eightDirections(1);
  assert.equal(d.length, 8);
  assert.deepEqual(d.map((x) => x.star), ["sheng-qi", "tian-yi", "yan-nian", "fu-wei", "huo-hai", "liu-sha", "wu-gui", "jue-ming"]);
  assert.equal(d.find((x) => x.star === "fu-wei")?.direction, "north");
  assert.deepEqual(d.find((x) => x.direction === "north")?.mountains, ["ren", "zi", "gui"]);
  assert.deepEqual(eightDirections(lifeGua(1990, "female")), eightDirections(8));
  assert.throws(() => eightDirections(5), RangeError);
  assert.equal(trigramOf(9).symbol, "☲");
  assert.throws(() => trigramOf(5), RangeError);
});

test("houseGua matches every trach vector, by sitting and by facing", () => {
  for (const c of ca("trach")) {
    const ra = c.ra as R;
    const h = houseGua({ sitting: (c.vao as R).toa }, { lang: "vi" });
    assert.equal(h.sitting.nameVi, ra.son.ten);
    assert.equal(h.number, ra.trach.kua);
    assert.equal(h.trigram.nameVi, ra.trach.que);
    assert.equal(h.groupName, ra.trach.nhom === "Đông Tứ Mệnh" ? "Đông tứ trạch" : "Tây tứ trạch");
    const sao = [...ra.trach.huongTot, ...ra.trach.huongXau];
    assert.deepEqual(h.directions.map((d) => [d.nameVi, d.directionName]), sao.map((s: R) => [s.sao, s.huong]));
    const f = houseGua({ facing: (h.facing.center) }, { lang: "vi" });
    assert.equal(f.sitting.nameVi, ra.son.ten);
  }
  assert.equal(houseGua({ facing: 180 }).trigram.pinyin, "Kan");
  assert.throws(() => houseGua({}), TypeError);
  assert.throws(() => houseGua({ facing: 1, sitting: 2 }), TypeError);
  assert.throws(() => houseGua({ facing: "nowhere" }), RangeError);
});

test("mountains24 and mountainAt match the son and son-theo-do vectors", () => {
  const ds = ca("son")[0].ra as R[];
  const m = mountains24({ lang: "vi" });
  assert.equal(m.length, 24);
  m.forEach((x, i) => {
    const s = ds[i];
    assert.deepEqual([x.index, x.nameVi, x.from, x.to, x.directionName, x.trigramName], [s.so, s.ten, s.tuDo, s.denDo, s.huong, s.quai]);
    assert.equal(x.kind, { "Thiên Can": "stem", "Địa Chi": "branch", "Quái": "trigram" }[s.loai as string]);
    assert.equal(x.dragon, { "Địa": "earth", "Thiên": "heaven", "Nhân": "human" }[s.nguyenLong as string]);
  });
  for (const c of ca("son-theo-do")) {
    assert.equal(mountainAt((c.vao as R).do, { lang: "vi" }).nameVi, (c.ra as R).ten);
  }
  assert.equal(mountainAt(7.5).id, "gui");
  assert.equal(mountainAt(7.4999).id, "zi");
  assert.equal(findMountain("Xun").nameVi, "Tốn");
  assert.equal(findMountain("巽").id, "xun");
  assert.equal(findMountain("Tỵ").id, "si");
  assert.equal(new Set(mountains24().map((x) => x.id)).size, 24);
  assert.deepEqual(mountains24({ lang: "zh" }).slice(0, 4).map((x) => x.name), ["子", "癸", "丑", "艮"]);
  assert.throws(() => mountainAt(Number.NaN), TypeError);
});

test("flyingStarChart matches every tinh-ban vector", () => {
  let n = 0;
  for (const c of ca("tinh-ban")) {
    const v = c.vao as R;
    const ra = c.ra as R;
    if (ra.loi) {
      assert.throws(() => flyingStarChart({ period: v.van, sitting: v.toa }));
      continue;
    }
    const tb = ra.tinhBan;
    const ch = flyingStarChart({ period: v.van, sitting: v.toa }, { lang: "vi" });
    assert.equal(ch.sitting.nameVi, tb.toa);
    assert.equal(ch.facing.nameVi, tb.huong);
    assert.equal(ch.sittingPalace, tb.cungToa);
    assert.equal(ch.facingPalace, tb.cungHuong);
    assert.equal(ch.patternName ?? "", tb.cach);
    assert.deepEqual([0, ...ch.palaces.map((p) => p.base)], tb.vanBan);
    assert.deepEqual([0, ...ch.palaces.map((p) => p.mountain)], tb.sonTinh);
    assert.deepEqual([0, ...ch.palaces.map((p) => p.facing)], tb.huongTinh);
    for (const p of ch.palaces) {
      assert.equal(DIR_VI[p.direction], p.directionName);
      assert.equal(QI_VI[p.qi.base], ra.khi[p.base]);
      assert.equal(QI_VI[p.qi.facing], ra.khi[p.facing]);
    }
    assert.deepEqual(ch.castleGates.map((g) => [g.palace, g.primary, g.baseStar, g.forward, g.arrivingStar, g.usable]),
      ra.thanhMon.cung.map((g: R) => [g.cung, g.laChinh, g.soVanBan, g.thuan, g.saoDen, g.dungDuoc]));
    const fwd = (b: number[]) => b[6] === (b[5] % 9) + 1;
    assert.equal(ch.mountainStarForward, fwd(tb.sonTinh));
    assert.equal(ch.facingStarForward, fwd(tb.huongTinh));
    const byFacing = flyingStarChart({ period: v.van, facing: ch.facing.id });
    assert.deepEqual(byFacing.palaces, flyingStarChart({ period: v.van, sitting: v.toa }).palaces);
    n++;
  }
  assert.equal(n, 216);
  const y = flyingStarChart({ year: 2026, facing: 180 });
  assert.equal(y.period, 9);
  assert.equal(y.pattern, "double-sitting");
  assert.equal(y.year, 2026);
  assert.throws(() => flyingStarChart({ period: 10, facing: 180 }), RangeError);
  assert.throws(() => flyingStarChart({ period: 9, year: 2026, facing: 180 }), TypeError);
  assert.throws(() => flyingStarChart({ year: 2200, facing: 180 }), RangeError);
});

test("annualStars, periodOf, periods match the vectors", () => {
  for (const c of ca("phi-tinh-nam")) {
    const ra = c.ra as R;
    const a = annualStars((c.vao as R).nam);
    assert.equal(a.center, ra.saoTrung);
    assert.deepEqual([0, ...a.palaces.map((p) => p.star)], ra.sao);
  }
  for (const c of ca("van")) {
    const ra = c.ra as R;
    const p = periodOf((c.vao as R).nam, { lang: "vi" });
    assert.deepEqual([p.period, p.eraName, p.from, p.to, p.star.nameVi, p.zhengShenPalace ?? 0, p.lingShenPalace ?? 0],
      [ra.so, ra.nguyen, ra.tuNam, ra.denNam, ra.sao, ra.chinhThan, ra.linhThan]);
  }
  for (const c of ca("chin-van")) {
    const nam = (c.vao as R).nam;
    if (nam < 1900 || nam > 2100) continue;
    assert.deepEqual(periods(nam).map((p) => [p.from, p.to]), (c.ra as R[]).map((v) => [v.tuNam, v.denNam]));
  }
  assert.equal(nineStars()[0].name, "One White");
  assert.equal(nineStars({ lang: "zh" })[8].name, "九紫");
  assert.deepEqual(starQi(9, 1), { qi: "growing", name: "Growing" });
  assert.throws(() => annualStars(1899), RangeError);
});

test("lubanRuler matches the lo-ban vectors (lengths given in mm)", () => {
  const MA: Record<string, string> = { THONG_THUY: "clear-opening", DUONG_TRACH: "luban", AM_PHAN: "dinglan" };
  let n = 0;
  for (const c of ca("lo-ban")) {
    const v = c.vao as R;
    const ra = c.ra as R;
    const ruler = MA[v.loaiThuoc];
    if (!ruler || !(v.kichThuocMm > 0)) {
      if (ruler) assert.throws(() => lubanRuler(v.kichThuocMm, { ruler: ruler as never, unit: "mm" }), RangeError);
      continue;
    }
    if (Math.floor(v.kichThuocMm * 10 + 0.5) / 10 !== v.kichThuocMm) continue;
    const r = lubanRuler(v.kichThuocMm, { ruler: ruler as never, unit: "mm", lang: "vi" });
    assert.deepEqual([r.cycle, r.positionMm, r.sector.nameVi, r.sector.han, r.auspicious, r.sector.meaning, r.subSector?.nameVi ?? undefined, r.subSector?.nameZh ?? undefined],
      [ra.chuKyThu, ra.viTriMm, ra.cung, ra.cungHan, ra.tot, ra.nghia, ra.cungNho, ra.cungNhoZh]);
    assert.deepEqual(r.nearestAuspicious.map((g) => [g.lengthMm, g.lengthCm, g.offsetMm, g.sector]),
      (ra.ganNhatTot ?? []).map((g: R) => [g.mm, g.cm, g.lechMm, g.cung]));
    n++;
  }
  assert.ok(n > 500, String(n));
  const a = lubanRuler(82, { ruler: "clear-opening" });
  assert.equal(a.lengthMm, 820);
  assert.equal(a.sector.name, "Fu Lu");
  assert.equal(lubanRuler(81, { lang: "zh" }).sector.name, "本");
  assert.equal(lubanRuler(81, { ruler: "42.9" }).ruler, "luban");
  assert.throws(() => lubanRuler(0), RangeError);
  assert.throws(() => lubanRuler(80, { ruler: "x" as never }), TypeError);
  const ds = lubanRulers();
  assert.deepEqual(ds.map((x) => [x.ruler, x.sectors.length]), [["clear-opening", 8], ["luban", 8], ["dinglan", 10]]);
});

test("Luban sub-sectors: pinyin, English gloss, name by terms", () => {
  const sub = (o: object) => lubanRuler(80, { ruler: "luban", ...o }).subSector!;
  assert.deepEqual(sub({}), { name: "Kou She", pinyin: "Kou She", nameEn: "Quarrels", nameVi: "Khẩu thiệt", nameZh: "口舌" });
  assert.equal(sub({ terms: "han" }).name, "口舌");
  assert.equal(sub({ terms: "vi" }).name, "Khẩu thiệt");
  assert.equal(sub({ lang: "vi" }).name, "Khẩu thiệt");
  assert.equal(sub({ lang: "zh" }).name, "口舌");
  assert.equal(lubanRuler(80, { ruler: "clear-opening" }).subSector!.nameEn, "Wealth and rank");
  const g = lubanRuler(80, { ruler: "dinglan" }).nearestAuspicious;
  assert.ok(g.every((x) => x.subSector === null));
  const ten = lubanRulers().flatMap((r) => r.sectors.flatMap((x) => x.subSectors));
  assert.equal(ten.length, 8 * 5 + 8 * 4);
  for (const x of ten) {
    assert.ok(/^[A-Z][a-z]+( [A-Z][a-z]+)*$/.test(x.pinyin), x.pinyin);
    assert.equal(x.pinyin.split(" ").length, [...x.nameZh].length, x.pinyin);
    assert.ok(/^[A-Z][a-z]*( [a-z]+)*$/.test(x.nameEn), x.nameEn);
    assert.equal(x.name, x.pinyin);
  }
});

test("no em dash, no Vietnamese in zh names", () => {
  const all = JSON.stringify([
    lifeGua("1990-09-19", "male"), lifeGua("1990-09-19", "male", { lang: "vi" }), lifeGua("1990-09-19", "male", { lang: "zh" }),
    flyingStarChart({ period: 8, facing: 45 }), mountains24({ lang: "zh" }), lubanRulers({ lang: "zh" }), periods(2026, { lang: "zh" }),
  ]);
  assert.ok(!all.includes("—"));
  const zh = mountains24({ lang: "zh" }).map((m) => m.name + m.directionName + m.trigramName + m.trigramElement).join("");
  assert.ok(!/[A-Za-zÀ-ỹ]/.test(zh), zh);
});

test("lang en has no Vietnamese outside nameVi (default and han terms)", () => {
  const coDau = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/i;
  const loi: string[] = [];
  const quet = (v: unknown, d: string) => {
    if (typeof v === "string") {
      if (coDau.test(v)) loi.push(`${d}: ${v}`);
    } else if (Array.isArray(v)) v.forEach((x, i) => quet(x, `${d}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (k !== "nameVi") quet(x, `${d}.${k}`);
  };
  for (const terms of [undefined, "han"] as const) {
    quet(lifeGua("1990-01-20", "male", { terms }), "lifeGua");
    quet(houseGua({ facing: 200 }, { terms }), "houseGua");
    quet(mountains24({ terms }), "mountains24");
    for (let p = 1; p <= 9; p++) quet(flyingStarChart({ period: p, facing: p * 40 }, { terms }), "chart");
    quet(periods(2026), "periods");
    quet(annualStars(2026), "annual");
    quet(nineStars(), "nineStars");
    quet(lubanRulers({ terms }), "lubanRulers");
    for (const r of ["clear-opening", "luban", "dinglan"] as const) for (let cm = 10; cm < 120; cm += 3.7) quet(lubanRuler(cm, { ruler: r, terms }), "luban");
  }
  assert.deepEqual(loi.slice(0, 5), []);
});
