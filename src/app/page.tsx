"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { PlusCircle, ArrowRight, Shield, Lock, FileKey, Eye } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CryptoVaultScene } from "@/components/crypto-vault";

interface DashboardStats {
    totalTenders: number;
    openTenders: number;
    totalBids: number;
}

export default function HomePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

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

    const stagger = {
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
        <div className="flex flex-col gap-32 pb-32 overflow-hidden w-full max-w-[1440px] mx-auto px-6">
            {/* Immersive Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-between pt-10">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[rgba(16,185,129,0.05)] via-transparent to-transparent pointer-events-none" />
                
                <div className="w-full lg:w-1/2 space-y-8 z-10">
                    <motion.div custom={0} initial="hidden" animate="visible" variants={stagger} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Sistem Aktif & Terlindungi</span>
                    </motion.div>

                    <motion.h1 custom={1} initial="hidden" animate="visible" variants={stagger} className="font-display text-[64px] sm:text-[80px] font-bold tracking-tighter text-[var(--text-primary)] leading-[1.05]">
                        Pengadaan digital
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-tertiary)]">yang mustahil diintip.</span>
                    </motion.h1>

                    <motion.p custom={2} initial="hidden" animate="visible" variants={stagger} className="text-[18px] text-[var(--text-secondary)] leading-relaxed max-w-xl font-medium">
                        TenderSeal menggunakan <span className="text-[var(--text-primary)]">Commit-Reveal Cryptography</span> di sisi klien. Server tidak pernah melihat isi harga Anda. Smart contract mencatat setiap langkah.
                    </motion.p>

                    <motion.div custom={3} initial="hidden" animate="visible" variants={stagger} className="flex flex-wrap items-center gap-4 pt-4">
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

                        <Link href="/audit" className="px-8 py-4 rounded-full border border-[var(--border)] text-[var(--text-primary)] font-semibold text-[15px] hover:bg-[var(--surface-secondary)] transition-all">
                            Lihat Jejak Audit
                        </Link>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="hidden lg:block absolute right-0 w-[55%] h-[90vh] pointer-events-none"
                    style={{ y }}
                >
                    <CryptoVaultScene />
                </motion.div>
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
                                <p className="text-[13px] font-semibold text-[var(--accent)] uppercase tracking-wider">Tender Aktif</p>
                                <div className="mt-4 flex items-baseline gap-3">
                                    <span className="font-display text-[64px] font-bold text-[var(--text-primary)] tracking-tight leading-none">{stats.totalTenders}</span>
                                    <span className="text-[16px] text-[var(--text-secondary)] font-medium">total dokumen</span>
                                </div>
                                <p className="text-[15px] text-[var(--text-tertiary)] mt-2 font-medium">{stats.openTenders} tender sedang menerima penawaran saat ini.</p>
                            </div>
                        </div>

                        <div className="bento-card p-8 space-y-4 flex flex-col justify-between">
                            <div>
                                <p className="text-[13px] font-semibold text-[var(--accent-blue)] uppercase tracking-wider">Penawaran Tersegel</p>
                                <p className="font-display text-[48px] font-bold text-[var(--text-primary)] tracking-tight leading-none mt-4">{stats.totalBids}</p>
                            </div>
                            <p className="text-[14px] text-[var(--text-tertiary)] font-medium">Dienkripsi & tersimpan aman di Sepolia Network.</p>
                        </div>
                    </>
                ) : (
                    <div className="col-span-3 bento-card p-12 text-center border-dashed">
                        <p className="text-[var(--text-secondary)] font-medium">Sistem bersih. Mulai inisiasi tender pertama Anda.</p>
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
                        Tiga langkah matematis yang menjamin manipulasi harga adalah hal yang tidak mungkin secara kriptografis.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting line */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent -z-10" />

                    {[
                        { step: "01", title: "Enkripsi Lokal", desc: "Harga Anda dienkripsi di browser dengan AES-256-GCM. Kunci turunan Argon2id tidak pernah dikirim ke server.", icon: Lock },
                        { step: "02", title: "Komitmen Blockchain", desc: "Hash kriptografis dari penawaran Anda dicatat permanen ke Ethereum Smart Contract sebelum deadline.", icon: Shield },
                        { step: "03", title: "Dekripsi & Verifikasi", desc: "Hanya saat fase pembukaan, PIN digunakan untuk membuka data. Hash dicocokkan otomatis untuk validasi.", icon: Eye },
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
                                <p className="font-display text-[14px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{item.step}</p>
                                <h3 className="font-display text-[22px] font-bold text-[var(--text-primary)] tracking-tight">{item.title}</h3>
                                <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
