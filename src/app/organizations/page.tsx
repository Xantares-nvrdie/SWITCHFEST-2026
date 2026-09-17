"use client";

import { useState } from "react";
import { Building2, PlusCircle, Users, ShieldCheck, CheckCircle2, UserPlus, Mail, Phone, MapPin } from "lucide-react";

interface Organization {
    id: string;
    name: string;
    type: "BUYER" | "VENDOR" | "BOTH";
    email: string;
    phone: string;
    address: string;
    isVerified: boolean;
    memberCount: number;
}

const mockOrgs: Organization[] = [
    {
        id: "org-buyer-001",
        name: "PT Global Tech Indonesia",
        type: "BUYER",
        email: "procurement@globaltech.co.id",
        phone: "+62 21 555 1234",
        address: "Sudirman Central Business District, Jakarta Selatan",
        isVerified: true,
        memberCount: 8,
    },
    {
        id: "org-vendor-001",
        name: "PT Tech Solusindo Utama",
        type: "VENDOR",
        email: "tender@techsolusindo.com",
        phone: "+62 21 555 8888",
        address: "Kuningan Center Block A-12, Jakarta Selatan",
        isVerified: true,
        memberCount: 5,
    },
    {
        id: "org-vendor-002",
        name: "CV Utama Karya Hardware",
        type: "VENDOR",
        email: "sales@utamakarya.co.id",
        phone: "+62 31 888 7777",
        address: "Rungkut Industrial Estate, Surabaya",
        isVerified: true,
        memberCount: 3,
    },
];

export default function OrganizationsPage() {
    const [orgs, setOrgs] = useState<Organization[]>(mockOrgs);
    const [showModal, setShowModal] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");
    const [newOrgType, setNewOrgType] = useState<"BUYER" | "VENDOR" | "BOTH">("VENDOR");
    const [newOrgEmail, setNewOrgEmail] = useState("");

    const handleCreateOrg = (e: React.FormEvent) => {
        e.preventDefault();
        const newOrg: Organization = {
            id: `org-${Date.now()}`,
            name: newOrgName,
            type: newOrgType,
            email: newOrgEmail || "contact@org.co.id",
            phone: "+62 21 000 0000",
            address: "Indonesia",
            isVerified: false,
            memberCount: 1,
        };
        setOrgs([newOrg, ...orgs]);
        setShowModal(false);
        setNewOrgName("");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Manajemen Organisasi</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Daftar perusahaan penyelenggara tender (Buyer) dan penyedia (Vendor) terverifikasi.
                    </p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" />
                    Daftarkan Organisasi Baru
                </button>
            </div>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {orgs.map((org) => (
                    <div
                        key={org.id}
                        className="glass-panel glass-panel-hover p-6 rounded-2xl border-slate-800 space-y-4 flex flex-col justify-between"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span
                                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                        org.type === "BUYER"
                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                    }`}
                                >
                                    {org.type}
                                </span>
                                {org.isVerified && (
                                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white">{org.name}</h3>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {org.email}
                                </p>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {org.address}
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-semibold text-slate-300">
                                <Users className="w-4 h-4 text-emerald-400" /> {org.memberCount} Anggota
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">{org.id}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Register Organization */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="glass-panel max-w-md w-full p-6 rounded-2xl border-slate-800 space-y-5">
                        <h3 className="text-lg font-bold text-white">Daftarkan Organisasi Baru</h3>
                        <form onSubmit={handleCreateOrg} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-300">
                                    Nama Perusahaan / Instansi
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    placeholder="PT Nusantara Tech..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-300">Tipe Organisasi</label>
                                <select
                                    value={newOrgType}
                                    onChange={(e) => setNewOrgType(e.target.value as "BUYER" | "VENDOR" | "BOTH")}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                                >
                                    <option value="VENDOR">VENDOR (Penyedia Tender)</option>
                                    <option value="BUYER">BUYER (Penyelenggara Tender)</option>
                                    <option value="BOTH">BOTH (Dua-duanya)</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-300">Email Resmi Organisasi</label>
                                <input
                                    type="email"
                                    required
                                    value={newOrgEmail}
                                    onChange={(e) => setNewOrgEmail(e.target.value)}
                                    placeholder="contact@company.com"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                                >
                                    Simpan Organisasi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
