// Kiểm lớp API tiếng Anh của tu-vi: đối chiếu với hàm tiếng Việt và với các
// trường En/Zh của ca kiểm (khi ca kiểm có).
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import {
  YEARLY_STAR_CODE_EN,
  CHINH_TINH_NAME_EN,
  PATTERN_EN,
  STAR_EN_FIX,
  castZiWei,
  daiVan,
  decadeLuck,
  findPatterns,
  lapLaSoTuVi,
  localizeZiWei,
  nhanDienCachCuc,
  parseGender,
  tinhHanNam,
  yearlyLuck,
  yearlyStars,
} from "../src/index.ts";
import { enText, starEn } from "../src/ten-en.ts";

const tep = docCaKiem("tu-vi");
type R = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// TODO(zh): sao mà lõi TypeScript chưa trả chữ Trung và bảng TU_VUNG không
// dùng được (cùng chữ Việt mang nghĩa khác): bản zh tạm để tên tiếng Anh.
// Agent bổ sung zh cho lõi xong thì danh sách này rỗng dần.
const SAO_CHUA_CO_ZH = new Set(["Phúc Đức"]);

const mau = tep.ca.filter((c, i) => i % 8 === 0 && !(c.ra as R).loi);

function vao(c: (typeof tep.ca)[number], lang: "vi" | "en" | "zh") {
  const v = c.vao as R;
  return {
    date: { year: v.yyyy, month: v.mm, day: v.dd },
    time: `${String(v.gio * 2).padStart(2, "0")}:00`,
    gender: v.gioiTinh === "Nữ" ? "female" : "male",
    viewYear: v.namXem,
    lang,
  };
}

test("en: castZiWei maps clock time to the branch index and gives lapLaSoTuVi", () => {
  for (const c of mau) {
    const v = c.vao as R;
    const chart = castZiWei(vao(c, "vi"));
    assert.deepEqual(chart.raw, lapLaSoTuVi("", v.gioiTinh, v.dd, v.mm, v.yyyy, v.gio));
    assert.equal(chart.hour.index, v.gio);
    // Giờ lẻ cùng canh (gio*2 - 1, tức đầu canh) cũng ra cùng chi.
    if (v.gio > 0) assert.equal(castZiWei({ ...vao(c, "vi"), time: `${v.gio * 2 - 1}:59` }).hour.index, v.gio);
  }
  assert.ok(mau.length > 50);
});

test("en: palace, star and bureau names in three languages match the vectors", () => {
  const thieuZh = new Set<string>();
  for (const c of mau) {
    const ra = (c.ra as R).laSo as R;
    const [vi, en, zh] = (["vi", "en", "zh"] as const).map((l) => castZiWei(vao(c, l)));
    for (let i = 0; i < 12; i++) {
      const cg = ra.cung[i];
      assert.equal(vi.palaces[i].name, cg.tenCung);
      assert.equal(en.palaces[i].name, cg.tenCungEn);
      if (cg.tenCungZh) assert.equal(zh.palaces[i].name, cg.tenCungZh);
      if (cg.canChiZh) assert.equal(zh.palaces[i].stemBranch, cg.canChiZh);
      cg.sao.forEach((s: R, k: number) => {
        assert.equal(vi.palaces[i].stars[k].nameVi, s.ten);
        // Bản Anh dùng tên lõi, trừ ba sao sửa tên (Đà La, Thiên Tướng, Thiên Việt).
        assert.equal(en.palaces[i].stars[k].name, starEn(s.ten, s.tenEn));
        if (s.tenZh && zh.palaces[i].stars[k].name !== s.tenZh) thieuZh.add(s.ten);
        if (s.mieuVuongEn) assert.equal(en.palaces[i].stars[k].brightness, s.mieuVuongEn);
      });
    }
    if (ra.tenCucEn) assert.equal(en.bureau.name, ra.tenCucEn);
    if (ra.tenCucZh) assert.equal(zh.bureau.name, ra.tenCucZh);
    if (ra.amDuongMenhEn) assert.equal(en.yinYang, ra.amDuongMenhEn);
    if (ra.banMenhNapAmZh) assert.equal(zh.naYin, ra.banMenhNapAmZh);
    if (ra.canChiNamZh) assert.equal(zh.yearPillar, ra.canChiNamZh);
  }
  for (const t of thieuZh) assert.ok(SAO_CHUA_CO_ZH.has(t), `star ${t}: zh differs from the vectors`);
});

