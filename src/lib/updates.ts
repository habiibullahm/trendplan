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
    id: "2026-08-29-admin-feedback-reply",
    version: "0.4.31",
    date: "29 Agu 2026",
    title: "Balas masukan dari inbox admin",
    body: "Owner bisa membalas masukan di Lihat masukan. Balasan tersimpan di inbox dan dikirim ke email pengirim (kalau email transaksi aktif).",
  },
  {
    id: "2026-08-29-day-dates-on-boards",
    version: "0.4.30",
    date: "29 Agu 2026",
    title: "Tanggal di tiap hari Plan dan Aktivitas",
    body: "Header hari di papan Konten, daftar Aktivitas, dan pilihan hari Pakai di Tren/Rekomendasi menampilkan tanggal (mis. Sen · 24 Agu).",
  },
  {
    id: "2026-08-23-caption-human-talk",
    version: "0.4.29",
    date: "23 Agu 2026",
    title: "Saran caption lebih seperti orang ngetik",
    body: "Pakai dan Bantu AI mengisi caption dari satu momen konkret, bukan slogan atau ringkasan ide. Hashtag mengikuti isi ide, bukan niche akun yang tidak nyambung.",
  },
  {
    id: "2026-08-23-acl-recovery-niche",
    version: "0.4.28",
    date: "23 Agu 2026",
    title: "Niche ACL Recovery di Tren",
    body: "Pilih ACL Recovery di onboarding atau Akun. Katalog ide rehab lutut (bukan nasihat medis) muncul di Tren dan Rekomendasi. Cek dulu dengan fisioterapis sebelum meniru gerakan.",
  },
  {
    id: "2026-08-23-caption-creator-voice",
    version: "0.4.27",
    date: "23 Agu 2026",
    title: "Saran caption lebih seperti TikTok",
    body: "Bantu AI menulis caption seperti creator di feed: hook di depan, singkat, bahasa konten—bukan gaya ngobrol chat.",
  },
  {
    id: "2026-08-23-planner-seed-ideas",
    version: "0.4.26",
    date: "23 Agu 2026",
    title: "Ide Tren lebih bisa dipakai di Plan",
    body: "Katalog Couple, Tech, dan Food diisi ulang: judul, hook, dan alasan mengarah ke slot minggu, bukan klaim FYP. Demo ikut ide yang sama.",
  },
  {
    id: "2026-08-23-honest-tren-catalog",
    version: "0.4.25",
    date: "23 Agu 2026",
    title: "Kartu Tren hanya ide dan poster",
    body: "Katalog Tren menampilkan poster, judul, hook, alasan, dan format. Tidak ada klip, suara, atau skor. Pakai tetap mengisi hari di Plan.",
  },
  {
    id: "2026-08-23-akun-plan-roundtrips",
    version: "0.4.24",
    date: "23 Agu 2026",
    title: "Akun dan Plan lebih ringan saat kembali",
    body: "Buka Akun lagi tidak selalu unduh profil dari awal. Dari Beranda, Plan dan detail ide tidak dimuat sebelum diketuk. Hapus ide tidak memuat ulang Riwayat.",
  },
  {
    id: "2026-08-23-planner-rsc-toast",
    version: "0.4.23",
    date: "23 Agu 2026",
    title: "Plan tidak muat ulang setelah simpan",
    body: "Setelah simpan ide atau pindah tab Plan, papan tidak diunduh ulang hanya untuk menghapus notifikasi. Daftar hari tidak memuat halaman detail sebelum diketuk.",
  },
  {
    id: "2026-08-23-tren-filter-inp",
    version: "0.4.22",
    date: "23 Agu 2026",
    title: "Filter Tren dan tab lebih gesit",
    body: "Ganti niche di Tren langsung terasa, tanpa animasi daftar. Tab yang terlihat di layar disiapkan lebih dulu supaya ketukan berikutnya lebih cepat.",
  },
  {
    id: "2026-08-23-tab-nav-cache",
    version: "0.4.21",
    date: "23 Agu 2026",
    title: "Pindah tab lebih ringan",
    body: "Beranda tidak lagi menampilkan kerangka layar dua kali. Ganti tab tidak memuat ulang data yang baru saja dibuka.",
  },
  {
    id: "2026-08-23-honest-tren-cards",
    version: "0.4.20",
    date: "23 Agu 2026",
    title: "Kartu Tren jadi daftar ide",
    body: "Kartu Tren dan Rekomendasi menampilkan ide (poster, judul, alasan, format) lalu Pakai ke hari. Teaser Beranda cukup judul dan format. Bukan pemutar video.",
  },
  {
    id: "2026-08-22-planner-link-pending",
    version: "0.4.19",
    date: "22 Agu 2026",
    title: "Indikator saat ganti minggu di Plan",
    body: "Ketuk tab, minggu, atau bulan di Plan, chip yang dipilih menampilkan Memuat sampai papan baru tampil. Navigasi tetap tautan biasa, tanpa spinner di seluruh layar.",
  },
  {
    id: "2026-08-22-planner-js-idle",
    version: "0.4.19",
    date: "22 Agu 2026",
    title: "Plan lebih ringan saat dibuka",
    body: "Papan minggu tampil dulu; geser ide siap setelah papan tenang. Saran ide terbuka saat diketuk, bukan saat halaman baru dimuat.",
  },
  {
    id: "2026-08-22-beranda-lcp-halo",
    version: "0.4.19",
    date: "22 Agu 2026",
    title: "Halo Beranda muncul lebih dulu",
    body: "Judul Halo di Beranda tampil dari sesi tanpa menunggu data minggu. Hurufnya sama dengan teks biasa supaya layar utama terasa lebih cepat.",
  },
  {
    id: "2026-08-22-feedback-detail-wrap",
    version: "0.4.18",
    date: "22 Agu 2026",
    title: "Detail masukan tidak timpa teks",
    body: "Di popup Detail masukan, kategori, tanggal, isi pesan, dan email tampil berbaris rapi dan bisa di-scroll jika panjang, tanpa saling menutupi judul.",
  },
  {
    id: "2026-08-22-admin-feedback-rsc",
    version: "0.4.18",
    date: "22 Agu 2026",
    title: "Daftar masukan lebih rapi",
    body: "Judul dan daftar masukan admin tidak saling timpa. Filter tampil dulu; isi menyusul. Skeleton muncul saat membuka dari Akun.",
  },
  {
    id: "2026-08-21-aktivitas-loading",
    version: "0.4.17",
    date: "21 Agu 2026",
    title: "Skeleton saat buka aktivitas",
    body: "Saat membuka edit atau buat aktivitas, muncul kerangka form dulu (bukan skeleton papan Plan) supaya layar tidak kosong saat halaman masih dimuat.",
  },
  {
    id: "2026-08-21-plan-detail-perf",
    version: "0.4.16",
    date: "21 Agu 2026",
    title: "Plan dan detail ide lebih ringan",
    body: "Buka detail ide dan kembali ke Plan terasa lebih cepat. Papan Plan muncul dulu; saran ide untuk hari kosong menyusul. Menyimpan atau menghapus ide tidak lagi menyegarkan Tren/Rekomendasi tanpa perlu.",
  },
  {
    id: "2026-08-21-beranda-stream-cache",
    version: "0.4.15",
    date: "21 Agu 2026",
    title: "Beranda lebih cepat saat dibuka ulang",
    body: "Halo muncul dulu, ringkasan minggu dan rekomendasi menyusul. Data minggu di-cache singkat supaya pindah tab ke Beranda terasa lebih ringan.",
  },
  {
    id: "2026-08-21-nav-first-load-warm",
    version: "0.4.14",
    date: "21 Agu 2026",
    title: "Beranda dan navigasi lebih ringan",
    body: "Beranda memuat plan minggu dengan query lebih ramping dan paralel. Skeleton app muncul lebih cepat saat pindah tab, dan Akun menampilkan profil dulu sebelum pengingat push.",
  },
  {
    id: "2026-08-21-beranda-posted-empty",
    version: "0.4.13",
    date: "21 Agu 2026",
    title: "Beranda bedakan minggu kosong vs Posted",
    body: "Kalau semua ide minggu ini sudah Posted, Beranda tidak lagi bilang “belum ada ide”. Tetap ada Buka Plan, plus tautan ke Riwayat.",
  },
  {
    id: "2026-08-18-empty-slot-saran-ide",
    version: "0.4.12",
    date: "21 Agu 2026",
    title: "Saran ide untuk hari kosong",
    body: "Di Plan, hari kosong punya Saran ide: 1–2 tren yang belum kamu pakai minggu ini. Pilih hari, lalu Pakai — caption tetap lewat Bantu AI di detail. Bukan riset FYP live.",
  },
  {
    id: "2026-08-18-bantu-ai-coachmark",
    version: "0.4.11",
    date: "21 Agu 2026",
    title: "Petunjuk Bantu AI",
    body: "Pertama kali buka detail ide, ada petunjuk singkat di tombol Bantu AI. Isi caption dan hashtag dari ide/tren kamu — tetap bisa diedit. Petunjuk tidak muncul lagi setelah Mengerti.",
  },
  {
    id: "2026-08-18-beranda-buka-plan",
    version: "0.4.10",
    date: "21 Agu 2026",
    title: "Beranda arahkan ke plan kosong",
    body: "Kalau minggu ini belum ada ide, Beranda tetap tampilkan Buka Plan supaya kamu langsung isi slot (dari Tren atau buat ide sendiri).",
  },
  {
    id: "2026-08-21-logout-fix",
    version: "0.4.9",
    date: "21 Agu 2026",
    title: "Keluar akun kembali andal",
    body: "Tombol Keluar dan sesi yang sudah tidak valid sekarang membersihkan cookie dengan benar, jadi kamu tidak tertahan di Beranda seolah masih masuk.",
  },
  {
    id: "2026-08-21-planner-drag-handle",
    version: "0.4.8",
    date: "21 Agu 2026",
    title: "Geser ide lewat ikon kiri",
    body: "Di Plan, seret ide lewat ikon kecil di kiri kartu. Ketuk judul tetap buka detail tanpa ikut terseret.",
  },
  {
    id: "2026-08-21-auth-planner-rtt",
    version: "0.4.7",
    date: "21 Agu 2026",
    title: "Masuk dan Plan lebih responsif",
    body: "Login dan keluar akun lebih ringan, dan pindah minggu/tab di Plan memuat data secara bersamaan supaya terasa lebih cepat.",
  },
  {
    id: "2026-08-21-tren-lcp",
    version: "0.4.6",
    date: "21 Agu 2026",
    title: "Tren lebih cepat tampil",
    body: "Kartu tren di atas layar langsung terlihat (cover dan judul), tanpa menunggu animasi atau unduhan video.",
  },
  {
    id: "2026-08-21-soft-nav-ttfb",
    version: "0.4.5",
    date: "21 Agu 2026",
    title: "Pindah halaman lebih ringan",
    body: "Navigasi antar Dashboard, Plan, Tren, dan Akun terasa lebih cepat karena data minggu dan sesi dimuat dengan lebih sedikit round-trip.",
  },
  {
    id: "2026-08-20-planner-load-performance",
    version: "0.4.4",
    date: "20 Agu 2026",
    title: "Plan lebih cepat terbuka",
    body: "Halaman Plan menampilkan grid lebih dulu; geser-ide dan bagikan minggu dimuat setelahnya supaya loading terasa lebih ringan.",
  },
  {
    id: "2026-08-20-admin-feedback-inbox",
    version: "0.4.3",
    date: "20 Agu 2026",
    title: "Inbox masukan untuk owner",
    body: "Kalau emailmu ada di daftar owner, Akun punya Lihat masukan: baca saran/bug dari pengguna. Saat email transaksi aktif, owner juga dapat notifikasi email.",
  },
  {
    id: "2026-08-17-plan-saya-bersama",
    version: "0.4.2",
    date: "17 Agu 2026",
    title: "Plan saya & Plan bersama",
    body: "Kalau kamu partner di suatu minggu, ganti tampilan Plan saya (plan milikmu) atau Plan bersama (plan yang dibagikan). Undangan yang diterima membuka Plan bersama dulu.",
  },
  {
    id: "2026-08-16-week-share-invite-guard",
    version: "0.4.1",
    date: "16 Agu 2026",
    title: "Undangan partner lebih aman",
    body: "Tidak bisa mengundang email sendiri. Jika sesi bermasalah saat menerima undangan, muncul pesan jelas (bukan error halaman). Kirim email undangan memberi feedback yang lebih jelas saat gagal.",
  },
  {
    id: "2026-08-16-partner-week-share",
    version: "0.4.0",
    date: "16 Agu 2026",
    title: "Bagikan minggu ke partner",
    body: "Undang satu partner ke minggu Plan lewat tautan (atau email jika aktif). Kalian bisa isi ide dan aktivitas bareng; cabut akses kapan saja.",
  },
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
