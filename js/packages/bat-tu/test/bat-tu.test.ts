import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
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

test("bat-tu: ca có giờ sinh", () => {
  const kq = kiemCa(tep, tinh, { loc: (vao) => "gio" in vao });
  assert.ok(kq.tong > 0, "không có ca nào");
  assert.equal(kq.soLech, 0, baoCao("bat-tu có giờ", kq));
});

test("bat-tu: ca không biết giờ sinh", () => {
  const kq = kiemCa(tep, tinh, { loc: (vao) => !("gio" in vao) });
  assert.ok(kq.tong > 0, "không có ca nào");
  assert.equal(kq.soLech, 0, baoCao("bat-tu không giờ", kq));
});

test("bat-tu: hai nhóm phủ đủ mọi ca của tệp", () => {
  assert.equal(tep.ca.length, tep.soCa);
  const coGio = tep.ca.filter((c) => "gio" in c.vao).length;
  const khongGio = tep.ca.filter((c) => !("gio" in c.vao)).length;
  assert.equal(coGio + khongGio, tep.soCa);
});

test("bat-tu: giới tính lạ thì báo lỗi, không đoán", () => {
  assert.throws(() => lapLaSoBatTu(1, 1, 2000, 8, 0, "khác"), LoiThieuGioiTinh);
  assert.equal(lapLaSoBatTu(1, 1, 2000, 8, 0, "female").gioiTinh, "Nữ");
});

test("bat-tu: không giờ sinh thì không trụ giờ, không mệnh cung, không tiểu vận", () => {
  const ls = lapLaSoBatTu(15, 6, 1990, null, 30, "Nam");
  assert.equal(ls.coGioSinh, false);
  assert.equal(ls.truGio, undefined);
  assert.equal(ls.menhCung, undefined);
  assert.equal(ls.gio, 12);
  assert.equal(ls.phut, 0);
  assert.equal(tinhTieuVanBatTu(ls, 2026), null);
});

test("bat-tu: thập thần, quan hệ can, nguyệt lệnh", () => {
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

test("bat-tu: phép so bắt được đáp án sai", () => {
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
  assert.match(kq.loi[0], /ra\.laSo\.daiVan\.soNgay: mong/);
});
