# User story: Buat ide sendiri di planner

**Bahasa:** Sebagai creator yang sudah login, saya ingin membuat ide konten sendiri di hari kosong agar bisa merencanakan post yang tidak ada di daftar tren.

**English:** As a signed-in creator, I want to create my own content idea on an empty day so I can plan posts that are not in the trend list.

## Konteks

Week plan sudah dibuat otomatis lewat `getOrCreateWeekPlan`. Sebelumnya hari kosong hanya mengarah ke `/rekomendasi`, sehingga user tidak bisa menambah ide custom tanpa memilih tren.

## Acceptance criteria

- Slot hari kosong menampilkan aksi **"+ Buat ide"** (mobile & desktop) menuju `/planner/new?day=N`.
- Halaman `/planner/new` berjudul **"Buat ide"** dengan field: **Hari** (select, default dari `?day`), **Judul** (wajib), **Hook** (opsional).
- Status item baru selalu `IDE`; tanpa trend, caption, atau hashtag pada layar buat.
- Validasi: judul kosong → "Judul wajib diisi."; hari sudah terisi → "Hari itu sudah ada ide — pilih hari lain." (tetap di form).
- Sukses buat → toast "Ide ditambahkan ke planner." lalu diarahkan ke `/planner` sehingga kartu baru terlihat.
- Setelah **Simpan** di `/planner/[id]` → toast "Perubahan disimpan." lalu diarahkan ke `/planner` agar board memperlihatkan perubahan status/judul.
- Hanya user login; `/planner/new` tetap di-gate oleh layout `(app)` (guest → `/login`).

## Out of scope

- Pemilih minggu lain (multi-week).
- Membuat ide via drag-and-drop.
- Membuat ide tanpa login (guest).
- Edit caption/hashtag di layar buat (tetap di halaman detail).
