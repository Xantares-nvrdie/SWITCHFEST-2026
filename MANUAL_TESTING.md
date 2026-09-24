# 🧪 TenderSeal - Manual Testing Checklist

Gunakan dokumen ini sebagai panduan untuk melakukan *manual testing* (UAT) guna memastikan seluruh alur dan *edge cases* sistem berfungsi dengan benar.

## 🔐 1. Autentikasi & Akun
- [ ] **Register Akun Baru**: Berhasil mendaftar menggunakan email & password.
- [ ] **Validasi Form Register**: Menolak email yang sudah terdaftar, atau format password yang terlalu lemah (jika ada validasi).
- [ ] **Login Akun**: Berhasil login dengan kredensial yang benar.
- [ ] **Login Error**: Menampilkan pesan error saat email/password salah.
- [ ] **Logout**: Sesi terhapus dan pengguna diarahkan ke halaman utama/login.
- [ ] **Akses Halaman Tanpa Login**: Halaman terproteksi (seperti dashboard atau tender) akan *redirect* ke halaman login jika diakses langsung dari URL.

## 🏢 2. Pendaftaran & Persetujuan Organisasi
- [ ] **Buat Organisasi (Buyer)**: User berhasil membuat organisasi bertipe *BUYER*.
- [ ] **Buat Organisasi (Vendor)**: User berhasil membuat organisasi bertipe *VENDOR*.
- [ ] **Buat Organisasi (Both)**: User berhasil membuat organisasi bertipe *BOTH*.
- [ ] **Status Awal (Pending)**: Organisasi yang baru dibuat masuk ke status *PENDING* dan belum bisa bertransaksi penuh.
- [ ] **Admin System (Approve)**: Admin Sistem berhasil memberikan *Approve* (Setujui) dari halaman Admin Approval.
- [ ] **Admin System (Reject)**: Admin Sistem berhasil memberikan *Reject* (Tolak) beserta Alasan Penolakan dari halaman Admin Approval.
- [ ] **Tampilan Organisasi Ditolak**: Di halaman Manage Organisasi, User melihat *Banner Penolakan* dan semua form profil *disabled* (tidak bisa diedit).

## 🎟️ 3. Manajemen Tim & Kode Undangan (Organisasi)
- [ ] **Edit Profil**: Organization Admin berhasil mengubah data perusahaan (telepon, alamat, wallet EVM) **hanya jika** organisasi belum ditolak.
- [ ] **Generate Kode Undangan**: Admin berhasil membuat *Invite Code* dengan role tertentu (misal: AUDITOR).
- [ ] **Generate Kode (Limit Penggunaan)**: Admin berhasil membuat kode yang hanya bisa dipakai 1 kali.
- [ ] **Generate Kode (Kedaluwarsa)**: Admin berhasil membuat kode dengan batas masa berlaku (misal 1 hari).
- [ ] **Join via Kode (Berhasil)**: User lain berhasil *join* ke organisasi menggunakan kode undangan yang valid.
- [ ] **Join via Kode (Limit Habis)**: Sistem menolak User *join* ketika kode dengan limit (misal: 1) sudah pernah dipakai.
- [ ] **Join via Kode (Expired)**: Sistem menolak User *join* jika *invite code* sudah melewati batas waktu.
- [ ] **Revoke Kode**: Admin berhasil mencabut (Revoke) kode yang masih aktif, lalu memastikan kode tersebut **tidak bisa** digunakan lagi oleh siapapun.
- [ ] **Ubah Role Member**: Admin berhasil mengubah role member (misal dari MEMBER menjadi PROCUREMENT_OFFICER).
- [ ] **Suspend Member**: Admin berhasil *Suspend* anggota, memastikan anggota tersebut kehilangan hak akses operasional di dalam organisasi.

## 🛡️ 4. Hak Akses (Role-Based Access Control)
- [ ] **Admin Organisasi**: Bisa mengakses tab "Kode Undangan" dan "Anggota Tim" untuk edit/suspend.
- [ ] **Procurement Officer**: Bisa membuat tender (jika Buyer) atau menawar tender (jika Vendor), tapi **tidak bisa** membuat kode undangan.
- [ ] **Auditor**: Bisa melihat detail tender dan bids, namun tombol-tombol aksi (Create Tender, Submit Bid, dll) tidak muncul atau diblokir sistem.
- [ ] **Member Biasa**: Akses hanya sebatas melihat data umum tanpa wewenang manajerial.

## 📄 5. Pembuatan & Manajemen Tender
- [ ] **Create Tender (Hanya Buyer/Both)**: Akun dari organisasi *VENDOR* murni seharusnya **tidak bisa** melihat opsi membuat Tender.
- [ ] **Validasi Create Tender**: Form menolak jika tanggal penutupan (closing date) lebih awal dari hari ini.
- [ ] **Publish Tender**: Tender yang sukses dibuat akan masuk ke daftar tender aktif.
- [ ] **Visibility (Public vs Private)**: Tender *Public* bisa dilihat semua organisasi. Tender *Private/Invited* hanya bisa dilihat oleh vendor yang diundang.

## 📦 6. Sealed Bidding & Kriptografi
- [ ] **Submit Bid**: Vendor berhasil submit harga penawaran.
- [ ] **Sealed Bid (Tersembunyi)**: Nilai tawaran tidak bisa dilihat oleh panitia (Buyer) sebelum masa *Reveal* tiba.
- [ ] **Validasi Waktu Bidding**: Vendor tidak bisa *submit bid* lagi ketika masa pengumpulan (*submission deadline*) sudah lewat.
- [ ] **Unseal / Reveal Phase**: Saat masa *reveal*, panitia (atau sistem) dapat membuka enkripsi bid dan memverifikasinya (serta mencocokkan *hash* jika menggunakan sistem commit-reveal).

## 📊 7. Pengumuman & Audit
- [ ] **Skoring & Winner**: Sistem berhasil menghitung/memilih pemenang tender berdasarkan kriteria.
- [ ] **Audit Trail**: Aktivitas kritikal (seperti pembuatan tender, submit bid, dan penentuan pemenang) tercatat rapi di log untuk dilihat oleh *Auditor*.
