# Partner week share

## Story

Sebagai creator, saya ingin mengundang **satu partner** ke minggu planner saya supaya kami bisa menyusun konten dan aktivitas bersama.

Sebagai partner yang diundang, saya ingin menerima tautan undangan dan langsung melihat serta mengedit board minggu yang sama.

Sebagai owner, saya ingin mencabut akses atau membatalkan undangan kapan saja.

## Acceptance criteria

- Planner content tab shows **Bagikan** next to Salin daftar; when shared, chip becomes **Bareng {name}**.
- Share modal supports: Salin tautan undangan, optional Kirim email (when transactional mail enabled), pending state, Cabut akses / Keluar dari plan.
- Invite link: `/invite/week?token=…`, TTL 7 days; regenerating revokes prior unused invites.
- At most **one** active partner per `WeekPlan`.
- Partner and owner can edit content + aktivitas on the shared week.
- While membership is active for a `weekStart`, the partner UI prefers the shared week over a personal week for that same calendar week.
- Demo planner shows disabled **Bagikan**.

## Out of scope

Team seats/roles, multi-partner, realtime presence, single-day share, public unauthenticated boards, always-share future weeks.
