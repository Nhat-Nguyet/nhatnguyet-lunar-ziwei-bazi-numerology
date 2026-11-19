/**
 * The text renderers behind the `nhatnguyet` command line: Zi Wei grid, BaZi,
 * lunar date, solar terms, numerology and festival tables, with terminal width
 * handling for CJK text. Command reference: the
 * [package README](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/tree/main/js/packages/cli#readme).
 *
 * ```bash
 * npx @nhatnguyet/cli ziwei 1990-09-19 20:00 male
 * ```
 *
 * @packageDocumentation
 * @module @nhatnguyet/cli
 */
export * from "../packages/cli/src/render.ts";
