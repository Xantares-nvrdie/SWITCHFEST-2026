# TenderSeal — Front-End Design System

> Dokumen ini adalah panduan desain untuk mengangkat UI TenderSeal dari "sederhana/template" menjadi punya *taste* dan identitas sendiri — tanpa jatuh ke generic AI-slop. Ditulis berdasarkan `TenderSeal_README.md` (produk, alur, role, status) dan 3 referensi visual yang diberikan tim: **nomu.store**, **palmo.co.in**, **warmnfuzzy.tv**.

Cara pakai dokumen ini: Section 1–3 adalah *arahan berpikir* (kenapa kita memilih arah ini). Section 4 ke bawah adalah *token & spec* yang bisa langsung diterjemahkan ke Tailwind config dan komponen. Tim desain/FE sebaiknya baca 1–3 dulu sebelum mulai styling, supaya tiap keputusan visual bisa ditelusuri balik ke alasan produknya — bukan sekadar "kelihatan keren".

---

## 1. Prinsip Desain

### 1.1 Masalah yang sebenarnya kita perbaiki

UI TenderSeal saat ini "sederhana" bukan cuma soal kurang animasi — kemungkinan besar karena visualnya belum mencerminkan **apa yang membuat produk ini berbeda**: ini bukan tender board biasa, ini platform yang menjanjikan *bid Anda tersegel secara kriptografis sampai deadline, dan setiap langkahnya bisa diverifikasi*. Sistem desain baru harus membuat janji itu **terasa**, bukan cuma tertulis di copy.

Jadi *big idea* kita bukan "bikin website tender jadi flashy", tapi: **bikin kerahasiaan, penyegelan, dan verifikasi jadi sesuatu yang bisa dilihat dan dirasakan lewat interaksi.**

### 1.2 Checklist Anti-AI-Slop

Sebelum menambah elemen visual apa pun, cek dulu — kita **hindari** hal-hus berikut karena ini adalah default yang langsung mengkhianati "dibuat AI / template":

| Jangan | Kenapa |
|---|---|
| Background krem hangat (`#F4F1EA`-ish) + serif display + aksen terracotta | Kombinasi paling umum dari output AI generatif saat ini |
| Background nyaris hitam + satu aksen neon hijau/vermillion | Klise "hacker/crypto dashboard" — terlalu generik untuk produk enterprise/pemerintahan |
| Semua card punya radius & shadow abu-abu yang identik ("SaaS card kit") | Membuat hierarki hilang — semua terlihat sama pentingnya |
| Eyebrow label ALL CAPS di atas tiap heading, label "KATA — fragmen" dengan em dash, titik tengah "A · B · C" | Chrome template yang muncul di semua brief tanpa alasan spesifik |
| Panah `→` ditempel di akhir semua tombol/link | Tic templated, tidak menambah makna |
| Fade-slide-up di setiap section saat di-scroll, hover-lift di semua card | Motion "tersebar" tanpa fokus — bandingkan dengan referensi warmnfuzzy yang animasinya besar tapi *sedikit dan tertata* |
| Ilustrasi 3D generic (bola kaca, blob gradient, orang isometrik di depan laptop) | Tidak bermakna apa pun untuk produk ini |
| Angka nomor urut 01/02/03 di section yang bukan sequence | README kita justru **punya sequence asli**: Commit → Sealed → Closed → Reveal → Verify → Scoring → Winner — pakai itu, bukan nomor kosong |

Aturan umum: setiap elemen visual harus bisa dijawab "ini mewakili bagian mana dari sistem TenderSeal?" — kalau jawabannya "biar rame", coret.

### 1.3 Prinsip inti

1. **Satu momen berani, sisanya tenang.** Ambil satu elemen sebagai pusat kejutan visual (hero 3D seal — lihat Section 3), lalu biarkan sisa halaman disiplin dan bersih di sekitarnya.
2. **Tipografi sebagai elemen aktif**, bukan sekadar pembawa teks — headline besar dipakai untuk menyampaikan skala kepercayaan ("Sealed Until Deadline"), bukan hiasan.
3. **Motion yang menjawab aksi, bukan menghias scroll.** Animasi terbaik di produk ini adalah yang terjadi *karena* sesuatu benar-benar terjadi di sistem: bid disegel, deadline lewat, reveal diverifikasi.
4. **Dua bahasa visual, satu identitas.** Marketing site boleh berani & sinematik. Dashboard/produk harus tenang, padat-informasi, cepat dibaca oleh Procurement Officer yang sedang kerja — tapi tetap terasa "dari keluarga yang sama" (lihat Section 5).
5. **Ground di kosakata README**, bukan kosakata desain generik: `SEALED`, `REVEALED_VALID`, `REVEALED_INVALID`, `NOT_REVEALED`, commitment hash, reveal window, dst — ini adalah bahan desain, bukan detail teknis yang disembunyikan.

