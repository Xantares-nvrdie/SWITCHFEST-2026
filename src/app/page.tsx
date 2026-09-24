"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { PlusCircle, FileText, Loader2 } from "lucide-react";

interface DashboardStats {
    totalTenders: number;
    openTenders: number;
    totalBids: number;
}

export default function HomePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetch("/api/tenders")
            .then(async (r) => {
                if (!r.ok) return [];
                return await r.json();
            })
            .then((tenders: any[]) => {
                setStats({
                    totalTenders: tenders.length,
                    openTenders: tenders.filter((t: any) => t.status === "OPEN").length,
                    totalBids: tenders.reduce((acc: number, t: any) => acc + (t.bids?.length || 0), 0),
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-16 py-8">
            {/* Hero */}
            <section className="max-w-2xl space-y-6">
                <h1 className="text-[40px] font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
                    Pengadaan digital
                    <br />
                    yang tidak bisa diintip.
                </h1>

                <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed max-w-lg">
                    TenderSeal mengenkripsi penawaran vendor di dalam browser mereka sendiri.
                    Server tidak pernah melihat isi harga. Blockchain mencatat setiap langkah.
                </p>

                <div className="flex items-center gap-3 pt-2">
                    {session?.user ? (
                        <Link
                            href="/tenders/create"
                            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-semibold text-[14px] hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Buat Tender Baru
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-semibold text-[14px] hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Buat Tender Baru
                        </Link>
                    )}

                    <Link
                        href="/audit"
                        className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] font-medium text-[14px] hover:bg-[var(--surface-secondary)] transition-colors"
                    >
                        Jejak Audit
                    </Link>
                </div>
            </section>

            {/* Statistik dari data sungguhan */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 flex justify-center py-12">
                        <Loader2 className="w-5 h-5 text-[var(--text-tertiary)] animate-spin" />
                    </div>
                ) : stats ? (
                    <>
                        <div className="card p-6 space-y-1">
                            <p className="text-[13px] text-[var(--text-tertiary)] font-medium">Total Tender</p>
                            <p className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">
                                {stats.totalTenders}
                            </p>
                            <p className="text-[12px] text-[var(--text-tertiary)]">
                                {stats.openTenders} sedang dibuka
                            </p>
                        </div>

                        <div className="card p-6 space-y-1">
                            <p className="text-[13px] text-[var(--text-tertiary)] font-medium">Penawaran Tersegel</p>
                            <p className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">
                                {stats.totalBids}
                            </p>
                            <p className="text-[12px] text-[var(--text-tertiary)]">
                                Terenkripsi di browser vendor
                            </p>
                        </div>

                        <div className="card p-6 space-y-1">
                            <p className="text-[13px] text-[var(--text-tertiary)] font-medium">Jaringan</p>
                            <p className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">
                                Sepolia
                            </p>
                            <p className="text-[12px] text-[var(--text-tertiary)]">
                                Ethereum Testnet
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="col-span-3 card p-8 text-center">
                        <p className="text-[var(--text-tertiary)] text-sm">Belum ada data tender. Buat tender pertama Anda untuk memulai.</p>
                    </div>
                )}
            </section>

            {/* Cara Kerja */}
            <section className="space-y-8">
                <div>
                    <h2 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">
                        Bagaimana TenderSeal bekerja
                    </h2>
                    <p className="text-[15px] text-[var(--text-secondary)] mt-1">
                        Empat tahap yang menjamin kerahasiaan penawaran dari awal hingga penilaian.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border)] rounded-xl overflow-hidden">
                    <div className="bg-[var(--surface)] p-8 space-y-3">
                        <p className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">Tahap 1</p>
                        <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">Enkripsi di Browser</h3>
                        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                            Penawaran dienkripsi menggunakan AES-GCM 256-bit langsung di browser vendor.
                            Kunci dibuat dari PIN pribadi melalui Argon2id. Server tidak pernah menerima data mentah.
                        </p>
                    </div>

                    <div className="bg-[var(--surface)] p-8 space-y-3">
                        <p className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">Tahap 2</p>
                        <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">Komitmen ke Blockchain</h3>
                        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                            Hash SHA-256 dari penawaran dicatat ke Smart Contract sebelum tenggat waktu.
                            Ini membuktikan bahwa isi bid sudah dikunci dan tidak bisa diubah.
                        </p>
                    </div>

                    <div className="bg-[var(--surface)] p-8 space-y-3">
                        <p className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">Tahap 3</p>
                        <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">Penyimpanan Tersegel</h3>
                        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                            Server hanya menyimpan ciphertext. Dokumen lampiran dienkripsi ulang sebelum diunggah
                            ke penyimpanan awan. Tidak ada pihak yang bisa membaca isi file.
                        </p>
                    </div>

                    <div className="bg-[var(--surface)] p-8 space-y-3">
                        <p className="text-[12px] font-semibold text-[var(--accent)] uppercase tracking-wide">Tahap 4</p>
                        <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">Pembukaan dan Verifikasi</h3>
                        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                            Setelah tenggat, vendor memasukkan PIN untuk mendekripsi di browser mereka.
                            Hash diverifikasi ulang dengan catatan di Smart Contract. Setiap langkah tercatat di audit trail.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
