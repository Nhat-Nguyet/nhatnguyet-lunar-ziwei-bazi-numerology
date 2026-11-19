// Tàng can, vòng trường sinh theo từng can, Lộc, Dương Nhận và Nguyệt Lệnh.
// Chuyển ngữ từ lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t battu_tangcan.go và
// battu_loc.go (bảng Lộc chép từ locTonViTri của tuvi_data.go, tên mười hai
// giai đoạn từ tenVongTruongSinh).

import { CAN_NGU_HANH, DIA_CHI, THIEN_CAN, allTietKhi, chiToNguHanh, mod } from "./am-lich.ts";
import { thapThanCuaCan } from "./thap-than.ts";

export const VAI_TRO_BAN_KHI = "Bản khí";
export const VAI_TRO_TRUNG_KHI = "Trung khí";
export const VAI_TRO_DU_KHI = "Dư khí";

// BANG_TANG_CAN[chi] = [bản khí, trung khí, dư khí], chỉ số can, -1 khi không có.
//
// Theo lối "nhân nguyên tư lệnh" của Tử Bình chân thuyên: ở Thìn Tuất Sửu Mùi
// can mộ khố là trung khí, can của tháng trước là dư khí. Tam Mệnh Thông Hội
// (quyển 2) cho bộ can khác ở bốn chi ấy (can mộ khố là can dương) và Ngọ
// không tàng Kỷ. Ngọ, Hợi chỉ ghi hai can như phần lớn bảng in.
const BANG_TANG_CAN: ReadonlyArray<readonly [number, number, number]> = [
  [9, -1, -1], // Tý: Quý
  [5, 7, 9], // Sửu: Kỷ, Tân (Kim mộ), Quý
  [0, 2, 4], // Dần: Giáp, Bính, Mậu
  [1, -1, -1], // Mão: Ất
  [4, 9, 1], // Thìn: Mậu, Quý (Thủy mộ), Ất
  [2, 6, 4], // Tỵ: Bính, Canh, Mậu
  [3, 5, -1], // Ngọ: Đinh, Kỷ
  [5, 1, 3], // Mùi: Kỷ, Ất (Mộc mộ), Đinh
  [6, 8, 4], // Thân: Canh, Nhâm, Mậu
  [7, -1, -1], // Dậu: Tân
  [4, 3, 7], // Tuất: Mậu, Đinh (Hỏa mộ), Tân
  [8, 0, -1], // Hợi: Nhâm, Giáp
];

const TEN_VAI_TRO = [VAI_TRO_BAN_KHI, VAI_TRO_TRUNG_KHI, VAI_TRO_DU_KHI] as const;

/** Một thiên can ẩn trong địa chi. */
export interface TangCan {
  can: string;
  hanh: string;
  vaiTro: string;
  /** Thập thần so với nhật chủ; rỗng khi không truyền nhật chủ. */
  thapThan: string;
  /** Vắng khi không truyền nhật chủ (như omitempty của bản Go). */
  thapThanEn?: string;
  thapThanZh?: string;
}

/** Các can ẩn trong một địa chi (chỉ số 0 Tý), bản khí trước. Có nhật chủ thì kèm thập thần. */
export function tangCanCuaChi(chiIdx: number, nhatChu = ""): TangCan[] {
  const ra: TangCan[] = [];
  BANG_TANG_CAN[mod(chiIdx, 12)].forEach((c, i) => {
    if (c < 0) return;
    const tc: TangCan = { can: THIEN_CAN[c], hanh: CAN_NGU_HANH[c], vaiTro: TEN_VAI_TRO[i], thapThan: "" };
    if (nhatChu !== "") {
      const tt = thapThanCuaCan(nhatChu, tc.can);
      if (tt) {
        tc.thapThan = tt.ten;
        tc.thapThanEn = tt.tenEn;
        tc.thapThanZh = tt.tenZh;
      }
    }
    ra.push(tc);
  });
  return ra;
}

/** Lộc (Lâm Quan) của mười can, chỉ số chi: Dần, Mão, Tỵ, Ngọ, Tỵ, Ngọ, Thân, Dậu, Hợi, Tý. */
export const LOC_VI_TRI: readonly number[] = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];