---

## 2. Insight dari Referensi

Tiga referensi yang diberikan (nomu.store, palmo.co.in, warmnfuzzy.tv) semuanya web **konsumen/kreatif** — bukan tools B2B/enterprise. Itu bagus untuk mencuri *energi* dan *craft*-nya, tapi kita tidak boleh mengadopsi mentah-mentah karena TenderSeal adalah alat kerja untuk uang publik/perusahaan — perlu tetap terasa **tepercaya**, bukan cuma "seru".

Berikut apa yang kita **ambil** dari tiap referensi, dan apa yang kita **tinggalkan**:

### nomu.store
- ✅ **Ambil:** nav pill mengambang dengan rounded besar yang tetap terlihat saat scroll; bento grid card berukuran tidak seragam (card besar untuk fitur utama, kecil untuk sekunder); transisi warna solid penuh saat masuk ke section footer.
- ❌ **Tinggalkan:** wordmark bubble yang playful/kartunis, mascot 3D pink, nada bicara yang santai-banget — TenderSeal butuh nada yang lebih presisi/institusional.

### palmo.co.in
- ✅ **Ambil:** headline raksasa yang **menyatu secara fisik dengan objek 3D** (teks di belakang/mengelilingi objek); transisi antar-section dengan bentuk custom (bukan garis lurus polos); satu warna solid gelap sebagai "napas" di antara section terang.
- ❌ **Tinggalkan:** palet krem+coklat+kuning yang terasa "makanan/organik"; ikon buah playful yang melayang; skor gamifikasi di pojok — tidak relevan untuk konteks procurement.

### warmnfuzzy.tv
- ✅ **Ambil — ini yang paling relevan secara konsep:** overlay ala *design/annotation tool* (kotak seleksi, handle hijau, garis putus-putus, crosshair) yang muncul di atas konten. Untuk warmnfuzzy ini cuma gaya visual agensi kreatif, tapi untuk TenderSeal motif ini **punya makna literal**: presisi, pengukuran, verifikasi — persis apa yang dijanjikan produk (audit trail, commitment hash, verifikasi on-chain). Juga ambil: full-bleed color block yang berganti drastis tiap section, tipografi grotesk bold raksasa, sticker/badge kecil yang ditempel miring.
- ❌ **Tinggalkan:** palet biru elektrik + kuning cerah yang terlalu "agensi kreatif/hip"; nada copy yang sangat casual.

### Kesimpulan arah
Kita pinjam **struktur & craft** (nav pill, bento asimetris, hero 3D menyatu dengan tipografi, color-block section, motif anotasi presisi) tapi ganti **palet & nada** jadi lebih institusional-tepercaya — lihat Section 4.

---

## 3. Big Idea: "The Digital Seal"

Nama produk sudah memberi motif visual yang sempurna: **segel (seal)**. Bukan segel lilin klasik yang dekoratif, tapi reinterpretasi modern — sesuatu di antara *wax seal*, *vault lock*, dan *cryptographic hash* yang mengunci.

**Objek hero 3D**: satu bentuk geometris — segel/kunci digital bergaya minimal (bukan realistis-fotografis seperti kelapa di palmo.co.in, tapi lebih abstrak: facet-facet metalik/keramik gelap dengan retakan garis tipis menyala saat "terbuka") yang:
- Di halaman utama (hero), tampil **tertutup rapat**, dengan headline besar melilit/menyatu di sekitarnya — meniru treatment palmo, tapi objeknya adalah segel, bukan buah.
- Di section "Cara Kerja" (Commit → Sealed → Closed → Reveal → Verify → Winner), objek yang sama **retak terbuka secara bertahap mengikuti scroll** — 1 animasi terikat scroll, bukan 7 animasi terpisah. Ini adalah "satu momen berani" yang disebut di prinsip 1.3.
- Di dalam produk (bukan marketing site), motif yang sama muncul **kecil dan fungsional**: ikon status bid `SEALED` = segel tertutup, `REVEALED_VALID` = segel terbuka + centang, `REVEALED_INVALID` = segel terbuka + retak merah, `NOT_REVEALED` = segel pudar/abu.

