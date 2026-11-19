# @nhatnguyet/bat-tu

> **English:** BaZi (Four Pillars of Destiny) chart: pillars by solar terms, hidden stems, Ten Gods, life stages, symbolic stars, luck pillars. By Nhat Nguyet ([nhatnguyet.org](https://nhatnguyet.org)). Full docs in English and Chinese: [github.com/Nhat-Nguyet/nhatnguyet](https://github.com/Nhat-Nguyet/nhatnguyet/blob/main/README.en.md).

Lá số Bát Tự (Tứ Trụ): bốn trụ theo tiết khí, tàng can, thập thần, vòng
trường sinh, chín thần sát, thai nguyên, mệnh cung, đại vận và tiểu vận. Đây
là bản TypeScript của lõi tính mà [Nhật Nguyệt](https://nhatnguyet.org) dùng
trên site và app; mọi kết quả được kiểm bằng bộ ca kiểm do bản Go sinh ra
(777 lá số, khoảng 1900 tới 2100, có và không có giờ sinh). Lịch âm, can chi,
tiết khí, nạp âm lấy từ `@nhatnguyet/am-lich`. Chạy được ở trình duyệt và Node.

## Cách gọi

```ts
import { lapLaSoBatTu, tinhTieuVanBatTu } from "@nhatnguyet/bat-tu";

const ls = lapLaSoBatTu(15, 6, 1990, 8, 30, "Nam"); // ngày, tháng, năm dương; giờ, phút; giới tính
ls.truNam.label;        // trụ năm, ví dụ "Canh Ngọ"
ls.truNgay.can;         // nhật chủ
ls.truThang.tangCan;    // can ẩn trong chi tháng, kèm thập thần
ls.thanSat;             // chín sao kèm trụ mang sao (0 năm, 1 tháng, 2 ngày, 3 giờ)
ls.daiVan.cacVan;       // mười đại vận, tuổi và năm vào vận

tinhTieuVanBatTu(ls, 2026);                 // tiểu vận năm 2026, hoặc null
lapLaSoBatTu(15, 6, 1990, null, 0, "Nữ");   // không biết giờ: ba trụ, không mệnh cung
```

Giới tính không nhận ra thì `lapLaSoBatTu` ném `LoiThieuGioiTinh`: đại vận đi
thuận hay nghịch tuỳ giới tính, nên gói không đoán.

Các hàm khác: `thapThanCuaCan`, `allThapThan`, `tangCanCuaChi`,
`truongSinhCuaCan`, `locCuaCan`, `duongNhanCuaCan`, `allNguyetLenh`,
`quanHeHaiCan`, `thienKhacDiaXung`, `lapTuTru`, `truTuChiSo`.

## Quy ước

- Giờ sinh đọc theo giờ Việt Nam UTC+7.
- Trụ năm đổi tại Lập Xuân; trụ tháng đổi ở mười hai tiết (kinh độ Mặt Trời),
  không theo tháng âm lịch.
- Trụ ngày đổi lúc 23h00, đầu giờ Tý; có phái giữ ngày cũ tới nửa đêm.
- Tàng can theo lối nhân nguyên tư lệnh của Tử Bình chân thuyên; vòng trường
  sinh dương thuận âm nghịch, Mậu theo Bính, Kỷ theo Đinh.
- Tuổi khởi vận là tuổi thực, đếm tới phút từ lúc sinh tới tiết, ba ngày là
  một năm. Tiểu vận khởi từ trụ giờ, tuổi là tuổi mụ theo trụ năm.
- Chỗ các sách tra thần sát khác nhau ghi ở trường `loiKhac` của từng sao.
- Chỉ số can 0 là Giáp, chỉ số chi 0 là Tý.

Gói trả phần TÍNH và tên ba thứ tiếng; chữ diễn giải dài của bản Go (các bước
tính, quy ước, ghi chú giờ Tý) chưa có ở đây.

Giấy phép MIT.
