"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
    Building2,
    Users,
    Key,
    Plus,
    Copy,
    Check,
    Trash2,
    Loader2,
    AlertCircle,
    Briefcase,
    Eye,
    User,
    Crown,
    ChevronDown,
    Clock,
    Hash,
    ArrowLeft,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";

type OrgRole = "ORGANIZATION_ADMIN" | "PROCUREMENT_OFFICER" | "AUDITOR" | "MEMBER";
type MemberStatus = "ACTIVE" | "SUSPENDED" | "INVITED";

interface Member {
    id: string;
    role: OrgRole;
    status: MemberStatus;
    joinedAt: string;
    user: { id: string; name: string; email: string; image?: string };
}

interface Invite {
    id: string;
    code: string;
    role: OrgRole;
    maxUses: number | null;
    usesCount: number;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
    createdBy: { name: string; email: string };
}

interface Organization {
    id: string;
    name: string;
    type: "BUYER" | "VENDOR" | "BOTH";
    email?: string;
    legalName?: string;
    registrationNumber?: string;
    phone?: string;
    address?: string;
    verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
}

const roleMeta: Record<OrgRole, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    ORGANIZATION_ADMIN: { label: "Admin", icon: Crown, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    PROCUREMENT_OFFICER: { label: "Procurement Officer", icon: Briefcase, color: "text-[var(--accent)]", bg: "bg-teal-50 border-teal-200" },
    AUDITOR: { label: "Auditor", icon: Eye, color: "text-[var(--text-secondary)]", bg: "bg-blue-50 border-blue-200" },
    MEMBER: { label: "Member", icon: User, color: "text-[var(--text-tertiary)]", bg: "bg-[var(--surface-secondary)] border-[var(--border)]" },
};

function RoleBadge({ role }: { role: OrgRole }) {
    const m = roleMeta[role];
    const Icon = m.icon;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${m.bg} ${m.color}`}
        >
            <Icon className={`w-3 h-3 ${m.color}`} />
            {m.label}
        </span>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
                copied
                    ? "bg-teal-50 border-teal-200 text-teal-600"
                    : "bg-white border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
            }`}
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Tersalin" : "Salin"}
        </button>
    );
}

