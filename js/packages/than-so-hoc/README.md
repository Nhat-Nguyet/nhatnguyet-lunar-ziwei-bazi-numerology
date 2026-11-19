# @nhatnguyet/than-so-hoc

> **English:** Pythagorean numerology for Vietnamese names: life path, expression, soul urge, personality, pinnacles, challenges, personal year. By Nhat Nguyet ([nhatnguyet.org](https://nhatnguyet.org)). Full docs in English and Chinese: [github.com/Nhat-Nguyet/nhatnguyet](https://github.com/Nhat-Nguyet/nhatnguyet/blob/main/README.en.md).

Các chỉ số thần số học theo bảng Pythagoras cho tên tiếng Việt (bỏ dấu, đ
thành d). Đây là bản TypeScript của phần tính số trong lõi tính của
[Nhật Nguyệt](https://nhatnguyet.org), kiểm bằng bộ ca kiểm do bản Go sinh
ra. Không phụ thuộc gói nào.

## Cách gọi

```ts
import { tinhHoSoThanSoHocSau, soDuongDoi, soSuMenh } from "@nhatnguyet/than-so-hoc";

// họ tên, ngày, tháng, năm sinh, rồi năm, tháng, ngày đang xem
const h = tinhHoSoThanSoHocSau("Nguyễn Văn An", 1, 10, 1960, 2026, 1, 1);
h.soDuongDoi;      // 9
h.soSuMenh;        // 3
h.soNamCaNhan;     // 3 (năm 2026)
h.soThangCaNhan;   // 4 (tháng 1/2026)
h.soNgayCaNhan;    // 5 (ngày 1/1/2026)
h.luoiPythago;     // { "1": 3, "2": 0, ..., "9": 1 }
h.soDinhCao;       // { dinh1, dinh2, dinh3, dinh4, tuoiKetThucDinh1, ... }

soDuongDoi(1, 10, 1960); // 9
```

Hàm không đọc đồng hồ máy: tháng và ngày cá nhân tính theo ngày đang xem
truyền vào.

## Quy ước

- Số Đường Đời cộng mọi chữ số của ngày, tháng, năm rồi rút gọn, giữ số chủ
  11, 22, 33. Đây là quy ước đại chúng hiện đại; sách của Balliett (1917)
  rút gọn riêng từng phần trước khi cộng nên có thể ra số khác.
- Số Linh Hồn chỉ tính nguyên âm a, e, i, o, u; chữ y tính là phụ âm.
- Năm, tháng, ngày cá nhân và Số Thách Thức không giữ số chủ.
- Thần số học là một hệ quy ước, chưa được kiểm chứng khoa học.

Giấy phép MIT.
