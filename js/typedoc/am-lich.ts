/**
 * Vietnamese, Chinese, Korean and Japanese lunisolar calendars: Gregorian to
 * lunar and back, the sexagenary cycle (can chi), the 24 solar terms to the
 * minute, hour branches, auspicious hours.
 *
 * ```bash
 * npm i @nhatnguyet/am-lich     # or the English-named alias @nhatnguyet/lunar
 * ```
 *
 * This page lists the English API. The package also exports the original
 * functions with positional arguments and Vietnamese names (`solarToLunar`,
 * `lunarToSolar`, `yearCanChi`...), described in the
 * [package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/am-lich#original-api).
 *
 * @packageDocumentation
 * @module @nhatnguyet/am-lich
 */
export * from "../packages/am-lich/src/en.ts";
export { AUSPICIOUS_SPIRITS, HOUR_SPIRIT_PINYIN, auspiciousHours } from "../packages/am-lich/src/gio-hoang-dao.ts";
export type { AuspiciousHour, AuspiciousHoursResult } from "../packages/am-lich/src/gio-hoang-dao.ts";
