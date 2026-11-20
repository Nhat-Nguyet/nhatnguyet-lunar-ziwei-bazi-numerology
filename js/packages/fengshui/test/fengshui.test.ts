// Lớp lõi chuyển ngữ khớp MỌI ca của ca-kiem/fengshui.json (lõi Go).
import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
import { tinhCaKiem } from "../src/ca-kiem.ts";

const tep = docCaKiem("fengshui");

test("fengshui: every Go vector", () => {
  const kq = kiemCa(tep, tinhCaKiem, { toiDaIn: 8 });
  assert.equal(kq.tong, tep.soCa);
  assert.equal(kq.soLech, 0, baoCao("fengshui", kq));
});

for (const phep of ["cung-phi", "son-theo-do", "trach", "tinh-ban", "van", "phi-tinh-nam", "lo-ban"]) {
  test(`fengshui: ${phep} vectors exist`, () => {
    assert.ok(tep.ca.some((c) => c.vao.phep === phep));
  });
}
