"use client";

import { useEffect, useState } from "react";
import { History, ShieldCheck, Search, Globe, User, Filter, Loader2, Inbox } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    description: string | null;
    userId: string | null;
    ipAddress: string | null;
    createdAt: string;
}

const ACTION_COLOR: Record<string, string> = {
    SUBMIT_SEALED_BID:       "#58a6ff",
    RECORD_ONCHAIN_COMMIT:   "#bc8cff",
    REVEAL_BID_SUCCESS:      "#3fb950",
    DECLARE_TENDER_WINNER:   "#e3b341",
    REVEAL_BID_FAILURE:      "#f85149",
    CREATE_TENDER:           "#3fb950",
    UPDATE_TENDER_STATUS:    "#8b949e",
    CREATE_ORGANIZATION:     "#58a6ff",
};

const STATS_ACTIONS = ["SUBMIT_SEALED_BID", "RECORD_ONCHAIN_COMMIT", "REVEAL_BID_SUCCESS", "REVEAL_BID_FAILURE"];

export default function AuditPage() {
    const [logs, setLogs]             = useState<AuditLog[]>([]);
    const [loading, setLoading]       = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [filterOptions, setFilterOptions] = useState<string[]>(["ALL"]);

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            try {
                const res = await fetch("/api/audit-logs");
                if (res.ok) {
                    const data = await res.json();
                    const arr = Array.isArray(data) ? data : [];
                    setLogs(arr);
                    // Build unique action types for filter
                    const uniqueActions = Array.from(new Set(arr.map((l: AuditLog) => l.action))) as string[];
                    setFilterOptions(["ALL", ...uniqueActions]);
                }
            } catch (e) {
                console.error("Failed to fetch audit logs:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter((log) => {
        const matchAction = actionFilter === "ALL" || log.action === actionFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch =
            !q ||
            log.action.toLowerCase().includes(q) ||
            (log.description?.toLowerCase().includes(q) ?? false) ||
            (log.userId?.toLowerCase().includes(q) ?? false) ||
            (log.entityId?.toLowerCase().includes(q) ?? false);
        return matchAction && matchSearch;
    });

    return (
        <div className="space-y-7 pb-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#e6edf3" }}>
                        Audit Trail
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "#7d8590" }}>
                        Riwayat aktivitas transparan, IP tracking, dan verifikasi integritas Smart Contract
                    </p>
                </div>
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(63,185,80,.08)", border: "1px solid rgba(63,185,80,.2)", color: "#3fb950" }}
                >
                    <ShieldCheck style={{ width: 14, height: 14 }} />
                    Blockchain Integrity Verified
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Events",  value: logs.length,                                                                    color: "#e6edf3" },
                    { label: "Sealed Bids",   value: logs.filter((l) => l.action === "SUBMIT_SEALED_BID").length,                    color: "#58a6ff" },
                    { label: "On-Chain Txns", value: logs.filter((l) => l.action === "RECORD_ONCHAIN_COMMIT").length,                 color: "#bc8cff" },
                    { label: "Reveals",       value: logs.filter((l) => l.action === "REVEAL_BID_SUCCESS").length,                   color: "#3fb950" },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <p className="text-label">{s.label}</p>
                        <p className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(13,17,23,.9)", border: "1px solid rgba(99,115,138,.14)" }}
            >
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, color: "#484f58" }} />
                    <input
                        type="text"
                        placeholder="Cari aksi, entity ID, user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: 36, fontSize: 13, height: 36 }}
                    />
                </div>
                <div className="hidden sm:block w-px h-5 self-center" style={{ background: "rgba(99,115,138,.18)" }} />
                <div className="flex items-center gap-1.5 overflow-x-auto flex-wrap">
                    <Filter style={{ width: 13, height: 13, color: "#484f58", flexShrink: 0 }} />
                    {filterOptions.map((f) => {
                        const active = actionFilter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setActionFilter(f)}
                                className="px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                                style={{
                                    background: active ? "rgba(99,115,138,.22)" : "transparent",
                                    color: active ? "#e6edf3" : "#7d8590",
                                    border: active ? "1px solid rgba(99,115,138,.3)" : "1px solid transparent",
                                    fontFamily: f !== "ALL" ? "ui-monospace, monospace" : "inherit",
                                    fontSize: f !== "ALL" ? 10 : 12,
                                }}
                            >
                                {f === "ALL" ? "Semua" : f}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20 gap-3" style={{ color: "#484f58" }}>
                    <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
                    <span className="text-sm">Memuat audit trail dari database...</span>
                </div>
            )}

            {/* Log Timeline */}
            {!loading && (
                <div className="surface p-5 space-y-1">
                    <h3
                        className="text-sm font-semibold flex items-center gap-2 pb-4"
                        style={{ color: "#e6edf3", borderBottom: "1px solid rgba(99,115,138,.1)", marginBottom: 4 }}
                    >
                        <History style={{ width: 14, height: 14, color: "#818cf8" }} />
                        Log Aktivitas Sistem ({filteredLogs.length} event)
                    </h3>

                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12 rounded-xl" style={{ color: "#484f58" }}>
                            <Inbox style={{ width: 28, height: 28, margin: "0 auto 10px", opacity: 0.4 }} />
                            <p className="text-sm">
                                {logs.length === 0 ? "Belum ada aktivitas yang tercatat" : "Tidak ada log yang cocok"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 pt-2">
                            {filteredLogs.map((log, idx) => {
                                const color = ACTION_COLOR[log.action] ?? "#8b949e";
                                const date  = new Date(log.createdAt).toLocaleString("id-ID", {
                                    day: "2-digit", month: "short", year: "numeric",
                                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                                });
                                return (
                                    <div
                                        key={log.id}
                                        className="flex gap-4 py-4"
                                        style={{ borderBottom: idx < filteredLogs.length - 1 ? "1px solid rgba(99,115,138,.08)" : "none" }}
                                    >
                                        {/* Timeline dot */}
                                        <div className="flex flex-col items-center pt-1 shrink-0">
                                            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                            {idx < filteredLogs.length - 1 && (
                                                <div className="w-px flex-1 mt-2" style={{ background: "rgba(99,115,138,.12)", minHeight: 20 }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: `${color}12`, color,
                                                            border: `1px solid ${color}28`,
                                                            fontFamily: "ui-monospace, monospace",
                                                            fontSize: 10,
                                                        }}
                                                    >
                                                        {log.action}
                                                    </span>
                                                    {log.entityType && <span className="tag-mono text-[11px]">{log.entityType}</span>}
                                                    {log.entityId   && <span className="tag-mono text-[11px]">{log.entityId.slice(0, 12)}...</span>}
                                                </div>
                                                <span className="text-xs shrink-0 font-mono" style={{ color: "#484f58" }}>{date}</span>
                                            </div>

                                            {log.description && (
                                                <p className="text-sm" style={{ color: "#8b949e" }}>{log.description}</p>
                                            )}

                                            <div className="flex items-center gap-4 text-xs" style={{ color: "#484f58" }}>
                                                {log.userId && (
                                                    <span className="flex items-center gap-1.5">
                                                        <User style={{ width: 11, height: 11 }} />
                                                        {log.userId.slice(0, 16)}...
                                                    </span>
                                                )}
                                                {log.ipAddress && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Globe style={{ width: 11, height: 11, color: "#58a6ff" }} />
                                                        {log.ipAddress}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Integrity note */}
            <div
                className="flex items-center gap-3 p-4 rounded-xl text-xs"
                style={{ background: "rgba(99,115,138,.05)", border: "1px solid rgba(99,115,138,.12)", color: "#484f58" }}
            >
                <ShieldCheck style={{ width: 14, height: 14, color: "#3fb950", flexShrink: 0 }} />
                Semua event audit dicatat secara tamper-proof dengan timestamp dari server. Event bertanda ONCHAIN diverifikasi dengan Blockchain Transaction Hash.
            </div>
        </div>
    );
}
