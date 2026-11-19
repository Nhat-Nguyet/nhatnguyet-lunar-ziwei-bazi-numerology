// Sinh js/packages/tu-vi/src/iztro-nhan.ts: bảng chữ của iztro 2.6.5 (sáu ngôn
// ngữ) cho đúng những khoá mà lớp tương thích @nhatnguyet/tu-vi/iztro dùng, để
// tên sao, cung, độ sáng... ra ĐÚNG như iztro. Chỉ chép chuỗi dịch (dữ liệu),
// không chép mã. Chạy lại khi nâng phiên bản iztro ghim trong package.json:
//
//   cd doi-chieu && npm ci && node sinh-nhan-iztro.mjs

import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const THU_MUC = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const PHIEN_BAN = JSON.parse(readFileSync(path.join(THU_MUC, "node_modules/iztro/package.json"), "utf8")).version;
const NGON_NGU = ["zh-CN", "zh-TW", "en-US", "vi-VN", "ja-JP", "ko-KR"];

const KHOA = [
  // chính tinh, phụ tinh (cả hai sao lõi chưa an: huoxingMin, lingxingMin, vì Thân chủ cần Hỏa Tinh)
  "ziweiMaj", "tianjiMaj", "taiyangMaj", "wuquMaj", "tiantongMaj", "lianzhenMaj", "tianfuMaj", "taiyinMaj",
  "tanlangMaj", "jumenMaj", "tianxiangMaj", "tianliangMaj", "qishaMaj", "pojunMaj",
  "zuofuMin", "youbiMin", "wenchangMin", "wenquMin", "tiankuiMin", "tianyueMin", "lucunMin", "tianmaMin",
  "dikongMin", "dijieMin", "qingyangMin", "tuoluoMin", "huoxingMin", "lingxingMin",
  // tạp diệu lõi có an
  "tianguan", "tianfu", "tianku", "tianxu", "santai", "bazuo", "engguang", "tiangui", "tiancai", "tianshou", "xianchi",
  // ba vòng
  "changsheng", "muyu", "guandai", "linguan", "diwang", "shuai", "bing", "si", "mu", "jue", "tai", "yang",
  "boshi", "lishi", "qinglong", "xiaohao", "jiangjun", "zhoushu", "faylian", "xishen", "bingfu", "dahao", "fubing", "guanfu",
  "suijian", "huiqi", "sangmen", "guansuo", "gwanfu", "longde", "baihu", "tiande", "diaoke",
  // cung
  "soulPalace", "siblingsPalace", "spousePalace", "childrenPalace", "wealthPalace", "healthPalace", "surfacePalace",
  "friendsPalace", "careerPalace", "propertyPalace", "spiritPalace", "parentsPalace",
  // sáng tối, tứ hoá, cục, giới
  "miao", "wang", "de", "li", "ping", "bu", "xian", "sihuaLu", "sihuaQuan", "sihuaKe", "sihuaJi",
  "water2nd", "wood3rd", "metal4th", "earth5th", "fire6th", "male", "female",
  // can, chi
  "jiaHeavenly", "yiHeavenly", "bingHeavenly", "dingHeavenly", "wuHeavenly", "jiHeavenly", "gengHeavenly", "xinHeavenly", "renHeavenly", "guiHeavenly",
  "ziEarthly", "chouEarthly", "yinEarthly", "maoEarthly", "chenEarthly", "siEarthly", "wuEarthly", "weiEarthly", "shenEarthly", "youEarthly", "xuEarthly", "haiEarthly",
  // con giáp, giờ, cung hoàng đạo, mẫu ngày âm
  "rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "sheep", "monkey", "rooster", "dog", "pig",
  "earlyRatHour", "oxHour", "tigerHour", "rabbitHour", "dragonHour", "snakeHour", "horseHour", "goatHour", "monkeyHour",
  "roosterHour", "dogHour", "pigHour", "lateRatHour",
  "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
  "lunarDate", "leapMonth",
];

const bang = {};
for (const l of NGON_NGU) {
  const tu = require(`iztro/lib/i18n/locales/${l}/index.js`).default;
  bang[l] = {};
  for (const k of KHOA) {
    // zh-CN, zh-TW in ngày âm bằng chữ Hán của lunar-typescript, không có mẫu lunarDate.
    if (typeof tu[k] !== "string") {
      if (l.startsWith("zh-") && (k === "lunarDate" || k === "leapMonth")) continue;
      throw new Error(`${l}: thiếu khoá ${k}`);
    }
    bang[l][k] = tu[k];
  }
}

const giayPhep = readFileSync(path.join(THU_MUC, "node_modules/iztro/LICENSE"), "utf8").trim().split("\n").map((x) => ("// " + x).trimEnd()).join("\n");
const ra = `// TỆP SINH bằng doi-chieu/sinh-nhan-iztro.mjs, đừng sửa tay.
//
// Chuỗi hiển thị của iztro ${PHIEN_BAN} (thư mục lib/i18n/locales) cho các khoá
// lớp tương thích @nhatnguyet/tu-vi/iztro dùng, để tên sao, cung, độ sáng...
// ra ĐÚNG như iztro ở sáu ngôn ngữ. Chỉ chép chuỗi dịch, không chép mã.
// Display strings copied from iztro ${PHIEN_BAN} (https://github.com/SylarLong/iztro),
// used under its MIT license:
//
${giayPhep}

/** Ngôn ngữ iztro nhận. */
export type IztroLanguage = ${NGON_NGU.map((l) => JSON.stringify(l)).join(" | ")};

/** Danh sách ngôn ngữ iztro nhận. */
export const IZTRO_LANGUAGES: readonly IztroLanguage[] = ${JSON.stringify(NGON_NGU)};

/** Phiên bản iztro mà bảng chữ được chép. */
export const IZTRO_VERSION = ${JSON.stringify(PHIEN_BAN)};

/** Bảng chữ: ngôn ngữ, khoá iztro, chữ hiển thị. */
export const NHAN_IZTRO: Readonly<Record<IztroLanguage, Readonly<Record<string, string>>>> = ${JSON.stringify(bang, null, 2)};
`;
writeFileSync(path.join(THU_MUC, "../js/packages/tu-vi/src/iztro-nhan.ts"), ra);
console.log(`đã ghi iztro-nhan.ts: ${KHOA.length} khoá × ${NGON_NGU.length} ngôn ngữ (iztro ${PHIEN_BAN})`);
