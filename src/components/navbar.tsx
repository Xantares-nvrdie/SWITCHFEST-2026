"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDemo, type DemoRole } from "@/context/demo-context";
import { useSession, signOut } from "@/lib/auth-client";
import {
    ShieldCheck,
    FileText,
    Building2,
    History,
    PlusCircle,
    BookOpen,
    Lock,
    Sparkles,
    Briefcase,
    Eye,
    LogIn,
    UserPlus,
    LogOut,
    User,
    Loader2,
} from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { activeRole, setActiveRole } = useDemo();
    const { data: session, isPending } = useSession();

    const roleBadges: Record<DemoRole, { label: string; icon: React.ElementType; color: string }> = {
        PROCUREMENT_OFFICER: {
            label: "Procurement Officer",
            icon: Briefcase,
            color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        },
        VENDOR: {
            label: "Vendor Organization",
            icon: Lock,
            color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        },
        AUDITOR: {
            label: "Auditor",
            icon: Eye,
            color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
        },
    };

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
                            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg tracking-tight text-white">
                                    Tender<span className="gradient-text">Seal</span>
                                </span>
                                <span className="text-[10px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    MVP
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-normal">Secure Sealed Procurement</p>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            href="/"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                pathname === "/"
                                    ? "bg-slate-800 text-white border border-slate-700"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            Overview
                        </Link>

                        <Link
                            href="/tenders"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                pathname.startsWith("/tenders") && pathname !== "/tenders/create"
                                    ? "bg-slate-800 text-white border border-slate-700"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <FileText className="w-4 h-4 text-cyan-400" />
                            Tenders
                        </Link>

                        {activeRole === "PROCUREMENT_OFFICER" && (
                            <Link
                                href="/tenders/create"
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                    pathname === "/tenders/create"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                        : "text-emerald-400 hover:bg-emerald-500/10"
                                }`}
                            >
                                <PlusCircle className="w-4 h-4" />
                                Create Tender
                            </Link>
                        )}

                        <Link
                            href="/organizations"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                pathname === "/organizations"
                                    ? "bg-slate-800 text-white border border-slate-700"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <Building2 className="w-4 h-4 text-indigo-400" />
                            Organizations
                        </Link>

                        <Link
                            href="/audit"
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                pathname === "/audit"
                                    ? "bg-slate-800 text-white border border-slate-700"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                            <History className="w-4 h-4 text-amber-400" />
                            Audit Trail
                        </Link>

                        <a
                            href="/api/labs"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            API Docs
                        </a>
                    </nav>

                    {/* Right side — Auth + Demo Role */}
                    <div className="flex items-center gap-3">
                        {/* Demo Role Switcher */}
                        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                            <span className="text-xs text-slate-500 font-medium px-2 hidden lg:inline">Demo Role:</span>
                            {(["PROCUREMENT_OFFICER", "VENDOR", "AUDITOR"] as DemoRole[]).map((r) => {
                                const isSelected = activeRole === r;
                                return (
                                    <button
                                        key={r}
                                        onClick={() => setActiveRole(r)}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                                            isSelected
                                                ? roleBadges[r].color + " border shadow-sm"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                                        }`}
                                    >
                                        {r === "PROCUREMENT_OFFICER" && "Officer"}
                                        {r === "VENDOR" && "Vendor"}
                                        {r === "AUDITOR" && "Auditor"}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Auth State */}
                        {isPending ? (
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                            </div>
                        ) : session?.user ? (
                            /* Logged in — user info + logout */
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0">
                                        <User className="w-3 h-3 text-slate-950" />
                                    </div>
                                    <span className="text-sm text-slate-300 font-medium max-w-[120px] truncate hidden sm:inline">
                                        {session.user.name}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                                    title="Sign out"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            /* Not logged in — Login / Register */
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all duration-200"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                                    style={{
                                        background: "linear-gradient(135deg, #34d399 0%, #06b6d4 60%, #6366f1 100%)",
                                        boxShadow: "0 2px 12px -3px rgba(52,211,153,0.35)",
                                    }}
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
