"""Tử Vi Đẩu Số: lập lá số, đại vận, hạn năm, sao lưu, cách cục.

Bản chuyển ngữ sang Python của lõi tính Go của Nhật Nguyệt
(lõi tính Go của Nhật Nguyệt : tuvi.go, tuvi_lapso.go, tuvi_data.go,
tuvi_saophu.go, tuvi_chieusau.go, tuvi_luunien.go, tuvi_luusao.go,
tuvi_cachcuc.go, tuvi_cachcuc_toan_thu.go). Lõi Go là nguồn sự thật; bộ ca
kiểm ở thu-vien-mo/ca-kiem/tu-vi.json bắt mọi chỗ lệch.

Mã chia theo tệp Go:

- ``tu_vi_du_lieu``: bảng (tên cung, Tứ Hóa, miếu hãm, tên sao ba thứ tiếng).
- ``tu_vi_lap_so``: các bước an sao và ``lap_la_so_tu_vi``.
- ``tu_vi_han``: hội sao, liên cung, đại vận, hạn năm, sao lưu.
- ``tu_vi_cach_cuc``: nhận diện cách cục.

Kết quả là ``dict`` mang đúng khoá camelCase của lõi Go. Phần chữ diễn giải
(dienGiai, caveat, phepTinh, ghiChuGioTy) không được dựng: thư viện trả phần
TÍNH và tên ba thứ tiếng, chưa trả lời luận.

Ví dụ::

    from nhatnguyet import tu_vi
    ls = tu_vi.lap_la_so_tu_vi("", "Nam", 1, 1, 1990, 6)  # giờ Ngọ
    tu_vi.dai_van(ls)
    tu_vi.tinh_han_nam(ls, 2026)
    tu_vi.tinh_sao_luu(ls, 2026)
    tu_vi.nhan_dien_cach_cuc(ls)
"""

from .tu_vi_cach_cuc import (  # noqa: F401
    NHOM_DINH_BAN_TIEN, NHOM_DINH_PHU, NHOM_DINH_QUY, nhan_dien_cach_cuc, tom_tat_cach_cuc,
)
from .tu_vi_han import (  # noqa: F401
    CUNG_DONG_CUNG, CUNG_TAM_HOP, CUNG_XUNG_CHIEU, LUU_DA_LA, LUU_KINH_DUONG, LUU_LOC_TON,
    LUU_THAI_TUE, LUU_THIEN_MA, chieu_dai_van, chieu_tieu_van, dai_van, hoi_sao, khoi_tieu_van,
    lien_cung, quan_he_hai_cung, tinh_han_nam, tinh_nguyet_han, tinh_sao_luu, vi_tri_sao_luu,
)
from .tu_vi_lap_so import (  # noqa: F401
    can_cua_cung, can_cung_dan, cuc_theo_cung_menh, cung_than_cu, lap_la_so_tu_vi,
    ten_cung_cach_menh_thuan, ten_cung_theo_thu_tu, vi_tri_an_quang, vi_tri_bat_toa,
    vi_tri_chinh_tinh, vi_tri_cung_menh, vi_tri_cung_than, vi_tri_cung_thang_sinh,
    vi_tri_cung_thu_k, vi_tri_dau_quan, vi_tri_huu_bat, vi_tri_sao_thai_tue, vi_tri_ta_phu,
    vi_tri_tam_thai, vi_tri_thien_hu, vi_tri_thien_khoc, vi_tri_thien_phu, vi_tri_thien_phuc,
    vi_tri_thien_quan, vi_tri_thien_quy, vi_tri_thien_tai, vi_tri_thien_tho, vi_tri_tu_vi,
    vi_tri_van_khuc, vi_tri_van_xuong,
)

__all__ = [
    "lap_la_so_tu_vi", "dai_van", "tinh_han_nam", "tinh_sao_luu", "nhan_dien_cach_cuc",
    "hoi_sao", "lien_cung", "tinh_nguyet_han", "chieu_dai_van", "chieu_tieu_van",
    "khoi_tieu_van", "quan_he_hai_cung", "vi_tri_sao_luu", "tom_tat_cach_cuc",
    "vi_tri_cung_thang_sinh", "vi_tri_cung_menh", "vi_tri_cung_than", "cung_than_cu",
    "ten_cung_theo_thu_tu", "ten_cung_cach_menh_thuan", "vi_tri_cung_thu_k", "can_cung_dan",
    "can_cua_cung", "cuc_theo_cung_menh", "vi_tri_tu_vi", "vi_tri_thien_phu", "vi_tri_chinh_tinh",
    "vi_tri_ta_phu", "vi_tri_huu_bat", "vi_tri_van_khuc", "vi_tri_van_xuong", "vi_tri_tam_thai",
    "vi_tri_bat_toa", "vi_tri_an_quang", "vi_tri_thien_quy", "vi_tri_thien_quan",
    "vi_tri_thien_phuc", "vi_tri_thien_tai", "vi_tri_thien_tho", "vi_tri_thien_khoc",
    "vi_tri_thien_hu", "vi_tri_sao_thai_tue", "vi_tri_dau_quan",
    "NHOM_DINH_PHU", "NHOM_DINH_QUY", "NHOM_DINH_BAN_TIEN",
    "LUU_THAI_TUE", "LUU_LOC_TON", "LUU_KINH_DUONG", "LUU_DA_LA", "LUU_THIEN_MA",
    "CUNG_DONG_CUNG", "CUNG_XUNG_CHIEU", "CUNG_TAM_HOP",
]
