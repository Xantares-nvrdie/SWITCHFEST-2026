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
    Building2,
    ArrowRight,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    Check,
} from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "Min. 8 karakter",        ok: password.length >= 8 },
        { label: "Huruf besar (A-Z)",       ok: /[A-Z]/.test(password) },
        { label: "Angka atau simbol",        ok: /[0-9!@#$%^&*]/.test(password) },
    ];
    const score = checks.filter((c) => c.ok).length;
    const colors = ["#f85149", "#e3b341", "#3fb950"];
    const labels = ["Lemah", "Sedang", "Kuat"];

    if (!password) return null;

    return (
        <div className="space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                            background: i < score ? colors[score - 1] : "rgba(99,115,138,.2)",
                        }}
                    />
                ))}
                <span
                    className="text-xs font-semibold ml-1"
                    style={{ color: colors[score - 1] ?? "#484f58", minWidth: 36 }}
                >
                    {labels[score - 1] ?? ""}
                </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
                {checks.map((c) => (
                    <span
                        key={c.label}
                        className="flex items-center gap-1 text-xs"
                        style={{ color: c.ok ? "#3fb950" : "#484f58" }}
                    >
                        <Check style={{ width: 10, height: 10 }} />
                        {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

const ROLE_OPTIONS = [
    { value: "PROCUREMENT_OFFICER", label: "Procurement Officer", hint: "Buat & kelola tender", color: "#3fb950" },
    { value: "VENDOR",              label: "Vendor / Penyedia",   hint: "Submit penawaran",    color: "#58a6ff" },
    { value: "AUDITOR",             label: "Auditor",             hint: "Pantau audit trail",  color: "#bc8cff" },
];

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName]           = useState("");
    const [email, setEmail]         = useState("");
    const [password, setPassword]   = useState("");
    const [confirmPass, setConfirm] = useState("");
    const [orgName, setOrgName]     = useState("");
    const [role, setRole]           = useState("PROCUREMENT_OFFICER");
    const [showPass, setShowPass]   = useState(false);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const [done, setDone]           = useState(false);

    const passMatch    = !confirmPass || password === confirmPass;
    const passStrong   = password.length >= 8;
    const formValid    = name && email && password && confirmPass && passMatch && passStrong;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formValid) return;

        setLoading(true);
        setError(null);

        const { error: authError } = await signUp.email({
            name,
            email,
            password,
            callbackURL: "/",
        });

        if (authError) {
            setError(authError.message ?? "Gagal mendaftar. Coba lagi.");
            setLoading(false);
        } else {
            setDone(true);
            setTimeout(() => router.push("/"), 1500);
        }
    };

    return (
        <div
            className="min-h-screen flex"
            style={{ background: "var(--bg-base, #06090f)" }}
        >
            {/* ── Left — branding panel ─────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[440px] xl:w-[480px] flex-col justify-between p-10 relative overflow-hidden shrink-0"
                style={{
                    background: "linear-gradient(160deg, #0d1117 0%, #0a0f1a 100%)",
                    borderRight: "1px solid rgba(99,115,138,.12)",
                }}
            >
                <div
                    className="absolute -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(88,166,255,.06) 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(63,185,80,.05) 0%, transparent 70%)" }}
                />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #238636 0%, #1a7f37 100%)",
                                boxShadow: "0 0 24px rgba(63,185,80,.3)",
                            }}
                        >
                            <ShieldCheck style={{ width: 22, height: 22, color: "#fff" }} />
                        </div>
                        <div>
                            <p className="font-bold text-lg tracking-tight" style={{ color: "#e6edf3" }}>
                                Tender<span className="gradient-text">Seal</span>
                            </p>
                            <p className="text-xs" style={{ color: "#484f58" }}>
                                Secure Sealed Procurement
                            </p>
                        </div>
                    </div>
                </div>

                {/* Copy */}
                <div className="relative z-10 space-y-6">
                    <div className="space-y-3">
                        <h1
                            className="text-3xl font-extrabold tracking-tight leading-tight"
                            style={{ color: "#e6edf3" }}
                        >
                            Bergabunglah dengan
                            <br />
                            <span className="gradient-text">ekosistem pengadaan</span>
                            <br />
                            yang transparan.
                        </h1>
                        <p className="text-sm leading-relaxed" style={{ color: "#7d8590", maxWidth: 340 }}>
                            Daftarkan akun sebagai Panitia, Vendor, atau Auditor.
                            Semua aksi terekam dalam audit trail yang tamper-proof.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2.5">
                        {[
                            "Akses Tender Aktif Secara Real-Time",
                            "Enkripsi Penawaran End-to-End di Browser",
                            "Audit Trail On-Chain Setiap Transaksi",
                            "Penetapan Pemenang Berdasarkan Scoring Otomatis",
                        ].map((b) => (
                            <div key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "#7d8590" }}>
                                <CheckCircle2 style={{ width: 14, height: 14, color: "#3fb950", flexShrink: 0 }} />
                                {b}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4" style={{ color: "#484f58", fontSize: 11 }}>
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                        SDG 16 · Peace & Justice
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
                        SDG 9 · Innovation
                    </span>
                </div>
            </div>

            {/* ── Right — Register Form ──────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-2.5 mb-10">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #238636 0%, #1a7f37 100%)" }}
                    >
                        <ShieldCheck style={{ width: 16, height: 16, color: "#fff" }} />
                    </div>
                    <span className="font-bold text-base tracking-tight" style={{ color: "#e6edf3" }}>
                        Tender<span className="gradient-text">Seal</span>
                    </span>
                </div>

                <div className="w-full max-w-sm space-y-6">
                    {/* Heading */}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#e6edf3" }}>
                            Buat akun baru
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "#7d8590" }}>
                            Sudah punya akun?{" "}
                            <Link
                                href="/login"
                                className="font-medium transition-colors"
                                style={{ color: "#3fb950" }}
                                onMouseEnter={(e) =>
                                    ((e.currentTarget as HTMLElement).style.color = "#57d46a")
                                }
                                onMouseLeave={(e) =>
                                    ((e.currentTarget as HTMLElement).style.color = "#3fb950")
                                }
                            >
                                Masuk di sini
                            </Link>
                        </p>
                    </div>

                    {/* Success state */}
                    {done && (
                        <div
                            className="flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-fade-in"
                            style={{
                                background: "rgba(63,185,80,.1)",
                                border: "1px solid rgba(63,185,80,.25)",
                                color: "#3fb950",
                            }}
                        >
                            <CheckCircle2 style={{ width: 18, height: 18 }} />
                            Akun berhasil dibuat! Mengalihkan ke dashboard...
                        </div>
                    )}

                    {/* Form */}
                    {!done && (
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* Full name */}
                            <div>
                                <label className="form-label" htmlFor="name">
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <User
                                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ width: 15, height: 15, color: "#484f58" }}
                                    />
                                    <input
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        placeholder="Budi Santoso"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form-input"
                                        style={{ paddingLeft: 38 }}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="form-label" htmlFor="reg-email">
                                    Email Resmi
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ width: 15, height: 15, color: "#484f58" }}
                                    />
                                    <input
                                        id="reg-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="nama@perusahaan.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError(null);
                                        }}
                                        className="form-input"
                                        style={{ paddingLeft: 38 }}
                                    />
                                </div>
                            </div>

                            {/* Role selector */}
                            <div>
                                <label className="form-label">Peran dalam Sistem</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ROLE_OPTIONS.map((r) => {
                                        const selected = role === r.value;
                                        return (
                                            <button
                                                key={r.value}
                                                type="button"
                                                onClick={() => setRole(r.value)}
                                                className="flex flex-col items-start gap-1 p-2.5 rounded-lg border transition-all text-left"
                                                style={{
                                                    background: selected ? `${r.color}10` : "var(--bg-base)",
                                                    borderColor: selected ? `${r.color}35` : "rgba(99,115,138,.2)",
                                                }}
                                            >
                                                <span
                                                    className="text-xs font-semibold"
                                                    style={{ color: selected ? r.color : "#7d8590" }}
                                                >
                                                    {r.label}
                                                </span>
                                                <span
                                                    className="text-[11px]"
                                                    style={{ color: "#484f58" }}
                                                >
                                                    {r.hint}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Organization */}
                            <div>
                                <label className="form-label" htmlFor="org">
                                    Nama Organisasi{" "}
                                    <span style={{ color: "#484f58", fontWeight: 400 }}>(opsional)</span>
                                </label>
                                <div className="relative">
                                    <Building2
                                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ width: 15, height: 15, color: "#484f58" }}
                                    />
                                    <input
                                        id="org"
                                        type="text"
                                        placeholder="PT Nusantara Tech..."
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        className="form-input"
                                        style={{ paddingLeft: 38 }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="form-label" htmlFor="reg-password">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ width: 15, height: 15, color: "#484f58" }}
                                    />
                                    <input
                                        id="reg-password"
                                        type={showPass ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
                                        style={{ paddingLeft: 38, paddingRight: 40 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: "#484f58" }}
                                        onMouseEnter={(e) =>
                                            ((e.currentTarget as HTMLElement).style.color = "#8b949e")
                                        }
                                        onMouseLeave={(e) =>
                                            ((e.currentTarget as HTMLElement).style.color = "#484f58")
                                        }
                                    >
                                        {showPass ? (
                                            <EyeOff style={{ width: 15, height: 15 }} />
                                        ) : (
                                            <Eye style={{ width: 15, height: 15 }} />
                                        )}
                                    </button>
                                </div>
                                {password && <div className="mt-2"><PasswordStrength password={password} /></div>}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="form-label" htmlFor="confirm">
                                    Konfirmasi Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ width: 15, height: 15, color: "#484f58" }}
                                    />
                                    <input
                                        id="confirm"
                                        type={showPass ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        placeholder="••••••••"
                                        value={confirmPass}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className="form-input"
                                        style={{
                                            paddingLeft: 38,
                                            borderColor:
                                                confirmPass && !passMatch
                                                    ? "rgba(248,81,73,.5)"
                                                    : confirmPass && passMatch
                                                    ? "rgba(63,185,80,.4)"
                                                    : undefined,
                                        }}
                                    />
                                </div>
                                {confirmPass && !passMatch && (
                                    <p
                                        className="text-xs mt-1.5 flex items-center gap-1"
                                        style={{ color: "#f85149" }}
                                    >
                                        <AlertCircle style={{ width: 11, height: 11 }} />
                                        Password tidak cocok
                                    </p>
                                )}
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    className="flex items-center gap-2 p-3 rounded-lg text-sm animate-fade-in"
                                    style={{
                                        background: "rgba(248,81,73,.08)",
                                        border: "1px solid rgba(248,81,73,.22)",
                                        color: "#f85149",
                                    }}
                                >
                                    <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !formValid}
                                className="btn btn-primary w-full"
                                style={{ height: 42, fontSize: 14 }}
                            >
                                {loading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Membuat akun...
                                    </>
                                ) : (
                                    <>
                                        Buat Akun
                                        <ArrowRight style={{ width: 16, height: 16 }} />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs" style={{ color: "#484f58" }}>
                                Dengan mendaftar, Anda menyetujui{" "}
                                <span style={{ color: "#7d8590" }}>Kebijakan Privasi</span> dan{" "}
                                <span style={{ color: "#7d8590" }}>Syarat Layanan</span> TenderSeal.
                            </p>
                        </form>
                    )}

                    {/* Security note */}
                    <p
                        className="text-center text-xs flex items-center justify-center gap-1.5"
                        style={{ color: "#484f58" }}
                    >
                        <ShieldCheck style={{ width: 12, height: 12, color: "#3fb950" }} />
                        Koneksi aman · Data terenkripsi end-to-end
                    </p>
                </div>
            </div>
        </div>
    );
}
