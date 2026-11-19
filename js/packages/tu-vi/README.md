# @nhatnguyet/tu-vi

> **English:** Zi Wei Dou Shu (Tử Vi, Purple Star Astrology) chart: 12 palaces, main and minor stars, brightness, Four Transformations, decade luck, yearly luck, patterns. By Nhat Nguyet ([nhatnguyet.org](https://nhatnguyet.org)). Full docs in English and Chinese: [github.com/Nhat-Nguyet/nhatnguyet](https://github.com/Nhat-Nguyet/nhatnguyet/blob/main/README.en.md).

Lá số Tử Vi Đẩu Số: cục, cung Mệnh, cung Thân, an 14 chính tinh và phụ tinh,
sáng tối, Tứ Hóa, Tuần Triệt, ba vòng Tràng Sinh, Thái Tuế, Bác Sỹ; đại vận,
hạn năm (lưu niên, tiểu vận, lưu tứ hóa, nguyệt hạn), sao lưu, cách cục. Đây
là bản TypeScript của lõi tính mà [Nhật Nguyệt](https://nhatnguyet.org) dùng
trên site và app; mọi kết quả được kiểm bằng bộ ca kiểm do bản Go sinh ra
(777 lá số, 1900 tới 2100). Phụ thuộc duy nhất là `@nhatnguyet/am-lich`.

## Cách gọi

```ts
import { lapLaSoTuVi, daiVan, tinhHanNam, tinhSaoLuu, nhanDienCachCuc } from "@nhatnguyet/tu-vi";

// Giờ sinh là chỉ số chi: 0 Tý (23h tới 1h), 1 Sửu... 11 Hợi.
const laSo = lapLaSoTuVi("", "Nữ", 17, 2, 1990, 6);
laSo.tenCuc;              // tên cục, ví dụ "Thủy Nhị Cục"
laSo.cung[laSo.cungMenh]; // cung Mệnh kèm các sao
daiVan(laSo);             // 12 chặng đại vận theo tuổi mụ
tinhHanNam(laSo, 2026);   // lưu niên, tiểu vận, lưu tứ hóa, nguyệt hạn
tinhSaoLuu(laSo, 2026);   // Lưu Thái Tuế, Lộc Tồn, Kình Dương, Đà La, Thiên Mã
nhanDienCachCuc(laSo);    // cách cục, kèm chú văn của Tử Vi Đẩu Số toàn thư
```

Giới tính phải là `"Nam"` hoặc `"Nữ"`; đầu vào sai thì hàm ném `Error`.

## Quy ước

- Ngày âm lấy theo đúng ngày dương đã nhập, giờ Việt Nam UTC+7, kể cả khi sinh
  từ 23h tới 0h (có sách tính sang ngày hôm sau).
- An sao theo lối phổ biến ở Việt Nam (Tử Vi Đẩu Số Tân Biên). Tứ Hóa can
  Canh dùng Thiên Đồng hóa Khoa, Thái Âm hóa Kỵ; can Tân, Nhâm có dị bản.
- Tiểu vận khởi theo nhóm tam hợp của chi năm sinh, nam thuận, nữ nghịch.
  Nguyệt hạn theo lưu Đẩu Quân. Đại vận khởi ở cung Mệnh từ tuổi mụ bằng số cục.
- Chưa an: Hỏa Tinh, Linh Tinh, Hồng Loan, Thiên Hình, Lưu Văn Xương, Lưu Văn Khúc.
- Gói trả phần tính và tên ba thứ tiếng; lời luận từng sao chưa có.

## Ghi công

Mã viết lại theo lõi Go của Nhật Nguyệt. Lịch âm từ `@nhatnguyet/am-lich`.

Giấy phép MIT.
