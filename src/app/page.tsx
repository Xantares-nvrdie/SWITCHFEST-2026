"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import {
    PlusCircle,
    ArrowRight,
    Shield,
    Lock,
    FileKey,
    Eye,
    FileText,
    Upload,
    Users,
    Rocket,
    Plus,
    Minus,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import HomeFooter from "@/components/home-footer";

interface DashboardStats {
    totalTenders: number;
    openTenders: number;
    totalBids: number;
}

const TypewriterText = ({ phrases }: { phrases: string[] }) => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const currentFullPhrase = phrases[currentPhraseIndex];

        if (!isDeleting) {
            if (currentText === currentFullPhrase) {
                timeout = setTimeout(() => setIsDeleting(true), 2000);
            } else {
                timeout = setTimeout(() => {
                    setCurrentText(currentFullPhrase.substring(0, currentText.length + 1));
                }, 60);
            }
        } else {
            if (currentText === "") {
                setIsDeleting(false);
                setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
            } else {
                timeout = setTimeout(() => {
                    setCurrentText(currentFullPhrase.substring(0, currentText.length - 1));
                }, 30);
            }
        }

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentPhraseIndex, phrases]);

    return (
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] whitespace-nowrap overflow-hidden">
            {currentText}
            <span className="animate-pulse">_</span>
        </span>
    );
};

