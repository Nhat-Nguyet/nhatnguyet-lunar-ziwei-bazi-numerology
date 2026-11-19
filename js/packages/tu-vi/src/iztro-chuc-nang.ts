// Phần HÀM của lớp tương thích iztro: palace(), star(), surroundedPalaces(),
// horoscope()... gắn lên đối tượng `astro.bySolar` trả về, cùng tên và cùng
// cách gọi với FunctionalAstrolabe của iztro 2.6, nhưng mọi giá trị lấy từ lõi
// Nhật Nguyệt:
//
// - đại hạn: `daiVan` (12 chặng, chặng đầu ở cung Mệnh từ tuổi bằng số cục);
// - tiểu hạn: tiểu vận của `tinhHanNam` (khởi theo tam hợp chi năm sinh, nam
//   thuận, nữ nghịch);
// - lưu niên: cung mang chi năm xem, lưu Tứ Hóa của `tinhHanNam`, bốn sao lưu
//   của `tinhSaoLuu` (Lộc Tồn, Kình Dương, Đà La theo can; Thiên Mã theo chi);
// - lưu nguyệt: nguyệt hạn theo lưu Đẩu Quân (`tinhNguyetHan`);
// - tứ hóa của đại hạn, tiểu hạn và đường bay (fliesTo, selfMutaged): bảng Tứ
//   Hóa của lõi áp cho can cung, đúng như phép phi tinh của lõi Go
//   (LapMachNoiCung, tuvi_phitinh.go).
//
// Lõi KHÔNG có, nên để trống chứ không tự đặt luật: đồng hạn (童限, trước đại
// hạn đầu: decadal là null), sao lưu của đại hạn và của tháng (vận khôi, vận
// xương... ), lưu Văn Xương, Văn Khúc, Khôi, Việt, Hồng Loan, Thiên Hỷ, Niên
// Giải của năm, tứ hóa của tháng, lưu nhật, lưu thời (daily, hourly là null),
// vòng Tướng Tinh và vòng Tuế Tiền của năm (yearlyDecStar để mảng rỗng).
//
// Mọi hàm gắn KHÔNG liệt kê (enumerable: false), nên JSON.stringify ra đúng khuôn
// dữ liệu như trước.
//
// Functional part of the iztro compatibility layer: same method names as
// iztro 2.6, values from the Nhat Nguyet engine; what the engine does not
// compute is null or empty, never guessed.

import { canThangDan, lunarToSolar, mod, solarToLunar } from "@nhatnguyet/am-lich";
import type { LunarDate } from "@nhatnguyet/am-lich";
import { tuHoaTheoPhai } from "./schools.ts";
import { daiVan } from "./chieu-sau.ts";
import { tinhHanNam, tinhNguyetHan } from "./luu-nien.ts";
import { tinhSaoLuu } from "./luu-sao.ts";
import { CAN_KHOA, CAN_VI, CHI_KHOA, CUNG_KHOA, HOA_KHOA, SANG_KHOA, SAO_KHOA, docNgay, ngayAmChuHan, ngayKe } from "./iztro-bang.ts";
import type { StarType } from "./iztro-bang.ts";
import { IZTRO_LANGUAGES, NHAN_IZTRO } from "./iztro-nhan.ts";
import type { IztroLanguage } from "./iztro-nhan.ts";
import type { LaSoTuVi } from "./kieu.ts";

// Kiểu dữ liệu tối thiểu của lá số, tránh nhập vòng với iztro.ts.
interface SaoDuLieu {
  name: string;
  type: StarType;
  scope: string;
  brightness?: string;
  mutagen?: string;
}
interface CungDuLieu {
  index: number;
  name: string;
  isBodyPalace: boolean;
  isOriginalPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: SaoDuLieu[];
  minorStars: SaoDuLieu[];
  adjectiveStars: SaoDuLieu[];
  decadal: { range: [number, number]; heavenlyStem: string; earthlyBranch: string };
  ages: number[];
}
interface LaDuLieu {
  palaces: CungDuLieu[];
  rawDates: { lunarDate: { lunarYear: number } };
}

/** Phạm vi vận hạn, như iztro. */
export type Scope = "origin" | "decadal" | "age" | "yearly" | "monthly" | "daily" | "hourly";
/** Một trong bốn hóa: tên iztro ở bất kỳ ngôn ngữ nào ("禄", "Lộc", "A"...). */
export type Mutagen = string;

