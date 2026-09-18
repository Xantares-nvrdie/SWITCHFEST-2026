"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
    ShieldCheck, Lock, KeyRound, FileCode2, PlusCircle, ArrowRight,
    CheckCircle2, Cpu, Eye,
} from "lucide-react";

const STEPS = [
    {
        n: "01", title: "Client Encryption",
        body: "Penawaran dienkripsi di browser vendor menggunakan AES-GCM 256-bit. Key diderivasi via Argon2id dari PIN rahasia vendor — server tidak pernah melihat plaintext.",
        color: "#3fb950", icon: Lock,
    },
    {
        n: "02", title: "Commitment On-Chain",
        body: "SHA-256 hash dari penawaran + salt dikirim ke Smart Contract sebelum deadline. Bukti kriptografis bahwa isi bid sudah dikunci dan tidak dapat diubah.",
        color: "#58a6ff", icon: Cpu,
    },
    {
        n: "03", title: "Sealed Storage",
        body: "Server hanya menyimpan ciphertext terenkripsi. Bahkan admin sistem tidak dapat membaca penawaran sebelum fase reveal dibuka oleh panitia.",
        color: "#bc8cff", icon: ShieldCheck,
    },
    {
        n: "04", title: "Reveal & Verify",
        body: "Setelah deadline, vendor memasukkan PIN untuk dekripsi di browser. Commitment hash diverifikasi ulang dengan data yang tersimpan di blockchain.",
        color: "#e3b341", icon: Eye,
    },
];

export default function HomePage() {
    const { data: session } = useSession();

    return (
        <div className="space-y-16 pb-4">

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative pt-8 pb-12">
                <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                    <div
                        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[400px] rounded-full"
                        style={{ background: "radial-gradient(ellipse at center, rgba(63,185,80,.06) 0%, transparent 70%)" }}
                    />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <span
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: "rgba(63,185,80,.1)", border: "1px solid rgba(63,185,80,.22)", color: "#3fb950" }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
                            NextGen Secure Procurement
                        </span>
                    </div>

                    <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] mb-4" style={{ color: "#e6edf3" }}>
                        Tender dibuka.{" "}
                        <br />
                        <span className="gradient-text">Bid tersegel sampai deadline.</span>
                    </h1>

                    <p className="text-base leading-relaxed mb-8" style={{ color: "#7d8590", maxWidth: 520 }}>
                        TenderSeal melindungi penawaran vendor dengan{" "}
                        <strong style={{ color: "#8b949e", fontWeight: 600 }}>Client-Side AES-GCM Encryption</strong>,{" "}
                        <strong style={{ color: "#8b949e", fontWeight: 600 }}>Commit-Reveal Scheme</strong>, dan{" "}
                        <strong style={{ color: "#8b949e", fontWeight: 600 }}>Smart Contract Audit Trail</strong>{" "}
                        — eliminasi risiko kebocoran harga oleh pihak internal.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        {session ? (
                            <Link href="/tenders/create" className="btn btn-primary btn-lg">
                                <PlusCircle style={{ width: 18, height: 18 }} />
                                Buat Tender Baru
                            </Link>
                        ) : (
                            <Link href="/login" className="btn btn-primary btn-lg">
                                <Lock style={{ width: 18, height: 18 }} />
                                Masuk ke Platform
                                <ArrowRight style={{ width: 16, height: 16 }} />
                            </Link>
                        )}
                        <Link href="/tenders" className="btn btn-ghost btn-lg">
                            Jelajahi Tender
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── How it Works ─────────────────────────────────────── */}
            <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#e6edf3" }}>
                        Perlindungan Berlapis TenderSeal
                    </h2>
                    <p className="text-sm mt-1.5" style={{ color: "#7d8590" }}>
                        Alur kriptografi dari browser vendor sampai penetapan pemenang — setiap tahap teraudit.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.n} className="surface p-5 space-y-4 interactive">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: `${step.color}12`, border: `1px solid ${step.color}28` }}
                                    >
                                        <Icon style={{ width: 15, height: 15, color: step.color }} />
                                    </div>
                                    <span className="text-xs font-bold font-mono" style={{ color: `${step.color}88` }}>
                                        {step.n}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-1.5" style={{ color: "#e6edf3" }}>
                                        {step.title}
                                    </h3>
                                    <p className="text-xs leading-relaxed" style={{ color: "#7d8590" }}>
                                        {step.body}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── CTA / Assurance ──────────────────────────────────── */}
            <section
                className="rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ background: "rgba(63,185,80,.05)", border: "1px solid rgba(63,185,80,.12)" }}
            >
                <div className="flex items-center gap-3">
                    <ShieldCheck style={{ width: 20, height: 20, color: "#3fb950", flexShrink: 0 }} />
                    <p className="text-sm font-medium" style={{ color: "#8b949e" }}>
                        Zero-Knowledge Architecture — server tidak pernah menyimpan plaintext penawaran vendor.
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: "#484f58", whiteSpace: "nowrap" }}>
                    {[
                        { label: "AES-GCM 256-bit", color: "#3fb950" },
                        { label: "Argon2id KDF",    color: "#58a6ff" },
                        { label: "Smart Contract",  color: "#bc8cff" },
                    ].map((badge) => (
                        <span key={badge.label} className="flex items-center gap-1.5">
                            <CheckCircle2 style={{ width: 13, height: 13, color: badge.color }} />
                            {badge.label}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}
