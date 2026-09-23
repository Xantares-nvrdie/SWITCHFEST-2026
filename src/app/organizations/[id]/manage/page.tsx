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
    ShieldCheck,
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
}

const roleMeta: Record<OrgRole, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    ORGANIZATION_ADMIN: { label: "Admin", icon: Crown, color: "text-amber-400", bg: "rgba(251,191,36,0.1)" },
    PROCUREMENT_OFFICER: { label: "Procurement Officer", icon: Briefcase, color: "text-emerald-400", bg: "rgba(52,211,153,0.1)" },
    AUDITOR: { label: "Auditor", icon: Eye, color: "text-indigo-400", bg: "rgba(99,102,241,0.1)" },
    MEMBER: { label: "Member", icon: User, color: "text-slate-400", bg: "rgba(100,116,139,0.1)" },
};

function RoleBadge({ role }: { role: OrgRole }) {
    const m = roleMeta[role];
    const Icon = m.icon;
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: m.bg, color: m.color.replace("text-", "") }}
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
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
            style={{
                background: copied ? "rgba(52,211,153,0.15)" : "rgba(30,41,59,0.6)",
                border: `1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(51,65,85,0.5)"}`,
                color: copied ? "#34d399" : "#94a3b8",
            }}
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
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
    const [activeTab, setActiveTab] = useState<"members" | "invites">("members");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

            if (!orgRes.ok) { setError("Organization not found"); return; }
            const orgData = await orgRes.json();
            setOrg(orgData);

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
            setError("Failed to load organization data");
        } finally {
            setIsLoading(false);
        }
    }, [orgId, session?.user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

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

    const panelStyle = {
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(51, 65, 85, 0.5)",
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
    );

    if (error || !org) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-slate-400">{error ?? "Organization not found"}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <button onClick={() => router.back()} className="mt-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-bold text-white">{org.name}</h1>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                                {org.type}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {members.length} member{members.length !== 1 ? "s" : ""}
                            {isAdmin && <span className="ml-2 text-amber-400 flex items-center gap-1"><Crown className="w-3 h-3" /> Admin</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(51,65,85,0.4)" }}>
                {([["members", Users, "Members"], ["invites", Key, "Invite Codes"]] as const).map(([tab, Icon, label]) => {
                    const isActive = activeTab === tab;
                    if (tab === "invites" && !isAdmin) return null;
                    return (
                        <button key={tab} onClick={() => setActiveTab(tab as typeof activeTab)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: isActive ? "rgba(52,211,153,0.1)" : "transparent",
                                color: isActive ? "#34d399" : "#64748b",
                                border: isActive ? "1px solid rgba(52,211,153,0.25)" : "1px solid transparent",
                            }}>
                            <Icon className="w-4 h-4" />
                            {label}
                            {tab === "invites" && invites.filter(i => i.isActive).length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                    style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                                    {invites.filter(i => i.isActive).length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Members Tab ── */}
            {activeTab === "members" && (
                <div className="rounded-xl overflow-hidden" style={panelStyle}>
                    <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400" />
                            Members
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-800/40">
                        {members.map((m) => {
                            const isSelf = m.user.id === session?.user?.id;
                            return (
                                <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors">
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 border border-slate-700 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-slate-300">
                                            {m.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-white">{m.user.name}</span>
                                            {isSelf && <span className="text-[10px] text-slate-500">(you)</span>}
                                            <RoleBadge role={m.role} />
                                            {m.status === "SUSPENDED" && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                                    style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                                                    Suspended
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{m.user.email}</p>
                                    </div>

                                    {/* Admin actions */}
                                    {isAdmin && !isSelf && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            {/* Role selector */}
                                            <div className="relative">
                                                <select
                                                    value={m.role}
                                                    onChange={(e) => handleUpdateMemberRole(m.id, e.target.value as OrgRole)}
                                                    className="appearance-none text-xs pr-6 pl-2 py-1.5 rounded-lg cursor-pointer outline-none transition-all"
                                                    style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.6)", color: "#94a3b8" }}
                                                >
                                                    <option value="MEMBER">Member</option>
                                                    <option value="AUDITOR">Auditor</option>
                                                    <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                                                    <option value="ORGANIZATION_ADMIN">Admin</option>
                                                </select>
                                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                                            </div>

                                            {/* Toggle active/suspended */}
                                            <button
                                                onClick={() => handleToggleMemberStatus(m.id, m.status)}
                                                className="p-1.5 rounded-lg transition-all"
                                                title={m.status === "ACTIVE" ? "Suspend member" : "Activate member"}
                                                style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(51,65,85,0.5)", color: m.status === "ACTIVE" ? "#64748b" : "#34d399" }}>
                                                {m.status === "ACTIVE"
                                                    ? <ToggleRight className="w-4 h-4 text-emerald-400" />
                                                    : <ToggleLeft className="w-4 h-4 text-slate-500" />}
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
                <div className="space-y-4">
                    {/* Generate new code */}
                    {!showInviteForm ? (
                        <button
                            onClick={() => setShowInviteForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{ background: "linear-gradient(135deg, #34d399 0%, #06b6d4 100%)", boxShadow: "0 4px 15px -4px rgba(52,211,153,0.4)" }}>
                            <Plus className="w-4 h-4" />
                            Generate Invite Code
                        </button>
                    ) : (
                        <div className="rounded-xl p-5 space-y-4" style={panelStyle}>
                            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                                <Key className="w-4 h-4 text-emerald-400" />
                                New Invite Code
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Role */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400">Role</label>
                                    <div className="relative">
                                        <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                                            className="w-full appearance-none text-sm pr-8 pl-3 py-2.5 rounded-lg outline-none"
                                            style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(51,65,85,0.6)", color: "#e2e8f0" }}>
                                            <option value="MEMBER">Member</option>
                                            <option value="AUDITOR">Auditor</option>
                                            <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                                            <option value="ORGANIZATION_ADMIN">Admin</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Max uses */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400">
                                        Max Uses <span className="text-slate-600">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                        <input type="number" min={1} value={inviteMaxUses}
                                            onChange={(e) => setInviteMaxUses(e.target.value)}
                                            placeholder="Unlimited"
                                            className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(51,65,85,0.6)", color: "#e2e8f0" }} />
                                    </div>
                                </div>

                                {/* Expiry */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-400">
                                        Expires in days <span className="text-slate-600">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                        <input type="number" min={1} max={365} value={inviteExpiry}
                                            onChange={(e) => setInviteExpiry(e.target.value)}
                                            placeholder="Never"
                                            className="w-full pl-8 pr-3 py-2.5 rounded-lg text-sm outline-none"
                                            style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(51,65,85,0.6)", color: "#e2e8f0" }} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <button onClick={handleGenerateInvite} disabled={isGenerating}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                                    style={{ background: "linear-gradient(135deg, #34d399, #06b6d4)" }}>
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                    Generate
                                </button>
                                <button onClick={() => setShowInviteForm(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Invite codes list */}
                    <div className="rounded-xl overflow-hidden" style={panelStyle}>
                        <div className="px-5 py-4 border-b border-slate-800/60">
                            <h2 className="font-semibold text-white flex items-center gap-2 text-sm">
                                <Key className="w-4 h-4 text-emerald-400" />
                                Active Codes ({invites.filter(i => i.isActive).length})
                            </h2>
                        </div>

                        {invites.length === 0 ? (
                            <div className="py-12 text-center text-slate-500 text-sm">
                                <Key className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                No invite codes yet. Generate one above.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/40">
                                {invites.map((inv) => (
                                    <div key={inv.id} className={`px-5 py-4 flex items-center gap-4 transition-colors ${!inv.isActive ? "opacity-40" : "hover:bg-slate-800/20"}`}>
                                        {/* Code */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <code
                                                    className="text-base font-mono font-bold tracking-widest"
                                                    style={{ color: inv.isActive ? "#34d399" : "#64748b" }}>
                                                    {inv.code}
                                                </code>
                                                {inv.isActive && <CopyButton text={inv.code} />}
                                                <RoleBadge role={inv.role} />
                                                {!inv.isActive && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                                        style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                                                        Revoked
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {inv.usesCount}{inv.maxUses ? `/${inv.maxUses}` : ""} uses
                                                </span>
                                                {inv.expiresAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <span>by {inv.createdBy.name}</span>
                                            </div>
                                        </div>

                                        {/* Revoke */}
                                        {inv.isActive && (
                                            <button onClick={() => handleRevoke(inv.id)}
                                                className="p-1.5 rounded-lg transition-all text-slate-600 hover:text-red-400 hover:bg-red-500/10"
                                                title="Revoke code">
                                                <Trash2 className="w-4 h-4" />
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
