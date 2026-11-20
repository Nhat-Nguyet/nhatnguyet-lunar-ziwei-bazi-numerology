// @nhatnguyet/than-so-hoc: các chỉ số thần số học theo bảng Pythagoras, tên
// tiếng Việt bỏ dấu. Chuyển ngữ phần TÍNH SỐ từ lõi tính Go của Nhật Nguyệt
// (lÃµi tÃ­nh Go cá»§a Nháº­t Nguyá»t : numerology.go, numerology_deep.go,
// numerology_dinhcao.go); các bảng ý nghĩa dài không đưa vào gói này.
//
// Quy ước cộng gộp (cộng mọi chữ số của ngày, tháng, năm rồi rút gọn, giữ số
// chủ 11, 22, 33) là quy ước thần số học đại chúng hiện đại, không phải của
// Balliett (1917): sách ấy rút gọn riêng ngày, tháng, năm trước khi cộng.

/** Phiên bản động cơ tính của bản Go mà gói này chuyển ngữ theo. */
export const PHIEN_BAN_DONG_CO = "2.3.0";

const SO_CHU = new Set([11, 22, 33]);

/** Tổng các chữ số của một số nguyên (lấy trị tuyệt đối). */
export function sumDigits(n: number): number {
  let total = 0;
  for (const ch of String(Math.abs(Math.trunc(n)))) total += ch.charCodeAt(0) - 48;
  return total;
}

/** Rút gọn về một chữ số, trừ khi gặp số chủ 11, 22, 33. */
export function reduceNumber(n: number): number {
  let r = n;
  while (r > 9 && !SO_CHU.has(r)) r = sumDigits(r);
  return r;
}

/** Rút gọn về đúng một chữ số, luôn luôn (không giữ số chủ). */
export function reduceToSingleDigit(n: number): number {
  let r = n;
  while (r > 9) r = sumDigits(r);
  return r;
}

/** Số Đường Đời: tổng chữ số của ngày, tháng, năm sinh, rút gọn giữ số chủ. */
export function soDuongDoi(dd: number, mm: number, yyyy: number): number {
  return reduceNumber(sumDigits(dd) + sumDigits(mm) + sumDigits(yyyy));
}

/** Giá trị chữ cái theo bảng Pythagoras (a, j, s là 1; b, k, t là 2...). */
export const GIA_TRI_CHU: Readonly<Record<string, number>> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

/** Nguyên âm (chữ y KHÔNG tính là nguyên âm). */
const NGUYEN_AM = new Set(["a", "e", "i", "o", "u"]);

// Bảng bỏ dấu tiếng Việt (chữ thường), chép từ diacriticsMap của bản Go.
const BO_DAU: Readonly<Record<string, string>> = (() => {
  const nhom: Array<[string, string]> = [
    ["àáạảãâầấậẩẫăằắặẳẵ", "a"],
    ["èéẹẻẽêềếệểễ", "e"],
    ["ìíịỉĩ", "i"],
    ["òóọỏõôồốộổỗơờớợởỡ", "o"],
    ["ùúụủũưừứựửữ", "u"],
    ["ỳýỵỷỹ", "y"],
    ["đ", "d"],
  ];
  const m: Record<string, string> = {};
  for (const [cac, goc] of nhom) for (const c of cac) m[c] = goc;
  return m;
})();

/**
 * Chữ thường của MỘT ký tự theo kiểu unicode.ToLower của Go: luôn ra đúng
 * một ký tự (JS có vài ký tự đổi thành hai, như İ thành i cộng dấu chấm).
 */
function chuThuong(c: string): string {
  const l = c.toLowerCase();
  const dau = l.codePointAt(0);
  return dau === undefined ? c : String.fromCodePoint(dau);
}

/** Bỏ dấu và giữ đúng chữ a tới z (bỏ khoảng trắng, số, ký tự khác) để quy đổi Pythagoras. */
export function stripDiacritics(input: string): string {
  let ra = "";
  for (const c of input) {
    const l = chuThuong(c);
    const goc = BO_DAU[l];
    if (goc !== undefined) ra += goc;
    else if (l >= "a" && l <= "z" && l.length === 1) ra += l;
  }
  return ra;
}

/**
 * Bỏ dấu tiếng Việt và chuyển chữ thường, GIỮ NGUYÊN khoảng trắng, số và ký
 * tự khác (như FoldVietnamese của bản Go: đ thành d, ơ thành o...).
 */
export function foldVietnamese(input: string): string {
  let ra = "";
  for (const c of input) {
    const l = chuThuong(c);
    ra += BO_DAU[l] ?? l;
  }
  return ra;
}

