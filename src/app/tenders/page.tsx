"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
    PlusCircle,
    Search,
    Clock,
    Users,
    Loader2,
    Building2,
} from "lucide-react";

interface TenderItem {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    organizationId: string;
    organizationName: string;
    status: "DRAFT" | "OPEN" | "CLOSED" | "REVEAL" | "SCORING" | "COMPLETED";
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
                            (o.isVerified || o.verificationStatus === "APPROVED")
                    );
                    setCanCreateTender(eligible);
                    
                    if (data.length > 0) {
                        setActiveTab("my");
                    }
                })
                .catch(() => {});
        }

        fetch("/api/tenders")
            .then((res) => res.json())
            .then((data) => {
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
                    participantCount: t.participants?.length || 0,
                    sealedBidsCount: t.bids?.length || 0,
                    participantOrgIds: t.participants?.map((p: any) => p.organizationId) || [],
                }));
                setTenders(mapped);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

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
        COMPLETED: "Selesai",
    };

    const statusClasses: Record<string, string> = {
        DRAFT: "status-draft",
        OPEN: "status-open",
        CLOSED: "status-closed",
        REVEAL: "status-reveal",
        SCORING: "status-scoring",
        COMPLETED: "status-completed",
    };

    return (
        <div className="space-y-8">
            {/* Judul Halaman */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight">Tender</h1>
                    <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
                        Kelola dan ikuti tender pengadaan digital.
                    </p>
                </div>

                {canCreateTender && (
                    <Link
                        href="/tenders/create"
                        className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-semibold text-[13px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Buat Tender Baru
                    </Link>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <button
                    onClick={() => setActiveTab("my")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "my"
                            ? "bg-[var(--accent-light)] text-[var(--accent)] border border-teal-200"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                    Tender Saya
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "all"
                            ? "bg-[var(--accent-light)] text-[var(--accent)] border border-teal-200"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                    Semua Tender
                </button>
            </div>

            {/* Filter dan Pencarian */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari tender, kode, atau organisasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-colors"
                    />
                </div>

                <div className="flex items-center gap-1 bg-[var(--surface-secondary)] p-0.5 rounded-lg border border-[var(--border-light)]">
                    {Object.entries(statusLabels).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                                statusFilter === key
                                    ? "bg-white text-[var(--text-primary)] shadow-sm"
                                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Daftar Tender */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-5 h-5 text-[var(--text-tertiary)] animate-spin" />
                </div>
            ) : filteredTenders.length === 0 ? (
                <div className="card p-12 text-center space-y-2">
                    <p className="text-[var(--text-secondary)] text-[15px] font-medium">Tidak ada tender ditemukan</p>
                    <p className="text-[var(--text-tertiary)] text-[13px]">
                        Coba ubah filter atau kata kunci pencarian Anda.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTenders.map((tender) => (
                        <Link
                            key={tender.id}
                            href={`/tenders/${tender.id}`}
                            className="card card-hover p-6 flex flex-col justify-between space-y-4 group"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-mono font-semibold text-[var(--text-tertiary)] tracking-wide">
                                        {tender.code}
                                    </span>
                                    <span
                                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                            statusClasses[tender.status] || "status-draft"
                                        }`}
                                    >
                                        {tender.status}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                                        {tender.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[var(--text-tertiary)]">
                                        <Building2 className="w-3 h-3" />
                                        <span>{tender.organizationName}</span>
                                        <span>·</span>
                                        <span>{tender.category}</span>
                                    </div>
                                </div>

                                {tender.description && (
                                    <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed line-clamp-2">
                                        {tender.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-3 border-t border-[var(--border-light)] text-[12px] text-[var(--text-tertiary)]">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                        {new Date(tender.commitDeadline).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{tender.participantCount} vendor</span>
                                </div>
                                <div className="flex items-center gap-1 font-medium text-[var(--accent)]">
                                    <span>{tender.sealedBidsCount} bid tersegel</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
