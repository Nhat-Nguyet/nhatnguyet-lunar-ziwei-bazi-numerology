// Kiểm lớp API tiếng Anh của am-lich: đối chiếu với hàm tiếng Việt và ca kiểm.
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import {
  auspiciousHours,
  chiGioTuGioDongHo,
  convertTerms,
  dayPillar,
  hourBranch,
  lunarToSolar,
  mocTietKhiTrongNam,
  parseDate,
  parseTime,
  solarTermNames,
  solarTermOn,
  solarTerms,
  solarToLunar,
  stemBranchName,
  term,
  termName,
  transformationShort,
  toLunar,
  toSolar,
  yearPillar,
} from "../src/index.ts";

const tep = docCaKiem("am-lich");
type V = Record<string, number | boolean | string>;

test("en: toLunar matches the duong-sang-am vectors (other time zones too)", () => {
  let n = 0;
  let kiem = 0;
  for (const c of tep.ca) {
    const v = c.vao as V;
    if (v.phep !== "duong-sang-am" || n++ % 5) continue;
    const ra = c.ra as { am: object; canChiNam?: { label: string }; canChiThang?: { label: string }; canChiNgay?: { label: string } };
    const opts = v.muiGio !== undefined ? { timeZone: v.muiGio as number, lang: "vi" as const } : { lang: "vi" as const };
    const r = toLunar({ year: v.yyyy as number, month: v.mm as number, day: v.dd as number }, opts);
    assert.deepEqual({ day: r.day, leap: r.leap, month: r.month, year: r.year }, ra.am);
    if (ra.canChiNam) {
      assert.equal(r.yearName, ra.canChiNam.label);
      assert.equal(r.monthName, ra.canChiThang?.label);
      assert.equal(r.dayName, ra.canChiNgay?.label);
    }
    kiem++;
  }
  assert.ok(kiem > 2000, "quá ít ca: " + kiem);
});

test("en: toSolar matches lunarToSolar on the am-sang-duong vectors", () => {
  let kiem = 0;
  for (const c of tep.ca) {
    const v = c.vao as V;
    if (v.phep !== "am-sang-duong") continue;
    const ra = c.ra as { duong: { day: number; month: number; year: number }; hopLe: boolean };
    const tz = (v.muiGio as number | undefined) ?? 7;
    const vao = { year: v.nam as number, month: v.thang as number, day: v.ngay as number, leap: v.nhuan as boolean };
    if (!ra.hopLe) {
      assert.throws(() => toSolar(vao, { timeZone: tz }), RangeError);
      continue;
    }
    const l = solarToLunar(ra.duong.day, ra.duong.month, ra.duong.year, tz);
    const ton = l.day === vao.day && l.month === vao.month && l.year === vao.year && l.leap === vao.leap;
    if (ton) {
      const r = toSolar(vao, { timeZone: tz });
      assert.deepEqual({ day: r.day, month: r.month, year: r.year }, ra.duong);
      kiem++;
    } else {
      // Ngày 30 của tháng thiếu: hàm gốc trả mùng 1 tháng sau, API tiếng Anh báo lỗi.
      assert.throws(() => toSolar(vao, { timeZone: tz }), vao.leap ? /29 days|has no leap month/ : /29 days/);
    }
  }
  assert.ok(kiem > 1500, "quá ít ca: " + kiem);
});

