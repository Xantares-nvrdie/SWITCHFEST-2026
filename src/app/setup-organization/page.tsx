"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
    ShieldCheck,
    Building2,
    ShoppingCart,
    Package,
    Layers,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Lock,
    Eye,
    Briefcase,
    Globe,
    Phone,
    MapPin,
    FileText,
    Hash,
} from "lucide-react";

type OrgType = "BUYER" | "VENDOR" | "BOTH";

interface OrgTypeOption {
    value: OrgType;
    label: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    glow: string;
    border: string;
    roles: { icon: React.ElementType; label: string; color: string }[];
    description: string;
}

const orgTypes: OrgTypeOption[] = [
    {
        value: "BUYER",
        label: "Buyer / Procurer",
        subtitle: "Penyelenggara Tender",
        icon: ShoppingCart,
        color: "text-emerald-400",
        glow: "rgba(52,211,153,0.12)",
        border: "rgba(52,211,153,0.4)",
        roles: [
            { icon: Briefcase, label: "Procurement Officer", color: "text-emerald-400" },
            { icon: Eye, label: "Auditor", color: "text-indigo-400" },
        ],
        description:
            "Organisasi yang membuat dan mengelola tender. Dapat menunjuk Procurement Officer untuk mengelola proses pengadaan.",
    },
    {
        value: "VENDOR",
        label: "Vendor / Supplier",
        subtitle: "Peserta Tender",
        icon: Package,
        color: "text-cyan-400",
        glow: "rgba(6,182,212,0.12)",
        border: "rgba(6,182,212,0.4)",
        roles: [
            { icon: Lock, label: "Submit Bid", color: "text-cyan-400" },
            { icon: Eye, label: "Reveal & Verify", color: "text-cyan-400" },
        ],
        description:
            "Organisasi penyedia barang/jasa yang mengikuti tender. Dapat melakukan submission bid terenkripsi dan reveal setelah deadline.",
    },
    {
        value: "BOTH",
        label: "Both",
        subtitle: "Buyer & Vendor",
        icon: Layers,
        color: "text-indigo-400",
        glow: "rgba(99,102,241,0.12)",
        border: "rgba(99,102,241,0.4)",
        roles: [
            { icon: ShoppingCart, label: "Create Tenders", color: "text-emerald-400" },
            { icon: Package, label: "Join Tenders", color: "text-cyan-400" },
        ],
        description:
            "Organisasi yang berperan sebagai penyelenggara tender sekaligus dapat mengikuti tender dari organisasi lain.",
    },
];

