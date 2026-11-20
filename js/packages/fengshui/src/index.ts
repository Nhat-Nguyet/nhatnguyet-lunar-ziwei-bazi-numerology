// @nhatnguyet/fengshui: quy tắc phong thuỷ của các phái truyền thống (Bát Trạch,
// 24 sơn, Huyền Không phi tinh, thước Lỗ Ban). Bản chuyển ngữ TypeScript của
// lõi tính Go của Nhật Nguyệt (nhatnguyet.org); kết quả kiểm bằng bộ ca kiểm
// ca-kiem/fengshui.json do bản Go sinh ra. Lớp lõi (core.ts) không xuất ra đây:
// API công khai là lớp tiếng Anh.
//
// Feng shui rules of traditional schools, not verified effects.

export {
  DIRECTIONS, LO_SHU_GRID, STAR_GLOSS, annualStars, eightDirections, findMountain, flyingStarChart, houseGua, lifeGua,
  lubanRuler, lubanRulers, mountainAt, mountains24, nineStars, periodOf, periods, starQi, trigramOf,
} from "./en.ts";
export type {
  AnnualPalace, AnnualStars, CastleGate, DateInput, DirectionId, DirectionStar, FlyingStarChart, FlyingStarInput,
  FlyingStarPalace, Gender, Group, HouseGua, Lang, LifeGua, LubanOptions, LubanResult, LubanRulerInfo, LubanSector,
  LubanSubSector, Mountain, MountainKind, NameOptions, NineStar, Orientation, PatternId, Period, QiId, RulerId, StarId,
  Terms, Trigram, TrigramId,
} from "./en.ts";
export { renderCompassSvg, renderFlyingStarSvg } from "./svg.ts";
export type { CompassSvgOptions, SvgOptions } from "./svg.ts";

/** Version of the Go engine this package is ported from. */
export const ENGINE_VERSION = "2.3.0";
