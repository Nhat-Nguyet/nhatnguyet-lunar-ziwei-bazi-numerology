// Kiểm lớp API tiếng Anh của than-so-hoc trên mọi ca kiểm.
import { test } from "node:test";
import assert from "node:assert/strict";
import { docCaKiem } from "../../../kiem/so-sanh.ts";
import { NUMEROLOGY_LABELS, numerology, tinhHoSoThanSoHocSau } from "../src/index.ts";

const tep = docCaKiem("than-so-hoc");
type R = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

test("en: numerology khớp mọi ca kiểm", () => {
  for (const c of tep.ca) {
    const v = c.vao as R;
    const ra = c.ra as R;
    const r = numerology({ name: v.hoTen, birthDate: { year: v.yyyy, month: v.mm, day: v.dd }, today: { year: v.namXem, month: v.thangXem, day: v.ngayXem } });
    assert.deepEqual(r.raw, tinhHoSoThanSoHocSau(v.hoTen, v.dd, v.mm, v.yyyy, v.namXem, v.thangXem, v.ngayXem));
    assert.equal(r.lifePath, ra.soDuongDoi);
    assert.equal(r.expression, ra.soSuMenh);
    assert.equal(r.soulUrge, ra.soLinhHon);
    assert.equal(r.personality, ra.soNhanCach);
    assert.equal(r.attitude, ra.soThaiDo);
    assert.equal(r.maturity, ra.soTruongThanh);
    assert.equal(r.personalYear, ra.soNamCaNhan);
    assert.equal(r.personalMonth, ra.soThangCaNhan);
    assert.equal(r.personalDay, ra.soNgayCaNhan);
    assert.deepEqual(r.grid, ra.luoiPythago);
    assert.deepEqual(r.pinnacles.map((p) => p.number), [ra.soDinhCao.dinh1, ra.soDinhCao.dinh2, ra.soDinhCao.dinh3, ra.soDinhCao.dinh4]);
    assert.equal(r.pinnacles[0].toAge, ra.soDinhCao.tuoiKetThucDinh1);
    assert.deepEqual(r.challenges, [ra.soThachThuc.thachThuc1, ra.soThachThuc.thachThuc2, ra.soThachThuc.thachThuc3, ra.soThachThuc.thachThuc4]);
    assert.equal(r.karmicDebt, ra.soNoNghiepNgaySinh ?? null);
  }
});

test("en: ngày dạng chuỗi, nhãn ba thứ tiếng, lỗi đầu vào", () => {
  const a = numerology({ name: "Nguyễn Văn An", birthDate: "1990-09-19", today: "2026-11-19", lang: "zh" });
  assert.equal(a.birthDate, "1990-09-19");
  assert.equal(a.labels.lifePath, "生命灵数");
  for (const l of ["vi", "en", "zh"] as const) assert.deepEqual(Object.keys(NUMEROLOGY_LABELS[l]).sort(), Object.keys(NUMEROLOGY_LABELS.en).sort());
  assert.throws(() => numerology({ name: "", birthDate: "1990-09-19" }), /name/);
  assert.throws(() => numerology({ name: "An", birthDate: "1990-02-30" }), /no such date/);
  assert.throws(() => numerology({ name: "An", birthDate: "1990-09-19", lang: "fr" as "en" }), /lang/);
});

test("en: numerologySvg và result.toSvg vẽ đúng renderNumerologySvg", async () => {
  const { numerologySvg, renderNumerologySvg } = await import("../src/index.ts");
  const r = numerology({ name: "Nguyen Van An", birthDate: "1990-09-19", today: "2026-11-19", lang: "zh" });
  const goc = renderNumerologySvg({ hoTen: "Nguyen Van An", dd: 19, mm: 9, yyyy: 1990, namXem: 2026 }, { lang: "zh" });
  assert.equal(r.toSvg(), goc);
  assert.equal(numerologySvg(r, { theme: "dark", lang: "en" }), renderNumerologySvg({ hoTen: "Nguyen Van An", dd: 19, mm: 9, yyyy: 1990, namXem: 2026 }, { lang: "en", theme: "dark" }));
  assert.ok(!Object.keys(r).includes("toSvg"));
});
