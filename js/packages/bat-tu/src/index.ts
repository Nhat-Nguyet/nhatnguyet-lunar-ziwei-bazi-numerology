// @nhatnguyet/bat-tu: lá số Bát Tự (Tứ Trụ) với bốn trụ theo tiết khí, tàng
// can, thập thần, trường sinh, thần sát, thai nguyên, mệnh cung, đại vận và
// tiểu vận. Bản chuyển ngữ TypeScript của lõi tính Go của Nhật Nguyệt
// (nhatnguyet.org); kết quả kiểm bằng bộ ca kiểm do bản Go sinh ra. Lịch âm,
// can chi, tiết khí, nạp âm lấy từ @nhatnguyet/am-lich.

export * from "./la-so.ts";
export * from "./tieu-van.ts";
export * from "./thap-than.ts";
export * from "./tang-can.ts";
export * from "./than-sat.ts";
export * from "./ve-svg.ts";
// Lớp API tiếng Anh (tham số đặt tên, giờ đồng hồ, kết quả theo lang).
export * from "./en.ts";
export * from "./van-ban.ts";

/** Phiên bản động cơ tính của bản Go mà gói này chuyển ngữ theo. */
export const PHIEN_BAN_DONG_CO = "2.2.0";
