"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    Search,
    FileText,
    Hash,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
    RefreshCw,
} from "lucide-react";

interface Organization {
    id: string;
    name: string;
    type: "BUYER" | "VENDOR" | "BOTH";
    legalName?: string;
    registrationNumber?: string;
    email?: string;
    phone?: string;
    address?: string;
    verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
    isVerified: boolean;
    rejectionReason?: string;
    createdAt: string;
    verifiedAt?: string;
    members?: { id: string }[];
}

export default function AdminDashboardPage() {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Rejection modal
    const [rejectingOrg, setRejectingOrg] = useState<Organization | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const fetchOrgs = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/organizations");
            if (res.ok) {
                const data: Organization[] = await res.json();
                setOrgs(data);
            }
        } catch {
            // handle error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrgs();
    }, [fetchOrgs]);

    const handleVerify = async (orgId: string, status: "APPROVED" | "REJECTED", reason?: string) => {
        setActionLoadingId(orgId);
        try {
            const res = await fetch(`/api/admin/organizations/${orgId}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    rejectionReason: reason || undefined,
                }),
            });

            if (res.ok) {
                setRejectingOrg(null);
                setRejectionReason("");
                await fetchOrgs();
            }
        } finally {
            setActionLoadingId(null);
        }
    };

    // Derived statistics
    const totalCount = orgs.length;
    const pendingCount = orgs.filter((o) => (o.verificationStatus ?? (o.isVerified ? "APPROVED" : "PENDING")) === "PENDING").length;
    const approvedCount = orgs.filter((o) => (o.verificationStatus ?? (o.isVerified ? "APPROVED" : "PENDING")) === "APPROVED").length;
    const rejectedCount = orgs.filter((o) => o.verificationStatus === "REJECTED").length;

    const filteredOrgs = orgs.filter((org) => {
        const status = org.verificationStatus ?? (org.isVerified ? "APPROVED" : "PENDING");
        const matchesStatus = filterStatus === "ALL" || status === filterStatus;
        const matchesQuery =
            !searchQuery.trim() ||
            org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.email?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesQuery;
    });

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--text-primary)] flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">Admin Approval</h1>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--text-primary)] text-white">
                                Sistem
                            </span>
                        </div>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
                            Tinjau dan setujui pendaftaran organisasi baru.
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchOrgs}
                    className="self-start md:self-auto px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-secondary)] transition-all flex items-center gap-2"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh Data
                </button>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--text-tertiary)]">Total Organisasi</span>
                        <Building2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <p className="text-[28px] font-bold text-[var(--text-primary)] mt-2">{totalCount}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Terdaftar di sistem</p>
                </div>

                <div className="card p-5 border-amber-200 bg-amber-50/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-amber-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            Pending Approval
                        </span>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-[28px] font-bold text-amber-600 mt-2">{pendingCount}</p>
                    <p className="text-[11px] text-amber-600/80 mt-1">Butuh verifikasi admin</p>
                </div>

                <div className="card p-5 border-teal-200 bg-teal-50/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-[var(--accent)]">Terverifikasi (Approved)</span>
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <p className="text-[28px] font-bold text-[var(--accent)] mt-2">{approvedCount}</p>
                    <p className="text-[11px] text-[var(--accent)] mt-1">Aktif & terverifikasi</p>
                </div>

                <div className="card p-5 border-red-200 bg-red-50/30">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-red-600">Ditolak (Rejected)</span>
                        <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-[28px] font-bold text-red-600 mt-2">{rejectedCount}</p>
                    <p className="text-[11px] text-red-600 mt-1">Ditolak verifikasinya</p>
                </div>
            </div>

            {/* Controls & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Box */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, NPWP/NIB, email..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[var(--surface-secondary)] p-0.5 rounded-lg border border-[var(--border-light)] w-full md:w-auto overflow-x-auto">
                    {(
                        [
                            ["PENDING", `Pending (${pendingCount})`],
                            ["APPROVED", `Approved (${approvedCount})`],
                            ["REJECTED", `Rejected (${rejectedCount})`],
                            ["ALL", `Semua (${totalCount})`],
                        ] as const
                    ).map(([status, label]) => {
                        const isActive = filterStatus === status;
                        return (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all whitespace-nowrap ${
                                    isActive
                                        ? "bg-white text-[var(--text-primary)] shadow-sm"
                                        : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Organizations Approval Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-[var(--text-tertiary)] animate-spin" />
                </div>
            ) : filteredOrgs.length === 0 ? (
                <div className="text-center py-16 card space-y-3">
                    <ShieldCheck className="w-10 h-10 text-[var(--border)] mx-auto" />
                    <h3 className="text-[15px] font-semibold text-[var(--text-secondary)]">Tidak ada organisasi ditemukan</h3>
                    <p className="text-[13px] text-[var(--text-tertiary)] max-w-sm mx-auto">
                        Tidak ada pengajuan organisasi dengan kriteria filter yang dipilih.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrgs.map((org) => {
                        const status = org.verificationStatus ?? (org.isVerified ? "APPROVED" : "PENDING");
                        const isPending = status === "PENDING";
                        const isApproved = status === "APPROVED";
                        const isRejected = status === "REJECTED";
                        const isProcessing = actionLoadingId === org.id;

                        return (
                            <div
                                key={org.id}
                                className={`card p-6 transition-all space-y-4 ${
                                    isPending ? "border-amber-200" : ""
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-[16px] font-bold text-[var(--text-primary)] tracking-tight">{org.name}</h3>

                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                                                    org.type === "BUYER"
                                                        ? "bg-[var(--accent-light)] text-[var(--accent)] border-teal-200"
                                                        : org.type === "VENDOR"
                                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                                        : "bg-purple-50 text-purple-600 border-purple-200"
                                                }`}
                                            >
                                                {org.type === "BUYER" ? "Panitia" : org.type === "VENDOR" ? "Vendor" : "Both"}
                                            </span>

                                            {/* Status Badge */}
                                            {isPending && (
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Pending Admin Review
                                                </span>
                                            )}
                                            {isApproved && (
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent)] border border-teal-200 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved &amp; Verified
                                                </span>
                                            )}
                                            {isRejected && (
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Ditolak (Rejected)
                                                </span>
                                            )}
                                        </div>

                                        {/* Legal & Registration Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-[12px]">
                                            {org.legalName && (
                                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                                    <FileText className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                                                    <span className="text-[var(--text-tertiary)]">Legal:</span>
                                                    <span className="font-medium text-[var(--text-primary)]">{org.legalName}</span>
                                                </div>
                                            )}

                                            {org.registrationNumber && (
                                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                                    <Hash className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                                                    <span className="text-[var(--text-tertiary)]">NPWP/NIB:</span>
                                                    <span className="font-mono font-medium text-[var(--text-primary)]">{org.registrationNumber}</span>
                                                </div>
                                            )}

                                            {org.email && (
                                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                                    <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                                                    <span className="text-[var(--text-primary)]">{org.email}</span>
                                                </div>
                                            )}

                                            {org.phone && (
                                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                                    <Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                                                    <span className="text-[var(--text-primary)]">{org.phone}</span>
                                                </div>
                                            )}

                                            {org.address && (
                                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] col-span-1 sm:col-span-2">
                                                    <MapPin className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                                                    <span className="text-[var(--text-primary)] truncate">{org.address}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rejection Note if any */}
                                        {isRejected && org.rejectionReason && (
                                            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100 text-[12px] text-red-700 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold block">Alasan Penolakan:</span>
                                                    <span>{org.rejectionReason}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Approval Actions */}
                                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                                        {isPending && (
                                            <>
                                                <button
                                                    onClick={() => handleVerify(org.id, "APPROVED")}
                                                    disabled={isProcessing}
                                                    className="px-4 py-2 rounded-lg bg-[var(--text-primary)] text-white font-semibold text-[13px] hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    )}
                                                    Setujui
                                                </button>

                                                <button
                                                    onClick={() => setRejectingOrg(org)}
                                                    disabled={isProcessing}
                                                    className="px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-red-600 font-semibold text-[13px] hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Tolak
                                                </button>
                                            </>
                                        )}

                                        {isApproved && (
                                            <button
                                                onClick={() => setRejectingOrg(org)}
                                                disabled={isProcessing}
                                                className="px-3 py-1.5 rounded-md bg-white border border-[var(--border)] text-[var(--text-tertiary)] hover:text-red-600 hover:border-red-200 text-[12px] font-medium transition-all flex items-center gap-1"
                                            >
                                                Batalkan Persetujuan
                                            </button>
                                        )}

                                        {isRejected && (
                                            <button
                                                onClick={() => handleVerify(org.id, "APPROVED")}
                                                disabled={isProcessing}
                                                className="px-3 py-1.5 rounded-md bg-[var(--accent-light)] text-[var(--accent)] border border-teal-200 text-[12px] font-semibold flex items-center gap-1 transition-all"
                                            >
                                                Setujui Ulang
                                            </button>
                                        )}

                                        <Link
                                            href={`/organizations/${org.id}/manage`}
                                            className="p-2 rounded-md bg-white border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                            title="Buka Halaman Manajemen"
                                        >
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectingOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="card max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">Tolak Organisasi</h3>
                        </div>

                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                            Anda akan menolak pengajuan <span className="font-semibold text-[var(--text-primary)]">{rejectingOrg.name}</span>. Berikan alasan penolakan untuk dicatat di log audit.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[var(--text-secondary)]">Alasan Penolakan</label>
                            <textarea
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Contoh: Dokumen legalitas tidak lengkap..."
                                className="w-full p-3 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] resize-none transition-all"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setRejectingOrg(null);
                                    setRejectionReason("");
                                }}
                                className="px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleVerify(rejectingOrg.id, "REJECTED", rejectionReason)}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[13px] transition-colors"
                            >
                                Konfirmasi Penolakan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
