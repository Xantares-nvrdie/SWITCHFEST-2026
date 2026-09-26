# E-Procurement Design System: TenderSeal

## 1. Design Vision
Visi desain TenderSeal adalah **"Cryptographic Elegance"**. Desain harus mengomunikasikan keamanan tingkat tinggi (blockchain, client-side encryption) bukan melalui visual yang kaku dan membosankan, melainkan melalui antarmuka yang presisi, interaksi mikro yang memuaskan (satisfying), dan *motion* yang menceritakan proses "penguncian" (sealing) dan "pembukaan" (revealing) secara visual.

## 2. Design Principles
*   **Form Follows Trust:** Estetika melayani fungsi keamanan. Visual harus membuat pengguna (Vendor & Procurement Officer) merasa aman dan yakin.
*   **Progressive Disclosure:** Jangan membanjiri pengguna dengan data. Gunakan animasi *stagger* dan layout modular untuk menampilkan kompleksitas secara bertahap.
*   **Purposeful Motion:** Setiap pergerakan harus memberi tahu pengguna tentang status (misalnya: animasi gembok terkunci saat *commit*, transisi dokumen terbuka saat *reveal*).
*   **Tactile Digitality:** Memberikan kesan "fisik" pada objek digital menggunakan kedalaman (*depth*), bayangan (*shadow*), dan interaksi *hover* yang responsif.

## 3. Reference Analysis
Berdasarkan referensi yang diberikan, berikut sintesis yang akan diadaptasi:
*   **Palmo:** Penggunaan objek 3D (kelapa) yang merespons *scroll*. *Adaptasi:* Kita akan menggunakan objek 3D metaforis (seperti brankas kaca transparan atau segel kriptografi) di Landing Page yang terkunci atau terbuka berdasarkan *scroll position* untuk menjelaskan proses *Commit-Reveal*.
*   **Nomu:** Struktur layout *Bento-box* yang rapi, *white space* yang lega, dan palet warna yang bersih dengan *soft gradients*. *Adaptasi:* Ini akan menjadi fondasi utama untuk halaman Dashboard, Tender List, dan Form Submission, memastikan *usability* data padat tetap terjaga.
*   **Warm & Fuzzy:** Tipografi raksasa (*bold display*), *high-contrast*, dan elemen 3D yang melayang mengikuti kursor. *Adaptasi:* Tipografi besar akan digunakan untuk penunjuk status kritis (misal: "TENDER CLOSED" atau "SEALED"). Efek kursor akan dibatasi pada area *hero section* atau *empty states* agar tidak mengganggu produktivitas.

## 4. Visual Direction
*   **Overall Mood:** Modern, sophisticated, technical, premium.
*   **Visual Density:** Medium-low pada halaman navigasi (banyak *whitespace* ala Nomu), Medium-high pada halaman detail tender/tabel.
*   **Surface & Elevation:** Menggunakan pendekatan *Glassmorphism* yang sangat subtle (blur & border semi-transparan) dipadukan dengan *Solid Cards* untuk memisahkan data latar belakang dengan aksi utama.

