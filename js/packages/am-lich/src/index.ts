// @nhatnguyet/am-lich: lịch âm Việt Nam, can chi, tiết khí, Nhị Thập Bát Tú,
// ngũ hành và nạp âm. Bản chuyển ngữ TypeScript của lõi tính Go của Nhật
// Nguyệt (nhatnguyet.org); kết quả kiểm bằng bộ ca kiểm do bản Go sinh ra.

export * from "./lich.ts";
export * from "./can-chi.ts";
export * from "./tiet-khi.ts";
export * from "./nhi-thap-bat-tu.ts";
export * from "./ngu-hanh.ts";

/** Phiên bản động cơ tính của bản Go mà gói này chuyển ngữ theo. */
export const PHIEN_BAN_DONG_CO = "2.0.0";
