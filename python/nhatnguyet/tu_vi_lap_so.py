"""Lập lá số Tử Vi: cung Mệnh, Thân, Cục, an chính tinh, phụ tinh, ba vòng
Tràng Sinh, Thái Tuế, Bác Sỹ, sáng tối, Tứ Hóa, Tuần Triệt.

Bản chuyển ngữ của lõi Go (coreengine: tuvi.go, tuvi_lapso.go,
tuvi_saophu.go). Mỗi bước an là một hàm riêng như bên Go, để bảng tra trong
bài viết và lá số dùng cùng một phép.

Quy ước chỉ số: vị trí 0 là Tý, 11 là Hợi; tháng và ngày là số âm lịch; giờ
là chỉ số chi của giờ sinh (0 là Tý); can năm 0 là Giáp.
"""

from __future__ import annotations

from typing import Dict, List, Tuple

from .am_lich import DIA_CHI, THIEN_CAN, mod, ngu_hanh_nap_am, solar_to_lunar
from .tu_vi_du_lieu import (
    CHINH_TINH_DIGNITY, CHINH_TINH_NAME_EN, CHOM_THIEN_PHU, CHOM_TU_VI, DIGNITY_LABEL,
    HANH_TO_CUC, LOC_TON_VI_TRI, PHU_TINH_NAME_EN, TEN_CHINH_TINH, TEN_CUNG_THEO_OFFSET,
    CHINH_TINH_NAME_ZH, PHU_TINH_NAME_ZH, TEN_CUC_BA_THU, en_cua, zh_cua,
    TEN_HOA, TEN_PHU_TINH, TEN_SAO_PHU_MOI, TEN_SAO_PHU_MOI_BA_THU, TEN_VONG_BAC_SY,
    TEN_VONG_THAI_TUE, TEN_VONG_TRUONG_SINH, THIEN_KHOI_VI_TRI, THIEN_PHUC_VI_TRI,
    THIEN_QUAN_VI_TRI, TRANG_SINH_THEO_CUC, TRIET_THEO_CAN, TU_HOA_THEO_CAN,
)

# ---------------------------------------------------------------------------
# Các bước lập lá số (tuvi_lapso.go)
# ---------------------------------------------------------------------------


def vi_tri_cung_thang_sinh(thang: int) -> int:
    """Từ Dần là tháng Giêng, đếm thuận tới tháng sinh."""
    return mod(2 + (thang - 1), 12)


def vi_tri_cung_menh(thang: int, gio: int) -> int:
    """Lấy cung tháng sinh làm giờ Tý, đếm NGHỊCH tới giờ sinh."""
    return mod(vi_tri_cung_thang_sinh(thang) - gio, 12)


def vi_tri_cung_than(thang: int, gio: int) -> int:
    """Lấy cung tháng sinh làm giờ Tý, đếm THUẬN tới giờ sinh."""
    return mod(vi_tri_cung_thang_sinh(thang) + gio, 12)


def ten_cung_theo_thu_tu(k: int) -> str:
    """Tên cung thứ k (0 là Mệnh) khi an mười hai cung nghịch từ Mệnh."""
    return TEN_CUNG_THEO_OFFSET[mod(k, 12)][0]


def ten_cung_cach_menh_thuan(k: int) -> str:
    """Tên cung chức năng cách cung Mệnh k bước đếm THUẬN trên địa bàn."""
    return TEN_CUNG_THEO_OFFSET[mod(-k, 12)][0]


def cung_than_cu(gio: int) -> str:
    """Tên cung chức năng mà cung Thân cư theo giờ sinh."""
    return ten_cung_cach_menh_thuan(2 * gio)


def vi_tri_cung_thu_k(cung_menh: int, k: int) -> int:
    """Vị trí trên địa bàn của cung thứ k tính từ Mệnh (mười hai cung an nghịch)."""
    return mod(cung_menh - k, 12)


def can_cung_dan(can_nam: int) -> int:
    """Can của cung Dần theo Ngũ Hổ Độn."""
    return mod(2 * can_nam + 2, 10)


def can_cua_cung(can_nam: int, vi_tri: int) -> int:
    """Can của một cung trên địa bàn, đếm thuận từ cung Dần."""
    return mod(can_cung_dan(can_nam) + mod(vi_tri - 2, 12), 10)


