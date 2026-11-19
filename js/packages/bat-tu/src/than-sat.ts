// Chín thần sát thông dụng của Bát Tự. Chuyển ngữ từ
// lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t battu_thansat.go (Đào Hoa, Dịch Mã lấy
// đúng phép daoHoaViTri, thienMaViTri của Tử Vi).
//
// Hai họ: tra theo THIÊN CAN (Thiên Ất Quý Nhân, Văn Xương, Lộc Thần, Dương
// Nhận) và tra theo NHÓM TAM HỢP của chi năm và chi ngày (Đào Hoa, Dịch Mã,
// Hoa Cái, Kiếp Sát, Vong Thần). Chỗ các sách tra khác nhau ghi ở `loiKhac`.

import { DIA_CHI, chiSoChi, mod } from "./am-lich.ts";
import { duongNhanCuaCan, locCuaCan } from "./tang-can.ts";

/** Một câu ba thứ tiếng. */
interface BaNgonNgu {
  vi: string;
  en: string;
  zh: string;
}

const RONG: BaNgonNgu = { vi: "", en: "", zh: "" };

// Theo câu quyết "Giáp Mậu Canh Ngưu Dương, Ất Kỷ Thử Hầu hương, Bính Đinh
// Trư Kê vị, Nhâm Quý Thố Xà tàng, Lục Tân phùng Mã Hổ".
const THIEN_AT_QUY_NHAN: ReadonlyArray<readonly [number, number]> = [
  [1, 7], // Giáp: Sửu, Mùi
  [0, 8], // Ất: Tý, Thân
  [11, 9], // Bính: Hợi, Dậu
  [11, 9], // Đinh: Hợi, Dậu
  [1, 7], // Mậu: Sửu, Mùi
  [0, 8], // Kỷ: Tý, Thân
  [1, 7], // Canh: Sửu, Mùi
  [6, 2], // Tân: Ngọ, Dần
  [3, 5], // Nhâm: Mão, Tỵ
  [3, 5], // Quý: Mão, Tỵ
];

// Văn Xương theo can ("Giáp Tỵ Ất Ngọ..."; can Tân ở Tý theo câu "Tân Thử").
const VAN_XUONG: readonly number[] = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];

export const TEN_THIEN_AT_QUY_NHAN = "Thiên Ất Quý Nhân";
export const TEN_VAN_XUONG_BAT_TU = "Văn Xương";
export const TEN_LOC_THAN = "Lộc Thần";
export const TEN_DUONG_NHAN = "Dương Nhận";
export const TEN_DAO_HOA_BAT_TU = "Đào Hoa";
export const TEN_DICH_MA = "Dịch Mã";
export const TEN_HOA_CAI = "Hoa Cái";
export const TEN_KIEP_SAT = "Kiếp Sát";
export const TEN_VONG_THAN = "Vong Thần";

// Chi Trường Sinh của nhóm tam hợp: Thân Tý Thìn khởi Thân, Tỵ Dậu Sửu khởi
// Tỵ, Dần Ngọ Tuất khởi Dần, Hợi Mão Mùi khởi Hợi.
function truongSinhTamHop(chiIdx: number): number {
  return mod(8 - 3 * mod(chiIdx, 4), 12);
}
const hoaCaiViTri = (c: number): number => mod(truongSinhTamHop(c) + 8, 12); // ngôi Mộ
const kiepSatViTri = (c: number): number => mod(truongSinhTamHop(c) + 9, 12); // ngôi Tuyệt
const vongThanViTri = (c: number): number => mod(truongSinhTamHop(c) + 3, 12); // ngôi Lâm Quan

/** Đào Hoa theo nhóm tam hợp của chi (như sao Đào Hoa của Tử Vi). */
function daoHoaViTri(chiIdx: number): number {
  switch (mod(chiIdx, 4)) {
    case 0:
      return 9; // Thân Tý Thìn: Dậu
    case 2:
      return 3; // Dần Ngọ Tuất: Mão
    default:
      switch (chiIdx % 12) {
        case 5:
        case 9:
        case 1:
          return 6; // Tỵ Dậu Sửu: Ngọ
        default:
          return 0; // Hợi Mão Mùi: Tý
      }
  }
}

