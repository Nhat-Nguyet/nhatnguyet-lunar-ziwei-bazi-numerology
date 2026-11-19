import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
import {
  dayCanChi,
  lunarMonthCanChi,
  lunarToSolar,
  mocTietKhiTrongNam,
  saoCuaNgay,
  solarToLunar,
  tietKhiCuaNgay,
  yearCanChi,
} from "../src/index.ts";

const tep = docCaKiem("am-lich");

function tinh(vao: Record<string, unknown>): unknown {
  const n = (k: string) => vao[k] as number;
  switch (vao.phep) {
    case "duong-sang-am": {
      if (vao.muiGio !== undefined) return { am: solarToLunar(n("dd"), n("mm"), n("yyyy"), n("muiGio")) };
      const am = solarToLunar(n("dd"), n("mm"), n("yyyy"), 7);
      return {
        am,
        canChiNgay: dayCanChi(n("dd"), n("mm"), n("yyyy")),
        canChiThang: lunarMonthCanChi(am.month, am.year),
        canChiNam: yearCanChi(am.year),
        tietKhi: tietKhiCuaNgay(n("dd"), n("mm"), n("yyyy")).ten,
        saoNhiThapBatTu: saoCuaNgay(n("dd"), n("mm"), n("yyyy")).ten,
      };
    }
    case "am-sang-duong":
      return lunarToSolar(n("ngay"), n("thang"), n("nam"), vao.nhuan as boolean, (vao.muiGio as number | undefined) ?? 7);
    case "moc-tiet-khi":
      return mocTietKhiTrongNam(n("nam"));
  }
  throw new Error("phép lạ: " + String(vao.phep));
}

for (const phep of ["duong-sang-am", "am-sang-duong", "moc-tiet-khi"]) {
  test(`am-lich: ${phep}`, () => {
    const kq = kiemCa(tep, tinh, { loc: (vao) => vao.phep === phep });
    assert.ok(kq.tong > 0, "no vectors");
    assert.equal(kq.soLech, 0, baoCao(`am-lich ${phep}`, kq));
  });
}

test("am-lich: the three operations cover every vector of the file", () => {
  const phep = new Set(["duong-sang-am", "am-sang-duong", "moc-tiet-khi"]);
  assert.equal(tep.ca.length, tep.soCa);
  assert.ok(tep.ca.every((c) => phep.has(c.vao.phep as string)));
});