test("en: solarTerms matches the moc-tiet-khi vectors, CN shifted by exactly one hour", () => {
  let kiem = 0;
  for (const c of tep.ca) {
    const v = c.vao as V;
    if (v.phep !== "moc-tiet-khi" || (v.nam as number) % 9) continue;
    const ra = c.ra as { index: number; ten: string; tenEn: string; ngay: { day: number; month: number; year: number }; gio: number; phut: number }[];
    const vi = solarTerms(v.nam as number, { lang: "vi" });
    const en = solarTerms(v.nam as number);
    const cn = solarTerms(v.nam as number, { country: "CN" });
    assert.equal(vi.length, ra.length);
    ra.forEach((m, i) => {
      const p = (n: number) => String(n).padStart(2, "0");
      assert.equal(vi[i].date, `${m.ngay.year}-${p(m.ngay.month)}-${p(m.ngay.day)}`);
      assert.equal(vi[i].time, `${p(m.gio)}:${p(m.phut)}`);
      assert.equal(vi[i].name, m.ten);
      assert.equal(en[i].name, m.tenEn);
      assert.equal(vi[i].index, m.index);
      const phut = (t: { date: string; time: string }) => Date.parse(t.date + "T" + t.time + ":00Z") / 60000;
      assert.equal(phut(cn[i]) - phut(vi[i]), 60);
    });
    kiem++;
  }
  assert.ok(kiem >= 20);
});

test("en: a country is a time zone (Tết 1985 differs between Vietnam and China)", () => {
  assert.deepEqual(toLunar("1985-01-21"), { ...toLunar("1985-01-21") });
  const vn = toLunar("1985-01-21");
  const cn = toLunar("1985-01-21", { country: "CN" });
  assert.deepEqual([vn.month, vn.day], [1, 1]);
  const goc = solarToLunar(21, 1, 1985, 8);
  assert.deepEqual([cn.year, cn.month, cn.day, cn.leap], [goc.year, goc.month, goc.day, goc.leap]);
  assert.equal(toLunar("2027-02-06", { country: "kr" }).timeZone, 9);
  assert.throws(() => toLunar("2027-02-06", { country: "TH" }), /unsupported country/);
  assert.equal(toLunar("2023-02-01").zodiac, "Cat");
  assert.equal(toLunar("2023-02-01", { country: "CN" }).zodiac, "Rabbit");
  assert.equal(toLunar("2023-02-01", { country: "CN", lang: "zh" }).zodiac, "兔");
  assert.equal(toLunar("2023-02-01", { lang: "zh" }).zodiac, "猫");
});

test("en: toSolar rejects a missing leap month and returns a real one", () => {
  // 2023 nhuận tháng 2 ở Việt Nam.
  const r = toSolar({ year: 2023, month: 2, day: 1, leap: true });
  const g = lunarToSolar(1, 2, 2023, true, 7);
  assert.equal(r.date, `${g.duong.year}-0${g.duong.month}-${String(g.duong.day).padStart(2, "0")}`);
  assert.throws(() => toSolar({ year: 2023, month: 5, day: 1, leap: true }), /leap month/);
  assert.throws(() => toSolar({ year: 2023, month: 13, day: 1 }), RangeError);
});

test("en: parsing dates and times", () => {
  assert.deepEqual(parseDate("1990-09-19"), { year: 1990, month: 9, day: 19 });
  assert.deepEqual(parseDate({ year: 1990, month: 9, day: 19 }), { year: 1990, month: 9, day: 19 });
  assert.deepEqual(parseDate(new Date(1990, 8, 19, 23, 0)), { year: 1990, month: 9, day: 19 });
  assert.throws(() => parseDate("2023-02-29"), /no such date/);
  assert.throws(() => parseDate("19/09/1990"), /YYYY-MM-DD/);
  assert.throws(() => parseDate(19900919 as unknown as string), TypeError);
  assert.deepEqual(parseTime("8:05"), { hour: 8, minute: 5 });
  assert.deepEqual(parseTime(20), { hour: 20, minute: 0 });
  assert.equal(parseTime(null), null);
  assert.throws(() => parseTime("24:00"), RangeError);
  assert.throws(() => parseTime("8h"), RangeError);
});

test("en: hourBranch uses chiGioTuGioDongHo, the Zi hour from 23:00", () => {
  for (let h = 0; h < 24; h++) assert.equal(hourBranch(h).index, chiGioTuGioDongHo(h));
  assert.deepEqual(hourBranch("23:30"), { index: 0, name: "Zi", animal: "Rat", range: "23:00-00:59" });
  assert.equal(hourBranch("23:30", "en", "vi").name, "Tý");
  assert.equal(hourBranch("23:30", "en", "han").name, "子");
  assert.equal(hourBranch("23:30", "vi", "pinyin").name, "Tý");
  assert.deepEqual(hourBranch("20:00", "zh"), { index: 10, name: "戌", animal: "狗", range: "19:00-20:59" });
});

