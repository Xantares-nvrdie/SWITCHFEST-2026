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
    colorClass: string;
    bgClass: string;
    borderClass: string;
    roles: { icon: React.ElementType; label: string; colorClass: string }[];
    description: string;
}

const orgTypes: OrgTypeOption[] = [
    {
        value: "BUYER",
        label: "Buyer / Procurer",
        subtitle: "Penyelenggara Tender",
        icon: ShoppingCart,
        colorClass: "text-[var(--accent)]",
        bgClass: "bg-teal-50",
        borderClass: "border-teal-200",
        roles: [
            { icon: Briefcase, label: "Procurement Officer", colorClass: "text-[var(--accent)]" },
            { icon: Eye, label: "Auditor", colorClass: "text-[var(--text-secondary)]" },
        ],
        description:
            "Organisasi yang membuat dan mengelola tender. Dapat menunjuk Procurement Officer untuk mengelola proses pengadaan.",
    },
    {
        value: "VENDOR",
        label: "Vendor / Supplier",
        subtitle: "Peserta Tender",
        icon: Package,
        colorClass: "text-blue-600",
        bgClass: "bg-blue-50",
        borderClass: "border-blue-200",
        roles: [
            { icon: Lock, label: "Submit Bid", colorClass: "text-[var(--text-secondary)]" },
            { icon: Eye, label: "Reveal & Verify", colorClass: "text-[var(--text-secondary)]" },
        ],
        description:
            "Organisasi penyedia barang/jasa yang mengikuti tender. Dapat melakukan submission bid terenkripsi dan reveal setelah deadline.",
    },
    {
        value: "BOTH",
        label: "Both",
        subtitle: "Buyer & Vendor",
        icon: Layers,
        colorClass: "text-purple-600",
        bgClass: "bg-purple-50",
        borderClass: "border-purple-200",
        roles: [
            { icon: ShoppingCart, label: "Create Tenders", colorClass: "text-[var(--accent)]" },
            { icon: Package, label: "Join Tenders", colorClass: "text-blue-600" },
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

    const inputClass = "w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all";

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
                setError(data.message ?? "Gagal membuat organisasi. Silakan coba lagi.");
                setIsLoading(false);
                return;
            }

            router.push("/organizations");
            router.refresh();
        } catch {
            setError("Gagal terhubung ke jaringan. Periksa koneksi Anda.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="flex flex-col items-center mb-8 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">Setup Organisasi</h1>
                        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                            Halo {session?.user?.name?.split(" ")[0] ?? ""} — buat organisasi untuk mulai menggunakan TenderSeal.
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mt-4">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-all ${
                                        step >= s
                                            ? "bg-[var(--text-primary)] text-white"
                                            : "bg-[var(--border-light)] text-[var(--text-tertiary)]"
                                    }`}
                                >
                                    {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                                </div>
                                <span className={`text-[12px] font-medium ${step >= s ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
                                    {s === 1 ? "Peran" : "Profil"}
                                </span>
                                {s < 2 && <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] ml-1" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-8">
                    {/* ── Step 1: Choose Type ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">Apa peran organisasi Anda?</h2>

                            {orgTypes.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = selectedType === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setSelectedType(opt.value)}
                                        className={`w-full text-left rounded-xl p-4 transition-all duration-200 border ${
                                            isSelected
                                                ? `border-[var(--accent)] bg-teal-50/30 ring-1 ring-[var(--accent)]`
                                                : "border-[var(--border)] bg-white hover:bg-[var(--surface-secondary)]"
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                                                    isSelected ? `${opt.bgClass} ${opt.borderClass}` : "bg-white border-[var(--border)]"
                                                }`}
                                            >
                                                <Icon className={`w-5 h-5 ${isSelected ? opt.colorClass : "text-[var(--text-secondary)]"}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-[var(--text-primary)] text-[14px]">{opt.label}</span>
                                                    <span
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                                                            isSelected ? `${opt.bgClass} ${opt.borderClass} ${opt.colorClass}` : "bg-[var(--border-light)] text-[var(--text-tertiary)] border-transparent"
                                                        }`}
                                                    >
                                                        {opt.subtitle}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-3">
                                                    {opt.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {opt.roles.map((r) => {
                                                        const RIcon = r.icon;
                                                        return (
                                                            <span
                                                                key={r.label}
                                                                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--surface-secondary)] border border-[var(--border-light)]"
                                                            >
                                                                <RIcon className={`w-3 h-3 ${isSelected ? r.colorClass : "text-[var(--text-tertiary)]"}`} />
                                                                <span className="text-[var(--text-secondary)]">{r.label}</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1 transition-all flex items-center justify-center ${
                                                    isSelected ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)] bg-white"
                                                }`}
                                            >
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                disabled={!selectedType}
                                onClick={() => setStep(2)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--text-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                Lanjutkan
                            </button>
                        </div>
                    )}

                    {/* ── Step 2: Organization Details ── */}
                    {step === 2 && (
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-[12px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                                >
                                    ← Kembali
                                </button>
                                <span className="text-[var(--border)]">|</span>
                                {selectedType && (
                                    <span
                                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                            orgTypes.find((o) => o.value === selectedType)?.bgClass
                                        } ${orgTypes.find((o) => o.value === selectedType)?.colorClass} ${
                                            orgTypes.find((o) => o.value === selectedType)?.borderClass
                                        }`}
                                    >
                                        {orgTypes.find((o) => o.value === selectedType)?.label}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">Detail Organisasi</h2>

                            {error && (
                                <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[13px] bg-red-50 border border-red-100 text-red-700">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Name — required */}
                            <div className="space-y-1.5">
                                <label htmlFor="org-name" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                                    Nama Organisasi <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                    <input
                                        id="org-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="PT. Maju Bersama"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Two columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="org-legal" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                                        Nama Legal
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                        <input
                                            id="org-legal"
                                            type="text"
                                            value={legalName}
                                            onChange={(e) => setLegalName(e.target.value)}
                                            placeholder="PT. Maju Bersama, Tbk"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="org-regnum" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                                        Nomor Registrasi
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                        <input
                                            id="org-regnum"
                                            type="text"
                                            value={registrationNumber}
                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                            placeholder="NPWP / NIB"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="org-email" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                                        Email Organisasi
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                        <input
                                            id="org-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="contact@company.com"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="org-phone" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                                        Nomor Telepon
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                        <input
                                            id="org-phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+62 21 XXXX XXXX"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-1.5">
                                <label htmlFor="org-address" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                                    Alamat
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                    <textarea
                                        id="org-address"
                                        rows={2}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Jl. Sudirman No. 1..."
                                        className={`${inputClass} !resize-none`}
                                    />
                                </div>
                            </div>

                            {/* Info box */}
                            <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[12px] bg-blue-50 border border-blue-100 text-blue-800">
                                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">
                                    Anda akan otomatis menjadi <span className="font-bold">Organization Admin</span>. Setelah organisasi dibuat, Anda bisa mengundang anggota dan memberikan hak akses.
                                </span>
                            </div>

                            <button
                                id="create-org-submit"
                                type="submit"
                                disabled={isLoading || !name.trim()}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--text-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Selesai & Buat Organisasi"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
