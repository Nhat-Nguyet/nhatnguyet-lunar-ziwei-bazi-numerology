#!/usr/bin/env node
// Sinh bộ thuật ngữ ba thứ tiếng (terminology.csv, terminology.json, bảng đếm
// trong README.md) TỪ CHÍNH BẢNG CỦA THƯ VIỆN: tên Việt, Anh, Trung lấy từ
// các bảng đã xuất của gói (am-lich, tu-vi, bat-tu, than-so-hoc, le-hoi,
// iching, fengshui), là
// bản chép của lõi tính Go. Không gõ tay tên nào thư viện đã có; chữ Hán phồn
// thể và pinyin có dấu thanh ghép từng chữ theo han-readings.json (bảng chữ soát
// tay; tên phồn thể của chính thư viện hay của iztro zh-TW được ưu tiên).
// Định nghĩa chỉ lấy câu thư viện đã có, hoặc
// dựng từ dữ kiện của bảng (hành, âm dương, thứ tự); không có thì để trống.
//
// Glossary generator. Every name comes from the libraries' own tables, so the
// glossary cannot drift from what the libraries output (check.test.mjs checks).
//
//   node --conditions=source du-lieu/terminology/generate.mjs          # write files
//   node --conditions=source du-lieu/terminology/generate.mjs --check   # check only

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as AL from "../../js/packages/am-lich/src/index.ts";
import * as TV from "../../js/packages/tu-vi/src/index.ts";
import * as BT from "../../js/packages/bat-tu/src/index.ts";
import * as TSH from "../../js/packages/than-so-hoc/src/index.ts";
import { NHAN_IZTRO, IZTRO_VERSION } from "../../js/packages/tu-vi/src/iztro-nhan.ts";
import { voidName } from "../../js/packages/tu-vi/src/ten-en.ts";
import * as YI from "../../js/packages/iching/src/index.ts";
import { LUC_THAN, LUC_THU, TEN_QUE, TRANG_THAI, VAI_TRO_QUAI_KHI, VI_TRI_CUNG } from "../../js/packages/iching/src/data.ts";
import * as FS from "../../js/packages/fengshui/src/index.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");

/** Columns, in CSV order. */
export const COLUMNS = [
  "id", "category", "vi", "vi_alt", "han", "zh", "pinyin", "en", "en_alt", "en_alt_source", "code",
  "definition_en", "definition_vi", "definition_zh", "note", "source",
];

/** Category descriptions (English), in output order. */
export const CATEGORIES = {
  "heavenly-stem": "The ten heavenly stems (thiên can, 天干).",
  "earthly-branch": "The twelve earthly branches (địa chi, 地支), also the twelve double hours.",
  "sexagenary-cycle": "The sixty stem-branch pairs (can chi, 干支) naming years, months, days and hours.",
  "five-elements": "The five elements or phases (ngũ hành, 五行).",
  "yin-yang": "Yin and yang (âm dương, 阴阳).",
  "yin-yang-gender": "Yin/yang of the birth year combined with gender, used to set the direction of Zi Wei and BaZi cycles.",
  "zodiac-animal": "The twelve zodiac animals (con giáp, 生肖). Vietnam's fourth animal is the Cat; elsewhere the Rabbit.",
  "na-yin": "The thirty na yin (nạp âm, 纳音) elements, one per pair of the sexagenary cycle.",
  "solar-term": "The 24 solar terms (tiết khí, 节气).",
  "lunar-mansion": "The 28 lunar mansions (Nhị Thập Bát Tú, 二十八宿) as assigned to days.",
  "lunar-mansion-group": "The four quadrants of seven mansions.",
  "hour-spirit": "The twelve spirits that preside over the double hours of a day (auspiciousHours); six of them make an hour auspicious (giờ hoàng đạo).",
  "ziwei-palace": "The twelve palaces of a Zi Wei Dou Shu (Tử Vi) chart.",
  "ziwei-brightness": "Brightness levels of the 14 major stars (miếu, vượng, đắc, bình, hãm).",
  "ziwei-four-transformations": "The Four Transformations (Tứ Hóa, 四化).",
  "ziwei-bureau": "The five element bureaus (cục, 局) of a Zi Wei chart.",
  "ziwei-major-star": "The 14 major stars (chính tinh, 主星).",
  "ziwei-minor-star": "Minor stars (phụ tinh, tạp diệu) placed by the library, including the 31 added in engine 2.1.0.",
  "ziwei-star-group": "Groups of minor stars (field `nhom`).",
  "twelve-growth-stages": "The twelve stages of the Tràng Sinh (长生) ring, used by both Zi Wei and BaZi.",
  "ziwei-year-ring": "The twelve stars of the Thái Tuế (太岁) ring.",
  "ziwei-scholar-ring": "The twelve stars of the Bác Sỹ (博士) ring.",
  "ziwei-void": "The two void markers Tuần (旬空) and Triệt (截空).",
  "ziwei-yearly-star": "Flowing (yearly) stars placed for a viewing year.",
  "ziwei-pattern": "Named chart patterns (cách cục, 格局) the library recognizes.",
  "bazi-ten-god": "The Ten Gods (thập thần, 十神) of BaZi.",
  "bazi-hidden-stem-role": "Roles of the stems hidden in a branch (tàng can, 藏干).",
  "bazi-symbolic-star": "Symbolic stars (thần sát, 神煞) the BaZi library looks up.",
  "numerology-number": "Names of the numerology numbers (Pythagorean method).",
  "festival-category": "Category codes of the Vietnamese festival dataset (le-hoi-viet-nam).",
  "iching-trigram": "The eight trigrams (bát quái, 八卦), numbered in the Fu Xi order (Qian 1 ... Kun 8).",
  "iching-hexagram": "The 64 hexagrams (quẻ, 卦) in the King Wen order.",
  "iching-palace-generation": "Place of a hexagram in its Eight Palaces (bát cung, 八宫) palace, after Jing Fang; it sets the world line.",
  "iching-six-relation": "The six relations (lục thân, 六亲) of a Six Lines chart, by the palace element; five names.",
  "iching-six-spirit": "The six spirits (lục thú, 六兽) of a Six Lines chart, starting from the day stem.",
  "iching-month-state": "Seasonal state of a line under the month branch (nguyệt lệnh, 月令).",
  "iching-gua-qi-role": "Rank of a hexagram in its solar month in the Gua Qi (quái khí, 卦气) calendar of Meng Xi.",
  "fengshui-eight-mansions-star": "The eight stars of the Eight Mansions school (Bát Trạch, 八宅), four favorable and four unfavorable.",
  "fengshui-group": "East and west groups of the Eight Mansions school (đông tứ, tây tứ).",
  "fengshui-mountain": "The 24 mountains (nhị thập tứ sơn, 二十四山) of the compass, 15 degrees each.",
  "fengshui-nine-star": "The nine stars (cửu tinh, 九星) of the Lo Shu, used by the Xuan Kong flying star school.",
  "fengshui-star-qi": "Role of a star in a 20-year period of the Xuan Kong school (vượng, sinh, thoái, sát, tử).",
  "fengshui-flying-star-pattern": "Named patterns of a Xuan Kong flying star chart.",
  "fengshui-luban-sector": "Sectors of the three Luban rulers (thước Lỗ Ban, 鲁班尺): 52.2 cm clear-opening, 42.9 cm Luban, 38.8 cm Dinglan.",
  "fengshui-luban-sub-sector": "Sub-sectors (cung nhỏ) of the 52.2 cm clear-opening and 42.9 cm Luban rulers, five and four per sector; the 38.8 cm Dinglan ruler has none.",
};

// ---------------------------------------------------------------- tiện ích

const num = (i) => String(i + 1).padStart(2, "0");
const VOCAB = AL.TU_VUNG;