/** Sao có hàm, như iztro FunctionalStar. */
export interface FunctionalStar extends SaoDuLieu {
  palace(): FunctionalPalace | undefined;
  surroundedPalaces(): FunctionalSurpalaces | undefined;
  oppositePalace(): FunctionalPalace | undefined;
  withMutagen(mutagen: Mutagen | Mutagen[]): boolean;
  withBrightness(brightness: string | string[]): boolean;
  toJSON(): SaoDuLieu;
}

/** Cung có hàm, như iztro FunctionalPalace. */
export interface FunctionalPalace extends CungDuLieu {
  majorStars: FunctionalStar[];
  minorStars: FunctionalStar[];
  adjectiveStars: FunctionalStar[];
  has(stars: string[]): boolean;
  notHave(stars: string[]): boolean;
  hasOneOf(stars: string[]): boolean;
  hasMutagen(mutagen: Mutagen): boolean;
  notHaveMutagen(mutagen: Mutagen): boolean;
  isEmpty(excludeStars?: string[]): boolean;
  astrolabe(): FunctionalAstrolabe;
  /** Can của cung hóa (các) sao trong `withMutagens`, và mọi sao ấy ở cung `to`. */
  fliesTo(to: number | string, withMutagens: Mutagen | Mutagen[]): boolean;
  fliesOneOfTo(to: number | string, withMutagens: Mutagen[]): boolean;
  notFlyTo(to: number | string, withMutagens: Mutagen | Mutagen[]): boolean;
  /** Tự hóa: sao do can cung hóa nằm ngay trong cung. */
  selfMutaged(withMutagens: Mutagen | Mutagen[]): boolean;
  selfMutagedOneOf(withMutagens?: Mutagen[]): boolean;
  notSelfMutaged(withMutagens?: Mutagen | Mutagen[]): boolean;
  /** Bốn cung nhận Lộc, Quyền, Khoa, Kỵ của can cung (undefined khi sao không có trên lá). */
  mutagedPlaces(): (FunctionalPalace | undefined)[];
  toJSON(): CungDuLieu;
}

/** Tam phương tứ chính: cung, cung xung chiếu (+6), Tài (+8), Quan (+4). */
export interface FunctionalSurpalaces {
  target: FunctionalPalace;
  opposite: FunctionalPalace;
  wealth: FunctionalPalace;
  career: FunctionalPalace;
  have(stars: string[]): boolean;
  notHave(stars: string[]): boolean;
  haveOneOf(stars: string[]): boolean;
  haveMutagen(mutagen: Mutagen): boolean;
  notHaveMutagen(mutagen: Mutagen): boolean;
  toJSON(): unknown;
}

/** Hai cung kẹp (giáp) một cung. */
export interface FunctionalFlankingPalaces {
  previous: FunctionalPalace;
  next: FunctionalPalace;
  have(stars: string[]): boolean;
  notHave(stars: string[]): boolean;
  haveOneOf(stars: string[]): boolean;
  haveMutagen(mutagen: Mutagen): boolean;
  notHaveMutagen(mutagen: Mutagen): boolean;
  toJSON(): unknown;
}

/** Sao lưu của một phạm vi. */
export interface HoroscopeStar {
  name: string;
  type: StarType;
  scope: Scope;
}

/** Một phạm vi vận hạn, khuôn của iztro HoroscopeItem. */
export interface HoroscopeItem {
  /** Chỉ số cung (0 là cung Dần, như iztro). */
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  /** Tên mười hai cung khi lấy cung của phạm vi làm Mệnh, theo chỉ số cung. */
  palaceNames: string[];
  /** Bốn sao Lộc, Quyền, Khoa, Kỵ; rỗng khi lõi không tính tứ hóa cho phạm vi ấy. */
  mutagen: string[];
  /** Sao lưu theo chỉ số cung; chỉ có ở lưu niên (lõi chưa an sao lưu của đại hạn, của tháng). */
  stars?: HoroscopeStar[][];
}

export type DecadalHoroscope = HoroscopeItem & { palaceName: string; ageRange: [number, number]; yearRange: [number, number] };
export type YearlyHoroscope = HoroscopeItem & { age: number; year: number };
export type MonthlyHoroscope = YearlyHoroscope & { month: number; isLeapMonth: boolean; part: "normal" | "first" | "second"; dayRange: [number, number] };