Motif kedua yang berjalan berdampingan: **anotasi presisi** dari insight warmnfuzzy — garis putus-putus, crosshair kecil, label koordinat/timestamp, hash terpotong dengan tombol copy. Ini dipakai di audit trail, halaman verifikasi, dan sebagai elemen dekoratif halus di marketing site (bukan di seluruh dashboard, supaya tidak berisik).

---

## 4. Design Tokens

### 4.1 Warna

Base palette sengaja **dingin** (bukan cream hangat klise) dan bertumpu pada satu aksen tajam warna segel-lilin, bukan neon crypto hijau/biru.

```
--color-ink        #14151E   /* dasar gelap: teks utama, section gelap, footer */
--color-paper       #EDEFEF   /* dasar terang: background utama app & marketing */
--color-paper-raised #F7F8F7  /* permukaan card di atas paper, sedikit lebih terang */
--color-seal        #A93324   /* aksen signature: "sealing wax red" — CTA utama, motif segel */
--color-seal-hover   #8F2A1D
--color-verified    #2F6B4F   /* hijau institusional, redup — bukan neon */
--color-gold        #B98A2E   /* aksen sekunder: anchor blockchain / "notarized" */
--color-slate       #5B6472   /* status netral: SEALED / pending */
--color-muted       #9A9488   /* NOT_REVEALED / expired / disabled */
--color-alert       #B23B2E   /* REVEALED_INVALID / error keras (beda dari --color-seal agar tak tertukar makna) */
```

Pemetaan status bid/tender (README Section 11.2) ke warna — **konsisten di seluruh produk**, jangan pakai warna lain untuk status yang sama di halaman berbeda:

| Status | Warna | Ikon motif |
|---|---|---|
| `TENDER OPEN` | `--color-verified` (redup) | segel terbuka, siap diisi |
| `BID SEALED` | `--color-slate` | segel tertutup |
| `TENDER CLOSED` | `--color-ink` | segel tertutup, warna gelap total |
| `REVEALED_VALID` | `--color-verified` | segel terbuka + centang |
| `REVEALED_INVALID` | `--color-alert` | segel terbuka + retak |
| `NOT_REVEALED` | `--color-muted` | segel pudar |

### 4.2 Tipografi

Tiga peran, masing-masing dijustifikasi oleh konten asli produk (bukan dekorasi):

| Peran | Font | Kenapa |
|---|---|---|
| **Display** (hero, headline section, angka besar) | `Cabinet Grotesk` (Fontshare, gratis) | Grotesk tebal dengan karakter — cukup berani untuk headline raksasa ala warmnfuzzy/palmo, tapi tidak se-generik Helvetica/Inter |
| **UI/Body** (paragraf, dashboard, form) | `Switzer` (Fontshare, gratis) | Netral, sangat terbaca di kepadatan data tinggi (tabel tender, form dynamic field) — pengganti Inter yang lebih halus tapi tidak "sok berkarakter" untuk teks kerja |
| **Data/Mono** (hash, wallet address, tender ID, timestamp) | `IBM Plex Mono` | **Dijustifikasi oleh data asli**: commitment hash, tx hash, wallet address literally butuh monospace agar bisa dibandingkan visual. Ini beda dari klise "monospace buat label kecil" karena di sini datanya memang teknis |

Skala tipografi (mobile → desktop, dasarkan Elements of Typographic Style — rasio ~1.25):

```
--text-xs    12px/16px   mono, untuk hash & meta
--text-sm    14px/20px   body kecil, label form
--text-base  16px/26px   body utama
--text-lg    20px/28px   sub-heading dashboard
--text-xl    28px/34px   heading section (app)
--text-2xl   40px/44px   heading section (marketing)
--text-3xl   64px/68px   sub-hero
--text-4xl   96–160px    hero display (responsive clamp, lihat 4.5)
```

Line length: badan teks maksimum ~72–76 karakter. Hindari eyebrow ALL CAPS di atas tiap heading (lihat checklist 1.2) — kalau butuh label kategori, pakai badge kecil dengan warna, bukan teks all-caps polos.

