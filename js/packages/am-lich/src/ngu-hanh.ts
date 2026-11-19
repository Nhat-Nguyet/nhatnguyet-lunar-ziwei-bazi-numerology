// Ngũ hành: hành của địa chi, của thiên can, tương sinh tương khắc, và bảng
// nạp âm Lục Thập Hoa Giáp. Chuyển ngữ từ lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t 
// (nguhanh.go, tuvi_data.go phần nạp âm, battu.go phần hành của can).

/** Năm hành theo thứ tự vòng tương sinh của bản Go (Kim, Thủy, Mộc, Hỏa, Thổ). */
export const NGU_HANH_LIST: readonly string[] = ["Kim", "Thủy", "Mộc", "Hỏa", "Thổ"];

/** Tên tiếng Anh của năm hành. */
export const HANH_EN: Readonly<Record<string, string>> = {
  Kim: "Metal",
  Mộc: "Wood",
  Thủy: "Water",
  Hỏa: "Fire",
  Thổ: "Earth",
};

/** Tên chữ Hán của năm hành. */
export const HANH_ZH: Readonly<Record<string, string>> = {
  Kim: "金",
  Mộc: "木",
  Thủy: "水",
  Hỏa: "火",
  Thổ: "土",
};

/** Hành của mười thiên can theo chỉ số (Giáp, Ất Mộc; Bính, Đinh Hỏa...). */
export const CAN_NGU_HANH: readonly string[] = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"];

/** Hành của mười hai địa chi theo chỉ số (Tý 0 tới Hợi 11). */
export const CHI_NGU_HANH: readonly string[] = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];

const TEN_CHI: readonly string[] = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

export interface HanhHaiThuTieng {
  hanh: string;
  hanhEn: string;
}

/** Hành của một địa chi theo tên; hai chuỗi rỗng khi tên không hợp lệ. */
export function chiToNguHanh(chi: string): HanhHaiThuTieng {
  const i = TEN_CHI.indexOf(chi);
  if (i < 0) return { hanh: "", hanhEn: "" };
  const hanh = CHI_NGU_HANH[i];
  return { hanh, hanhEn: HANH_EN[hanh] };
}

/** Hành của chữ số 0 tới 9 theo Hà Đồ (1, 6 Thủy; 2, 7 Hỏa; 3, 8 Mộc; 4, 9 Kim; 5, 0 Thổ). */
const SO_NGU_HANH: readonly string[] = ["Thổ", "Thủy", "Hỏa", "Mộc", "Kim", "Thổ", "Thủy", "Hỏa", "Mộc", "Kim"];

/**
 * Hành của một con số thần số học theo Hà Đồ. Số chủ 11, 22, 33 rút thêm
 * một lần (thành 2, 4, 6) chỉ để tra hành. Số ngoài 0 tới 9 (trừ số chủ)
 * trả hai chuỗi rỗng.
 */
export function soToNguHanh(so: number): HanhHaiThuTieng {
  let tra = so;
  if (so === 11 || so === 22 || so === 33) tra = so / 11 * 2;
  if (!Number.isInteger(tra) || tra < 0 || tra > 9) return { hanh: "", hanhEn: "" };
  const hanh = SO_NGU_HANH[tra];
  return { hanh, hanhEn: HANH_EN[hanh] };
}

/** Vòng tương sinh: Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim, Kim sinh Thủy, Thủy sinh Mộc. */
const NGU_HANH_SINH: Readonly<Record<string, string>> = {
  Mộc: "Hỏa",
  Hỏa: "Thổ",
  Thổ: "Kim",
  Kim: "Thủy",
  Thủy: "Mộc",
};

/** Vòng tương khắc: Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc. */
const NGU_HANH_KHAC: Readonly<Record<string, string>> = {
  Mộc: "Thổ",
  Thổ: "Thủy",
  Thủy: "Hỏa",
  Hỏa: "Kim",
  Kim: "Mộc",
};

/** Hành mà `hanh` sinh ra (Mộc ra Hỏa); rỗng khi không phải một hành. */
export function nguHanhSinhRa(hanh: string): string {
  return NGU_HANH_SINH[hanh] ?? "";
}

/** Hành mà `hanh` khắc (Mộc ra Thổ); rỗng khi không phải một hành. */
export function nguHanhKhacDuoc(hanh: string): string {
  return NGU_HANH_KHAC[hanh] ?? "";
}

/** Hành SINH RA hành h (Thổ sinh Kim: hanhSinhRa("Kim") là "Thổ"). */
export function hanhSinhRa(h: string): string {
  for (const [me, con] of Object.entries(NGU_HANH_SINH)) if (con === h) return me;
  return "";
}

/** Hành KHẮC hành h (Hỏa khắc Kim: hanhKhacLai("Kim") là "Hỏa"). */
export function hanhKhacLai(h: string): string {
  for (const [k, bi] of Object.entries(NGU_HANH_KHAC)) if (bi === h) return k;
  return "";
}

