// @nhatnguyet/tu-vi: lá số Tử Vi Đẩu Số (cục, cung Mệnh, Thân, an sao, sáng
// tối, Tứ Hóa, Tuần Triệt), đại vận, hạn năm, sao lưu, cách cục. Bản chuyển
// ngữ TypeScript của lõi tính Go của Nhật Nguyệt (nhatnguyet.org); kết quả
// kiểm bằng bộ ca kiểm do bản Go sinh ra.

export * from "./kieu.ts";
export * from "./du-lieu.ts";
export * from "./lap-so.ts";
export * from "./sao-phu.ts";
export * from "./sao-phu-them.ts";
export * from "./schools.ts";
export * from "./la-so.ts";
export * from "./tra-cuu.ts";
export * from "./chieu-sau.ts";
export * from "./luu-nien.ts";
export * from "./luu-sao.ts";
export * from "./cach-cuc.ts";
export {
  NHOM_DINH_PHU, NHOM_DINH_QUY, NHOM_DINH_BAN_TIEN, cachCucBa, cachCucToanThu,
} from "./cach-cuc-toan-thu.ts";
// Lớp API tiếng Anh (tham số đặt tên, giờ đồng hồ, kết quả theo lang).
export * from "./en.ts";
export { PATTERN_EN, PATTERN_HAN_FIX, STAR_EN_FIX, starEn } from "./ten-en.ts";
export { castZiWei, withZiWeiMethods, horoscope, palaceOf, starOf, surroundingPalaces, flankingPalaces, palaceHas, palaceHasOneOf, palaceNotHave, palaceIsEmpty, flyingTransformations, fliesTo, selfTransformed, type FunctionalZiWeiChart, type ZiWeiHoroscope, type HoroscopeScope, type ZiWeiTransformation, type FlyingTransformation, type SurroundingPalaces, type FlankingPalaces, type PalaceRef, type TransformationName, type LookupOptions } from "./chuc-nang.ts";
export * from "./ve-svg.ts";
export * from "./van-ban.ts";

/** Phiên bản động cơ tính của bản Go mà gói này chuyển ngữ theo. */
export const PHIEN_BAN_DONG_CO = "2.2.0";
