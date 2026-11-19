// Cách cục theo bốn bảng cuối quyển 1 của Tử Vi Đẩu Số toàn thư (定富局,
// 定貴局, 定貧賤局; chuyển ngữ tuvi_cachcuc_toan_thu.go).
//
// Mỗi điều kiện đọc đúng chữ chú văn đi kèm tên cách; chú văn giữ nguyên văn
// chữ Hán giản thể. Chỉ dựng cách kiểm được trên lá số gốc với các sao lõi
// tính đã an. Ba chữ chú văn không định nghĩa nên cách dùng chúng mang
// coDiBan: "空亡" đọc là cung có Tuần hoặc Triệt; "吉星" là lục cát tinh, Lộc
// Tồn hay sao mang Hóa Lộc, Quyền, Khoa; "祿" là Lộc Tồn hay sao mang Hóa Lộc.

import { DIA_CHI, mod } from "./phu-thuoc.ts";
import { CHINH_TINH_DIGNITY } from "./du-lieu.ts";
import { viTriCungThuK } from "./lap-so.ts";
import { chinhTinhTaiViTri, coDu, saoTaiViTri, saoTamPhuongTuChinh, tenCungTaiViTri, viTriSao } from "./tra-cuu.ts";
import type { BaNgonNgu, LaSoTuVi } from "./kieu.ts";

/** Một cách cục nhận diện được trên lá số. */
export interface CachCuc {
  /** Tên Hán Việt (bản tiếng Anh dùng chung tên này). */
  ten: string;
  /** Tên chữ Hán giản thể. */
  tenZh?: string;
  /** Tên chữ Hán phồn thể theo sách. */
  tenHan?: string;
  dieuKien: string;
  dieuKienEn: string;
  dieuKienZh: string;
  moTa: string;
  moTaEn: string;
  moTaZh: string;
  /** Cung mà cách ứng vào (-1 khi không gắn cung nào). */
  viTri: number;
  tenCung?: string;
  tenCungEn?: string;
  tenCungZh?: string;
  chiCung?: string;
  chiCungZh?: string;
  /** Các phái chép khác nhau về điều kiện. */
  coDiBan?: boolean;
  /** "dinh-phu", "dinh-quy", "dinh-ban-tien"; vắng ở cách không lấy từ Toàn thư. */
  nhom?: string;
  /** Chú văn của sách, nguyên văn chữ Hán giản thể. */
  chuVan?: string;
}

/** Dựng một cách cục đủ ba bản điều kiện và mô tả. */
export function cachCucBa(ten: string, tenZh: string, tenHan: string, dieuKien: BaNgonNgu, moTa: BaNgonNgu): CachCuc {
  const c: CachCuc = {
    ten,
    dieuKien: dieuKien.vi, dieuKienEn: dieuKien.en, dieuKienZh: dieuKien.zh,
    moTa: moTa.vi, moTaEn: moTa.en, moTaZh: moTa.zh,
    viTri: -1,
  };
  if (tenZh) c.tenZh = tenZh;
  if (tenHan) c.tenHan = tenHan;
  return c;
}

/** Nhóm cách cục theo bảng của Toàn thư. */
export const NHOM_DINH_PHU = "dinh-phu";
export const NHOM_DINH_QUY = "dinh-quy";
export const NHOM_DINH_BAN_TIEN = "dinh-ban-tien";

const MO_TA_NHOM: Readonly<Record<string, BaNgonNgu>> = {
  [NHOM_DINH_PHU]: {
    vi: "Tử Vi Đẩu Số toàn thư xếp cách này vào bảng định phú cục, nhóm cách sách gắn với của cải.",
    en: "The Tử Vi Đẩu Số Toàn Thư lists this pattern in its table of wealth patterns, which the book links to material means.",
    zh: "《紫微斗数全书》将此格列入定富局，书中将其与财富相连。",
  },
  [NHOM_DINH_QUY]: {
    vi: "Tử Vi Đẩu Số toàn thư xếp cách này vào bảng định quý cục, nhóm cách sách gắn với địa vị và danh tiếng.",
    en: "The Tử Vi Đẩu Số Toàn Thư lists this pattern in its table of rank patterns, which the book links to position and reputation.",
    zh: "《紫微斗数全书》将此格列入定贵局，书中将其与地位、声名相连。",
  },
  [NHOM_DINH_BAN_TIEN]: {
    vi: "Tử Vi Đẩu Số toàn thư xếp cách này vào bảng định bần tiện cục, nhóm cách sách gắn với thiếu thốn, vất vả. Đó là quy tắc của một sách cổ, không phải điều tất định.",
    en: "The Tử Vi Đẩu Số Toàn Thư lists this pattern in its table of hardship patterns, which the book links to want and toil. That is an old book's rule, not a certainty.",
    zh: "《紫微斗数全书》将此格列入定贫贱局，书中将其与匮乏、劳苦相连。这是古书的规则，并非定数。",
  },
};