### 4.3 Spacing, Radius, Shadow

Dua sistem radius berbeda untuk dua bahasa visual (lihat Section 5):

```
--radius-marketing-card   28px   /* bento card di landing, terasa "lounge" seperti nomu */
--radius-marketing-pill   999px  /* nav, badge besar */
--radius-app-card         10px   /* card di dashboard — tetap rapi, tidak mengganggu densitas data */
--radius-app-control      8px    /* input, button di dalam app */
```

Shadow: **jangan** satu shadow abu-abu generik ditempel ke semua card (ciri SaaS-kit). Gunakan shadow tipis (`0 1px 2px rgba(20,21,30,.06)`) hanya untuk elemen yang benar-benar mengambang (modal, dropdown, nav sticky). Card biasa cukup dibedakan lewat `--color-paper-raised` + hairline border `1px solid rgba(20,21,30,.08)` — ini juga lebih cocok dengan motif "ledger/dokumen resmi" dibanding shadow melayang.

### 4.4 Motion tokens

```
--ease-seal     cubic-bezier(.22,1,.36,1)   /* untuk momen "buka/tutup segel" — sedikit overshoot, terasa mekanis-presisi */
--ease-standard cubic-bezier(.4,0,.2,1)     /* transisi UI biasa */
--dur-instant   120ms   /* hover, focus */
--dur-fast      220ms   /* toggle, dropdown */
--dur-moment    600ms   /* konfirmasi aksi: bid tersegel, reveal berhasil */
--dur-scroll    scroll-linked, bukan berbasis waktu tetap
```

---

## 5. Dua Bahasa Visual: Marketing Site vs Produk

Ini pembatas penting supaya dashboard tidak jadi lambat/berisik hanya karena landing page-nya sinematik.

```
┌─────────────────────────────┬─────────────────────────────┐
│   MARKETING (public site)    │   PRODUK (app, login-gated)  │
├─────────────────────────────┼─────────────────────────────┤
│ Full-bleed color-block       │ Satu background paper tenang │
│ section, kontras tinggi      │ konsisten                    │
│ Hero 3D segel + scroll story │ Tanpa 3D — ikon segel 2D flat│
│ Tipografi display raksasa    │ Tipografi UI ukuran wajar    │
│ Motion: satu orkestrasi      │ Motion: hanya respon aksi    │
│ besar per section            │ user (submit, reveal, dst)   │
│ Radius besar, card lounge    │ Radius kecil, ledger/table   │
│ Boleh berat (3D bundle)      │ Harus ringan & cepat         │
└─────────────────────────────┴─────────────────────────────┘
```

Keduanya tetap satu keluarga lewat: palet warna sama persis, tipografi display yang sama dipakai untuk heading besar di app (mis. angka statistik dashboard), dan motif segel/status yang konsisten.

---

## 6. Motion & 3D Playbook

### 6.1 Hero: segel yang menyatu dengan tipografi
- Objek 3D segel (facet gelap, garis retak metalik) diletakkan di tengah hero, headline besar "Sealed Until Deadline" atau sejenis diletakkan **di belakang/mengelilingi** objek (bukan di sampingnya) — treatment persis seperti palmo, hasil akhirnya beda karena objek & tipenya beda.
- Load sequence: **satu** urutan animasi saat halaman terbuka (headline fade+rise ringan, objek 3D rotasi masuk pelan) — bukan tiap elemen fade sendiri-sendiri.

### 6.2 "Cara Kerja" — satu animasi terikat scroll
- Section ini memvisualisasikan alur asli README: `Commit → Sealed → Closed → Reveal Window → Verify → Scoring → Winner`.
- Implementasi: **satu** objek 3D segel yang sama dari hero, di-pin (`position: sticky` / scroll-pin), scroll progress mengontrol tahap retaknya objek + teks tahap yang berganti di sampingnya. Bukan 7 ilustrasi terpisah dengan fade masing-masing.
- Fallback tanpa-3D (mobile rendah/reduced motion): ganti dengan sprite/video loop pendek atau ilustrasi SVG statis per tahap, tetap satu komponen scroll-linked, bukan card individual.