export default function OrgManagePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const orgId = params.id as string;

    const [org, setOrg] = useState<Organization | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "members" | "invites">("overview");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Profile form state
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState<Partial<Organization>>({});

    // Generate invite form
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteRole, setInviteRole] = useState<OrgRole>("MEMBER");
    const [inviteMaxUses, setInviteMaxUses] = useState<string>("");
    const [inviteExpiry, setInviteExpiry] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [orgRes, membersRes] = await Promise.all([
                fetch(`/api/organizations/${orgId}`),
                fetch(`/api/organizations/${orgId}/members`),
            ]);

            if (!orgRes.ok) { setError("Organisasi tidak ditemukan"); return; }
            const orgData = await orgRes.json();
            setOrg(orgData);
            setFormData(orgData);

            if (membersRes.ok) {
                const membersData = await membersRes.json();
                setMembers(membersData);
                const me = membersData.find((m: Member) => m.user.id === session?.user?.id);
                if (me?.role === "ORGANIZATION_ADMIN") {
                    setIsAdmin(true);
                    // Fetch invites only if admin
                    const invRes = await fetch(`/api/organizations/${orgId}/invites`);
                    if (invRes.ok) setInvites(await invRes.json());
                }
            }
        } catch {
            setError("Gagal memuat data organisasi");
        } finally {
            setIsLoading(false);
        }
    }, [orgId, session?.user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/organizations/${orgId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name ?? undefined,
                    type: formData.type ?? undefined,
                    legalName: formData.legalName ?? undefined,
                    registrationNumber: formData.registrationNumber ?? undefined,
                    email: formData.email ?? undefined,
                    phone: formData.phone ?? undefined,
                    address: formData.address ?? undefined,
                }),
            });
            if (res.ok) {
                alert("Profil organisasi berhasil diperbarui!");
                fetchData();
            } else {
                const err = await res.json();
                alert(err.message || "Gagal memperbarui profil");
            }
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleGenerateInvite = async () => {
        setIsGenerating(true);
        const res = await fetch(`/api/organizations/${orgId}/invites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role: inviteRole,
                maxUses: inviteMaxUses ? Number(inviteMaxUses) : undefined,
                expiresInDays: inviteExpiry ? Number(inviteExpiry) : undefined,
            }),
        });
        if (res.ok) {
            setShowInviteForm(false);
            setInviteMaxUses("");
            setInviteExpiry("");
            fetchData();
        }
        setIsGenerating(false);
    };

    const handleRevoke = async (inviteId: string) => {
        await fetch(`/api/organizations/${orgId}/invites/${inviteId}/revoke`, { method: "PATCH" });
        fetchData();
    };

    const handleUpdateMemberRole = async (memberId: string, role: OrgRole) => {
        await fetch(`/api/organizations/${orgId}/members/${memberId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
        });
        fetchData();
    };

    const handleToggleMemberStatus = async (memberId: string, currentStatus: MemberStatus) => {
        const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        await fetch(`/api/organizations/${orgId}/members/${memberId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        fetchData();
    };

    const inputClass = "w-full pl-9 pr-8 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all";
    const selectClass = "appearance-none w-full pl-3 pr-8 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all cursor-pointer";

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-[var(--text-tertiary)] animate-spin" />
        </div>
    );

    if (error || !org) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 card p-8">
            <AlertCircle className="w-10 h-10 text-red-600" />
            <p className="text-[14px] font-medium text-[var(--text-secondary)]">{error ?? "Organisasi tidak ditemukan"}</p>
        </div>
    );

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <button onClick={() => router.back()} className="mt-1 p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-all border border-transparent hover:border-[var(--border)]">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">{org.name}</h1>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)]">
                                {org.type}
                            </span>
                        </div>
                        <p className="text-[13px] text-[var(--text-tertiary)] flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {members.length} anggota
                            {isAdmin && <span className="ml-3 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold flex items-center gap-1 border border-amber-200"><Crown className="w-3 h-3" /> Admin</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Rejection Banner */}
            {org.verificationStatus === "REJECTED" && (
                <div className="card border-red-200 bg-red-50/50 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h3 className="text-[14px] font-bold text-red-700">Pendaftaran Organisasi Ditolak</h3>
                        <p className="text-[13px] text-red-600/90 leading-relaxed">
                            Organisasi ini telah ditolak oleh Admin Sistem dengan alasan: <br />
                            <span className="font-semibold">{org.rejectionReason || "Tidak ada alasan spesifik."}</span>
                        </p>
                        <p className="text-[12px] text-red-600/70 pt-1">
                            Anda tidak dapat mengubah profil atau mengelola organisasi yang ditolak.
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-light)] w-fit">
                {([["overview", Building2, "Profil Organisasi"], ["members", Users, "Anggota Tim"], ["invites", Key, "Kode Undangan"]] as const).map(([tab, Icon, label]) => {
                    const isActive = activeTab === tab;
                    if (tab === "invites" && !isAdmin) return null;
                    return (
                        <button key={tab} onClick={() => setActiveTab(tab as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                                isActive ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/50"
                            }`}>
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* ── Overview / Profile Tab ── */}
            {activeTab === "overview" && (
                <div className="card max-w-3xl">
                    <div className="px-6 py-5 border-b border-[var(--border)]">
                        <h2 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[var(--text-tertiary)]" />
                            Profil & Informasi Dasar
                        </h2>
                    </div>
                    
                    <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Nama Organisasi *</label>
                                <input required type="text" value={formData.name || ""} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={inputClass} disabled={!isAdmin || org.verificationStatus === "REJECTED"} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Tipe *</label>
                                <div className="relative">
                                    <select value={formData.type || "BUYER"} onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))} className={selectClass} disabled={!isAdmin || org.verificationStatus === "REJECTED"}>
                                        <option value="BUYER">BUYER (Pembeli/Panitia)</option>
                                        <option value="VENDOR">VENDOR (Penyedia)</option>
                                        <option value="BOTH">BOTH (Keduanya)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Nama Legal (PT/CV)</label>
                                <input type="text" value={formData.legalName || ""} onChange={e => setFormData(p => ({ ...p, legalName: e.target.value }))} className={inputClass} disabled={!isAdmin || org.verificationStatus === "REJECTED"} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">NPWP / NIB</label>
                                <input type="text" value={formData.registrationNumber || ""} onChange={e => setFormData(p => ({ ...p, registrationNumber: e.target.value }))} className={inputClass} disabled={!isAdmin || org.verificationStatus === "REJECTED"} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Email Perusahaan</label>
                                <input type="email" value={formData.email || ""} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className={inputClass} disabled={!isAdmin || org.verificationStatus === "REJECTED"} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Nomor Telepon</label>
                                <input type="text" value={formData.phone || ""} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} className={inputClass} disabled={!isAdmin || org.verificationStatus === "REJECTED"} />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Alamat Lengkap</label>
                                <textarea rows={3} value={formData.address || ""} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} className={`${inputClass} resize-none`} disabled={!isAdmin || org.verificationStatus === "REJECTED"} />
                            </div>
                        </div>

                        {isAdmin && org.verificationStatus !== "REJECTED" && (
                            <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                                <button type="submit" disabled={isUpdating} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-all disabled:opacity-50">
                                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* ── Members Tab ── */}
            {activeTab === "members" && (
                <div className="card">
                    <div className="px-6 py-5 border-b border-[var(--border)]">
                        <h2 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Users className="w-5 h-5 text-[var(--text-tertiary)]" />
                            Daftar Anggota
                        </h2>
                    </div>
                    
                    <div className="divide-y divide-[var(--border)]">
                        {members.map((m) => {
                            const isSelf = m.user.id === session?.user?.id;
                            return (
                                <div key={m.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-secondary)]/50 transition-colors">
                                    {/* Profile */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-[var(--text-primary)] flex items-center justify-center shrink-0 shadow-sm">
                                            <span className="text-white font-bold text-[14px]">
                                                {m.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-[14px] font-bold text-[var(--text-primary)]">{m.user.name}</span>
                                                {isSelf && <span className="text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--border-light)] px-1.5 py-0.5 rounded">(Anda)</span>}
                                                <RoleBadge role={m.role} />
                                                {m.status === "SUSPENDED" && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-600 border border-red-200">
                                                        Ditangguhkan
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[13px] text-[var(--text-secondary)]">{m.user.email}</p>
                                        </div>
                                    </div>

                                    {/* Admin actions */}
                                    {isAdmin && !isSelf && org.verificationStatus !== "REJECTED" && (
                                        <div className="flex items-center gap-3 shrink-0">
                                            {/* Role selector */}
                                            <div className="relative">
                                                <select
                                                    value={m.role}
                                                    onChange={(e) => handleUpdateMemberRole(m.id, e.target.value as OrgRole)}
                                                    className="appearance-none text-[12px] font-medium pr-8 pl-3 py-1.5 rounded-lg cursor-pointer outline-none transition-all border border-[var(--border)] bg-white text-[var(--text-primary)] hover:border-[var(--accent)]"
                                                >
                                                    <option value="MEMBER">Member</option>
                                                    <option value="AUDITOR">Auditor</option>
                                                    <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                                                    <option value="ORGANIZATION_ADMIN">Admin</option>
                                                </select>
                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)] pointer-events-none" />
                                            </div>

                                            {/* Toggle active/suspended */}
                                            <button
                                                onClick={() => handleToggleMemberStatus(m.id, m.status)}
                                                className={`p-1.5 rounded-lg transition-all border ${
                                                    m.status === "ACTIVE" 
                                                        ? "border-[var(--border)] bg-white text-[var(--text-tertiary)] hover:text-amber-600 hover:border-amber-200" 
                                                        : "border-teal-200 bg-teal-50 text-teal-600"
                                                }`}
                                                title={m.status === "ACTIVE" ? "Tangguhkan anggota" : "Aktifkan anggota"}>
                                                {m.status === "ACTIVE"
                                                    ? <ToggleRight className="w-5 h-5" />
                                                    : <ToggleLeft className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Invite Codes Tab ── */}
            {activeTab === "invites" && isAdmin && (
                <div className="space-y-6">
                    {/* Generate new code */}
                    {!showInviteForm && org.verificationStatus !== "REJECTED" ? (
                        <button
                            onClick={() => setShowInviteForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--text-primary)] text-white hover:opacity-90 transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Kode Undangan Baru
                        </button>
                    ) : org.verificationStatus !== "REJECTED" ? (
                        <div className="card p-6 space-y-5 border-l-4 border-l-[var(--accent)]">
                            <h3 className="font-bold text-[var(--text-primary)] text-[16px] flex items-center gap-2">
                                <Key className="w-5 h-5 text-[var(--accent)]" />
                                Buat Kode Undangan
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Role */}
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Role</label>
                                    <div className="relative">
                                        <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                                            className={selectClass}>
                                            <option value="MEMBER">Member</option>
                                            <option value="AUDITOR">Auditor</option>
                                            <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                                            <option value="ORGANIZATION_ADMIN">Admin</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Max uses */}
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
                                        Batas Penggunaan <span className="text-[var(--text-tertiary)] font-normal">(opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                        <input type="number" min={1} value={inviteMaxUses}
                                            onChange={(e) => setInviteMaxUses(e.target.value)}
                                            placeholder="Tak terbatas"
                                            className={inputClass} />
                                    </div>
                                </div>

                                {/* Expiry */}
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
                                        Masa Berlaku (hari) <span className="text-[var(--text-tertiary)] font-normal">(opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                        <input type="number" min={1} max={365} value={inviteExpiry}
                                            onChange={(e) => setInviteExpiry(e.target.value)}
                                            placeholder="Selamanya"
                                            className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={handleGenerateInvite} disabled={isGenerating}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--text-primary)] text-white disabled:opacity-50 transition-all hover:opacity-90">
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                    Generate Kode
                                </button>
                                <button onClick={() => setShowInviteForm(false)}
                                    className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-[var(--text-secondary)] bg-white border border-[var(--border)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-all">
                                    Batal
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Invite codes list */}
                    <div className="card">
                        <div className="px-6 py-5 border-b border-[var(--border)]">
                            <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-[16px]">
                                <Key className="w-5 h-5 text-[var(--text-tertiary)]" />
                                Kode Aktif ({invites.filter(i => i.isActive).length})
                            </h2>
                        </div>

                        {invites.length === 0 ? (
                            <div className="py-16 text-center">
                                <Key className="w-10 h-10 mx-auto mb-3 text-[var(--border-strong)]" />
                                <p className="text-[13px] text-[var(--text-secondary)]">Belum ada kode undangan. Generate baru di atas.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {invites.map((inv) => (
                                    <div key={inv.id} className={`px-6 py-5 flex items-center justify-between gap-4 transition-colors ${!inv.isActive ? "opacity-50 bg-[var(--surface-secondary)]" : "hover:bg-[var(--surface-secondary)]/50"}`}>
                                        {/* Code Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap mb-2">
                                                <code
                                                    className={`text-[16px] font-mono font-bold tracking-widest ${inv.isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}>
                                                    {inv.code}
                                                </code>
                                                {inv.isActive && <CopyButton text={inv.code} />}
                                                <RoleBadge role={inv.role} />
                                                {!inv.isActive && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-600 border border-red-200">
                                                        Dicabut (Revoked)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-[12px] text-[var(--text-tertiary)] flex-wrap">
                                                <span className="flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {inv.usesCount}{inv.maxUses ? ` / ${inv.maxUses}` : ""} Terpakai
                                                </span>
                                                {inv.expiresAt && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Kedaluwarsa {new Date(inv.expiresAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <span>Oleh {inv.createdBy.name}</span>
                                            </div>
                                        </div>

                                        {/* Revoke */}
                                        {inv.isActive && org.verificationStatus !== "REJECTED" && (
                                            <button onClick={() => handleRevoke(inv.id)}
                                                className="p-2 rounded-lg transition-all text-[var(--text-tertiary)] border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50"
                                                title="Cabut kode">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