/** Slug đường dẫn từ chuỗi tiếng Việt: bỏ dấu, chữ thường, nối bằng "-". */
export function slugify(input: string): string {
  let ra = "";
  let vuaGach = true;
  for (const c of input) {
    const l = chuThuong(c);
    let out: string;
    const goc = BO_DAU[l];
    if (goc !== undefined) out = goc;
    else if (l.length === 1 && ((l >= "a" && l <= "z") || (l >= "0" && l <= "9"))) out = l;
    else out = "-";
    if (out === "-") {
      if (!vuaGach) {
        ra += "-";
        vuaGach = true;
      }
      continue;
    }
    ra += out;
    vuaGach = false;
  }
  return ra.replace(/^-+|-+$/g, "");
}

function tongChu(hoTen: string, chon: (ch: string) => boolean): number {
  let total = 0;
  for (const ch of stripDiacritics(hoTen)) if (chon(ch)) total += GIA_TRI_CHU[ch] ?? 0;
  return reduceNumber(total);
}

/** Số Sứ Mệnh: mọi chữ của họ tên. */
export function soSuMenh(hoTen: string): number {
  return tongChu(hoTen, () => true);
}

/** Số Linh Hồn: chỉ nguyên âm a, e, i, o, u. */
export function soLinhHon(hoTen: string): number {
  return tongChu(hoTen, (ch) => NGUYEN_AM.has(ch));
}

/** Số Nhân Cách: chỉ phụ âm (kể cả y). */
export function soNhanCach(hoTen: string): number {
  return tongChu(hoTen, (ch) => !NGUYEN_AM.has(ch));
}

/** Bốn chỉ số chính. */
export interface HoSoThanSoHoc {
  soDuongDoi: number;
  soSuMenh: number;
  soLinhHon: number;
  soNhanCach: number;
}

/** Bốn chỉ số chính từ họ tên và ngày sinh. */
export function tinhHoSoThanSoHoc(hoTen: string, dd: number, mm: number, yyyy: number): HoSoThanSoHoc {
  return {
    soDuongDoi: soDuongDoi(dd, mm, yyyy),
    soSuMenh: soSuMenh(hoTen),
    soLinhHon: soLinhHon(hoTen),
    soNhanCach: soNhanCach(hoTen),
  };
}

/** Số Thái Độ: ngày và tháng sinh, rút gọn giữ số chủ. */
export function soThaiDo(dd: number, mm: number): number {
  return reduceNumber(sumDigits(dd) + sumDigits(mm));
}

/** Số Ngày Sinh: ngày sinh rút gọn hẳn về một chữ số. */
export function soNgaySinh(dd: number): number {
  return reduceToSingleDigit(dd);
}

/** Số Trưởng Thành: Số Đường Đời cộng Số Sứ Mệnh, rút gọn giữ số chủ. */
export function soTruongThanh(soDuongDoiDaTinh: number, soSuMenhDaTinh: number): number {
  return reduceNumber(soDuongDoiDaTinh + soSuMenhDaTinh);
}

/** Số Năm Cá Nhân của năm `namXem`: ngày, tháng sinh cộng năm xem, không giữ số chủ. */
export function soNamCaNhan(dd: number, mm: number, namXem: number): number {
  return reduceToSingleDigit(sumDigits(dd) + sumDigits(mm) + sumDigits(namXem));
}

/** Số Tháng Cá Nhân của tháng `thangXem` trong năm `namXem`. */
export function soThangCaNhan(dd: number, mm: number, namXem: number, thangXem: number): number {
  return reduceToSingleDigit(soNamCaNhan(dd, mm, namXem) + sumDigits(thangXem));
}

/** Số Ngày Cá Nhân của ngày `ngayXem`, tháng `thangXem`, năm `namXem`. */
export function soNgayCaNhan(dd: number, mm: number, namXem: number, thangXem: number, ngayXem: number): number {
  return reduceToSingleDigit(soThangCaNhan(dd, mm, namXem, thangXem) + sumDigits(ngayXem));
}

/** Lưới Pythagoras: số lần mỗi chữ số 1 tới 9 xuất hiện trong ngày, tháng, năm sinh viết liền. */
export type LuoiPythago = Record<"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9", number>;

export function luoiPythago(dd: number, mm: number, yyyy: number): LuoiPythago {
  const dem: LuoiPythago = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0 };
  for (const c of String(dd) + String(mm) + String(yyyy)) {
    if (c >= "1" && c <= "9") dem[c as keyof LuoiPythago]++;
  }
  return dem;
}

/** Bốn Số Đỉnh Cao (giữ số chủ) và tuổi kết thúc ba đỉnh đầu. */
export interface PinnacleNumbers {
  dinh1: number;
  dinh2: number;
  dinh3: number;
  dinh4: number;
  /** 36 trừ Số Đường Đời đã rút về một chữ số (11 tính là 2), nên nằm trong 27 tới 35. */
  tuoiKetThucDinh1: number;
  tuoiKetThucDinh2: number;
  tuoiKetThucDinh3: number;
}

