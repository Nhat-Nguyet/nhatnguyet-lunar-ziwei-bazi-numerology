// Tàng can, vòng trường sinh theo từng can, Lộc, Dương Nhận và Nguyệt Lệnh.
// Chuyển ngữ từ lõi tính Go của Nhật Nguyệt battu_tangcan.go và
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

/**
 * Thuật ngữ ba thứ tiếng của lá số Bát Tự, chép từ TuVung (tuvung.go) của bản
 * Go: can, chi, hành, vai tàng can, âm dương, chín thần sát, 30 nạp âm (hai
 * lối viết Kim Bạch, Kim Bạc). Mỗi mục [tiếng Anh, chữ Hán giản thể]. Can,
 * chi giữ tên Hán Việt ở bản Anh nên kết quả chỉ mang bản chữ Hán của chúng.
 */
export const TU_VUNG_BAT_TU: Readonly<Record<string, readonly [string, string]>> = {
  "Giáp": ["Giáp", "甲"], "Ất": ["Ất", "乙"], "Bính": ["Bính", "丙"], "Đinh": ["Đinh", "丁"], "Mậu": ["Mậu", "戊"],
  "Kỷ": ["Kỷ", "己"], "Canh": ["Canh", "庚"], "Tân": ["Tân", "辛"], "Nhâm": ["Nhâm", "壬"], "Quý": ["Quý", "癸"],
  "Tý": ["Tý", "子"], "Sửu": ["Sửu", "丑"], "Dần": ["Dần", "寅"], "Mão": ["Mão", "卯"], "Thìn": ["Thìn", "辰"],
  "Tỵ": ["Tỵ", "巳"], "Ngọ": ["Ngọ", "午"], "Mùi": ["Mùi", "未"], "Thân": ["Thân", "申"], "Dậu": ["Dậu", "酉"],
  "Tuất": ["Tuất", "戌"], "Hợi": ["Hợi", "亥"],
  "Kim": ["Metal", "金"], "Mộc": ["Wood", "木"], "Thủy": ["Water", "水"], "Hỏa": ["Fire", "火"], "Thổ": ["Earth", "土"],
  "Bản khí": ["main qi", "本气"], "Trung khí": ["middle qi", "中气"], "Dư khí": ["residual qi", "余气"],
  "Dương": ["Yang", "阳"], "Âm": ["Yin", "阴"],
  "Thiên Ất Quý Nhân": ["Heavenly Noble", "天乙贵人"], "Văn Xương": ["Literary Glory", "文昌"],
  "Lộc Thần": ["Prosperity Star", "禄神"], "Dương Nhận": ["Yang Blade", "羊刃"], "Đào Hoa": ["Peach Blossom", "桃花"],
  "Dịch Mã": ["Travelling Horse", "驿马"], "Hoa Cái": ["Canopy", "华盖"], "Kiếp Sát": ["Robbery Sha", "劫煞"],
  "Vong Thần": ["Lost Spirit", "亡神"],
  "Hải Trung Kim": ["Gold in the Sea", "海中金"], "Lư Trung Hỏa": ["Fire in the Furnace", "炉中火"],
  "Đại Lâm Mộc": ["Wood of the Great Forest", "大林木"], "Lộ Bàng Thổ": ["Earth by the Roadside", "路旁土"],
  "Kiếm Phong Kim": ["Gold of the Sword Edge", "剑锋金"], "Sơn Đầu Hỏa": ["Fire on the Hilltop", "山头火"],
  "Giản Hạ Thủy": ["Water in the Ravine", "涧下水"], "Thành Đầu Thổ": ["Earth of the City Wall", "城头土"],
  "Bạch Lạp Kim": ["Gold of the White Candle", "白蜡金"], "Dương Liễu Mộc": ["Wood of the Willow", "杨柳木"],
  "Tuyền Trung Thủy": ["Water in the Spring", "泉中水"], "Ốc Thượng Thổ": ["Earth on the Roof", "屋上土"],
  "Tích Lịch Hỏa": ["Fire of the Thunderbolt", "霹雳火"], "Tùng Bách Mộc": ["Wood of Pine and Cypress", "松柏木"],
  "Trường Lưu Thủy": ["Water of the Long Stream", "长流水"], "Sa Trung Kim": ["Gold in the Sand", "沙中金"],
  "Sơn Hạ Hỏa": ["Fire at the Foot of the Hill", "山下火"], "Bình Địa Mộc": ["Wood of the Plain", "平地木"],
  "Bích Thượng Thổ": ["Earth on the Wall", "壁上土"], "Kim Bạch Kim": ["Gold of Foil", "金箔金"],
  "Kim Bạc Kim": ["Gold of Foil", "金箔金"], "Phú Đăng Hỏa": ["Fire of the Lamp", "覆灯火"],
  "Thiên Hà Thủy": ["Water of the Milky Way", "天河水"], "Đại Trạch Thổ": ["Earth of the Great Marsh", "大泽土"],
  "Thoa Xuyến Kim": ["Gold of Hairpin and Bracelet", "钗钏金"], "Tang Đố Mộc": ["Wood of the Mulberry", "桑柘木"],
  "Đại Khê Thủy": ["Water of the Great Brook", "大溪水"], "Sa Trung Thổ": ["Earth in the Sand", "沙中土"],
  "Thiên Thượng Hỏa": ["Fire in the Sky", "天上火"], "Thạch Lựu Mộc": ["Wood of the Pomegranate", "石榴木"],
  "Đại Hải Thủy": ["Water of the Great Sea", "大海水"],
};

