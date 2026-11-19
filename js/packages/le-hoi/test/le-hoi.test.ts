import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
import { leHoiTrongNam, leHoiTheoNgay } from "../src/index.ts";

const tep = docCaKiem("le-hoi");

test("le-hoi: ngày dương của lễ âm và dương lịch, 1900 tới 2100", () => {
  const kq = kiemCa(tep, (vao) => {
    const r = leHoiTrongNam(vao.nam as number);
    return r.length ? r : null;
  });
  baoCao("le-hoi", kq);
  assert.equal(kq.dat, kq.tong);
});

test("le-hoi: tra theo ngày ra Tết Nguyên Đán 2026", () => {
  assert.ok(leHoiTheoNgay(17, 2, 2026).some((le) => le.id === "tet-nguyen-dan"));
});
