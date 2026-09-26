"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { PlusCircle, Search, Clock, Users, Loader2, Building2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TenderItem {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    organizationId: string;
    organizationName: string;
    status: "DRAFT" | "OPEN" | "CLOSED" | "REVEAL" | "SCORING" | "TIED" | "COMPLETED";
    commitDeadline: string;
    revealWindowHours: number;
    participantCount: number;
    sealedBidsCount: number;
    participantOrgIds: string[];
}

export default function TendersPage() {
    const { data: session } = useSession();
    const [tenders, setTenders] = useState<TenderItem[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [canCreateTender, setCanCreateTender] = useState(false);
    const [activeTab, setActiveTab] = useState<"my" | "all">("all");
    const [myOrgIds, setMyOrgIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (session?.user) {
            fetch("/api/organizations/me")
                .then((r) => r.json())
                .then((data) => {
                    setMyOrgIds(data.map((o: any) => o.id));
                    const eligible = data.some(
                        (o: any) =>
                            o.memberStatus === "ACTIVE" &&
                            (o.memberRole === "PROCUREMENT_OFFICER" || o.memberRole === "ORGANIZATION_ADMIN") &&
                            (o.isVerified || o.verificationStatus === "APPROVED"),
                    );
                    setCanCreateTender(eligible);
                })
                .catch(() => {});
        }
    }, [session?.user]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/tenders?page=${page}&limit=12`)
            .then(async (r) => {
                if (!r.ok) return { data: [], meta: { totalPages: 1 } };
                return await r.json();
            })
            .then((json) => {
                const data = json.data || json; // fallback for backwards compatibility
                const meta = json.meta || { totalPages: 1 };

                const mapped: TenderItem[] = data.map((t: any) => ({
                    id: t.id,
                    code: t.code,
                    title: t.title,
                    description: t.description || "",
                    category: t.category || "Umum",
                    organizationId: t.organization?.id || "",
                    organizationName: t.organization?.name || "Organisasi",
                    status: t.status,
                    commitDeadline: t.commitDeadline,
                    revealWindowHours: t.revealWindowHours,
                    participantCount: t.participantOrgIds?.length || 0,
                    sealedBidsCount: t.bidCount || 0,
                    participantOrgIds: t.participantOrgIds || [],
                }));
                setTenders(mapped);
                setTotalPages(meta.totalPages || 1);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page]);

    const filteredTenders = tenders.filter((t) => {
        const isMine = myOrgIds.includes(t.organizationId) || t.participantOrgIds.some((id) => myOrgIds.includes(id));
        if (activeTab === "my" && !isMine) return false;

        const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
        const matchesSearch =
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.organizationName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusLabels: Record<string, string> = {
        ALL: "Semua",
        OPEN: "Dibuka",
        REVEAL: "Reveal",
        SCORING: "Penilaian",
        TIED: "Seri",
        COMPLETED: "Selesai",
    };

    const statusClasses: Record<string, string> = {
        DRAFT: "status-draft",
        OPEN: "status-open",
        CLOSED: "status-closed",
        REVEAL: "status-reveal",
        SCORING: "status-scoring",
        TIED: "status-reveal",
        COMPLETED: "status-completed",
    };

    const stagger = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <div className="space-y-8 max-w-[1440px] mx-auto px-2">
            {/* Judul Halaman */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                <div>
                    <h1 className="font-display text-[40px] font-bold text-[var(--text-primary)] tracking-tight">Tender</h1>
                    <p className="text-[16px] text-[var(--text-secondary)] mt-1 font-medium">
                        Eksplorasi dan kelola tender pengadaan digital terenkripsi.
                    </p>
                </div>

                {canCreateTender && (
                    <Link
                        href="/tenders/create"
                        className="btn-primary px-6 py-3 text-[14px]"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Buat Tender Baru
                    </Link>
                )}
            </div>

            {/* Filter dan Pencarian - Bento style */}
            <div className="bento-card p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar w-full xl:w-auto border-b xl:border-b-0 border-[var(--border-light)] xl:pr-4">
                    <button
                        onClick={() => setActiveTab("my")}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === "my"
                                ? "bg-[var(--text-primary)] text-white shadow-md"
                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                        }`}
                    >
                        Tender Saya
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === "all"
                                ? "bg-[var(--text-primary)] text-white shadow-md"
                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                        }`}
                    >
                        Semua Tender
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari tender, kode, atau organisasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar w-full md:w-auto bg-[var(--surface-secondary)] p-1 rounded-full border border-[var(--border-light)]">
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                                    statusFilter === key
                                        ? "bg-white text-[var(--text-primary)] shadow-sm border border-[var(--border)]"
                                        : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Daftar Tender */}
            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
                </div>
            ) : filteredTenders.length === 0 ? (
                <div className="bento-card p-16 text-center space-y-3 flex flex-col items-center border-dashed">
                    <Filter className="w-8 h-8 text-[var(--border)] mb-2" />
                    <p className="text-[var(--text-primary)] font-display text-[20px] font-semibold tracking-tight">Tidak ada tender ditemukan</p>
                    <p className="text-[var(--text-tertiary)] text-[15px] max-w-md mx-auto">
                        Coba ubah kata kunci pencarian atau pilih status yang berbeda untuk menemukan apa yang Anda cari.
                    </p>
                </div>
            ) : (
                <motion.div 
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredTenders.map((tender) => (
                            <motion.div key={tender.id} variants={itemVariant} layoutId={tender.id}>
                                <Link
                                    href={`/tenders/${tender.id}`}
                                    className="bento-card p-6 flex flex-col justify-between h-[280px] group block"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="text-[12px] font-mono font-bold text-[var(--text-tertiary)] bg-[var(--surface-secondary)] px-2 py-1 rounded">
                                                {tender.code}
                                            </span>
                                            <span
                                                className={`status-badge ${
                                                    statusClasses[tender.status] || "status-draft"
                                                }`}
                                            >
                                                {tender.status}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-display text-[18px] font-bold text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                                                {tender.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-2 text-[13px] text-[var(--text-secondary)] font-medium">
                                                <Building2 className="w-3.5 h-3.5" />
                                                <span className="truncate">{tender.organizationName}</span>
                                            </div>
                                        </div>

                                        {tender.description && (
                                            <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed line-clamp-2">
                                                {tender.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-light)] text-[13px] text-[var(--text-secondary)] font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                                            <span>
                                                {new Date(tender.commitDeadline).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
                                            <span>{tender.participantCount}</span>
                                        </div>
                                        {tender.sealedBidsCount > 0 && (
                                            <div className="flex items-center gap-1.5 text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded-md ml-auto">
                                                <span className="font-bold">{tender.sealedBidsCount} Bid</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-8 pb-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-full text-[14px] font-semibold border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-secondary)] hover:border-[var(--text-tertiary)] transition-all"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-[14px] font-medium text-[var(--text-secondary)] px-2">
                        Hal <span className="text-[var(--text-primary)] font-bold">{page}</span> dari {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-full text-[14px] font-semibold border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-secondary)] hover:border-[var(--text-tertiary)] transition-all"
                    >
                        Selanjutnya
                    </button>
                </div>
            )}
        </div>
    );
}
