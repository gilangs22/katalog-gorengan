# Katalog Gorengan Project Context

Website katalog jual beli gorengan dan menu kukus untuk Bakul Gorengan.

## Stack

- Express di `index.js` untuk API produk dan upload gambar.
- Frontend statis di `public/`.
- Admin dashboard di `admin/`.
- Supabase untuk tabel `products` dan Storage bucket `katalog-gorengan`.
- Vercel untuk hosting frontend dan backend Express.

## Produk

Kategori utama:

- `goreng`
- `kukus`

Data produk tersimpan di tabel `products`. Detail tambahan makanan seperti isian, tekstur, kemasan, dan estimasi siap disimpan di kolom `specs` JSONB.

## Environment Variables

Variabel yang dibutuhkan di Vercel:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `API_ADMIN_PASSWORD`
