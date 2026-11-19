# @nhatnguyet/le-hoi

> **English:** Vietnamese festival calendar in three languages (200 festivals) with lunar-to-solar dates for any year. By Nhat Nguyet ([nhatnguyet.org](https://nhatnguyet.org)). Full docs in English and Chinese: [github.com/Nhat-Nguyet/nhatnguyet](https://github.com/Nhat-Nguyet/nhatnguyet/blob/main/README.md).

Lịch lễ hội Việt Nam ba thứ tiếng (200 lễ: Tết, giỗ Tổ, lễ hội đình chùa, lễ của
các dân tộc, lễ theo lịch công bố từng năm) và phép quy đổi ngày âm sang ngày
dương của từng năm, theo giờ Việt Nam.

```ts
import { leHoiTrongNam, leHoiTheoNgay, ngayDuongCuaLe, DANH_SACH_LE_HOI } from "@nhatnguyet/le-hoi";

leHoiTrongNam(2027);          // [{ id: "tet-nguyen-dan", ngay: "2027-02-06" }, ...]
leHoiTheoNgay(17, 2, 2026);   // các lễ rơi vào 17/2/2026
```

Lễ âm lịch đặt vào tháng chính, không tháng nhuận. Năm nào tháng âm chỉ có 29
ngày thì lễ ngày 30 của tháng ấy không có ngày dương. Lễ do ban tổ chức công bố
từng năm không tính được: xem cột `lich_cong_bo`.

Dữ liệu là bộ mở `le-hoi-viet-nam` của Nhật Nguyệt, giấy phép CC BY 4.0, mô tả
cột ở https://nhatnguyet.org/du-lieu. Mã giấy phép MIT.
