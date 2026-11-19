// @nhatnguyet/widgets: thành phần web lịch âm Việt Nam chạy tại chỗ.
//
//   <script type="module" src="https://cdn.jsdelivr.net/npm/@nhatnguyet/widgets/dist/nn-widgets.js"></script>
//   <nn-lich-hom-nay lang="en" theme="auto"></nn-lich-hom-nay>
//
// Nhập gói là đăng ký năm thẻ (nếu trình duyệt có customElements và thẻ chưa
// có ai đăng ký). Phần tính thuần ở "@nhatnguyet/widgets/tinh".

import { NnDemNguocTet, NnDoiLich, NnGioHoangDao, NnLichHomNay, NnLichThang } from "./thanh-phan.ts";

export { NnDemNguocTet, NnDoiLich, NnGioHoangDao, NnLichHomNay, NnLichThang } from "./thanh-phan.ts";
export { NnWidget } from "./giao-dien.ts";
export * from "./tinh.ts";

/** Tên thẻ và lớp của năm thành phần. */
export const THANH_PHAN: Readonly<Record<string, CustomElementConstructor>> = {
  "nn-lich-hom-nay": NnLichHomNay,
  "nn-lich-thang": NnLichThang,
  "nn-gio-hoang-dao": NnGioHoangDao,
  "nn-dem-nguoc-tet": NnDemNguocTet,
  "nn-doi-lich": NnDoiLich,
};

/** Đăng ký năm thẻ; gọi lại nhiều lần không sao. */
export function dangKy(): void {
  if (typeof customElements === "undefined") return;
  for (const [ten, lop] of Object.entries(THANH_PHAN)) {
    if (!customElements.get(ten)) customElements.define(ten, lop);
  }
}

dangKy();
