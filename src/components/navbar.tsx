"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemo, type DemoRole } from "@/context/demo-context";
import {
    ShieldCheck,
    FileText,
    Building2,
    History,
    PlusCircle,
    UserCheck,
    BookOpen,
    Lock,
    Sparkles,
    Briefcase,
    Eye,
} from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const { activeRole, setActiveRole } = useDemo();

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

    const ActiveRoleIcon = roleBadges[activeRole].icon;

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

                    {/* Interactive Role Switcher Pill */}
                    <div className="flex items-center gap-3">
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
                    </div>
                </div>
            </div>
        </header>
    );
}
