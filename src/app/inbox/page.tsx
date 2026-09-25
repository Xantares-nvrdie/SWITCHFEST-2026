"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Bell, CheckCheck, Loader2, Info, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function InboxPage() {
    const { data: session } = authClient.useSession();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchNotifications();
        }
    }, [session?.user]);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "POST" });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications/read-all", { method: "POST" });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "SUCCESS": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case "WARNING": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Bell className="w-6 h-6 text-[var(--accent)]" />
                            Kotak Masuk
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">Pemberitahuan aktivitas tender dan bid Anda.</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] text-[var(--text-primary)] text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-[var(--border)]"
                        >
                            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--accent)]" />
                            <p>Memuat notifikasi...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="card p-12 text-center rounded-2xl border border-[var(--border)]">
                            <Bell className="w-12 h-12 text-[var(--text-tertiary)]/30 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Belum Ada Notifikasi</h3>
                            <p className="text-[var(--text-secondary)] mt-1">Notifikasi akan muncul di sini ketika ada aktivitas baru.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div 
                                key={n.id} 
                                onClick={() => !n.isRead && markAsRead(n.id)}
                                className={`card p-5 rounded-xl border transition-all cursor-pointer ${
                                    n.isRead 
                                        ? 'bg-[var(--surface)] border-[var(--border)] opacity-75' 
                                        : 'bg-[var(--surface-secondary)]/30 border-purple-500/30 ring-1 ring-purple-500/10'
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-bold ${!n.isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                {n.title}
                                            </h3>
                                            <span className="text-[11px] text-[var(--text-tertiary)] whitespace-nowrap ml-4">
                                                {new Date(n.createdAt).toLocaleDateString("id-ID", { 
                                                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" 
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)] mb-3">{n.message}</p>
                                        
                                        {n.link && (
                                            <Link 
                                                href={n.link}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:text-purple-400 transition-colors"
                                                onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                            >
                                                Lihat Detail <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
