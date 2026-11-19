// Chỗ DUY NHẤT gói tu-vi nhập @nhatnguyet/am-lich.
//
// Trong kho, gói nhập thẳng mã nguồn của am-lich bằng đường tương đối để
// `node --test` chạy được mà không cần `npm install` (chưa có node_modules
// nên tên gói chưa phân giải được). Trước khi dựng bản phát hành lên npm,
// đổi dòng dưới thành:
//
//   export { mod, solarToLunar, nguHanhNapAm, THIEN_CAN, DIA_CHI } from "@nhatnguyet/am-lich";
//   export type { LunarDate } from "@nhatnguyet/am-lich";

export { mod, solarToLunar, nguHanhNapAm, THIEN_CAN, DIA_CHI } from "@nhatnguyet/am-lich";
export type { LunarDate } from "@nhatnguyet/am-lich";