/** Chữ Hán của 24 tiết khí (TuVung). */
const TIET_KHI_ZH: Readonly<Record<string, string>> = {
  "Lập Xuân": "立春", "Vũ Thủy": "雨水", "Kinh Trập": "惊蛰", "Xuân Phân": "春分", "Thanh Minh": "清明", "Cốc Vũ": "谷雨",
  "Lập Hạ": "立夏", "Tiểu Mãn": "小满", "Mang Chủng": "芒种", "Hạ Chí": "夏至", "Tiểu Thử": "小暑", "Đại Thử": "大暑",
  "Lập Thu": "立秋", "Xử Thử": "处暑", "Bạch Lộ": "白露", "Thu Phân": "秋分", "Hàn Lộ": "寒露", "Sương Giáng": "霜降",
  "Lập Đông": "立冬", "Tiểu Tuyết": "小雪", "Đại Tuyết": "大雪", "Đông Chí": "冬至", "Tiểu Hàn": "小寒", "Đại Hàn": "大寒",
};

/** Chữ Hán của một thuật ngữ hay một cặp can chi ("Bính Ngọ" ra 丙午); rỗng khi không có (zhCua của Go). */
export function zhCua(vi: string): string {
  const s = vi.trim();
  if (s === "") return "";
  const phan = s.split(/\s+/);
  if (phan.length === 2 && THIEN_CAN.includes(phan[0]) && DIA_CHI.includes(phan[1])) {
    return TU_VUNG_BAT_TU[phan[0]][1] + TU_VUNG_BAT_TU[phan[1]][1];
  }
  return TU_VUNG_BAT_TU[s]?.[1] ?? "";
}

/** Tên tiếng Anh của một thuật ngữ; rỗng khi không có (enCua của Go). */
export function enCua(vi: string): string {
  return TU_VUNG_BAT_TU[vi.trim()]?.[0] ?? "";
}

/** Tên tiếng Anh (bảng tiết khí: "Start of Spring") và chữ Hán (立春) của một tiết khí; rỗng khi không phải tên tiết. */
export function tietKhiBaThu(vi: string): { en: string; zh: string } {
  if (vi === "") return { en: "", zh: "" };
  const t = allTietKhi().find((x) => x.ten === vi);
  return t ? { en: t.tenEn, zh: TIET_KHI_ZH[vi] ?? "" } : { en: "", zh: "" };
}

/** Tên tiếng Anh và chữ Hán của một giai đoạn vòng trường sinh. */
export function truongSinhBaThu(vi: string): { en: string; zh: string } {
  const n = TEN_VONG_TRUONG_SINH.find((x) => x.vi === vi);
  return n ? { en: n.en, zh: n.zh } : { en: "", zh: "" };
}

/** Một thiên can ẩn trong địa chi. */
export interface TangCan {
  can: string;
  canZh: string;
  hanh: string;
  hanhEn: string;
  hanhZh: string;
  vaiTro: string;
  vaiTroEn: string;
  vaiTroZh: string;
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
    const h = CAN_NGU_HANH[c];
    const vt = TEN_VAI_TRO[i];
    const tc: TangCan = {
      can: THIEN_CAN[c], canZh: zhCua(THIEN_CAN[c]),
      hanh: h, hanhEn: enCua(h), hanhZh: zhCua(h),
      vaiTro: vt, vaiTroEn: enCua(vt), vaiTroZh: zhCua(vt),
      thapThan: "",
    };
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
export const TEN_VONG_TRUONG_SINH: ReadonlyArray<{ vi: string; en: string; zh: string }> = [
  { vi: "Tràng Sinh", en: "Growth", zh: "长生" },
  { vi: "Mộc Dục", en: "Bathing", zh: "沐浴" },
  { vi: "Quan Đới", en: "Youth", zh: "冠带" },
  { vi: "Lâm Quan", en: "Prime", zh: "临官" },
  { vi: "Đế Vượng", en: "Peak", zh: "帝旺" },
  { vi: "Suy", en: "Decline", zh: "衰" },
  { vi: "Bệnh", en: "Illness", zh: "病" },
  { vi: "Tử", en: "Death", zh: "死" },
  { vi: "Mộ", en: "Tomb", zh: "墓" },
  { vi: "Tuyệt", en: "Extinction", zh: "绝" },
  { vi: "Thai", en: "Conception", zh: "胎" },
  { vi: "Dưỡng", en: "Nurture", zh: "养" },
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
