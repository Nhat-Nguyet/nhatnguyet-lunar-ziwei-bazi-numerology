// Luồng phụ của phép đối chiếu Tử Vi: dựng lá số cho một khoảng ngày bằng
// Nhat Nguyet và iztro, so từng trường, trả về số đếm (không trả từng lá).

import { parentPort, workerData } from "node:worker_threads";
import { batGhiNhoIztro, napIztro, napNhatNguyet } from "./nap.mjs";
import { laSoLoi, laSoIztro, soLaSo, TRUONG } from "./tu-vi-chung.mjs";

batGhiNhoIztro();
const { astro } = napIztro();
const { amLich, tuVi } = await napNhatNguyet();

const { tuJdn, denJdn, cacGio, soMauMoiLoai } = workerData;

const dem = { tong: 0, kiemNoiBo: { tong: 0, sai: 0 } };
for (const t of TRUONG) dem[t] = { khac: 0, doMuiGio: 0, doThangNhuan: 0, conLai: 0 };
const mau = {}; // loại -> [{ngay, gio}]
const ghiMau = (loai, ngay, gio) => {
  const ds = (mau[loai] ??= []);
  if (ds.length < soMauMoiLoai) ds.push({ ngay, gio });
};

for (let jdn = tuJdn; jdn <= denJdn; jdn++) {
  const { day: d, month: m, year: y } = amLich.jdToDate(jdn);
  const ngay = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  for (const gio of cacGio) {
    dem.tong++;
    const vn = laSoLoi(amLich, tuVi, d, m, y, gio, 7);
    const cn = laSoLoi(amLich, tuVi, d, m, y, gio, 8);

    // Kiểm nội bộ: phép dựng rút gọn ở giờ Việt Nam phải trùng lapLaSoTuVi
    // của gói (cùng ngày âm, cục, cung Mệnh, 14 chính tinh). Kiểm 1 lá trên 50.
    if (jdn % 50 === 0) {
      dem.kiemNoiBo.tong++;
      const day = tuVi.lapLaSoTuVi("", "Nam", d, m, y, gio);
      if (soLaSo(vn, laSoTuGoi(day)).length) dem.kiemNoiBo.sai++;
    }

    const iz = laSoIztro(astro, ngay, gio, true);
    const khacVN = new Set(soLaSo(vn, iz));
    if (!khacVN.size) continue;
    const khacCN = new Set(soLaSo(cn, iz));
    let khacKhongNhuan = null;
    if (iz.amLich.nhuan) {
      // fixLeap của iztro chỉ có tác dụng khi tháng sinh là tháng nhuận.
      khacKhongNhuan = new Set(soLaSo(cn, laSoIztro(astro, ngay, gio, false)));
    }
    for (const t of TRUONG) {
      if (!khacVN.has(t)) continue;
      dem[t].khac++;
      let loai;
      if (!khacCN.has(t)) loai = "doMuiGio";
      else if (khacKhongNhuan && !khacKhongNhuan.has(t)) loai = "doThangNhuan";
      else loai = "conLai";
      dem[t][loai]++;
      if (t === "laSo") ghiMau(loai, ngay, gio);
    }
  }
}

/** Đưa lá số đầy đủ của gói về dạng rút gọn để so. */
function laSoTuGoi(ls) {
  const sao = {};
  for (const c of ls.cung) for (const s of c.sao) if (s.loai === "chinh-tinh") sao[s.ten] = c.viTri;
  return {
    amLich: { nam: ls.ngaySinhAm.year, thang: ls.ngaySinhAm.month, ngay: ls.ngaySinhAm.day, nhuan: ls.ngaySinhAm.leap },
    canChiNam: ls.canChiNam,
    cuc: ls.cuc,
    menh: ls.cungMenh,
    sao,
  };
}

parentPort.postMessage({ dem, mau });
