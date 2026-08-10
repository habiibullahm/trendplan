/**
 * In-app update log for end users.
 * When you ship a noticeable change (version level-up):
 * 1. Bump `package.json` `"version"` (APP_VERSION is derived from it).
 * 2. Prepend entries at the top of `UPDATE_LOG` with that `version`.
 * The "Baru" badge keys off `APP_VERSION` (localStorage).
 */

import packageJson from "../../package.json";

export type UpdateEntry = {
  id: string;
  /** Semver of the release that shipped this note (usually === APP_VERSION). */
  version: string;
  date: string;
  title: string;
  body: string;
};

/** Single source of truth: package.json `"version"`. */
export const APP_VERSION = packageJson.version;

export const UPDATE_LOG: UpdateEntry[] = [
  {
    id: "2026-08-11-planner-aktivitas",
    version: "0.3.0",
    date: "11 Agu 2026",
    title: "Tab Aktivitas di Plan",
    body: "Di Plan, pilih Konten atau Aktivitas. Catat banyak kegiatan harian (bisa beberapa baris sekaligus) terpisah dari slot ide konten.",
  },
  {
    id: "2026-08-11-action-hover",
    version: "0.3.0",
    date: "11 Agu 2026",
    title: "Hover aksi lebih jelas",
    body: "Tombol, chip, navigasi, dan pintasan memberi umpan balik hover yang konsisten. Status Draft/Posted di grid Plan sejajar di samping nama hari.",
  },
  {
    id: "2026-08-11-send-feedback",
    version: "0.2.0",
    date: "11 Agu 2026",
    title: "Kirim masukan dari Akun",
    body: "Sampaikan saran, bug, atau catatan lain lewat Akun → Masukan. Pesanmu tersimpan agar tim bisa meninjau.",
  },
  {
    id: "2026-08-10-web-push-reminders",
    version: "0.2.0",
    date: "10 Agu 2026",
    title: "Pengingat plan via Web Push",
    body: "Aktifkan di Akun → Pengingat plan. Notifikasi H-1 jam 20:00 WIB dan kabar update aplikasi memakai satu izin browser.",
  },
  {
    id: "2026-08-09-loading-skeletons",
    version: "0.1.0",
    date: "9 Agu 2026",
    title: "Loading halaman lebih jelas",
    body: "Saat pindah tab aplikasi, skeleton mengikuti layout halaman (Beranda, Planner, Tren, dan lainnya) supaya navigasi terasa lebih responsif.",
  },
  {
    id: "2026-08-08-auth-security",
    version: "0.1.0",
    date: "8 Agu 2026",
    title: "Akun lebih aman",
    body: "Ubah password di Akun. Lupa password & verifikasi email via Resend tersedia setelah domain pengirim siap. Sesi lama otomatis tidak berlaku setelah reset password.",
  },
  {
    id: "2026-08-08-update-log",
    version: "0.1.0",
    date: "8 Agu 2026",
    title: "Catatan update di Akun",
    body: "Buka Akun → Update untuk melihat perubahan terbaru. Badge Baru muncul saat ada rilis yang belum kamu baca.",
  },
  {
    id: "2026-08-08-status-draft-posted",
    version: "0.1.0",
    date: "8 Agu 2026",
    title: "Status lebih sederhana",
    body: "Ide di planner cukup Draft atau Posted. Form edit tidak lagi meminta catatan performa.",
  },
  {
    id: "2026-08-08-multi-niche",
    version: "0.1.0",
    date: "8 Agu 2026",
    title: "Multi-niche FYP",
    body: "Tren menampilkan semua niche dengan filter. Rekomendasi untukmu mengikuti niche kamu — ubah kapan saja di Akun.",
  },
  {
    id: "2026-08-08-beranda",
    version: "0.1.0",
    date: "8 Agu 2026",
    title: "Beranda lebih jelas",
    body: "Target minggu ini lebih menonjol, dan Pakai di Tren mengarah ke form planner — bukan ke halaman lain.",
  },
  {
    id: "2026-08-08-dark-mode",
    version: "0.1.0",
    date: "8 Agu 2026",
    title: "Mode gelap",
    body: "Ganti tema terang/gelap dari ikon di Beranda. Preferensi tersimpan di perangkatmu.",
  },
  {
    id: "2026-08-loading-toast",
    version: "0.1.0",
    date: "Agu 2026",
    title: "Loading & toast lebih rapi",
    body: "Feedback loading lebih jelas. Toast sukses/gagal dan undo hapus muncul di tengah bawah, aman di atas navigasi HP.",
  },
  {
    id: "2026-08-akun-photo",
    version: "0.1.0",
    date: "Agu 2026",
    title: "Foto profil Akun",
    body: "Unggah foto profil dari Akun. Pratinjau dan crop sederhana tersedia sebelum disimpan.",
  },
  {
    id: "2026-08-monthly-planner",
    version: "0.1.0",
    date: "Agu 2026",
    title: "Planner per minggu dalam bulan",
    body: "Pilih Minggu 1–N di dalam bulan, isi slot harian, dan pindahkan ide antar hari dengan drag-and-drop.",
  },
  {
    id: "2026-07-caption-salin",
    version: "0.1.0",
    date: "Jul 2026",
    title: "Caption & Salin",
    body: "Ambil saran caption/hashtag dari tren, salin sekali ketuk, dan batalkan hapus ide lewat undo toast.",
  },
  {
    id: "2026-07-akun-goal",
    version: "0.1.0",
    date: "Jul 2026",
    title: "Akun & target mingguan",
    body: "Halaman Akun menampilkan identitasmu. Atur berapa konten per minggu langsung dari preferensi.",
  },
  {
    id: "2026-07-demo-tour",
    version: "0.1.0",
    date: "Jul 2026",
    title: "Demo tanpa login",
    body: "Coba alur Beranda → Tren → Planner → Akun lewat /demo sebelum daftar.",
  },
];

/** Latest changelog entry id (for references / tests). */
export const APP_UPDATE_ID = UPDATE_LOG[0]!.id;

/** localStorage key for the last-seen app version ("Baru" badge). */
export const UPDATE_STORAGE_KEY = "trendplan-seen-update-version";
