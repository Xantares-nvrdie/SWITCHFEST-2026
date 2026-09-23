"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
                .then((r) => r.json())
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
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-lg">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                {/* Kiri: Logo + Navigasi */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
                            TenderSeal
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {/* Show Buat Tender if logged in and has role */}
                        {canCreateTender && (
                            <Link
                                href="/tenders/create"
                                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
                                    pathname === "/tenders/create"
                                        ? "bg-[var(--accent)] text-white"
                                        : "text-[var(--accent)] hover:bg-[var(--accent-light)]"
                                }`}
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                Buat Tender
                            </Link>
                        )}

                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
                                        isActive
                                            ? "bg-[var(--surface-secondary)] text-[var(--text-primary)]"
                                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
                                    }`}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Kanan: Peran Demo + Autentikasi */}
                <div className="flex items-center gap-3">
                    {/* Pemilih Peran Demo Removed */}

                    {/* Status Autentikasi */}
                    {isPending ? (
                        <Loader2 className="w-4 h-4 text-[var(--text-tertiary)] animate-spin" />
                    ) : session?.user ? (
                        <div className="flex items-center gap-2">
                            <Link href="/profile" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-secondary)] transition-colors border border-transparent hover:border-[var(--border-light)] cursor-pointer">
                                {session.user.image ? (
                                    <img src={session.user.image} alt={session.user.name} className="w-6 h-6 rounded-full object-cover border border-[var(--border)]" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                            {session.user.name.substring(0, 2)}
                                        </span>
                                    </div>
                                )}
                                <span className="text-[13px] text-[var(--text-primary)] font-medium max-w-[120px] truncate hidden sm:inline">
                                    {session.user.name}
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-medium text-[var(--text-tertiary)] hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Keluar"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold bg-[var(--text-primary)] text-white hover:opacity-90 transition-opacity"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                Daftar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
