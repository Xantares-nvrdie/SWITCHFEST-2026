"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

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
            setError(signInError.message ?? "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
            setIsLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    };

    return (
        <div className="w-full max-w-sm">
            <div className="card p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">
                            Masuk ke TenderSeal
                        </h1>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                            Masukkan akun Anda untuk melanjutkan.
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[13px] bg-red-50 border border-red-100 text-red-700">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@perusahaan.com"
                                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                            Kata Sandi
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--text-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            "Masuk"
                        )}
                    </button>
                </form>

                {/* Separator */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wide">atau</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                {/* Register */}
                <p className="text-center text-[13px] text-[var(--text-secondary)]">
                    Belum punya akun?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-[var(--accent)] hover:underline"
                    >
                        Buat akun
                    </Link>
                </p>
            </div>
        </div>
    );
}