def cuc_theo_cung_menh(can_nam: int, cung_menh: int) -> Tuple[int, str, bool]:
    """Số cục và tên cục suy từ nạp âm của can chi cung Mệnh: (số, tên, hợp lệ)."""
    hanh, _, _ = ngu_hanh_nap_am(can_cua_cung(can_nam, cung_menh), cung_menh)
    if hanh not in HANH_TO_CUC:
        return 0, "", False
    so, ten = HANH_TO_CUC[hanh]
    return so, ten, True


def _tim_tu_vi_vi_tri(cuc: int, ngay_sinh_am: int) -> int:
    """Vị trí sao Tử Vi theo Cục và ngày sinh âm lịch."""
    cung_dan = 2
    c = cuc
    while c < ngay_sinh_am:
        c += cuc
        cung_dan += 1
    sai_lech = c - ngay_sinh_am
    if sai_lech % 2 != 0:  # lẻ thì lùi (nghịch)
        sai_lech = -sai_lech
    return mod(cung_dan + sai_lech, 12)


def vi_tri_tu_vi(cuc: int, ngay: int) -> int:
    """Vị trí sao Tử Vi theo số cục và NGÀY sinh âm lịch."""
    return _tim_tu_vi_vi_tri(cuc, ngay)


def vi_tri_thien_phu(vi_tri_tu_vi_: int) -> int:
    """Thiên Phủ đối xứng với Tử Vi qua trục Dần Thân."""
    return mod(4 - vi_tri_tu_vi_, 12)


def vi_tri_chinh_tinh(vi_tri_tu_vi_: int) -> Dict[str, int]:
    """Vị trí của đủ mười bốn chính tinh khi biết vị trí Tử Vi."""
    ra = {}
    for ten, buoc in CHOM_TU_VI:
        ra[ten] = mod(vi_tri_tu_vi_ + buoc, 12)
    tp = vi_tri_thien_phu(vi_tri_tu_vi_)
    for ten, buoc in CHOM_THIEN_PHU:
        ra[ten] = mod(tp + buoc, 12)
    return ra


# ---------------------------------------------------------------------------
# Phép an phụ tinh (tuvi_saophu.go, tuvi.go, tuvi_data.go)
# ---------------------------------------------------------------------------


def vi_tri_ta_phu(thang: int) -> int:
    """Tháng Giêng ở Thìn, đếm thuận theo tháng sinh."""
    return mod(4 + (thang - 1), 12)


def vi_tri_huu_bat(thang: int) -> int:
    """Tháng Giêng ở Tuất, đếm nghịch theo tháng sinh."""
    return mod(2 - vi_tri_ta_phu(thang), 12)


def vi_tri_van_khuc(gio: int) -> int:
    """Giờ Tý ở Thìn, đếm thuận theo giờ sinh."""
    return mod(4 + gio, 12)


def vi_tri_van_xuong(gio: int) -> int:
    """Giờ Tý ở Tuất, đếm nghịch theo giờ sinh."""
    return mod(2 - vi_tri_van_khuc(gio), 12)


def vi_tri_tam_thai(thang: int, ngay: int) -> int:
    """Lấy cung Tả Phù làm mùng một, đếm thuận tới ngày sinh."""
    return mod(vi_tri_ta_phu(thang) + (ngay - 1), 12)


def vi_tri_bat_toa(thang: int, ngay: int) -> int:
    """Lấy cung Hữu Bật làm mùng một, đếm nghịch tới ngày sinh."""
    return mod(vi_tri_huu_bat(thang) - (ngay - 1), 12)


def vi_tri_an_quang(gio: int, ngay: int) -> int:
    """Lấy cung Văn Xương làm mùng một, đếm thuận tới ngày sinh rồi lùi một cung."""
    return mod(vi_tri_van_xuong(gio) + (ngay - 1) - 1, 12)


def vi_tri_thien_quy(gio: int, ngay: int) -> int:
    """Lấy cung Văn Khúc làm mùng một, đếm NGHỊCH tới ngày sinh rồi lùi một cung
    (lối sách Việt; sách Trung Hoa đếm thuận)."""
    return mod(vi_tri_van_khuc(gio) - (ngay - 1) + 1, 12)