/** Vận hạn của một ngày, khuôn của iztro FunctionalHoroscope. */
export interface FunctionalHoroscope {
  lunarDate: string;
  solarDate: string;
  /** null trước đại hạn đầu (lõi không có luật đồng hạn) hay sau chặng thứ mười hai. */
  decadal: HoroscopeItem | null;
  age: HoroscopeItem & { nominalAge: number };
  yearly: HoroscopeItem & { yearlyDecStar: { jiangqian12: string[]; suiqian12: string[] } };
  monthly: HoroscopeItem;
  /** Lõi chưa có lưu nhật. */
  daily: null;
  /** Lõi chưa có lưu thời. */
  hourly: null;
  readonly astrolabe: FunctionalAstrolabe;
  agePalace(): FunctionalPalace | undefined;
  palace(palaceName: string, scope: Scope): FunctionalPalace | undefined;
  surroundPalaces(palaceName: string, scope: Scope): FunctionalSurpalaces | undefined;
  hasHoroscopeStars(palaceName: string, scope: Scope, horoscopeStar: string[]): boolean;
  notHaveHoroscopeStars(palaceName: string, scope: Scope, horoscopeStar: string[]): boolean;
  hasOneOfHoroscopeStars(palaceName: string, scope: Scope, horoscopeStar: string[]): boolean;
  hasHoroscopeMutagen(palaceName: string, scope: Scope, horoscopeMutagen: Mutagen): boolean;
  toJSON(): unknown;
}

/** Lá số có hàm, như iztro FunctionalAstrolabe. */
export interface FunctionalAstrolabe {
  palaces: FunctionalPalace[];
  palace(indexOrName: number | string): FunctionalPalace | undefined;
  star(starName: string): FunctionalStar;
  surroundedPalaces(indexOrName: number | string): FunctionalSurpalaces;
  flankingPalaces(indexOrName: number | string): FunctionalFlankingPalaces;
  isSurrounded(indexOrName: number | string, stars: string[]): boolean;
  isSurroundedOneOf(indexOrName: number | string, stars: string[]): boolean;
  notSurrounded(indexOrName: number | string, stars: string[]): boolean;
  /**
   * Vận hạn ở một ngày dương (mặc định hôm nay), đọc theo lịch của lá số.
   * `timeIndex` 12 (Tý muộn) tính sang ngày hôm sau, như iztro.
   */
  horoscope(date?: string | Date, timeIndex?: number): FunctionalHoroscope;
  decadalList(): DecadalHoroscope[];
  yearlyList(indexOrName: number | string): YearlyHoroscope[];
  monthlyList(year: number, fixLeap?: boolean): MonthlyHoroscope[];
  use(plugin: (this: FunctionalAstrolabe) => void): void;
  toJSON(): unknown;
}

/** Ngữ cảnh bySolar trao cho phần hàm. */
export interface NguCanhIztro {
  raw: LaSoTuVi;
  language: IztroLanguage;
  timeZone: number;
  fixLeap: boolean;
  /** Tháng âm lõi đã dùng để an sao (theo fixLeap). */
  thangAn: number;
  /** Khoá iztro của từng sao trên lá. */
  khoaSao: WeakMap<object, string>;
}

// ── Tra tên sang khoá (như kot của iztro, mọi ngôn ngữ) ─────────────────

const KHOA_HOA = ["sihuaLu", "sihuaQuan", "sihuaKe", "sihuaJi"];
const NHOM: Readonly<Record<"sao" | "cung" | "hoa" | "sang", ReadonlySet<string>>> = {
  sao: new Set([...Object.values(SAO_KHOA).map((x) => x[0]), "xunkong", "jielu", "kongwang", "liulu", "liuyang", "liutuo", "liuma"]),
  cung: new Set([...Object.values(CUNG_KHOA), "originalPalace", "bodyPalace"]),
  hoa: new Set(KHOA_HOA),
  sang: new Set(["miao", "wang", "de", "li", "ping", "bu", "xian"]),
};
type TenNhom = keyof typeof NHOM;
const CHI_MUC = new Map<string, Map<string, string[]>>();

function chiMuc(nhom: TenNhom, lang: IztroLanguage): Map<string, string[]> {
  const k = nhom + "|" + lang;
  let m = CHI_MUC.get(k);
  if (!m) {
    m = new Map();
    for (const [khoa, ten] of Object.entries(NHAN_IZTRO[lang])) {
      if (!NHOM[nhom].has(khoa)) continue;
      const ds = m.get(ten) ?? [];
      ds.push(khoa);
      m.set(ten, ds);
    }
    CHI_MUC.set(k, m);
  }
  return m;
}

