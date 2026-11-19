<p align="center">
  <a href="https://nhatnguyet.org/ma-nguon-mo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-toi.svg">
      <img src="./assets/banner-sang.svg" alt="Nhật Nguyệt" width="720">
    </picture>
  </a>
</p>

<h1 align="center">Nhật Nguyệt: mã và dữ liệu mở về Tử Vi, Bát Tự, Thần số học</h1>

<p align="center">
  <b>Lập lá số Tử Vi, Bát Tự (Tứ Trụ), Thần số học, đổi âm lịch và tra văn khấn miễn phí, bằng JavaScript và Python.</b><br>
  3,6 triệu lá số luận sẵn · hơn 60 đầu sách cổ · lịch âm Việt Nam đối chiếu NASA
</p>

<p align="center">
  <a href="./LICENSE"><img alt="Mã: MIT" src="https://img.shields.io/badge/m%C3%A3-MIT-1f6f6b.svg"></a>
  <a href="./DATA-LICENSE"><img alt="Dữ liệu: CC BY 4.0" src="https://img.shields.io/badge/d%E1%BB%AF%20li%E1%BB%87u-CC%20BY%204.0-1f6f6b.svg"></a>
  <a href="./ca-kiem"><img alt="Ca kiểm: 17.291 đạt" src="https://img.shields.io/badge/ca%20ki%E1%BB%83m-17.291%20%C4%91%E1%BA%A1t-2e7d32.svg"></a>
  <a href="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml"><img alt="Kiểm tự động" src="https://github.com/Nhat-Nguyet/nhatnguyet/actions/workflows/kiem.yml/badge.svg"></a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <b>Tiếng Việt</b> · <a href="./README.zh.md">中文</a>
  <br>
  <a href="https://nhatnguyet.org/ma-nguon-mo">Trang giới thiệu</a> ·
  <a href="https://nhatnguyet.org/du-lieu">Dữ liệu mở</a> ·
  <a href="https://huggingface.co/nhatnguyet">Hugging Face</a> ·
  <a href="https://nhatnguyet.org/blog">Bài hướng dẫn</a>
</p>