def vi_tri_thien_quan(can_nam: int) -> int:
    return THIEN_QUAN_VI_TRI[mod(can_nam, 10)]


def vi_tri_thien_phuc(can_nam: int) -> int:
    return THIEN_PHUC_VI_TRI[mod(can_nam, 10)]


def vi_tri_thien_tai(cung_menh: int, chi_nam: int) -> int:
    """Lấy cung Mệnh làm năm Tý, đếm thuận tới chi năm sinh."""
    return mod(cung_menh + chi_nam, 12)


def vi_tri_thien_tho(cung_than: int, chi_nam: int) -> int:
    """Lấy cung Thân làm năm Tý, đếm thuận tới chi năm sinh."""
    return mod(cung_than + chi_nam, 12)


def vi_tri_thien_khoc(chi_nam: int) -> int:
    """Năm Tý ở Ngọ, đếm nghịch tới chi năm sinh."""
    return mod(6 - chi_nam, 12)


def vi_tri_thien_hu(chi_nam: int) -> int:
    """Năm Tý ở Ngọ, đếm thuận tới chi năm sinh."""
    return mod(6 + chi_nam, 12)


def vi_tri_sao_thai_tue(chi_nam: int, thu: int) -> int:
    """Sao thứ ``thu`` của vòng Thái Tuế (luôn đi thuận từ cung chi năm)."""
    return mod(chi_nam + thu, 12)


def vi_tri_dau_quan(chi_nam: int, thang: int, gio: int) -> int:
    """Từ cung Thái Tuế kể là tháng Giêng, đếm nghịch tới tháng sinh; lấy cung
    ấy làm giờ Tý, đếm thuận tới giờ sinh."""
    return mod(chi_nam - (thang - 1) + gio, 12)


def thien_ma_vi_tri(chi_nam_idx: int) -> int:
    """Vị trí Thiên Mã theo nhóm tam hợp của chi năm."""
    r = mod(chi_nam_idx + 1, 4)
    if r == 1:
        return 2   # Dần
    if r == 2:
        return 11  # Hợi
    if r == 3:
        return 8   # Thân
    return 5       # Tỵ


def dao_hoa_vi_tri(chi_nam_idx: int) -> int:
    """Vị trí Đào Hoa theo nhóm tam hợp của chi năm sinh."""
    r = mod(chi_nam_idx, 4)
    if r == 0:
        return 9  # Dậu
    if r == 2:
        return 3  # Mão
    if chi_nam_idx % 12 in (5, 9, 1):
        return 6  # Ngọ
    return 0      # Tý


def _can_chi_cua_cung(can_thang_gieng: int, vi_tri: int) -> str:
    """Nhãn can chi ở góc mỗi cung (Ngũ Hổ Độn từ can tháng Giêng)."""
    offset = mod(vi_tri - 2, 12)
    can = mod(can_thang_gieng + offset, 10)
    return THIEN_CAN[can] + " " + DIA_CHI[vi_tri]


# ---------------------------------------------------------------------------
# Lập lá số
# ---------------------------------------------------------------------------


