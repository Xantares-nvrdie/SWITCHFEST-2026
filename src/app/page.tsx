"use client";

import Link from "next/link";
import { useDemo } from "@/context/demo-context";
import {
    ShieldCheck,
    Lock,
    KeyRound,
    FileCode2,
    Database,
    PlusCircle,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    FileSpreadsheet,
    Activity,
    Layers,
    Cpu,
    ExternalLink,
} from "lucide-react";

export default function HomePage() {
    const { activeRole } = useDemo();

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl glass-panel p-8 lg:p-12 border-slate-800">
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>NextGen Secure Digital Procurement</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Your Tender. Your Bid. <br />
                        <span className="gradient-text">Sealed Until Deadline.</span>
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed">
                        TenderSeal melindungi kerahasiaan penawaran vendor menggunakan{" "}
                        <strong>Client-side AES-GCM Encryption</strong>,<strong> Commit-Reveal Scheme</strong>, dan{" "}
                        <strong>Smart Contract Audit Trail</strong> untuk mengeliminasi risiko kebocoran harga oleh
                        pihak internal.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        {activeRole === "PROCUREMENT_OFFICER" ? (
                            <Link
                                href="/tenders/create"
                                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 group"
                            >
                                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                Create New Tender
                            </Link>
                        ) : (
                            <Link
                                href="/tenders"
                                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 group"
                            >
                                <Lock className="w-5 h-5" />
                                Browse & Submit Bids
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}

                        <Link
                            href="/tenders"
                            className="px-6 py-3.5 rounded-xl glass-panel text-slate-200 font-semibold text-sm hover:bg-slate-800/80 transition-colors border border-slate-700 flex items-center gap-2"
                        >
                            Explore Tenders
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Active Tenders
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <FileSpreadsheet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">4</div>
                    <p className="text-xs text-emerald-400 font-medium">1 Open • 2 Sealed • 1 Scoring</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Sealed Bids
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            <Lock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">12</div>
                    <p className="text-xs text-cyan-400 font-medium">100% Client Encrypted</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Commitments On-Chain
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Cpu className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">12</div>
                    <p className="text-xs text-purple-400 font-medium">Anchored on Smart Contract</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Audited Actions
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Activity className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">38</div>
                    <p className="text-xs text-indigo-400 font-medium">100% Audit Trail Verified</p>
                </div>
            </div>

            {/* Architecture Highlights & Commit-Reveal Workflow */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            Perlindungan Berlapis TenderSeal
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Alur keamanan kriptografi dari browser vendor sampai tahap penilaian.
                        </p>
                    </div>
                    <Link
                        href="/audit"
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                        View Audit Log Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="glass-panel glass-panel-hover p-6 rounded-2xl border-slate-800 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                            1
                        </div>
                        <h3 className="font-bold text-white text-base">Client Encryption</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Penawaran dienkripsi di browser vendor (AES-GCM 256-bit) menggunakan key dari PIN/Secret
                            vendor via Argon2id/PBKDF2.
                        </p>
                    </div>

                    <div className="glass-panel glass-panel-hover p-6 rounded-2xl border-slate-800 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                            2
                        </div>
                        <h3 className="font-bold text-white text-base">Commitment On-Chain</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Hash SHA-256 penawaran + salt dicatat ke Smart Contract sebagai bukti bahwa isi bid sudah
                            dikunci sebelum deadline.
                        </p>
                    </div>

                    <div className="glass-panel glass-panel-hover p-6 rounded-2xl border-slate-800 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                            3
                        </div>
                        <h3 className="font-bold text-white text-base">Sealed Backup</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Server hanya menyimpan ciphertext terenkripsi. Server <strong>TIDAK PERNAH</strong>{" "}
                            menyimpan plaintext bid atau PIN vendor.
                        </p>
                    </div>

                    <div className="glass-panel glass-panel-hover p-6 rounded-2xl border-slate-800 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                            4
                        </div>
                        <h3 className="font-bold text-white text-base">Reveal & Verify</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Setelah deadline, vendor memasukkan PIN untuk dekripsi di client. Hash diverifikasi ulang
                            dengan commitment di Smart Contract.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Interactive Tenders Showcase */}
            <section className="glass-panel p-8 rounded-3xl border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Daftar Tender Terbaru</h2>
                        <p className="text-xs text-slate-400">Tender aktif yang dapat dikelola atau diikuti</p>
                    </div>
                    <Link
                        href="/tenders"
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    >
                        Lihat Semua Tender
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Demo Tender Card 1 */}
                    <div className="glass-panel p-6 rounded-2xl border-slate-800/80 space-y-4 hover:border-emerald-500/40 transition-colors">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                TND-2026-001
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                                OPEN
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Pengadaan 100 Laptop High Performance</h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                Pengadaan laptop workstation untuk tim pengembang software dan desain grafis.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                            <div>
                                <span className="block text-slate-500">Commit Deadline</span>
                                <span className="font-semibold text-slate-200">18 Sep 2026, 15:00</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Reveal Window</span>
                                <span className="font-semibold text-slate-200">48 Jam</span>
                            </div>
                        </div>
                        <Link
                            href="/tenders/tnd-demo-001"
                            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-center text-xs font-semibold text-emerald-400 transition-colors block"
                        >
                            Buka Interactive Workbench →
                        </Link>
                    </div>

                    {/* Demo Tender Card 2 */}
                    <div className="glass-panel p-6 rounded-2xl border-slate-800/80 space-y-4 hover:border-cyan-500/40 transition-colors">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                TND-2026-002
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300">
                                REVEAL
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Jasa Pengembangan Platform E-Procurement</h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                Jasa konsultan dan pengembang perangkat lunak e-procurement berbasis blockchain.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                            <div>
                                <span className="block text-slate-500">Status Reveal</span>
                                <span className="font-semibold text-cyan-300">3 dari 4 Vendor Revealed</span>
                            </div>
                            <div>
                                <span className="block text-slate-500">Reveal Window Sisa</span>
                                <span className="font-semibold text-amber-300">14 Jam</span>
                            </div>
                        </div>
                        <Link
                            href="/tenders/tnd-demo-002"
                            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-center text-xs font-semibold text-cyan-400 transition-colors block"
                        >
                            Buka Interactive Workbench →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
