"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
    Building2,
    PlusCircle,
    Users,
    ShieldCheck,
    CheckCircle2,
    Mail,
    Phone,
    MapPin,
    Key,
    Settings,
    ArrowRight,
    Loader2,
    Crown,
    Briefcase,
    Eye,
    User,
} from "lucide-react";

interface Organization {
    id: string;
    name: string;
    type: "BUYER" | "VENDOR" | "BOTH";
    email?: string;
    phone?: string;
    address?: string;
    verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
    isVerified?: boolean;
    rejectionReason?: string;
    memberRole?: string;
    memberStatus?: string;
    members?: { id: string }[];
}

export default function OrganizationsPage() {
    const [myOrgs, setMyOrgs] = useState<Organization[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
    const [activeTab, setActiveTab] = useState<"my" | "all">("my");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;
    const { data: session } = useSession();
    const isSysAdmin = (session?.user as any)?.role === "admin";

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [myRes, allRes] = await Promise.all([
                fetch("/api/organizations/me"),
                fetch("/api/organizations"),
            ]);
            if (myRes.ok) setMyOrgs(await myRes.json());
            if (allRes.ok) setAllOrgs(await allRes.json());
        } catch {
            // handle error silently
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const filteredOrgs = activeTab === "my" 
        ? myOrgs 
        : allOrgs.filter((org) => {
            if (isSysAdmin) return true;
            const status = org.verificationStatus ?? (org.isVerified ? "APPROVED" : "PENDING");
            return status === "APPROVED";
        });

    const totalPages = Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedOrgs = filteredOrgs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="space-y-8 w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Manajemen Organisasi</h1>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Kelola organisasi Anda, atur anggota, atau ikuti organisasi baru melalui kode undangan.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/join-organization"
                        className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-sm hover:bg-[var(--surface-secondary)] transition-all flex items-center gap-2"
                    >
                        <Key className="w-4 h-4" />
                        Join via Kode
                    </Link>
                    <Link
                        href="/setup-organization"
                        className="px-5 py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--background)] shadow-md shadow-[var(--border)] font-semibold text-[13px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Buat Organisasi Baru
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <button
                    onClick={() => setActiveTab("my")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "my"
                            ? "bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 border border-transparent"
                    }`}
                >
                    Organisasi Saya ({myOrgs.length})
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "all"
                            ? "bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/50 border border-transparent"
                    }`}
                >
                    Semua Organisasi ({allOrgs.length})
                </button>
            </div>

            {/* Organizations Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                </div>
            ) : filteredOrgs.length === 0 ? (
                <div className="text-center py-16 rounded-2xl card border-[var(--border)] space-y-4">
                    <Building2 className="w-12 h-12 text-[var(--text-tertiary)] mx-auto" />
                    <div>
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                            {activeTab === "my" ? "Belum Bergabung dengan Organisasi" : "Belum Ada Organisasi"}
                        </h3>
                        <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
                            {activeTab === "my"
                                ? "Buat organisasi baru atau masukkan kode undangan dari admin organisasi kamu."
                                : "Belum ada organisasi yang terdaftar di sistem."}
                        </p>
                    </div>
                    {activeTab === "my" && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Link
                                href="/join-organization"
                                className="px-4 py-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                Input Kode Undangan
                            </Link>
                            <Link
                                href="/setup-organization"
                                className="px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[13px] font-semibold text-[var(--background)] hover:opacity-90"
                            >
                                Buat Organisasi
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedOrgs.map((org) => {
                        const isMine = myOrgs.some((m) => m.id === org.id);
                        const memberRole = org.memberRole ?? myOrgs.find((m) => m.id === org.id)?.memberRole;
                        const status = org.verificationStatus ?? (org.isVerified ? "APPROVED" : "PENDING");
                        const isPending = status === "PENDING";
                        const isApproved = status === "APPROVED";
                        const isRejected = status === "REJECTED";

                        return (
                            <div
                                key={org.id}
                                className="bento-card p-6 flex flex-col justify-between space-y-4 relative"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                                    org.type === "BUYER"
                                                        ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                                                        : org.type === "VENDOR"
                                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                        : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                                }`}
                                            >
                                                {org.type}
                                            </span>

                                            {/* Verification status badge */}
                                            {isApproved && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                                </span>
                                            )}
                                            {isPending && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)] flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3 text-amber-500/80" /> Pending Admin Approval
                                                </span>
                                            )}
                                            {isRejected && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1">
                                                    Ditolak
                                                </span>
                                            )}
                                        </div>

                                        {memberRole && (
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)] flex items-center gap-1">
                                                {memberRole === "ORGANIZATION_ADMIN" && <Crown className="w-3 h-3 text-amber-600" />}
                                                {memberRole === "PROCUREMENT_OFFICER" && <Briefcase className="w-3 h-3 text-[var(--accent)]" />}
                                                {memberRole === "AUDITOR" && <Eye className="w-3 h-3 text-[var(--text-secondary)]" />}
                                                {memberRole === "MEMBER" && <User className="w-3 h-3 text-[var(--text-tertiary)]" />}
                                                {memberRole.replace("_", " ")}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--text-primary)]">{org.name}</h3>
                                        {org.email && (
                                            <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" /> {org.email}
                                            </p>
                                        )}
                                        {org.address && (
                                            <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1.5 line-clamp-1">
                                                <MapPin className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" /> {org.address}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                                    <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 font-medium">
                                        <Users className="w-4 h-4 text-[var(--accent)]" />
                                        {org.members ? org.members.length : 1} Anggota
                                    </span>

                                    {isMine ? (
                                        <Link
                                            href={`/organizations/${org.id}/manage`}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                                memberRole === "ORGANIZATION_ADMIN" 
                                                    ? "bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                    : "bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]"
                                            }`}
                                        >
                                            {memberRole === "ORGANIZATION_ADMIN" ? (
                                                <><Settings className="w-3.5 h-3.5" /> Kelola</>
                                            ) : (
                                                <><Eye className="w-3.5 h-3.5" /> Lihat Detail</>
                                            )}
                                        </Link>
                                    ) : (
                                        <span className="text-[11px] text-[var(--text-tertiary)] font-mono uppercase opacity-50 tracking-wider">Bukan Anggota</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center pt-8 pb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-full text-[14px] font-semibold border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-secondary)] hover:border-[var(--text-tertiary)] transition-all"
                        >
                            Sebelumnya
                        </button>
                        <div className="flex items-center gap-2 px-1">
                            <select
                                value={currentPage}
                                onChange={(e) => setCurrentPage(Number(e.target.value))}
                                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[14px] font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer appearance-none"
                            >
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Hal {i + 1}
                                    </option>
                                ))}
                            </select>
                            <span className="text-[14px] font-medium text-[var(--text-secondary)] hidden sm:inline">dari {totalPages}</span>
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-full text-[14px] font-semibold border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--surface-secondary)] hover:border-[var(--text-tertiary)] transition-all"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