export default function SetupOrganizationPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [step, setStep] = useState<1 | 2>(1);
    const [selectedType, setSelectedType] = useState<OrgType | null>(null);

    // Form fields
    const [name, setName] = useState("");
    const [legalName, setLegalName] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [email, setEmail] = useState(session?.user?.email ?? "");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputBase = {
        background: "rgba(30, 41, 59, 0.6)",
        border: "1px solid rgba(51, 65, 85, 0.7)",
    };
    const focusStyle = { borderColor: "rgba(52,211,153,0.5)", boxShadow: "0 0 0 3px rgba(52,211,153,0.08)" };
    const blurStyle = { borderColor: "rgba(51,65,85,0.7)", boxShadow: "none" };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedType || !name.trim()) return;
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    type: selectedType,
                    legalName: legalName.trim() || undefined,
                    registrationNumber: registrationNumber.trim() || undefined,
                    email: email.trim() || undefined,
                    phone: phone.trim() || undefined,
                    address: address.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message ?? "Failed to create organization. Please try again.");
                setIsLoading(false);
                return;
            }

            router.push("/organizations");
            router.refresh();
        } catch {
            setError("Network error. Please check your connection.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
                    style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
                />
            </div>
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-emerald-500/20 mb-4">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Setup Your Organization</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Hi {session?.user?.name?.split(" ")[0] ?? "there"} — buat organisasi untuk mulai menggunakan TenderSeal
                    </p>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-5">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300"
                                    style={{
                                        background:
                                            step >= s
                                                ? "linear-gradient(135deg, #34d399, #06b6d4)"
                                                : "rgba(30,41,59,0.8)",
                                        color: step >= s ? "#0f172a" : "#64748b",
                                        border: step >= s ? "none" : "1px solid rgba(51,65,85,0.6)",
                                    }}
                                >
                                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                                </div>
                                <span className={`text-xs font-medium ${step >= s ? "text-slate-300" : "text-slate-600"}`}>
                                    {s === 1 ? "Tipe Organisasi" : "Detail Profil"}
                                </span>
                                {s < 2 && <ChevronRight className="w-3.5 h-3.5 text-slate-700" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="rounded-2xl p-8"
                    style={{
                        background: "rgba(15, 23, 42, 0.80)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(51, 65, 85, 0.6)",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                    }}
                >
                    {/* ── Step 1: Choose Type ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-base font-semibold text-white mb-5">Apa peran organisasi Anda?</h2>

                            {orgTypes.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = selectedType === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setSelectedType(opt.value)}
                                        className="w-full text-left rounded-xl p-4 transition-all duration-200"
                                        style={{
                                            background: isSelected ? opt.glow : "rgba(30,41,59,0.4)",
                                            border: `1px solid ${isSelected ? opt.border : "rgba(51,65,85,0.5)"}`,
                                            boxShadow: isSelected ? `0 0 20px -8px ${opt.border}` : "none",
                                        }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                                style={{
                                                    background: isSelected ? opt.glow : "rgba(15,23,42,0.6)",
                                                    border: `1px solid ${isSelected ? opt.border : "rgba(51,65,85,0.4)"}`,
                                                }}
                                            >
                                                <Icon className={`w-5 h-5 ${opt.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-semibold text-white text-sm">{opt.label}</span>
                                                    <span
                                                        className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide"
                                                        style={{
                                                            background: `${opt.glow}`,
                                                            color: isSelected ? opt.color.replace("text-", "").replace("-400", "") : "#64748b",
                                                        }}
                                                    >
                                                        {opt.subtitle}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                                                    {opt.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {opt.roles.map((r) => {
                                                        const RIcon = r.icon;
                                                        return (
                                                            <span
                                                                key={r.label}
                                                                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                                                                style={{
                                                                    background: "rgba(15,23,42,0.7)",
                                                                    border: "1px solid rgba(51,65,85,0.4)",
                                                                }}
                                                            >
                                                                <RIcon className={`w-3 h-3 ${r.color}`} />
                                                                <span className="text-slate-400">{r.label}</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div
                                                className="w-4 h-4 rounded-full border-2 shrink-0 mt-1 transition-all duration-200 flex items-center justify-center"
                                                style={{
                                                    borderColor: isSelected ? opt.border : "rgba(51,65,85,0.6)",
                                                    background: isSelected ? opt.border : "transparent",
                                                }}
                                            >
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                disabled={!selectedType}
                                onClick={() => setStep(2)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-4"
                                style={{
                                    background: selectedType
                                        ? "linear-gradient(135deg, #34d399 0%, #06b6d4 60%, #6366f1 100%)"
                                        : "rgba(52,211,153,0.3)",
                                    boxShadow: selectedType ? "0 4px 20px -4px rgba(52,211,153,0.35)" : "none",
                                }}
                            >
                                Lanjutkan
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ── Step 2: Organization Details ── */}
                    {step === 2 && (
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="flex items-center gap-2 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                                >
                                    ← Kembali
                                </button>
                                <span className="text-slate-700">·</span>
                                {selectedType && (
                                    <span
                                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                            background: orgTypes.find((o) => o.value === selectedType)?.glow,
                                            color:
                                                orgTypes.find((o) => o.value === selectedType)?.color.replace(
                                                    "text-",
                                                    "",
                                                ) ?? "#34d399",
                                        }}
                                    >
                                        {orgTypes.find((o) => o.value === selectedType)?.label}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-base font-semibold text-white -mt-2 mb-5">Detail Organisasi</h2>

                            {error && (
                                <div
                                    className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
                                    style={{
                                        background: "rgba(239,68,68,0.08)",
                                        border: "1px solid rgba(239,68,68,0.25)",
                                    }}
                                >
                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                    <span className="text-red-300">{error}</span>
                                </div>
                            )}

                            {/* Name — required */}
                            <div className="space-y-2">
                                <label htmlFor="org-name" className="block text-sm font-medium text-slate-300">
                                    Nama Organisasi <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    <input
                                        id="org-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="PT. Maju Bersama"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                        style={inputBase}
                                        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                                    />
                                </div>
                            </div>

                            {/* Two columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="org-legal" className="block text-sm font-medium text-slate-300">
                                        Nama Legal
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="org-legal"
                                            type="text"
                                            value={legalName}
                                            onChange={(e) => setLegalName(e.target.value)}
                                            placeholder="PT. Maju Bersama, Tbk"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                            style={inputBase}
                                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="org-regnum" className="block text-sm font-medium text-slate-300">
                                        Nomor Registrasi
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="org-regnum"
                                            type="text"
                                            value={registrationNumber}
                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                            placeholder="NPWP / NIB"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                            style={inputBase}
                                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="org-email" className="block text-sm font-medium text-slate-300">
                                        Email Organisasi
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="org-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="contact@company.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                            style={inputBase}
                                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="org-phone" className="block text-sm font-medium text-slate-300">
                                        Nomor Telepon
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                        <input
                                            id="org-phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+62 21 XXXX XXXX"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                                            style={inputBase}
                                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label htmlFor="org-address" className="block text-sm font-medium text-slate-300">
                                    Alamat
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                                    <textarea
                                        id="org-address"
                                        rows={2}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Jl. Sudirman No. 1, Jakarta Pusat..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all resize-none"
                                        style={inputBase}
                                        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                                        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                                    />
                                </div>
                            </div>

                            {/* Info box */}
                            <div
                                className="flex items-start gap-3 rounded-xl px-4 py-3 text-xs"
                                style={{
                                    background: "rgba(52,211,153,0.05)",
                                    border: "1px solid rgba(52,211,153,0.15)",
                                }}
                            >
                                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                <span className="text-slate-400 leading-relaxed">
                                    Kamu akan otomatis menjadi{" "}
                                    <span className="text-emerald-400 font-semibold">Organization Admin</span>. Setelah
                                    organisasi dibuat, kamu bisa mengundang anggota dan memberikan role seperti{" "}
                                    <span className="text-slate-300">Procurement Officer</span> atau{" "}
                                    <span className="text-slate-300">Auditor</span>.
                                </span>
                            </div>

                            <button
                                id="create-org-submit"
                                type="submit"
                                disabled={isLoading || !name.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background:
                                        isLoading || !name.trim()
                                            ? "rgba(52,211,153,0.4)"
                                            : "linear-gradient(135deg, #34d399 0%, #06b6d4 60%, #6366f1 100%)",
                                    boxShadow: "0 4px 20px -4px rgba(52,211,153,0.35)",
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Membuat organisasi…
                                    </>
                                ) : (
                                    <>
                                        Buat Organisasi
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-slate-600 mt-6">
                    Secure Sealed Tendering Platform · SDG 16 &amp; SDG 9
                </p>
            </div>
        </div>
    );
}
