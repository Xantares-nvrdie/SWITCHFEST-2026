"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggleButton } from "@/components/ui/skiper-ui/skiper26";
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
    BookOpen,
    Menu,
    X,
} from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, isPending } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    const isSysAdmin = (session?.user as any)?.role === "admin";

    const navItems = [
        { href: "/tenders", label: "Tender", icon: FileText },
        { href: "/organizations", label: "Organisasi", icon: Building2 },
        { href: "/tutorial", label: "Panduan", icon: BookOpen },
    ];

    if (session?.user) {
        navItems.push({ href: "/bids", label: "Riwayat Bid", icon: ClipboardList });
    }

    if (isSysAdmin) {
        navItems.push({ href: "/audit", label: "Audit", icon: History });
        navItems.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
    }

    return (
        <header className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--background)]/80 backdrop-blur-md">
            <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Kiri: Logo + Navigasi */}
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="h-8 w-auto flex items-center justify-center transition-transform group-hover:scale-105">
                            <img src="/assets/logo-black.png" alt="TenderSeal Logo" className="dark:hidden h-full w-auto object-contain" />
                            <img src="/assets/logo-white.png" alt="TenderSeal Logo" className="hidden dark:block h-full w-auto object-contain" />
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1.5">
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

                {/* Kanan: Autentikasi & Menu */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <ThemeToggleButton className="!w-8 !h-8 !p-1.5" />
                    
                    {isPending ? (
                        <Loader2 className="w-4 h-4 text-[var(--text-tertiary)] animate-spin" />
                    ) : session?.user ? (
                        <div className="flex items-center gap-1 sm:gap-3">
                            <NotificationBell />
                            <Link
                                href="/profile"
                                className="flex items-center gap-2.5 pl-2 sm:pl-3 pr-2 py-1.5 rounded-full hover:bg-[var(--surface-secondary)] transition-all border border-transparent hover:border-[var(--border)] cursor-pointer"
                            >
                                <span className="text-[13px] text-[var(--text-primary)] font-medium max-w-[120px] truncate hidden sm:inline">
                                    {session.user.name}
                                </span>
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name}
                                        className="w-7 h-7 rounded-full object-cover border border-[var(--border)]"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] flex items-center justify-center shadow-inner shrink-0">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                            {session.user.name.substring(0, 2)}
                                        </span>
                                    </div>
                                )}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center gap-1.5 p-2 rounded-full text-[var(--text-tertiary)] hover:text-[var(--color-rose)] hover:bg-[rgba(225,29,72,0.1)] transition-colors"
                                title="Keluar"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                href="/login"
                                className="hidden sm:block px-4 py-2 rounded-full text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 sm:px-5 py-2 rounded-full text-[12px] sm:text-[13px] font-semibold bg-[var(--text-primary)] text-[var(--background)] hover:scale-105 transition-transform shadow-md"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}

                    {/* Hamburger Menu (Mobile) */}
                    <div className="md:hidden flex items-center ml-1">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-[var(--border-light)] bg-[var(--background)]/95 backdrop-blur-md absolute w-full max-h-[calc(100vh-64px)] overflow-y-auto shadow-xl">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-xl text-[14px] font-medium transition-all flex items-center gap-3 ${
                                        isActive
                                            ? "bg-[var(--surface-secondary)] text-[var(--text-primary)] font-semibold"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
}