/** Chữ Việt khác lối viết của cùng thuật ngữ (Thủy, Thuỷ; Kim Bạch Kim, Kim Bạc Kim) theo từ vựng lõi. */
function viSpellings(vi) {
  const t = VOCAB[vi];
  if (!t) return [];
  const words = vi.split(" ").length;
  return Object.keys(VOCAB).filter(
    (k) => k !== vi && VOCAB[k][0] === t[0] && VOCAB[k][1] === t[1] && k.split(" ").length === words,
  );
}

// Bảng iztro: chữ zh-CN sang [zh-TW, en-US], tách hai nhóm khoá: tên cung
// (khoá đuôi "Palace") và mọi khoá khác; bỏ chữ mơ hồ (một chữ, nhiều bản Anh).
// Chỉ tra cho các nhóm thuật ngữ của Tử Vi, can, chi, con giáp (IZTRO_NHOM):
// "女" của iztro là giới tính, không phải tú Nữ; "七杀" là sao, không phải thập thần.
const IZTRO_CATEGORIES = new Set([
  "heavenly-stem", "earthly-branch", "zodiac-animal", "ziwei-palace", "ziwei-brightness", "ziwei-four-transformations",
  "ziwei-bureau", "ziwei-major-star", "ziwei-minor-star", "twelve-growth-stages", "ziwei-year-ring", "ziwei-scholar-ring",
  "ziwei-yearly-star",
]);
function iztroTable(palaceKeys) {
  const cn = NHAN_IZTRO["zh-CN"];
  const tw = NHAN_IZTRO["zh-TW"];
  const en = NHAN_IZTRO["en-US"];
  const byText = new Map();
  for (const [k, v] of Object.entries(cn)) {
    if (!en[k] || k.endsWith("Palace") !== palaceKeys) continue;
    const rows = byText.get(v) ?? [];
    rows.push(k);
    byText.set(v, rows);
  }
  const out = new Map();
  for (const [text, keys] of byText) {
    const ens = new Set(keys.map((k) => en[k]));
    const tws = new Set(keys.map((k) => tw[k]));
    if (ens.size === 1 && tws.size === 1) out.set(text, { tw: tw[keys[0]], en: en[keys[0]] });
  }
  return out;
}
const IZTRO = iztroTable(false);
const IZTRO_PALACES = iztroTable(true);
const lookupIztro = (category, zh) => (IZTRO_CATEGORIES.has(category) ? (category === "ziwei-palace" ? IZTRO_PALACES : IZTRO).get(zh) : undefined);
const IZTRO_SOURCE = `iztro ${IZTRO_VERSION} (en-US)`;

const CHARS = JSON.parse(readFileSync(path.join(HERE, "han-readings.json"), "utf8")).chars;

/** Phồn thể và pinyin của một thuật ngữ giản thể, ghép từng chữ; null khi có chữ chưa trong bảng. */
function hanAndPinyin(zh, missing) {
  const han = [];
  const py = [];
  for (const c of zh) {
    const x = CHARS[c];
    if (!x) {
      missing.add(c);
      return null;
    }
    han.push(x[0]);
    py.push(x[1]);
  }
  return { han: han.join(""), pinyin: py.join(" ") };
}

/** Builder: collects entries and fills han, pinyin, en_alt. */
class Builder {
  constructor() {
    this.rows = [];
    this.missing = new Set();
    this.perCategory = new Map();
  }
  add(e) {
    const r = Object.fromEntries(COLUMNS.map((c) => [c, ""]));
    Object.assign(r, e);
    // Stable English id: category plus the 1-based position in the category's own order.
    const k = (this.perCategory.get(e.category) ?? 0) + 1;
    this.perCategory.set(e.category, k);
    r.id = `${e.category}-${String(k).padStart(2, "0")}`;
    r.vi_alt = [...new Set([...(e.vi_alt ?? []), ...viSpellings(e.vi)])].join("|");
    // Bản Anh khác: các nguồn kèm, bỏ trùng với bản Anh chính (không phân biệt hoa thường).
    const alt = [];
    const seen = new Set([r.en.toLowerCase()]);
    for (const [en, src] of e.alt ?? []) {
      if (!en || seen.has(en.toLowerCase())) continue;
      seen.add(en.toLowerCase());
      alt.push([en, src]);
    }
    if (e.iztro !== false && r.zh) {
      const zhKey = typeof e.iztro === "string" ? e.iztro : r.zh;
      const iz = lookupIztro(r.category, zhKey);
      if (iz && !seen.has(iz.en.toLowerCase())) {
        alt.push([iz.en, IZTRO_SOURCE]);
        seen.add(iz.en.toLowerCase());
      }
    }
    r.en_alt = alt.map((a) => a[0]).join("|");
    r.en_alt_source = alt.map((a) => a[1]).join("|");
    delete r.alt;
    delete r.iztro;
    if (r.zh && !e.pinyin) {
      const hp = hanAndPinyin(r.zh, this.missing);
      if (hp) {
        if (!r.han) r.han = (e.iztro !== false && lookupIztro(r.category, r.zh)?.tw) || hp.han;
        r.pinyin = hp.pinyin;
      }
    }
    for (const c of COLUMNS) if (typeof r[c] !== "string") r[c] = String(r[c]);
    this.rows.push(Object.fromEntries(COLUMNS.map((c) => [c, r[c]])));
  }
}

const SRC_VOCAB = "am-lich/src/tu-vung.ts (TU_VUNG, generated from the Go core tuvung.go)";
const YIN = { vi: "âm", en: "yin", zh: "阴" };
const YANG = { vi: "dương", en: "yang", zh: "阳" };
const ELEMENT_EN = AL.HANH_EN;
const ELEMENT_ZH = AL.HANH_ZH;

// ---------------------------------------------------------------- dựng

