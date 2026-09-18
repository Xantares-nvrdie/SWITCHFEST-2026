"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    PlusCircle,
    Search,
    ArrowUpRight,
    Building2,
    SlidersHorizontal,
    Loader2,
    Inbox,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Tender {
    id: string;
    code: string;
    title: string;
    description: string | null;
    category: string | null;
    status: string;
    commitDeadline: string;
    revealWindowHours: number;
    organizationId: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { badge: string; dot: string; label: string }> = {
    DRAFT:     { badge: "badge-slate",   dot: "bg-[#484f58]", label: "Draft"     },
    OPEN:      { badge: "badge-emerald", dot: "bg-[#3fb950]", label: "Open"      },
    CLOSED:    { badge: "badge-amber",   dot: "bg-[#e3b341]", label: "Closed"    },
    REVEAL:    { badge: "badge-cyan",    dot: "bg-[#58a6ff]", label: "Reveal"    },
    SCORING:   { badge: "badge-purple",  dot: "bg-[#bc8cff]", label: "Scoring"   },
    COMPLETED: { badge: "badge-slate",   dot: "bg-[#3fb950]", label: "Completed" },
    CANCELLED: { badge: "badge-red",     dot: "bg-[#f85149]", label: "Cancelled" },
};

const FILTERS = ["ALL", "OPEN", "REVEAL", "SCORING", "COMPLETED", "CLOSED", "DRAFT"];

export default function TendersPage() {
    const { data: session } = useSession();
    const [tenders, setTenders]         = useState<Tender[]>([]);
    const [loading, setLoading]         = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchTenders() {
            setLoading(true);
            try {
                const res = await fetch("/api/tenders");
                if (res.ok) {
                    const data = await res.json();
                    setTenders(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch tenders:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTenders();
    }, []);

    const filtered = tenders.filter((t) => {
        const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch =
            !q ||
            t.title.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            (t.category?.toLowerCase().includes(q) ?? false);
        return matchStatus && matchSearch;
    });

    return (
        <div className="space-y-7 pb-4">
            {/* ── Page Header ───────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#e6edf3" }}>
                        Tender
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#7d8590" }}>
                        {loading ? "Memuat data..." : `${tenders.length} tender aktif di sistem`}
                    </p>
                </div>
                {session && (
                    <Link href="/tenders/create" className="btn btn-primary">
                        <PlusCircle style={{ width: 15, height: 15 }} />
                        Buat Tender Baru
                    </Link>
                )}
            </div>

            {/* ── Search & Filter ───────────────────────────── */}
            <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(13,17,23,.9)", border: "1px solid rgba(99,115,138,.14)" }}
            >
                <div className="relative w-full sm:w-72">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ width: 14, height: 14, color: "#484f58" }}
                    />
                    <input
                        type="text"
                        placeholder="Cari kode, judul, kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: 36, fontSize: 13, height: 36 }}
                    />
                </div>

                <div className="hidden sm:block w-px h-5 self-center" style={{ background: "rgba(99,115,138,.18)" }} />

                <div className="flex items-center gap-1.5 overflow-x-auto flex-wrap">
                    <SlidersHorizontal style={{ width: 13, height: 13, color: "#484f58", flexShrink: 0 }} />
                    {FILTERS.map((f) => {
                        const active = statusFilter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                                style={{
                                    background: active ? "rgba(99,115,138,.22)" : "transparent",
                                    color: active ? "#e6edf3" : "#7d8590",
                                    border: active ? "1px solid rgba(99,115,138,.3)" : "1px solid transparent",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {f === "ALL" ? "Semua" : STATUS_CONFIG[f]?.label ?? f}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Loading ───────────────────────────────────── */}
            {loading && (
                <div className="flex items-center justify-center py-20 gap-3" style={{ color: "#484f58" }}>
                    <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
                    <span className="text-sm">Memuat tender dari database...</span>
                </div>
            )}

            {/* ── Empty State ───────────────────────────────── */}
            {!loading && filtered.length === 0 && (
                <div
                    className="flex flex-col items-center justify-center py-20 rounded-xl gap-3 text-center"
                    style={{ border: "1px dashed rgba(99,115,138,.2)", color: "#484f58" }}
                >
                    <Inbox style={{ width: 36, height: 36, opacity: 0.4 }} />
                    <div>
                        <p className="text-sm font-medium" style={{ color: "#7d8590" }}>
                            {tenders.length === 0 ? "Belum ada tender" : "Tidak ada tender yang cocok"}
                        </p>
                        <p className="text-xs mt-1">
                            {tenders.length === 0
                                ? "Buat tender pertama untuk memulai proses pengadaan"
                                : "Coba ubah filter atau kata kunci pencarian"}
                        </p>
                    </div>
                    {tenders.length === 0 && session && (
                        <Link href="/tenders/create" className="btn btn-primary btn-sm mt-2">
                            <PlusCircle style={{ width: 13, height: 13 }} />
                            Buat Tender Pertama
                        </Link>
                    )}
                </div>
            )}

            {/* ── Tender Cards ──────────────────────────────── */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((tender) => {
                        const sc = STATUS_CONFIG[tender.status] ?? STATUS_CONFIG.DRAFT;
                        const deadline = new Date(tender.commitDeadline);
                        const isPast = deadline < new Date();
                        const deadlineStr = deadline.toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                        });

                        return (
                            <div
                                key={tender.id}
                                className="surface p-5 flex flex-col gap-4 interactive"
                                style={{ position: "relative", overflow: "hidden" }}
                            >
                                {/* Status top line */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-px"
                                    style={{
                                        background:
                                            tender.status === "OPEN"    ? "linear-gradient(90deg, #3fb950, transparent)" :
                                            tender.status === "REVEAL"  ? "linear-gradient(90deg, #58a6ff, transparent)" :
                                            tender.status === "SCORING" ? "linear-gradient(90deg, #bc8cff, transparent)" :
                                            "transparent",
                                    }}
                                />

                                {/* Header */}
                                <div className="flex items-center justify-between gap-2">
                                    <span className="tag-mono">{tender.code}</span>
                                    <span className={`badge ${sc.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                        {sc.label}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="flex-1 space-y-1.5">
                                    <h3 className="font-semibold text-base leading-snug" style={{ color: "#e6edf3" }}>
                                        {tender.title}
                                    </h3>
                                    {tender.category && (
                                        <div className="flex items-center gap-2 text-xs" style={{ color: "#484f58" }}>
                                            <Building2 style={{ width: 12, height: 12 }} />
                                            <span>{tender.category}</span>
                                        </div>
                                    )}
                                    {tender.description && (
                                        <p className="text-xs leading-relaxed truncate-2" style={{ color: "#7d8590" }}>
                                            {tender.description}
                                        </p>
                                    )}
                                </div>

                                {/* Metadata */}
                                <div
                                    className="grid grid-cols-2 gap-3 pt-3"
                                    style={{ borderTop: "1px solid rgba(99,115,138,.1)" }}
                                >
                                    <div>
                                        <p className="text-label mb-0.5">Commit Deadline</p>
                                        <p
                                            className="text-xs font-semibold"
                                            style={{ color: isPast ? "#484f58" : "#e6edf3" }}
                                        >
                                            {deadlineStr}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-label mb-0.5">Reveal Window</p>
                                        <p className="text-xs font-semibold" style={{ color: "#e6edf3" }}>
                                            {tender.revealWindowHours}j
                                        </p>
                                    </div>
                                </div>

                                {/* CTA */}
                                <Link
                                    href={`/tenders/${tender.id}`}
                                    className="btn btn-ghost w-full justify-between"
                                    style={{ fontSize: 12 }}
                                >
                                    <span>Buka Interactive Workbench</span>
                                    <ArrowUpRight style={{ width: 14, height: 14, color: "#3fb950" }} />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
