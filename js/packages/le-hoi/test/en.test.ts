// Kiểm lớp API tiếng Anh của le-hoi trên ca kiểm.
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import { festivals, leHoiTrongNam } from "../src/index.ts";

const tep = docCaKiem("le-hoi");

test("en: festivals returns the festivals of the vectors, sorted by date", () => {
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

test("en: names follow lang, lunar festivals give the lunar date", () => {
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

test("festivals: years outside 1900 to 2100 throw; scope is null when unclassified", () => {
  assert.throws(() => festivals(2300), /year 2300 is outside the supported range: years 1900 to 2100/);
  assert.throws(() => festivals(1899), RangeError);
  const ds = festivals(2027);
  assert.ok(ds.some((f) => f.scope === null));
  assert.ok(ds.every((f) => f.scope === null || ["national", "regional", "local", "representative"].includes(f.scope)));
  assert.ok(ds.filter((f) => f.scope === null).every((f) => f.raw.pham_vi === ""));
});