test("en: decadeLuck, yearlyLuck, yearlyStars, findPatterns match the core functions and vectors", () => {
  for (const c of mau) {
    const ra = c.ra as R;
    const en = castZiWei(vao(c, "en"));
    const zh = castZiWei(vao(c, "zh"));
    const dv = decadeLuck(en);
    assert.equal(dv.length, ra.daiVan.length);
    dv.forEach((d, i) => {
      assert.equal(d.fromAge, ra.daiVan[i].tuTuoi);
      assert.equal(d.toAge, ra.daiVan[i].denTuoi);
      assert.equal(d.palace, ra.daiVan[i].tenCungEn);
      const ct = ra.daiVan[i].chinhTinh ? String(ra.daiVan[i].chinhTinh).split(", ") : [];
      assert.deepEqual(d.majorStars, ct.map((x: string) => starEn(x, CHINH_TINH_NAME_EN[x])));
      assert.equal(d.fromYear, en.lunar.year + d.fromAge - 1);
    });
    assert.deepEqual(decadeLuck(en.raw, { lang: "vi" }).map((d) => d.palace), daiVan(en.raw).map((d) => d.tenCung));
    const hn = ra.hanNam;
    const y = yearlyLuck(en);
    assert.equal(y.age, hn.tuoiMu);
    assert.equal(y.year, (c.vao as R).namXem);
    if (hn.luuNienTenCungEn) assert.equal(y.yearPalace.palace, hn.luuNienTenCungEn);
    assert.equal(y.minorLimit.index, hn.tieuVanViTri);
    assert.equal(y.decade?.fromAge ?? 0, hn.daiVanTuTuoi);
    const yz = yearlyLuck(zh);
    hn.luuTuHoa.forEach((t: R, i: number) => {
      if (t.saoZh) assert.equal(yz.transformations[i].star, t.saoZh);
      if (t.hoaZh) assert.equal(yz.transformations[i].type, t.hoaZh);
      assert.equal(yz.transformations[i].palaceIndex, t.coTrenLaSo ? t.viTri : null);
    });
    assert.deepEqual(y.months.map((m) => m.index), tinhHanNam(en.raw, hn.nam).nguyetHan.thang.map((m) => m.viTri));
    assert.deepEqual(yearlyStars(en).map((s) => [s.code, s.palaceIndex]), ra.saoLuu.map((s: R) => [YEARLY_STAR_CODE_EN[s.ma], s.viTri]));
    const cc = findPatterns(en);
    assert.deepEqual(cc.map((p) => p.nameVi), ra.cachCuc.map((p: R) => p.ten));
    assert.deepEqual(cc.map((p) => p.condition), nhanDienCachCuc(en.raw).map((p) => enText(p.dieuKienEn, "pinyin")));
    for (const p of cc) {
      assert.equal(p.name, PATTERN_EN[p.nameVi], p.nameVi);
      assert.doesNotMatch(p.condition + p.description, /[À-ỹ]/, p.nameVi);
    }
    assert.deepEqual(findPatterns(en, { terms: "vi" }).map((p) => p.name), ra.cachCuc.map((p: R) => p.ten));
  }
});

test("en: input errors say what to do", () => {
  assert.throws(() => castZiWei({ date: "1990-09-19", gender: "male" }), /pass time/);
  assert.throws(() => castZiWei({ date: "1990-09-19", time: "20:00", gender: "x" }), /gender must be/);
  assert.throws(() => castZiWei({ date: "1990-09-19", time: "20:00", hourBranch: 3, gender: "f" }), /branch 10/);
  assert.throws(() => castZiWei({ date: "1990-02-30", time: "20:00", gender: "f" }), /no such date/);
  assert.equal(castZiWei({ date: "1990-09-19", hourBranch: 10, gender: "f" }).time, null);
  assert.equal(parseGender("Nữ"), "female");
});

