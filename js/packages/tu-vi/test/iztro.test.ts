// Kiểm lớp tương thích iztro (@nhatnguyet/tu-vi/iztro) không cần iztro: khuôn
// dữ liệu, sao trùng lapLaSoTuVi, quy tắc fixLeap và giờ Tý muộn. Phép so thật
// với iztro nằm ở doi-chieu/iztro-tuong-thich.test.mjs (cần cài iztro).
import { test } from "node:test";
import assert from "node:assert/strict";
import { astro, bySolar, byLunar, IZTRO_LANGUAGES } from "../src/iztro.ts";
import { lapLaSoTuVi } from "../src/index.ts";

test("data shape as iztro FunctionalAstrolabe", () => {
  const a = astro.bySolar("1990-9-19", 10, "男", true, "zh-CN");
  assert.deepEqual(Object.keys(a).sort(), [
    "body", "chineseDate", "copyright", "earthlyBranchOfBodyPalace", "earthlyBranchOfSoulPalace", "fiveElementsClass", "gender",
    "lunarDate", "palaces", "rawDates", "sign", "solarDate", "soul", "time", "timeRange", "zodiac",
  ]);
  assert.equal(a.lunarDate, "一九九〇年八月初一");
  assert.equal(a.chineseDate, "庚午 乙酉 丁亥 庚戌");
  assert.equal(a.time, "戌时");
  assert.equal(a.sign, "处女座");
  assert.equal(a.zodiac, "马");
  assert.equal(a.fiveElementsClass, "土五局");
  assert.equal(a.earthlyBranchOfSoulPalace, "亥");
  assert.equal(a.soul, "巨门");
  assert.equal(a.body, "火星");
  assert.equal(a.palaces.length, 12);
  const menh = a.palaces.find((p) => p.name === "命宫")!;
  assert.equal(menh.index, 9);
  assert.equal(menh.earthlyBranch, "亥");
  assert.deepEqual(menh.majorStars, [{ name: "太阴", type: "major", scope: "origin", brightness: "庙", mutagen: "忌" }]);
  assert.deepEqual(menh.minorStars[0], { name: "左辅", type: "soft", scope: "origin", brightness: "", mutagen: "" });
  assert.deepEqual(menh.decadal, { range: [5, 14], heavenlyStem: "丁", earthlyBranch: "亥" });
  assert.deepEqual(menh.ages, [8, 20, 32, 44, 56, 68, 80, 92, 104, 116]);
  assert.equal("raw" in JSON.parse(JSON.stringify(a)), false, "raw stays out of JSON");
  assert.equal(a.raw.cuc, 5);
  const vi = bySolar("1990-9-19", 10, "男", true, "vi-VN");
  assert.equal(vi.lunarDate, "Âm lịch ngày 1 tháng 8 năm 1990");
  assert.equal(vi.chineseDate, "Canh Ngọ - Ất Dậu - Đinh Hợi - Canh Tuất");
  assert.equal(vi.palaces[9].name, "Mệnh");
  for (const l of IZTRO_LANGUAGES) assert.equal(bySolar("2000-8-16", 2, "女", true, l).palaces.length, 12);
});

test("stars equal lapLaSoTuVi (Vietnam time, non-leap month)", () => {
  for (const [ngay, gio, gioi] of [["1990-9-19", 10, "Nam"], ["1985-1-21", 5, "Nữ"], ["2007-2-17", 6, "Nam"], ["1968-1-29", 0, "Nữ"]] as const) {
    const [y, m, d] = ngay.split("-").map(Number);
    const goc = lapLaSoTuVi("", gioi, d, m, y, gio);
    const a = bySolar(ngay, gio, gioi === "Nam" ? "男" : "女", true, "vi-VN");
    for (const p of a.palaces) {
      const c = goc.cung[(p.index + 2) % 12];
      assert.deepEqual(p.majorStars.map((s) => s.name).sort(), c.sao.filter((s) => s.loai === "chinh-tinh").map((s) => s.ten).sort());
    }
    assert.equal(a.raw.cungMenh, goc.cungMenh);
  }
});

test("fixLeap as iztro: the second half of a leap month counts as the next month", () => {
  // 2023-04-12 giờ Việt Nam là 22 tháng 2 nhuận.
  const sau = bySolar("2023-4-12", 3, "男", true, "zh-CN");
  const caThang = bySolar("2023-4-12", 3, "男", false, "zh-CN");
  assert.deepEqual(sau.rawDates.lunarDate, { lunarYear: 2023, lunarMonth: 2, lunarDay: 22, isLeap: true });
  assert.equal(sau.lunarDate, "二〇二三年闰二月廿二");
  const goc2 = lapLaSoTuVi("", "Nam", 12, 4, 2023, 3);
  assert.equal(caThang.raw.cungMenh, goc2.cungMenh, "fixLeap false is the engine rule");
  assert.notEqual(sau.raw.cungMenh, goc2.cungMenh, "fixLeap true moves to month 3");
  assert.equal(sau.raw.ngaySinhAm.leap, true);
  // Nửa đầu tháng nhuận: hai cách như nhau.
  assert.equal(bySolar("2023-3-25", 3, "男", true).raw.cungMenh, bySolar("2023-3-25", 3, "男", false).raw.cungMenh);
});

test("late Zi hour (12) is the Zi hour of the next day; another country changes the calendar", () => {
  const muon = bySolar("1999-12-31", 12, "女");
  const som = bySolar("2000-1-1", 0, "女");
  assert.equal(muon.time, "晚子时");
  assert.equal(muon.timeRange, "23:00~00:00");
  assert.deepEqual(muon.rawDates, som.rawDates);
  assert.equal(muon.solarDate, "1999-12-31");
  const cn = bySolar("1985-1-21", 5, "男", true, "zh-CN", { country: "CN" });
  assert.equal(cn.lunarDate, "一九八四年腊月初一");
  assert.equal(cn.calendar.timeZone, 8);
  assert.equal(bySolar("1985-1-21", 5, "男").lunarDate, "一九八五年正月初一");
  assert.equal(byLunar("2023-2-22", 3, "男", true).solarDate, "2023-4-12");
  assert.throws(() => bySolar("1990-2-30", 1, "男"), /invalid date/);
  assert.throws(() => bySolar("1990-2-3", 13, "男"), /timeIndex/);
  assert.throws(() => bySolar("1990-2-3", 1, "X"), /gender/);
});
