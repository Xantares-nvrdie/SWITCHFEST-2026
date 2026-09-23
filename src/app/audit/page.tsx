"use client";

import { useState } from "react";
import { History, ShieldCheck, Cpu, Search, Activity, Globe, CheckCircle2, FileText, User } from "lucide-react";

interface AuditLogItem {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    description: string;
    userEmail: string;
    ipAddress: string;
    createdAt: string;
}

const mockAuditLogs: AuditLogItem[] = [
    {
        id: "log-001",
        action: "SUBMIT_SEALED_BID",
        entityType: "bids",
        entityId: "bid-9823",
        description: "Vendor PT Tech Solusindo mengirimkan sealed bid terenkripsi AES-GCM + commitment hash",
        userEmail: "vendor@techsolusindo.com",
        ipAddress: "182.253.44.12",
        createdAt: "2026-09-17 16:30:12",
    },
    {
        id: "log-002",
        action: "RECORD_ONCHAIN_COMMIT",
        entityType: "blockchain_transactions",
        entityId: "tx-4412",
        description: "Transaksi COMMIT dicatat ke Smart Contract TenderSeal (Tx: 0x8f2a...f2a)",
        userEmail: "system-relayer",
        ipAddress: "10.0.4.1",
        createdAt: "2026-09-17 16:30:15",
    },
    {
        id: "log-003",
        action: "REVEAL_BID_SUCCESS",
        entityType: "bid_reveals",
        entityId: "bid-9823",
        description: "Dekripsi penawaran di browser berhasil & Commitment Hash cocok 100%",
        userEmail: "vendor@techsolusindo.com",
        ipAddress: "182.253.44.12",
        createdAt: "2026-09-17 17:01:45",
    },
    {
        id: "log-004",
        action: "DECLARE_TENDER_WINNER",
        entityType: "tender_results",
        entityId: "tnd-demo-001",
        description: "Procurement Officer menetapkan PT Tech Solusindo Utama sebagai pemenang tender",
        userEmail: "officer@globaltech.co.id",
        ipAddress: "36.85.12.90",
        createdAt: "2026-09-17 17:10:00",
    },
];

export default function AuditPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLogs = mockAuditLogs.filter(
        (log) =>
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        Audit Trail & Verifikasi On-Chain
                    </h1>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Riwayat aktivitas transparan, pelacakan IP address, dan bukti integritas Smart Contract.
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card p-4 rounded-2xl border-[var(--border)]">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari aksi, deskripsi, atau email user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none"
                    />
                </div>
            </div>

            {/* Audit Log Timeline */}
            <div className="card p-6 rounded-2xl border-[var(--border)] space-y-4">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-600" /> Log Aktivitas Sistem (Database & IP Inet)
                </h3>

                <div className="space-y-3">
                    {filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-[var(--accent)]">{log.action}</span>
                                    <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-tertiary)] font-mono text-[11px]">
                                        {log.entityType}
                                    </span>
                                </div>
                                <p className="text-[var(--text-secondary)] font-medium">{log.description}</p>
                                <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)] pt-1">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" /> {log.userEmail}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Globe className="w-3 h-3 text-[var(--accent)]" /> IP: {log.ipAddress}
                                    </span>
                                </div>
                            </div>

                            <span className="text-[11px] font-mono text-[var(--text-tertiary)] self-end md:self-center shrink-0">
                                {log.createdAt}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
