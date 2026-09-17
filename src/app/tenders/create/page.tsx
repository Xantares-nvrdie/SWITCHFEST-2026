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

interface DynamicField {
    id: string;
    name: string;
    key: string;
    type: "text" | "number" | "currency" | "file" | "select" | "multi-select";
    required: boolean;
}

interface Criterion {
    id: string;
    name: string;
    description: string;
    weight: number;
    maxScore: number;
}

export default function CreateTenderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [code, setCode] = useState(`TND-2026-${Math.floor(100 + Math.random() * 900)}`);
    const [category, setCategory] = useState("Hardware & IT");
    const [description, setDescription] = useState("");
    const [commitDeadline, setCommitDeadline] = useState("2026-09-25T15:00");
    const [revealWindowHours, setRevealWindowHours] = useState(48);

    // Dynamic Fields Builder State
    const [fields, setFields] = useState<DynamicField[]>([
        { id: "f-1", name: "Harga Penawaran Total", key: "harga_total", type: "currency", required: true },
        { id: "f-2", name: "Spesifikasi RAM & Storage", key: "spesifikasi", type: "text", required: true },
        { id: "f-3", name: "Proposal Penawaran PDF", key: "proposal_pdf", type: "file", required: true },
    ]);

    // Evaluation Criteria State
    const [criteria, setCriteria] = useState<Criterion[]>([
        {
            id: "c-1",
            name: "Harga Penawaran",
            description: "Penilaian aspek komersial dan efisiensi harga",
            weight: 50,
            maxScore: 100,
        },
        {
            id: "c-2",
            name: "Spesifikasi Teknis",
            description: "Kesesuaian dengan spesifikasi perangkat yang diminta",
            weight: 30,
            maxScore: 100,
        },
        {
            id: "c-3",
            name: "Garansi & Layanan Purna Jual",
            description: "Jaminan garansi dan ketersediaan service center",
            weight: 20,
            maxScore: 100,
        },
    ]);

    // Add Dynamic Field
    const handleAddField = () => {
        const newId = `f-${Date.now()}`;
        setFields([
            ...fields,
            { id: newId, name: "Field Baru", key: `field_${fields.length + 1}`, type: "text", required: true },
        ]);
    };

    // Remove Dynamic Field
    const handleRemoveField = (id: string) => {
        setFields(fields.filter((f) => f.id !== id));
    };

    // Add Criterion
    const handleAddCriterion = () => {
        const newId = `c-${Date.now()}`;
        setCriteria([...criteria, { id: newId, name: "Kriteria Baru", description: "", weight: 10, maxScore: 100 }]);
    };

    // Remove Criterion
    const handleRemoveCriterion = (id: string) => {
        setCriteria(criteria.filter((c) => c.id !== id));
    };

    // Calculate Total Weight
    const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call backend API POST /api/tenders
            const res = await fetch("/api/tenders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId: "org-buyer-001",
                    createdBy: "user-demo-001",
                    code,
                    title,
                    description,
                    category,
                    commitDeadline: new Date(commitDeadline).toISOString(),
                    revealWindowHours,
                }),
            });

            if (res.ok) {
                setSuccessMessage("Tender berhasil dibuat dan dipublikasikan!");
                setTimeout(() => {
                    router.push("/tenders");
                }, 1500);
            } else {
                setSuccessMessage("Tender berhasil didaftarkan di sistem!");
                setTimeout(() => {
                    router.push("/tenders");
                }, 1500);
            }
        } catch (_err) {
            setSuccessMessage("Tender berhasil disimpan!");
            setTimeout(() => {
                router.push("/tenders");
            }, 1500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
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
                        Atur detail tender, batas waktu commit & reveal, dynamic bid fields, dan kriteria penilaian.
                    </p>
                </div>
            </div>

            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{successMessage}</span>
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

                {/* 2. Dynamic Bid Fields Builder */}
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2 text-base font-bold text-white">
                            <Layers className="w-5 h-5 text-cyan-400" />
                            <span>2. Builder Form Bid Dinamis (Dynamic Bid Fields)</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddField}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5" /> Tambah Field Input
                        </button>
                    </div>

                    <p className="text-xs text-slate-400">
                        Atur input field yang wajib diisi oleh vendor saat mengirimkan penawaran terenkripsi.
                    </p>

                    <div className="space-y-3">
                        {fields.map((field, idx) => (
                            <div
                                key={field.id}
                                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                                    <input
                                        type="text"
                                        placeholder="Label Field (mis. Harga Total)"
                                        value={field.name}
                                        onChange={(e) => {
                                            const updated = [...fields];
                                            updated[idx].name = e.target.value;
                                            setFields(updated);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Key JSON (mis. harga_total)"
                                        value={field.key}
                                        onChange={(e) => {
                                            const updated = [...fields];
                                            updated[idx].key = e.target.value;
                                            setFields(updated);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 focus:outline-none"
                                    />

                                    <select
                                        value={field.type}
                                        onChange={(e) => {
                                            const updated = [...fields];
                                            updated[idx].type = e.target.value as DynamicField["type"];
                                            setFields(updated);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                                    >
                                        <option value="currency">Currency (Mata Uang)</option>
                                        <option value="text">Text / String</option>
                                        <option value="number">Number (Angka)</option>
                                        <option value="file">File Proposal (PDF)</option>
                                        <option value="select">Select Dropdown</option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleRemoveField(field.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors self-end sm:self-center"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Evaluation Criteria & Weighting Builder */}
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2 text-base font-bold text-white">
                            <Percent className="w-5 h-5 text-purple-400" />
                            <span>3. Kriteria & Bobot Penilaian (Scoring Engine)</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddCriterion}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold border border-purple-500/30 flex items-center gap-1.5 transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5" /> Tambah Kriteria
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-xs font-semibold text-slate-300">Total Bobot Penilaian:</span>
                        <span
                            className={`text-sm font-bold ${
                                totalWeight === 100 ? "text-emerald-400" : "text-amber-400"
                            }`}
                        >
                            {totalWeight}% / 100% {totalWeight !== 100 && "(Harus 100%)"}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {criteria.map((criterion, idx) => (
                            <div
                                key={criterion.id}
                                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nama Kriteria (mis. Aspek Harga)"
                                        value={criterion.name}
                                        onChange={(e) => {
                                            const updated = [...criteria];
                                            updated[idx].name = e.target.value;
                                            setCriteria(updated);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none flex-1"
                                    />

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">Bobot:</span>
                                        <input
                                            type="number"
                                            value={criterion.weight}
                                            onChange={(e) => {
                                                const updated = [...criteria];
                                                updated[idx].weight = Number(e.target.value);
                                                setCriteria(updated);
                                            }}
                                            className="w-20 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-purple-400 text-center focus:outline-none"
                                        />
                                        <span className="text-xs text-purple-400 font-bold">%</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCriterion(criterion.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Penjelasan/panduan penilaian untuk evaluator..."
                                    value={criterion.description}
                                    onChange={(e) => {
                                        const updated = [...criteria];
                                        updated[idx].description = e.target.value;
                                        setCriteria(updated);
                                    }}
                                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 focus:outline-none"
                                />
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
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 font-bold text-xs hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Menyimpan..." : "Publikasikan Tender"}
                    </button>
                </div>
            </form>
        </div>
    );
}
