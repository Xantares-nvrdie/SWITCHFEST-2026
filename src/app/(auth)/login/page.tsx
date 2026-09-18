"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import {
    ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle,
    Cpu, KeyRound, FileCode2,
} from "lucide-react";

const FEATURES = [
    { icon: Lock,      label: "AES-GCM 256-bit Client Encryption",  color: "#3fb950" },
    { icon: KeyRound,  label: "Commit-Reveal Scheme",                color: "#58a6ff" },
    { icon: Cpu,       label: "Smart Contract Audit Trail",           color: "#bc8cff" },
    { icon: FileCode2, label: "Dynamic Bid Fields & Scoring Engine", color: "#e3b341" },
];

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setError(null);

        const { error: authError } = await signIn.email({
            email,
            password,
            callbackURL: "/",
        });

        if (authError) {
            setError(authError.message ?? "Email atau password salah.");
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: "var(--bg-base, #06090f)" }}>

            {/* ── Left — Branding ────────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-10 relative overflow-hidden shrink-0"
                style={{
                    background: "linear-gradient(160deg, #0d1117 0%, #0a0f1a 100%)",
                    borderRight: "1px solid rgba(99,115,138,.12)",
                }}
            >
                <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(63,185,80,.07) 0%, transparent 70%)" }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(88,166,255,.05) 0%, transparent 70%)" }} />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #238636 0%, #1a7f37 100%)", boxShadow: "0 0 24px rgba(63,185,80,.3)" }}
                        >
                            <ShieldCheck style={{ width: 22, height: 22, color: "#fff" }} />
                        </div>
                        <div>
                            <p className="font-bold text-lg tracking-tight" style={{ color: "#e6edf3" }}>
                                Tender<span className="gradient-text">Seal</span>
                            </p>
                            <p className="text-xs" style={{ color: "#484f58" }}>Secure Sealed Procurement</p>
                        </div>
                    </div>
                </div>

                {/* Copy */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-extrabold tracking-tight leading-tight" style={{ color: "#e6edf3" }}>
                            Pengadaan digital yang{" "}
                            <span className="gradient-text">benar-benar aman.</span>
                        </h1>
                        <p className="text-sm leading-relaxed" style={{ color: "#7d8590", maxWidth: 360 }}>
                            Setiap penawaran vendor dienkripsi di browser sebelum dikirim.
                            Server tidak pernah menyimpan plaintext — dijamin secara kriptografis.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {FEATURES.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.label} className="flex items-center gap-3">
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: `${f.color}14`, border: `1px solid ${f.color}22` }}
                                    >
                                        <Icon style={{ width: 13, height: 13, color: f.color }} />
                                    </div>
                                    <span className="text-sm" style={{ color: "#7d8590" }}>{f.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4" style={{ color: "#484f58", fontSize: 11 }}>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />SDG 16 · Peace & Justice</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />SDG 9 · Innovation</span>
                </div>
            </div>

            {/* ── Right — Login Form ──────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-2.5 mb-10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #238636 0%, #1a7f37 100%)" }}>
                        <ShieldCheck style={{ width: 16, height: 16, color: "#fff" }} />
                    </div>
                    <span className="font-bold text-base tracking-tight" style={{ color: "#e6edf3" }}>
                        Tender<span className="gradient-text">Seal</span>
                    </span>
                </div>

                <div className="w-full max-w-sm space-y-7">
                    {/* Heading */}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#e6edf3" }}>
                            Masuk ke akun Anda
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "#7d8590" }}>
                            Belum punya akun?{" "}
                            <Link
                                href="/register"
                                className="font-medium transition-colors"
                                style={{ color: "#3fb950" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#57d46a")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#3fb950")}
                            >
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Email */}
                        <div>
                            <label className="form-label" htmlFor="email">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ width: 15, height: 15, color: "#484f58" }} />
                                <input
                                    id="email" type="email" autoComplete="email" required
                                    placeholder="nama@perusahaan.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                    className="form-input"
                                    style={{ paddingLeft: 38 }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="form-label mb-0" htmlFor="password">Password</label>
                                <Link href="/forgot-password" className="text-xs transition-colors" style={{ color: "#7d8590" }}
                                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e6edf3")}
                                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#7d8590")}
                                >
                                    Lupa password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ width: 15, height: 15, color: "#484f58" }} />
                                <input
                                    id="password" type={showPass ? "text" : "password"} autoComplete="current-password" required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                    className="form-input"
                                    style={{ paddingLeft: 38, paddingRight: 40 }}
                                />
                                <button
                                    type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: "#484f58" }}
                                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#8b949e")}
                                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#484f58")}
                                >
                                    {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                className="flex items-center gap-2 p-3 rounded-lg text-sm animate-fade-in"
                                style={{ background: "rgba(248,81,73,.08)", border: "1px solid rgba(248,81,73,.22)", color: "#f85149" }}
                            >
                                <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="btn btn-primary w-full"
                            style={{ height: 42, fontSize: 14 }}
                        >
                            {loading ? (
                                <><span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Memverifikasi...</>
                            ) : (
                                <>Masuk<ArrowRight style={{ width: 16, height: 16 }} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs flex items-center justify-center gap-1.5" style={{ color: "#484f58" }}>
                        <ShieldCheck style={{ width: 12, height: 12, color: "#3fb950" }} />
                        Koneksi aman · Data terenkripsi end-to-end
                    </p>
                </div>
            </div>
        </div>
    );
}
