"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
    FileText,
    Search,
    Clock,
    Building2,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Hash,
    ShieldCheck
} from "lucide-react";

interface BidItem {
    id: string;
    tenderId: string;
    organizationId: string;
    commitmentHash: string;
    status: "SEALED" | "REVEALED_VALID" | "REVEALED_INVALID" | "WITHDRAWN";
    submittedAt: string;
    createdAt: string;
    tender?: {
        id: string;
        code: string;
        title: string;
        status: string;
    };
    organization?: {
        name: string;
    };
}

export default function BidsHistoryPage() {
    const { data: session } = useSession();
    const [bids, setBids] = useState<BidItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user) return;
        fetch("/api/bids/me")
            .then((res) => res.json())
            .then((data) => {
                setBids(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [session?.user]);

    const filteredBids = bids.filter((b) => {
        const matchesSearch =
            (b.tender?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (b.tender?.code.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (b.organization?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesSearch;
    });

    const statusClasses: Record<string, string> = {
        SEALED: "bg-blue-50 text-blue-600 border-blue-200",
        REVEALED_VALID: "bg-emerald-50 text-emerald-600 border-emerald-200",
        REVEALED_INVALID: "bg-red-50 text-red-600 border-red-200",
        WITHDRAWN: "bg-slate-50 text-slate-600 border-slate-200",
    };

    const statusLabels: Record<string, string> = {
        SEALED: "Terkunci (Sealed)",
        REVEALED_VALID: "Terbuka (Valid)",
        REVEALED_INVALID: "Terbuka (Invalid)",
        WITHDRAWN: "Ditarik",
    };

    return (
        <div className="space-y-8">
            {/* Judul Halaman */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight">Riwayat Penawaran</h1>
                    <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
                        Daftar seluruh bid terenkripsi yang pernah Anda atau organisasi Anda kirimkan.
                    </p>
                </div>
            </div>

            {/* Filter dan Pencarian */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan judul tender, kode, atau vendor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-colors"
                    />
                </div>
            </div>

            {/* Daftar Bid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-5 h-5 text-[var(--text-tertiary)] animate-spin" />
                </div>
            ) : filteredBids.length === 0 ? (
                <div className="card p-12 text-center space-y-2">
                    <p className="text-[var(--text-secondary)] text-[15px] font-medium">Tidak ada riwayat penawaran ditemukan</p>
                    <p className="text-[var(--text-tertiary)] text-[13px]">
                        Organisasi Anda belum pernah mengirimkan bid pada tender apa pun.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBids.map((bid) => (
                        <div
                            key={bid.id}
                            className="card p-6 flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-mono font-semibold text-[var(--text-tertiary)] tracking-wide flex items-center gap-1.5">
                                        <Hash className="w-3.5 h-3.5" /> Bid: {bid.id.substring(0, 8)}...
                                    </span>
                                    <span
                                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                            statusClasses[bid.status] || "bg-slate-50 text-slate-600 border-slate-200"
                                        }`}
                                    >
                                        {statusLabels[bid.status] || bid.status}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)] leading-snug">
                                        {bid.tender?.title || "Tender Tidak Diketahui"}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5 text-[12px] text-[var(--text-tertiary)]">
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5" />
                                            {bid.tender?.code}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-[var(--text-secondary)] font-medium">
                                            <Building2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                                            {bid.organization?.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-light)] text-[11px] space-y-1">
                                    <div className="flex items-center justify-between text-[var(--text-tertiary)]">
                                        <span>Commitment Hash:</span>
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                                    </div>
                                    <p className="font-mono font-medium text-[var(--text-secondary)] break-all leading-tight">
                                        {bid.commitmentHash}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)] text-[12px]">
                                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                        {new Date(bid.createdAt).toLocaleString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                                <Link
                                    href={`/tenders/${bid.tenderId}`}
                                    className="font-semibold text-[var(--accent)] hover:text-teal-700 transition-colors"
                                >
                                    Lihat Tender &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
