

# Aplikasi Pemendek Link - Multi Tenant (Per User)

## Ringkasan
Aplikasi pemendek link minimalis di mana setiap user yang terdaftar memiliki dashboard sendiri untuk membuat dan mengelola short link mereka. Desain clean dan fungsional.

## Halaman & Fitur

### 1. Landing Page
- Hero section dengan penjelasan singkat tentang layanan
- Form coba pemendek link (tanpa login, redirect ke signup)
- Tombol Login / Register

### 2. Autentikasi
- Halaman Login (email + password)
- Halaman Register (email + password)
- Setiap user otomatis mendapat profil saat mendaftar

### 3. Dashboard User
- Daftar semua short link milik user dalam bentuk tabel
- Informasi: URL asli, short code, jumlah klik, tanggal dibuat
- Tombol salin short link ke clipboard
- Tombol hapus link
- Form buat short link baru (input URL panjang, otomatis generate short code)

### 4. Redirect
- Saat seseorang mengakses short link, sistem mencarikan URL asli dan redirect
- Setiap kunjungan dicatat untuk menambah jumlah klik

## Backend (Lovable Cloud / Supabase)
- **Tabel `profiles`**: menyimpan data user
- **Tabel `links`**: menyimpan short link (user_id, original_url, short_code, click_count, created_at)
- **Edge Function**: menangani redirect dan pencatatan klik
- **RLS Policy**: setiap user hanya bisa melihat dan mengelola link milik sendiri

## Desain
- Minimalis & clean, warna netral
- Fokus pada kemudahan penggunaan
- Responsive untuk mobile dan desktop