### 6.3 Motif anotasi presisi (dari insight warmnfuzzy)
- Dipakai di: section "Kenapa Blockchain" (marketing) dan halaman **Audit Trail / Verifikasi** (produk).
- Elemen: crosshair kecil di sudut card hash, garis putus-putus penghubung "commitment on-chain" ↔ "reveal payload", label timestamp bergaya stempel.
- Batasan: motif ini TIDAK dipakai di layar dashboard biasa (daftar tender, form) — khusus konteks yang memang tentang verifikasi/pembuktian, supaya tetap bermakna, bukan wallpaper.

### 6.4 Motion yang "menjawab aksi" (di dalam produk)
Ini yang paling penting secara UX dan justru murah secara performa:
- **Submit bid berhasil** → ikon segel di layar animasi menutup (150–250ms) + pesan "Bid kamu tersegel." — momen yang **ditunggu** secara naratif, layak diberi micro-animation.
- **Reveal berhasil diverifikasi** → segel yang sama membuka + centang hijau muncul.
- **Reveal tidak valid** → segel membuka tapi retak merah, tanpa animasi playful — tetap tegas, ini adalah kondisi serius.
- **Countdown deadline** → angka detik yang tick tenang, berubah warna ke `--color-alert` dalam 1 jam terakhir.
- Hover/focus state pada tombol & row tabel: transisi warna 120ms saja, tanpa lift/shadow berlebihan.

### 6.5 Yang harus dihindari
- Jangan animasikan card di dashboard saat scroll masuk viewport (fade-slide-up massal) — pengguna (Procurement Officer/Vendor) sedang bekerja, bukan menjelajah brand.
- Jangan taruh bundle Three.js/GSAP di route produk — hanya di route marketing (lihat Section 11).
- Jangan gunakan particle/mesh gradient background dekoratif tanpa makna.

---

## 7. Komponen Kunci

### 7.1 Status Pill / Badge
Satu komponen dipakai konsisten untuk status tender & bid (lihat mapping warna 4.1). Bentuk: pill kecil, ikon segel micro + label teks (bukan cuma warna, untuk aksesibilitas — lihat Section 10).

```
[● segel-tertutup]  SEALED
[✓ segel-terbuka]   REVEALED_VALID
[✕ segel-retak]     REVEALED_INVALID
[– segel-pudar]     NOT_REVEALED
```

### 7.2 Ledger Row (pengganti "card generik" di dashboard)
Alih-alih semua data dibungkus card seragam bershadow (ciri SaaS-kit), daftar tender/bid di produk memakai baris ledger: nomor referensi (mono), judul, deadline (dengan countdown micro), jumlah peserta, status pill — dipisah hairline, hover state ringan. Ini terasa seperti buku besar/registry resmi, cocok dengan konteks procurement, dan lebih scannable untuk data padat dibanding grid card.

```
┌──────────────────────────────────────────────────────────┐
│ T-2026-0043   Pengadaan 100 Laptop        ⏱ 2h 14m  ●SEALED│
│ T-2026-0044   Jasa Pembuatan Website      ⏱ 1d 03h  ●OPEN  │
└──────────────────────────────────────────────────────────┘
```

### 7.3 Bento Grid (khusus marketing site)
Grid asimetris untuk 4 role (Organization Admin / Procurement Officer / Vendor / Auditor) dan untuk fitur utama — ukuran card mencerminkan kepentingan naratif, bukan grid seragam 4 kolom sama besar.

### 7.4 Dynamic Bid Field Builder
Komponen form-builder untuk Procurement Officer menentukan field bid (README Section 6): setiap baris field punya ikon tipe (Currency / Text / Number / Multi-select / File), drag-handle untuk reorder, dan preview live di sisi kanan bagaimana form akan terlihat oleh vendor.

### 7.5 Criteria & Weight Bar
Visualisasi bobot kriteria (Harga 50%, Spesifikasi 25%, dst) sebagai bar horizontal bertumpuk yang **harus** total 100% — validasi visual real-time, bukan cuma angka di input.

### 7.6 Wallet Connect Modal
Modal koneksi wallet (MetaMask) harus terasa **native ke brand TenderSeal**, bukan template Web3Modal default neon-ungu. Gunakan palet section 4.1, ikon segel kecil di header modal ("Tandatangani untuk mengunci bid Anda"), dan jelaskan dalam bahasa awam (README menegaskan user tidak perlu paham detail Solidity) — lihat Section 9.

