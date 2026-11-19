// Kiểm lớp API tiếng Anh của bat-tu: đối chiếu với lapLaSoBatTu và các trường
// En/Zh của ca kiểm (khi ca kiểm có).
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import { convertTerms } from "@nhatnguyet/am-lich";
import { castBaZi, lapLaSoBatTu, localizeBaZi, minorLuck, tinhTieuVanBatTu } from "../src/index.ts";

const tep = docCaKiem("bat-tu");
type R = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const mau = tep.ca.filter((_, i) => i % 6 === 0);
const TRU = [["year", "truNam"], ["month", "truThang"], ["day", "truNgay"], ["hour", "truGio"]] as const;

function vao(c: (typeof tep.ca)[number], lang: "vi" | "en" | "zh") {
  const v = c.vao as R;
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${v.yyyy}-${p(v.mm)}-${p(v.dd)}`,
    time: v.gio === undefined ? null : `${p(v.gio)}:${p(v.phut)}`,
    gender: v.gioiTinh === "Nữ" ? "female" : "male",
    lang,
  };
}

test("en: castBaZi ra đúng lapLaSoBatTu (giờ đồng hồ, cả khi chưa biết giờ)", () => {
  for (const c of mau) {
    const v = c.vao as R;
    const ls = castBaZi(vao(c, "vi"));
    assert.deepEqual(ls.raw, lapLaSoBatTu(v.dd, v.mm, v.yyyy, v.gio ?? null, v.phut, v.gioiTinh));
    assert.equal(ls.pillars.hour === null, v.gio === undefined);
    assert.equal(ls.time === null, v.gio === undefined);
  }
  assert.ok(mau.some((c) => (c.vao as R).gio === undefined));
});

test("en: tên ba thứ tiếng khớp ca kiểm", () => {
  for (const c of mau) {
    const ra = (c.ra as R).laSo as R;
    const [vi, en, zh] = (["vi", "en", "zh"] as const).map((l) => castBaZi(vao(c, l)));
    for (const [k, kv] of TRU) {
      const t = ra[kv] as R | undefined;
      if (!t) continue;
      const pv = vi.pillars[k]!;
      const pe = en.pillars[k]!;
      const pz = zh.pillars[k]!;
      assert.equal(pv.label, t.label);
      assert.equal(pv.naYin, t.napAmTen);
      assert.equal(pe.tenGod, t.thapThanCanEn);
      assert.equal(pz.tenGod, t.thapThanCanZh);
      if (t.labelZh) assert.equal(pz.label, t.labelZh);
      if (t.napAmTenEn) assert.equal(pe.naYin, t.napAmTenEn);
      if (t.napAmTenZh) assert.equal(pz.naYin, t.napAmTenZh);
      if (t.canHanhEn) assert.equal(pe.stemElement, t.canHanhEn);
      if (t.truongSinhEn) assert.equal(pe.stage, t.truongSinhEn);
      if (t.truongSinhZh) assert.equal(pz.stage, t.truongSinhZh);
      if (t.tuToaZh) assert.equal(pz.selfStage, t.tuToaZh);
      if (t.thanSatEn) assert.deepEqual(pe.stars, t.thanSatEn);
      if (t.thanSatZh) assert.deepEqual(pz.stars, t.thanSatZh);
      t.tangCan.forEach((h: R, i: number) => {
        assert.equal(pv.hiddenStems[i].stem, h.can);
        if (h.vaiTroEn) assert.equal(pe.hiddenStems[i].role, h.vaiTroEn);
        if (h.vaiTroZh) assert.equal(pz.hiddenStems[i].role, h.vaiTroZh);
        if (h.canZh) assert.equal(pz.hiddenStems[i].stem, h.canZh);
      });
    }
    if (ra.nhatChuHanhZh) assert.equal(zh.dayMaster.element, ra.nhatChuHanhZh);
    if (ra.daiVan.tietMocEn) assert.equal(en.luck.term.name, ra.daiVan.tietMocEn);
    if (ra.daiVan.tietMocZh) assert.equal(zh.luck.term.name, ra.daiVan.tietMocZh);
    // Bản Anh: tên can chi, tiết khí còn trong câu của lõi được viết lại theo `terms`.
    assert.equal(en.luck.explanation, convertTerms(ra.daiVan.lyDoEn, "pinyin"));
    assert.doesNotMatch(en.luck.explanation, /[À-ỹ]/);
    assert.equal(en.luck.direction, ra.daiVan.thuan ? "forward" : "backward");
    const ev = castBaZi({ ...vao(c, "en"), terms: "vi" });
    assert.deepEqual(ev.luck.pillars.map((p) => [p.label, p.fromAge, p.fromYear]), ra.daiVan.cacVan.map((v: R) => [v.label, v.tuoiTu, v.namTu]));
    assert.deepEqual(
      en.luck.pillars.map((p) => p.label),
      ra.daiVan.cacVan.map((v: R) => convertTerms(v.label, "pinyin")),
    );
    assert.equal(castBaZi({ ...vao(c, "en"), terms: "han" }).pillars.day.label, zh.pillars.day.label);
    ra.thanSat.forEach((s: R, i: number) => {
      if (s.tenZh) assert.equal(zh.symbolicStars[i].name, s.tenZh);
      if (s.tenEn) assert.equal(en.symbolicStars[i].name, s.tenEn);
      assert.deepEqual(en.symbolicStars[i].pillars, s.viTri.map((x: number) => TRU[x][0]));
    });
  }
});

test("en: minorLuck khớp tinhTieuVanBatTu và ca kiểm", () => {
  for (const c of mau) {
    const v = c.vao as R;
    const ra = c.ra as R;
    const ls = castBaZi(vao(c, "en"));
    const t = minorLuck(ls, v.namXem);
    const goc = tinhTieuVanBatTu(ls.raw, v.namXem);
    if (!goc) {
      assert.equal(t, null);
      continue;
    }
    assert.equal(minorLuck(ls, v.namXem, { terms: "vi" })?.label, goc.label);
    assert.equal(t?.label, convertTerms(goc.label, "pinyin"));
    assert.equal(t?.age, ra.tieuVan.tuoiMu);
    assert.equal(t?.tenGod, ra.tieuVan.thapThanCanEn);
  }
});

test("en: lỗi đầu vào và ghi chú quy ước", () => {
  assert.throws(() => castBaZi({ date: "1990-09-19", time: "20:00", gender: "" }), /gender must be/);
  assert.throws(() => castBaZi({ date: "1990-9-31", gender: "male" }), /no such date/);
  const a = castBaZi({ date: "1990-09-19", time: "23:10", gender: "male" });
  const b = castBaZi({ date: "1990-09-20", time: "01:00", gender: "male" });
  // Trụ ngày đổi lúc 23h: 23h10 ngày 19 cùng trụ ngày với 1h ngày 20.
  assert.equal(a.pillars.day.label, b.pillars.day.label);
  assert.match(a.notes[0], /23:00/);
  assert.equal(localizeBaZi(a.raw, "zh").pillars.day.label.length, 2);
});

test("en: baZiSvg và chart.toSvg vẽ đúng renderBaziSvg", async () => {
  const { baZiSvg, renderBaziSvg } = await import("../src/index.ts");
  const c = castBaZi({ date: "1990-09-19", time: "20:00", gender: "male", lang: "vi" });
  assert.equal(c.toSvg({ name: "An" }), renderBaziSvg(c.raw, { lang: "vi", hoTen: "An" }));
  assert.equal(baZiSvg(c, { theme: "dark" }), renderBaziSvg(c.raw, { lang: "vi", theme: "dark", hoTen: "" }));
  assert.ok(!Object.keys(c).includes("toSvg"));
});
