// Nhận diện cách cục (chuyển ngữ tuvi_cachcuc.go).
//
// Mỗi cách cục kiểm được bằng biểu thức trên vị trí sao; mô tả ở mức dữ kiện,
// không đoán vận mệnh; cách có dị bản giữa các phái mang coDiBan. Sau các
// cách chung là các cách theo bốn bảng của Tử Vi Đẩu Số toàn thư
// (cach-cuc-toan-thu.ts).

import { DIA_CHI, mod } from "./phu-thuoc.ts";
import { CHINH_TINH_DIGNITY, saoZh, tenCungBaThu, zhCua } from "./du-lieu.ts";
import { chinhTinhTaiViTri, coDu, saoTaiViTri, saoTamPhuongTuChinh, tenCungTaiViTri, viTriSao } from "./tra-cuu.ts";
import { cachCucBa, cachCucToanThu } from "./cach-cuc-toan-thu.ts";
import type { CachCuc } from "./cach-cuc-toan-thu.ts";
import type { BaNgonNgu, LaSoTuVi } from "./kieu.ts";

export type { CachCuc } from "./cach-cuc-toan-thu.ts";

interface BoSao {
  ten: string;
  zh: string;
  han: string;
  moTa: BaNgonNgu;
}

const BO_SAT_PHA_LANG: BoSao = {
  ten: "Sát Phá Lang", zh: "杀破狼", han: "殺破狼", moTa: {
    vi: "Bộ ba sao biến động. Ba sao luôn cách nhau đúng bốn cung nên khi một sao toạ Mệnh thì hai sao kia luôn nằm trong tam phương.",
    en: "The trio of change. The three stars always sit exactly four palaces apart, so when one occupies Mệnh the other two are always in its triangle of influence.",
    zh: "主变动的三星组合。三星永远相隔四宫，所以一星坐命时，另两星必在三方之内。",
  },
};
const BO_CO_NGUYET_DONG_LUONG: BoSao = {
  ten: "Cơ Nguyệt Đồng Lương", zh: "机月同梁", han: "機月同梁", moTa: {
    vi: "Bộ sao ôn hoà, sách thường gắn với nếp làm việc có quy củ và ổn định.",
    en: "A gentle group of stars, which the texts usually link to orderly, steady ways of working.",
    zh: "性质温和的星组，古书多将其与有章法、安稳的做事方式相连。",
  },
};
const BO_TU_PHU_VU_TUONG: BoSao = {
  ten: "Tử Phủ Vũ Tướng", zh: "紫府武相", han: "紫府武相", moTa: {
    vi: "Bộ sao chủ về tổ chức và quản trị theo cách gọi của sách. Lá số xếp cả Liêm Trinh, Thái Dương và Cự Môn vào nhóm này để mỗi sao toạ Mệnh thuộc đúng một bộ; Tân Biên xếp Liêm Trinh vào bộ Sát Phá Liêm Tham và tách Cự Môn, Thái Dương thành bộ Cự Nhật.",
    en: "In the texts' terms, the group that governs organising and managing. The chart also puts Liêm Trinh, Thái Dương and Cự Môn here so that every star in Mệnh belongs to exactly one group; Tân Biên puts Liêm Trinh with Sát Phá Liêm Tham and splits Cự Môn and Thái Dương off as the Cự Nhật pair.",
    zh: "按古书说法，此星组主组织与管理。本命盘把廉贞、太阳、巨门也归入此组，使坐命之星各属一组；《紫微斗数新编》则把廉贞归入杀破廉贪，另立巨门、太阳为巨日一组。",
  },
};

/**
 * Ba bộ chính tinh, xét theo THỨ TỰ ƯU TIÊN cố định: Sát Phá Lang trước (ba
 * sao luôn cách nhau bốn cung nên một sao toạ Mệnh là cả bộ đã ở tam phương),
 * rồi Cơ Nguyệt Đồng Lương, rồi Tử Phủ Vũ Tướng.
 */