/** Bốn Số Đỉnh Cao từ ngày sinh và Số Đường Đời đã tính. */
export function tinhSoDinhCao(dd: number, mm: number, yyyy: number, soDuongDoiDaTinh: number): PinnacleNumbers {
  const d1 = reduceNumber(sumDigits(mm) + sumDigits(dd));
  const d2 = reduceNumber(sumDigits(dd) + sumDigits(yyyy));
  const d3 = reduceNumber(d1 + d2);
  const d4 = reduceNumber(sumDigits(mm) + sumDigits(yyyy));
  const end1 = 36 - reduceToSingleDigit(soDuongDoiDaTinh);
  return {
    dinh1: d1,
    dinh2: d2,
    dinh3: d3,
    dinh4: d4,
    tuoiKetThucDinh1: end1,
    tuoiKetThucDinh2: end1 + 9,
    tuoiKetThucDinh3: end1 + 18,
  };
}

/** Bốn Số Thách Thức, mỗi số 0 tới 8, không bao giờ là số chủ. */
export interface ChallengeNumbers {
  thachThuc1: number;
  thachThuc2: number;
  thachThuc3: number;
  thachThuc4: number;
}

/** Bốn Số Thách Thức: rút gọn riêng tháng, ngày, năm rồi lấy hiệu tuyệt đối theo cặp. */
export function tinhSoThachThuc(dd: number, mm: number, yyyy: number): ChallengeNumbers {
  const m = reduceToSingleDigit(sumDigits(mm));
  const d = reduceToSingleDigit(sumDigits(dd));
  const y = reduceToSingleDigit(sumDigits(yyyy));
  const t1 = Math.abs(m - d);
  const t2 = Math.abs(d - y);
  const t3 = Math.abs(t1 - t2);
  const t4 = Math.abs(m - y);
  return { thachThuc1: t1, thachThuc2: t2, thachThuc3: t3, thachThuc4: t4 };
}

/** Số Nợ Nghiệp trên ngày sinh: 13, 14, 16, 19 thì trả chính ngày ấy, còn lại 0. */
export function soNoNghiepNgaySinh(dd: number): number {
  return dd === 13 || dd === 14 || dd === 16 || dd === 19 ? dd : 0;
}

/** Hồ sơ thần số học đầy đủ. */
export interface HoSoThanSoHocSau extends HoSoThanSoHoc {
  soThaiDo: number;
  soNgaySinh: number;
  soTruongThanh: number;
  soNamCaNhan: number;
  soThangCaNhan: number;
  soNgayCaNhan: number;
  luoiPythago: LuoiPythago;
  soDinhCao: PinnacleNumbers;
  soThachThuc: ChallengeNumbers;
  /** Chỉ có mặt khi ngày sinh là 13, 14, 16 hay 19 (bản Go bỏ khoá khi bằng 0). */
  soNoNghiepNgaySinh?: number;
}

/**
 * Hồ sơ đầy đủ từ họ tên, ngày sinh và ngày đang xem.
 *
 * Khác bản Go: Go lấy tháng và ngày cá nhân theo đồng hồ máy chủ; ở đây
 * chúng tính theo `ngayXem`/`thangXem`/`namXem` truyền vào, nên hàm thuần và
 * cho cùng kết quả ở mọi máy. `namXem` bằng 0 thì Số Năm Cá Nhân là 0 (như
 * bản Go) và tháng, ngày cá nhân tính với năm 0.
 */
export function tinhHoSoThanSoHocSau(
  hoTen: string,
  dd: number,
  mm: number,
  yyyy: number,
  namXem: number,
  thangXem: number,
  ngayXem: number,
): HoSoThanSoHocSau {
  const goc = tinhHoSoThanSoHoc(hoTen, dd, mm, yyyy);
  const ra: HoSoThanSoHocSau = {
    ...goc,
    soThaiDo: soThaiDo(dd, mm),
    soNgaySinh: soNgaySinh(dd),
    soTruongThanh: soTruongThanh(goc.soDuongDoi, goc.soSuMenh),
    soNamCaNhan: namXem > 0 ? soNamCaNhan(dd, mm, namXem) : 0,
    soThangCaNhan: soThangCaNhan(dd, mm, namXem, thangXem),
    soNgayCaNhan: soNgayCaNhan(dd, mm, namXem, thangXem, ngayXem),
    luoiPythago: luoiPythago(dd, mm, yyyy),
    soDinhCao: tinhSoDinhCao(dd, mm, yyyy, goc.soDuongDoi),
    soThachThuc: tinhSoThachThuc(dd, mm, yyyy),
  };
  const noNghiep = soNoNghiepNgaySinh(dd);
  if (noNghiep !== 0) ra.soNoNghiepNgaySinh = noNghiep;
  return ra;
}

// Lớp API tiếng Anh (tham số đặt tên, nhãn theo lang).
export * from "./en.ts";
export * from "./ve-svg.ts";
export * from "./van-ban.ts";