---

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Vì sao chọn Nhật Nguyệt](#vì-sao-chọn-nhật-nguyệt)
3. [Có gì trong repo](#có-gì-trong-repo)
4. [Bắt đầu nhanh](#bắt-đầu-nhanh)
5. [Dùng để làm gì](#dùng-để-làm-gì)
6. [Cơ sở khoa học](#cơ-sở-khoa-học)
7. [Lộ trình](#lộ-trình)
8. [Giấy phép và ghi nguồn](#giấy-phép-và-ghi-nguồn)
9. [Hỏi đáp](#hỏi-đáp)
10. [Đóng góp và liên hệ](#đóng-góp-và-liên-hệ)

## Tổng quan

Bộ mã và dữ liệu mở về tri thức huyền học và tín ngưỡng, **gốc Việt Nam, phủ cả
phương Đông lẫn phương Tây**: Tử Vi Đẩu Số, Bát Tự, Thần số học, Kinh Dịch,
Tarot, chiêm tinh, phong thủy, xem ngày, âm lịch bốn nước, lễ hội và văn khấn.
Kết quả khớp từng trường với lõi tính đang chạy trên
[nhatnguyet.org](https://nhatnguyet.org) và app Nhật Nguyệt trên iOS, Android.

| Lá số luận sẵn | Sách cổ | Bài kiến thức | Dữ liệu mở | Ca kiểm |
|:---:|:---:|:---:|:---:|:---:|
| **3,6 triệu** | **60+ đầu sách**<br>7,3 triệu ký tự | **510 bài**<br>tóm tắt, hỏi đáp | **33 bộ**<br>có DOI | **17.291**<br>đạt trọn |
| **456** bài văn khấn | **200** lễ hội | **4** nước âm lịch | **3** thứ tiếng | **0** phụ thuộc |

## Vì sao chọn Nhật Nguyệt

| | |
|---|---|
| **Lịch theo giờ Việt Nam** | 2.814 ngày trong 1900 tới 2100 có ngày âm khác lịch tính theo giờ Bắc Kinh; Tết lệch ở 10 năm. Chọn được lịch của từng nước, mặc định Việt Nam. |
| **Kiểm chứng được** | Điểm sóc lệch NASA trung bình 1,1 phút; giờ giao tiết lệch IMCCE trung bình 4,2 phút. Bản TypeScript và Python ra đúng từng trường của lõi tính gốc ở 17.291 ca. |
| **Nói có sách** | Mỗi câu sách cổ ghi tên sách và chương, nguyên văn đã đối chiếu bản in. Chỗ các phái khác nhau được nêu, không lặng lẽ chọn. |
| **Ba thứ tiếng** | Tên sao, thuật ngữ, lời luận đủ tiếng Việt, Anh, Trung. |
| **Chạy trên máy** | Không phụ thuộc, không gọi mạng, không gửi dữ liệu đi. Chạy trong trình duyệt, Node, Python. |

## Có gì trong repo

### Thư viện

| Môn | TypeScript (npm) | Python (`pip install nhatnguyet`) | Làm gì |
|---|---|---|---|
| Âm lịch | [`@nhatnguyet/am-lich`](./js/packages/am-lich) | `nhatnguyet.am_lich` | Đổi âm dương bốn nước, can chi, 24 tiết khí tới phút, Nhị Thập Bát Tú, nạp âm |
| Tử Vi | [`@nhatnguyet/tu-vi`](./js/packages/tu-vi) | `nhatnguyet.tu_vi` | Lá số 12 cung, sáng tối, Tứ Hóa, Tuần Triệt, đại vận, hạn năm, sao lưu, cách cục |
| Bát Tự | [`@nhatnguyet/bat-tu`](./js/packages/bat-tu) | `nhatnguyet.bat_tu` | Bốn trụ theo tiết khí, tàng can, thập thần, thần sát, đại vận, tiểu vận |
| Thần số học | [`@nhatnguyet/than-so-hoc`](./js/packages/than-so-hoc) | `nhatnguyet.than_so_hoc` | Số chủ đạo, sứ mệnh, linh hồn, đỉnh cao, thử thách, năm cá nhân; tên tiếng Việt có dấu |
| Lễ hội | [`@nhatnguyet/le-hoi`](./js/packages/le-hoi) | `nhatnguyet.le_hoi` | 200 lễ hội, quy đổi ngày âm sang dương từng năm |

### Dữ liệu

| Bộ | Nội dung | Định dạng | Cỡ |
|---|---|---|---|
| Lời luận theo lá số | Tử Vi, Bát Tự mọi ngày sinh 1900 tới 2100 (12 giờ, 2 giới); Thần số học theo ngày sinh | JSON Lines nén zstd, mỗi năm sinh một tệp | ~11 GB nén |
| ↳ lá số có cấu trúc | vị trí sao, Tứ Hóa, trụ, các con số, kèm mã câu luận | `la-so/<môn>/<năm>` | ~1,6 GB |
| ↳ ghép sẵn theo ngôn ngữ | chữ đầy đủ một ngôn ngữ mỗi tệp, cho huấn luyện AI | `ghep-san/<môn>/<vi\|en\|zh>/<năm>` | ~9 GB |
| ↳ kho chữ | lời luận, câu sách, đọc thêm; mỗi đoạn một lần, có mã | `kho/` | < 0,3 GB |
| Sách cổ | 60+ đầu sách phạm vi công cộng, toàn văn | văn bản | ~20 MB |
| Lịch, lễ hội, văn cúng | 33 bộ: lịch âm dương 1900 tới 2100, 64 quẻ, 78 lá Tarot, tiết khí, văn khấn, nghi thức... | CSV, JSON, Parquet | 118 MB |

### Bộ ca kiểm

[`ca-kiem/`](./ca-kiem): 17.291 cặp đầu vào và đáp án sinh từ lõi tính gốc, cho
lịch âm bốn nước, lễ hội, thần số học, Bát Tự, Tử Vi. Viết thư viện bằng ngôn
ngữ nào cũng tự kiểm được: đọc `vao`, so với `ra`.

## Bắt đầu nhanh

**TypeScript, JavaScript**

```bash
npm i @nhatnguyet/tu-vi @nhatnguyet/am-lich
```

```ts
import { lapLaSoTuVi, nhanDienCachCuc } from "@nhatnguyet/tu-vi";
import { solarToLunar, MUI_GIO_THEO_NUOC } from "@nhatnguyet/am-lich";

const laSo = lapLaSoTuVi("", "Nam", 19, 9, 1990, 10); // sinh 19/9/1990, giờ Tuất
console.log(laSo.tenCuc, nhanDienCachCuc(laSo).map((c) => c.ten));

solarToLunar(21, 1, 1985);                       // lịch Việt Nam: mùng 1 Tết
solarToLunar(21, 1, 1985, MUI_GIO_THEO_NUOC.CN); // lịch Trung Quốc: mùng 1 tháng Chạp
```

**Python**

```bash
pip install nhatnguyet
```

```python
from nhatnguyet import tu_vi, bat_tu, le_hoi

la_so = tu_vi.lap_la_so_tu_vi("", "Nam", 19, 9, 1990, 10)
bat = bat_tu.lap_la_so_bat_tu(19, 9, 1990, 20, 0, "Nam")
le_hoi.le_hoi_trong_nam(2027)
```

**Dữ liệu**

```python
from datasets import load_dataset
ds = load_dataset("nhatnguyet/loi-luan-tu-vi", data_files="ghep-san/tu-vi/vi/1990.jsonl.zst")
```

## Dùng để làm gì

| Mục đích | Dùng gì | Hướng dẫn |
|---|---|---|
| **Xây website, app lá số** | thư viện Tử Vi, Bát Tự, Thần số học | [Lập lá số Tử Vi bằng JavaScript](https://nhatnguyet.org/blog/lap-la-so-tu-vi-bang-javascript) |
| **App lịch, nhắc việc** | âm lịch, lễ hội, văn khấn | [Lịch âm, lễ hội, nhắc giỗ cho ứng dụng](https://nhatnguyet.org/blog/lich-am-le-hoi-cho-ung-dung) |
| **Huấn luyện AI** | lời luận ghép sẵn theo ngôn ngữ | [Huấn luyện AI với dữ liệu Tử Vi](https://nhatnguyet.org/blog/huan-luyen-ai-voi-du-lieu-tu-vi) |
| **Trợ lý AI có trích dẫn** | kho câu sách, đọc thêm | [Trợ lý AI trích dẫn sách cổ](https://nhatnguyet.org/blog/tro-ly-ai-trich-dan-sach-co) |
| **Phân tích dữ liệu** | lá số có cấu trúc | [Cách cục hiếm đến mức nào](https://nhatnguyet.org/blog/phan-tich-du-lieu-la-so-bang-python) |
| **Nghiên cứu lịch pháp, văn hóa** | lịch bốn nước, lễ hội, sách cổ | [Âm lịch Việt Nam khác Trung Quốc](https://nhatnguyet.org/blog/am-lich-viet-nam-khac-trung-quoc) |
| **Kiểm thư viện của mình** | bộ ca kiểm | [Kiểm bằng bộ ca kiểm chung](https://nhatnguyet.org/blog/kiem-thu-vien-bang-bo-ca-kiem) |

Ngoài ra: giáo dục (lập lá số từng bước), dịch thuật (thuật ngữ ba thứ tiếng),
nội dung và báo chí (số liệu kiểm được).

## Cơ sở khoa học

**Khoa học nằm ở cách làm, không ở lời đoán.** Lịch pháp là phép tính thiên văn,
đối chiếu được với NASA và IMCCE. Mọi kết quả tất định, kiểm lại được qua bộ ca
kiểm. Tử Vi, Bát Tự, Thần số học và các môn thuật số là quy tắc của từng phái,
chưa được khoa học kiểm chứng; không dùng làm căn cứ cho quyết định về sức khỏe,
tài chính hay pháp lý.

**Lịch theo từng nước**

| Lịch | Giờ tính | Nước, vùng |
|---|---|---|
| Việt Nam (mặc định) | UTC+7 | Việt Nam |
| Trung Quốc | UTC+8 | Trung Quốc, Đài Loan, Hồng Kông, Ma Cao; Tết của người Hoa ở Singapore, Malaysia, Indonesia, Philippines |
| Hàn Quốc | UTC+9 | Hàn Quốc |
| Nhật Bản | UTC+9 | Âm lịch cũ (kyūreki), dùng cho lễ truyền thống |

Mông Cổ, Tây Tạng, Thái Lan, Lào, Campuchia, Myanmar, Ấn Độ dùng hệ lịch khác
quy tắc, chưa có trong thư viện.

**Đọc chuyên sâu**

| Loại dữ liệu | Bài |
|---|---|
| Âm lịch, tiết khí | [Tính thế nào, sai số bao nhiêu?](https://nhatnguyet.org/blog/co-so-khoa-hoc-am-lich-tiet-khi) |
| Can chi, hoa giáp, 28 sao | [Tính từ số ngày Julian thế nào?](https://nhatnguyet.org/blog/co-so-khoa-hoc-can-chi-chu-ky) |
| Lá số Tử Vi | [Từ ngày giờ sinh tới 12 cung](https://nhatnguyet.org/blog/co-so-khoa-hoc-la-so-tu-vi) |
| Cách cục Toàn Thư | [Điều kiện và tần suất từng cách](https://nhatnguyet.org/blog/co-so-khoa-hoc-cach-cuc-toan-thu) |
| Bát Tự | [Vì sao trụ tháng theo tiết khí](https://nhatnguyet.org/blog/co-so-khoa-hoc-bat-tu) |
| Thần số học | [Hệ hiện đại và tên tiếng Việt](https://nhatnguyet.org/blog/co-so-khoa-hoc-than-so-hoc) |
| Sách cổ, lời luận | [Số hóa, đối chiếu, ghép theo lá số](https://nhatnguyet.org/blog/co-so-khoa-hoc-sach-co-loi-luan) |
| Lễ hội, văn cúng | [Nguồn và cách xác minh ngày](https://nhatnguyet.org/blog/co-so-khoa-hoc-le-hoi-van-cung) |
| Phương pháp chung | [Nhật Nguyệt kiểm bằng những cách nào](https://nhatnguyet.org/blog/co-so-khoa-hoc-kiem-chung) |

## Lộ trình

- [x] Âm lịch bốn nước, can chi, 24 tiết khí, Nhị Thập Bát Tú
- [x] Tử Vi, Bát Tự, Thần số học, lễ hội (TypeScript, Python)
- [x] Lời luận theo lá số 1900 tới 2100, ba thứ tiếng
- [ ] Văn khấn: tra lễ, lấy bài, điền tên vào lời khấn
- [ ] Kinh Dịch, Lục Hào, Mai Hoa
- [ ] Phong thủy: Bát Trạch, cung phi, thước Lỗ Ban
- [ ] Xem ngày: giờ hoàng đạo, 12 trực, ngày kỵ
- [ ] Chiêm tinh cung hoàng đạo, Tarot
- [ ] Tùy chọn theo phái (tháng nhuận, giờ Tý), giờ mặt trời thật

## Giấy phép và ghi nguồn

| Phần | Giấy phép | Được làm gì |
|---|---|---|
| Mã nguồn | [MIT](./LICENSE) | Dùng, sửa, bán; giữ dòng `Copyright (c) 2026 Nhat Nguyet (nhatnguyet.org)` |
| Dữ liệu, lời luận | [CC BY 4.0](./DATA-LICENSE) | Dùng cả thương mại và huấn luyện AI, **bắt buộc ghi nguồn** |
| Sách cổ | Phạm vi công cộng | Nguyên văn tự do; phần số hóa, đối chiếu theo CC BY 4.0 |
| Văn khấn | CC BY 4.0 | Văn sưu tầm, Nhật Nguyệt biên tập, không nhận là tác giả lời văn |

**Câu ghi nguồn chuẩn:** `Dữ liệu: Nhật Nguyệt (nhatnguyet.org)`, kèm liên kết
https://nhatnguyet.org khi có thể. Ứng dụng hiển thị kết quả ghi "Theo Nhật
Nguyệt" ở chỗ người dùng thấy được. Phát hành lại dữ liệu thì giữ cột `nguon`.

Tên và dấu **Nhật Nguyệt** là thương hiệu, không nằm trong giấy phép. Không đặt
tên sản phẩm hay trình bày khiến người dùng hiểu là sản phẩm của Nhật Nguyệt
hoặc được Nhật Nguyệt bảo trợ.

**Trích dẫn**

```bibtex
@software{nhatnguyet_2026,
  author = {{Nhật Nguyệt}},
  title  = {Nhật Nguyệt: mã và dữ liệu mở về Tử Vi, Bát Tự, Thần số học},
  year   = {2026},
  url    = {https://nhatnguyet.org/ma-nguon-mo}
}
```

## Hỏi đáp

<details>
<summary><b>Có thư viện miễn phí để lập lá số Tử Vi bằng JavaScript hay Python không?</b></summary>

Có: `npm i @nhatnguyet/tu-vi` hoặc `pip install nhatnguyet`. Lá số gồm cục,
cung Mệnh, Thân, 14 chính tinh và phụ tinh, sáng tối, Tứ Hóa, Tuần Triệt, đại
vận, hạn năm, sao lưu và cách cục, gồm các cách của Tử Vi Đẩu Số Toàn Thư.
</details>

<details>
<summary><b>Dùng dữ liệu này huấn luyện AI có được không?</b></summary>

Được, kể cả cho sản phẩm thương mại, theo giấy phép CC BY 4.0. Điều kiện duy
nhất là ghi nguồn "Dữ liệu: Nhật Nguyệt (nhatnguyet.org)".
</details>

<details>
<summary><b>Đổi âm lịch sang dương lịch có chính xác không?</b></summary>

Lịch tính từ vị trí thật của Mặt Trăng và Mặt Trời. Điểm sóc lệch NASA trung
bình 1,1 phút; giờ giao tiết lệch IMCCE trung bình 4,2 phút, trên 1900 tới
2100. Dựng lại lịch âm chỉ từ số liệu NASA và IMCCE khớp 2.459 trên 2.461 tháng.
</details>

<details>
<summary><b>Bát Tự lấy trụ tháng theo tháng âm hay theo tiết khí?</b></summary>

Theo tiết khí, đúng phép Tứ Trụ: trụ năm đổi ở Lập Xuân, trụ tháng đổi ở giờ
giao tiết, không theo mùng 1 âm lịch. Lấy tháng âm làm trụ tháng thì sai ở
khoảng một phần tư số ngày.
</details>

<details>
<summary><b>Thần số học tính tên tiếng Việt có dấu thế nào?</b></summary>

Bỏ dấu rồi tính theo bảng chữ sang số, "Đ" tính là "D". Có đủ số chủ đạo, sứ
mệnh, linh hồn, nhân cách, thái độ, đỉnh cao, thử thách, năm, tháng, ngày cá
nhân.
</details>

<details>
<summary><b>Văn khấn lấy ở đâu ra?</b></summary>

Văn sưu tầm trong dân gian, Nhật Nguyệt biên tập và phân theo 155 loại lễ: Tết,
rằm, mùng một, giỗ, cưới hỏi, nhập trạch, khai trương...
</details>

## Đóng góp và liên hệ

- Báo lỗi, đề xuất: mở issue kèm ngày giờ sinh, giới tính, kết quả nhận được,
  kết quả mong đợi và căn cứ. Xem [CONTRIBUTING.md](./CONTRIBUTING.md).
- Website: [nhatnguyet.org](https://nhatnguyet.org) · Thư: lienhe@nhatnguyet.org

<p align="center"><sub>Dữ liệu: Nhật Nguyệt (nhatnguyet.org) · Mã MIT · Dữ liệu CC BY 4.0</sub></p>
