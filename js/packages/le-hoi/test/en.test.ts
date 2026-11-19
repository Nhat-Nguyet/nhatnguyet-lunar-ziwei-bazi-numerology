// Kiểm lớp API tiếng Anh của le-hoi trên ca kiểm.
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import { festivals, leHoiTrongNam } from "../src/index.ts";

const tep = docCaKiem("le-hoi");

test("en: festivals ra đúng tập lễ của ca kiểm, xếp theo ngày", () => {
  for (const c of tep.ca.filter((_, i) => i % 5 === 0)) {
    const nam = (c.vao as { nam: number }).nam;
    const ra = (c.ra ?? []) as { id: string; ngay: string }[];
    const f = festivals(nam, { lang: "vi" });
    const khoa = (x: { id: string; ngay: string }) => x.ngay + " " + x.id;
    assert.deepEqual(f.map((x) => khoa({ id: x.id, ngay: x.date })).sort(), ra.map(khoa).sort());
    for (let i = 1; i < f.length; i++) assert.ok(f[i - 1].date <= f[i].date);
    assert.equal(f.length, leHoiTrongNam(nam).length);
  }
});

test("en: tên theo lang, lễ âm lịch ghi ngày âm", () => {
  const en = festivals(2027);
  const tet = en.find((x) => x.id === "tet-nguyen-dan");
  assert.ok(tet);
  assert.equal(tet.date, "2027-02-06");
  assert.equal(tet.calendar, "lunar");
  assert.equal(tet.fixedDate, "1/1");
  assert.equal(tet.name, tet.raw.ten_en);
  assert.equal(festivals(2027, { lang: "zh" }).find((x) => x.id === "tet-nguyen-dan")?.name, tet.raw.ten_zh);
  assert.throws(() => festivals(2027.5), /integer/);
});