export function buildGlossary() {
  const b = new Builder();
  const { THIEN_CAN, DIA_CHI, CON_GIAP, CAN_NGU_HANH, CHI_NGU_HANH, STEM_PINYIN, BRANCH_PINYIN } = AL;

  // Thiên can.
  THIEN_CAN.forEach((vi, i) => {
    const h = CAN_NGU_HANH[i];
    const polarity = i % 2 === 0 ? YANG : YIN;
    b.add({
      category: "heavenly-stem", vi, zh: VOCAB[vi][1], en: STEM_PINYIN[i],
      alt: [[vi, 'terms: "vi" (Sino-Vietnamese)']],
      definition_en: `Heavenly stem ${i + 1} of 10: ${polarity.en} ${ELEMENT_EN[h]}.`,
      definition_vi: `Thiên can thứ ${i + 1} trong 10: ${h} ${polarity.vi}.`,
      definition_zh: `十天干第${i + 1}位，${polarity.zh}${ELEMENT_ZH[h]}。`,
      note: 'English output is pinyin without tones (option terms: "pinyin", the default).',
      source: "am-lich/src/can-chi.ts (THIEN_CAN), en.ts (STEM_PINYIN), ngu-hanh.ts (CAN_NGU_HANH)",
    });
  });

  // Địa chi.
  DIA_CHI.forEach((vi, i) => {
    const h = CHI_NGU_HANH[i];
    const hourVi = AL.hourBranch(i === 0 ? 0 : i * 2, "vi");
    const hidden = BT.tangCanCuaChi(i).map((t) => t.can);
    const hiddenEn = hidden.map((c) => STEM_PINYIN[THIEN_CAN.indexOf(c)]);
    const hiddenZh = hidden.map((c) => VOCAB[c][1]);
    b.add({
      category: "earthly-branch", vi, zh: VOCAB[vi][1], en: BRANCH_PINYIN[i],
      alt: [[vi, 'terms: "vi" (Sino-Vietnamese)']],
      definition_en: `Earthly branch ${i + 1} of 12: element ${ELEMENT_EN[h]}; zodiac animal ${AL.zodiacName(i, "en")}; double hour ${hourVi.range.replace("-", " to ")}; hidden stems ${hiddenEn.join(", ")}.`,
      definition_vi: `Địa chi thứ ${i + 1} trong 12: hành ${h}; con giáp ${CON_GIAP[i]}; giờ ${vi} từ ${hourVi.range.replace("-", " tới ")}; tàng can ${hidden.join(", ")}.`,
      definition_zh: `十二地支第${i + 1}位，五行属${ELEMENT_ZH[h]}，生肖${AL.zodiacName(i, "zh")}，${vi === "Tý" ? "子" : VOCAB[vi][1]}时 ${hourVi.range.replace("-", " 至 ")}，藏干${hiddenZh.join("、")}。`,
      note: "The Tý hour runs from 23:00 to 00:59 (chiGioTuGioDongHo). Hidden stems: main qi first (tangCanCuaChi).",
      source: "am-lich/src/can-chi.ts (DIA_CHI), en.ts (BRANCH_PINYIN, hourBranch); bat-tu/src/tang-can.ts (tangCanCuaChi)",
    });
  });

  // Lục thập hoa giáp.
  for (let k = 0; k < 60; k++) {
    const p = AL.pillarFromIndex(k % 10, k % 12, "en");
    const pv = AL.pillarFromIndex(k % 10, k % 12, "vi");
    const pz = AL.pillarFromIndex(k % 10, k % 12, "zh");
    b.add({
      category: "sexagenary-cycle",
      vi: pv.label, zh: pz.label, en: p.label,
      alt: [[pv.label, 'terms: "vi" (Sino-Vietnamese)']],
      definition_en: `Pair ${k + 1} of the 60-pair cycle; na yin ${p.naYin} (${p.naYinElement}).`,
      definition_vi: `Cặp thứ ${k + 1} của vòng 60; nạp âm ${pv.naYin} (${pv.naYinElement}).`,
      definition_zh: `六十甲子第${k + 1}位，纳音${pz.naYin}（${pz.naYinElement}）。`,
      source: "am-lich/src/en.ts (pillarFromIndex, stemBranchName); ngu-hanh.ts (nguHanhNapAm)",
    });
  }

  // Ngũ hành (thứ tự vòng tương sinh của bản Go).
  AL.NGU_HANH_LIST.forEach((vi, i) => {
    const generates = AL.nguHanhSinhRa(vi);
    const overcomes = AL.nguHanhKhacDuoc(vi);
    b.add({
      category: "five-elements", vi, zh: ELEMENT_ZH[vi], en: ELEMENT_EN[vi],
      definition_en: `${ELEMENT_EN[vi]} generates ${ELEMENT_EN[generates]} and overcomes ${ELEMENT_EN[overcomes]}.`,
      definition_vi: `${vi} sinh ${generates}, khắc ${overcomes}.`,
      definition_zh: `${ELEMENT_ZH[vi]}生${ELEMENT_ZH[generates]}，${ELEMENT_ZH[vi]}克${ELEMENT_ZH[overcomes]}。`,
      source: "am-lich/src/ngu-hanh.ts (NGU_HANH_LIST, HANH_EN, HANH_ZH, nguHanhSinhRa, nguHanhKhacDuoc)",
    });
  });

  // Âm dương.
  ["Dương", "Âm"].forEach((vi, i) => {
    b.add({
      category: "yin-yang", vi, zh: VOCAB[vi][1], en: VOCAB[vi][0],
      vi_alt: [vi.toLowerCase()],
      note: "Odd-numbered stems and branches (Giáp, Tý...) are yang.",
      source: SRC_VOCAB,
    });
  });
  ["Dương Nam", "Âm Nam", "Dương Nữ", "Âm Nữ"].forEach((vi, i) => {
    const t = TV.TU_VUNG_KET_QUA[vi];
    b.add({
      category: "yin-yang-gender", vi, zh: t[1], en: t[0],
      note: "Yang Male and Yin Female count Zi Wei decades and BaZi luck pillars forward; Yin Male and Yang Female backward.",
      source: "tu-vi/src/du-lieu.ts (TU_VUNG_KET_QUA)",
    });
  });

  // Con giáp (Mèo ở Việt Nam, Thỏ ở nước khác).
  CON_GIAP.forEach((vi, i) => {
    b.add({
      category: "zodiac-animal", vi, zh: AL.zodiacName(i, "zh"), en: AL.zodiacName(i, "en"),
      iztro: i === 3 ? false : undefined,
      note: `Animal of the ${DIA_CHI[i]} branch.` + (i === 3 ? ' Vietnam only; with country other than "VN" the library returns Rabbit.' : ""),
      source: "am-lich/src/can-chi.ts (CON_GIAP), en.ts (zodiacName)",
    });
  });
  b.add({
    category: "zodiac-animal", vi: AL.zodiacName(3, "vi", "CN"), zh: AL.zodiacName(3, "zh", "CN"), en: AL.zodiacName(3, "en", "CN"),
    note: 'Animal of the Mão branch outside Vietnam (zodiacName with country other than "VN").',
    source: "am-lich/src/en.ts (zodiacName)",
  });

  // Nạp âm: 30 tên theo thứ tự vòng 60.
  {
    const byName = new Map();
    for (let k = 0; k < 60; k++) {
      const na = AL.nguHanhNapAm(k % 10, k % 12);
      const pair = AL.THIEN_CAN[k % 10] + " " + DIA_CHI[k % 12];
      if (!byName.has(na.ten)) byName.set(na.ten, { na, pairs: [] });
      byName.get(na.ten).pairs.push(pair);
    }
    [...byName.values()].forEach(({ na, pairs }, i) => {
      const t = VOCAB[na.ten];
      const pairsEn = pairs.map((c) => AL.stemBranchName(c, "en"));
      const pairsZh = pairs.map((c) => AL.stemBranchName(c, "zh"));
      b.add({
        category: "na-yin", vi: na.ten, zh: t[1], en: t[0],
        definition_en: `Na yin of ${pairsEn.join(" and ")}; element ${na.hanhEn}.`,
        definition_vi: `Nạp âm của ${pairs.join(" và ")}; hành ${na.hanh}.`,
        definition_zh: `${pairsZh.join("、")}之纳音，五行属${ELEMENT_ZH[na.hanh]}。`,
        source: "am-lich/src/ngu-hanh.ts (NAP_AM_GOC via nguHanhNapAm); names in " + SRC_VOCAB,
      });
    });
  }

  // 24 tiết khí, từ Lập Xuân.
  AL.allTietKhi().forEach((t, i) => {
    b.add({
      category: "solar-term", vi: t.ten, zh: VOCAB[t.ten][1], en: t.tenEn,
      alt: [[VOCAB[t.ten][0], "nhatnguyet core vocabulary (tuvung.go)"]],
      code: t.laTiet ? "jie" : "qi",
      definition_en: t.yNghiaEn, definition_vi: t.yNghia, definition_zh: t.yNghiaZh,
      note: `Sun's apparent longitude ${t.kinhDo}°. ` + (t.laTiet ? "Sectional term (jie, 节): starts a BaZi month." : "Midpoint term (qi, 中气)."),
      source: "am-lich/src/tiet-khi.ts (TIET_KHI_TABLE)",
    });
  });

  // Nhị Thập Bát Tú: lõi chỉ có bản Việt, Anh; chữ Hán là tên chuẩn của 28 tú, thêm ở bảng này.
  const MANSION_ZH = ["角", "亢", "氐", "房", "心", "尾", "箕", "斗", "牛", "女", "虚", "危", "室", "壁", "奎", "娄", "胃", "昴", "毕", "觜", "参", "井", "鬼", "柳", "星", "张", "翼", "轸"];
  const QUADRANT_ZH = { "Thanh Long (Đông)": "东方青龙", "Huyền Vũ (Bắc)": "北方玄武", "Bạch Hổ (Tây)": "西方白虎", "Chu Tước (Nam)": "南方朱雀" };
  const WEEKDAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const quadrants = [];
  AL.allNhiThapBatTu().forEach((s, i) => {
    if (!quadrants.some((c) => c.chom === s.chom)) quadrants.push(s);
    b.add({
      category: "lunar-mansion", vi: s.ten, zh: MANSION_ZH[i], en: s.tenEn,
      note: `${s.chomEn} quadrant; day planet ${s.dieu}, so it always falls on a ${WEEKDAY_EN[s.thu]}.`,
      source: "am-lich/src/nhi-thap-bat-tu.ts (BANG via allNhiThapBatTu); zh: standard mansion names, added in this glossary (the library outputs vi and en only)",
    });
  });
  quadrants.forEach((s, i) => {
    b.add({
      category: "lunar-mansion-group", vi: s.chom, zh: QUADRANT_ZH[s.chom], en: s.chomEn, iztro: false,
      source: "am-lich/src/nhi-thap-bat-tu.ts (chom, chomEn); zh added in this glossary",
    });
  });

  // ---- Mười hai thần trực giờ: tên lấy từ chính auspiciousHours (vi, han), pinyin
  // từ HOUR_SPIRIT_PINYIN. Ngày 2027-02-06 (Thìn) có đủ mười hai thần.
  {
    const vi = AL.auspiciousHours("2027-02-06", { lang: "vi" }).hours;
    const zh = AL.auspiciousHours("2027-02-06", { lang: "zh" }).hours;
    const theoThuTu = (ds) => [...ds].sort((a, c) => a.spiritIndex - c.spiritIndex);
    theoThuTu(vi).forEach((h, i) => {
      const z = theoThuTu(zh)[i];
      b.add({
        category: "hour-spirit", vi: h.spirit, zh: z.spirit, en: AL.HOUR_SPIRIT_PINYIN[i], iztro: false,
        vi_alt: i === 5 ? ["Bảo Quang"] : [],
        code: String(i),
        note: (AL.AUSPICIOUS_SPIRITS.includes(i) ? "Auspicious (hoàng đạo)." : "Inauspicious (hắc đạo).") +
          (i === 5 ? " Vietnamese almanacs call it Kim Đường; the hour tables of the books write 宝光 (and 天德 for days)." : ""),
        source: "am-lich/src/gio-hoang-dao.ts (auspiciousHours, HOUR_SPIRIT_PINYIN); Go core truc_ngay.go (tenThanNgay, tenThanGioZh)",
      });
    });
  }

  // ---- Tử Vi
  TV.TEN_CUNG_THEO_OFFSET.forEach((c, i) => {
    b.add({
      category: "ziwei-palace", vi: c.vi, zh: c.zh, en: c.en,
      alt: [[VOCAB[c.vi][0], "nhatnguyet core vocabulary (tuvung.go)"]],
      note: `Palace ${i + 1} counted backward from the Life palace.`,
      source: "tu-vi/src/du-lieu.ts (TEN_CUNG_THEO_OFFSET)",
    });
  });
  Object.entries(TV.DIGNITY_LABEL).forEach(([key, d], i) => {
    b.add({
      category: "ziwei-brightness", vi: d.vi, zh: d.zh, en: d.en, code: key,
      iztro: d.zh === "得地" ? "得" : undefined,
      note: "Brightest first. The library gives brightness for the 14 major stars only (CHINH_TINH_DIGNITY).",
      source: "tu-vi/src/du-lieu.ts (DIGNITY_LABEL)",
    });
  });
  ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"].forEach((vi, i) => {
    b.add({
      category: "ziwei-four-transformations", vi,
      zh: TV.TU_VUNG_KET_QUA[vi][1], en: AL.termName(vi, "en"),
      alt: [[vi, 'terms: "vi" (Sino-Vietnamese)']],
      iztro: TV.TU_VUNG_KET_QUA[vi][1].slice(1),
      code: AL.transformationShort(vi, "en"),
      note: "Assigned by the birth-year stem (TU_HOA_THEO_CAN); the schools differ for the stems Canh, Tân, Nhâm.",
      source: "am-lich/src/en.ts (termName, TU_HOA_TEN); tu-vi/src/du-lieu.ts (TU_VUNG_KET_QUA)",
    });
  });
  Object.entries(TV.HANH_TO_CUC).sort((a, c) => a[1].so - c[1].so).forEach(([hanh, c], i) => {
    b.add({
      category: "ziwei-bureau", vi: c.ten, zh: c.zh, en: c.en, code: String(c.so),
      definition_en: `Bureau number ${c.so}, from the ${ELEMENT_EN[hanh]} na yin of the Life palace.`,
      definition_vi: `Cục số ${c.so}, theo nạp âm hành ${hanh} của cung Mệnh.`,
      definition_zh: `局数${c.so}，取命宫纳音五行${ELEMENT_ZH[hanh]}。`,
      source: "tu-vi/src/du-lieu.ts (HANH_TO_CUC)",
    });
  });
  // 14 chính tinh, thứ tự an sao.
  const MAJOR = ["Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh", "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương", "Thất Sát", "Phá Quân"];
  if (MAJOR.length !== Object.keys(TV.CHINH_TINH_NAME_EN).length || MAJOR.some((s) => !TV.CHINH_TINH_NAME_EN[s])) throw new Error("the 14 major stars differ from CHINH_TINH_NAME_EN");
  MAJOR.forEach((vi, i) => {
    const coreEn = TV.CHINH_TINH_NAME_EN[vi];
    const en = TV.starEn(vi, coreEn);
    b.add({
      category: "ziwei-major-star", vi, zh: TV.CHINH_TINH_NAME_ZH[vi], en,
      alt: [[coreEn, "nhatnguyet core (tuvi_data.go)"]],
      note: en !== coreEn ? `English name corrected in the English layer (STAR_EN_FIX); the core table says "${coreEn}".` : "",
      source: "tu-vi/src/du-lieu.ts (CHINH_TINH_NAME_EN, CHINH_TINH_NAME_ZH), ten-en.ts (starEn)",
    });
  });
  // Phụ tinh: 13 gốc, 11 thêm (sao-phu.ts), 31 thêm (sao-phu-them.ts).
  const minors = [];
  Object.keys(TV.PHU_TINH_NAME_EN).forEach((vi) => minors.push({ vi, from: "13 original minor stars (PHU_TINH_NAME_EN)" }));
  const placements = Object.fromEntries(TV.saoPhuMoi().map((m) => [m.ten, m]));
  TV.TEN_SAO_PHU_MOI.forEach((vi) => minors.push({ vi, from: "11 minor stars (TEN_SAO_PHU_MOI)", placement: placements[vi].cachAn }));
  TV.SAO_PHU_THEM.forEach((s) => minors.push({ vi: s.ten, from: "31 minor stars added in engine 2.1.0 (SAO_PHU_THEM)" }));
  minors.forEach((p, i) => {
    const names = TV.tenSaoTuViBaThu(p.vi);
    const en = TV.starEn(p.vi, names.en);
    const group = TV.nhomCuaPhuTinh(p.vi);
    const groupName = TV.NHAN_NHOM_SAO[group];
    let note = `Group: ${groupName.en} (${TV.STAR_GROUP_EN[group]}).`;
    if (p.placement) note += ` Placement: ${p.placement.en}`;
    if (en !== names.en) note += ` English name corrected in the English layer (STAR_EN_FIX); the core table says "${names.en}".`;
    b.add({
      category: "ziwei-minor-star", vi: p.vi, zh: names.zh, en,
      alt: [[names.en, "nhatnguyet core (tuvi_data.go)"]],
      code: TV.STAR_GROUP_EN[group], note,
      source: `tu-vi/src/sao-phu.ts (tenSaoTuViBaThu): ${p.from}`,
    });
  });
  Object.entries(TV.NHAN_NHOM_SAO).forEach(([key, n], i) => {
    b.add({
      category: "ziwei-star-group", vi: n.vi, zh: n.zh, en: n.en, code: TV.STAR_GROUP_EN[key],
      source: "tu-vi/src/sao-phu-them.ts (NHAN_NHOM_SAO)",
    });
  });
  TV.TEN_VONG_TRUONG_SINH.forEach((c, i) => {
    b.add({
      category: "twelve-growth-stages", vi: c.vi, zh: c.zh, en: c.en,
      note: `Stage ${i + 1} of 12. Zi Wei starts the ring from the bureau (TRANG_SINH_THEO_CUC); BaZi applies it to each stem (truongSinhCuaCan).`,
      source: "tu-vi/src/du-lieu.ts (TEN_VONG_TRUONG_SINH); bat-tu/src/tang-can.ts (TEN_VONG_TRUONG_SINH)",
    });
  });
  TV.TEN_VONG_THAI_TUE.forEach((c, i) => {
    b.add({
      category: "ziwei-year-ring", vi: c.vi, zh: c.zh, en: c.en,
      note: `Star ${i + 1} of the Thái Tuế ring, placed forward from the palace of the birth-year branch.`,
      source: "tu-vi/src/du-lieu.ts (TEN_VONG_THAI_TUE)",
    });
  });
  TV.TEN_VONG_BAC_SY.forEach((c, i) => {
    b.add({
      category: "ziwei-scholar-ring", vi: c.vi, zh: c.zh, en: c.en,
      note: `Star ${i + 1} of the Bác Sỹ ring, starting at the Lộc Tồn palace; direction by yin/yang and gender.`,
      source: "tu-vi/src/du-lieu.ts (TEN_VONG_BAC_SY)",
    });
  });
  [["tuan", "Tuần"], ["triet", "Triệt"]].forEach(([key, vi], i) => {
    b.add({
      category: "ziwei-void", vi, zh: voidName(key, "han"), en: voidName(key, "pinyin"), code: key,
      alt: [[vi, 'terms: "vi" (Sino-Vietnamese)']],
      note: key === "tuan" ? "Xun Kong: the two branches left over by the decade (xun) of the birth-year pair." : "Jie Kong: two palaces fixed by the birth-year stem (TRIET_THEO_CAN).",
      source: "tu-vi/src/ten-en.ts (voidName); en.ts (fields tuan, triet)",
    });
  });
  // Sao lưu: tên lấy từ chính hàm yearlyStars (thứ tự cố định của bảng).
  {
    const ls = TV.castZiWei({ date: "1990-09-19", time: "20:00", gender: "male" });
    const lists = { vi: TV.yearlyStars(ls, 2026, { lang: "vi" }), en: TV.yearlyStars(ls, 2026, { lang: "en" }), zh: TV.yearlyStars(ls, 2026, { lang: "zh" }) };
    lists.vi.forEach((s, i) => {
      b.add({
        category: "ziwei-yearly-star", vi: s.name, zh: lists.zh[i].name, en: lists.en[i].name, code: s.code,
        note: s.byStem ? "Placed by the stem of the viewing year." : "Placed by the branch of the viewing year.",
        source: "tu-vi/src/luu-sao.ts (TEN_SAO_LUU via yearlyStars)",
      });
    });
  }
  // Cách cục: tên Việt, giản thể, phồn thể đọc từ mã nguồn của hai tệp nhận diện.
  // Pinyin ghép từng chữ theo han-readings.json, trừ tên có chữ đọc khác cách
  // đọc chung của bảng: 相 trong 相逢 là xiāng (bảng giữ xiàng của 天相).
  const PATTERN_PINYIN = { "Tham Hỏa tương phùng": "tān huǒ xiāng féng" };
  // Mã thuật ngữ đánh số theo thứ tự trong nhóm, nên cách thêm sau (lõi tính
  // 2.3.0) xếp cuối nhóm để mã của các cách đã phát hành không đổi.
  const PATTERN_ADDED_LATER = ["Hình Tù giáp Ấn", "Tham Hỏa tương phùng", "Quân tử tại dã"];
  const patterns = readPatterns();
  const patternOrder = [
    ...patterns.filter((p) => !PATTERN_ADDED_LATER.includes(p.vi)),
    ...PATTERN_ADDED_LATER.map((vi) => patterns.find((p) => p.vi === vi)).filter(Boolean),
  ];
  for (const [i, p] of patternOrder.entries()) {
    const hanFix = TV.PATTERN_HAN_FIX[p.vi];
    b.add({
      category: "ziwei-pattern", vi: p.vi, zh: hanFix ? hanFix[0] : p.zh, han: hanFix ? hanFix[1] : p.han,
      ...(PATTERN_PINYIN[p.vi] ? { pinyin: PATTERN_PINYIN[p.vi] } : {}),
      en: TV.PATTERN_EN[p.vi],
      alt: [[p.vi, 'terms: "vi" (Sino-Vietnamese)']],
      iztro: false,
      note: p.quanShu ? "From the pattern tables of the Zi Wei Dou Shu Quan Shu (定富局, 定貴局, 定貧賤局)." : "Recognized by the core rules (tuvi_cachcuc.go).",
      source: `tu-vi/src/${p.quanShu ? "cach-cuc-toan-thu.ts" : "cach-cuc.ts"}; English name: ten-en.ts (PATTERN_EN)`,
    });
  }

  // ---- Bát Tự
  const RELATION = [
    { en: "same element as the day master", vi: "cùng hành với Nhật Chủ", zh: "与日主同五行" },
    { en: "the element the day master generates", vi: "hành Nhật Chủ sinh ra", zh: "日主所生之五行" },
    { en: "the element the day master overcomes", vi: "hành Nhật Chủ khắc", zh: "日主所克之五行" },
    { en: "the element that overcomes the day master", vi: "hành khắc Nhật Chủ", zh: "克日主之五行" },
    { en: "the element that generates the day master", vi: "hành sinh ra Nhật Chủ", zh: "生日主之五行" },
  ];
  const RELATION_CORE = ["cùng hành với Nhật Chủ", "Nhật Chủ sinh ra hành này", "Nhật Chủ khắc hành này", "hành này khắc Nhật Chủ", "hành này sinh ra Nhật Chủ"];
  BT.allThapThan().forEach((t, i) => {
    const rel = RELATION[Math.floor(i / 2)];
    if (t.quanHe !== RELATION_CORE[Math.floor(i / 2)]) throw new Error("Ten God order differs from the core: " + t.ten);
    const sameYinYang = t.cungAmDuong;
    b.add({
      category: "bazi-ten-god", vi: t.ten, zh: t.tenZh, han: t.tenHan, en: t.tenEn,
      definition_en: `A stem of ${rel.en}, ${sameYinYang ? "same" : "opposite"} polarity.`,
      definition_vi: `Can thuộc ${rel.vi}, ${sameYinYang ? "cùng" : "khác"} âm dương.`,
      definition_zh: `${rel.zh}之干，阴阳${sameYinYang ? "相同" : "相异"}。`,
      note: `Pair: ${t.nhom}. Relation as written by the core: "${t.quanHe}".`,
      source: "bat-tu/src/thap-than.ts (allThapThan)",
    });
  });
  {
    // Trụ ngày mang nhãn "Nhật chủ" ở chỗ thập thần; nhãn ba thứ tiếng lấy từ chính lá số.
    const r = BT.lapLaSoBatTu(19, 9, 1990, 20, 0, "Nam").truNgay;
    b.add({
      category: "bazi-ten-god", vi: r.thapThanCan, zh: r.thapThanCanZh, en: r.thapThanCanEn, code: "day-master", iztro: false,
      definition_en: "The day stem.",
      definition_vi: "Can ngày.",
      definition_zh: "日干。",
      note: "Not a Ten God: the label the library puts in the tenGod field of the day pillar.",
      source: "bat-tu/src/la-so.ts (NHAT_CHU_LABEL, truNgay.thapThanCan*)",
    });
  }
  [BT.VAI_TRO_BAN_KHI, BT.VAI_TRO_TRUNG_KHI, BT.VAI_TRO_DU_KHI].forEach((vi, i) => {
    b.add({
      category: "bazi-hidden-stem-role", vi, zh: BT.zhCua(vi), en: BT.enCua(vi),
      note: "Hidden stems follow the Zi Ping Zhen Quan reading (tangCanCuaChi).",
      source: "bat-tu/src/tang-can.ts (TU_VUNG_BAT_TU)",
    });
  });
  {
    // Chín thần sát: tên và cách tra lấy từ chính hàm tinhThanSat.
    const rows = BT.tinhThanSat(0, 0, 0, 0, [0, 0, 0, 0]);
    rows.forEach((s, i) => {
      b.add({
        category: "bazi-symbolic-star", vi: s.ten, zh: s.tenZh, en: s.tenEn, iztro: false,
        note: s.traTheoEn + (s.loiKhacEn ? " " + s.loiKhacEn : ""),
        source: "bat-tu/src/than-sat.ts (tinhThanSat), tang-can.ts (TU_VUNG_BAT_TU)",
      });
    });
  }

  // ---- Thần số học
  Object.keys(TSH.NUMEROLOGY_LABELS.en).forEach((k, i) => {
    b.add({
      category: "numerology-number",
      vi: TSH.NUMEROLOGY_LABELS.vi[k], zh: TSH.NUMEROLOGY_LABELS.zh[k], en: TSH.NUMEROLOGY_LABELS.en[k], code: k,
      source: "than-so-hoc/src/en.ts (NUMEROLOGY_LABELS)",
    });
  });

  // ---- Lễ hội: mã nhóm của bộ dữ liệu. festivals() trả slug tiếng Anh ở mọi lang, mã ở raw;
  // nhãn Việt viết lại từ mã, bản Trung để trống vì thư viện và bộ dữ liệu không có.
  const FESTIVAL_CODES = [
    ["group", "le-tet", "Lễ tết", "holiday"],
    ["group", "tin-nguong", "Tín ngưỡng", "folk-religion"],
    ["group", "khac", "Khác", "other"],
    ["scope", "quoc-gia", "Quốc gia", "national"],
    ["scope", "vung", "Vùng", "regional"],
    ["scope", "dia-phuong", "Địa phương", "local"],
    ["scope", "dai-dien", "Đại diện", "representative"],
    ["level", "major", "Lớn", "major"],
    ["level", "minor", "Nhỏ", "minor"],
    ["calendar", "lunar", "Âm lịch", "lunar"],
    ["calendar", "solar", "Dương lịch", "solar"],
    ["calendar", "theo-nam", "Theo năm", "theo-nam"],
  ];
  const FESTIVAL_COLUMNS = { group: "nhom", scope: "pham_vi", level: "muc_do", calendar: "loai_ngay" };
  for (const [key, en] of Object.entries(festivalSlugs())) {
    if (FESTIVAL_CODES.find((m) => m[1] === key && m[3] !== en)) throw new Error("festival code differs from FESTIVAL_*_EN: " + key);
  }
  FESTIVAL_CODES.forEach(([field, key, vi, en], i) => {
    b.add({
      category: "festival-category", vi, en, code: key, iztro: false,
      note: `Field \`${field}\` of festivals() (dataset column \`${FESTIVAL_COLUMNS[field]}\`). festivals() returns the English value in every lang; the dataset row (raw) keeps the code; the Vietnamese label is written for this glossary.`,
      source: "le-hoi/src/en.ts (FESTIVAL_GROUP_EN, FESTIVAL_SCOPE_EN); du-lieu/le-hoi-viet-nam.meta.json",
    });
  });

  // ---- Kinh Dịch: tên đọc từ chính lớp tiếng Anh của gói iching ở ba thứ
  // tiếng; chữ phồn thể và pinyin có dấu của quẻ, quái là của chính gói.
  const ba = (f) => ({ en: f("en"), vi: f("vi"), zh: f("zh") });
  const SRC_YI = "iching/src/en.ts (trigram, allHexagrams), data.ts";
  for (let n = 1; n <= 8; n++) {
    const t = ba((lang) => YI.trigram(n, { lang }));
    b.add({
      category: "iching-trigram", vi: t.vi.name, zh: t.zh.name, han: t.en.nameHan, pinyin: t.en.pinyin, en: t.en.name,
      alt: [[t.en.image, "trigram image (field image)"]],
      code: String(n),
      definition_en: `Trigram ${n} of 8 in the Fu Xi order ${t.en.symbol}: image ${t.en.image}, element ${t.en.element}, direction ${t.en.direction}.`,
      definition_vi: `Quái thứ ${n} trong 8 theo thứ tự Tiên Thiên ${t.vi.symbol}: tượng ${t.vi.image}, hành ${t.vi.element}, hướng ${t.vi.direction}.`,
      definition_zh: `先天八卦第${n}位${t.zh.symbol}，象${t.zh.image}，五行属${t.zh.element}，方位${t.zh.direction}。`,
      iztro: false,
      note: 'English output is pinyin without tones (terms: "pinyin"); the image is the usual English name.',
      source: SRC_YI,
    });
  }
  {
    const all = ba((lang) => YI.allHexagrams({ lang }));
    all.en.forEach((h, i) => {
      const v = all.vi[i];
      const z = all.zh[i];
      b.add({
        category: "iching-hexagram", vi: h.nameVi, vi_alt: [TEN_QUE[h.number][0]], zh: h.nameZh, han: h.nameHan, pinyin: h.pinyin, en: h.nameEn,
        code: String(h.number),
        definition_en: `Hexagram ${h.number} ${h.symbol}: ${h.upper.name} (${h.upper.image}) over ${h.lower.name} (${h.lower.image}); palace ${h.palace.name}, ${h.palace.generationName.toLowerCase()}.`,
        definition_vi: `Quẻ ${h.number} ${h.symbol}: ${v.upper.name} (${v.upper.image}) trên ${v.lower.name} (${v.lower.image}); cung ${v.palace.name}, ${v.palace.generationName.toLowerCase()}.`,
        definition_zh: `第${h.number}卦${h.symbol}，上${z.upper.name}${z.upper.image}下${z.lower.name}${z.lower.image}，属${z.palace.name}宫${z.palace.generationName}。`,
        iztro: false,
        note: `Lines bottom first ${h.binary} (1 yang). vi_alt is the short Vietnamese name, without the two images.`,
        source: SRC_YI + " (TEN_QUE)",
      });
    });
  }
  VI_TRI_CUNG.forEach(([vi, en, zh], i) => {
    b.add({
      category: "iching-palace-generation", vi, zh, en, code: String(i), iztro: false,
      note: `World line ${[6, 1, 2, 3, 4, 5, 4, 3][i]}; the response line is three lines away.`,
      source: "iching/src/data.ts (VI_TRI_CUNG, THE_THEO_VI_TRI)",
    });
  });
  Object.entries(LUC_THAN).forEach(([vi, [en, zh]]) => {
    b.add({
      category: "iching-six-relation", vi, zh, en, code: YI.RELATION_CODES[vi], iztro: false,
      note: "Relation of the line element to the palace element (relationCode in every lang).",
      source: "iching/src/data.ts (LUC_THAN), en.ts (RELATION_CODES)",
    });
  });
  LUC_THU.forEach(([vi, en, zh], i) => {
    b.add({
      category: "iching-six-spirit", vi, zh, en, code: String(i), iztro: false,
      note: "Spirit of the bottom line by the day stem (KHOI_LUC_THU), then upward in this order; spiritIndex in every lang.",
      source: "iching/src/data.ts (LUC_THU)",
    });
  });
  Object.entries(TRANG_THAI).forEach(([vi, [en, zh]]) => {
    b.add({
      category: "iching-month-state", vi, zh, en, code: YI.MONTH_STATE_CODES[vi], iztro: false,
      note: "The English name is also the code (monthStateCode).",
      source: "iching/src/data.ts (TRANG_THAI), en.ts (MONTH_STATE_CODES)",
    });
  });
  VAI_TRO_QUAI_KHI.forEach(([vi, en, zh], i) => {
    b.add({
      category: "iching-gua-qi-role", vi, zh, en, code: String(i), iztro: false,
      note: "The five hexagrams of a solar month take these ranks in turn (dailyHexagram role).",
      source: "iching/src/data.ts (VAI_TRO_QUAI_KHI)",
    });
  });

  // ---- Phong thuỷ: tên đọc từ lớp tiếng Anh của gói fengshui.
  {
    const dirs = ba((lang) => FS.eightDirections(1, { lang }));
    const byStar = (ds) => Object.fromEntries(ds.map((d) => [d.star, d]));
    const vi = byStar(dirs.vi);
    const zh = byStar(dirs.zh);
    ["sheng-qi", "tian-yi", "yan-nian", "fu-wei", "huo-hai", "liu-sha", "wu-gui", "jue-ming"].forEach((id) => {
      const d = byStar(dirs.en)[id];
      b.add({
        category: "fengshui-eight-mansions-star", vi: vi[id].starName, zh: zh[id].starName, en: d.starName,
        alt: [[d.gloss, "gloss: a literal translation of the characters"]],
        code: id, iztro: false,
        note: (d.favorable ? "Favorable." : "Unfavorable.") + " The English name is pinyin: the stars have no fixed English translation.",
        source: "fengshui/src/en.ts (eightDirections, STAR_GLOSS)",
      });
    });
  }
  for (const [kua, id] of [[1, "east"], [2, "west"]]) {
    const g = ba((lang) => FS.lifeGua(1990, kua === 1 ? "male" : "female", { lang }));
    if (g.en.group !== id) throw new Error("group of the 1990 gua changed: " + g.en.group);
    b.add({
      category: "fengshui-group", vi: g.vi.groupName, zh: g.zh.groupName, en: g.en.groupName, code: id, iztro: false,
      note: id === "east" ? "Kua numbers 1, 3, 4, 9 (Kan, Zhen, Xun, Li)." : "Kua numbers 2, 6, 7, 8 (Kun, Qian, Dui, Gen).",
      source: "fengshui/src/en.ts (lifeGua groupName)",
    });
  }
  {
    const m = ba((lang) => FS.mountains24({ lang }));
    m.en.forEach((x, i) => {
      b.add({
        category: "fengshui-mountain", vi: m.vi[i].name, zh: m.zh[i].name, en: x.name, code: x.id, iztro: false,
        definition_en: `${x.from}° to ${x.to}°, centered on ${x.center}°; ${x.kind}, in the ${x.trigramName} trigram (${x.directionName.toLowerCase()}).`,
        definition_vi: `Từ ${x.from}° tới ${x.to}°, giữa ${x.center}°; thuộc quái ${m.vi[i].trigramName} (${m.vi[i].directionName}).`,
        definition_zh: `${x.from}°至${x.to}°，正中${x.center}°，属${m.zh[i].trigramName}卦（${m.zh[i].directionName}）。`,
        note: `Three Cycles dragon: ${x.dragon}; Xuan Kong polarity: ${x.xuanKongPolarity} (other schools differ).`,
        source: "fengshui/src/en.ts (mountains24)",
      });
    });
  }
  {
    const s9 = ba((lang) => FS.nineStars({ lang }));
    s9.en.forEach((x, i) => {
      b.add({
        category: "fengshui-nine-star", vi: s9.vi[i].name, zh: s9.zh[i].name, en: x.name, code: String(x.number), iztro: false,
        note: `Element ${x.element}.`,
        source: "fengshui/src/en.ts (nineStars)",
      });
    });
  }
  {
    // Năm vai của sao trong vận 9: sao 9 vượng, 1 và 2 sinh, 8 thoái, 3 tới 7 sát hay tử.
    const seen = new Set();
    for (const star of [9, 1, 8, 5, 3]) {
      const q = ba((lang) => FS.starQi(9, star, { lang }));
      if (seen.has(q.en.qi)) continue;
      seen.add(q.en.qi);
      b.add({
        category: "fengshui-star-qi", vi: q.vi.name, zh: q.zh.name, en: q.en.name, code: q.en.qi, iztro: false,
        note: "Prosperous: the period star; growing: the next two; retreating: the last one; then killing and dead (starQi). Some books count one growing star.",
        source: "fengshui/src/en.ts (starQi)",
      });
    }
    if (seen.size !== 5) throw new Error("expected five star roles, got " + [...seen].join(", "));
  }
  {
    const found = new Map();
    for (let period = 1; period <= 9; period++) {
      for (const m of FS.mountains24()) {
        const c = ba((lang) => FS.flyingStarChart({ period, sitting: m.id }, { lang }));
        if (c.en.pattern && !found.has(c.en.pattern)) found.set(c.en.pattern, c);
      }
    }
    for (const id of ["prosperous-sitting-facing", "reversed", "double-facing", "double-sitting"]) {
      const c = found.get(id);
      if (!c) throw new Error("pattern never met: " + id);
      b.add({
        category: "fengshui-flying-star-pattern", vi: c.vi.patternName, zh: c.zh.patternName, en: c.en.patternName, code: id, iztro: false,
        note: "Read from where the period star lands among the mountain and facing stars (flyingStarChart pattern).",
        source: "fengshui/src/en.ts (flyingStarChart)",
      });
    }
  }
  {
    const r = ba((lang) => FS.lubanRulers({ lang }));
    const rows = new Map();
    r.en.forEach((ruler, i) => {
      ruler.sectors.forEach((x, k) => {
        const key = x.han;
        if (!rows.has(key)) rows.set(key, { en: x, vi: r.vi[i].sectors[k], zh: r.zh[i].sectors[k], rulers: [] });
        rows.get(key).rulers.push(`${ruler.name} (${x.auspicious ? "good" : "bad"})`);
      });
    });
    for (const x of rows.values()) {
      b.add({
        category: "fengshui-luban-sector", vi: x.vi.name, zh: x.zh.name, han: x.en.han, en: x.en.name, iztro: false,
        note: `On the ${x.rulers.join(", ")}.`,
        source: "fengshui/src/thuoc-lo-ban.ts (BANG_THUOC via lubanRulers)",
      });
    }
    // Cung nhỏ: mỗi chữ Hán một dòng (Tấn bửu và Tiến bảo cùng chữ 进宝: một dòng, tên kia ở vi_alt).
    // Pinyin có dấu ghép từng chữ theo han-readings.json, rồi soát với pinyin
    // không dấu của thư viện; chữ đa âm đọc khác bảng chữ thì đổi theo DA_AM.
    const DA_AM = { "长:zhang": "zhǎng" };
    const bo = (p) => p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ü/g, "v");
    const subs = new Map();
    r.en.forEach((ruler, i) => {
      ruler.sectors.forEach((x, k) => {
        x.subSectors.forEach((y, j) => {
          if (!subs.has(y.nameZh)) subs.set(y.nameZh, { en: y, vi: r.vi[i].sectors[k].subSectors[j], zh: r.zh[i].sectors[k].subSectors[j], at: [] });
          subs.get(y.nameZh).at.push(`${x.pinyin} (${x.auspicious ? "good" : "bad"}) on the ${ruler.name}`);
        });
      });
    });
    for (const x of subs.values()) {
      const chars = [...x.en.nameZh];
      const lib = x.en.pinyin.toLowerCase().split(" ");
      let han = "";
      const py = [];
      chars.forEach((c, i) => {
        const doc = CHARS[c];
        if (!doc) {
          b.missing.add(c);
          return;
        }
        han += doc[0];
        const am = bo(doc[1]) === lib[i] ? doc[1] : DA_AM[`${c}:${lib[i]}`];
        if (!am) throw new Error(`pinyin of ${c} in ${x.en.nameZh}: library ${lib[i]}, han-readings.json ${doc[1]}`);
        py.push(am);
      });
      b.add({
        category: "fengshui-luban-sub-sector", vi: x.vi.name, zh: x.zh.name, han, pinyin: py.join(" "), en: x.en.name,
        alt: [[x.en.nameEn, "gloss: a literal translation of the characters"]], iztro: false,
        note: `In sector ${x.at.join("; ")}. The English name is pinyin; the gloss is the field nameEn.`,
        source: "fengshui/src/thuoc-lo-ban.ts (TEN_CUNG_NHO via lubanRulers)",
      });
    }
  }

  return b;
}

