/**
 * Zi Wei Dou Shu (Purple Star Astrology, Tử Vi): the twelve palaces and their
 * stars, ten-year and yearly periods, yearly stars, chart patterns, SVG and
 * text output.
 *
 * ```bash
 * npm i @nhatnguyet/tu-vi       # or the English-named alias @nhatnguyet/ziwei
 * ```
 *
 * This page lists the English API. The original Vietnamese-named functions
 * (`lapLaSoTuVi`, `daiVan`, `tinhHanNam`...) and the iztro-compatible entry
 * point `@nhatnguyet/tu-vi/iztro` are described in the
 * [package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/tu-vi#readme)
 * and in [Migrating from iztro](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/blob/main/docs/chuyen-tu-iztro.md).
 *
 * @packageDocumentation
 * @module @nhatnguyet/tu-vi
 */
export * from "../packages/tu-vi/src/en.ts";
// castZiWei của chuc-nang.ts (lá số có hàm horoscope, palace...) che bản của en.ts, như index.ts.
export { castZiWei, withZiWeiMethods, horoscope, palaceOf, starOf, surroundingPalaces, flankingPalaces, palaceHas, palaceHasOneOf, palaceNotHave, palaceIsEmpty, flyingTransformations, fliesTo, selfTransformed, type FunctionalZiWeiChart, type ZiWeiHoroscope, type HoroscopeScope, type ZiWeiTransformation, type FlyingTransformation, type SurroundingPalaces, type FlankingPalaces, type PalaceRef, type TransformationName, type LookupOptions } from "../packages/tu-vi/src/chuc-nang.ts";
export * from "../packages/tu-vi/src/van-ban.ts";