/** Quan hệ hai hành không phân biệt chiều. */
export type QuanHeNguHanh = "tuong_sinh" | "tuong_khac" | "tuong_hoa";

/** So hai hành: cùng hành, một bên sinh bên kia, hay khắc nhau. */
export function tuongSinhTuongKhac(hanh1: string, hanh2: string): QuanHeNguHanh {
  if (hanh1 === hanh2) return "tuong_hoa";
  if (NGU_HANH_SINH[hanh1] === hanh2 || NGU_HANH_SINH[hanh2] === hanh1) return "tuong_sinh";
  return "tuong_khac";
}

/** Một mục của bảng nạp âm. */
export interface NapAm {
  /** Kim, Mộc, Thủy, Hỏa, Thổ. */
  hanh: string;
  hanhEn: string;
  /** Tên nạp âm, ví dụ "Hải Trung Kim". */
  ten: string;
}

// 30 cặp gốc; mỗi cặp dùng cho chính nó và cặp (can + 1, chi + 1) kế tiếp.
const NAP_AM_GOC: ReadonlyArray<readonly [number, number, string, string, string]> = [
  [0, 0, "Kim", "Metal", "Hải Trung Kim"],
  [2, 2, "Hỏa", "Fire", "Lư Trung Hỏa"],
  [4, 4, "Mộc", "Wood", "Đại Lâm Mộc"],
  [6, 6, "Thổ", "Earth", "Lộ Bàng Thổ"],
  [8, 8, "Kim", "Metal", "Kiếm Phong Kim"],
  [0, 10, "Hỏa", "Fire", "Sơn Đầu Hỏa"],
  [2, 0, "Thủy", "Water", "Giản Hạ Thủy"],
  [4, 2, "Thổ", "Earth", "Thành Đầu Thổ"],
  [6, 4, "Kim", "Metal", "Bạch Lạp Kim"],
  [8, 6, "Mộc", "Wood", "Dương Liễu Mộc"],
  [0, 8, "Thủy", "Water", "Tuyền Trung Thủy"],
  [2, 10, "Thổ", "Earth", "Ốc Thượng Thổ"],
  [4, 0, "Hỏa", "Fire", "Tích Lịch Hỏa"],
  [6, 2, "Mộc", "Wood", "Tùng Bách Mộc"],
  [8, 4, "Thủy", "Water", "Trường Lưu Thủy"],
  [0, 6, "Kim", "Metal", "Sa Trung Kim"],
  [2, 8, "Hỏa", "Fire", "Sơn Hạ Hỏa"],
  [4, 10, "Mộc", "Wood", "Bình Địa Mộc"],
  [6, 0, "Thổ", "Earth", "Bích Thượng Thổ"],
  [8, 2, "Kim", "Metal", "Kim Bạc Kim"],
  [0, 4, "Hỏa", "Fire", "Phú Đăng Hỏa"],
  [2, 6, "Thủy", "Water", "Thiên Hà Thủy"],
  [4, 8, "Thổ", "Earth", "Đại Trạch Thổ"],
  [6, 10, "Kim", "Metal", "Thoa Xuyến Kim"],
  [8, 0, "Mộc", "Wood", "Tang Đố Mộc"],
  [0, 2, "Thủy", "Water", "Đại Khê Thủy"],
  [2, 4, "Thổ", "Earth", "Sa Trung Thổ"],
  [4, 6, "Hỏa", "Fire", "Thiên Thượng Hỏa"],
  [6, 8, "Mộc", "Wood", "Thạch Lựu Mộc"],
  [8, 10, "Thủy", "Water", "Đại Hải Thủy"],
];

function modDuong(a: number, b: number): number {
  const m = a % b;
  return m < 0 ? m + b : m;
}

const BANG_NAP_AM: ReadonlyMap<number, NapAm> = (() => {
  const m = new Map<number, NapAm>();
  for (const [can, chi, hanh, hanhEn, ten] of NAP_AM_GOC) {
    const e: NapAm = { hanh, hanhEn, ten };
    m.set(can * 12 + chi, e);
    m.set(modDuong(can + 1, 10) * 12 + modDuong(chi + 1, 12), e);
  }
  return m;
})();

/**
 * Ngũ hành nạp âm của một cặp can chi theo chỉ số. Cặp không thuộc vòng 60
 * (can và chi khác tính chẵn lẻ) trả ba chuỗi rỗng.
 */
export function nguHanhNapAm(canIdx: number, chiIdx: number): NapAm {
  const e = BANG_NAP_AM.get(modDuong(canIdx, 10) * 12 + modDuong(chiIdx, 12));
  return e ? { ...e } : { hanh: "", hanhEn: "", ten: "" };
}
