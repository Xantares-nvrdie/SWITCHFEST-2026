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
    ArrowRight,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle2,
    Info,
} from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "At least 8 characters", ok: password.length >= 8 },
        { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
        { label: "Number", ok: /\d/.test(password) },
    ];
    const score = checks.filter((c) => c.ok).length;
    const colors = ["#ef4444", "#f97316", "#34d399"];
    const labels = ["Weak", "Fair", "Strong"];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1.5">
                {checks.map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                            background: i < score ? colors[score - 1] : "rgba(51,65,85,0.6)",
                        }}
                    />
                ))}
            </div>
            <div className="flex items-center gap-4">
                {checks.map((c, i) => (
                    <span
                        key={i}
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: c.ok ? "#34d399" : "#64748b" }}
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
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setIsLoading(true);

        const { error: signUpError } = await signUp.email({ name, email, password });

        if (signUpError) {
            setError(signUpError.message ?? "Registration failed. Please try again.");
            setIsLoading(false);
            return;
        }

        // Auto-sign-in succeeded; go to home
        router.push("/");
        router.refresh();
    };

    const inputBase = {
        background: "rgba(30, 41, 59, 0.6)",
        border: "1px solid rgba(51, 65, 85, 0.7)",
    };

    const focusStyle = {
        borderColor: "rgba(52,211,153,0.5)",
        boxShadow: "0 0 0 3px rgba(52,211,153,0.08)",
    };
    const blurStyle = {
        borderColor: "rgba(51,65,85,0.7)",
        boxShadow: "none",
    };

    return (
        <div className="w-full max-w-md relative z-10">
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
                    <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Join{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #6366f1 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            TenderSeal
                        </span>{" "}
                        — secure tendering starts here
                    </p>
                </div>

                {/* Onboarding note */}
                <div
                    className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6 text-xs"
                    style={{
                        background: "rgba(99,102,241,0.06)",
                        border: "1px solid rgba(99,102,241,0.2)",
                    }}
                >
                    <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-slate-400 leading-relaxed">
                        After registration, you can{" "}
                        <span className="text-slate-300 font-medium">create or join an organization</span> to start using
                        TenderSeal as a Procurement Officer, Vendor, or Auditor.
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm"
                        style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.25)",
                        }}
                    >
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <span className="text-red-300">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label htmlFor="reg-name" className="block text-sm font-medium text-slate-300">
                            Full name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                                id="reg-name"
                                type="text"
                                required
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                style={inputBase}
                                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                                id="reg-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                style={inputBase}
                                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                                id="reg-password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                style={inputBase}
                                onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
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
                        <PasswordStrength password={password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-300">
                            Confirm password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                                id="reg-confirm"
                                type={showConfirm ? "text" : "password"}
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                style={{
                                    ...inputBase,
                                    ...(passwordMismatch
                                        ? {
                                              borderColor: "rgba(239,68,68,0.5)",
                                              boxShadow: "0 0 0 3px rgba(239,68,68,0.07)",
                                          }
                                        : {}),
                                }}
                                onFocus={(e) => {
                                    if (!passwordMismatch) Object.assign(e.currentTarget.style, focusStyle);
                                }}
                                onBlur={(e) => {
                                    if (!passwordMismatch) Object.assign(e.currentTarget.style, blurStyle);
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                aria-label={showConfirm ? "Hide password" : "Show password"}
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {passwordMismatch && (
                            <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                                <AlertCircle className="w-3 h-3" />
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        id="register-submit"
                        type="submit"
                        disabled={isLoading || passwordMismatch}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        style={{
                            background:
                                isLoading || passwordMismatch
                                    ? "rgba(52,211,153,0.4)"
                                    : "linear-gradient(135deg, #34d399 0%, #06b6d4 60%, #6366f1 100%)",
                            boxShadow: "0 4px 20px -4px rgba(52,211,153,0.35)",
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading && !passwordMismatch)
                                e.currentTarget.style.boxShadow = "0 4px 28px -4px rgba(52,211,153,0.55)";
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading && !passwordMismatch)
                                e.currentTarget.style.boxShadow = "0 4px 20px -4px rgba(52,211,153,0.35)";
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating account…
                            </>
                        ) : (
                            <>
                                Create account
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-xs text-slate-600 font-medium">OR</span>
                    <div className="flex-1 h-px bg-slate-800" />
                </div>

                <p className="text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>

            <p className="text-center text-xs text-slate-600 mt-6">
                Secure Sealed Tendering Platform · SDG 16 &amp; SDG 9
            </p>
        </div>
    );
}
