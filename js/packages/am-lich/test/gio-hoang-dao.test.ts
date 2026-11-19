// Giờ hoàng đạo: hàm lõi khớp ca kiểm auspicious-hours.json của lõi Go, và lớp
// tiếng Anh auspiciousHours chỉ đổi cách viết của chính kết quả ấy.
import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
import { gioHoangDaoKemThan } from "../src/gio-hoang-dao.ts";
import { AUSPICIOUS_SPIRITS, auspiciousHours } from "../src/index.ts";

const tep = docCaKiem("auspicious-hours");
const n = (v: Record<string, unknown>, k: string) => v[k] as number;

test("auspicious-hours: every vector matches the Go engine", () => {
  const kq = kiemCa(tep, (v) => gioHoangDaoKemThan(n(v, "dd"), n(v, "mm"), n(v, "yyyy")));
  assert.equal(kq.tong, tep.soCa);
  assert.equal(kq.soLech, 0, baoCao("auspicious-hours", kq));
});

test("auspiciousHours: same flags and spirits as the core function in all three languages", () => {
  for (const c of tep.ca.slice(0, 200)) {
    const v = c.vao;
    const ra = c.ra as { canChiNgay: string; canChiNgayZh: string; gio: { chi: string; hoangDao: boolean; than: string; thanZh: string; thuTuThan: number }[] };
    const date = { year: n(v, "yyyy"), month: n(v, "mm"), day: n(v, "dd") };
    const vi = auspiciousHours(date, { lang: "vi" });
    const zh = auspiciousHours(date, { lang: "zh" });
    assert.equal(vi.day, ra.canChiNgay);
    assert.equal(zh.day, ra.canChiNgayZh);
    ra.gio.forEach((g, i) => {
      assert.equal(vi.hours[i].branch, g.chi);
      assert.equal(vi.hours[i].auspicious, g.hoangDao);
      assert.equal(vi.hours[i].spirit, g.than);
      assert.equal(zh.hours[i].spirit, g.thanZh);
      assert.equal(vi.hours[i].spiritIndex, g.thuTuThan);
      assert.equal(vi.hours[i].auspicious, AUSPICIOUS_SPIRITS.includes(g.thuTuThan));
    });
  }
});

test("auspiciousHours: 2027-02-06 in English", () => {
  const r = auspiciousHours("2027-02-06");
  assert.equal(r.date, "2027-02-06");
  assert.equal(r.day, "Bing Chen");
  assert.equal(r.dayBranch, "Chen");
  assert.deepEqual(r.hours[0], { index: 0, branch: "Zi", animal: "Rat", range: "23:00-00:59", auspicious: false, spirit: "Tian Lao", spiritIndex: 8 });
  assert.deepEqual(
    r.hours.filter((h) => h.auspicious).map((h) => `${h.branch} ${h.range} ${h.spirit}`),
    ["Yin 03:00-04:59 Si Ming", "Chen 07:00-08:59 Qing Long", "Si 09:00-10:59 Ming Tang", "Shen 15:00-16:59 Jin Kui", "You 17:00-18:59 Bao Guang", "Hai 21:00-22:59 Yu Tang"],
  );
  assert.equal(auspiciousHours("2027-02-06", { terms: "han" }).hours[4].spirit, "青龙");
  assert.equal(auspiciousHours("2027-02-06", { terms: "vi" }).hours[4].spirit, "Thanh Long");
  assert.equal(auspiciousHours("2027-02-06", { lang: "vi" }).hours[3].animal, "Mèo");
  assert.throws(() => auspiciousHours("2027-02-30"), RangeError);
  assert.throws(() => auspiciousHours("2027-02-06", { lang: "fr" as never }), TypeError);
});
