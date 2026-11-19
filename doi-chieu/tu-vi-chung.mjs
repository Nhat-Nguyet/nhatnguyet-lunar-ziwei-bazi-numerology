// Phần dùng chung của phép đối chiếu Tử Vi: đưa lá số của hai thư viện về
// cùng một dạng rút gọn (ngày âm, can chi năm, cục, cung Mệnh, vị trí 14
// chính tinh) rồi so.

export const TRUONG = ["amLich", "canChiNam", "cuc", "menh", "chinhTinh", "laSo"];

const CAN_HAN = "甲乙丙丁戊己庚辛壬癸";
const CHI_HAN = "子丑寅卯辰巳午未申酉戌亥";
const CAN_VI = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI_VI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CUC_HAN = { 水二局: 2, 木三局: 3, 金四局: 4, 土五局: 5, 火六局: 6 };
/** Tên giản thể của 14 chính tinh trong iztro (zh-CN) sang tên của Nhat Nguyet. */
export const CHINH_TINH = {
  紫微: "Tử Vi", 天机: "Thiên Cơ", 太阳: "Thái Dương", 武曲: "Vũ Khúc", 天同: "Thiên Đồng", 廉贞: "Liêm Trinh",
  天府: "Thiên Phủ", 太阴: "Thái Âm", 贪狼: "Tham Lang", 巨门: "Cự Môn", 天相: "Thiên Tướng", 天梁: "Thiên Lương",
  七杀: "Thất Sát", 破军: "Phá Quân",
};

const mod = (a, b) => ((a % b) + b) % b;

/**
 * Lá số rút gọn theo quy tắc an sao của Nhat Nguyet, với ngày âm tính ở múi
 * giờ `tz` (7 là lịch Việt Nam, 8 là lịch Trung Quốc). Dùng đúng các hàm công
 * khai của @nhatnguyet/tu-vi mà lapLaSoTuVi dùng; tu-vi-tho.mjs kiểm rằng ở
 * tz = 7 kết quả trùng lapLaSoTuVi. Tháng nhuận an như tháng thường cùng số
 * (lapLaSoTuVi lấy thẳng số tháng âm).
 */
export function laSoLoi(amLich, tuVi, d, m, y, gio, tz) {
  const l = amLich.solarToLunar(d, m, y, tz);
  const can = mod(l.year - 4, 10);
  const chi = mod(l.year - 4, 12);
  const menh = tuVi.viTriCungMenh(l.month, gio);
  const cuc = tuVi.cucTheoCungMenh(can, menh).so;
  const sao = tuVi.viTriChinhTinh(tuVi.viTriTuVi(cuc, l.day));
  return {
    amLich: { nam: l.year, thang: l.month, ngay: l.day, nhuan: l.leap },
    canChiNam: CAN_VI[can] + " " + CHI_VI[chi],
    cuc,
    menh,
    sao,
  };
}

/**
 * Lá số rút gọn của iztro. `gio` là chỉ số chi 0 (Tý) tới 11 (Hợi); iztro
 * dùng timeIndex 0 là Tý sớm (0h tới 1h, giữ ngày đã nhập), trùng cách
 * Nhat Nguyet lấy ngày, nên truyền thẳng.
 */
export function laSoIztro(astro, ngay, gio, fixLeap) {
  const a = astro.bySolar(ngay, gio, "男", fixLeap, "zh-CN");
  const l = a.rawDates.lunarDate;
  const [canH, chiH] = a.rawDates.chineseDate.yearly;
  const sao = {};
  for (const p of a.palaces) {
    const viTri = CHI_HAN.indexOf(p.earthlyBranch);
    for (const s of p.majorStars) if (CHINH_TINH[s.name]) sao[CHINH_TINH[s.name]] = viTri;
  }
  return {
    amLich: { nam: l.lunarYear, thang: l.lunarMonth, ngay: l.lunarDay, nhuan: l.isLeap },
    canChiNam: CAN_VI[CAN_HAN.indexOf(canH)] + " " + CHI_VI[CHI_HAN.indexOf(chiH)],
    cuc: CUC_HAN[a.fiveElementsClass],
    menh: CHI_HAN.indexOf(a.earthlyBranchOfSoulPalace),
    sao,
  };
}

/** Các trường khác nhau giữa hai lá rút gọn ("laSo" khi cục, Mệnh hay chính tinh khác). */
export function soLaSo(a, b) {
  const ra = [];
  const la = a.amLich;
  const lb = b.amLich;
  if (la.nam !== lb.nam || la.thang !== lb.thang || la.ngay !== lb.ngay || la.nhuan !== lb.nhuan) ra.push("amLich");
  if (a.canChiNam !== b.canChiNam) ra.push("canChiNam");
  if (a.cuc !== b.cuc) ra.push("cuc");
  if (a.menh !== b.menh) ra.push("menh");
  const ten = Object.keys(a.sao);
  if (ten.length !== 14 || Object.keys(b.sao).length !== 14 || ten.some((t) => a.sao[t] !== b.sao[t])) ra.push("chinhTinh");
  if (ra.includes("cuc") || ra.includes("menh") || ra.includes("chinhTinh")) ra.push("laSo");
  return ra;
}

export const TEN_CHI = CHI_VI;