/** Dịch Mã (Thiên Mã của Tử Vi) theo nhóm tam hợp của chi. */
function thienMaViTri(chiIdx: number): number {
  switch (mod(chiIdx + 1, 4)) {
    case 1:
      return 2; // Dần
    case 2:
      return 11; // Hợi
    case 3:
      return 8; // Thân
    default:
      return 5; // Tỵ
  }
}

/** Một sao thần sát kèm chỗ nó rơi trên lá số. */
export interface ThanSatBatTu {
  ten: string;
  /** Các địa chi sao đóng; trụ có chi trong đây là trụ mang sao. */
  chiDich: string[];
  /** Chỉ số các trụ mang sao: 0 năm, 1 tháng, 2 ngày, 3 giờ. */
  viTri: number[];
  traTheo: string;
  traTheoEn: string;
  traTheoZh: string;
  /** Câu nói các sách khác tra sao này thế nào; rỗng khi sách thống nhất. */
  loiKhac: string;
  loiKhacEn: string;
  loiKhacZh: string;
}

function them(ds: number[], ...x: number[]): number[] {
  for (const v of x) if (!ds.includes(v)) ds.push(v);
  return ds;
}

const THEO_CAN_NGAY_NAM: BaNgonNgu = {
  vi: "Tra theo can ngày (nhật chủ) và can năm.",
  en: "Looked up from the day stem (day master) and the year stem.",
  zh: "以日干（日主）与年干查。",
};
const THEO_CAN_NGAY: BaNgonNgu = {
  vi: "Tra theo can ngày (nhật chủ).",
  en: "Looked up from the day stem (day master).",
  zh: "以日干（日主）查。",
};
const THEO_CHI_NAM_NGAY: BaNgonNgu = {
  vi: "Tra theo nhóm tam hợp của chi năm và chi ngày.",
  en: "Looked up from the Three Harmony group of the year branch and the day branch.",
  zh: "以年支与日支所属三合局查。",
};
const LOI_KHAC_CHI_NAM_NGAY: BaNgonNgu = {
  vi: "Có sách chỉ tra theo chi năm, có sách chỉ tra theo chi ngày, nên một trụ có thể mang sao ở sách này mà không mang ở sách kia.",
  en: "Some books look this up from the year branch only, others from the day branch only, so a pillar may carry the star in one book and not in another.",
  zh: "有的书只以年支查，有的只以日支查，因此同一柱在此书有此星、在彼书则无。",
};
const LOI_KHAC_QUY_NHAN: BaNgonNgu = {
  vi: 'Lối chọn theo câu quyết "Giáp Mậu Canh Ngưu Dương". Có sách xếp Canh cùng Tân ở Ngọ Dần ("Canh Tân phùng Mã Hổ"), và có sách chỉ tra theo can ngày.',
  en: "This follows the rhyme that puts Giáp, Mậu and Canh at Sửu and Mùi. Some books put Canh with Tân at Ngọ and Dần instead, and some look it up from the day stem only.",
  zh: '此处依"甲戊庚牛羊"之诀。另有书以庚辛同在午寅（"庚辛逢马虎"），也有书只以日干查。',
};
const LOI_KHAC_VAN_XUONG: BaNgonNgu = {
  vi: 'Sao Văn Xương của Bát Tự tra theo can, khác sao Văn Xương của Tử Vi vốn an theo giờ sinh. Có sách chỉ tra theo can ngày. Can Tân ở đây theo câu quyết "Tân Thử" (ở Tý); Trương Quả tinh tông ghi can Tân ở Tuất.',
  en: "The Bát Tự Văn Xương is looked up from a stem, unlike the Tử Vi star of the same name, which is placed by birth hour. Some books use the day stem only. For the stem Tân this follows the rhyme that puts it at Tý; the Zhang Guo Xingzong puts Tân at Tuất.",
  zh: '八字之文昌以天干查，与紫微斗数按时辰安的文昌不同。也有书只以日干查。辛干此处依"辛鼠"之诀（在子）；《张果星宗》作辛在戌（"辛犬"）。',
};
const LOI_KHAC_DUONG_NHAN: BaNgonNgu = {
  vi: "Với can âm các phái không thống nhất. Ở đây lấy ngôi ngay sau Lộc như can dương. Có phái lấy ngôi Đế Vượng của can âm (lùi một ngôi từ Lộc). Tam Mệnh Thông Hội ghi rằng Tử Bình cho năm can dương có Dương Nhận, còn năm can âm thì không.",
  en: "For yin stems the schools disagree. Here it is the branch right after the Lộc, as for yang stems. One school takes the yin stem's Peak position (one branch before the Lộc). The Sanming Tonghui records that Tử Bình gives a Dương Nhận to the five yang stems and none to the five yin stems.",
  zh: "阴干羊刃各派不一。此处与阳干同，取禄前一位。有派取阴干帝旺之位（禄后一位）。《三命通会》记子平以甲丙戊庚壬五阳干有刃，乙丁己辛癸五阴干无刃。",
};

