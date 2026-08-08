/**
 * In-app update log for end users.
 * Prepend a new entry at the top of `UPDATE_LOG` when you ship something
 * users should notice. `APP_UPDATE_ID` always tracks the latest entry id.
 */

export type UpdateEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
};

export const UPDATE_LOG: UpdateEntry[] = [
  {
    id: "2026-08-08-auth-security",
    date: "8 Agu 2026",
    title: "Akun lebih aman",
    body: "Lupa password lewat email, ubah password di Akun, dan verifikasi email (saat diwajibkan). Sesi lama otomatis tidak berlaku setelah reset password.",
  },
  {
    id: "2026-08-08-update-log",
    date: "8 Agu 2026",
    title: "Catatan update di Akun",
    body: "Buka Akun → Update untuk melihat perubahan terbaru. Badge Baru muncul saat ada rilis yang belum kamu baca.",
  },
  {
    id: "2026-08-08-status-draft-posted",
    date: "8 Agu 2026",
    title: "Status lebih sederhana",
    body: "Ide di planner cukup Draft atau Posted. Form edit tidak lagi meminta catatan performa.",
  },
  {
    id: "2026-08-08-multi-niche",
    date: "8 Agu 2026",
    title: "Multi-niche FYP",
    body: "Tren menampilkan semua niche dengan filter. Rekomendasi untukmu mengikuti niche kamu — ubah kapan saja di Akun.",
  },
  {
    id: "2026-08-08-beranda",
    date: "8 Agu 2026",
    title: "Beranda lebih jelas",
    body: "Target minggu ini lebih menonjol, dan Pakai di Tren mengarah ke form planner — bukan ke halaman lain.",
  },
  {
    id: "2026-08-08-dark-mode",
    date: "8 Agu 2026",
    title: "Mode gelap",
    body: "Ganti tema terang/gelap dari ikon di Beranda. Preferensi tersimpan di perangkatmu.",
  },
  {
    id: "2026-08-loading-toast",
    date: "Agu 2026",
    title: "Loading & toast lebih rapi",
    body: "Feedback loading lebih jelas. Toast sukses/gagal dan undo hapus muncul di tengah bawah, aman di atas navigasi HP.",
  },
  {
    id: "2026-08-akun-photo",
    date: "Agu 2026",
    title: "Foto profil Akun",
    body: "Unggah foto profil dari Akun. Pratinjau dan crop sederhana tersedia sebelum disimpan.",
  },
  {
    id: "2026-08-monthly-planner",
    date: "Agu 2026",
    title: "Planner per minggu dalam bulan",
    body: "Pilih Minggu 1–N di dalam bulan, isi slot harian, dan pindahkan ide antar hari dengan drag-and-drop.",
  },
  {
    id: "2026-07-caption-salin",
    date: "Jul 2026",
    title: "Caption & Salin",
    body: "Ambil saran caption/hashtag dari tren, salin sekali ketuk, dan batalkan hapus ide lewat undo toast.",
  },
  {
    id: "2026-07-akun-goal",
    date: "Jul 2026",
    title: "Akun & target mingguan",
    body: "Halaman Akun menampilkan identitasmu. Atur berapa konten per minggu langsung dari preferensi.",
  },
  {
    id: "2026-07-demo-tour",
    date: "Jul 2026",
    title: "Demo tanpa login",
    body: "Coba alur Beranda → Tren → Planner → Akun lewat /demo sebelum daftar.",
  },
];

export const APP_UPDATE_ID = UPDATE_LOG[0]!.id;

export const UPDATE_STORAGE_KEY = "trendplan-seen-update";
