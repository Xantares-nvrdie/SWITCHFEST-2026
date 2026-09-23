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
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const { data: session } = useSession();
    const isSysAdmin = session?.user?.role === "admin";

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

    const handleVerifyOrg = async (orgId: string, status: "APPROVED" | "REJECTED") => {
        setVerifyingId(orgId);
        try {
            const res = await fetch(`/api/organizations/${orgId}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                await loadData();
            }
        } finally {
            setVerifyingId(null);
        }
    };

    const orgsToDisplay = activeTab === "my" 
        ? myOrgs 
        : allOrgs.filter((org) => {
            if (isSysAdmin) return true;
            const status = org.verificationStatus ?? (org.isVerified ? "APPROVED" : "PENDING");
            return status === "APPROVED";
        });

    return (
        <div className="space-y-8">
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
                        className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--accent)] font-semibold text-sm hover:bg-[var(--surface-secondary)] transition-all flex items-center gap-2"
                    >
                        <Key className="w-4 h-4" />
                        Join via Kode
                    </Link>
                    <Link
                        href="/setup-organization"
                        className="px-5 py-2.5 rounded-lg bg-[var(--text-primary)] text-white font-semibold text-[13px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
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
                            ? "bg-[var(--accent-light)] text-[var(--accent)] border border-teal-200"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                    Organisasi Saya ({myOrgs.length})
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "all"
                            ? "bg-[var(--accent-light)] text-[var(--accent)] border border-teal-200"
                            : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
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
            ) : orgsToDisplay.length === 0 ? (
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
                                className="px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                Input Kode Undangan
                            </Link>
                            <Link
                                href="/setup-organization"
                                className="px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[13px] font-semibold text-white hover:opacity-90"
                            >
                                Buat Organisasi
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orgsToDisplay.map((org) => {
                        const isMine = myOrgs.some((m) => m.id === org.id);
                        const memberRole = org.memberRole ?? myOrgs.find((m) => m.id === org.id)?.memberRole;
                        const status = org.verificationStatus ?? (org.isVerified ? "APPROVED" : "PENDING");
                        const isPending = status === "PENDING";
                        const isApproved = status === "APPROVED";
                        const isRejected = status === "REJECTED";

                        return (
                            <div
                                key={org.id}
                                className="card card-hover p-6 rounded-2xl border-[var(--border)] flex flex-col justify-between space-y-4 relative"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                                    org.type === "BUYER"
                                                        ? "bg-[var(--accent-light)] text-[var(--accent)] border-teal-200"
                                                        : org.type === "VENDOR"
                                                        ? "bg-blue-50 text-[var(--accent)] border-blue-200"
                                                        : "bg-indigo-500/20 text-indigo-300 border-blue-200"
                                                }`}
                                            >
                                                {org.type}
                                            </span>

                                            {/* Verification status badge */}
                                            {isApproved && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] border border-teal-200 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                                </span>
                                            )}
                                            {isPending && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-200 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> Pending Admin Approval
                                                </span>
                                            )}
                                            {isRejected && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-500/30 flex items-center gap-1">
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

                                    {/* Admin verification actions */}
                                    {isPending && isSysAdmin && (
                                        <div className="pt-2 flex items-center gap-2">
                                            <button
                                                onClick={() => handleVerifyOrg(org.id, "APPROVED")}
                                                disabled={verifyingId === org.id}
                                                className="px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-white font-semibold text-[12px] flex items-center gap-1.5 transition-all disabled:opacity-50 hover:opacity-90"
                                            >
                                                {verifyingId === org.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerifyOrg(org.id, "REJECTED")}
                                                disabled={verifyingId === org.id}
                                                className="px-3 py-1.5 rounded-lg bg-white border border-[var(--border)] text-red-600 font-semibold text-[12px] flex items-center gap-1.5 transition-colors disabled:opacity-50 hover:bg-red-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
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
                                                    ? "bg-[var(--accent-light)] hover:opacity-90 text-[var(--accent)] border border-teal-200"
                                                    : "bg-white hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]"
                                            }`}
                                        >
                                            {memberRole === "ORGANIZATION_ADMIN" ? (
                                                <><Settings className="w-3.5 h-3.5" /> Kelola</>
                                            ) : (
                                                <><Eye className="w-3.5 h-3.5" /> Lihat Detail</>
                                            )}
                                        </Link>
                                    ) : (
                                        <span className="text-[11px] text-[var(--text-tertiary)] italic">Bukan Anggota</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


