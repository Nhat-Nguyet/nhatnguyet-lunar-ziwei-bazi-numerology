# @nhatnguyet/am-lich

> **English:** Vietnamese lunar calendar (also Chinese, Korean, Japanese), sexagenary cycle, 24 solar terms to the minute, 28 lunar mansions; checked against NASA and IMCCE. By Nhat Nguyet ([nhatnguyet.org](https://nhatnguyet.org)). Full docs in English and Chinese: [github.com/Nhat-Nguyet/nhatnguyet](https://github.com/Nhat-Nguyet/nhatnguyet/blob/main/README.en.md).

Lịch âm Việt Nam, can chi, 24 tiết khí, Nhị Thập Bát Tú, ngũ hành và nạp âm.
Đây là bản TypeScript của lõi tính mà [Nhật Nguyệt](https://nhatnguyet.org)
dùng trên site và app; mọi kết quả được kiểm bằng bộ ca kiểm do bản Go sinh
ra (8.960 ca cho khoảng 1900 tới 2100). Không phụ thuộc gói nào, chạy được ở
trình duyệt và Node.

## Cách gọi

```ts
import {
  solarToLunar, lunarToSolar, dayCanChi, lunarMonthCanChi, yearCanChi,
  tietKhiCuaNgay, mocTietKhiTrongNam, saoCuaNgay, nguHanhNapAm,
} from "@nhatnguyet/am-lich";

const am = solarToLunar(17, 2, 2026);        // { day: 1, month: 1, year: 2026, leap: false }
yearCanChi(am.year).label;                   // "Bính Ngọ"
lunarMonthCanChi(am.month, am.year).label;   // "Canh Dần"
dayCanChi(17, 2, 2026).label;                // can chi của ngày
lunarToSolar(1, 1, 2026, false);             // { duong: { day: 17, month: 2, year: 2026 }, hopLe: true }
tietKhiCuaNgay(19, 11, 2026).ten;            // "Lập Đông"
mocTietKhiTrongNam(2026)[0];                 // Tiểu Hàn 2026, kèm ngày, giờ, phút giờ Việt Nam
saoCuaNgay(21, 9, 2026).ten;                 // "Tâm"
nguHanhNapAm(0, 0).ten;                      // "Hải Trung Kim" (Giáp Tý)
```

## Quy ước

- Lịch tính theo giờ Việt Nam UTC+7 cho mọi năm (tham số `timeZone` đổi được).
- Năm can chi là năm ÂM LỊCH: ngày trước Tết thuộc năm âm trước.
- Can chi tháng là của tháng âm lịch (tháng Giêng là Dần, can theo Ngũ Hổ
  Độn); tháng nhuận mang can chi của tháng chính cùng số. Trụ tháng Bát Tự
  đổi theo tiết khí, không theo hàm này.
- Tiết khí của ngày xét lúc 12h trưa giờ Việt Nam. Mốc tiết khí dò tới phút
  theo kinh độ biểu kiến của Mặt Trời.
- Chỉ số can 0 là Giáp, chỉ số chi 0 là Tý.

## Ghi công

Công thức thiên văn theo Jean Meeus, "Astronomical Algorithms". Quy tắc dựng
tháng là quy tắc chung của lịch âm dương truyền thống (lịch Thời Hiến), áp ở
giờ Việt Nam UTC+7. Mã viết lại theo lõi Go của Nhật Nguyệt.

Giấy phép MIT.