/** Mười hai giai đoạn của vòng trường sinh, theo thứ tự từ Tràng Sinh. */
export const TEN_VONG_TRUONG_SINH: ReadonlyArray<{ vi: string; en: string }> = [
  { vi: "Tràng Sinh", en: "Growth" },
  { vi: "Mộc Dục", en: "Bathing" },
  { vi: "Quan Đới", en: "Youth" },
  { vi: "Lâm Quan", en: "Prime" },
  { vi: "Đế Vượng", en: "Peak" },
  { vi: "Suy", en: "Decline" },
  { vi: "Bệnh", en: "Illness" },
  { vi: "Tử", en: "Death" },
  { vi: "Mộ", en: "Tomb" },
  { vi: "Tuyệt", en: "Extinction" },
  { vi: "Thai", en: "Conception" },
  { vi: "Dưỡng", en: "Nurture" },
];

// Chỗ khởi Trường Sinh suy từ Lộc (ngôi Lâm Quan, thứ tư của vòng): can
// dương lùi ba ngôi rồi đi thuận, can âm tiến ba ngôi rồi đi nghịch. Lối
// dương thuận âm nghịch, Mậu theo Bính, Kỷ theo Đinh.
function truongSinhKhoi(canIdx: number): number {
  const loc = LOC_VI_TRI[mod(canIdx, 10)];
  return canIdx % 2 === 0 ? mod(loc - 3, 12) : mod(loc + 3, 12);
}

/** Giai đoạn trường sinh của can (chỉ số 0 Giáp) tại địa chi (chỉ số 0 Tý). */
export function truongSinhCuaCan(canIdx: number, chiIdx: number): string {
  const khoi = truongSinhKhoi(canIdx);
  const buoc = canIdx % 2 === 0 ? mod(chiIdx - khoi, 12) : mod(khoi - chiIdx, 12);
  return TEN_VONG_TRUONG_SINH[buoc].vi;
}

/** Địa chi là Lộc của thiên can (chỉ số 0 Giáp). */
export function locCuaCan(canIdx: number): string {
  return DIA_CHI[LOC_VI_TRI[canIdx]];
}

/**
 * Dương Nhận của một can theo từng cách: `truocLoc` (tiến một ngôi từ Lộc,
 * lối site dùng cho thần sát), `deVuong` (can âm lấy ngôi Đế Vượng, lùi một
 * ngôi từ Lộc). Với can dương hai trường như nhau.
 */
export interface DuongNhan {
  can: string;
  laDuong: boolean;
  truocLoc: string;
  deVuong: string;
}

export function duongNhanCuaCan(canIdx: number): DuongNhan {
  const loc = LOC_VI_TRI[canIdx];
  const laDuong = canIdx % 2 === 0;
  const truocLoc = DIA_CHI[mod(loc + 1, 12)];
  return {
    can: THIEN_CAN[canIdx],
    laDuong,
    truocLoc,
    deVuong: laDuong ? truocLoc : DIA_CHI[mod(loc - 1, 12)],
  };
}

/** Một tháng tiết khí của Bát Tự. */
export interface NguyetLenh {
  /** Tháng âm lịch thường rơi vào (giêng là 1); không phải ranh giới. */
  thangAm: number;
  chi: string;
  tiet: string;
  tietEn: string;
  kinhDo: number;
  hanh: string;
}

/** Mười hai tháng Bát Tự từ tháng Dần, mỗi tháng mở ở một TIẾT. */
export function allNguyetLenh(): NguyetLenh[] {
  const ra: NguyetLenh[] = [];
  let thang = 0;
  for (const tk of allTietKhi()) {
    if (!tk.laTiet) continue;
    const chi = DIA_CHI[(thang + 2) % 12];
    ra.push({ thangAm: thang + 1, chi, tiet: tk.ten, tietEn: tk.tenEn, kinhDo: tk.kinhDo, hanh: chiToNguHanh(chi).hanh });
    thang++;
  }
  return ra;
}