test("en: day and year pillars, stem-branch names in three languages", () => {
  const d = dayPillar("1990-09-19", { lang: "zh" });
  assert.equal(d.label, "丁亥");
  assert.equal(d.naYin, "屋上土");
  assert.equal(yearPillar(2026).label, "Bing Wu");
  assert.equal(yearPillar(2026, { terms: "han" }).stem, "丙");
  assert.equal(yearPillar(2026, { terms: "vi" }).label, "Bính Ngọ");
  assert.equal(yearPillar(2026, { lang: "zh" }).label, "丙午");
  assert.equal(stemBranchName("Bính Ngọ", "en"), "Bing Wu");
  assert.equal(stemBranchName("Bính Ngọ", "en", "han"), "丙午");
  assert.equal(stemBranchName("Bính Ngọ", "en", "vi"), "Bính Ngọ");
  assert.equal(stemBranchName("Bính Ngọ", "vi", "pinyin"), "Bính Ngọ");
  assert.equal(termName("Hóa Kỵ", "en"), "Hua Ji");
  assert.equal(termName("Hóa Kỵ", "en", "han"), "化忌");
  assert.equal(transformationShort("Hóa Lộc", "en"), "Lu");
  assert.equal(convertTerms("From Đại Tuyết (stem Kỷ) to Canh Ngọ.", "pinyin"), "From Major Snow (stem Ji) to Geng Wu.");
  assert.equal(convertTerms("From Đại Tuyết (stem Kỷ) to Canh Ngọ.", "han"), "From Major Snow (stem 己) to 庚午.");
  assert.equal(toLunar("2027-02-06", { terms: "han" }).yearName, "丁未");
  assert.throws(() => toLunar("2027-02-06", { terms: "latin" as never }), /terms must be/);
  assert.equal(term("Mộc", "en"), "Wood");
  assert.equal(term("không có", "zh"), "không có");
  assert.equal(solarTermNames({ lang: "zh" })[0].name, "立春");
  const on = solarTermOn("2027-02-04");
  assert.equal(on.current.nameVi, "Lập Xuân");
  assert.equal(on.next.nameVi, "Vũ Thủy");
  // Mọi tên tiết khí có bản tiếng Trung, không rơi về tiếng Anh.
  for (const t of mocTietKhiTrongNam(2026)) assert.match(term(t.ten, "zh"), /^[一-鿿]+$/);
});

test("English API: years outside 1900 to 2100 throw a RangeError naming the range", () => {
  const msg = /outside the supported range: years 1900 to 2100/;
  assert.throws(() => toLunar("2200-01-01"), msg);
  assert.throws(() => toLunar("1899-12-31"), msg);
  assert.throws(() => toSolar({ year: 2101, month: 1, day: 1 }), msg);
  assert.throws(() => solarTerms(1899), msg);
  assert.throws(() => solarTermOn("2101-01-01"), msg);
  assert.throws(() => auspiciousHours("2200-01-01"), msg);
  // The ends of the range still work, including the solar term of 1 January 1900.
  assert.equal(toLunar("1900-01-01").solarTerm, "Winter Solstice");
  assert.equal(toLunar("2100-12-31").solarTerm, "Winter Solstice");
  assert.equal(solarTerms(1900).length, 24);
  assert.equal(solarTerms(2100).length, 24);
});

test("toSolar: a missing leap month names the year's real leap month", () => {
  assert.throws(() => toSolar({ year: 2024, month: 2, day: 1, leap: true }), /2024 has no leap month 2; the lunar year 2024 has no leap month/);
  assert.throws(() => toSolar({ year: 2025, month: 2, day: 1, leap: true }), /2025 has no leap month 2; the leap month of 2025 is month 6/);
  assert.equal(toSolar({ year: 2025, month: 6, day: 1, leap: true }).date, "2025-07-25");
});
