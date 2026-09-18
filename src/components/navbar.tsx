"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { ShieldCheck, PlusCircle, ChevronDown, LogIn, LogOut } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
    { href: "/",              label: "Overview",      exact: true  },
    { href: "/tenders",       label: "Tenders",       exact: false },
    { href: "/organizations", label: "Organizations", exact: true  },
    { href: "/audit",         label: "Audit Trail",   exact: true  },
];

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, isPending } = useSession();

    const isActive = (href: string, exact: boolean) =>
        exact ? pathname === href : pathname.startsWith(href) && !(href === "/tenders" && pathname === "/tenders/create");

    return (
        <header
            className="sticky top-0 z-50 w-full"
            style={{
                background: "rgba(6, 9, 15, 0.92)",
                backdropFilter: "blur(20px) saturate(1.6)",
                WebkitBackdropFilter: "blur(20px) saturate(1.6)",
                borderBottom: "1px solid rgba(99, 115, 138, 0.12)",
            }}
        >
            <div className="max-w-7xl mx-auto px-5">
                <div className="flex items-center justify-between h-14">

                    {/* ── Brand ────────────────────────────────── */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #238636 0%, #1a7f37 100%)",
                                boxShadow: "0 0 12px rgba(63,185,80,.25)",
                            }}
                        >
                            <ShieldCheck style={{ width: 18, height: 18, color: "#fff" }} />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-base tracking-tight" style={{ color: "#e6edf3" }}>
                                Tender<span className="gradient-text">Seal</span>
                            </span>
                            <span
                                className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                                style={{
                                    background: "rgba(63,185,80,.1)",
                                    color: "#3fb950",
                                    border: "1px solid rgba(63,185,80,.2)",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                BETA
                            </span>
                        </div>
                    </Link>

                    {/* ── Nav Links ─────────────────────────────── */}
                    <nav className="hidden md:flex items-center gap-0.5">
                        {NAV_LINKS.map(({ href, label, exact }) => {
                            const active = isActive(href, exact);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
                                    style={{
                                        color: active ? "#e6edf3" : "#7d8590",
                                        background: active ? "rgba(99,115,138,.14)" : "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) {
                                            (e.currentTarget as HTMLElement).style.color = "#e6edf3";
                                            (e.currentTarget as HTMLElement).style.background = "rgba(99,115,138,.08)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) {
                                            (e.currentTarget as HTMLElement).style.color = "#7d8590";
                                            (e.currentTarget as HTMLElement).style.background = "transparent";
                                        }
                                    }}
                                >
                                    {label}
                                </Link>
                            );
                        })}

                        {/* New Tender — only when logged in */}
                        {session && (
                            <Link
                                href="/tenders/create"
                                className="btn btn-primary btn-sm ml-2"
                                style={{ fontSize: 12 }}
                            >
                                <PlusCircle style={{ width: 13, height: 13 }} />
                                New Tender
                            </Link>
                        )}
                    </nav>

                    {/* ── Auth Area ─────────────────────────────── */}
                    <div className="flex items-center gap-2">
                        {isPending ? (
                            <div
                                className="w-7 h-7 rounded-full animate-pulse"
                                style={{ background: "rgba(99,115,138,.2)" }}
                            />
                        ) : session ? (
                            <>
                                {/* Avatar + name */}
                                <div className="hidden sm:flex items-center gap-2">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{
                                            background: "rgba(63,185,80,.15)",
                                            border: "1px solid rgba(63,185,80,.25)",
                                            color: "#3fb950",
                                        }}
                                        title={session.user?.email ?? ""}
                                    >
                                        {(session.user?.name ?? session.user?.email ?? "U")[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs font-medium max-w-[120px] truncate" style={{ color: "#8b949e" }}>
                                        {session.user?.name ?? session.user?.email}
                                    </span>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={() =>
                                        signOut({
                                            fetchOptions: { onSuccess: () => window.location.replace("/login") },
                                        })
                                    }
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                                    style={{ color: "#7d8590" }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.color = "#f85149";
                                        (e.currentTarget as HTMLElement).style.background = "rgba(248,81,73,.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.color = "#7d8590";
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                    }}
                                >
                                    <LogOut style={{ width: 13, height: 13 }} />
                                    <span className="hidden sm:block">Keluar</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    background: "rgba(63,185,80,.1)",
                                    border: "1px solid rgba(63,185,80,.22)",
                                    color: "#3fb950",
                                }}
                            >
                                <LogIn style={{ width: 13, height: 13 }} />
                                <span>Masuk</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
