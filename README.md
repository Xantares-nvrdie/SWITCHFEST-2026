# 🛡️ TenderSeal

**TenderSeal** adalah platform e-Procurement (Lelang Pengadaan) berbasis *Blockchain* tingkat lanjut yang memecahkan masalah korupsi, manipulasi tender, dan kolusi melalui teknologi kriptografi *Zero-Knowledge* dan pola keamanan *Commit-Reveal Scheme*.

Dibangun khusus untuk kompetisi Hackathon 2026, aplikasi ini memastikan bahwa tidak ada satu pun pihak (bahkan Pemilik Server / Admin sekalipun) yang dapat mengintip nilai penawaran (bid) peserta sebelum batas waktu lelang (*Commit Deadline*) berakhir.

---

## ✨ Fitur Utama

1. **Cryptographic Commit-Reveal Scheme 🔐**
   Vendor mengirimkan *Sealed Bid* berupa *Commitment Hash*. File penawaran dan angka harga dienkripsi **langsung di browser (Client-Side)** menggunakan AES-GCM 256-bit dan kunci turunan Argon2id (dari Secret PIN vendor). Data asli baru dapat dibuka (*Reveal*) setelah batas waktu habis.
   
2. **Hybrid Blockchain Integration ⛓️**
   TenderSeal berintegrasi dengan jaringan Blockchain (EVM) via *Smart Contract*. Status Tender dan *Commitment Hash* dari setiap penawaran dicatat secara permanen (*immutable*) di dalam *ledger* Blockchain untuk diaudit oleh publik.

3. **Client-Side Zero-Knowledge Encryption 👁️‍🗨️**
   File sensitif (seperti dokumen proposal harga) dienkripsi sepenuhnya di perangkat pengguna sebelum dikirim ke infrastruktur *Cloud Storage* (Supabase). Server TenderSeal murni bertindak sebagai "Relayer" tanpa pernah memegang kunci dekripsi.

4. **Scoring Engine yang Adil & Transparan 📊**
   Sistem secara otomatis mengalkulasi metrik pemenang berdasarkan formula gabungan (Harga Terendah, Bobot Kualitas Tertinggi, dsb.) setelah tahap dekripsi massal selesai. Log Audit bersifat publik dan tidak dapat diubah (Tersimpan di On-Chain).

5. **Role-Based Access Control (RBAC) 👥**
   - **System Admin**: Hak penuh mengelola *Audit Trail* dan menyetujui verifikasi *Vendor/Organisasi*.
   - **Procurement Officer**: Bisa membuat Tender, mengatur kriteria penilaian, dan menyetujui pemenang.
   - **Vendor**: Bisa mengirim penawaran (*Submit Sealed Bid*) dan membuka enkripsi penawarannya (*Reveal*).

---

## 💻 Tech Stack (Teknologi yang Digunakan)

- **Frontend & UI**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons. (Mendukung Tampilan Desain Modern "Apple-like Glassmorphism").
- **Backend**: ElysiaJS (High-Performance Bun Framework).
- **Authentication**: Better-Auth (Full-featured Auth dengan dukungan RBAC).
- **Database**: PostgreSQL dengan Drizzle ORM.
- **Storage**: Supabase Storage (Disandingkan dengan Client-Side Encryption).
- **Blockchain / Web3**: Ethers.js, Solidity (EVM Compatible Smart Contracts).
- **Cryptography**: Web Crypto API (AES-GCM, SHA-256), Argon2id KDF.

---

## 🚀 Panduan Instalasi (Untuk Juri / Pengembang)

TenderSeal dirancang untuk dijalankan di ekosistem **Bun**.

### 1. Persiapan
Pastikan Anda sudah menginstal:
- [Bun](https://bun.sh/) (Runtime & Package Manager)
- PostgreSQL (Jalan secara lokal atau menggunakan URL Database *Cloud* seperti Supabase/Neon).

### 2. Kloning Repositori
```bash
git clone https://github.com/your-username/TenderSeal.git
cd TenderSeal
```

### 3. Instalasi Dependensi
```bash
bun install
```

### 4. Konfigurasi Environment Variables
Buat file `.env` di direktori utama, dan salin variabel-variabel penting (seperti kredensial DB, Supabase URL & Key, Web3 RPC URL, dll.) dari `.env.example`.

### 5. Push Skema Database
Sistem menggunakan Drizzle ORM untuk manajemen skema.
```bash
bunx drizzle-kit push
```

### 6. Jalankan Server Dev
Jalankan aplikasi (menjalankan Frontend Next.js dan Backend Elysia secara simultan menggunakan Bun):
```bash
bun run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🧪 Skenario Pengujian (Untuk Juri)

Untuk mencoba *flow* penuh TenderSeal secara lokal, ikuti langkah berikut:

1. **Buat Akun System Admin** (Daftar biasa, lalu ubah kolom `role` menjadi `admin` di Database tabel `users`).
2. **Daftarkan Organisasi Procurement**: Buat organisasi (misal: "Kementerian PUPR") lewat akun baru dan pastikan System Admin memverifikasi (Approve) organisasi tersebut di menu Admin.
3. **Buat Tender**: *Procurement Officer* di organisasi tersebut login dan menekan tombol **"Buat Tender Baru"**. Tentukan field form yang wajib dan metode penilaiannya. Publish ke Blockchain (Status menjadi `OPEN`).
4. **Registrasi Vendor**: Gunakan Browser / Incognito terpisah, buat 2 akun Vendor (Misal: "PT Karya Bangsa" dan "PT Maju Mundur"). Lakukan setup profil dan pastikan akun terhubung dengan "Wallet Address".
5. **Submit Sealed Bid**: Vendor masuk ke detail Tender, mengisi form penawaran beserta **Secret PIN Enkripsi**. (Coba tes kehebatan UI: Vendor bisa melihat penawaran mereka terenkripsi lewat Riwayat Bid).
6. **Tunggu Commit Deadline**: Ubah batas waktu di *database* agar seolah-olah sudah kedaluwarsa, atau tunggu sampai waktu habis. (Status: `SCORING`).
7. **Fase Reveal**: Vendor wajib men-submit PIN rahasianya agar server bisa mendekripsi, mencocokkan hash, dan memvalidasi keaslian datanya.
8. **Finalisasi & Audit Trail**: *Procurement Officer* mengakhiri tender. Pemenang diumumkan secara transparan di tab **Audit Log**, di mana seluruh publik bisa melihat alasan penilaian matematisnya secara terbuka!

---

*Dibangun dengan dedikasi tinggi untuk Transparansi. Code with 💙.*