/** Mã nhóm, phạm vi lễ hội sang slug tiếng Anh theo bảng của gói (để soát MA_LE). */
function festivalSlugs() {
  const src = readFileSync(path.join(ROOT, "js/packages/le-hoi/src/en.ts"), "utf8");
  const out = {};
  for (const name of ["FESTIVAL_GROUP_EN", "FESTIVAL_SCOPE_EN"]) {
    const k = new RegExp(name + "[^=]*=\\s*\\{([^}]*)\\}").exec(src);
    if (!k) throw new Error("cannot read " + name);
    for (const m of k[1].matchAll(/"?([\w-]*)"?\s*:\s*"([^"]*)"/g)) if (m[1]) out[m[1]] = m[2];
  }
  return out;
}

/** Đọc tên cách cục (Việt, giản thể, phồn thể) từ mã nguồn cach-cuc.ts và cach-cuc-toan-thu.ts. */
export function readPatterns() {
  const out = [];
  const add = (vi, zh, han, quanShu) => {
    if (!out.some((x) => x.vi === vi)) out.push({ vi, zh, han, quanShu });
  };
  const a = readFileSync(path.join(ROOT, "js/packages/tu-vi/src/cach-cuc.ts"), "utf8");
  for (const m of a.matchAll(/ten: "([^"]+)", zh: "([^"]+)", han: "([^"]+)"/g)) add(m[1], m[2], m[3], false);
  for (const m of a.matchAll(/cachCucBa\("([^"]+)", "([^"]+)", "([^"]+)"/g)) add(m[1], m[2], m[3], false);
  const c = readFileSync(path.join(ROOT, "js/packages/tu-vi/src/cach-cuc-toan-thu.ts"), "utf8");
  for (const m of c.matchAll(/them\(NHOM_\w+, "([^"]+)", "([^"]+)", "([^"]+)"/g)) add(m[1], m[2], m[3], true);
  const missing = Object.keys(TV.PATTERN_EN).filter((k) => !out.some((x) => x.vi === k));
  const extra = out.filter((x) => !TV.PATTERN_EN[x.vi]).map((x) => x.vi);
  if (missing.length || extra.length) throw new Error(`patterns differ from PATTERN_EN: missing ${missing.join(", ")}; extra ${extra.join(", ")}`);
  return out;
}

// ---------------------------------------------------------------- xuất

function csvField(s) {
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCsv(rows) {
  return [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => csvField(r[c])).join(","))].join("\n") + "\n";
}

export function countByCategory(rows) {
  const counts = {};
  for (const k of Object.keys(CATEGORIES)) counts[k] = 0;
  for (const r of rows) counts[r.category] = (counts[r.category] ?? 0) + 1;
  return counts;
}

export function toJson(rows) {
  const counts = countByCategory(rows);
  return JSON.stringify(
    {
      name: "nhatnguyet/terminology",
      title: "Nhat Nguyet terminology: Vietnamese, Chinese and English names of calendar, Zi Wei Dou Shu, BaZi, numerology, I Ching and feng shui terms",
      license: "CC-BY-4.0",
      attribution: "Data: Nhat Nguyet (nhatnguyet.org)",
      generator: "du-lieu/terminology/generate.mjs",
      columns: COLUMNS,
      count: rows.length,
      categories: Object.fromEntries(Object.entries(CATEGORIES).map(([k, mo]) => [k, { description: mo, count: counts[k] }])),
      terms: rows,
    },
    null,
    2,
  ) + "\n";
}

export function countTable(rows) {
  const counts = countByCategory(rows);
  const lines = ["| Category | Terms | What it holds |", "|---|---:|---|"];
  for (const [k, mo] of Object.entries(CATEGORIES)) lines.push(`| \`${k}\` | ${counts[k]} | ${mo} |`);
  lines.push(`| **Total** | **${rows.length}** | |`);
  return lines.join("\n");
}

const MARK_START = "<!-- counts:start (generated by generate.mjs) -->";
const MARK_END = "<!-- counts:end -->";

export function updateReadme(old, rows) {
  const i = old.indexOf(MARK_START);
  const j = old.indexOf(MARK_END);
  if (i < 0 || j < 0) throw new Error("README lacks the count markers");
  return old.slice(0, i + MARK_START.length) + "\n" + countTable(rows) + "\n" + old.slice(j);
}

/** Các tệp sinh: đường dẫn sang nội dung. */
export function generate() {
  const b = buildGlossary();
  if (b.missing.size) {
    throw new Error(`han-readings.json lacks ${b.missing.size} characters: ${[...b.missing].join(" ")}. Add their traditional form and tone-marked pinyin by hand.`);
  }
  const ids = new Set();
  for (const r of b.rows) {
    if (ids.has(r.id)) throw new Error("duplicate id " + r.id);
    ids.add(r.id);
    if (!r.vi || !r.en) throw new Error("missing vi or en: " + r.id);
    for (const c of COLUMNS) if (/[\u2014]/.test(r[c])) throw new Error("em dash in " + r.id);
  }
  const readme = readFileSync(path.join(HERE, "README.md"), "utf8");
  return {
    rows: b.rows,
    files: {
      "terminology.csv": toCsv(b.rows),
      "terminology.json": toJson(b.rows),
      "README.md": updateReadme(readme, b.rows),
    },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  {
    const { rows, files } = generate();
    const checkOnly = process.argv.includes("--check");
    let stale = 0;
    for (const [name, content] of Object.entries(files)) {
      const p = path.join(HERE, name);
      let old = "";
      try {
        old = readFileSync(p, "utf8");
      } catch {}
      if (old === content) continue;
      if (checkOnly) {
        console.error(`stale: ${name}`);
        stale++;
      } else writeFileSync(p, content);
    }
    if (checkOnly && stale) {
      console.error("Run: node --conditions=source du-lieu/terminology/generate.mjs");
      process.exit(1);
    }
    console.log(`${rows.length} terms, ${Object.keys(CATEGORIES).length} categories` + (checkOnly ? ": up to date" : ": written"));
  }
}
