import { test } from "node:test";
import assert from "node:assert/strict";
import { baoCao, docCaKiem, kiemCa } from "../../../kiem/so-sanh.ts";
import { foldVietnamese, slugify, stripDiacritics, tinhHoSoThanSoHocSau } from "../src/index.ts";

const tep = docCaKiem("than-so-hoc");

test("than-so-hoc: mọi ca kiểm của bản Go", () => {
  const kq = kiemCa(tep, (vao) =>
    tinhHoSoThanSoHocSau(
      vao.hoTen as string,
      vao.dd as number,
      vao.mm as number,
      vao.yyyy as number,
      vao.namXem as number,
      vao.thangXem as number,
      vao.ngayXem as number,
    ),
  );
  assert.equal(kq.tong, tep.soCa);
  assert.equal(kq.soLech, 0, baoCao("than-so-hoc", kq));
});

test("than-so-hoc: bỏ dấu như bản Go", () => {
  assert.equal(foldVietnamese("Đặng Thùy Dương, 1990"), "dang thuy duong, 1990");
  assert.equal(stripDiacritics("Đặng Thùy Dương, 1990"), "dangthuyduong");
  assert.equal(stripDiacritics("Ưng Hoàng Phúc"), "unghoangphuc");
  assert.equal(slugify("  Thần số học: Số 11!  "), "than-so-hoc-so-11");
});

test("than-so-hoc: phép so bắt được đáp án sai", () => {
  const kq = kiemCa(tep, (vao) => {
    const h = tinhHoSoThanSoHocSau(vao.hoTen as string, vao.dd as number, vao.mm as number, vao.yyyy as number, 2026, 1, 1);
    return { ...h, soDinhCao: { ...h.soDinhCao, dinh4: h.soDinhCao.dinh4 + 1 } };
  });
  assert.equal(kq.dat, 0);
  assert.match(kq.loi[0], /ra\.soDinhCao\.dinh4: mong \d+, nhận \d+/);
});
