// Một dòng của bộ dữ liệu mở le-hoi-viet-nam, giữ nguyên tên cột của bộ.
// Mô tả từng cột: https://nhatnguyet.org/du-lieu (bộ le-hoi-viet-nam).
export interface LeHoi {
  id: string;
  ten: string;
  ten_en: string;
  ten_zh: string;
  mo_ta: string;
  mo_ta_en: string;
  mo_ta_zh: string;
  /** "lunar" (ngày âm cố định), "solar" (ngày dương cố định), "theo-nam" (ban tổ chức công bố từng năm). */
  loai_ngay: string;
  loai_ngay_chuan: string;
  /** "ngày/tháng" âm, rỗng khi không theo âm lịch. */
  ngay_am: string;
  /** "ngày/tháng" dương, rỗng khi không theo dương lịch. */
  ngay_duong: string;
  ngay_truoc: string;
  ngay_sau: string;
  ngay_nghi_le: string;
  lich_cong_bo: string;
  lich_cong_bo_en: string;
  lich_cong_bo_zh: string;
  muc_do: string;
  nhom: string;
  pham_vi: string;
  can_cu_phan_loai: string;
  ghi_chu: string;
  nguon: string;
}
