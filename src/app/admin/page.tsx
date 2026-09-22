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
    Filter,
    Mail,
    Phone,
    MapPin,
    Hash,
    FileText,
    ExternalLink,
    RefreshCw,
    UserCheck,
    Crown,
    ArrowUpRight,
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
            const res = await fetch("/api/organizations");
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
            const res = await fetch(`/api/organizations/${orgId}/verify`, {
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

    const cardStyle = {
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(51, 65, 85, 0.5)",
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-500 to-cyan-500 p-[1.5px] shadow-lg shadow-emerald-500/10">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Approval Dashboard</h1>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                System Admin
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            TenderSeal Platform Control · Peninjauan Dokumen Legal & Approvals Organisasi
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchOrgs}
                    className="self-start md:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh Data
                </button>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <div className="rounded-2xl p-5" style={cardStyle}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Total Organisasi</span>
                        <Building2 className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-2xl font-extrabold text-white mt-2">{totalCount}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Terdaftar di sistem</p>
                </div>

                {/* Pending */}
                <div className="rounded-2xl p-5 relative overflow-hidden" style={{ ...cardStyle, border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            Pending Approval
                        </span>
                        <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-extrabold text-amber-300 mt-2">{pendingCount}</p>
                    <p className="text-[11px] text-amber-400/80 mt-1">Butuh verifikasi admin</p>
                </div>

                {/* Approved */}
                <div className="rounded-2xl p-5" style={cardStyle}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-400">Terverifikasi (Approved)</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-300 mt-2">{approvedCount}</p>
                    <p className="text-[11px] text-emerald-400/80 mt-1">Aktif & terverifikasi</p>
                </div>

                {/* Rejected */}
                <div className="rounded-2xl p-5" style={cardStyle}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-red-400">Ditolak (Rejected)</span>
                        <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <p className="text-2xl font-extrabold text-red-300 mt-2">{rejectedCount}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Ditolak verifikasinya</p>
                </div>
            </div>

            {/* Controls & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl w-fit" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(51,65,85,0.5)" }}>
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
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                    background: isActive ? "rgba(52,211,153,0.12)" : "transparent",
                                    color: isActive ? "#34d399" : "#64748b",
                                    border: isActive ? "1px solid rgba(52,211,153,0.3)" : "1px solid transparent",
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, NPWP/NIB, email..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                        style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(51,65,85,0.6)" }}
                    />
                </div>
            </div>

            {/* Organizations Approval Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
            ) : filteredOrgs.length === 0 ? (
                <div className="text-center py-16 rounded-2xl glass-panel border-slate-800 space-y-3">
                    <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto opacity-40" />
                    <h3 className="text-sm font-semibold text-slate-300">Tidak ada organisasi ditemukan</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                                className="rounded-2xl p-6 transition-all space-y-4"
                                style={{
                                    ...cardStyle,
                                    border: isPending
                                        ? "1px solid rgba(251, 191, 36, 0.4)"
                                        : "1px solid rgba(51, 65, 85, 0.5)",
                                }}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left: Info */}
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-bold text-white tracking-tight">{org.name}</h3>

                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                                                    org.type === "BUYER"
                                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                        : org.type === "VENDOR"
                                                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                                        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                                }`}
                                            >
                                                {org.type}
                                            </span>

                                            {/* Status Badge */}
                                            {isPending && (
                                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Pending Admin Review
                                                </span>
                                            )}
                                            {isApproved && (
                                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved &amp; Verified
                                                </span>
                                            )}
                                            {isRejected && (
                                                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Ditolak (Rejected)
                                                </span>
                                            )}
                                        </div>

                                        {/* Legal & Registration Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
                                            {org.legalName && (
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    <span className="text-slate-500">Legal:</span>
                                                    <span className="font-medium text-slate-200">{org.legalName}</span>
                                                </div>
                                            )}

                                            {org.registrationNumber && (
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <Hash className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                    <span className="text-slate-500">NPWP / NIB:</span>
                                                    <span className="font-mono font-semibold text-emerald-300">{org.registrationNumber}</span>
                                                </div>
                                            )}

                                            {org.email && (
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    <span className="text-slate-400">{org.email}</span>
                                                </div>
                                            )}

                                            {org.phone && (
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    <span className="text-slate-400">{org.phone}</span>
                                                </div>
                                            )}

                                            {org.address && (
                                                <div className="flex items-center gap-1.5 text-slate-300 col-span-1 sm:col-span-2">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                    <span className="text-slate-400 truncate">{org.address}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rejection Note if any */}
                                        {isRejected && org.rejectionReason && (
                                            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
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
                                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-bold text-xs hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    )}
                                                    Approve Organisasi
                                                </button>

                                                <button
                                                    onClick={() => setRejectingOrg(org)}
                                                    disabled={isProcessing}
                                                    className="px-4 py-2 rounded-xl bg-slate-900 border border-red-500/40 text-red-400 font-semibold text-xs hover:bg-red-500/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Tolak (Reject)
                                                </button>
                                            </>
                                        )}

                                        {isApproved && (
                                            <button
                                                onClick={() => setRejectingOrg(org)}
                                                disabled={isProcessing}
                                                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 text-xs transition-all flex items-center gap-1"
                                            >
                                                Revoke Approval
                                            </button>
                                        )}

                                        {isRejected && (
                                            <button
                                                onClick={() => handleVerify(org.id, "APPROVED")}
                                                disabled={isProcessing}
                                                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                                            >
                                                Re-Approve
                                            </button>
                                        )}

                                        <Link
                                            href={`/organizations/${org.id}/manage`}
                                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                            title="View Manage Page"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="glass-panel max-w-md w-full p-6 rounded-2xl border-slate-800 space-y-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <h3 className="text-base font-bold text-white">Tolak Pendaftaran Organisasi</h3>
                        </div>

                        <p className="text-xs text-slate-400">
                            Anda akan menolak pengajuan untuk <span className="text-white font-semibold">{rejectingOrg.name}</span>. Berikan alasan penolakan untuk dicatat di audit log.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300">Alasan Penolakan</label>
                            <textarea
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Contoh: Nomor NPWP/NIB tidak valid atau dokumen legalitas tidak lengkap..."
                                className="w-full p-3 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none resize-none"
                                style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(51,65,85,0.7)" }}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setRejectingOrg(null);
                                    setRejectionReason("");
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => handleVerify(rejectingOrg.id, "REJECTED", rejectionReason)}
                                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-lg shadow-red-500/20"
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
