// Sinh ảnh mẫu cho README ở thu-vien-mo/assets/: lá số Tử Vi, lá số Bát Tự,
// hồ sơ thần số học của cùng một người mẫu (Nguyen Van An, nam, sinh 20:00
// ngày 19/09/1990; năm cá nhân tính cho 2026), ba thứ tiếng, sáng và tối.
//
//   cd thu-vien-mo/js && node --conditions=source kiem/sinh-anh-mau.ts
//
// Tên tệp: <hình>.svg và <hình>-toi.svg là bản tiếng Anh; <hình>-vi.svg,
// <hình>-vi-toi.svg, <hình>-zh.svg, <hình>-zh-toi.svg là bản Việt, Trung.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lapLaSoTuVi, veLaSoSvg } from "@nhatnguyet/tu-vi";
import { lapLaSoBatTu, veBatTuSvg } from "@nhatnguyet/bat-tu";
import { veThanSoHocSvg } from "@nhatnguyet/than-so-hoc";

const RA = join(dirname(fileURLToPath(import.meta.url)), "../../assets");
const TEN = "Nguyen Van An";

const tuVi = lapLaSoTuVi(TEN, "Nam", 19, 9, 1990, 10); // giờ Tuất: 19h tới 21h
const batTu = lapLaSoBatTu(19, 9, 1990, 20, 0, "Nam");
const vaoTsh = { hoTen: TEN, dd: 19, mm: 9, yyyy: 1990, namXem: 2026 };

for (const lang of ["en", "vi", "zh"] as const) {
  for (const theme of ["light", "dark"] as const) {
    const duoi = (lang === "en" ? "" : `-${lang}`) + (theme === "dark" ? "-toi" : "") + ".svg";
    writeFileSync(join(RA, "la-so-tu-vi" + duoi), veLaSoSvg(tuVi, { lang, theme }) + "\n");
    writeFileSync(join(RA, "la-so-bat-tu" + duoi), veBatTuSvg(batTu, { lang, theme, hoTen: TEN }) + "\n");
    writeFileSync(join(RA, "than-so-hoc" + duoi), veThanSoHocSvg(vaoTsh, { lang, theme }) + "\n");
  }
}
console.log("Đã ghi 18 tệp vào", RA);
