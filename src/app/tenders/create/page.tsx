"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { PlusCircle, Trash2, ArrowLeft, Check, AlertCircle, Loader2 } from "lucide-react";

interface DynamicField {
    id: string;
    name: string;
    key: string;
    type: "text" | "number" | "currency" | "file" | "select";
    required: boolean;
    weight: number;
    description?: string;
}

const TYPE_OPTIONS: { value: DynamicField["type"]; label: string }[] = [
    { value: "currency", label: "Currency (Rp)" },
    { value: "text",     label: "Text"          },
    { value: "number",   label: "Number"        },
    { value: "file",     label: "File (PDF)"    },
    { value: "select",   label: "Dropdown"      },
];

const CATEGORY_OPTIONS = [
    "Hardware & IT",
    "Software Development",
    "Cybersecurity",
    "Cloud Infrastructure",
    "Konstruksi & Fasilitas",
    "Jasa Konsultasi",
];

export default function CreateTenderPage() {
    const router  = useRouter();
    const { data: session, isPending: sessionLoading } = useSession();

    const [orgId, setOrgId]     = useState<string | null>(null);
    const [orgLoading, setOrgLoading] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    // Step 1 — Basic Info
    const [title, setTitle]           = useState("");
    const [code, setCode]             = useState(`TND-2026-${Math.floor(100 + Math.random() * 900)}`);
    const [category, setCategory]     = useState("Hardware & IT");
    const [description, setDescription] = useState("");
    const [commitDeadline, setCommitDeadline] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        d.setHours(15, 0, 0, 0);
        return d.toISOString().slice(0, 16);
    });
    const [revealWindowHours, setRevealWindowHours] = useState(48);

    // Step 2 — Fields & Weights
    const [fields, setFields] = useState<DynamicField[]>([
        { id: "f-1", name: "Harga Penawaran Total",  key: "harga_total",    type: "currency", required: true, weight: 50, description: "Nilai komersial dan efisiensi harga" },
        { id: "f-2", name: "Spesifikasi Teknis",     key: "spesifikasi",    type: "text",     required: true, weight: 25, description: "Kesesuaian spesifikasi produk" },
        { id: "f-3", name: "Garansi Resmi (Tahun)",  key: "garansi_tahun",  type: "number",   required: true, weight: 15, description: "Jaminan garansi dan purna jual" },
        { id: "f-4", name: "Proposal PDF",           key: "proposal_pdf",   type: "file",     required: true, weight: 10, description: "Kelengkapan dokumen penawaran" },
    ]);

    const totalWeight = fields.reduce((s, f) => s + (Number(f.weight) || 0), 0);
    const weightOk    = totalWeight === 100;

    // Fetch user's organization
    useEffect(() => {
        if (!session?.user?.id) return;
        async function fetchOrg() {
            setOrgLoading(true);
            try {
                const res = await fetch(`/api/organizations/by-user/${session!.user.id}`);
                if (res.ok) {
                    const orgs = await res.json();
                    if (Array.isArray(orgs) && orgs.length > 0) {
                        setOrgId(orgs[0].id);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch org:", e);
            } finally {
                setOrgLoading(false);
            }
        }
        fetchOrg();
    }, [session?.user?.id]);

    const updateField = (idx: number, key: keyof DynamicField, val: string | number | boolean) => {
        setFields((prev) => {
            const next = [...prev];
            (next[idx] as unknown as Record<string, unknown>)[key as string] = val;
            return next;
        });
    };

    const addField = () =>
        setFields((prev) => [
            ...prev,
            { id: `f-${Date.now()}`, name: `Aspek ${prev.length + 1}`, key: `aspek_${prev.length + 1}`, type: "text", required: true, weight: 0, description: "" },
        ]);

    const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id));

    const step1Valid = title.trim().length > 0 && !!commitDeadline;

    const handleSubmit = async () => {
        if (!weightOk || !session?.user?.id) return;

        if (!orgId) {
            setError("Anda belum terdaftar di organisasi manapun. Daftarkan organisasi Anda terlebih dahulu di halaman Organizations.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const body = {
                organizationId:    orgId,
                createdBy:         session.user.id,
                code,
                title,
                description:       description || undefined,
                category:          category || undefined,
                commitDeadline:    new Date(commitDeadline).toISOString(),
                revealWindowHours,
                fields: fields.map(({ name, key, type, required }) => ({ name, key, type, required })),
                criteria: fields.map(({ name, description: desc, weight }) => ({
                    name,
                    description: desc || name,
                    weight,
                    maxScore: 100,
                })),
            };

            const res = await fetch("/api/tenders", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message ?? `HTTP ${res.status}`);
            }

            setSuccess(true);
            setTimeout(() => router.push("/tenders"), 1400);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Gagal membuat tender. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking session/org
    if (sessionLoading || orgLoading) {
        return (
            <div className="flex items-center justify-center py-32 gap-3" style={{ color: "#484f58" }}>
                <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
                <span className="text-sm">Memuat...</span>
            </div>
        );
    }

    // No org — show notice
    if (!orgId && !orgLoading) {
        return (
            <div className="max-w-lg mx-auto py-16 text-center space-y-4">
                <AlertCircle style={{ width: 40, height: 40, color: "#e3b341", margin: "0 auto" }} />
                <h2 className="text-lg font-semibold" style={{ color: "#e6edf3" }}>
                    Anda belum bergabung di organisasi
                </h2>
                <p className="text-sm" style={{ color: "#7d8590" }}>
                    Tender harus dikaitkan dengan organisasi. Daftarkan organisasi Anda terlebih dahulu, lalu kembali ke sini.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                    <Link href="/organizations" className="btn btn-primary">
                        Daftarkan Organisasi
                    </Link>
                    <Link href="/tenders" className="btn btn-ghost">
                        Kembali ke Tender
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-7 pb-8 animate-fade-up">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <Link
                    href="/tenders"
                    className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    style={{ color: "#7d8590" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e6edf3")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#7d8590")}
                >
                    <ArrowLeft style={{ width: 13, height: 13 }} />
                    Tender
                </Link>
                <span style={{ color: "#484f58", fontSize: 12 }}>/</span>
                <span className="text-xs font-medium" style={{ color: "#484f58" }}>Buat Tender Baru</span>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#e6edf3" }}>
                    Buat Tender Baru
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "#7d8590" }}>
                    Atur detail tender, bid fields, dan bobot penilaian yang akan tersimpan ke database.
                </p>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-3">
                {[1, 2].map((step) => {
                    const active    = currentStep === step;
                    const completed = currentStep > step;
                    return (
                        <button
                            key={step}
                            onClick={() => { if (step === 1 || step1Valid) setCurrentStep(step as 1 | 2); }}
                            disabled={step === 2 && !step1Valid}
                            className="flex items-center gap-2 transition-all"
                        >
                            <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                style={{
                                    background: completed ? "#238636" : active ? "rgba(63,185,80,.15)" : "rgba(99,115,138,.1)",
                                    color:      completed ? "#fff"     : active ? "#3fb950"            : "#484f58",
                                    border:     active    ? "1px solid rgba(63,185,80,.4)"            : "1px solid transparent",
                                }}
                            >
                                {completed ? <Check style={{ width: 13, height: 13 }} /> : step}
                            </span>
                            <span className="text-xs font-medium hidden sm:block" style={{ color: active ? "#e6edf3" : "#484f58" }}>
                                {step === 1 ? "Informasi Dasar" : "Bid Fields & Bobot"}
                            </span>
                        </button>
                    );
                })}
                <div className="flex-1 h-px" style={{ background: "rgba(99,115,138,.15)" }} />
            </div>

            {/* Error */}
            {error && (
                <div
                    className="flex items-start gap-2 p-4 rounded-xl text-sm animate-fade-in"
                    style={{ background: "rgba(248,81,73,.08)", border: "1px solid rgba(248,81,73,.22)", color: "#f85149" }}
                >
                    <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div
                    className="flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-fade-in"
                    style={{ background: "rgba(63,185,80,.1)", border: "1px solid rgba(63,185,80,.25)", color: "#3fb950" }}
                >
                    <Check style={{ width: 18, height: 18 }} />
                    Tender berhasil dibuat! Mengalihkan ke katalog...
                </div>
            )}

            {/* ══════ STEP 1 ══════ */}
            {currentStep === 1 && (
                <div className="surface p-6 space-y-5">
                    <h2
                        className="text-sm font-semibold"
                        style={{ color: "#e6edf3", borderBottom: "1px solid rgba(99,115,138,.12)", paddingBottom: 12 }}
                    >
                        Informasi Dasar Tender
                    </h2>

                    <div>
                        <label className="form-label">Judul Tender <span style={{ color: "#f85149" }}>*</span></label>
                        <input
                            type="text" required
                            placeholder="mis. Pengadaan 100 Laptop High Performance..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Kode Tender</label>
                            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="form-input form-input-mono" />
                        </div>
                        <div>
                            <label className="form-label">Kategori</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" style={{ cursor: "pointer" }}>
                                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Deskripsi Tender</label>
                        <textarea
                            rows={3}
                            placeholder="Jelaskan ruang lingkup, ketentuan, dan kebutuhan pengadaan..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-input"
                            style={{ resize: "vertical", minHeight: 80 }}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Commit Deadline <span style={{ color: "#f85149" }}>*</span></label>
                            <input type="datetime-local" required value={commitDeadline} onChange={(e) => setCommitDeadline(e.target.value)} className="form-input" />
                            <p className="text-xs mt-1.5" style={{ color: "#484f58" }}>Batas waktu vendor submit commitment hash</p>
                        </div>
                        <div>
                            <label className="form-label">Reveal Window (Jam)</label>
                            <input type="number" min={1} max={168} value={revealWindowHours} onChange={(e) => setRevealWindowHours(Number(e.target.value))} className="form-input" />
                            <p className="text-xs mt-1.5" style={{ color: "#484f58" }}>Durasi waktu vendor melakukan dekripsi</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="button" disabled={!step1Valid} onClick={() => setCurrentStep(2)} className="btn btn-primary">
                            Lanjut ke Bid Fields →
                        </button>
                    </div>
                </div>
            )}

            {/* ══════ STEP 2 ══════ */}
            {currentStep === 2 && (
                <div className="space-y-5">
                    <div className="surface p-6 space-y-5">
                        {/* Header */}
                        <div
                            className="flex items-center justify-between"
                            style={{ borderBottom: "1px solid rgba(99,115,138,.12)", paddingBottom: 12 }}
                        >
                            <div>
                                <h2 className="text-sm font-semibold" style={{ color: "#e6edf3" }}>
                                    Bid Fields & Bobot Penilaian
                                </h2>
                                <p className="text-xs mt-0.5" style={{ color: "#7d8590" }}>
                                    Setiap field input memiliki bobot penilaian yang terikat langsung — tidak bisa mismatch.
                                </p>
                            </div>
                            <button type="button" onClick={addField} className="btn btn-ghost btn-sm">
                                <PlusCircle style={{ width: 13, height: 13 }} /> Tambah Aspek
                            </button>
                        </div>

                        {/* Weight bar */}
                        <div
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{
                                background: weightOk ? "rgba(63,185,80,.07)" : "rgba(210,153,34,.07)",
                                border: `1px solid ${weightOk ? "rgba(63,185,80,.2)" : "rgba(210,153,34,.2)"}`,
                            }}
                        >
                            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "#8b949e" }}>
                                {weightOk
                                    ? <Check style={{ width: 14, height: 14, color: "#3fb950" }} />
                                    : <AlertCircle style={{ width: 14, height: 14, color: "#e3b341" }} />
                                }
                                Total Bobot Penilaian
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="progress-bar w-28">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(totalWeight, 100)}%`,
                                            background: weightOk
                                                ? "linear-gradient(90deg, #238636, #3fb950)"
                                                : "linear-gradient(90deg, #9e6a03, #e3b341)",
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-bold tabular-nums" style={{ color: weightOk ? "#3fb950" : "#e3b341" }}>
                                    {totalWeight}%
                                    {!weightOk && <span className="font-normal ml-1" style={{ color: "#7d8590" }}>(harus 100%)</span>}
                                </span>
                            </div>
                        </div>

                        {/* Column Headers */}
                        <div
                            className="grid gap-3 px-1 pb-1"
                            style={{ gridTemplateColumns: "1.5fr 1fr 0.9fr 80px 32px", borderBottom: "1px solid rgba(99,115,138,.1)" }}
                        >
                            {["Label / Nama Aspek", "JSON Key", "Tipe Data", "Bobot %", ""].map((h) => (
                                <span key={h} className="text-label">{h}</span>
                            ))}
                        </div>

                        {/* Fields */}
                        <div className="space-y-3">
                            {fields.map((field, idx) => (
                                <div key={field.id} className="space-y-2">
                                    <div className="grid gap-3 items-center" style={{ gridTemplateColumns: "1.5fr 1fr 0.9fr 80px 32px" }}>
                                        <input
                                            type="text" placeholder="Nama aspek"
                                            value={field.name}
                                            onChange={(e) => updateField(idx, "name", e.target.value)}
                                            className="form-input" style={{ height: 36 }}
                                        />
                                        <input
                                            type="text" placeholder="json_key"
                                            value={field.key}
                                            onChange={(e) => updateField(idx, "key", e.target.value)}
                                            className="form-input form-input-mono" style={{ height: 36 }}
                                        />
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateField(idx, "type", e.target.value)}
                                            className="form-input" style={{ height: 36, cursor: "pointer", fontSize: 12 }}
                                        >
                                            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                        <div className="relative">
                                            <input
                                                type="number" min={0} max={100}
                                                value={field.weight}
                                                onChange={(e) => updateField(idx, "weight", Number(e.target.value))}
                                                className="form-input text-center font-bold tabular-nums"
                                                style={{ height: 36, color: "#bc8cff", paddingRight: 22, fontSize: 13 }}
                                            />
                                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "#bc8cff", pointerEvents: "none" }}>%</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeField(field.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                                            style={{ color: "#484f58" }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.color = "#f85149";
                                                (e.currentTarget as HTMLElement).style.background = "rgba(248,81,73,.1)";
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.color = "#484f58";
                                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                            }}
                                        >
                                            <Trash2 style={{ width: 13, height: 13 }} />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Panduan penilaian untuk evaluator (opsional)...`}
                                        value={field.description ?? ""}
                                        onChange={(e) => updateField(idx, "description", e.target.value)}
                                        className="form-input"
                                        style={{ height: 30, fontSize: 12, color: "#7d8590" }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-ghost">
                            ← Kembali
                        </button>
                        <div className="flex items-center gap-3">
                            <Link href="/tenders" className="btn btn-ghost">Batal</Link>
                            <button
                                type="button"
                                disabled={loading || !weightOk || success}
                                onClick={handleSubmit}
                                className="btn btn-primary"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                                        Menyimpan ke Database...
                                    </>
                                ) : (
                                    <>
                                        <Check style={{ width: 14, height: 14 }} />
                                        Publikasikan Tender
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