const UU_TIEN: readonly { bo: BoSao; sao: readonly string[] }[] = [
  { bo: BO_SAT_PHA_LANG, sao: ["Thất Sát", "Phá Quân", "Tham Lang"] },
  { bo: BO_CO_NGUYET_DONG_LUONG, sao: ["Thiên Cơ", "Thái Âm", "Thiên Đồng", "Thiên Lương"] },
  { bo: BO_TU_PHU_VU_TUONG, sao: ["Tử Vi", "Thiên Phủ", "Vũ Khúc", "Thiên Tướng", "Liêm Trinh", "Thái Dương", "Cự Môn"] },
];

/** Rà lá số và trả các cách cục nhận ra được. */
export function nhanDienCachCuc(laSo: LaSoTuVi): CachCuc[] {
  const ls = laSo;
  const out: CachCuc[] = [];
  const menh = ls.cungMenh;
  const tenMenh = tenCungTaiViTri(ls, menh);
  const chiMenh = DIA_CHI[mod(menh, 12)];

  const taiMenh = saoTaiViTri(ls, menh);
  const hoiMenh = saoTamPhuongTuChinh(ls, menh);

  const them = (c: CachCuc): void => {
    c.viTri = menh;
    c.tenCung = tenMenh;
    c.chiCung = chiMenh;
    out.push(c);
  };

  // Ba bộ chính tinh lớn, theo sao TOẠ THỦ tại Mệnh. Mệnh trống thì lấy theo
  // cung xung chiếu (tá tinh an cung) và nói rõ trong điều kiện.
  let nguon = menh;
  let giaiTiep = false;
  if (chinhTinhTaiViTri(ls, menh).length === 0) {
    nguon = menh + 6;
    giaiTiep = true;
  }
  const taiNguon = new Set(chinhTinhTaiViTri(ls, nguon));
  tim: for (const nhom of UU_TIEN) {
    for (const s of nhom.sao) {
      if (!taiNguon.has(s)) continue;
      const b = nhom.bo;
      const dk: BaNgonNgu = giaiTiep
        ? {
          vi: "Cung Mệnh vô chính diệu, lấy theo " + s + " ở cung xung chiếu",
          en: "The Mệnh palace has no major star, so it is read from " + s + " in the opposite palace",
          zh: "命宫无正曜，借对宫的" + saoZh(s) + "论",
        }
        : {
          vi: "Sao " + s + " toạ thủ tại cung Mệnh",
          en: s + " sits in the Mệnh palace",
          zh: saoZh(s) + "坐守命宫",
        };
      them(cachCucBa(b.ten, b.zh, b.han, dk, b.moTa));
      break tim; // mỗi lá số thuộc đúng một bộ
    }
  }

  // Tử Phủ đồng cung (chỉ ở Dần hoặc Thân).
  if (coDu(taiMenh, "Tử Vi", "Thiên Phủ")) {
    them(cachCucBa("Tử Phủ đồng cung", "紫府同宫", "紫府同宮", {
      vi: "Tử Vi và Thiên Phủ cùng toạ thủ tại cung Mệnh (chỉ xảy ra ở Dần hoặc Thân)",
      en: "Tử Vi and Thiên Phủ both sit in the Mệnh palace (possible only at Dần or Thân)",
      zh: "紫微、天府同坐命宫（只出现在寅或申）",
    }, {
      vi: "Hai sao đứng đầu hai chùm chính tinh cùng nằm một cung.",
      en: "The two stars that head the two clusters of major stars share one palace.",
      zh: "两组正曜的首星同居一宫。",
    }));
  }

  // Nhật Nguyệt tịnh minh: chỉ ở vị trí sách định (Mệnh hay Quan Lộc tại Sửu
  // với Thái Dương ở Tỵ, Thái Âm ở Dậu; hoặc tại Mùi với Thái Dương ở Mão,
  // Thái Âm ở Hợi), cả hai sao không hãm theo bảng miếu hãm.
  const posNhat = viTriSao(ls, "Thái Dương");
  const posNguyet = viTriSao(ls, "Thái Âm");
  const sangNhat = posNhat >= 0 && CHINH_TINH_DIGNITY["Thái Dương"][posNhat] !== "H";
  const sangNguyet = posNguyet >= 0 && CHINH_TINH_DIGNITY["Thái Âm"][posNguyet] !== "H";
  if (sangNhat && sangNguyet) {
    const cacCung: { pos: number; cung: BaNgonNgu }[] = [
      { pos: menh, cung: { vi: "Mệnh", en: "Mệnh", zh: "命宫" } },
      { pos: menh + 4, cung: { vi: "Quan Lộc", en: "Quan Lộc", zh: "官禄宫" } },
    ];
    for (const kc of cacCung) {
      const p = mod(kc.pos, 12);
      let dk: BaNgonNgu;
      if (p === 1 && posNhat === 5 && posNguyet === 9) {
        dk = {
          vi: "Cung " + kc.cung.vi + " an tại Sửu, Thái Dương ở Tỵ và Thái Âm ở Dậu hợp chiếu, cả hai đều sáng",
          en: "The " + kc.cung.en + " palace sits at Sửu, with Thái Dương at Tỵ and Thái Âm at Dậu shining on it from the triangle, both bright",
          zh: kc.cung.zh + "在丑，太阳在巳、太阴在酉合照，二曜皆明",
        };
      } else if (p === 7 && posNhat === 3 && posNguyet === 11) {
        dk = {
          vi: "Cung " + kc.cung.vi + " an tại Mùi, Thái Dương ở Mão và Thái Âm ở Hợi hợp chiếu, cả hai đều sáng",
          en: "The " + kc.cung.en + " palace sits at Mùi, with Thái Dương at Mão and Thái Âm at Hợi shining on it from the triangle, both bright",
          zh: kc.cung.zh + "在未，太阳在卯、太阴在亥合照，二曜皆明",
        };
      } else {
        continue;
      }
      const c = cachCucBa("Nhật Nguyệt tịnh minh", "日月并明", "日月並明", dk, {
        vi: "Hai sao mặt trời và mặt trăng cùng ở chỗ sáng và cùng chiếu về một cung.",
        en: "The sun and moon stars both sit in bright positions and shine on the same palace.",
        zh: "日月二星同处明亮之位，同照一宫。",
      });
      c.coDiBan = true;
      c.viTri = p;
      c.tenCung = tenCungTaiViTri(ls, p);
      c.chiCung = DIA_CHI[p];
      out.push(c);
      break;
    }
  }

  // Mệnh vô chính diệu.
  const coChinhTinh = ls.cung.some((c) => c.viTri === mod(menh, 12) && c.sao.some((s) => s.loai === "chinh-tinh"));
  if (!coChinhTinh) {
    them(cachCucBa("Mệnh vô chính diệu", "命无正曜", "命無正曜", {
      vi: "Cung Mệnh không có chính tinh nào toạ thủ",
      en: "No major star sits in the Mệnh palace",
      zh: "命宫无正曜坐守",
    }, {
      vi: "Luận theo sao ở cung xung chiếu, lối gọi trong sách là tá tinh an cung.",
      en: "Read from the stars in the opposite palace, which the texts call borrowing stars to settle the palace.",
      zh: "以对宫之星论断，古书称为借星安宫。",
    }));
  }

  // Xương Khúc giáp Mệnh: hai sao ở hai cung KỀ hai bên Mệnh.
  const truocMenh = saoTaiViTri(ls, menh - 1);
  const sauMenh = saoTaiViTri(ls, menh + 1);
  if ((truocMenh.has("Văn Xương") && sauMenh.has("Văn Khúc")) || (truocMenh.has("Văn Khúc") && sauMenh.has("Văn Xương"))) {
    them(cachCucBa("Xương Khúc giáp Mệnh", "昌曲夹命", "昌曲夾命", {
      vi: "Văn Xương và Văn Khúc ở hai cung kề hai bên cung Mệnh",
      en: "Văn Xương and Văn Khúc sit in the two palaces on either side of the Mệnh palace",
      zh: "文昌、文曲分居命宫左右两邻宫",
    }, {
      vi: "Cặp sao văn chương kẹp cung Mệnh, sách gắn với học vấn và thi cử.",
      en: "The pair of literary stars flanks the Mệnh palace, which the texts link to learning and examinations.",
      zh: "文星之对夹命宫，古书将其与学问、考试相连。",
    }));
  }
  if (coDu(hoiMenh, "Văn Xương", "Văn Khúc")) {
    const c = cachCucBa("Xương Khúc đồng hội", "昌曲同会", "昌曲同會", {
      vi: "Văn Xương và Văn Khúc cùng hội về tam phương tứ chính của cung Mệnh",
      en: "Văn Xương and Văn Khúc both gather in the triangle and opposite of the Mệnh palace",
      zh: "文昌、文曲同会于命宫的三方四正",
    }, {
      vi: "Cặp sao văn chương, sách gắn với học vấn và thi cử.",
      en: "The pair of literary stars, which the texts link to learning and examinations.",
      zh: "文星之对，古书将其与学问、考试相连。",
    });
    c.coDiBan = true;
    them(c);
  }
  if (coDu(hoiMenh, "Tả Phù", "Hữu Bật")) {
    them(cachCucBa("Tả Hữu đồng hội", "左右", "左右", {
      vi: "Tả Phù và Hữu Bật cùng hội về tam phương tứ chính của cung Mệnh",
      en: "Tả Phù and Hữu Bật both gather in the triangle and opposite of the Mệnh palace",
      zh: "左辅、右弼同会于命宫的三方四正",
    }, {
      vi: "Cặp sao phụ trợ, sách gắn với việc được người khác giúp đỡ.",
      en: "The pair of assisting stars, which the texts link to receiving help from others.",
      zh: "辅佐之星对，古书将其与得人相助相连。",
    }));
  }
  // Không Kiếp: nêu cả cách nghịch để không bày một nửa dữ kiện.
  if (coDu(hoiMenh, "Địa Không", "Địa Kiếp")) {
    them(cachCucBa("Không Kiếp đồng hội", "空劫", "空劫", {
      vi: "Địa Không và Địa Kiếp cùng hội về tam phương tứ chính của cung Mệnh",
      en: "Địa Không and Địa Kiếp both gather in the triangle and opposite of the Mệnh palace",
      zh: "地空、地劫同会于命宫的三方四正",
    }, {
      vi: "Cặp sao hao tán. Sách xem đây là cách cục cần lưu ý chứ không phải điềm dữ tất định.",
      en: "The pair of dispersing stars. The texts treat this as a pattern to watch, not a certain ill omen.",
      zh: "耗散之星对。古书视之为需留意的格局，而非必然的凶兆。",
    }));
  }

  const ra = out.concat(cachCucToanThu(ls));
  // Tên cung ba thứ tiếng gắn một chỗ cho mọi cách cục, kể cả bảng toàn thư.
  for (const c of ra) {
    if (c.tenCung) {
      const cb = tenCungBaThu(c.tenCung);
      if (cb.en) c.tenCungEn = cb.en;
      if (cb.zh) c.tenCungZh = cb.zh;
    }
    if (c.chiCung) {
      const z = zhCua(c.chiCung);
      if (z) c.chiCungZh = z;
    }
  }
  return ra;
}

/** Một dòng liệt kê tên các cách cục, nối bằng dấu phẩy. */
export function tomTatCachCuc(cs: readonly CachCuc[]): string {
  return cs.map((c) => c.ten).join(", ");
}
