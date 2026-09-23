"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const { error: signInError } = await signIn.email({ email, password });

        if (signInError) {
            setError(signInError.message ?? "Login failed. Please check your credentials.");
            setIsLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    };

    return (
        <div className="w-full max-w-md relative z-10">
            {/* Card */}
            <div
                className="rounded-2xl p-8"
                style={{
                    background: "rgba(15, 23, 42, 0.80)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(51, 65, 85, 0.6)",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(52,211,153,0.05)",
                }}
            >
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-emerald-500/20 mb-4">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Sign in to{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #6366f1 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            TenderSeal
                        </span>
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div
                        className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6 text-sm"
                        style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.25)",
                        }}
                    >
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <span className="text-red-300">{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                style={{
                                    background: "rgba(30, 41, 59, 0.6)",
                                    border: "1px solid rgba(51, 65, 85, 0.7)",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(52,211,153,0.5)";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.08)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(51,65,85,0.7)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                style={{
                                    background: "rgba(30, 41, 59, 0.6)",
                                    border: "1px solid rgba(51, 65, 85, 0.7)",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(52,211,153,0.5)";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.08)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(51,65,85,0.7)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        id="login-submit"
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        style={{
                            background: isLoading
                                ? "rgba(52,211,153,0.4)"
                                : "linear-gradient(135deg, #34d399 0%, #06b6d4 60%, #6366f1 100%)",
                            boxShadow: "0 4px 20px -4px rgba(52,211,153,0.35)",
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.boxShadow = "0 4px 28px -4px rgba(52,211,153,0.55)";
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) e.currentTarget.style.boxShadow = "0 4px 20px -4px rgba(52,211,153,0.35)";
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Signing in…
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-xs text-slate-600 font-medium">OR</span>
                    <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* Register link */}
                <p className="text-center text-sm text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        Create account
                    </Link>
                </p>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-slate-600 mt-6">
                Secure Sealed Tendering Platform · SDG 16 &amp; SDG 9
            </p>
        </div>
    );
}
