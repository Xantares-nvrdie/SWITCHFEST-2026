"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function NotificationBell() {
    const { data: session } = authClient.useSession();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications/unread-count");
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.count ?? 0);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();

        // Simple polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [session?.user?.id]);

    if (!session?.user) return null;

    return (
        <Link
            href="/inbox"
            className="relative p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-colors flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Inbox Notifikasi"
        >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-3.5 h-3.5 text-[8px] font-bold text-white bg-red-500 rounded-full ring-2 ring-[var(--surface)]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
        </Link>
    );
}
