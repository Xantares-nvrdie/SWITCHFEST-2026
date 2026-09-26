"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { useSession, signOut } from "@/lib/auth-client";
import {
    FileText,
    Building2,
    History,
    PlusCircle,
    LogIn,
    UserPlus,
    LogOut,
    User,
    Loader2,
    ShieldCheck,
    ClipboardList,
} from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, isPending } = useSession();

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    const [canCreateTender, setCanCreateTender] = useState(false);

    useEffect(() => {
        if (session?.user) {
            fetch("/api/organizations/me")
                .then(async (r) => {
                    if (!r.ok) return [];
                    return await r.json();
                })
                .then((data) => {
                    const eligible = data.some(
                        (o: any) =>
                            o.memberStatus === "ACTIVE" &&
                            (o.memberRole === "PROCUREMENT_OFFICER" || o.memberRole === "ORGANIZATION_ADMIN") &&
                            (o.isVerified || o.verificationStatus === "APPROVED")
                    );
                    setCanCreateTender(eligible);
                })
                .catch(() => {});
        }
    }, [session?.user]);

    const isSysAdmin = (session?.user as any)?.role === "admin";

    const navItems = [
        { href: "/tenders", label: "Tender", icon: FileText },
        { href: "/organizations", label: "Organisasi", icon: Building2 },
    ];

    if (session?.user) {
        navItems.push({ href: "/bids", label: "Riwayat Bid", icon: ClipboardList });
    }

    if (isSysAdmin) {
        navItems.push({ href: "/audit", label: "Audit", icon: History });
        navItems.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
    }

    return (
        <header className="sticky top-0 z-50 border-b border-[var(--border-light)] glass-panel">
            <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Kiri: Logo + Navigasi */}
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-[10px] bg-[var(--text-primary)] flex items-center justify-center transition-transform group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                            <ShieldCheck className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="font-display text-[17px] font-bold text-[var(--text-primary)] tracking-tight">
                            TenderSeal
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1.5">
                        {canCreateTender && (
                            <Link
                                href="/tenders/create"
                                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all flex items-center gap-2 ${
                                    pathname === "/tenders/create"
                                        ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-light)]"
                                        : "text-[var(--accent)] hover:bg-[var(--accent-light)]"
                                }`}
                            >
                                <PlusCircle className="w-4 h-4" />
                                Buat Tender
                            </Link>
                        )}

                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 ${
                                        isActive
                                            ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-sm"
                                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] border border-transparent"
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Kanan: Autentikasi */}
                <div className="flex items-center gap-4">
                    {isPending ? (
                        <Loader2 className="w-4 h-4 text-[var(--text-tertiary)] animate-spin" />
                    ) : session?.user ? (
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <Link href="/profile" className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full hover:bg-[var(--surface-secondary)] transition-all border border-transparent hover:border-[var(--border)] cursor-pointer">
                                <span className="text-[13px] text-[var(--text-primary)] font-medium max-w-[120px] truncate hidden sm:inline">
                                    {session.user.name}
                                </span>
                                {session.user.image ? (
                                    <img src={session.user.image} alt={session.user.name} className="w-7 h-7 rounded-full object-cover border border-[var(--border)]" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] flex items-center justify-center shadow-inner">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                            {session.user.name.substring(0, 2)}
                                        </span>
                                    </div>
                                )}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 p-2 rounded-full text-[var(--text-tertiary)] hover:text-[var(--color-rose)] hover:bg-[rgba(225,29,72,0.1)] transition-colors"
                                title="Keluar"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-full text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="px-5 py-2 rounded-full text-[13px] font-semibold bg-[var(--text-primary)] text-[var(--background)] hover:scale-105 transition-transform shadow-md"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
