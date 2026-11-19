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
import type { ZiWeiSchools } from "../src/index.ts";

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

test("tu-vi: every vector matches Go", () => {
  assert.equal(tep.ca.length, tep.soCa);
  const kq = kiemCa(tep, tinh);
  assert.ok(kq.tong > 0, "no vectors");
  assert.equal(kq.soLech, 0, baoCao("tu-vi", kq));
});

test("tu-vi: bad input throws where Go returns an error", () => {
  assert.throws(() => lapLaSoTuVi("", "Khác", 1, 1, 2000, 0));
  assert.throws(() => lapLaSoTuVi("", "Nam", 1, 1, 2000, 12));
  assert.throws(() => lapLaSoTuVi("", "Nữ", 1, 1, 2000, -1));
});

test("tu-vi: placing the Zi Wei star by bureau and day", () => {
  // Thủy Nhị Cục, mùng 1: Tử Vi ở Sửu; Hỏa Lục Cục, mùng 1: Tử Vi ở Dậu.
  assert.equal(viTriTuVi(2, 1), 1);
  assert.equal(viTriTuVi(6, 1), 9);
});

test("tu-vi: every name on every chart of the vectors has all three languages", () => {
  const dem: DemBaNgonNgu = { tong: 0, thieu: [] };
  for (const c of tep.ca) doBaNgonNgu(tinh(c.vao), dem);
  assert.ok(dem.tong > 0, "no names measured");
  assert.equal(dem.thieu.length, 0, tomTatThieu(dem));
});

// Lựa chọn phái (schools.ts): ca kiểm tu-vi-phai do bản Go sinh, giữ cả lời rào.
const tepPhai = docCaKiem("tu-vi-phai");

function tinhPhai(vao: Record<string, unknown>): unknown {
  const n = (k: string) => vao[k] as number;
  const laSo = lapLaSoTuVi("", vao.gioiTinh as string, n("dd"), n("mm"), n("yyyy"), n("gio"), vao.schools as ZiWeiSchools);
  return {
    laSo,
    daiVan: daiVan(laSo),
    hanNam: tinhHanNam(laSo, n("namXem")),
    saoLuu: tinhSaoLuu(laSo, n("namXem")),
    cachCuc: nhanDienCachCuc(laSo),
  };
}

test("tu-vi-phai: every school vector matches Go", () => {
  assert.equal(tepPhai.ca.length, tepPhai.soCa);
  const kq = kiemCa(tepPhai, tinhPhai);
  assert.equal(kq.soLech, 0, baoCao("tu-vi-phai", kq));
});

test("tu-vi-phai: defaults (absent, empty, explicit) give the old chart; unknown value throws", () => {
  const goc = JSON.stringify(lapLaSoTuVi("", "Nữ", 15, 8, 1993, 3));
  for (const s of [undefined, {}, { fireBell: "vietnamese", leapMonth: "whole", transformations: "vietnamese", heavenlyKitchen: "vietnamese", injuryMessenger: "standard" }] as ZiWeiSchools[]) {
    assert.equal(JSON.stringify(lapLaSoTuVi("", "Nữ", 15, 8, 1993, 3, s)), goc);
  }
  assert.throws(() => lapLaSoTuVi("", "Nam", 1, 1, 2000, 0, { fireBell: "tan-bien" } as never), /invalid fireBell/);
  assert.throws(() => lapLaSoTuVi("", "Nam", 1, 1, 2000, 0, { hoaLinh: "quanshu" } as never), /unknown school option/);
});

test("tu-vi-phai: Fire and Bell stars per school (1990-09-19, Xu hour)", () => {
  const viTri = (ls: ReturnType<typeof lapLaSoTuVi>, ten: string) => ls.cung.findIndex((c) => c.sao.some((s) => s.ten === ten));
  const ca: [string, ZiWeiSchools["fireBell"], number, number][] = [
    ["Nam", undefined, 11, 5], ["Nam", "quanshu", 11, 1], ["Nữ", undefined, 3, 1], ["Nữ", "quanshu", 11, 1],
    ["Nữ", "swap-for-female", 1, 11], ["Nữ", "swap-for-yin-male-yang-female", 1, 11], ["Nam", "swap-for-female", 11, 1],
  ];
  for (const [gt, fb, hoa, linh] of ca) {
    const ls = lapLaSoTuVi("", gt, 19, 9, 1990, 10, { fireBell: fb });
    assert.deepEqual([viTri(ls, "Hỏa Tinh"), viTri(ls, "Linh Tinh")], [hoa, linh], `${gt} ${fb}`);
  }
});
