"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

    const orgsToDisplay = activeTab === "my" ? myOrgs : allOrgs;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Manajemen Organisasi</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Kelola organisasi Anda, atur anggota, atau ikuti organisasi baru melalui kode undangan.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/join-organization"
                        className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 text-emerald-400 font-semibold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <Key className="w-4 h-4" />
                        Join via Kode
                    </Link>
                    <Link
                        href="/setup-organization"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-500 to-indigo-600 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Buat Organisasi Baru
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                    onClick={() => setActiveTab("my")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "my"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    Organisasi Saya ({myOrgs.length})
                </button>
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "all"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    Semua Organisasi ({allOrgs.length})
                </button>
            </div>

            {/* Organizations Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
            ) : orgsToDisplay.length === 0 ? (
                <div className="text-center py-16 rounded-2xl glass-panel border-slate-800 space-y-4">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                    <div>
                        <h3 className="text-base font-semibold text-white">
                            {activeTab === "my" ? "Belum Bergabung dengan Organisasi" : "Belum Ada Organisasi"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            {activeTab === "my"
                                ? "Buat organisasi baru atau masukkan kode undangan dari admin organisasi kamu."
                                : "Belum ada organisasi yang terdaftar di sistem."}
                        </p>
                    </div>
                    {activeTab === "my" && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Link
                                href="/join-organization"
                                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-emerald-400 hover:bg-slate-700"
                            >
                                Input Kode Undangan
                            </Link>
                            <Link
                                href="/setup-organization"
                                className="px-4 py-2 rounded-xl bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
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
                                className="glass-panel glass-panel-hover p-6 rounded-2xl border-slate-800 flex flex-col justify-between space-y-4 relative"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                                    org.type === "BUYER"
                                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                        : org.type === "VENDOR"
                                                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                                        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                                }`}
                                            >
                                                {org.type}
                                            </span>

                                            {/* Verification status badge */}
                                            {isApproved && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                                </span>
                                            )}
                                            {isPending && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> Pending Admin Approval
                                                </span>
                                            )}
                                            {isRejected && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                                                    Ditolak
                                                </span>
                                            )}
                                        </div>

                                        {memberRole && (
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                                                {memberRole === "ORGANIZATION_ADMIN" && <Crown className="w-3 h-3 text-amber-400" />}
                                                {memberRole === "PROCUREMENT_OFFICER" && <Briefcase className="w-3 h-3 text-emerald-400" />}
                                                {memberRole === "AUDITOR" && <Eye className="w-3 h-3 text-indigo-400" />}
                                                {memberRole === "MEMBER" && <User className="w-3 h-3 text-slate-400" />}
                                                {memberRole.replace("_", " ")}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white">{org.name}</h3>
                                        {org.email && (
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {org.email}
                                            </p>
                                        )}
                                        {org.address && (
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {org.address}
                                            </p>
                                        )}
                                    </div>

                                    {/* Admin verification actions */}
                                    {isPending && (
                                        <div className="pt-2 flex items-center gap-2">
                                            <button
                                                onClick={() => handleVerifyOrg(org.id, "APPROVED")}
                                                disabled={verifyingId === org.id}
                                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                                            >
                                                {verifyingId === org.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerifyOrg(org.id, "REJECTED")}
                                                disabled={verifyingId === org.id}
                                                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                        <Users className="w-4 h-4 text-emerald-400" />
                                        {org.members ? org.members.length : 1} Anggota
                                    </span>

                                    {isMine ? (
                                        <Link
                                            href={`/organizations/${org.id}/manage`}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                                        >
                                            <Settings className="w-3.5 h-3.5" />
                                            Kelola
                                        </Link>
                                    ) : (
                                        <span className="text-[11px] text-slate-500 italic">Bukan Anggota</span>
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


