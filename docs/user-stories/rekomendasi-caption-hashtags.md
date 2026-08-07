# User story: Rekomendasi konten, caption, hashtags (+ salin)

**Bahasa:** Sebagai creator, saya ingin mendapat rekomendasi konten beserta saran caption dan hashtags, lalu menyalinnya ke TikTok agar posting lebih cepat.

**English:** As a creator, I want content recommendations with suggested caption and hashtags, then copy them for TikTok so I can post faster.

## Acceptance criteria

- Tambah dari Tren/Rekomendasi (atau buat ide sendiri) membuat item dengan **caption draft** (title + hook) dan **hashtags** niche default.
- Di `/planner/[id]`:
  - **Isi saran** mengisi caption + hashtag sekaligus (bisa diedit). Jika field sudah terisi beda dari saran → konfirmasi sebelum menimpa.
  - **Simpan** menyimpan lalu redirect ke planner (`?toast=saved`).
  - Satu tombol **Salin** menyalin teks siap-tempel TikTok dari **nilai field saat ini** (caption + hashtags; fallback title/hook jika caption kosong), toast sukses/error.
- Toast salin memakai id stabil (`planner-copy`) agar klik berulang tidak menumpuk toast.
- **Salin minggu** di `/planner` menyalin daftar hari terisi; minggu kosong → toast error.
- Demo menampilkan contoh saran + satu **Salin** disabled; tanpa memanggil clipboard.

## Out of scope

- Caption dari LLM / API eksternal
- Salin terpisah per field (caption-only / hashtag-only)
- Navigasi minggu lain
- Tren TikTok live
- Ekspor PDF/gambar