## 5. Color System
Sistem warna harus mencerminkan otoritas dan modernitas.
*   **Primary (Trust):** `Obsidian Black` (#0A0A0A) untuk latar belakang utama mode gelap, atau `Frost White` (#F8F9FA) untuk mode terang.
*   **Accent (Crypto/Tech):** `Electric Emerald` (#10B981) untuk aksi sukses/commit, dan `Cobalt Blue` (#2563EB) untuk interaksi navigasi.
*   **Surface:** `Onyx Gray` (#171717) / `Pure White` (#FFFFFF) dengan border transparan (10% opacity).
*   **Semantic:** 
    *   Success/Sealed: `Emerald` (#10B981)
    *   Warning/Deadline Near: `Amber` (#F59E0B)
    *   Error/Invalid: `Rose` (#E11D48)
    *   Informational/Blockchain: `Cobalt Blue` (#2563EB)

## 6. Typography
Mengadopsi hierarki kontras tinggi ala Warm & Fuzzy dipadukan dengan keterbacaan Nomu.
*   **Display / Headings (H1-H3):** *Clash Display* atau *Space Grotesk*. Memberikan kesan teknikal, modern, dan berkarakter (uppercase untuk status tender seperti "SEALED").
*   **Body / Data (H4-H6, P, Tables):** *Inter* atau *Geist*. Bersih, *monospaced-friendly* untuk angka/harga tender.
*   **Font Weights:** Display (600, 700), Body (400, 500).
*   **Letter Spacing:** Tighter (-2%) untuk Display berukuran raksasa, normal (0%) untuk Body demi *readability*.

## 7. Spacing System
Menggunakan skala linear untuk konsistensi (Base 4px):
*   `xs`: 4px | `sm`: 8px | `md`: 16px | `lg`: 24px | `xl`: 32px
*   `2xl`: 48px | `3xl`: 64px | `4xl`: 96px | `5xl`: 128px (Digunakan untuk spasi antar *section*).

## 8. Layout System
*   **Dashboard / Internal:** Menggunakan *CSS Grid* dengan gaya *Bento-box*. Kartu-kartu dengan sudut melengkung menampung widget spesifik (misal: Sisa Waktu Deadline, Status Commit, Info Organisasi).
*   **Landing Page / Marketing:** Layout asimetris dengan paduan *sticky sections* dan kanvas layar penuh untuk merender elemen 3D.
*   **Max Width:** 1440px untuk kontainer konten utama agar *readable* di monitor ultrawide.

## 9. Components
*   **Cards (Bento Style):** 
    *   Radius: `16px` atau `24px`.
    *   Border: `1px solid rgba(255,255,255, 0.1)` (dark mode).
    *   Shadow: Sangat halus, menggunakan *multi-layered drop shadow* (misal: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)`).
*   **Buttons:** 
    *   Pill-shaped (radius `9999px`) untuk tombol aksi utama (CTA).
    *   Slight inner shadow untuk memberi kesan *tactile*.
*   **Status Badges:** 
    *   Berperan penting di aplikasi ini (`SEALED`, `REVEALED`, `CLOSED`). Gunakan efek *glow* (box-shadow) berwarna sesuai status untuk membedakannya dari badge CRUD biasa.

## 10. Motion Design System
*   **Duration:** 
    *   *Micro (Hover/Focus):* `150ms - 200ms` (Fast).
    *   *Transitions (Page/Modal):* `400ms - 600ms` (Normal).
    *   *Cinematic (Scroll/Reveal):* `800ms - 1200ms` (Slow).
*   **Easing:** Gunakan kurva kustom `cubic-bezier(0.16, 1, 0.3, 1)` (*Expo Out*) untuk animasi yang terasa cepat di awal namun sangat mulus saat berhenti.
*   **Principles:** 
    *   *Intentional:* Animasi terjadi karena interaksi (klik/scroll).
    *   *Meaningful:* Animasi *encryption* saat submit bid menunjukkan teks polos berubah menjadi *scrambled characters* sebelum menjadi bintang/titik.

## 11. Scroll Experience
*   **Landing Page / Workflow Guide:** Terapkan *Scroll-triggered animation* (menggunakan library seperti Framer Motion `useScroll`). Saat pengguna men-scroll ke bawah, elemen seperti arsitektur sistem atau status *Commit-Reveal* dapat dirakit secara visual lapis demi lapis.
*   **Dashboard:** Gunakan *Sticky Headers* dan *Table Headers*. Terapkan *Reveal-on-scroll* yang halus (fade up + sedikit translasi Y) hanya saat elemen pertama kali masuk *viewport*.

## 12. Micro Interactions
Sangat krusial untuk e-procurement agar tidak terasa statis:
*   **Button Hover:** Tombol tidak hanya berubah warna, tetapi *scale up* sedikit (1.02) dan memunculkan efek *subtle glow*.
*   **Table Rows:** Saat *hover* pada baris tender, baris sedikit membesar atau memiliki latar belakang gradient tipis, dan memunculkan *Quick Actions* (View, Submit, Edit) yang masuk dengan efek *fade in*.
*   **Input Focus:** Saat mengisi nilai penawaran (harga, RAM, garansi), form field memberikan efek *ring* yang beranimasi meluas, menandakan elemen sedang aktif.
*   **Loading State:** Jangan gunakan *spinner* bawaan. Gunakan *skeleton loading* bergelombang (*shimmering*) dengan transisi *fade* yang halus ke konten asli.

## 13. 3D / Spatial Design
*   **Landing Page & Onboarding:** Kita gunakan *3D Object* berupa **"Cryptographic Vault / Seal"**. 
    *   Saat tender status `OPEN`, brankas terlihat terbuka.
    *   Saat vendor klik `Submit Bid`, ada animasi brankas tertutup rapat dan terkunci (merepresentasikan *Commitment* ke *Smart Contract*).
*   **Tech Stack:** Gunakan `React Three Fiber` / `Three.js` (WebGL).
*   **Restriction:** Hanya gunakan 3D untuk *hero section* atau *success page*. JANGAN gunakan 3D di dalam tabel atau form pengisian.

## 14. Page-Level Design
*   **A. Landing Page / Public Facing:** Immersive full-screen hero, typography raksasa. Elemen 3D berputar perlahan mengikuti pergerakan kursor (*parallax mouse move*).
*   **B. Procurement Dashboard:** *Bento grid system*. Kiri untuk menu/filter, kanan (area utama) berisi kartu metrik dan *Data Table* Tender. *Hover effect* pada kartu bento. Fokus tertinggi pada metrik kritis.
*   **C. Tender Detail & Dynamic Bid Form:** *Split-screen* lengket (*Sticky*). Kolom kiri berisi metadata tender statis. Kolom kanan adalah form *Dynamic Fields* yang dapat di-scroll. *Progressive reveal* saat input PIN/Secret diketik.

## 15. Responsive Behavior
*   **Desktop:** Maksimalkan layout *Bento*, hover efek aktif, dan elemen 3D WebGL aktif.
*   **Tablet/Mobile:** Matikan elemen 3D kompleks (fallback ke gambar *high-res* atau video statis/loop) untuk menghemat baterai. Ubah *Bento Grid* menjadi daftar vertikal berlapis (*stacked*).
*   **Touch Interactions:** Ganti efek *hover* yang kompleks dengan indikator visual permanen atau *swipe actions* untuk tabel pada mobile.

## 16. Accessibility
Aplikasi E-Procurement *wajib* inklusif:
*   **Contrast:** Memastikan rasio kontras teks minimum 4.5:1, terutama pada label form dinamis dan *status badge*.
*   **Keyboard Navigation:** Seluruh *actionable items* harus memiliki `focus-visible` *state* (misal: *outline* biru tegas).
*   **Prefers Reduced Motion:** Gunakan media query `@media (prefers-reduced-motion: reduce)` untuk mematikan paralaks, transisi panjang, dan animasi 3D bagi pengguna yang memiliki sensitivitas gerak.

## 17. Performance Considerations
*   **3D Assets (WebGL):** 3D model harus dioptimasi (*low-poly*, tekstur terkompresi). Gunakan *Lazy Loading* (`next/dynamic`) pada kanvas *Three.js* sehingga halaman utama tetap memuat HTML/CSS dengan cepat (`LCP` yang baik).
*   **CSS vs JS Animation:** Gunakan `Tailwind CSS` (*native CSS transitions*) untuk mikro-interaksi (*hover*, *focus*) demi performa 60FPS. Gunakan `Framer Motion` hanya untuk transisi halaman, *layout animation*, dan animasi berbasis *scroll*.

## 18. Implementation Recommendations
1.  **Framework:** Lanjutkan dengan `Next.js 16 (App Router)`.
2.  **Styling & UI:** Gunakan `Tailwind CSS` digabungkan dengan komponen dari `Radix UI` atau `shadcn/ui` (sebagai basis aksesibilitas) lalu timpa tampilannya sesuai *design system* kita.
3.  **Animation Library:** Install `framer-motion` untuk *layout transition* dan `gsap` (opsional untuk *scroll-driven animations* yang spesifik).
4.  **3D Integration:** Install `@react-three/fiber` dan `@react-three/drei` untuk memuat model glTF.

## 19. Design Do's
*   **DO** gunakan *whitespace* besar untuk memisahkan logika (misal: pisahkan informasi *Tender* dengan *Bid Fields* secara jelas).
*   **DO** gunakan animasi bermakna. Transisi pengiriman form harus merepresentasikan status *Encrypting...* -> *Committing to Blockchain...*.
*   **DO** gunakan kontras warna untuk menekankan *deadline* (misal: warna berubah amber saat sisa waktu < 2 jam).

## 20. Design Don'ts
*   **DON'T** membuat *scroll-jacking* (memaksa *scroll* macet) pada area form atau tabel. *Scroll-jacking* hanya boleh di *Landing Page*.
*   **DON'T** menggunakan font dekoratif / *Display Font* besar untuk angka harga atau spesifikasi dalam form. Tetap gunakan sans-serif yang proporsional (*tabular nums*).
*   **DON'T** menganimasikan elemen yang harus selalu statis untuk referensi pengguna (seperti *Tender ID* atau Instruksi).