test("en: the Zi hour from 23:00 keeps the given date, with a note", () => {
  const a = castZiWei({ date: "1990-09-19", time: "23:30", gender: "male" });
  const b = castZiWei({ date: "1990-09-19", time: "00:10", gender: "male" });
  assert.equal(a.hour.index, 0);
  assert.deepEqual(a.raw, b.raw);
  assert.equal(a.lunar.day, 1);
  assert.equal(a.notes.length, 2);
  assert.match(a.notes[1], /Zi hour/);
  assert.match(castZiWei({ date: "1990-09-19", time: "23:30", gender: "male", terms: "vi" }).notes[1], /Tý hour/);
  assert.equal(localizeZiWei(a.raw, "zh").notes.length, 2);
});

test("en: terms changes stems, branches, Four Transformations, pattern names; full Chinese names", () => {
  const c = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
  const life = c.palaces[c.lifePalace];
  assert.equal(c.terms, "pinyin");
  assert.equal(life.stemBranch, "Ding Hai");
  assert.equal(life.stars[0].transformation, "Hua Ji");
  const han = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", terms: "han" });
  assert.equal(han.palaces[han.lifePalace].stemBranch, "丁亥");
  assert.equal(han.palaces[han.lifePalace].stars[0].transformation, "化忌");
  assert.equal(yearlyLuck(han).yearPillar, "丙午");
  const vi = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", terms: "vi" });
  assert.equal(vi.palaces[vi.lifePalace].stars[0].transformation, "Hóa Kỵ");
  assert.equal(decadeLuck(c, { terms: "vi" })[0].branch, decadeLuck(vi)[0].branch);
  const ta = findPatterns(c).find((p) => p.nameVi === "Tả Hữu đồng hội");
  assert.equal(ta?.nameHan, "左右同會");
  assert.equal(ta?.name, "Left and Right Assistants Meeting");
  assert.equal(findPatterns(c, { lang: "zh" }).find((p) => p.nameVi === "Tả Hữu đồng hội")?.name, "左右同会");
  assert.deepEqual(Object.keys(STAR_EN_FIX).sort(), ["Thiên Tướng", "Thiên Việt", "Đà La"].sort());
  assert.throws(() => castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", terms: "x" as never }), /terms must be/);
  // Lá số tiếng Trung in sang tiếng Anh: terms về mặc định, không mang "han" theo.
  const zh = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", lang: "zh" });
  assert.equal(decadeLuck(zh, { lang: "en" })[0].branch, decadeLuck(c)[0].branch);
});

test("en: ziWeiSvg and chart.toSvg draw renderChartSvg of the raw chart, in the chart's lang", async () => {
  const { renderChartSvg, ziWeiSvg } = await import("../src/index.ts");
  const c = castZiWei({ date: "1990-09-19", time: "20:00", gender: "male", lang: "zh" });
  assert.equal(c.toSvg(), renderChartSvg(c.raw, { lang: "zh" }));
  assert.equal(c.toSvg({ theme: "dark", lang: "en" }), renderChartSvg(c.raw, { lang: "en", theme: "dark" }));
  assert.equal(ziWeiSvg(c.raw, { width: 360 }), renderChartSvg(c.raw, { lang: "en", width: 360 }));
  assert.ok(!Object.keys(c).includes("toSvg"));
  assert.ok(!JSON.stringify(c).includes("toSvg"));
});

test("en: English output has no Vietnamese keys or codes (every tu-vi, bat-tu vector)", async () => {
  const { slugViet } = await import("../../../kiem/slug-viet.ts");
  const { castBaZi, minorLuck } = await import("@nhatnguyet/bat-tu");
  const { numerology } = await import("@nhatnguyet/than-so-hoc");
  const { toLunar, solarTerms } = await import("@nhatnguyet/am-lich");
  const loi: string[] = [];
  const ngay = (v: Record<string, number>) => `${String(v.yyyy).padStart(4, "0")}-${String(v.mm).padStart(2, "0")}-${String(v.dd).padStart(2, "0")}`;
  for (const c of docCaKiem("tu-vi").ca) {
    const v = c.vao as Record<string, number> & { gioiTinh: string };
    const ch = castZiWei({ date: ngay(v), hourBranch: v.gio, gender: v.gioiTinh === "Nữ" ? "female" : "male", viewYear: 2026 });
    slugViet({ ch, d: decadeLuck(ch), y: yearlyLuck(ch), s: yearlyStars(ch), p: findPatterns(ch) }, ngay(v), loi);
  }
  for (const c of docCaKiem("bat-tu").ca) {
    const v = c.vao as Record<string, number> & { gioiTinh: string };
    const ch = castBaZi({ date: ngay(v), time: v.gio === undefined ? null : `${v.gio}:${String(v.phut).padStart(2, "0")}`, gender: v.gioiTinh === "Nữ" ? "female" : "male" });
    slugViet({ ch, m: minorLuck(ch, 2026) }, ngay(v), loi);
  }
  for (let y = 1900; y <= 2100; y += 7) {
    slugViet({ l: toLunar(`${y}-02-03`), t: solarTerms(y), n: numerology({ name: "Nguyen Van An", birthDate: `${y}-02-03`, today: "2026-01-01" }) }, String(y), loi);
  }
  assert.deepEqual([...new Set(loi.map((x) => x.replace(/^[^.:= ]*/, "").replace(/\[\d+\]/g, "[]")))].slice(0, 20), []);
});

test("castZiWei: a birth date outside 1900 to 2100 throws a RangeError", () => {
  assert.throws(() => castZiWei({ date: "1899-12-31", time: "08:00", gender: "male" }), /date 1899-12-31 is outside the supported range: years 1900 to 2100/);
});

test("castZiWei: country and timeZone pick whose lunar calendar the chart is built on", async () => {
  const { astro } = await import("../src/iztro.ts");
  const vao = { date: "1985-01-21", time: "10:00", gender: "male" } as const;
  const vn = castZiWei(vao);
  // Mặc định là lịch Việt Nam, như trước; "VN" hay timeZone 7 ra đúng từng byte.
  assert.deepEqual(castZiWei({ ...vao, country: "VN" }), vn);
  assert.deepEqual(castZiWei({ ...vao, timeZone: 7 }), vn);
  assert.equal(vn.timeZone, undefined);
  assert.deepEqual(vn.lunar, { year: 1985, month: 1, day: 1, leap: false });
  // Lịch Trung Quốc (UTC+8): mùng 1 tháng Chạp năm Giáp Tý, Kim Tứ Cục, Mệnh ở Thân.
  const cn = castZiWei({ ...vao, country: "CN" });
  assert.deepEqual(cn.lunar, { year: 1984, month: 12, day: 1, leap: false });
  assert.equal(cn.timeZone, 8);
  assert.equal(cn.bureau.name, "Metal Four");
  assert.equal(cn.palaces[cn.lifePalace].branch, "Shen");
  assert.equal(cn.solarDate, "1985-01-21");
  assert.match(cn.notes[0], /lunar calendar of CN \(UTC\+8\)\.$/);
  assert.match(castZiWei({ ...vao, timeZone: 8 }).notes[0], /lunar calendar at UTC\+8\.$/);
  // Cùng lá số với lớp iztro ở country "CN" (giờ Tỵ là timeIndex 5 của iztro).
  const iz = astro.bySolar("1985-1-21", 5, "男", false, "en-US", { country: "CN" });
  assert.deepEqual(cn.raw.cung.map((c) => c.sao.map((s) => s.ten)), iz.raw.cung.map((c) => c.sao.map((s) => s.ten)));
  assert.throws(() => castZiWei({ ...vao, country: "XX" }), RangeError);
});
