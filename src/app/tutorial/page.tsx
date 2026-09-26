"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, FileText, Key, Shield, ArrowRight, Hash, EyeOff, Server, PlayCircle, PlusCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TutorialPage() {
    const [activeSection, setActiveSection] = useState("sistem");

    const sections = [
        { id: "sistem", title: "Cara Kerja Sistem (Kriptografi)", icon: Shield },
        { id: "buat-tender", title: "Panduan Membuat Tender", icon: FileText },
        { id: "pin", title: "Fungsi PIN & Keamanan", icon: Key },
        { id: "bid", title: "Cara Melakukan Bid", icon: Lock },
    ];

    return (
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12">
            {/* Header */}
            <div className="mb-12">
                <h1 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
                    Pusat Bantuan & Tutorial
                </h1>
                <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                    Pelajari bagaimana TenderSeal menggunakan kriptografi modern (Commit-Reveal Scheme) untuk mengamankan proses pengadaan Anda dari awal hingga akhir.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-72 flex-shrink-0 md:sticky md:top-24">
                    <nav className="flex flex-col space-y-2">
                        {sections.map((sec) => {
                            const isActive = activeSection === sec.id;
                            const Icon = sec.icon;
                            return (
                                <button
                                    key={sec.id}
                                    onClick={() => setActiveSection(sec.id)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left font-semibold text-[14px] ${
                                        isActive 
                                        ? "bg-[var(--surface-secondary)] text-[var(--text-primary)] shadow-sm border border-[var(--border)]" 
                                        : "text-[var(--text-tertiary)] hover:bg-[var(--surface-secondary)]/50 hover:text-[var(--text-secondary)] border border-transparent"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-[var(--accent)]" : ""}`} />
                                    {sec.title}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-12 p-6 rounded-2xl bg-[var(--surface-secondary)]/30 border border-[var(--border)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-[50px] pointer-events-none" />
                        <h3 className="font-bold text-[var(--text-primary)] mb-2 relative z-10">Butuh Bantuan Lain?</h3>
                        <p className="text-[13px] text-[var(--text-tertiary)] mb-5 relative z-10">Tim support teknis kami siap membantu jika Anda mengalami kendala operasional.</p>
                        <button className="w-full py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--background)] font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform relative z-10">
                            Hubungi Support
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 max-w-4xl min-h-[600px] pb-20">
                    <AnimatePresence mode="wait">
                        
                        {/* 1. SISTEM KRIPTOGRAFI */}
                        {activeSection === "sistem" && (
                            <motion.div key="sistem" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-3">
                                        <Shield className="w-8 h-8 text-emerald-500" />
                                        Cara Kerja Sistem
                                    </h2>
                                    <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-8">
                                        TenderSeal tidak seperti aplikasi e-procurement konvensional. Kami menggunakan protokol <span className="text-emerald-400 font-semibold">Commit-Reveal Scheme</span> yang menjamin bahwa <strong>tidak ada seorang pun</strong>—termasuk Admin IT, Panitia Pembuat Komitmen (PPK), atau Vendor lain—yang bisa mengintip dokumen penawaran harga sebelum waktu yang ditentukan (Fase Reveal).
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bento-card p-6 border-[var(--border)] flex flex-col sm:flex-row gap-5 hover:bg-[var(--surface-secondary)]/50 transition-colors">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                                            <Hash className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[18px] text-[var(--text-primary)] mb-2">1. Fase Commit (Penguncian Data)</h3>
                                            <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed">
                                                Saat vendor men-submit (Bid) dokumen penawaran, data harga tidak dikirim dalam format teks biasa. Browser/komputer vendor akan mengubah harga menjadi sebuah <strong>Hash Kriptografis rahasia (Algoritma SHA-256)</strong> menggunakan sebuah PIN. Server TenderSeal hanya menerima Hash acak ini, sehingga server sepenuhnya buta terhadap harga aslinya.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bento-card p-6 border-[var(--border)] flex flex-col sm:flex-row gap-5 hover:bg-[var(--surface-secondary)]/50 transition-colors">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                                            <EyeOff className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[18px] text-[var(--text-primary)] mb-2">2. Zero-Knowledge State (Masa Tunggu)</h3>
                                            <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed">
                                                Selama masa tender masih berjalan, sistem berada dalam status <i>Zero-Knowledge</i>. Sistem ini 100% kebal terhadap kebocoran orang dalam (insider threat) atau peretasan database, karena kunci untuk membuka brankas data (PIN) sepenuhnya dipegang secara offline oleh vendor masing-masing.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bento-card p-6 border-[var(--border)] flex flex-col sm:flex-row gap-5 hover:bg-[var(--surface-secondary)]/50 transition-colors">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                            <Server className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[18px] text-[var(--text-primary)] mb-2">3. Fase Reveal (Pembukaan Paksa)</h3>
                                            <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed">
                                                Setelah batas waktu (deadline) tender habis, fase Reveal dimulai. Seluruh vendor yang berpartisipasi wajib memasukkan PIN Rahasia mereka kembali untuk mendekripsi dokumen. Server akan memvalidasi apakah PIN tersebut cocok dengan jejak Hash di awal. Jika valid, dokumen dibuka dan dicatat permanen dalam Audit Trail.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. PANDUAN MEMBUAT TENDER */}
                        {activeSection === "buat-tender" && (
                            <motion.div key="buat-tender" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-blue-500" />
                                        Panduan Membuat Tender
                                    </h2>
                                    <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-8">
                                        Untuk instansi atau panitia pengadaan (Buyer), pembuatan tender dilakukan dalam format terstruktur untuk memastikan jadwal Commit & Reveal berjalan otomatis secara presisi.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 mt-1">1</div>
                                        <div>
                                            <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-2">Akses Menu Pembuatan</h3>
                                            <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed">
                                                Klik tombol <strong className="text-[var(--text-secondary)]">"Buat Tender"</strong> berwarna hijau di menu navigasi atas. Pastikan organisasi Anda terdaftar dengan tipe <strong>BUYER</strong>.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 mt-1">2</div>
                                        <div>
                                            <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-2">Isi Detail Spesifikasi</h3>
                                            <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed">
                                                Lengkapi informasi dasar seperti Judul, Deskripsi proyek, Nilai HPS (Harga Perkiraan Sendiri), dan Kategori (misalnya: Konstruksi, IT, Pengadaan Barang).
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 mt-1">3</div>
                                        <div>
                                            <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-2">Tentukan Jadwal Ketat</h3>
                                            <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed mb-3">
                                                Sistem TenderSeal mengharuskan pengaturan 3 tanggal utama:
                                            </p>
                                            <ul className="list-disc pl-5 space-y-2 text-[14px] text-[var(--text-tertiary)]">
                                                <li><strong>Mulai Pendaftaran (Start Date):</strong> Waktu tender dibuka untuk publik.</li>
                                                <li><strong>Batas Akhir Penawaran (Commit Deadline):</strong> Waktu maksimal bagi vendor untuk mengunci Bid (Hash) mereka. Lewat dari waktu ini, tidak ada lagi dokumen yang diterima.</li>
                                                <li><strong>Batas Akhir Reveal (Reveal Deadline):</strong> Waktu maksimal bagi vendor untuk memasukkan PIN dan membongkar Hash mereka.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm flex gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                                    <p>Setelah diterbitkan, dokumen tender akan disiarkan dan tercatat statusnya. Anda hanya tinggal memantau Dasbor hingga fase Reveal selesai untuk melihat peringkat vendor otomatis.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. FUNGSI PIN */}
                        {activeSection === "pin" && (
                            <motion.div key="pin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-3">
                                        <Key className="w-8 h-8 text-amber-500" />
                                        Fungsi PIN Enkripsi
                                    </h2>
                                    <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-8">
                                        Banyak pengguna baru bingung, <i>"Mengapa saya harus membuat PIN saat Submit Bid, dan ditanya PIN lagi setelah tender ditutup?"</i> Inilah letak keunggulan utama TenderSeal.
                                    </p>
                                </div>

                                <div className="bento-card p-8 border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
                                    <div className="absolute -right-10 -bottom-10 opacity-10">
                                        <Key className="w-48 h-48 text-amber-500" />
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-amber-400 mb-4">PIN adalah "Kunci Brankas" Digital Anda</h3>
                                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-6">
                                        PIN (Minimal 6 digit) tidak pernah dikirim ke server TenderSeal. Saat Anda memasukkan harga, PIN tersebut bekerja secara lokal di browser Anda untuk mengacak harga penawaran menjadi <i>cryptographic signature</i> (Hash).
                                    </p>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-[#050505] p-4 rounded-lg border border-[var(--border)] font-mono text-sm text-[var(--text-tertiary)] break-all">
                                            <span className="text-amber-500/50 block mb-1">// Data Harga Asli: Rp 1.500.000.000 (Hanya Anda yang tahu)</span>
                                            <span className="text-emerald-500/50 block mb-1">// PIN Rahasia: 123456 (Hanya Anda yang tahu)</span>
                                            <span className="text-white block mt-3">Hash Dikirim ke Server:</span>
                                            <span className="text-blue-400">e2b5c89f92a34...781d4e0</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-[var(--text-primary)] text-lg">Peringatan Kehilangan PIN</h3>
                                    <div className="bento-card border-red-500/30 bg-red-500/10 p-5">
                                        <p className="text-red-200 text-sm leading-relaxed">
                                            <strong>PERHATIAN:</strong> Karena TenderSeal menganut prinsip Zero-Knowledge, <strong>kami tidak bisa memulihkan PIN Anda jika lupa.</strong> Jika Anda kehilangan PIN, penawaran Anda tidak akan pernah bisa dibuka di fase Reveal, dan Bid Anda otomatis akan didiskualifikasi (Gugur). Simpan PIN Anda secara aman!
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 4. CARA BID */}
                        {activeSection === "bid" && (
                            <motion.div key="bid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-3">
                                        <Lock className="w-8 h-8 text-purple-500" />
                                        Panduan Melakukan Bid (Vendor)
                                    </h2>
                                    <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-8">
                                        Sebagai penyedia (Vendor), tugas Anda adalah mengajukan dokumen dan harga terbaik, lalu membukanya saat waktunya tiba.
                                    </p>
                                </div>

                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border)] before:to-transparent">
                                    
                                    {/* Step 1 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_var(--background)]">
                                            1
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-5 border-[var(--border)]">
                                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Cari Tender & Ikuti</h3>
                                            <p className="text-sm text-[var(--text-tertiary)]">Buka Katalog Tender, pilih proyek dengan status <strong>OPEN</strong>. Klik tombol "Submit Dokumen Bid" di bagian detail.</p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_var(--background)]">
                                            2
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-5 border-[var(--border)]">
                                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Masukkan Harga & PIN</h3>
                                            <p className="text-sm text-[var(--text-tertiary)]">Ketik harga penawaran Anda (misal: 100000). Buat PIN 6-digit. Klik tombol Commit. Pada titik ini, dokumen Anda telah terkunci secara kriptografis.</p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_var(--background)]">
                                            3
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-5 border-[var(--border)]">
                                            <h3 className="font-bold text-[var(--text-primary)] mb-2">Tunggu Fase Evaluasi (Reveal)</h3>
                                            <p className="text-sm text-[var(--text-tertiary)]">Tunggu hingga waktu <i>Commit Deadline</i> lewat. Setelah status tender berubah menjadi <strong>REVEAL</strong>, Anda wajib kembali ke halaman tersebut.</p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-purple-500/20 text-purple-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_var(--background)]">
                                            4
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-5 border-purple-500/30 bg-purple-500/5">
                                            <h3 className="font-bold text-purple-400 mb-2">Reveal / Buka Dokumen</h3>
                                            <p className="text-sm text-[var(--text-secondary)]">Klik tombol "Reveal Bid", lalu masukkan PIN yang sama persis seperti di Langkah 2. Harga Anda akan tervalidasi dan muncul di papan klasemen tender!</p>
                                        </div>
                                    </div>
                                    
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