/** Khoá iztro của một tên: tra ngôn ngữ của lá trước, rồi năm ngôn ngữ kia; nhận cả khoá. */
function khoaCua(ten: unknown, nhom: TenNhom, lang: IztroLanguage): string[] {
  if (typeof ten !== "string") return [];
  if (NHOM[nhom].has(ten)) return [ten];
  if (nhom === "hoa" && HOA_KHOA[ten]) return [HOA_KHOA[ten]];
  const dau = chiMuc(nhom, lang).get(ten);
  if (dau) return dau;
  const ra = new Set<string>();
  for (const l of IZTRO_LANGUAGES) for (const k of chiMuc(nhom, l).get(ten) ?? []) ra.add(k);
  return [...ra];
}

function anHam<T extends object>(o: T, ham: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(ham)) Object.defineProperty(o, k, { value: v, enumerable: false, writable: true, configurable: true });
}

/** Bản dữ liệu thuần (chỉ khoá liệt kê), cho toJSON. */
function banPhang(x: unknown): unknown {
  if (Array.isArray(x)) return x.map(banPhang);
  if (x && typeof x === "object") {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(x)) o[k] = banPhang((x as Record<string, unknown>)[k]);
    return o;
  }
  return x;
}

/** Giờ đồng hồ sang chỉ số giờ của iztro (0 Tý sớm ... 12 Tý muộn). */
function chiSoGio(h: number): number {
  if (h === 0) return 0;
  if (h === 23) return 12;
  return Math.floor((h + 1) / 2);
}

// ── Gắn hàm ──────────────────────────────────────────────────────────────

