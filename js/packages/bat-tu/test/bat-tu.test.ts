import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
import { doBaNgonNgu, tomTatThieu } from "../../../kiem/ba-ngon-ngu.ts";
import type { DemBaNgonNgu } from "../../../kiem/ba-ngon-ngu.ts";
import {
  LoiThieuGioiTinh,
  allNguyetLenh,
  allThapThan,
  lapLaSoBatTu,
  quanHeHaiCan,
  thapThanCuaCan,
  thienKhacDiaXung,
  tinhTieuVanBatTu,
} from "../src/index.ts";

const tep = docCaKiem("bat-tu");

function tinh(vao: Record<string, unknown>): unknown {
  const gio = typeof vao.gio === "number" ? vao.gio : null;
  let laSo;
  try {
    laSo = lapLaSoBatTu(vao.dd as number, vao.mm as number, vao.yyyy as number, gio, vao.phut as number, vao.gioiTinh as string);
  } catch (e) {
    if (e instanceof LoiThieuGioiTinh) return { loi: true };
    throw e;
  }
  const tieuVan = tinhTieuVanBatTu(laSo, vao.namXem as number);
  return tieuVan ? { laSo, tieuVan } : { laSo };
}

test("bat-tu: vectors with a birth time", () => {
  const kq = kiemCa(tep, tinh, { loc: (vao) => "gio" in vao });
  assert.ok(kq.tong > 0, "no vectors");
  assert.equal(kq.soLech, 0, baoCao("bat-tu có giờ", kq));
});

test("bat-tu: vectors without a birth time", () => {
  const kq = kiemCa(tep, tinh, { loc: (vao) => !("gio" in vao) });
  assert.ok(kq.tong > 0, "no vectors");
  assert.equal(kq.soLech, 0, baoCao("bat-tu không giờ", kq));
});

test("bat-tu: the two groups cover every vector of the file", () => {
  assert.equal(tep.ca.length, tep.soCa);
  const coGio = tep.ca.filter((c) => "gio" in c.vao).length;
  const khongGio = tep.ca.filter((c) => !("gio" in c.vao)).length;
  assert.equal(coGio + khongGio, tep.soCa);
});

test("bat-tu: an unknown gender throws, no guessing", () => {
  assert.throws(() => lapLaSoBatTu(1, 1, 2000, 8, 0, "khác"), LoiThieuGioiTinh);
  assert.equal(lapLaSoBatTu(1, 1, 2000, 8, 0, "female").gioiTinh, "Nữ");
});

test("bat-tu: no birth time means no hour pillar, life palace or minor luck", () => {
  const ls = lapLaSoBatTu(15, 6, 1990, null, 30, "Nam");
  assert.equal(ls.coGioSinh, false);
  assert.equal(ls.truGio, undefined);
  assert.equal(ls.menhCung, undefined);
  assert.equal(ls.gio, 12);
  assert.equal(ls.phut, 0);
  assert.equal(tinhTieuVanBatTu(ls, 2026), null);
});

test("bat-tu: ten gods, stem relations, month command", () => {
  assert.equal(allThapThan().length, 10);
  assert.equal(thapThanCuaCan("Giáp", "Canh")?.ten, "Thất Sát");
  assert.equal(thapThanCuaCan("Giáp", "Tân")?.tenZh, "正官");
  assert.equal(thapThanCuaCan("Giáp", "X"), null);
  assert.equal(quanHeHaiCan("Giáp", "Kỷ"), "ngu-hop");
  assert.equal(quanHeHaiCan("Giáp", "Mậu"), "khac");
  assert.equal(thienKhacDiaXung("Giáp", "Tý", "Canh", "Ngọ"), true);
  const nl = allNguyetLenh();
  assert.equal(nl.length, 12);
  assert.deepEqual([nl[0].chi, nl[0].tiet], ["Dần", "Lập Xuân"]);
});

test("bat-tu: the comparison catches a wrong answer", () => {
  const kq = kiemCa(
    tep,
    (vao) => {
      const ra = tinh(vao) as { laSo: { daiVan: { soNgay: number } } };
      ra.laSo.daiVan.soNgay += 0.01;
      return ra;
    },
    { loc: (vao) => vao.yyyy === 1900 },
  );
  assert.ok(kq.tong > 0);
  assert.equal(kq.dat, 0);
  assert.match(kq.loi[0], /ra\.laSo\.daiVan\.soNgay: expected/);
});

test("bat-tu: every name on every chart of the vectors has all three languages", () => {
  const dem: DemBaNgonNgu = { tong: 0, thieu: [] };
  for (const c of tep.ca) doBaNgonNgu(tinh(c.vao), dem);
  assert.ok(dem.tong > 0, "no names measured");
  assert.equal(dem.thieu.length, 0, tomTatThieu(dem));
});

// Lựa chọn phái (schools: ziHour): ca kiểm bat-tu-phai do bản Go sinh.
test("bat-tu-phai: every Zi-hour school vector matches Go", () => {
  const tepPhai = docCaKiem("bat-tu-phai");
  const kq = kiemCa(tepPhai, (vao) => {
    const gio = typeof vao.gio === "number" ? vao.gio : null;
    const laSo = lapLaSoBatTu(vao.dd as number, vao.mm as number, vao.yyyy as number, gio, vao.phut as number, vao.gioiTinh as string, vao.schools as never);
    const tieuVan = tinhTieuVanBatTu(laSo, vao.namXem as number);
    return tieuVan ? { laSo, tieuVan } : { laSo };
  });
  assert.equal(kq.tong, tepPhai.soCa);
  assert.equal(kq.soLech, 0, baoCao("bat-tu-phai", kq));
});

test("bat-tu-phai: 23:30 on 2024-01-01 as lunar-javascript (sect 1 and 2); default unchanged; unknown value throws", () => {
  const goc = lapLaSoBatTu(1, 1, 2024, 23, 30, "Nam");
  const moi = lapLaSoBatTu(1, 1, 2024, 23, 30, "Nam", { ziHour: "split-at-midnight" });
  assert.deepEqual([goc.truNgay.label, goc.truGio?.label], ["Ất Sửu", "Bính Tý"]);
  assert.deepEqual([moi.truNgay.label, moi.truGio?.label, moi.schools], ["Giáp Tý", "Bính Tý", { ziHour: "split-at-midnight" }]);
  assert.equal(JSON.stringify(lapLaSoBatTu(1, 1, 2024, 23, 30, "Nam", { ziHour: "next-day-from-23" })), JSON.stringify(goc));
  assert.throws(() => lapLaSoBatTu(1, 1, 2024, 23, 30, "Nam", { ziHour: "midnight" } as never), /invalid ziHour/);
});