/** Lục cát tinh cộng Lộc Tồn: tập "吉星" của các chú văn nói "遇吉". */
const CAT_TINH_TOAN_THU = ["Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc", "Thiên Khôi", "Thiên Việt", "Lộc Tồn"];

function coHoaTai(ls: LaSoTuVi, pos: number, hoa: string): boolean {
  return ls.cung[mod(pos, 12)].sao.some((s) => s.tuHoa === hoa);
}

function khongVongTai(ls: LaSoTuVi, pos: number): boolean {
  const c = ls.cung[mod(pos, 12)];
  return c.tuanTrung || c.trietLo;
}

function coCatTinhTai(ls: LaSoTuVi, pos: number): boolean {
  const tai = saoTaiViTri(ls, pos);
  if (CAT_TINH_TOAN_THU.some((s) => tai.has(s))) return true;
  return coHoaTai(ls, pos, "Hóa Lộc") || coHoaTai(ls, pos, "Hóa Quyền") || coHoaTai(ls, pos, "Hóa Khoa");
}

function coLocTai(ls: LaSoTuVi, pos: number): boolean {
  return saoTaiViTri(ls, pos).has("Lộc Tồn") || coHoaTai(ls, pos, "Hóa Lộc");
}

/** Hai sao ở hai cung KỀ hai bên pos (chú văn "夾"). */
function giapCung(ls: LaSoTuVi, pos: number, a: string, b: string): boolean {
  const truoc = saoTaiViTri(ls, pos - 1);
  const sau = saoTaiViTri(ls, pos + 1);
  return (truoc.has(a) && sau.has(b)) || (truoc.has(b) && sau.has(a));
}

function sangMieuVuong(ten: string, pos: number): boolean {
  const dig = CHINH_TINH_DIGNITY[ten];
  if (!dig) return false;
  const d = dig[mod(pos, 12)];
  return d === "M" || d === "V";
}

function tamPhuongCo(ls: LaSoTuVi, pos: number, ten: string): boolean {
  return saoTamPhuongTuChinh(ls, pos).has(ten);
}

function tamPhuongCoHoa(ls: LaSoTuVi, pos: number, hoa: string): boolean {
  return [0, 4, 6, 8].some((d) => coHoaTai(ls, pos + d, hoa));
}

interface CungGoi {
  /** Thứ tự đếm nghịch từ Mệnh. */
  k: number;
  ba: BaNgonNgu;
}

const GOI_MENH: CungGoi = { k: 0, ba: { vi: "Mệnh", en: "Mệnh", zh: "命宫" } };
const GOI_TAI_BACH: CungGoi = { k: 4, ba: { vi: "Tài Bạch", en: "Tài Bạch", zh: "财帛宫" } };
const GOI_QUAN_LOC: CungGoi = { k: 8, ba: { vi: "Quan Lộc", en: "Quan Lộc", zh: "官禄宫" } };
const GOI_DIEN_TRACH: CungGoi = { k: 9, ba: { vi: "Điền Trạch", en: "Điền Trạch", zh: "田宅宫" } };

