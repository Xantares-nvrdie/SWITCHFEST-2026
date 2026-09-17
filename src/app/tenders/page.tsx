"use client";

import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/context/demo-context";
import {
    FileText,
    PlusCircle,
    Search,
    Filter,
    Clock,
    Lock,
    Users,
    CheckCircle,
    ShieldCheck,
    ArrowUpRight,
    Building2,
    Calendar,
} from "lucide-react";

interface TenderItem {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    organizationName: string;
    status: "DRAFT" | "OPEN" | "CLOSED" | "REVEAL" | "SCORING" | "COMPLETED";
    commitDeadline: string;
    revealWindowHours: number;
    participantCount: number;
    sealedBidsCount: number;
}

const mockTenders: TenderItem[] = [
    {
        id: "tnd-demo-001",
        code: "TND-2026-001",
        title: "Pengadaan 100 Laptop High Performance Workstation",
        description:
            "Pengadaan laptop workstation spesifikasi tinggi untuk tim software engineering & AI graphics design.",
        category: "Hardware",
        organizationName: "PT Global Tech Indonesia",
        status: "OPEN",
        commitDeadline: "2026-09-20T15:00:00Z",
        revealWindowHours: 48,
        participantCount: 5,
        sealedBidsCount: 3,
    },
    {
        id: "tnd-demo-002",
        code: "TND-2026-002",
        title: "Jasa Pembuatan & Development Platform E-Procurement Blockchain",
        description:
            "Pengadaan jasa konsultan dan software house untuk pembangunan platform tender digital terenkripsi.",
        category: "Software Development",
        organizationName: "Dinas Komunikasi & Informatika",
        status: "REVEAL",
        commitDeadline: "2026-09-15T12:00:00Z",
        revealWindowHours: 24,
        participantCount: 4,
        sealedBidsCount: 4,
    },
    {
        id: "tnd-demo-003",
        code: "TND-2026-003",
        title: "Pengadaan Lisensi Software Antivirus & Cyber Security Enterprise",
        description:
            "Pembelian 500 lisensi software perlindungan endpoints & cloud firewalls untuk infrastruktur instansi.",
        category: "Cybersecurity",
        organizationName: "PT Bank Nusa Mandiri",
        status: "SCORING",
        commitDeadline: "2026-09-10T17:00:00Z",
        revealWindowHours: 48,
        participantCount: 3,
        sealedBidsCount: 3,
    },
    {
        id: "tnd-demo-004",
        code: "TND-2026-004",
        title: "Pemeliharaan & Audit Rutin Cloud Infrastructure AWS/GCP",
        description: "Jasa audit keamanan, pemeliharaan server Kubernetes, dan optimasi biaya cloud infrastruktur.",
        category: "Cloud Infrastructure",
        organizationName: "PT Logistik Nusantara",
        status: "COMPLETED",
        commitDeadline: "2026-08-30T10:00:00Z",
        revealWindowHours: 48,
        participantCount: 6,
        sealedBidsCount: 6,
    },
];

export default function TendersPage() {
    const { activeRole } = useDemo();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredTenders = mockTenders.filter((t) => {
        const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
        const matchesSearch =
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.organizationName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusBadgeColors: Record<string, string> = {
        DRAFT: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        OPEN: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        CLOSED: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        REVEAL: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        SCORING: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        COMPLETED: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Katalog & Manajemen Tender</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Daftar tender digital terenkripsi dengan perlindungan Commit-Reveal dan audit trail.
                    </p>
                </div>

                {activeRole === "PROCUREMENT_OFFICER" && (
                    <Link
                        href="/tenders/create"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Buat Tender Baru
                    </Link>
                )}
            </div>

            {/* Filter & Search Bar */}
            <div className="glass-panel p-4 rounded-2xl border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari tender, kode, atau organisasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {["ALL", "OPEN", "CLOSED", "REVEAL", "SCORING", "COMPLETED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                statusFilter === s
                                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tender Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTenders.map((tender) => (
                    <div
                        key={tender.id}
                        className="glass-panel glass-panel-hover p-6 rounded-2xl border-slate-800/80 flex flex-col justify-between space-y-5"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                    {tender.code}
                                </span>
                                <span
                                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                        statusBadgeColors[tender.status]
                                    }`}
                                >
                                    {tender.status}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                                    {tender.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{tender.organizationName}</span>
                                    <span>•</span>
                                    <span className="text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800/80">
                                        {tender.category}
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{tender.description}</p>
                        </div>

                        {/* Metadata Footer */}
                        <div className="space-y-4 pt-3 border-t border-slate-800/80">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="space-y-0.5">
                                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" /> Commit Deadline
                                    </span>
                                    <span className="font-medium text-slate-200 block truncate">
                                        {new Date(tender.commitDeadline).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>

                                <div className="space-y-0.5">
                                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <Users className="w-3 h-3 text-slate-400" /> Participant
                                    </span>
                                    <span className="font-semibold text-slate-200 block">
                                        {tender.participantCount} Vendor
                                    </span>
                                </div>

                                <div className="space-y-0.5">
                                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <Lock className="w-3 h-3 text-emerald-400" /> Sealed Bids
                                    </span>
                                    <span className="font-semibold text-emerald-400 block">
                                        {tender.sealedBidsCount} Bid
                                    </span>
                                </div>
                            </div>

                            <Link
                                href={`/tenders/${tender.id}`}
                                className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 group border border-slate-700"
                            >
                                <span>Buka Interactive Workbench</span>
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-emerald-400" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
