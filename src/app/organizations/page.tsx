"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
    Building2, PlusCircle, Users, CheckCircle2,
    Mail, MapPin, X, Loader2, Inbox,
} from "lucide-react";

interface Organization {
    id: string;
    name: string;
    type: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    isActive?: boolean;
    memberRole?: string;
}

const TYPE_BADGE: Record<string, { badge: string; label: string }> = {
    BUYER:  { badge: "badge-emerald", label: "Buyer"  },
    VENDOR: { badge: "badge-cyan",    label: "Vendor" },
    BOTH:   { badge: "badge-purple",  label: "Buyer & Vendor" },
};

export default function OrganizationsPage() {
    const { data: session } = useSession();
    const [orgs, setOrgs]         = useState<Organization[]>([]);
    const [loading, setLoading]   = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError]   = useState<string | null>(null);

    // Form state
    const [newName, setNewName]   = useState("");
    const [newType, setNewType]   = useState("BUYER");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newAddress, setNewAddress] = useState("");

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/organizations");
            if (res.ok) {
                const data = await res.json();
                setOrgs(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Failed to fetch orgs:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrgs(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setSubmitting(true);
        setFormError(null);

        try {
            const res = await fetch("/api/organizations", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name:    newName,
                    type:    newType,
                    email:   newEmail   || undefined,
                    phone:   newPhone   || undefined,
                    address: newAddress || undefined,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message ?? `HTTP ${res.status}`);
            }
            // Refresh list
            await fetchOrgs();
            setShowModal(false);
            setNewName(""); setNewEmail(""); setNewPhone(""); setNewAddress("");
        } catch (e: unknown) {
            setFormError(e instanceof Error ? e.message : "Gagal membuat organisasi.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-7 pb-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#e6edf3" }}>
                        Organisasi
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#7d8590" }}>
                        Perusahaan penyelenggara tender (Buyer) dan penyedia (Vendor) yang terdaftar
                    </p>
                </div>
                {session && (
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        <PlusCircle style={{ width: 15, height: 15 }} />
                        Daftarkan Organisasi
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Organisasi", value: orgs.length,                                          color: "#e6edf3" },
                    { label: "Buyer",             value: orgs.filter((o) => o.type === "BUYER").length,       color: "#3fb950" },
                    { label: "Vendor",            value: orgs.filter((o) => o.type === "VENDOR").length,      color: "#58a6ff" },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <p className="text-label">{s.label}</p>
                        <p className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20 gap-3" style={{ color: "#484f58" }}>
                    <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
                    <span className="text-sm">Memuat organisasi...</span>
                </div>
            )}

            {/* Empty */}
            {!loading && orgs.length === 0 && (
                <div
                    className="flex flex-col items-center justify-center py-20 rounded-xl gap-3 text-center"
                    style={{ border: "1px dashed rgba(99,115,138,.2)", color: "#484f58" }}
                >
                    <Inbox style={{ width: 36, height: 36, opacity: 0.4 }} />
                    <p className="text-sm font-medium" style={{ color: "#7d8590" }}>Belum ada organisasi terdaftar</p>
                    <p className="text-xs">Daftarkan organisasi Anda untuk mulai membuat tender</p>
                    {session && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm mt-2">
                            <PlusCircle style={{ width: 13, height: 13 }} />
                            Daftarkan Organisasi
                        </button>
                    )}
                </div>
            )}

            {/* Cards */}
            {!loading && orgs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orgs.map((org) => {
                        const tb = TYPE_BADGE[org.type] ?? TYPE_BADGE.BUYER;
                        return (
                            <div key={org.id} className="surface p-5 space-y-4 flex flex-col justify-between interactive">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={`badge ${tb.badge}`}>{tb.label}</span>
                                        {org.isActive !== false && (
                                            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#3fb950" }}>
                                                <CheckCircle2 style={{ width: 12, height: 12 }} />
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold leading-snug" style={{ color: "#e6edf3" }}>
                                            {org.name}
                                        </h3>
                                        {org.email && (
                                            <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: "#7d8590" }}>
                                                <Mail style={{ width: 11, height: 11 }} />
                                                {org.email}
                                            </p>
                                        )}
                                        {org.address && (
                                            <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "#7d8590" }}>
                                                <MapPin style={{ width: 11, height: 11 }} />
                                                {org.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className="flex items-center justify-between pt-3"
                                    style={{ borderTop: "1px solid rgba(99,115,138,.1)" }}
                                >
                                    {org.memberRole && (
                                        <span className="badge badge-slate text-[11px]">{org.memberRole}</span>
                                    )}
                                    <span className="tag-mono text-[11px] ml-auto">{org.id.slice(0, 8)}...</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(6,9,15,.85)", backdropFilter: "blur(12px)" }}
                >
                    <div
                        className="w-full max-w-md rounded-xl p-6 space-y-5 animate-fade-up"
                        style={{
                            background: "#161b22",
                            border: "1px solid rgba(99,115,138,.22)",
                            boxShadow: "0 24px 64px rgba(0,0,0,.6)",
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: "#e6edf3" }}>
                                    Daftarkan Organisasi Baru
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: "#7d8590" }}>
                                    Anda akan otomatis menjadi Admin organisasi ini
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                                style={{ color: "#484f58" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e6edf3")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#484f58")}
                            >
                                <X style={{ width: 15, height: 15 }} />
                            </button>
                        </div>

                        <hr className="divider" />

                        {formError && (
                            <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: "rgba(248,81,73,.08)", border: "1px solid rgba(248,81,73,.2)", color: "#f85149" }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="form-label">Nama Perusahaan <span style={{ color: "#f85149" }}>*</span></label>
                                <input type="text" required placeholder="PT Nusantara Tech..." value={newName} onChange={(e) => setNewName(e.target.value)} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Tipe Organisasi</label>
                                <select value={newType} onChange={(e) => setNewType(e.target.value)} className="form-input" style={{ cursor: "pointer" }}>
                                    <option value="BUYER">BUYER — Penyelenggara Tender</option>
                                    <option value="VENDOR">VENDOR — Penyedia Tender</option>
                                    <option value="BOTH">BOTH — Keduanya</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Email Resmi</label>
                                <input type="email" placeholder="contact@company.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Nomor Telepon</label>
                                <input type="tel" placeholder="+62 21 000 0000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Alamat</label>
                                <input type="text" placeholder="Jakarta, Indonesia" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="form-input" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Batal</button>
                                <button type="submit" disabled={submitting || !newName.trim()} className="btn btn-primary">
                                    {submitting ? (
                                        <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />Menyimpan...</>
                                    ) : (
                                        <><Building2 style={{ width: 14, height: 14 }} />Daftarkan</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