/** Rà bốn bảng của Toàn thư và trả các cách lá số rơi vào. */
export function cachCucToanThu(ls: LaSoTuVi): CachCuc[] {
  const out: CachCuc[] = [];
  const menh = ls.cungMenh;
  const viTriCung = (g: CungGoi) => viTriCungThuK(menh, g.k);
  const them = (nhom: string, ten: string, zh: string, han: string, chuVan: string, pos: number, diBan: boolean, dk: BaNgonNgu): void => {
    const c = cachCucBa(ten, zh, han, dk, MO_TA_NHOM[nhom]);
    c.nhom = nhom;
    if (chuVan) c.chuVan = chuVan;
    if (diBan) c.coDiBan = true;
    const p = mod(pos, 12);
    c.viTri = p;
    c.tenCung = tenCungTaiViTri(ls, p);
    c.chiCung = DIA_CHI[p];
    out.push(c);
  };
  const tai = saoTaiViTri(ls, menh);
  const pMenh = mod(menh, 12);

  // ── 定富局 ──

  // 日月夾財：武守命日月來夾是也，財帛宮亦然。
  for (const g of [GOI_MENH, GOI_TAI_BACH]) {
    const p = viTriCung(g);
    if (saoTaiViTri(ls, p).has("Vũ Khúc") && giapCung(ls, p, "Thái Dương", "Thái Âm")) {
      them(NHOM_DINH_PHU, "Nhật Nguyệt giáp Tài", "日月夹财", "日月夾財", "武守命日月来夹是也，财帛宫亦然。", p, false, {
        vi: "Vũ Khúc toạ thủ cung " + g.ba.vi + ", Thái Dương và Thái Âm ở hai cung kề hai bên",
        en: "Vũ Khúc sits in the " + g.ba.en + " palace, with Thái Dương and Thái Âm in the two palaces on either side",
        zh: "武曲坐守" + g.ba.zh + "，太阳、太阴分居左右两邻宫",
      });
    }
  }
  // 財祿夾馬：馬守命武祿來夾是也，逢生旺尤妙。
  if (tai.has("Thiên Mã")) {
    const truoc = menh - 1;
    const sau = menh + 1;
    if ((saoTaiViTri(ls, truoc).has("Vũ Khúc") && coLocTai(ls, sau)) || (saoTaiViTri(ls, sau).has("Vũ Khúc") && coLocTai(ls, truoc))) {
      them(NHOM_DINH_PHU, "Tài Lộc giáp Mã", "财禄夹马", "財祿夾馬", "马守命武禄来夹是也，逢生旺尤妙。", menh, true, {
        vi: "Thiên Mã toạ thủ cung Mệnh, Vũ Khúc và sao Lộc (Lộc Tồn hay sao mang Hóa Lộc) ở hai cung kề hai bên",
        en: "Thiên Mã sits in the Mệnh palace, with Vũ Khúc and a Lộc star (Lộc Tồn or the star carrying Hóa Lộc) in the two palaces on either side",
        zh: "天马坐守命宫，武曲与禄星（禄存或化禄之星）分居左右两邻宫",
      });
    }
  }
  // 日月照璧：日月臨田宅宮是也，喜居墓庫。
  {
    const pDT = viTriCung(GOI_DIEN_TRACH);
    if (coDu(saoTaiViTri(ls, pDT), "Thái Dương", "Thái Âm")) {
      them(NHOM_DINH_PHU, "Nhật Nguyệt chiếu bích", "日月照璧", "日月照璧", "日月临田宅宫是也，喜居墓库。", pDT, false, {
        vi: "Thái Dương và Thái Âm cùng ở cung Điền Trạch (chỉ xảy ra ở Sửu hoặc Mùi)",
        en: "Thái Dương and Thái Âm both sit in the Điền Trạch palace (possible only at Sửu or Mùi)",
        zh: "太阳、太阴同在田宅宫（只出现在丑或未）",
      });
    }
  }
  // 金燦光輝：太陽單守，命在午宮是也。
  if (pMenh === 6) {
    const ct = chinhTinhTaiViTri(ls, menh);
    if (ct.length === 1 && ct[0] === "Thái Dương") {
      them(NHOM_DINH_PHU, "Kim xán quang huy", "金灿光辉", "金燦光輝", "太阳单守，命在午宫是也。", menh, false, {
        vi: "Cung Mệnh an tại Ngọ, Thái Dương là chính tinh duy nhất toạ thủ",
        en: "The Mệnh palace sits at Ngọ, with Thái Dương as its only major star",
        zh: "命宫在午，太阳独坐为唯一正曜",
      });
    }
  }

  // ── 定貴局 ──

  // 日月夾命：不坐空亡，遇逢本宮有吉星是也。
  if (giapCung(ls, menh, "Thái Dương", "Thái Âm") && !khongVongTai(ls, menh) && coCatTinhTai(ls, menh)) {
    them(NHOM_DINH_QUY, "Nhật Nguyệt giáp Mệnh", "日月夹命", "日月夾命", "不坐空亡遇逢本宫有吉星是也。", menh, true, {
      vi: "Thái Dương và Thái Âm ở hai cung kề hai bên cung Mệnh; cung Mệnh không có Tuần, Triệt và có cát tinh (lục cát tinh, Lộc Tồn hay sao mang Hóa Lộc, Quyền, Khoa)",
      en: "Thái Dương and Thái Âm sit in the two palaces on either side of Mệnh; the Mệnh palace has no Tuần or Triệt and holds an auspicious star (one of the six auspicious stars, Lộc Tồn, or a star carrying Hóa Lộc, Quyền or Khoa)",
      zh: "太阳、太阴分居命宫左右两邻宫；命宫不坐旬空、截空，且有吉星（六吉星、禄存或化禄权科之星）",
    });
  }
  // 日出扶桑：日在卯守命是也，守官祿宮亦然。
  if (viTriSao(ls, "Thái Dương") === 3) {
    for (const g of [GOI_MENH, GOI_QUAN_LOC]) {
      if (mod(viTriCung(g), 12) === 3) {
        them(NHOM_DINH_QUY, "Nhật xuất Phù Tang", "日出扶桑", "日出扶桑", "日在卯守命是也，守官禄宫亦然。", 3, false, {
          vi: "Thái Dương ở Mão, toạ thủ cung " + g.ba.vi,
          en: "Thái Dương at Mão, sitting in the " + g.ba.en + " palace",
          zh: "太阳在卯，坐守" + g.ba.zh,
        });
      }
    }
  }
  // 月落亥宮：月在亥守命是也，又名月朗天門。
  if (pMenh === 11 && tai.has("Thái Âm")) {
    them(NHOM_DINH_QUY, "Nguyệt lạc Hợi cung", "月落亥宫", "月落亥宮", "月在亥守命是也，又名月朗天门。", menh, false, {
      vi: "Thái Âm toạ thủ cung Mệnh an tại Hợi",
      en: "Thái Âm sits in the Mệnh palace at Hợi",
      zh: "太阴坐守亥宫命宫",
    });
  }
  // 月生滄海：月在子宮守田宅是也。
  {
    const pDT = viTriCung(GOI_DIEN_TRACH);
    if (mod(pDT, 12) === 0 && saoTaiViTri(ls, pDT).has("Thái Âm")) {
      them(NHOM_DINH_QUY, "Nguyệt sinh thương hải", "月生沧海", "月生滄海", "月在子宫守田宅是也。", pDT, false, {
        vi: "Thái Âm ở Tý, toạ thủ cung Điền Trạch",
        en: "Thái Âm at Tý, sitting in the Điền Trạch palace",
        zh: "太阴在子，坐守田宅宫",
      });
    }
  }
  // 輔弼拱主：紫微守命二星來拱是也，夾之亦然。
  if (tai.has("Tử Vi")) {
    const tamPhuong = (ten: string) => [4, 6, 8].some((d) => saoTaiViTri(ls, menh + d).has(ten));
    if ((tamPhuong("Tả Phù") && tamPhuong("Hữu Bật")) || giapCung(ls, menh, "Tả Phù", "Hữu Bật")) {
      them(NHOM_DINH_QUY, "Phụ Bật củng chủ", "辅弼拱主", "輔弼拱主", "紫微守命二星来拱是也，夹之亦然。", menh, true, {
        vi: "Tử Vi toạ thủ cung Mệnh; Tả Phù và Hữu Bật cùng chiếu từ tam phương tứ chính, hoặc ở hai cung kề hai bên",
        en: "Tử Vi sits in the Mệnh palace; Tả Phù and Hữu Bật both shine on it from its triangle and opposite, or sit in the two palaces on either side",
        zh: "紫微坐守命宫；左辅、右弼同自三方四正来拱，或分居左右两邻宫",
      });
    }
  }
  // 君臣慶會：紫微左右同守命是也，更會相武陰妙上。
  if (coDu(tai, "Tử Vi", "Tả Phù", "Hữu Bật")) {
    them(NHOM_DINH_QUY, "Quân thần khánh hội", "君臣庆会", "君臣慶會", "紫微左右同守命是也，更会相武阴妙上。", menh, false, {
      vi: "Tử Vi, Tả Phù và Hữu Bật cùng toạ thủ cung Mệnh",
      en: "Tử Vi, Tả Phù and Hữu Bật all sit in the Mệnh palace",
      zh: "紫微、左辅、右弼同坐命宫",
    });
  }
  // 坐貴向貴：謂魁鉞在命迭相坐拱是也。
  const doi = saoTaiViTri(ls, menh + 6);
  if ((tai.has("Thiên Khôi") && doi.has("Thiên Việt")) || (tai.has("Thiên Việt") && doi.has("Thiên Khôi"))) {
    them(NHOM_DINH_QUY, "Toạ quý hướng quý", "坐贵向贵", "坐貴向貴", "谓魁钺在命迭相坐拱是也。", menh, true, {
      vi: "Một trong hai sao Thiên Khôi, Thiên Việt toạ thủ cung Mệnh, sao kia ở cung xung chiếu",
      en: "One of Thiên Khôi and Thiên Việt sits in the Mệnh palace and the other in the opposite palace",
      zh: "天魁、天钺一坐命宫，一在对宫",
    });
  }
  // 七殺朝斗：前批注「七殺寅申子午一生爵祿榮昌，為七殺朝斗格。」
  if (tai.has("Thất Sát") && (pMenh === 0 || pMenh === 2 || pMenh === 6 || pMenh === 8)) {
    them(NHOM_DINH_QUY, "Thất Sát triều Đẩu", "七杀朝斗", "七殺朝斗", "七杀寅申子午一生爵禄荣昌 为七杀朝斗格。", menh, false, {
      vi: "Thất Sát toạ thủ cung Mệnh an tại Dần, Thân, Tý hoặc Ngọ",
      en: "Thất Sát sits in the Mệnh palace at Dần, Thân, Tý or Ngọ",
      zh: "七杀坐守命宫，命在寅、申、子或午",
    });
  }
  // 日月同臨：前批注「日月同未命安丑侯伯之材。」
  if (pMenh === 1 && coDu(saoTaiViTri(ls, 7), "Thái Dương", "Thái Âm")) {
    them(NHOM_DINH_QUY, "Nhật Nguyệt đồng lâm", "日月同临", "日月同臨", "日月同未命安丑侯伯之材", menh, true, {
      vi: "Cung Mệnh an tại Sửu, Thái Dương và Thái Âm cùng ở Mùi chiếu sang",
      en: "The Mệnh palace sits at Sửu, with Thái Dương and Thái Âm together at Mùi facing it",
      zh: "命安丑宫，太阳、太阴同在未宫来照",
    });
  }
  // 科權祿拱：ba hóa ở tam phương tứ chính (mục 文職論 của Toàn thư).
  if (tamPhuongCoHoa(ls, menh, "Hóa Khoa") && tamPhuongCoHoa(ls, menh, "Hóa Quyền") && tamPhuongCoHoa(ls, menh, "Hóa Lộc")) {
    them(NHOM_DINH_QUY, "Khoa Quyền Lộc củng", "科权禄拱", "科權祿拱", "又得三方四正科权禄拱", menh, true, {
      vi: "Hóa Khoa, Hóa Quyền và Hóa Lộc đều ở cung Mệnh hay tam phương tứ chính của nó",
      en: "Hóa Khoa, Hóa Quyền and Hóa Lộc all sit in the Mệnh palace or its triangle and opposite",
      zh: "化科、化权、化禄皆在命宫或其三方四正",
    });
  }
  // 武曲守垣：武守命卯宮是也，餘不是。
  if (pMenh === 3 && tai.has("Vũ Khúc")) {
    them(NHOM_DINH_QUY, "Vũ Khúc thủ viên", "武曲守垣", "武曲守垣", "武守命卯宫是也，余不是。", menh, false, {
      vi: "Vũ Khúc toạ thủ cung Mệnh an tại Mão",
      en: "Vũ Khúc sits in the Mệnh palace at Mão",
      zh: "武曲坐守卯宫命宫",
    });
  }
  // 府相朝垣：前批注「命寅申，府相在財帛宮，祿官朝者，上格別宮次之。」
  if (pMenh === 2 || pMenh === 8) {
    const phu = viTriSao(ls, "Thiên Phủ");
    const tuong = viTriSao(ls, "Thiên Tướng");
    const tb = mod(viTriCung(GOI_TAI_BACH), 12);
    const ql = mod(viTriCung(GOI_QUAN_LOC), 12);
    if ((phu === tb && tuong === ql) || (phu === ql && tuong === tb)) {
      them(NHOM_DINH_QUY, "Phủ Tướng triều viên", "府相朝垣", "府相朝垣", "命寅申，府相在财帛宫，禄官朝者，上格别宫次之。", menh, true, {
        vi: "Cung Mệnh an tại Dần hoặc Thân; Thiên Phủ và Thiên Tướng chia nhau ở cung Tài Bạch và cung Quan Lộc",
        en: "The Mệnh palace sits at Dần or Thân; Thiên Phủ and Thiên Tướng occupy the Tài Bạch and Quan Lộc palaces, one each",
        zh: "命在寅或申；天府、天相分居财帛宫与官禄宫",
      });
    }
  }
  // 權祿生逢：二星守命廟旺是也，陷不是。
  if (coHoaTai(ls, menh, "Hóa Quyền") && coHoaTai(ls, menh, "Hóa Lộc")) {
    let sang = true;
    for (const s of ls.cung[pMenh].sao) {
      if ((s.tuHoa === "Hóa Quyền" || s.tuHoa === "Hóa Lộc") && !sangMieuVuong(s.ten, pMenh)) sang = false;
    }
    if (sang) {
      them(NHOM_DINH_QUY, "Quyền Lộc sinh phùng", "权禄生逢", "權祿生逢", "二星守命庙旺是也，陷不是。", menh, false, {
        vi: "Hai sao mang Hóa Quyền và Hóa Lộc cùng toạ thủ cung Mệnh, cả hai ở mức miếu hay vượng",
        en: "The stars carrying Hóa Quyền and Hóa Lộc both sit in the Mệnh palace, both at the exalted or strong grade",
        zh: "化权、化禄二星同坐命宫，且皆庙旺",
      });
    }
  }
  // 羊刃入廟：辰戌丑未守命遇吉是也。
  if (tai.has("Kình Dương") && (pMenh === 1 || pMenh === 4 || pMenh === 7 || pMenh === 10) && coCatTinhTai(ls, menh)) {
    them(NHOM_DINH_QUY, "Dương Nhận nhập miếu", "羊刃入庙", "羊刃入廟", "辰戌丑未守命遇吉是也。", menh, true, {
      vi: "Kình Dương toạ thủ cung Mệnh an tại Thìn, Tuất, Sửu hoặc Mùi, cung Mệnh có cát tinh (lục cát tinh, Lộc Tồn hay sao mang Hóa Lộc, Quyền, Khoa)",
      en: "Kình Dương sits in the Mệnh palace at Thìn, Tuất, Sửu or Mùi, and the Mệnh palace holds an auspicious star (one of the six auspicious stars, Lộc Tồn, or a star carrying Hóa Lộc, Quyền or Khoa)",
      zh: "擎羊坐守命宫，命在辰、戌、丑或未，且命宫有吉星（六吉星、禄存或化禄权科之星）",
    });
  }
  // 巨機居卯：前批注「巨機居卯乙辛己丙至公卿，不貴即富，甲人平常何也，因甲祿到寅卯宮有擎羊破格耳。」
  if (pMenh === 3 && coDu(tai, "Cự Môn", "Thiên Cơ") && !ls.canChiNam.startsWith("Giáp")) {
    them(NHOM_DINH_QUY, "Cự Cơ cư Mão", "巨机居卯", "巨機居卯", "巨机居卯乙辛己丙至公卿 不贵即富，甲人平常何也，因甲禄到寅卯宫有擎羊破格耳。", menh, false, {
      vi: "Cự Môn và Thiên Cơ cùng toạ thủ cung Mệnh an tại Mão; người sinh năm can Giáp không tính vì sách ghi Kình Dương ở Mão phá cách",
      en: "Cự Môn and Thiên Cơ both sit in the Mệnh palace at Mão; people born in a Giáp year are excluded, since the book says Kình Dương at Mão breaks the pattern",
      zh: "巨门、天机同坐卯宫命宫；甲年生人不计，书云擎羊在卯破格",
    });
  }

  // ── 定貧賤局 ──

  // 生不逢時：命坐空亡逢廉貞是也。
  if (tai.has("Liêm Trinh") && khongVongTai(ls, menh)) {
    them(NHOM_DINH_BAN_TIEN, "Sinh bất phùng thời", "生不逢时", "生不逢時", "命坐空亡逢廉贞是也。", menh, true, {
      vi: "Liêm Trinh toạ thủ cung Mệnh, cung Mệnh có Tuần hoặc Triệt",
      en: "Liêm Trinh sits in the Mệnh palace, and the Mệnh palace has Tuần or Triệt",
      zh: "廉贞坐守命宫，命宫坐旬空或截空",
    });
  }
  // 祿逢兩殺：祿坐空亡又逢空劫殺星是也。
  if (coLocTai(ls, menh) && khongVongTai(ls, menh) && tamPhuongCo(ls, menh, "Địa Không") && tamPhuongCo(ls, menh, "Địa Kiếp")) {
    them(NHOM_DINH_BAN_TIEN, "Lộc phùng lưỡng sát", "禄逢两杀", "祿逢兩殺", "禄坐空亡又逢空劫杀星是也。", menh, true, {
      vi: "Sao Lộc (Lộc Tồn hay sao mang Hóa Lộc) ở cung Mệnh có Tuần hoặc Triệt, Địa Không và Địa Kiếp cùng ở tam phương tứ chính",
      en: "A Lộc star (Lộc Tồn or the star carrying Hóa Lộc) is in a Mệnh palace that has Tuần or Triệt, with Địa Không and Địa Kiếp both in its triangle and opposite",
      zh: "禄星（禄存或化禄之星）在命宫而命宫坐旬空或截空，地空、地劫同在三方四正",
    });
  }
  // 馬落空亡：馬既落亡，雖祿沖會無用，主奔波。
  if (tai.has("Thiên Mã") && khongVongTai(ls, menh)) {
    them(NHOM_DINH_BAN_TIEN, "Mã lạc không vong", "马落空亡", "馬落空亡", "马既落亡虽禄冲会无用主奔波。", menh, true, {
      vi: "Thiên Mã toạ thủ cung Mệnh, cung Mệnh có Tuần hoặc Triệt",
      en: "Thiên Mã sits in the Mệnh palace, and the Mệnh palace has Tuần or Triệt",
      zh: "天马坐守命宫，命宫坐旬空或截空",
    });
  }
  // 一生孤貧：謂破守命星陷地是也。
  if (tai.has("Phá Quân") && CHINH_TINH_DIGNITY["Phá Quân"][pMenh] === "H") {
    them(NHOM_DINH_BAN_TIEN, "Nhất sinh cô bần", "一生孤贫", "一生孤貧", "谓破守命星陷地是也。", menh, true, {
      vi: "Phá Quân toạ thủ cung Mệnh ở vị trí hãm theo bảng miếu hãm của lá số",
      en: "Phá Quân sits in the Mệnh palace at a weak position by the chart's strength table",
      zh: "破军坐守命宫，按本命盘的庙陷表落陷",
    });
  }
  // 兩重華蓋：謂祿存化祿坐命遇空劫是也。
  if (tai.has("Lộc Tồn") && coHoaTai(ls, menh, "Hóa Lộc") && tamPhuongCo(ls, menh, "Địa Không") && tamPhuongCo(ls, menh, "Địa Kiếp")) {
    them(NHOM_DINH_BAN_TIEN, "Lưỡng trùng Hoa Cái", "两重华盖", "兩重華蓋", "谓禄存化禄坐命遇空劫是也。", menh, true, {
      vi: "Lộc Tồn và sao mang Hóa Lộc cùng toạ thủ cung Mệnh, Địa Không và Địa Kiếp cùng ở tam phương tứ chính",
      en: "Lộc Tồn and the star carrying Hóa Lộc both sit in the Mệnh palace, with Địa Không and Địa Kiếp both in its triangle and opposite",
      zh: "禄存与化禄之星同坐命宫，地空、地劫同在三方四正",
    });
  }
  return out;
}
