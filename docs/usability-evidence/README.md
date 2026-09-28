# Bukti pembaruan usability Minggu 3

Tangkapan layar `before/` diambil dari build awal, lalu `after/` dari hasil perubahan pada viewport desktop 1440×900 dan HP 390×844. Semua halaman menggunakan data simulasi.

| Temuan Tabel 8 | Sebelum | Sesudah |
| --- | --- | --- |
| T1: pencarian dan filter | `before/t1-pencarian-desktop.png` | `after/t1-pencarian-desktop.png`, `after/t1-pencarian-mobile.png` |
| T5: status dan revisi | `before/t5-status-revisi-desktop.png` | `after/t5-status-revisi-desktop.png`, `after/t5-status-revisi-mobile.png` |
| T3: laporan informasi | `before/t3-laporan-desktop.png` | `after/t3-laporan-desktop.png`, `after/t3-laporan-mobile.png`, `after/t3-konfirmasi-laporan-desktop.png` |

Pemeriksaan browser pada `scripts/verify-flows.cjs` menelusuri T1–T5 di desktop dan HP, termasuk pencarian, detail dan riwayat, laporan, tanggal promo, serta kembalikan → edit pengajuan sama → kirim ulang → setujui. Nomor laporan dan status tersimpan di browser pada sesi prototipe. Build, lint, dan typecheck dijalankan setelah perubahan.
