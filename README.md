# Pagi Sore Knowledge Hub

Portal staf untuk mencari, mengelola, meninjau, dan melacak versi pengetahuan layanan Pagi Sore Kota Lama Semarang.

## Tech Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4
- Radix UI / shadcn-style components
- React Hook Form + Zod
- Lucide Icons
- Sonner

Data aplikasi disimpan secara lokal di browser menggunakan `localStorage`. Tidak ada database atau environment variable yang diperlukan.

## Menjalankan Lokal

```powershell
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Scripts

```powershell
npm run dev        # development server
npm run lint       # ESLint
npm run typecheck  # TypeScript tanpa emit
npm run build      # production build
npm run start      # production server setelah build
```

## Role dan Data Lokal

Role dapat diganti melalui avatar kanan atas:

- Staf / kasir: baca, cari, dan lapor
- Pemilik konten: buat, edit, dan submit review
- Reviewer: approve, return revision, dan audit
- Admin: akses penuh

Gunakan **Reset data** pada menu avatar untuk mengembalikan data awal. State disimpan dengan key `pagi-sore-kms-v1`.

## Deploy ke Vercel

### Vercel CLI

```powershell
npx vercel
npx vercel --prod
```

Jalankan perintah dari root proyek. Framework Next.js dan build command akan terdeteksi otomatis.

### GitHub + Vercel

1. Buat repository baru di GitHub.
2. Tambahkan remote dan push branch `main`.
3. Import repository di Vercel.
4. Pilih preset **Next.js**. Tidak ada environment variable yang perlu ditambahkan.

## Deploy ke Netlify

Import repository melalui dashboard Netlify. Gunakan build command `npm run build`. Pastikan integrasi Next.js Runtime aktif agar route dinamis seperti `/knowledge/[id]` dan `/knowledge/[id]/history` tetap berjalan.

## Catatan Hosting

Aplikasi menggunakan route Next.js dinamis dan sebaiknya di-deploy ke platform yang mendukung Next.js Runtime, seperti Vercel atau Netlify. Jangan memakai static export murni jika alur pembuatan dan approval pengetahuan harus tetap dapat membuka ID baru yang dibuat saat runtime.
