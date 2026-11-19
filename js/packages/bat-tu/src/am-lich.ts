// Cầu nối tới gói @nhatnguyet/am-lich: mọi tệp của gói Bát Tự chỉ nhập lịch
// âm, can chi, tiết khí, nạp âm qua tệp này, không viết lại.
//
// Trong không gian làm việc (chưa `npm install`, chạy thẳng `node --test`),
// tên gói chưa phân giải được nên nhập theo đường tương đối tới mã nguồn của
// gói anh em, như gói le-hoi. Khi đóng gói để phát hành, đổi MỘT dòng dưới
// thành `from "@nhatnguyet/am-lich"` (gói đã khai trong `dependencies`).

export {
  CAN_NGU_HANH,
  DIA_CHI,
  HANH_EN,
  HANH_ZH,
  THIEN_CAN,
  TIME_ZONE_VN,
  allTietKhi,
  canGioDau,
  canThangDan,
  canToNguHanh,
  chiGioTuGioDongHo,
  chiSoCan,
  chiSoChi,
  chiToNguHanh,
  dayCanChi,
  jdFromDate,
  jdToDate,
  kinhDoMatTroi,
  mocTietKhiTrongNam,
  mod,
  nguHanhKhacDuoc,
  nguHanhNapAm,
  nguHanhSinhRa,
  tietKhiTaiThoiDiem,
  yearCanChi,
} from "@nhatnguyet/am-lich";
export type { SolarDate, ThoiDiemTietKhi, TietKhi } from "@nhatnguyet/am-lich";