/** Gắn các hàm kiểu iztro lên lá số dữ liệu `a` (không đổi JSON của nó). */
export function ganChucNang(a: LaDuLieu, nc: NguCanhIztro): FunctionalAstrolabe {
  const { raw, language, timeZone } = nc;
  const T = NHAN_IZTRO[language];
  const t = (k: string) => T[k] ?? "";
  const A = a as unknown as FunctionalAstrolabe;
  const P = a.palaces as FunctionalPalace[];
  // Can của từng cung (chỉ số iztro, 0 là Dần).
  const canCung = P.map((_, i) => CAN_VI.indexOf(raw.cung[mod(i + 2, 12)].canChi.split(" ")[0]));
  // Thứ tự tên cung của lõi: khoá cung ở Mệnh, Mệnh + 1, Mệnh + 2...
  const thuTuCung = Array.from({ length: 12 }, (_, k) => CUNG_KHOA[raw.cung[mod(raw.cungMenh + k, 12)].tenCung]);
  // Tên mười hai cung khi cung `tu` làm Mệnh (đại hạn Mệnh, lưu niên Mệnh...).
  const tenXoay = (tu: number) => Array.from({ length: 12 }, (_, i) => t(thuTuCung[mod(i - tu, 12)]));

  const khoaSaoCua = (s: SaoDuLieu) => nc.khoaSao.get(s) ?? khoaCua(s.name, "sao", language)[0] ?? "";
  const khoaSaoCung = (p: CungDuLieu) => [...p.majorStars, ...p.minorStars, ...p.adjectiveStars].map(khoaSaoCua);
  const coDu = (tap: string[], ds: string[]) => ds.every((x) => khoaCua(x, "sao", language).some((k) => tap.includes(k)));
  const coMot = (tap: string[], ds: string[]) => ds.some((x) => khoaCua(x, "sao", language).some((k) => tap.includes(k)));
  const khongCo = (tap: string[], ds: string[]) => ds.every((x) => !khoaCua(x, "sao", language).some((k) => tap.includes(k)));
  const khoaHoa = (m: unknown) => khoaCua(m, "hoa", language)[0];
  const coHoa = (p: CungDuLieu, m: Mutagen) => {
    const k = khoaHoa(m);
    return !!k && [...p.majorStars, ...p.minorStars].some((s) => !!s.mutagen && khoaHoa(s.mutagen) === k);
  };
  // Bốn sao (khoá iztro) do một can hóa, theo bảng Tứ Hóa của lõi.
  const saoHoaCuaCan = (can: number) => {
    const th = tuHoaTheoPhai(can, raw.schools?.transformations);
    return [th.loc, th.quyen, th.khoa, th.ky].map((v) => SAO_KHOA[v][0]);
  };
  const saoHoa = (can: number, muts: unknown) => {
    const bon = saoHoaCuaCan(can);
    const ra: string[] = [];
    for (const m of Array.isArray(muts) ? muts : [muts]) {
      const i = KHOA_HOA.indexOf(khoaHoa(m) ?? "");
      if (i >= 0) ra.push(bon[i]);
    }
    return ra;
  };

  const timCung = (indexOrName: number | string): FunctionalPalace | undefined => {
    if (typeof indexOrName === "number") {
      if (!Number.isInteger(indexOrName) || indexOrName < 0 || indexOrName > 11) throw new Error("invalid palace index.");
      return P[indexOrName];
    }
    const ks = khoaCua(indexOrName, "cung", language);
    return P.find((p) => (ks.includes("originalPalace") && p.isOriginalPalace) || (ks.includes("bodyPalace") && p.isBodyPalace) ||
      ks.includes(khoaCua(p.name, "cung", language)[0] ?? ""));
  };
  const canCo = (indexOrName: number | string): FunctionalPalace => {
    const p = timCung(indexOrName);
    if (!p) throw new Error("invalid palace index or name.");
    return p;
  };

  const tamPhuong = (indexOrName: number | string): FunctionalSurpalaces => {
    const p = canCo(indexOrName);
    const o = { target: p, opposite: P[mod(p.index + 6, 12)], wealth: P[mod(p.index + 8, 12)], career: P[mod(p.index + 4, 12)] };
    const tap = () => [o.target, o.opposite, o.wealth, o.career].flatMap(khoaSaoCung);
    anHam(o, {
      have: (ds: string[]) => coDu(tap(), ds),
      notHave: (ds: string[]) => khongCo(tap(), ds),
      haveOneOf: (ds: string[]) => coMot(tap(), ds),
      haveMutagen: (m: Mutagen) => [o.target, o.opposite, o.wealth, o.career].some((c) => coHoa(c, m)),
      notHaveMutagen: (m: Mutagen) => ![o.target, o.opposite, o.wealth, o.career].some((c) => coHoa(c, m)),
      toJSON: () => banPhang(o),
    });
    return o as FunctionalSurpalaces;
  };

  const giap = (indexOrName: number | string): FunctionalFlankingPalaces => {
    const p = canCo(indexOrName);
    const o = { previous: P[mod(p.index - 1, 12)], next: P[mod(p.index + 1, 12)] };
    const tap = () => [o.previous, o.next].flatMap(khoaSaoCung);
    anHam(o, {
      have: (ds: string[]) => coDu(tap(), ds),
      notHave: (ds: string[]) => khongCo(tap(), ds),
      haveOneOf: (ds: string[]) => coMot(tap(), ds),
      haveMutagen: (m: Mutagen) => coHoa(o.previous, m) || coHoa(o.next, m),
      notHaveMutagen: (m: Mutagen) => !(coHoa(o.previous, m) || coHoa(o.next, m)),
      toJSON: () => banPhang(o),
    });
    return o as FunctionalFlankingPalaces;
  };

  // Hàm của từng cung và từng sao.
  for (const p of P) {
    const tap = () => khoaSaoCung(p);
    const can = canCung[p.index];
    anHam(p, {
      has: (ds: string[]) => coDu(tap(), ds),
      notHave: (ds: string[]) => khongCo(tap(), ds),
      hasOneOf: (ds: string[]) => coMot(tap(), ds),
      hasMutagen: (m: Mutagen) => coHoa(p, m),
      notHaveMutagen: (m: Mutagen) => !coHoa(p, m),
      isEmpty: (tru?: string[]) => {
        if (p.majorStars.some((s) => s.type === "major")) return false;
        if (tru && tru.length && coMot(tap(), tru)) return false;
        return true;
      },
      astrolabe: () => A,
      fliesTo: (to: number | string, muts: Mutagen | Mutagen[]) => {
        const dich = timCung(to);
        const sao = saoHoa(can, muts);
        return !!dich && sao.length > 0 && sao.every((k) => khoaSaoCung(dich).includes(k));
      },
      fliesOneOfTo: (to: number | string, muts: Mutagen[]) => {
        const dich = timCung(to);
        if (!dich) return false;
        const sao = saoHoa(can, muts);
        return sao.length === 0 || sao.some((k) => khoaSaoCung(dich).includes(k));
      },
      notFlyTo: (to: number | string, muts: Mutagen | Mutagen[]) => {
        const dich = timCung(to);
        if (!dich) return false;
        return saoHoa(can, muts).every((k) => !khoaSaoCung(dich).includes(k));
      },
      selfMutaged: (muts: Mutagen | Mutagen[]) => saoHoa(can, muts).every((k) => tap().includes(k)),
      selfMutagedOneOf: (muts?: Mutagen[]) => saoHoa(can, muts && muts.length ? muts : KHOA_HOA).some((k) => tap().includes(k)),
      notSelfMutaged: (muts?: Mutagen | Mutagen[]) =>
        saoHoa(can, muts && (!Array.isArray(muts) || muts.length) ? muts : KHOA_HOA).every((k) => !tap().includes(k)),
      mutagedPlaces: () => saoHoaCuaCan(can).map((k) => P.find((c) => khoaSaoCung(c).includes(k))),
      toJSON: () => banPhang(p),
    });
    for (const s of [...p.majorStars, ...p.minorStars, ...p.adjectiveStars]) {
      anHam(s, {
        palace: () => p,
        surroundedPalaces: () => tamPhuong(p.index),
        oppositePalace: () => P[mod(p.index + 6, 12)],
        withMutagen: (m: Mutagen | Mutagen[]) => !!s.mutagen && (Array.isArray(m) ? m : [m]).some((x) => khoaHoa(x) === khoaHoa(s.mutagen)),
        withBrightness: (b: string | string[]) => {
          if (!s.brightness) return false;
          const k = khoaCua(s.brightness, "sang", language)[0];
          return (Array.isArray(b) ? b : [b]).some((x) => khoaCua(x, "sang", language)[0] === k);
        },
        toJSON: () => banPhang(s),
      });
    }
  }

  // ── Vận hạn ──
  const namSinh = raw.ngaySinhAm.year;
  // Nguyệt hạn đọc tháng sinh của lá: dùng đúng tháng lõi đã an sao (theo fixLeap).
  const rawThang: LaSoTuVi = { ...raw, ngaySinhAm: { ...raw.ngaySinhAm, month: nc.thangAn } };

  const phamViCung = (viTri: number, ten: string): HoroscopeItem => {
    const i = mod(viTri - 2, 12);
    return {
      index: i, name: t(ten), heavenlyStem: P[i].heavenlyStem, earthlyBranch: P[i].earthlyBranch,
      palaceNames: tenXoay(i), mutagen: saoHoaCuaCan(canCung[i]).map(t),
    };
  };
  const daiHan = (tuoi: number): HoroscopeItem | null => {
    const c = daiVan(raw).find((v) => tuoi >= v.tuTuoi && tuoi <= v.denTuoi);
    return c ? phamViCung(c.viTri, "decadal") : null;
  };
  const SAO_LUU: Readonly<Record<string, [string, StarType]>> = {
    "luu-loc-ton": ["liulu", "lucun"], "luu-kinh-duong": ["liuyang", "tough"], "luu-da-la": ["liutuo", "tough"], "luu-thien-ma": ["liuma", "tianma"],
  };
  const luuNien = (nam: number) => {
    const hn = tinhHanNam(raw, nam);
    const i = mod(hn.luuNienViTri - 2, 12);
    const stars: HoroscopeStar[][] = Array.from({ length: 12 }, () => []);
    for (const s of tinhSaoLuu(raw, nam)) {
      const m = SAO_LUU[s.ma];
      if (m) stars[mod(s.viTri - 2, 12)].push({ name: t(m[0]), type: m[1], scope: "yearly" });
    }
    return {
      hn,
      item: {
        index: i, name: t("yearly"), heavenlyStem: t(CAN_KHOA[mod(nam - 4, 10)]), earthlyBranch: t(CHI_KHOA[mod(nam - 4, 12)]),
        palaceNames: tenXoay(i), mutagen: hn.luuTuHoa.map((x) => t(SAO_KHOA[x.sao][0])), stars,
        yearlyDecStar: { jiangqian12: [] as string[], suiqian12: [] as string[] },
      },
    };
  };
  // Tháng xem: tháng nhuận theo fixLeap của lá; can chi tháng như chineseDate (nửa sau tháng nhuận là tháng sau).
  const luuNguyet = (nam: number, am: Pick<LunarDate, "month" | "leap" | "day">, fixLeap: boolean): HoroscopeItem => {
    const thang = am.month + (am.leap && fixLeap && am.day > 15 ? 1 : 0);
    const nh = tinhNguyetHan(rawThang, mod(nam - 4, 12));
    const i = mod(nh.thang[mod(thang - 1, 12)].viTri - 2, 12);
    const thangTru = am.month - 1 + (am.leap && am.day > 15 ? 1 : 0);
    return {
      index: i, name: t("monthly"),
      heavenlyStem: t(CAN_KHOA[mod(canThangDan(mod(nam - 4, 10)) + thangTru, 10)]), earthlyBranch: t(CHI_KHOA[mod(2 + thangTru, 12)]),
      palaceNames: tenXoay(i), mutagen: [],
    };
  };

  const vanHan = (am: LunarDate, solarDate: string): FunctionalHoroscope => {
    const { hn, item: yearly } = luuNien(am.year);
    const tieu = phamViCung(hn.tieuVanViTri, "turn");
    const h = {
      lunarDate: ngayAmChuHan(am),
      solarDate,
      decadal: daiHan(hn.tuoiMu),
      age: { index: tieu.index, nominalAge: hn.tuoiMu, name: tieu.name, heavenlyStem: tieu.heavenlyStem, earthlyBranch: tieu.earthlyBranch, palaceNames: tieu.palaceNames, mutagen: tieu.mutagen },
      yearly,
      monthly: luuNguyet(am.year, am, nc.fixLeap),
      daily: null,
      hourly: null,
    };
    const H = h as unknown as FunctionalHoroscope;
    const viTriTheo = (scope: Scope, ten: string): number => {
      if (scope === "origin") return timCung(ten)?.index ?? -1;
      const item = (h as unknown as Record<string, HoroscopeItem | null>)[scope];
      if (!item) return -1;
      const ks = khoaCua(ten, "cung", language);
      return item.palaceNames.findIndex((n) => ks.includes(khoaCua(n, "cung", language)[0] ?? ""));
    };
    const saoLuuTai = (i: number) => [...(h.decadal?.stars?.[i] ?? []), ...(h.yearly.stars?.[i] ?? [])].map((s) => khoaCua(s.name, "sao", language)[0] ?? "");
    anHam(h, {
      astrolabe: A,
      agePalace: () => P[h.age.index],
      palace: (ten: string, scope: Scope) => {
        const i = viTriTheo(scope, ten);
        return i < 0 ? undefined : P[i];
      },
      surroundPalaces: (ten: string, scope: Scope) => {
        const i = viTriTheo(scope, ten);
        return i < 0 ? undefined : tamPhuong(i);
      },
      hasHoroscopeStars: (ten: string, scope: Scope, ds: string[]) => {
        const i = viTriTheo(scope, ten);
        return i >= 0 && coDu(saoLuuTai(i), ds);
      },
      notHaveHoroscopeStars: (ten: string, scope: Scope, ds: string[]) => {
        const i = viTriTheo(scope, ten);
        return i >= 0 && khongCo(saoLuuTai(i), ds);
      },
      hasOneOfHoroscopeStars: (ten: string, scope: Scope, ds: string[]) => {
        const i = viTriTheo(scope, ten);
        return i >= 0 && coMot(saoLuuTai(i), ds);
      },
      hasHoroscopeMutagen: (ten: string, scope: Scope, m: Mutagen) => {
        if (scope === "origin") return false;
        const i = viTriTheo(scope, ten);
        const item = (h as unknown as Record<string, HoroscopeItem | null>)[scope];
        const mi = KHOA_HOA.indexOf(khoaHoa(m) ?? "");
        if (i < 0 || !item || mi < 0 || !item.mutagen[mi]) return false;
        const k = khoaCua(item.mutagen[mi], "sao", language)[0];
        return [...P[i].majorStars, ...P[i].minorStars].some((s) => khoaSaoCua(s) === k);
      },
      toJSON: () => banPhang(h),
    });
    return H;
  };

  const xepDaiHan = () => [...P].sort((x, y) => x.decadal.range[0] - y.decadal.range[0]);

  anHam(a, {
    palace: timCung,
    star: (ten: string) => {
      const ks = khoaCua(ten, "sao", language);
      for (const p of P) for (const s of [...p.majorStars, ...p.minorStars, ...p.adjectiveStars]) if (ks.includes(khoaSaoCua(s))) return s;
      throw new Error("invalid star name.");
    },
    surroundedPalaces: tamPhuong,
    flankingPalaces: giap,
    isSurrounded: (i: number | string, ds: string[]) => tamPhuong(i).have(ds),
    isSurroundedOneOf: (i: number | string, ds: string[]) => tamPhuong(i).haveOneOf(ds),
    notSurrounded: (i: number | string, ds: string[]) => tamPhuong(i).notHave(ds),
    horoscope: (date: string | Date = new Date(), timeIndex?: number) => {
      if (timeIndex !== undefined && (!Number.isInteger(timeIndex) || timeIndex < 0 || timeIndex > 12)) throw new Error("timeIndex must be an integer 0 to 12");
      const n = docNgay(date);
      const gio = timeIndex ?? (date instanceof Date ? chiSoGio(date.getHours()) : 0);
      const ngay = gio === 12 ? ngayKe(n) : n;
      return vanHan(solarToLunar(ngay.d, ngay.m, ngay.y, timeZone), `${n.y}-${n.m}-${n.d}`);
    },
    decadalList: (): DecadalHoroscope[] => xepDaiHan().map((p) => {
      const c = phamViCung(mod(p.index + 2, 12), "decadal");
      return {
        index: c.index, name: c.name, palaceName: p.name, ageRange: [p.decadal.range[0], p.decadal.range[1]],
        yearRange: [namSinh + p.decadal.range[0] - 1, namSinh + p.decadal.range[1] - 1],
        heavenlyStem: c.heavenlyStem, earthlyBranch: c.earthlyBranch, palaceNames: c.palaceNames, mutagen: c.mutagen,
      };
    }),
    yearlyList: (indexOrName: number | string): YearlyHoroscope[] => {
      const p = typeof indexOrName === "number" ? xepDaiHan()[indexOrName] : timCung(indexOrName);
      if (!p) throw new Error("invalid decadal index or palace name.");
      const [tu, den] = p.decadal.range;
      return Array.from({ length: den - tu + 1 }, (_, k) => {
        const age = tu + k;
        const year = namSinh + age - 1;
        const y = luuNien(year).item;
        return {
          index: y.index, name: y.name, age, year, heavenlyStem: y.heavenlyStem, earthlyBranch: y.earthlyBranch,
          palaceNames: y.palaceNames, mutagen: y.mutagen, stars: y.stars,
        };
      });
    },
    monthlyList: (year: number, fixLeap = true): MonthlyHoroscope[] => {
      if (!Number.isInteger(year) || year < 1 || year > 9999) throw new Error("invalid year.");
      const ra: MonthlyHoroscope[] = [];
      // Ngày âm có thật trong lịch của lá: đổi sang dương rồi đổi ngược phải ra đúng ngày ấy.
      const coThat = (d: number, m: number, nhuan: boolean) => {
        const r = lunarToSolar(d, m, year, nhuan, timeZone);
        if (!r.hopLe) return false;
        const b = solarToLunar(r.duong.day, r.duong.month, r.duong.year, timeZone);
        return b.year === year && b.month === m && b.day === d && b.leap === nhuan;
      };
      const soNgay = (m: number, nhuan: boolean) => (coThat(30, m, nhuan) ? 30 : 29);
      for (let m = 1; m <= 12; m++) {
        const ky: [boolean, "normal" | "first" | "second", [number, number]][] = [[false, "normal", [1, soNgay(m, false)]]];
        if (coThat(1, m, true)) {
          const cuoi = soNgay(m, true);
          if (fixLeap) ky.push([true, "first", [1, 15]], [true, "second", [16, cuoi]]);
          else ky.push([true, "normal", [1, cuoi]]);
        }
        for (const [nhuan, part, dayRange] of ky) {
          const it = luuNguyet(year, { month: m, leap: nhuan, day: dayRange[0] }, fixLeap);
          ra.push({
            index: it.index, name: it.name, age: year - namSinh + 1, year, month: m, isLeapMonth: nhuan, part, dayRange,
            heavenlyStem: it.heavenlyStem, earthlyBranch: it.earthlyBranch, palaceNames: it.palaceNames, mutagen: it.mutagen,
          });
        }
      }
      return ra;
    },
    use(this: FunctionalAstrolabe, plugin: (this: FunctionalAstrolabe) => void) {
      plugin.apply(A);
    },
    toJSON: () => banPhang(a),
  });
  return A;
}
