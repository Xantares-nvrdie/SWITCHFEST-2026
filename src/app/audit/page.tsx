"use client";

import { useState, useEffect } from "react";
import { History, ShieldCheck, Cpu, Search, Activity, Globe, CheckCircle2, FileText, User } from "lucide-react";

interface AuditLogItem {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    description: string | null;
    userEmail: string | null;
    ipAddress: string | null;
    createdAt: string;
}

export default function AuditPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        fetch("/api/audit-logs")
            .then(res => res.json())
            .then(data => {
                // Ensure data is array
                if (Array.isArray(data)) {
                    // Sort descending by date
                    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setLogs(data);
                } else {
                    setLogs([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch audit logs", err);
                setLogs([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredLogs = logs.filter(
        (log) =>
            log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="space-y-8 w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                        Audit Trail & Verifikasi On-Chain
                    </h1>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Pantau semua aktivitas yang terjadi di sistem TenderSeal beserta catatan permanen dari smart contract.
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bento-card p-4">
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
            <div className="bento-card p-6 space-y-4">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-600" /> Log Aktivitas
                </h3>

                {loading ? (
                    <div className="text-center text-sm text-[var(--text-tertiary)] py-12">Memuat log aktivitas...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center text-sm text-[var(--text-tertiary)] py-12">Belum ada aktivitas tercatat.</div>
                ) : (
                    <div className="space-y-3">
                        {paginatedLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-[var(--accent)]">{log.action}</span>
                                        {log.entityType && (
                                            <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-tertiary)] font-mono text-[11px]">
                                                {log.entityType}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[var(--text-secondary)] font-medium">{log.description}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)] pt-1">
                                        {log.userEmail && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" /> {log.userEmail}
                                            </span>
                                        )}
                                        {log.userEmail && log.ipAddress && <span>•</span>}
                                        {log.ipAddress && (
                                            <span className="flex items-center gap-1">
                                                <Globe className="w-3 h-3 text-[var(--accent)]" /> IP: {log.ipAddress}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <span className="text-[11px] font-mono text-[var(--text-tertiary)] self-end md:self-center shrink-0">
                                    {new Date(log.createdAt).toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-6 border-t border-[var(--border)] gap-4">
                                <span className="text-[13px] text-[var(--text-tertiary)] font-medium">
                                    Menampilkan <strong className="text-[var(--text-primary)]">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)}</strong> dari <strong className="text-[var(--text-primary)]">{filteredLogs.length}</strong> entri
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg border border-[var(--border)] text-[13px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        Sebelumnya
                                    </button>
                                    <div className="flex items-center gap-2 px-1">
                                        <select
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                                            className="px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer appearance-none"
                                        >
                                            {Array.from({ length: totalPages }).map((_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    Hal {i + 1}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="text-[13px] text-[var(--text-tertiary)] hidden sm:inline">dari {totalPages}</span>
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg border border-[var(--border)] text-[13px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