export default function HomePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    // Hero scroll
    const { scrollYProgress: heroScroll } = useScroll();
    const y = useTransform(heroScroll, [0, 1], ["0%", "50%"]);

    // Horizontal scroll section
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"],
    });
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    useEffect(() => {
        fetch("/api/tenders")
            .then(async (r) => {
                if (!r.ok) return [];
                return await r.json();
            })
            .then((json: any) => {
                const tenders = Array.isArray(json) ? json : json.data || [];
                setStats({
                    totalTenders: json.meta?.total || tenders.length,
                    openTenders: tenders.filter((t: any) => t.status === "OPEN").length,
                    totalBids: tenders.reduce((acc: number, t: any) => acc + (t.bidCount || 0), 0),
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const stagger: any = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
            },
        }),
    };

    return (
        <main className="flex flex-col w-full">
            <div className="flex flex-col gap-32 overflow-x-clip w-full max-w-[1920px] mx-auto px-6">
                {/* Immersive Hero Section */}
                <section className="relative min-h-[85vh] flex items-center justify-between pt-10">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[rgba(16,185,129,0.05)] via-transparent to-transparent pointer-events-none" />

                    <div className="w-full lg:w-1/2 space-y-8 z-10">
                        <motion.div
                            custom={0}
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] min-w-[320px]"
                        >
                            <div className="w-2 h-2 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <TypewriterText phrases={[
                                "Sistem Aktif & Terlindungi",
                                "Zero-Knowledge Encryption",
                                "Didukung oleh Blockchain",
                                "100% Bebas Manipulasi Data"
                            ]} />
                        </motion.div>

                        <motion.h1
                            custom={1}
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="font-display text-[64px] sm:text-[80px] font-bold tracking-tighter text-[var(--text-primary)] leading-[1.05]"
                        >
                            Platform Pengadaan
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-tertiary)]">
                                yang Tidak Bisa Dimanipulasi.
                            </span>
                        </motion.h1>

                        <motion.p
                            custom={2}
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="text-[18px] text-[var(--text-secondary)] leading-relaxed max-w-xl font-medium"
                        >
                            TenderSeal menggunakan{" "}
                            <span className="text-[var(--text-primary)]">Commit-Reveal Cryptography</span>{" "}
                            di sisi klien. Harga penawaran dienkripsi di browser Anda, bukan di server kami. Smart contract mencatat setiap langkah di Ethereum Sepolia.
                        </motion.p>

                        <motion.div
                            custom={3}
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="flex flex-wrap items-center gap-4 pt-4"
                        >
                            {session?.user ? (
                                <Link href="/tenders/create" className="btn-primary px-8 py-4 text-[15px]">
                                    Buat Tender Baru
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            ) : (
                                <Link href="/login" className="btn-primary px-8 py-4 text-[15px]">
                                    Masuk ke Sistem
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            )}

                            <Link
                                href="/audit"
                                className="px-8 py-4 rounded-full border border-[var(--border)] text-[var(--text-primary)] font-semibold text-[15px] hover:bg-[var(--surface-secondary)] transition-all"
                            >
                                Lihat Jejak Audit
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="hidden lg:block absolute right-0 top-0 w-[50vw] h-full pointer-events-none overflow-hidden z-0"
                    >
                        <video
                            src="/video/Office%20Discussion%204K%20Video.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                        />
                        {/* Seamless fading gradients */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-transparent to-transparent w-1/2" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-transparent h-1/4" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent h-1/4 mt-auto" />
                    </motion.div>
                </section>

                {/* Horizontal Scroll Feature Section */}
                <section ref={targetRef} className="relative h-[400vh]">
                    <div className="sticky top-0 h-[100vh] flex flex-col justify-center overflow-hidden bg-[var(--background)] z-10">
                        <div className="absolute top-0 left-0 right-0 pt-8 md:pt-12 px-6 md:px-16 pb-8 z-20 bg-gradient-to-b from-[var(--background)] via-[var(--background)] to-transparent pointer-events-none">
                            <h2 className="font-display text-[32px] md:text-[40px] font-bold text-[var(--text-primary)] tracking-tight pointer-events-auto">
                                Kapasitas Platform
                            </h2>
                            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] mt-2 max-w-xl pointer-events-auto">
                                Empat modul inti yang menangani pengadaan dari draft tender hingga hasil akhir tercatat di blockchain.
                            </p>
                        </div>

                        <motion.div style={{ x }} className="flex w-[400%] h-full items-center pt-32 md:pt-24">
                            {/* Card 1 */}
                            <div className="w-[25%] px-4 md:px-16 flex-shrink-0 flex items-center justify-center">
                                <div className="bento-card w-full max-w-6xl h-[60vh] flex flex-col md:flex-row overflow-hidden group">
                                    <div className="w-full md:w-1/2 relative h-[45%] md:h-full shrink-0">
                                        <Image
                                            src="/assets/Edmond%20Dantes%20Photo.jpg"
                                            alt="Efisiensi Tim"
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center flex-1 overflow-y-auto">
                                        <h3 className="font-display text-[26px] md:text-[32px] font-bold text-[var(--text-primary)] mb-2 md:mb-4">
                                            Fokus pada Keputusan
                                        </h3>
                                        <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
                                            Sistem mengotomatisasi pencatatan dan keamanan data agar tim pengadaan Anda
                                            dapat memfokuskan waktu pada evaluasi kualitas vendor, bukan administrasi
                                            teknis.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="w-[25%] px-4 md:px-16 flex-shrink-0 flex items-center justify-center">
                                <div className="bento-card w-full max-w-6xl h-[60vh] flex flex-col md:flex-row overflow-hidden group">
                                    <div className="w-full md:w-1/2 relative h-[45%] md:h-full shrink-0">
                                        <Image
                                            src="/assets/Mining%20Photo%20from%20Pexels.jpg"
                                            alt="Skala Industri"
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center flex-1 overflow-y-auto">
                                        <h3 className="font-display text-[26px] md:text-[32px] font-bold text-[var(--text-primary)] mb-2 md:mb-4">
                                            Infrastruktur Kelas Berat
                                        </h3>
                                        <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
                                            Dirancang untuk pengadaan skala industri. Sistem sanggup memproses tender
                                            dengan ribuan baris rincian teknis tanpa penurunan kecepatan respons.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="w-[25%] px-4 md:px-16 flex-shrink-0 flex items-center justify-center">
                                <div className="bento-card w-full max-w-6xl h-[60vh] flex flex-col md:flex-row overflow-hidden group">
                                    <div className="w-full md:w-1/2 relative h-[45%] md:h-full shrink-0">
                                        <Image
                                            src="/assets/Office%20Photo%207750129.jpg"
                                            alt="Kolaborasi Transparan"
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center flex-1 overflow-y-auto">
                                        <h3 className="font-display text-[26px] md:text-[32px] font-bold text-[var(--text-primary)] mb-2 md:mb-4">
                                            Ruang Kontrol Terpusat
                                        </h3>
                                        <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
                                            Semua anggota komite memantau status secara serentak dari satu sumber data.
                                            Tidak ada dokumen tertinggal atau informasi asimetris.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4 */}
                            <div className="w-[25%] px-4 md:px-16 flex-shrink-0 flex items-center justify-center">
                                <div className="bento-card w-full max-w-6xl h-[60vh] flex flex-col md:flex-row overflow-hidden group">
                                    <div className="w-full md:w-1/2 relative h-[45%] md:h-full shrink-0">
                                        <Image
                                            src="/assets/Working%20Photo%20from%20Pexels.jpg"
                                            alt="Evaluasi Akurat"
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center flex-1 overflow-y-auto">
                                        <h3 className="font-display text-[26px] md:text-[32px] font-bold text-[var(--text-primary)] mb-2 md:mb-4">
                                            Verifikasi Otentik
                                        </h3>
                                        <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
                                            Jejak hash kriptografis mencegah manipulasi pasca-batas waktu. Anda
                                            mengevaluasi data otentik yang dapat dibuktikan kebenarannya melalui smart
                                            contract.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Live Stats Bento Grid */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {loading ? (
                        <div className="col-span-3 flex justify-center py-20">
                            <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
                        </div>
                    ) : stats ? (
                        <>
                            <div className="bento-card p-8 space-y-4 col-span-1 md:col-span-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Shield className="w-32 h-32 text-[var(--accent)]" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[13px] font-semibold text-[var(--accent)] uppercase tracking-wider">
                                        Tender Aktif
                                    </p>
                                    <div className="mt-4 flex items-baseline gap-3">
                                        <span className="font-display text-[64px] font-bold text-[var(--text-primary)] tracking-tight leading-none">
                                            {stats.totalTenders}
                                        </span>
                                        <span className="text-[16px] text-[var(--text-secondary)] font-medium">
                                            total dokumen
                                        </span>
                                    </div>
                                    <p className="text-[15px] text-[var(--text-tertiary)] mt-2 font-medium">
                                        {stats.openTenders} tender sedang menerima penawaran saat ini.
                                    </p>
                                </div>
                            </div>

                            <div className="bento-card p-8 space-y-4 flex flex-col justify-between">
                                <div>
                                    <p className="text-[13px] font-semibold text-[var(--accent-blue)] uppercase tracking-wider">
                                        Penawaran Tersegel
                                    </p>
                                    <p className="font-display text-[48px] font-bold text-[var(--text-primary)] tracking-tight leading-none mt-4">
                                        {stats.totalBids}
                                    </p>
                                </div>
                                <p className="text-[14px] text-[var(--text-tertiary)] font-medium">
                                    Dienkripsi & tersimpan aman di Sepolia Network.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-3 bento-card p-12 text-center border-dashed">
                            <p className="text-[var(--text-secondary)] font-medium">
                                Sistem bersih. Mulai inisiasi tender pertama Anda.
                            </p>
                        </div>
                    )}
                </motion.section>

                {/* Architecture / How it Works */}
                <section className="space-y-16">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-display text-[40px] font-bold text-[var(--text-primary)] tracking-tight"
                        >
                            Protokol Commit-Reveal
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-[18px] text-[var(--text-secondary)] mt-4 font-medium leading-relaxed"
                        >
                            Tiga langkah matematis. Tanpa PIN yang Anda pegang, tidak ada satu pun pihak yang bisa membuka isi penawaran lebih awal.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent -z-10" />

                        {[
                            {
                                step: "01",
                                title: "Enkripsi Lokal",
                                desc: "Harga Anda dienkripsi di browser dengan AES-256-GCM. Kunci turunan Argon2id tidak pernah dikirim ke server.",
                                icon: Lock,
                            },
                            {
                                step: "02",
                                title: "Komitmen Blockchain",
                                desc: "Hash kriptografis dari penawaran Anda dicatat permanen ke Ethereum Smart Contract sebelum deadline.",
                                icon: Shield,
                            },
                            {
                                step: "03",
                                title: "Dekripsi & Verifikasi",
                                desc: "Hanya saat fase pembukaan, PIN digunakan untuk membuka data. Hash dicocokkan otomatis untuk validasi.",
                                icon: Eye,
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                className="relative group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-center mb-8 relative z-10 group-hover:border-[var(--accent)] transition-colors">
                                    <item.icon className="w-7 h-7 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <p className="font-display text-[14px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                                        {item.step}
                                    </p>
                                    <h3 className="font-display text-[22px] font-bold text-[var(--text-primary)] tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Tutorial: Alur Pembuatan Tender - Interactive Accordion */}
                <section className="space-y-12">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-display text-[40px] font-bold text-[var(--text-primary)] tracking-tight"
                        >
                            Protokol Inisiasi
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-[18px] text-[var(--text-secondary)] mt-4 font-medium leading-relaxed"
                        >
                            Empat tahap deterministik. Arahkan kursor ke setiap panel untuk melihat detail proses.
                        </motion.p>
                    </div>

                    <div className="flex flex-col md:flex-row h-[800px] md:h-[500px] gap-4 w-full cursor-pointer">
                        {[
                            {
                                id: "01",
                                title: "Konfigurasi Base",
                                desc: "Tentukan ruang lingkup teknis, jadwal kriptografis untuk fase komitmen, dan jendela waktu presisi untuk pembukaan harga.",
                                icon: FileText,
                                accent: "rgba(16,185,129,0.2)",
                            },
                            {
                                id: "02",
                                title: "Enkripsi Dokumen",
                                desc: "Lampirkan Kerangka Acuan Kerja. Sistem akan melakukan hashing secara lokal untuk menjamin integritas file sebelum dikirim.",
                                icon: Upload,
                                accent: "rgba(59,130,246,0.2)",
                            },
                            {
                                id: "03",
                                title: "Distribusi Akses",
                                desc: "Otorisasi vendor terdaftar. Kunci publik mereka dienkripsi ke dalam sesi tender, memastikan hanya entitas sah yang dapat berpartisipasi.",
                                icon: Users,
                                accent: "rgba(245,158,11,0.2)",
                            },
                            {
                                id: "04",
                                title: "Injeksi Kontrak",
                                desc: "Smart contract mengambil alih otoritas waktu. Sistem secara absolut akan menolak paket penawaran sedetik setelah batas waktu.",
                                icon: Rocket,
                                accent: "rgba(139,92,246,0.2)",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                onHoverStart={() => setActiveStep(i)}
                                onClick={() => setActiveStep(i)}
                                animate={{
                                    flex: activeStep === i ? 4 : 1,
                                    opacity: activeStep === i ? 1 : 0.5,
                                }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className={`relative rounded-[2rem] overflow-hidden border p-6 md:p-8 flex flex-col justify-end transition-colors ${
                                    activeStep === i
                                        ? "bg-[var(--surface)] border-[var(--border)]"
                                        : "bg-transparent border-[var(--border)]/30 hover:border-[var(--border)]"
                                }`}
                            >
                                {/* Decorative glowing orb when active */}
                                {activeStep === i && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
                                        style={{ backgroundColor: item.accent }}
                                    />
                                )}

                                <div className="absolute top-6 left-6 md:top-8 md:left-8">
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${activeStep === i ? "bg-[var(--surface-secondary)] scale-110" : "bg-transparent scale-100"}`}
                                    >
                                        <item.icon
                                            className={`w-6 h-6 transition-colors duration-500 ${activeStep === i ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}
                                        />
                                    </div>
                                </div>

                                <div
                                    className="absolute top-6 right-6 md:top-8 md:right-8 font-display text-5xl md:text-8xl font-bold transition-all duration-700"
                                    style={{ color: activeStep === i ? "var(--surface-secondary)" : "var(--border)" }}
                                >
                                    {item.id}
                                </div>

                                <div className="mt-auto relative z-10 w-full min-w-[200px]">
                                    <motion.div
                                        animate={{
                                            rotate: activeStep === i ? 0 : 0,
                                            // Optional: on very small un-active states, we could rotate text, but flex handles it if we keep it simple
                                        }}
                                        className="origin-bottom-left"
                                    >
                                        <h3
                                            className={`font-display font-bold transition-all duration-500 whitespace-nowrap ${activeStep === i ? "text-[32px] text-[var(--text-primary)] mb-4" : "text-[20px] text-[var(--text-secondary)] md:-rotate-90 md:translate-y-[-100px] md:origin-bottom-left"}`}
                                        >
                                            {item.title}
                                        </h3>

                                        <div
                                            className={`overflow-hidden transition-all duration-700 ease-in-out ${activeStep === i ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}
                                        >
                                            <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed max-w-md">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Infinite Scrolling Testimonials */}
                <section className="py-24 space-y-16">
                    <div className="text-center max-w-3xl mx-auto px-4 relative z-10">
                        <h2 className="font-display text-[40px] font-bold text-[var(--text-primary)] tracking-tight">
                            Protokol Kepercayaan
                        </h2>
                        <p className="text-[18px] text-[var(--text-secondary)] mt-4 font-medium">
                            Pandangan dari sisi pengadaan dan sisi vendor.
                        </p>
                    </div>

                    <div className="relative h-[900px] overflow-hidden -mx-6 px-6">
                        {/* Gradient masks for smooth fade at top/bottom */}
                        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[var(--background)] to-transparent z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent z-10 pointer-events-none" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                            {/* Column 1 - Scrolls Up */}
                            <div className="h-full overflow-hidden">
                                <motion.div
                                    animate={{ y: ["0%", "-50%"] }}
                                    transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
                                    className="flex flex-col gap-6"
                                >
                                    {[
                                        {
                                            quote: "Audit log di smart contract tidak bisa direkayasa oleh siapapun, termasuk administrator IT internal. Bukti kriptografis ini menghilangkan perdebatan soal transparansi.",
                                            name: "Kepala Divisi Pengadaan",
                                            title: "Institusi Pemerintah",
                                            highlight: true,
                                        },
                                        {
                                            quote: "Enkripsi sisi klien membuat panitia tidak bisa mengakses harga penawaran sebelum waktu buka. Celah kolusi teknis tertutup.",
                                            name: "Lead Internal Auditor",
                                            title: "BUMN",
                                            highlight: false,
                                        },
                                        {
                                            quote: "Verifikasi kualifikasi vendor kini terpusat. Kami tidak perlu lagi sinkronisasi data antar cabang secara manual.",
                                            name: "VP Operations",
                                            title: "Perusahaan Swasta",
                                            highlight: false,
                                        },
                                        {
                                            quote: "Tidak ada lagi insiden dokumen hilang atau perselisihan timestamp. Semua transaksi tercatat permanen di ledger.",
                                            name: "Legal Officer",
                                            title: "Konsorsium Pengadaan",
                                            highlight: false,
                                        },
                                    ]
                                        .concat([
                                            {
                                                quote: "Audit logs di smart contract tidak bisa direkayasa oleh siapapun, termasuk administrator IT internal. Bukti kriptografis ini mengeliminasi perdebatan tentang transparansi.",
                                                name: "Budi S.",
                                                title: "Kepala Divisi Pengadaan",
                                                highlight: true,
                                            },
                                            {
                                                quote: "Enkripsi sisi klien menjamin panitia zero-knowledge terhadap harga penawaran sebelum waktu yang ditetapkan. Celah kolusi ditutup rapat.",
                                                name: "Rina A.",
                                                title: "Lead Internal Auditor",
                                                highlight: false,
                                            },
                                            {
                                                quote: "Proses verifikasi kualifikasi teknis vendor kini terpusat dan konsisten. Kami tidak perlu lagi melakukan sinkronisasi data antar cabang secara manual.",
                                                name: "Hendra T.",
                                                title: "VP Operations",
                                                highlight: false,
                                            },
                                            {
                                                quote: "Kami tidak lagi berurusan dengan insiden 'dokumen hilang' atau perselisihan timestamp. Semua transaksi terukir permanen di ledger.",
                                                name: "Siska M.",
                                                title: "Legal Officer",
                                                highlight: false,
                                            },
                                        ])
                                        .map((item, i) => (
                                            <div
                                                key={i}
                                                className={`bento-card p-8 ${item.highlight ? "bg-[var(--surface-secondary)]/50 border-[var(--border)]" : ""}`}
                                            >
                                                <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed italic">
                                                    "{item.quote}"
                                                </p>
                                                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                                                    <p className="font-bold text-[var(--text-primary)]">{item.name}</p>
                                                    <p className="text-[14px] text-[var(--text-tertiary)]">
                                                        {item.title}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </motion.div>
                            </div>

                            {/* Column 2 - Scrolls Down */}
                            <div className="h-full overflow-hidden hidden md:block">
                                <motion.div
                                    animate={{ y: ["-50%", "0%"] }}
                                    transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
                                    className="flex flex-col gap-6"
                                >
                                    {[
                                        {
                                            quote: "Validasi hash otomatis membuktikan bahwa dokumen vendor persis dengan yang dikirim sebelum batas waktu. Tidak ada ruang untuk substitusi.",
                                            name: "Vendor Konstruksi",
                                            title: "Rekanan Pengadaan",
                                            highlight: true,
                                        },
                                        {
                                            quote: "Awalnya kami skeptis dengan blockchain. Namun arsitektur commit-reveal memberikan kerahasiaan harga yang dijamin secara matematis, bukan sekadar janji.",
                                            name: "Ketua ULP",
                                            title: "Lembaga Negara",
                                            highlight: false,
                                        },
                                        {
                                            quote: "Tidak ada server terpusat berarti tidak ada single point of failure. Proses pengadaan bernilai tinggi bisa berjalan tanpa bergantung pada satu infrastruktur.",
                                            name: "CTO",
                                            title: "Perusahaan Teknologi",
                                            highlight: false,
                                        },
                                        {
                                            quote: "Sistem menolak akses setelah batas waktu secara mutlak. Lobi pasca-penutupan menjadi tidak relevan secara teknis.",
                                            name: "Direktur Utama",
                                            title: "Vendor Alat Kesehatan",
                                            highlight: false,
                                        },
                                    ]
                                        .concat([
                                            {
                                                quote: "Siklus rekonsiliasi data turun 80%. Validasi hash otomatis membuktikan bahwa dokumen vendor sama persis dengan yang dikirim sebelum batas waktu.",
                                                name: "PT Konstruksi Nusantara",
                                                title: "Vendor Rekanan",
                                                highlight: true,
                                            },
                                            {
                                                quote: "Awalnya kami skeptis dengan blockchain. Namun arsitektur commit-reveal memberikan kerahasiaan harga yang dijamin secara matematis, bukan sekadar janji.",
                                                name: "Ketua ULP",
                                                title: "Lembaga Negara",
                                                highlight: false,
                                            },
                                            {
                                                quote: "Tidak ada server terpusat berarti tidak ada single point of failure. Kami bisa melakukan proses pengadaan bernilai tinggi tanpa cemas soal downtime.",
                                                name: "Dr. Anton",
                                                title: "CTO, Fintech",
                                                highlight: false,
                                            },
                                            {
                                                quote: "Struktur deterministik ini memaksa seluruh pihak bermain bersih, mengeliminasi lobi-lobi pasca-penutupan tender karena sistem menolak akses secara mutlak.",
                                                name: "Direktur Utama",
                                                title: "Vendor Alat Kesehatan",
                                                highlight: false,
                                            },
                                        ])
                                        .map((item, i) => (
                                            <div
                                                key={i}
                                                className={`bento-card p-8 ${item.highlight ? "bg-[var(--accent)]/10 border-[var(--accent)]/20" : ""}`}
                                            >
                                                <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed italic">
                                                    "{item.quote}"
                                                </p>
                                                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                                                    <p className="font-bold text-[var(--text-primary)]">{item.name}</p>
                                                    <p className="text-[14px] text-[var(--text-tertiary)]">
                                                        {item.title}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </motion.div>
                            </div>

                            {/* Column 3 - Scrolls Up (Slightly slower) */}
                            <div className="h-full overflow-hidden hidden lg:block">
                                <motion.div
                                    animate={{ y: ["0%", "-50%"] }}
                                    transition={{ repeat: Infinity, ease: "linear", duration: 50 }}
                                    className="flex flex-col gap-6"
                                >
                                    {[
                                        {
                                            quote: "Sistem ini melindungi integritas panitia. Tidak ada peluang tekanan eksternal untuk membocorkan harga karena dekripsi butuh otorisasi kunci vendor.",
                                            name: "Direktur Kepatuhan",
                                            title: "BUMN Karya",
                                            highlight: false,
                                        },
                                        {
                                            quote: "Mampu memproses 5.000+ dokumen penawaran tanpa hambatan. State blockchain disinkronisasi sempurna tanpa mengorbankan metrik web performance.",
                                            name: "Principal Engineer",
                                            title: "Konsultan IT",
                                            highlight: true,
                                        },
                                        {
                                            quote: "Zero-trust protocol yang diimplementasikan TenderSeal secara efektif mengubah standar kewajaran dan keamanan pengadaan di sektor publik.",
                                            name: "Ketua Satgas",
                                            title: "Lembaga Anti-Korupsi",
                                            highlight: false,
                                        },
                                        {
                                            quote: "Efisiensi pengadaan meningkat 3x lipat, sementara risiko sanggahan (dispute) dari peserta tender turun hingga menyentuh angka nol.",
                                            name: "Kepala Biro Logistik",
                                            title: "Pemerintah Provinsi",
                                            highlight: false,
                                        },
                                    ]
                                        .concat([
                                            {
                                                quote: "Sistem ini melindungi integritas panitia. Tidak ada peluang tekanan eksternal untuk membocorkan harga karena dekripsi butuh otorisasi kunci vendor.",
                                                name: "Direktur Kepatuhan",
                                                title: "BUMN Karya",
                                                highlight: false,
                                            },
                                            {
                                                quote: "Mampu memproses 5.000+ dokumen penawaran tanpa hambatan. State blockchain disinkronisasi sempurna tanpa mengorbankan metrik web performance.",
                                                name: "Principal Engineer",
                                                title: "Konsultan IT",
                                                highlight: true,
                                            },
                                            {
                                                quote: "Zero-trust protocol yang diimplementasikan TenderSeal secara efektif mengubah standar kewajaran dan keamanan pengadaan di sektor publik.",
                                                name: "Ketua Satgas",
                                                title: "Lembaga Anti-Korupsi",
                                                highlight: false,
                                            },
                                            {
                                                quote: "Efisiensi pengadaan meningkat 3x lipat, sementara risiko sanggahan (dispute) dari peserta tender turun hingga menyentuh angka nol.",
                                                name: "Kepala Biro Logistik",
                                                title: "Pemerintah Provinsi",
                                                highlight: false,
                                            },
                                        ])
                                        .map((item, i) => (
                                            <div
                                                key={i}
                                                className={`bento-card p-8 ${item.highlight ? "bg-[var(--surface-secondary)]/50 border-[var(--border)]" : ""}`}
                                            >
                                                <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed italic">
                                                    "{item.quote}"
                                                </p>
                                                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                                                    <p className="font-bold text-[var(--text-primary)]">{item.name}</p>
                                                    <p className="text-[14px] text-[var(--text-tertiary)]">
                                                        {item.title}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="pt-32 pb-16 border-t border-[var(--border)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                        {/* Left Column (FAQ List) */}
                        <div className="lg:col-span-8 flex flex-col">
                            {[
                                {
                                    q: "Bagaimana cara sistem mengenkripsi penawaran?",
                                    a: "Sistem mengenkripsi penawaran Anda langsung di browser menggunakan AES-256-GCM. Kunci dekripsi tetap berada di pihak Anda dan tidak pernah dikirim ke server sebelum waktu buka penawaran (reveal phase).",
                                },
                                {
                                    q: "Apakah panitia bisa melihat harga sebelum batas waktu?",
                                    a: "Sama sekali tidak. Tanpa Kunci Dekripsi yang Anda kirimkan pada fase reveal, panitia maupun administrator sistem tidak memiliki kemampuan teknis untuk membaca dokumen penawaran Anda.",
                                },
                                {
                                    q: "Bagaimana jika saya lupa Kunci Dekripsi saya?",
                                    a: "Karena arsitektur zero-knowledge, kami tidak menyimpan salinan kunci Anda. Jika Anda kehilangan kunci tersebut, penawaran Anda tidak dapat dibuka (void) dan Anda harus membuat penawaran baru (jika masih dalam masa pengiriman).",
                                },
                                {
                                    q: "Apakah TenderSeal menggunakan cryptocurrency?",
                                    a: "Tidak. Kami menggunakan teknologi smart contract (blockchain) murni sebagai ledger terdesentralisasi untuk mencatat log audit secara permanen, tanpa melibatkan transaksi mata uang kripto.",
                                },
                                {
                                    q: "Apakah sistem ini mematuhi standar regulasi pengadaan?",
                                    a: "Ya. Sistem kami memperkuat transparansi dan auditabilitas secara matematis, sangat sejalan dengan prinsip dasar pengadaan dan standar keamanan data elektronik.",
                                },
                            ].map((faq, i) => (
                                <div key={i} className="border-b border-[var(--border-light)] first:border-t">
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                                        className="w-full py-8 flex items-center justify-between text-left group"
                                    >
                                        <div className="flex items-center gap-6 md:gap-12 w-full pr-8">
                                            <span className="text-[14px] font-medium text-[var(--text-tertiary)] w-6 shrink-0">
                                                0{i + 1}.
                                            </span>
                                            <span className="text-[18px] md:text-[22px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                                                {faq.q}
                                            </span>
                                        </div>
                                        <span className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0">
                                            {openFaqIndex === i ? (
                                                <Minus className="w-5 h-5" />
                                            ) : (
                                                <Plus className="w-5 h-5" />
                                            )}
                                        </span>
                                    </button>
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: openFaqIndex === i ? "auto" : 0,
                                            opacity: openFaqIndex === i ? 1 : 0,
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pb-8 pl-12 md:pl-24 pr-6 text-[16px] text-[var(--text-secondary)] leading-relaxed font-medium">
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                </div>
                            ))}
                        </div>

                        {/* Right Column (Sticky CTA) */}
                        <div className="lg:col-span-4 relative">
                            <div className="sticky top-32 space-y-6">
                                <p className="text-[13px] font-bold tracking-widest uppercase text-[var(--text-tertiary)]">
                                    FAQ
                                </p>
                                <h2 className="font-display text-[40px] md:text-[48px] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                                    Masih ada pertanyaan?
                                </h2>
                                <p className="text-[18px] text-[var(--text-secondary)] font-medium leading-relaxed">
                                    Ada pertanyaan teknis soal enkripsi, blockchain, atau alur tender? Tulis ke tim kami.
                                </p>
                                <div className="pt-6">
                                    <Link href="/support" className="btn-primary px-8 py-4 text-[16px] rounded-full">
                                        Hubungi Kami
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <HomeFooter />
        </main>
    );
}