def lap_la_so_tu_vi(ho_ten: str, gioi_tinh: str, dd: int, mm: int, yyyy: int, gio_chi_idx: int) -> Dict:
    """Lập lá số Tử Vi từ ngày sinh dương lịch và chỉ số chi giờ sinh (0 Tý
    tới 11 Hợi). ``gioi_tinh`` là "Nam" hoặc "Nữ". Đầu vào sai thì ném ValueError.

    Trả dict mang đúng khoá của lõi Go (bỏ phần chữ diễn giải, lời rào và ghi
    chú giờ Tý)."""
    if gioi_tinh not in ("Nam", "Nữ"):
        raise ValueError('gioiTinh phải là "Nam" hoặc "Nữ"')
    if not isinstance(gio_chi_idx, int) or gio_chi_idx < 0 or gio_chi_idx > 11:
        raise ValueError("gioSinhChiIdx phải trong khoảng 0-11")

    lunar = solar_to_lunar(dd, mm, yyyy, 7)
    am_nam, am_thang, am_ngay = lunar["year"], lunar["month"], lunar["day"]

    can_nam = mod(am_nam - 4, 10)
    chi_nam = mod(am_nam - 4, 12)

    gioi_sign = -1 if gioi_tinh == "Nữ" else 1
    am_duong_can_sign = -1 if can_nam % 2 != 0 else 1
    # +1: Dương Nam, Âm Nữ (thuận); -1: Âm Nam, Dương Nữ (nghịch)
    am_duong_nam_nu = gioi_sign * am_duong_can_sign
    am_duong_menh = ("Âm" if am_duong_can_sign < 0 else "Dương") + " " + gioi_tinh

    cung_menh = vi_tri_cung_menh(am_thang, gio_chi_idx)
    cung_than = vi_tri_cung_than(am_thang, gio_chi_idx)

    can_thang_gieng = can_cung_dan(can_nam)
    cuc_so, ten_cuc, ok = cuc_theo_cung_menh(can_nam, cung_menh)
    if not ok:
        raise ValueError("không xác định được Cục (cung Mệnh %s)" % DIA_CHI[cung_menh])

    _, _, ban_menh_ten = ngu_hanh_nap_am(can_nam, chi_nam)

    # 14 chính tinh
    star_pos = vi_tri_chinh_tinh(vi_tri_tu_vi(cuc_so, am_ngay))

    # Vòng Lộc Tồn
    vt_loc_ton = LOC_TON_VI_TRI[can_nam]
    star_pos["Lộc Tồn"] = vt_loc_ton
    star_pos["Kình Dương"] = mod(vt_loc_ton + 1, 12)
    star_pos["Đà La"] = mod(vt_loc_ton - 1, 12)

    vt_trang_sinh = TRANG_SINH_THEO_CUC[cuc_so]

    vt_khoi = THIEN_KHOI_VI_TRI[can_nam]
    star_pos["Thiên Khôi"] = vt_khoi
    star_pos["Thiên Việt"] = mod(8 - vt_khoi, 12)

    star_pos["Tả Phù"] = vi_tri_ta_phu(am_thang)
    star_pos["Hữu Bật"] = vi_tri_huu_bat(am_thang)

    star_pos["Văn Khúc"] = vi_tri_van_khuc(gio_chi_idx)
    star_pos["Văn Xương"] = vi_tri_van_xuong(gio_chi_idx)

    vt_dia_kiep = mod(11 + gio_chi_idx, 12)
    star_pos["Địa Kiếp"] = vt_dia_kiep
    star_pos["Địa Không"] = mod(10 - vt_dia_kiep, 12)

    star_pos["Thiên Mã"] = thien_ma_vi_tri(chi_nam)
    star_pos["Đào Hoa"] = dao_hoa_vi_tri(chi_nam)

    star_pos["Tam Thai"] = vi_tri_tam_thai(am_thang, am_ngay)
    star_pos["Bát Tọa"] = vi_tri_bat_toa(am_thang, am_ngay)
    star_pos["Ân Quang"] = vi_tri_an_quang(gio_chi_idx, am_ngay)
    star_pos["Thiên Quý"] = vi_tri_thien_quy(gio_chi_idx, am_ngay)
    star_pos["Thiên Quan"] = vi_tri_thien_quan(can_nam)
    star_pos["Thiên Phúc"] = vi_tri_thien_phuc(can_nam)
    star_pos["Thiên Tài"] = vi_tri_thien_tai(cung_menh, chi_nam)
    star_pos["Thiên Thọ"] = vi_tri_thien_tho(cung_than, chi_nam)
    star_pos["Thiên Khốc"] = vi_tri_thien_khoc(chi_nam)
    star_pos["Thiên Hư"] = vi_tri_thien_hu(chi_nam)
    star_pos["Đẩu Quân"] = vi_tri_dau_quan(chi_nam, am_thang, gio_chi_idx)

    # Tứ Hóa theo can năm sinh
    tu_hoa_of = {sao: hoa for sao, hoa in zip(TU_HOA_THEO_CAN[can_nam], TEN_HOA)}

    # Tuần, Triệt
    triet = TRIET_THEO_CAN[can_nam]
    tuan_start = mod(chi_nam - can_nam, 12)
    tuan = (mod(tuan_start + 10, 12), mod(tuan_start + 11, 12))

    cung: List[Dict] = []
    for i in range(12):
        ten_vi, ten_en, ten_zh = TEN_CUNG_THEO_OFFSET[mod(cung_menh - i, 12)]
        can_chi = _can_chi_cua_cung(can_thang_gieng, i)
        cung.append({
            "viTri": i,
            "chi": DIA_CHI[i],
            "chiZh": zh_cua(DIA_CHI[i]),
            "canChi": can_chi,
            "canChiZh": zh_cua(can_chi),
            "tenCung": ten_vi,
            "tenCungEn": ten_en,
            "tenCungZh": ten_zh,
            "laThan": i == cung_than,
            "tuanTrung": i in tuan,
            "trietLo": i in triet,
            "sao": [],
        })

    def them_sao(pos: int, ten: str, ten_en: str, ten_zh: str, loai: str) -> None:
        s = {"ten": ten, "tenEn": ten_en}
        if ten_zh:
            s["tenZh"] = ten_zh
        s["loai"] = loai
        dig = CHINH_TINH_DIGNITY.get(ten)
        if dig is not None:
            vi, en, zh = DIGNITY_LABEL[dig[pos]]
            s["mieuVuong"], s["mieuVuongEn"], s["mieuVuongZh"] = vi, en, zh
        if ten in tu_hoa_of:
            s["tuHoa"] = tu_hoa_of[ten]
            s["tuHoaZh"] = zh_cua(tu_hoa_of[ten])
        cung[pos]["sao"].append(s)

    for ten in TEN_CHINH_TINH:
        them_sao(star_pos[ten], ten, CHINH_TINH_NAME_EN[ten], CHINH_TINH_NAME_ZH[ten], "chinh-tinh")
    for ten in TEN_PHU_TINH:
        them_sao(star_pos[ten], ten, PHU_TINH_NAME_EN[ten], PHU_TINH_NAME_ZH[ten], "phu-tinh")
    for ten in TEN_SAO_PHU_MOI:
        en, zh = TEN_SAO_PHU_MOI_BA_THU[ten]
        them_sao(star_pos[ten], ten, en, zh, "phu-tinh")
    # Vòng Tràng Sinh theo âm dương năm và giới (Dương Nam, Âm Nữ thuận).
    for i in range(12):
        vi, en, zh = TEN_VONG_TRUONG_SINH[i]
        them_sao(mod(vt_trang_sinh + am_duong_nam_nu * i, 12), vi, en, zh, "truong-sinh")
    # Vòng Thái Tuế luôn thuận.
    for i in range(12):
        vi, en, zh = TEN_VONG_THAI_TUE[i]
        them_sao(vi_tri_sao_thai_tue(chi_nam, i), vi, en, zh, "thai-tue")
    for i in range(12):
        vi, en, zh = TEN_VONG_BAC_SY[i]
        them_sao(mod(vt_loc_ton + am_duong_nam_nu * i, 12), vi, en, zh, "bac-sy")

    return {
        "hoTen": ho_ten,
        "gioiTinh": gioi_tinh,
        "ngaySinhDuong": {"ngay": dd, "thang": mm, "nam": yyyy},
        "ngaySinhAm": dict(lunar),
        "gioSinh": DIA_CHI[gio_chi_idx],
        "gioSinhZh": zh_cua(DIA_CHI[gio_chi_idx]),
        "canChiNam": THIEN_CAN[can_nam] + " " + DIA_CHI[chi_nam],
        "canChiNamZh": zh_cua(THIEN_CAN[can_nam] + " " + DIA_CHI[chi_nam]),
        "amDuongMenh": am_duong_menh,
        "amDuongMenhEn": en_cua(am_duong_menh),
        "amDuongMenhZh": zh_cua(am_duong_menh),
        "cuc": cuc_so,
        "tenCuc": ten_cuc,
        "tenCucEn": TEN_CUC_BA_THU[ten_cuc][0],
        "tenCucZh": TEN_CUC_BA_THU[ten_cuc][1],
        "banMenhNapAm": ban_menh_ten,
        "banMenhNapAmEn": en_cua(ban_menh_ten),
        "banMenhNapAmZh": zh_cua(ban_menh_ten),
        "cungMenh": cung_menh,
        "cungThan": cung_than,
        "menhCungChi": DIA_CHI[cung_menh],
        "menhCungChiZh": zh_cua(DIA_CHI[cung_menh]),
        "cung": cung,
    }
