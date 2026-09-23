"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    PlusCircle,
    Trash2,
    Save,
    ArrowLeft,
    Layers,
    FileSpreadsheet,
    HelpCircle,
    CheckCircle2,
    AlertCircle,
    Clock,
    Percent,
} from "lucide-react";

interface Requirement {
    id: string;
    name: string;
    key: string;
    type: "text" | "number" | "currency" | "file" | "select" | "multi-select";
    required: boolean;
    description: string;
    weight: number;
    maxScore: number;
}

export default function CreateTenderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [code, setCode] = useState(`TND-2026-${Math.floor(100 + Math.random() * 900)}`);
    const [category, setCategory] = useState("Hardware & IT");
    const [description, setDescription] = useState("");
    const [commitDeadline, setCommitDeadline] = useState("2026-09-25T15:00");
    const [revealWindowHours, setRevealWindowHours] = useState(48);

    // Combined Requirements State (Bid Fields + Evaluation Criteria)
    const [requirements, setRequirements] = useState<Requirement[]>([
        {
            id: "req-1",
            name: "Harga Penawaran Total",
            key: "harga_total",
            type: "currency",
            required: true,
            description: "Penilaian aspek komersial dan efisiensi harga",
            weight: 50,
            maxScore: 100,
        },
        {
            id: "req-2",
            name: "Spesifikasi RAM & Storage",
            key: "spesifikasi",
            type: "text",
            required: true,
            description: "Kesesuaian dengan spesifikasi perangkat yang diminta",
            weight: 30,
            maxScore: 100,
        },
        {
            id: "req-3",
            name: "Garansi & Layanan Purna Jual",
            key: "garansi",
            type: "text",
            required: true,
            description: "Jaminan garansi dan ketersediaan service center",
            weight: 20,
            maxScore: 100,
        },
    ]);

    // Add Requirement
    const handleAddRequirement = () => {
        const newId = `req-${Date.now()}`;
        setRequirements([
            ...requirements,
            {
                id: newId,
                name: "Kriteria Baru",
                key: `field_${requirements.length + 1}`,
                type: "text",
                required: true,
                description: "",
                weight: 0,
                maxScore: 100,
            },
        ]);
    };

    // Remove Requirement
    const handleRemoveRequirement = (id: string) => {
        setRequirements(requirements.filter((r) => r.id !== id));
    };

    // Calculate Total Weight
    const totalWeight = requirements.reduce((sum, r) => sum + (Number(r.weight) || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (totalWeight !== 100) {
            setErrorMessage("Total bobot penilaian kriteria harus bernilai tepat 100%. Silakan sesuaikan bobot.");
            return;
        }

        setErrorMessage(null);
        setLoading(true);

        try {
            // Note: organizationId and createdBy should be dynamically fetched from user context/auth.
            // Using a static organizationId for demo purposes assuming they are seeded.
            const res = await fetch("/api/tenders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId: "org-buyer-001",
                    code,
                    title,
                    description,
                    category,
                    commitDeadline: new Date(commitDeadline).toISOString(),
                    revealWindowHours,
                }),
            });

            if (res.ok) {
                const { data } = await res.json();
                const tenderId = data?.id;

                // Create the fields and criteria
                if (tenderId) {
                    for (const req of requirements) {
                        await fetch(`/api/tenders/${tenderId}/fields`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: req.name,
                                key: req.key,
                                type: req.type,
                                required: req.required,
                            }),
                        });
                        
                        await fetch(`/api/tenders/${tenderId}/criteria`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: req.name,
                                description: req.description,
                                weight: req.weight,
                                maxScore: req.maxScore,
                            }),
                        });
                    }
                }

                setSuccessMessage("Tender dan kriteria berhasil dibuat dan dipublikasikan!");
                setTimeout(() => {
                    router.push("/tenders");
                }, 1500);
            } else {
                const errorData = await res.json();
                setErrorMessage(errorData.message || "Terjadi kesalahan saat membuat tender.");
            }
        } catch (_err) {
            setErrorMessage("Gagal terhubung ke server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link
                        href="/tenders"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Katalog Tender
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Buat Tender Baru</h1>
                    <p className="text-sm text-slate-400">
                        Atur detail tender, batas waktu commit & reveal, dan kriteria penilaian vendor.
                    </p>
                </div>
            </div>

            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Basic Tender Information */}
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
                    <div className="flex items-center gap-2 text-base font-bold text-white border-b border-slate-800 pb-3">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                        <span>1. Informasi Dasar Tender</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-300">Judul Tender</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Contoh: Pengadaan 100 Workstation Laptop..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Kode Unik Tender</label>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-emerald-400 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Kategori Pengadaan</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                            >
                                <option value="Hardware & IT">Hardware & IT</option>
                                <option value="Software Development">Software Development</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                                <option value="Konstruksi & Fasilitas">Konstruksi & Fasilitas</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-300">Deskripsi Ringkas Tender</label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Jelaskan kebutuhan, ruang lingkup, dan ketentuan tender..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Batas Akhir Submit (Commit Deadline)
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={commitDeadline}
                                onChange={(e) => setCommitDeadline(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Durasi Reveal Window (Jam)</label>
                            <input
                                type="number"
                                required
                                value={revealWindowHours}
                                onChange={(e) => setRevealWindowHours(Number(e.target.value))}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500/60"
                            />
                            <p className="text-[11px] text-slate-500">
                                Waktu yang diberikan bagi vendor untuk melakukan dekripsi penawaran
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Combined Bid Fields & Criteria Builder */}
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2 text-base font-bold text-white">
                            <Layers className="w-5 h-5 text-cyan-400" />
                            <span>2. Persyaratan & Kriteria Penilaian (Bid Fields & Scoring)</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddRequirement}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5" /> Tambah Kriteria
                        </button>
                    </div>

                    <p className="text-xs text-slate-400">
                        Atur kolom input yang wajib diisi oleh vendor, beserta bobot nilainya. Total seluruh bobot kriteria harus tepat 100%.
                    </p>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-xs font-semibold text-slate-300">Total Bobot Penilaian Saat Ini:</span>
                        <span
                            className={`text-sm font-bold ${
                                totalWeight === 100 ? "text-emerald-400" : "text-red-400"
                            }`}
                        >
                            {totalWeight}% / 100% {totalWeight !== 100 && "(Harus Tepat 100%)"}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {requirements.map((req, idx) => (
                            <div
                                key={req.id}
                                className={`p-5 rounded-xl bg-slate-900/80 border flex flex-col gap-4 transition-colors ${
                                    totalWeight !== 100 ? "border-red-500/20" : "border-slate-800"
                                }`}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                    <div className="md:col-span-11 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        
                                        {/* Field Label / Criteria Name */}
                                        <div className="sm:col-span-2 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Kriteria / Field</label>
                                            <input
                                                type="text"
                                                placeholder="Label Field (mis. Harga Total)"
                                                value={req.name}
                                                onChange={(e) => {
                                                    const updated = [...requirements];
                                                    updated[idx].name = e.target.value;
                                                    setRequirements(updated);
                                                }}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>

                                        {/* JSON Key */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field Key (JSON)</label>
                                            <input
                                                type="text"
                                                placeholder="Key JSON (mis. harga)"
                                                value={req.key}
                                                onChange={(e) => {
                                                    const updated = [...requirements];
                                                    updated[idx].key = e.target.value;
                                                    setRequirements(updated);
                                                }}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>

                                        {/* Field Type */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipe Input</label>
                                            <select
                                                value={req.type}
                                                onChange={(e) => {
                                                    const updated = [...requirements];
                                                    updated[idx].type = e.target.value as Requirement["type"];
                                                    setRequirements(updated);
                                                }}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                            >
                                                <option value="currency">Currency</option>
                                                <option value="text">Text String</option>
                                                <option value="number">Number</option>
                                                <option value="file">File (PDF)</option>
                                                <option value="select">Select</option>
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div className="sm:col-span-3 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi Panduan Penilaian</label>
                                            <input
                                                type="text"
                                                placeholder="Penjelasan/panduan penilaian untuk evaluator..."
                                                value={req.description}
                                                onChange={(e) => {
                                                    const updated = [...requirements];
                                                    updated[idx].description = e.target.value;
                                                    setRequirements(updated);
                                                }}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
                                            />
                                        </div>

                                        {/* Weight */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Bobot Kriteria (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={req.weight}
                                                    onChange={(e) => {
                                                        const updated = [...requirements];
                                                        updated[idx].weight = Number(e.target.value);
                                                        setRequirements(updated);
                                                    }}
                                                    className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-sm font-bold text-purple-300 focus:outline-none focus:border-purple-500/60"
                                                />
                                                <span className="absolute right-3 top-2 text-sm text-purple-500/50 font-bold">%</span>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Delete Button */}
                                    <div className="md:col-span-1 flex items-center justify-end h-full pt-5">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRequirement(req.id)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Hapus Kriteria"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Link
                        href="/tenders"
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                    >
                        Batal
                    </Link>

                    <button
                        type="submit"
                        disabled={loading || totalWeight !== 100}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 font-bold text-xs hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Menyimpan..." : "Publikasikan Tender"}
                    </button>
                </div>
            </form>
        </div>
    );
}