/**
 * Dò chín sao trên các trụ. `chiTru[i]` là chỉ số chi của trụ i (0 năm, 1
 * tháng, 2 ngày, 3 giờ); -1 nghĩa là trụ ấy không có (chưa biết giờ sinh).
 */
export function tinhThanSat(
  canNgay: number,
  canNam: number,
  chiNam: number,
  chiNgay: number,
  chiTru: readonly [number, number, number, number],
): ThanSatBatTu[] {
  const ds: Array<{ ten: string; dich: number[]; traTheo: BaNgonNgu; loiKhac: BaNgonNgu }> = [
    {
      ten: TEN_THIEN_AT_QUY_NHAN,
      dich: them([], THIEN_AT_QUY_NHAN[canNgay][0], THIEN_AT_QUY_NHAN[canNgay][1], THIEN_AT_QUY_NHAN[canNam][0], THIEN_AT_QUY_NHAN[canNam][1]),
      traTheo: THEO_CAN_NGAY_NAM,
      loiKhac: LOI_KHAC_QUY_NHAN,
    },
    { ten: TEN_VAN_XUONG_BAT_TU, dich: them([], VAN_XUONG[canNgay], VAN_XUONG[canNam]), traTheo: THEO_CAN_NGAY_NAM, loiKhac: LOI_KHAC_VAN_XUONG },
    { ten: TEN_LOC_THAN, dich: [chiSoChi(locCuaCan(canNgay))], traTheo: THEO_CAN_NGAY, loiKhac: RONG },
    { ten: TEN_DUONG_NHAN, dich: [chiSoChi(duongNhanCuaCan(canNgay).truocLoc)], traTheo: THEO_CAN_NGAY, loiKhac: LOI_KHAC_DUONG_NHAN },
    { ten: TEN_DAO_HOA_BAT_TU, dich: them([], daoHoaViTri(chiNam), daoHoaViTri(chiNgay)), traTheo: THEO_CHI_NAM_NGAY, loiKhac: LOI_KHAC_CHI_NAM_NGAY },
    { ten: TEN_DICH_MA, dich: them([], thienMaViTri(chiNam), thienMaViTri(chiNgay)), traTheo: THEO_CHI_NAM_NGAY, loiKhac: LOI_KHAC_CHI_NAM_NGAY },
    { ten: TEN_HOA_CAI, dich: them([], hoaCaiViTri(chiNam), hoaCaiViTri(chiNgay)), traTheo: THEO_CHI_NAM_NGAY, loiKhac: LOI_KHAC_CHI_NAM_NGAY },
    { ten: TEN_KIEP_SAT, dich: them([], kiepSatViTri(chiNam), kiepSatViTri(chiNgay)), traTheo: THEO_CHI_NAM_NGAY, loiKhac: LOI_KHAC_CHI_NAM_NGAY },
    { ten: TEN_VONG_THAN, dich: them([], vongThanViTri(chiNam), vongThanViTri(chiNgay)), traTheo: THEO_CHI_NAM_NGAY, loiKhac: LOI_KHAC_CHI_NAM_NGAY },
  ];

  return ds.map((s) => {
    const viTri: number[] = [];
    chiTru.forEach((c, i) => {
      if (c >= 0 && s.dich.includes(c)) viTri.push(i);
    });
    return {
      ten: s.ten,
      chiDich: s.dich.map((c) => DIA_CHI[c]),
      viTri,
      traTheo: s.traTheo.vi,
      traTheoEn: s.traTheo.en,
      traTheoZh: s.traTheo.zh,
      loiKhac: s.loiKhac.vi,
      loiKhacEn: s.loiKhac.en,
      loiKhacZh: s.loiKhac.zh,
    };
  });
}