### 7.7 Commitment/Reveal Compare View (untuk Auditor)
Tampilan dua kolom: hash commitment on-chain vs hash hasil reveal, dengan garis penghubung ala motif anotasi (6.3), highlight hijau jika cocok / merah jika tidak — ini adalah *fitur* paling unik TenderSeal, layak jadi salah satu layar paling dirancang dengan baik, bukan tabel polos.

---

## 8. Panduan Per-Halaman

### 8.1 Landing / Marketing
```
[Nav pill mengambang: logo | Produk | Cara Kerja | Untuk Siapa | Masuk/Daftar]
[HERO — 3D segel + headline besar, satu CTA "Mulai Tender" ]
[Problem — insider bisa lihat bid plaintext, divisualisasikan dgn motif anotasi]
[Cara Kerja — scroll-pinned seal animation, 7 tahap]
[Untuk Siapa — bento 4 role: Admin/PO/Vendor/Auditor]
[Kenapa Blockchain — ledger visual + hash mono, motif anotasi]
[Full-bleed CTA block warna --color-ink atau --color-seal]
[Footer: rounded block ala nomu, warna solid]
```

### 8.2 Auth & Onboarding
Tenang, satu kolom, tanpa 3D. Stepper sederhana: Register → Buat/Gabung Organisasi → (jika admin) Tetapkan role anggota. Gunakan komponen stepper yang sama dengan yang dipakai di alur tender lifecycle agar bahasa visual konsisten.

### 8.3 Dashboard — Procurement Officer
Baris statistik ringkas di atas (tender aktif, reveal pending, rata-rata peserta) sebagai **ledger row**, bukan KPI card ikon+angka+sparkline generik. Di bawahnya daftar tender (7.2).

### 8.4 Dashboard — Vendor
"Tender yang bisa diikuti" & "Bid saya" sebagai dua tab/list. Komponen countdown deadline jadi elemen paling menonjol (ikon segel + waktu tersisa), karena ini yang paling menentukan aksi vendor.

### 8.5 Dashboard — Auditor
Fokus ke tabel transaksi blockchain & audit log, dengan Commitment/Reveal Compare View (7.7) sebagai centerpiece.

### 8.6 Dashboard — Organization Admin
Tabel anggota organisasi + matrix permission (mirror tabel 14.6 di README) sebagai referensi visual langsung — auditor/admin baru bisa langsung paham cakupan tiap role tanpa baca dokumen.

### 8.7 Buat Tender
Wizard multi-step: Detail → Deadline & Reveal Window → Dynamic Bid Fields (7.4) → Kriteria & Bobot (7.5) → Review & Publish.

### 8.8 Submit Bid (Commit)
Isi form dinamis → set Secret/PIN → tampilkan status teknis yang sebenarnya terjadi ("Menurunkan kunci enkripsi… Mengenkripsi bid… Membuat commitment…") sebagai progress states nyata (bukan skeleton loading generik — ini kesempatan motion yang jujur karena memang sedang terjadi) → tanda tangan wallet → konfirmasi "Bid tersegel" dengan animasi segel menutup (6.4).

### 8.9 Reveal
Input secret saat reveal window terbuka → dekripsi client-side → kirim reveal payload → hasil `REVEALED_VALID`/`REVEALED_INVALID` dengan animasi segel membuka (6.4).

### 8.10 Scoring & Hasil
Breakdown skor per kriteria dengan weight bar (7.5) diisi angka aktual. Pengumuman pemenang tetap tenang — aksen `--color-gold` untuk highlight, tanpa confetti.

### 8.11 Audit Trail
Timeline kronologis semua event (tender dibuat, commit, reveal attestation, hasil dicatat) dengan hash terpotong + tombol copy + link block explorer — rumah utama motif anotasi presisi.

---

## 9. Voice & Microcopy

- Bahasa aktif, sesuai aksi: tombol "Kunci Bid Saya" (bukan "Submit"), lalu konfirmasi bicara persis: "Bid Anda tersegel."
- Nama sesuatu sesuai yang dipahami vendor/PO, bukan istilah sistem: "Batas waktu buka penawaran" ketimbang "reveal deadline" di UI yang dilihat vendor awam (istilah teknis tetap boleh muncul di tooltip/halaman auditor).
- Error state jujur dan spesifik: "Hash reveal tidak cocok dengan commitment — bid ini ditandai tidak valid" — bukan "Terjadi kesalahan".
- Karena banyak vendor mungkin awam soal wallet/crypto (README 19.5), copy di sekitar wallet connect harus menjelaskan **fungsinya** ("dipakai untuk menandatangani, bukan membayar") tepat di titik interaksi, bukan disembunyikan di FAQ.

