"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
    Key,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    Building2,
} from "lucide-react";

export default function JoinOrganizationPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ orgName: string; role: string } | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/invites/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim().toUpperCase() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message ?? "Failed to join organization.");
                setIsLoading(false);
                return;
            }

            setSuccess({ orgName: data.data.organizationName, role: data.data.role });
            setTimeout(() => {
                router.push("/organizations");
                router.refresh();
            }, 2000);
        } catch {
            setError("Network error. Please check your connection.");
            setIsLoading(false);
        }
    };

    const inputBase = {
        background: "rgba(30, 41, 59, 0.6)",
        border: "1px solid rgba(51, 65, 85, 0.7)",
    };

    return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
                    style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }} />

            <div className="w-full max-w-md relative z-10">
                <div className="rounded-2xl p-8"
                    style={{
                        background: "rgba(15, 23, 42, 0.80)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(51, 65, 85, 0.6)",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                    }}>

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 mb-4">
                            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                <Key className="w-7 h-7 text-cyan-400" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Join Organization</h1>
                        <p className="text-sm text-slate-400 mt-1 text-center">
                            Masukkan kode undangan yang kamu terima dari Admin organisasi
                        </p>
                    </div>

                    {/* Success state */}
                    {success ? (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                            <div>
                                <p className="text-white font-semibold text-lg">{success.orgName}</p>
                                <p className="text-slate-400 text-sm mt-1">
                                    Bergabung sebagai <span className="text-emerald-400 font-medium">{success.role.replace("_", " ")}</span>
                                </p>
                            </div>
                            <p className="text-xs text-slate-500">Redirecting to organizations…</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm"
                                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                    <span className="text-red-300">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleJoin} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="invite-code" className="block text-sm font-medium text-slate-300">
                                        Kode Undangan
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="invite-code"
                                            type="text"
                                            required
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                                            placeholder="TS-XXXXXX"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-mono font-bold tracking-widest text-emerald-300 placeholder:text-slate-600 placeholder:font-normal placeholder:tracking-normal outline-none transition-all uppercase"
                                            style={inputBase}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)";
                                                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.08)";
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = "rgba(51,65,85,0.7)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>
                                </div>

                                <button
                                    id="join-org-submit"
                                    type="submit"
                                    disabled={isLoading || !code.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
                                        boxShadow: "0 4px 20px -4px rgba(6,182,212,0.35)",
                                    }}>
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" />Joining…</>
                                    ) : (
                                        <>Join Organization<ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center gap-3 my-6">
                                <div className="flex-1 h-px bg-slate-800" />
                                <span className="text-xs text-slate-600 font-medium">OR</span>
                                <div className="flex-1 h-px bg-slate-800" />
                            </div>

                            <p className="text-center text-sm text-slate-400">
                                Tidak punya kode undangan?{" "}
                                <a href="/setup-organization"
                                    className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Buat organisasi baru
                                </a>
                            </p>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    Secure Sealed Tendering Platform · SDG 16 &amp; SDG 9
                </p>
            </div>
        </div>
    );
}
