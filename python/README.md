# nhatnguyet (Python)

> **English:** Zi Wei Dou Shu (Tử Vi), BaZi (Four Pillars), Pythagorean numerology for Vietnamese names, the Vietnamese, Chinese, Korean and Japanese lunar calendars, and Vietnamese festivals, in pure Python with no dependencies. By Nhat Nguyet ([nhatnguyet.org](https://nhatnguyet.org)). Full docs: [github.com/Nhat-Nguyet/nhatnguyet](https://github.com/Nhat-Nguyet/nhatnguyet/blob/main/README.md).

Bản Python của lõi tính Nhật Nguyệt (nhatnguyet.org): âm lịch Việt Nam, can chi,
24 tiết khí, Nhị Thập Bát Tú, ngũ hành, nạp âm, và thần số học. Thư viện chuẩn,
không phụ thuộc, Python 3.9 trở lên. Giấy phép MIT.

Lõi tính Go của Nhật Nguyệt là nguồn sự thật. Mỗi kết quả ở đây được so với bộ
ca kiểm do lõi Go sinh ra (`../ca-kiem/*.json`): 8.960 ca âm lịch và 600 ca thần
số học, khớp từng trường.

## Cài và kiểm

```bash
pip install .
python3 -m unittest discover -s tests
```

## Dùng

```python
from nhatnguyet import am_lich, than_so_hoc

am_lich.solar_to_lunar(17, 2, 2026)       # {'day': 1, 'month': 1, 'year': 2026, 'leap': False}
am_lich.lunar_to_solar(1, 1, 2026, False) # ({'day': 17, 'month': 2, 'year': 2026}, True)
am_lich.day_can_chi(17, 2, 2026)          # {'can': 'Nhâm', 'chi': 'Tuất', 'label': 'Nhâm Tuất'}
am_lich.moc_tiet_khi_trong_nam(2026)      # 24 mốc tiết khí, giờ Việt Nam, tới phút

than_so_hoc.tinh_ho_so_than_so_hoc_sau("Nguyễn Văn An", 1, 10, 1960, 2026, 1, 1)

from nhatnguyet import tu_vi; ls = tu_vi.lap_la_so_tu_vi("", "Nam", 1, 1, 1990, 6); tu_vi.nhan_dien_cach_cuc(ls)  # Tử Vi (giờ là chỉ số chi, 0 Tý); thêm dai_van, tinh_han_nam, tinh_sao_luu
from nhatnguyet import bat_tu; ls = bat_tu.lap_la_so_bat_tu(1, 10, 1990, 8, 30, "Nam"); bat_tu.tinh_tieu_van_bat_tu(ls, 2026)  # Bát Tự, giờ None là chưa biết giờ
```

## Quy ước tên

- Tên hàm là tên hàm Go viết kiểu snake_case, GIỮ NGHĨA của Go:
  `SolarToLunar` thành `solar_to_lunar` (dương sang âm), `LunarToSolar` thành
  `lunar_to_solar` (âm sang dương), `TinhHoSoThanSoHocSau` thành
  `tinh_ho_so_than_so_hoc_sau`.
- Kết quả là `dict` mang đúng khoá camelCase của bộ ca kiểm (`soDuongDoi`,
  `canChiNgay`, `kinhDo`...). Ngày dương là `{"day", "month", "year"}`, ngày
  âm thêm `"leap"`.
- Mọi phép tính lịch theo giờ Việt Nam UTC+7 cho mọi năm.
- Thần số học: tháng và ngày cá nhân tính theo `thang_xem`, `ngay_xem` truyền
  vào, không đọc đồng hồ máy. Tên tiếng Việt bỏ dấu như lõi Go (`đ` thành `d`).

## Ghi công

Công thức thiên văn theo Jean Meeus, "Astronomical Algorithms"; ΔT theo Espenak
và Meeus (NASA, 2006). Quy tắc dựng tháng là quy tắc chung của lịch âm dương
truyền thống (lịch Thời Hiến), áp ở giờ Việt Nam UTC+7. Mã viết lại theo lõi Go
của Nhật Nguyệt.
