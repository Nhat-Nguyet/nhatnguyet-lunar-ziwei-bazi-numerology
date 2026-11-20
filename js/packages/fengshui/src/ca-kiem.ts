// Tính đáp án của một ca kiểm ca-kiem/fengshui.json từ `vao` bằng lớp lõi
// chuyển ngữ (core.ts). Dùng cho test và cho người chuyển ngữ đối chiếu; KHÔNG
// xuất ra index của gói. Mỗi `phep` ứng với đúng một lời gọi hàm xuất của
// lõi Go (xem xuatcakiem/fengshui.go).

import { solarToLunar } from "@nhatnguyet/am-lich";
import {
  allBatQuai, allSonHuong, allTrachBatTrach, cacLoaiThuoc, cacTenCungNho, chinVan, khiCuaSao, lapTinhBanHK, phiTinhNam,
  sonHuongTheoDo, thanhMon, traLoBan, vanCuaNam, xemHuongNhaDat,
} from "./core.ts";

export function tinhCaKiem(vao: Record<string, unknown>): unknown {
  const n = (k: string) => vao[k] as number;
  switch (vao.phep) {
    case "cung-phi": {
      const gt = vao.gioiTinh;
      if (gt !== "Nam" && gt !== "Nữ") return { loi: true };
      const namAm = solarToLunar(n("dd"), n("mm"), n("yyyy"), 7).year;
      return { namAm, ketQua: xemHuongNhaDat(namAm, gt) };
    }
    case "bat-quai":
      return allBatQuai();
    case "son":
      return allSonHuong();
    case "son-theo-do":
      return sonHuongTheoDo(n("do"));
    case "trach": {
      const son = allSonHuong().find((s) => s.ten === vao.toa);
      const trach = allTrachBatTrach().find((d) => son && d.que === son.quai);
      return { son, trach };
    }
    case "tinh-ban": {
      let tinhBan;
      try {
        tinhBan = lapTinhBanHK(n("van"), vao.toa as string);
      } catch {
        return { loi: true };
      }
      const khi = [""];
      for (let s = 1; s <= 9; s++) khi.push(khiCuaSao(n("van"), s));
      return { tinhBan, thanhMon: thanhMon(n("van"), vao.toa as string), khi };
    }
    case "van":
      return vanCuaNam(n("nam"));
    case "chin-van":
      return chinVan(n("nam"));
    case "phi-tinh-nam":
      return phiTinhNam(n("nam"));
    case "cac-loai-thuoc":
      return cacLoaiThuoc();
    case "ten-cung-nho":
      return cacTenCungNho();
    case "lo-ban":
      return traLoBan(n("kichThuocMm"), vao.loaiThuoc as string);
    default:
      throw new Error("unknown phep " + String(vao.phep));
  }
}
