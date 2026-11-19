import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
import { doBaNgonNgu, tomTatThieu } from "../../../kiem/ba-ngon-ngu.ts";
import type { DemBaNgonNgu } from "../../../kiem/ba-ngon-ngu.ts";
import {
  daiVan,
  lapLaSoTuVi,
  nhanDienCachCuc,
  tinhHanNam,
  tinhSaoLuu,
  viTriTuVi,
} from "../src/index.ts";

const tep = docCaKiem("tu-vi");

function tinh(vao: Record<string, unknown>): unknown {
  const n = (k: string) => vao[k] as number;
  let laSo;
  try {
    laSo = lapLaSoTuVi("", vao.gioiTinh as string, n("dd"), n("mm"), n("yyyy"), n("gio"));
  } catch {
    return { loi: true };
  }
  return {
    laSo,
    daiVan: daiVan(laSo),
    hanNam: tinhHanNam(laSo, n("namXem")),
    saoLuu: tinhSaoLuu(laSo, n("namXem")),
    cachCuc: nhanDienCachCuc(laSo),
  };
}

test("tu-vi: mọi ca kiểm khớp bản Go", () => {
  assert.equal(tep.ca.length, tep.soCa);
  const kq = kiemCa(tep, tinh);
  assert.ok(kq.tong > 0, "không có ca nào");
  assert.equal(kq.soLech, 0, baoCao("tu-vi", kq));
});

test("tu-vi: đầu vào sai ném lỗi như bản Go trả error", () => {
  assert.throws(() => lapLaSoTuVi("", "Khác", 1, 1, 2000, 0));
  assert.throws(() => lapLaSoTuVi("", "Nam", 1, 1, 2000, 12));
  assert.throws(() => lapLaSoTuVi("", "Nữ", 1, 1, 2000, -1));
});

test("tu-vi: an Tử Vi theo cục và ngày", () => {
  // Thủy Nhị Cục, mùng 1: Tử Vi ở Sửu; Hỏa Lục Cục, mùng 1: Tử Vi ở Dậu.
  assert.equal(viTriTuVi(2, 1), 1);
  assert.equal(viTriTuVi(6, 1), 9);
});

test("tu-vi: mọi tên trên mọi lá của ca kiểm có đủ ba thứ tiếng", () => {
  const dem: DemBaNgonNgu = { tong: 0, thieu: [] };
  for (const c of tep.ca) doBaNgonNgu(tinh(c.vao), dem);
  assert.ok(dem.tong > 0, "không đo được tên nào");
  assert.equal(dem.thieu.length, 0, tomTatThieu(dem));
});
