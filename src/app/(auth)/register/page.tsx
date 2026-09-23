"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import {
    ShieldCheck,
    Mail,
    Lock,
    User,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle2,
    Info,
} from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "Minimal 8 karakter", ok: password.length >= 8 },
        { label: "Huruf besar", ok: /[A-Z]/.test(password) },
        { label: "Angka", ok: /\d/.test(password) },
    ];
    const score = checks.filter((c) => c.ok).length;
    const colors = ["#ef4444", "#f97316", "#0d9488"];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1.5">
                {checks.map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                            background: i < score ? colors[score - 1] : "var(--border)",
                        }}
                    />
                ))}
            </div>
            <div className="flex items-center gap-4">
                {checks.map((c, i) => (
                    <span
                        key={i}
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: c.ok ? "var(--accent)" : "var(--text-tertiary)" }}
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Kata sandi tidak cocok.");
            return;
        }

        if (password.length < 8) {
            setError("Kata sandi harus minimal 8 karakter.");
            return;
        }

        setIsLoading(true);

        const { error: signUpError } = await signUp.email({ name, email, password });

        if (signUpError) {
            setError(signUpError.message ?? "Pendaftaran gagal. Silakan coba lagi.");
            setIsLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    };

    const inputClass = "w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all";

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
                            Buat Akun
                        </h1>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                            Daftar untuk mengakses pengadaan digital terenkripsi.
                        </p>
                    </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[12px] bg-blue-50 border border-blue-100 text-blue-700">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Setelah pendaftaran, Anda bisa <span className="font-medium">membuat atau bergabung dengan organisasi</span> untuk mulai menggunakan TenderSeal.
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[13px] bg-red-50 border border-red-100 text-red-700">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nama */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-name" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                            Nama Lengkap
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            <input
                                id="reg-name"
                                type="text"
                                required
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama Anda"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-email" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            <input
                                id="reg-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@perusahaan.com"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Kata Sandi */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-password" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                            Kata Sandi
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            <input
                                id="reg-password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`${inputClass} !pr-10`}
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
                        <PasswordStrength password={password} />
                    </div>

                    {/* Konfirmasi */}
                    <div className="space-y-1.5">
                        <label htmlFor="reg-confirm" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                            Konfirmasi Kata Sandi
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                            <input
                                id="reg-confirm"
                                type={showConfirm ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`${inputClass} !pr-10 ${passwordMismatch ? "!border-red-300 !ring-red-100" : ""}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                                aria-label={showConfirm ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {passwordMismatch && (
                            <p className="text-[12px] text-red-600 flex items-center gap-1.5 mt-1">
                                <AlertCircle className="w-3 h-3" />
                                Kata sandi tidak cocok
                            </p>
                        )}
                    </div>

                    <button
                        id="register-submit"
                        type="submit"
                        disabled={isLoading || passwordMismatch}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--text-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Mendaftarkan...
                            </>
                        ) : (
                            "Buat Akun"
                        )}
                    </button>
                </form>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wide">atau</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                <p className="text-center text-[13px] text-[var(--text-secondary)]">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
                        Masuk
                    </Link>
                </p>
            </div>
        </div>
    );
}