---

## 10. Aksesibilitas & Performa

- Status jangan hanya dibedakan warna — selalu sertakan ikon + label teks (lihat 7.1), karena ini menyangkut keputusan finansial/legal.
- Kontras minimum AA untuk semua pasangan warna teks/background di 4.1 — cek khusus `--color-slate` & `--color-muted` di atas `--color-paper`.
- Hormati `prefers-reduced-motion`: animasi segel scroll-linked (6.2) diganti versi statis bertahap; animasi konfirmasi (6.4) dipersingkat jadi cross-fade instan.
- Tabel data (bid list, audit log) pakai markup tabel semantik yang benar — auditor/PO kemungkinan memakai screen reader di lingkungan pemerintahan/enterprise.
- Fokus keyboard harus terlihat jelas di semua kontrol interaktif, termasuk di dalam wallet modal.
- 3D & scroll animation **tidak boleh** memblokir interaksi utama (submit bid, reveal) jika gagal load — selalu ada fallback fungsional.

---

## 11. Implementasi Teknis (Next.js 16 + Tailwind)

- Definisikan semua token Section 4 di `tailwind.config` sebagai `theme.extend.colors` / `fontFamily` / `borderRadius`, jangan hardcode hex di komponen.
- Load font lewat `next/font/google` (Switzer/Cabinet Grotesk dari Fontshare perlu self-host via `next/font/local`; IBM Plex Mono tersedia di Google Fonts).
- Split bundle: `react-three-fiber` + `@react-three/drei` + GSAP `ScrollTrigger` (atau Framer Motion `useScroll`/`useTransform`) **hanya** di-import pada route marketing (`app/(marketing)/...`), lazy-loaded, tidak ikut ke route produk (`app/(app)/...`).
- Aset 3D segel: compressed `.glb`, target < 2MB, draco-compressed jika perlu.
- Icon UI umum tetap pakai Lucide (sudah dipakai di stack), tapi buat 4–5 custom SVG icon khusus (segel tertutup/terbuka/retak/pudar, hash) karena Lucide tidak punya ikon "segel" yang pas — ini elemen brand paling penting, jangan pakai ikon generik untuk itu.
- Reduced-motion: cek `window.matchMedia('(prefers-reduced-motion: reduce)')` di level provider animasi global, bukan per-komponen berulang.

---

## 12. Roadmap Penerapan

Supaya tidak "big bang" redesign:

1. **Fase 1 — Fondasi:** tanam design token (warna, tipografi, radius) ke Tailwind config + refactor komponen dasar (button, badge status, ledger row). Dampak langsung ke semua halaman produk tanpa perlu 3D dulu.
2. **Fase 2 — Produk:** terapkan Ledger Row, Status Pill bermakna (segel), Commitment/Reveal Compare View untuk Auditor, motion respon-aksi (6.4).
3. **Fase 3 — Marketing site:** hero 3D segel + scroll story "Cara Kerja" + bento role section — paling mahal secara effort, paling besar dampak *first impression*, dikerjakan setelah fondasi produk solid.

---

## 13. Quick Reference — Do / Don't

| Do | Don't |
|---|---|
| Satu objek 3D segel, dipakai ulang di hero & scroll story | Banyak ilustrasi 3D generik berbeda-beda tiap section |
| Motion sebagai respon aksi nyata (bid tersegel, reveal valid) | Fade-slide-up massal di setiap scroll |
| Ledger row untuk data padat di dashboard | Card seragam bershadow abu-abu untuk semua konten |
| Status = ikon + warna + label teks | Status hanya dibedakan warna |
| Palet dingin (paper abu-kebiruan + ink indigo-gelap + seal red) | Cream hangat + serif + terracotta |
| Mono font untuk data teknis asli (hash, ID) | Mono font untuk label kecil dekoratif |
| Copy aktif & spesifik sesuai istilah README | Copy generik ("Submit", "Terjadi kesalahan") |

---

*Dokumen ini idealnya disimpan di `docs/design.md`, berdampingan dengan `docs/architecture.md` dan `docs/threat-model.md` sesuai struktur repo yang sudah ada.*
