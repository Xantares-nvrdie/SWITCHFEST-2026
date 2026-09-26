"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    AlertCircle,
    Save,
    Layers,
    FileSpreadsheet,
    Eye,
    Wand2,
    GripVertical,
    Trash2,
    PlusCircle,
    ChevronRight,
    Monitor,
    Laptop,
    Code2,
    ShieldCheck,
    Cloud,
    Building2,
    Percent,
    Clock,
    Hash,
    Type,
    DollarSign,
    ListChecks,
    FileUp,
    ToggleLeft,
    Star,
    Info,
    Sparkles,
    Copy,
    TrendingDown,
    TrendingUp,
    ClipboardList,
} from "lucide-react";


// ─── Types ───────────────────────────────────────────────────────────────────

type FieldType = "text" | "number" | "currency" | "file" | "select" | "multi-select";
type ScoringType = "MANUAL" | "LOWEST_PRICE" | "HIGHEST_VALUE";

interface BidField {
    id: string;
    name: string;
    key: string; // auto-generated, never shown to user
    type: FieldType;
    required: boolean;
    helpText: string;
    options?: string[];
    // Scoring (merged — 1 field : 1 criterion)
    scored: boolean;       // false = informatif saja, tidak dinilai
    weight: number;        // 0–100, total semua harus 100
    scoringType: ScoringType;
    evaluatorGuide: string;
}

interface TenderFormData {
    title: string;
    code: string;
    category: string;
    description: string;
    attachments: { name: string; url: string; file?: File }[];
    commitDeadline: string;
    revealWindowHours: number;
    fields: BidField[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 50);
}

function generateCode(): string {
    return `TND-2026-${Math.floor(100 + Math.random() * 900)}`;
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Smart default scoring type based on field type */
function defaultScoringType(type: FieldType): ScoringType {
    if (type === "currency") return "LOWEST_PRICE";
    if (type === "number") return "LOWEST_PRICE";
    return "MANUAL";
}

// ─── Field Type Meta ─────────────────────────────────────────────────────────

const FIELD_TYPE_META: Record<FieldType, { label: string; icon: React.ReactNode; color: string }> = {
    currency: { label: "Mata Uang (Rp)", icon: <DollarSign className="w-3.5 h-3.5" />, color: "text-[var(--accent)]" },
    text:     { label: "Teks",           icon: <Type className="w-3.5 h-3.5" />,        color: "text-blue-400"    },
    number:   { label: "Angka",          icon: <Hash className="w-3.5 h-3.5" />,        color: "text-violet-400"  },
    file:     { label: "File / Dokumen", icon: <FileUp className="w-3.5 h-3.5" />,      color: "text-amber-600"   },
    select:   { label: "Dropdown (Pilih 1)", icon: <ToggleLeft className="w-3.5 h-3.5" />,  color: "text-[var(--accent)]"    },
    "multi-select": { label: "Checkbox (Pilih Banyak)", icon: <ListChecks className="w-3.5 h-3.5" />, color: "text-pink-400" },
};

const SCORING_META: Record<ScoringType, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    LOWEST_PRICE: {
        label: "Nilai Terendah Terbaik",
        icon: <TrendingDown className="w-3.5 h-3.5" />,
        color: "text-[var(--accent)]",
        desc: "Dihitung otomatis (Smart Z-Score). Angka terendah di bawah rata-rata pasar mendapat skor tertinggi.",
    },
    HIGHEST_VALUE: {
        label: "Nilai Tertinggi Terbaik",
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        color: "text-[var(--accent)]",
        desc: "Dihitung otomatis (Smart Z-Score). Angka tertinggi di atas rata-rata pasar mendapat skor tertinggi.",
    },
    MANUAL: {
        label: "Penilaian Manual",
        icon: <ClipboardList className="w-3.5 h-3.5" />,
        color: "text-[var(--text-secondary)]",
        desc: "Evaluator memberi nilai secara objektif berdasarkan panduan kriteria.",
    },
};

// ─── Templates ───────────────────────────────────────────────────────────────

interface TemplateField extends Omit<BidField, "id" | "key"> {}

interface Template {
    id: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    category: string;
    gradient: string;
    fields: TemplateField[];
}

const TEMPLATES: Template[] = [
    {
        id: "hardware-it",
        icon: <Laptop className="w-6 h-6" />,
        label: "Pengadaan Hardware & IT",
        description: "Laptop, workstation, server, perangkat jaringan",
        category: "Hardware & IT",
        gradient: "from-blue-500/20 to-teal-600/10",
        fields: [
            { name: "Harga Penawaran Total", type: "currency", required: true, helpText: "Total harga termasuk PPN 11%", scored: true, weight: 40, scoringType: "LOWEST_PRICE", evaluatorGuide: "Harga terendah mendapat skor tertinggi" },
            { name: "Merek & Model", type: "text", required: true, helpText: "Contoh: ASUS ExpertBook B9, Dell Latitude 7430", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Spesifikasi Prosesor", type: "text", required: true, helpText: "Contoh: Intel Core i7-1265U, AMD Ryzen 7 Pro", scored: true, weight: 25, scoringType: "MANUAL", evaluatorGuide: "Nilai kesesuaian spesifikasi dengan kebutuhan minimal yang ditetapkan" },
            { name: "RAM (GB)", type: "number", required: true, helpText: "Kapasitas RAM dalam gigabyte", scored: false, weight: 0, scoringType: "HIGHEST_VALUE", evaluatorGuide: "" },
            { name: "Storage (GB)", type: "number", required: true, helpText: "Total kapasitas penyimpanan dalam GB", scored: false, weight: 0, scoringType: "HIGHEST_VALUE", evaluatorGuide: "" },
            { name: "Garansi (Bulan)", type: "number", required: true, helpText: "Durasi garansi resmi dalam bulan", scored: true, weight: 20, scoringType: "HIGHEST_VALUE", evaluatorGuide: "Garansi lebih panjang mendapat skor lebih tinggi" },
            { name: "Waktu Pengiriman (Hari Kerja)", type: "number", required: true, helpText: "Estimasi waktu penyerahan barang", scored: true, weight: 15, scoringType: "LOWEST_PRICE", evaluatorGuide: "Pengiriman lebih cepat mendapat skor lebih tinggi" },
            { name: "Proposal Teknis", type: "file", required: true, helpText: "Dokumen spesifikasi teknis lengkap (PDF)", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
        ],
    },
    {
        id: "software-dev",
        icon: <Code2 className="w-6 h-6" />,
        label: "Jasa Software Development",
        description: "Pengembangan aplikasi web, mobile, sistem informasi",
        category: "Software Development",
        gradient: "from-violet-500/20 to-purple-500/10",
        fields: [
            { name: "Harga Pengerjaan Total", type: "currency", required: true, helpText: "Total biaya pengerjaan proyek", scored: true, weight: 35, scoringType: "LOWEST_PRICE", evaluatorGuide: "Harga terendah mendapat skor tertinggi" },
            { name: "Durasi Pengerjaan (Minggu)", type: "number", required: true, helpText: "Estimasi timeline pengerjaan", scored: true, weight: 15, scoringType: "LOWEST_PRICE", evaluatorGuide: "Timeline lebih singkat mendapat skor lebih tinggi" },
            { name: "Jumlah Developer", type: "number", required: true, helpText: "Total SDM developer yang ditugaskan", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Teknologi yang Digunakan", type: "multi-select", required: true, options: ["React", "Next.js", "Vue.js", "Flutter", "Laravel", "Spring Boot", "Django", "Node.js", "PostgreSQL", "MySQL"], helpText: "Stack teknologi yang akan digunakan", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Masa Pemeliharaan (Bulan)", type: "number", required: true, helpText: "Durasi garansi & maintenance pasca-delivery", scored: true, weight: 15, scoringType: "HIGHEST_VALUE", evaluatorGuide: "Masa pemeliharaan lebih panjang mendapat skor lebih tinggi" },
            { name: "Portofolio / Referensi", type: "file", required: true, helpText: "Dokumen portofolio proyek serupa (PDF)", scored: true, weight: 20, scoringType: "MANUAL", evaluatorGuide: "Nilai kualitas dan relevansi portofolio dengan kebutuhan proyek" },
            { name: "Proposal Teknis & Metodologi", type: "file", required: true, helpText: "Rencana kerja, arsitektur sistem, dan pendekatan pengembangan", scored: true, weight: 15, scoringType: "MANUAL", evaluatorGuide: "Nilai kelengkapan, kedalaman teknis, dan realisme rencana kerja" },
        ],
    },
    {
        id: "cybersecurity",
        icon: <ShieldCheck className="w-6 h-6" />,
        label: "Jasa Cybersecurity",
        description: "Audit keamanan, penetration testing, SOC, MSSP",
        category: "Cybersecurity",
        gradient: "from-red-500/20 to-orange-500/10",
        fields: [
            { name: "Harga Jasa Total", type: "currency", required: true, helpText: "Total biaya layanan keamanan", scored: true, weight: 30, scoringType: "LOWEST_PRICE", evaluatorGuide: "Harga terendah mendapat skor tertinggi" },
            { name: "Durasi Engagement (Hari)", type: "number", required: true, helpText: "Total hari pengerjaan", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Jenis Layanan", type: "multi-select", required: true, options: ["Penetration Testing", "Vulnerability Assessment", "SOC Services", "SIEM Implementation", "Security Audit", "Incident Response", "Red Team Exercise"], helpText: "Jenis layanan keamanan yang ditawarkan", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Sertifikasi Tim", type: "text", required: true, helpText: "Sertifikasi relevan (OSCP, CEH, CISSP, CISA, dll.)", scored: true, weight: 35, scoringType: "MANUAL", evaluatorGuide: "Nilai jumlah dan relevansi sertifikasi dengan jenis engagement" },
            { name: "Metodologi", type: "file", required: true, helpText: "Dokumen metodologi dan pendekatan teknis (PDF)", scored: true, weight: 25, scoringType: "MANUAL", evaluatorGuide: "Nilai kedalaman, standar yang digunakan, dan relevansi metodologi" },
            { name: "Referensi Klien Sebelumnya", type: "file", required: false, helpText: "Bukti engagement serupa (opsional)", scored: true, weight: 10, scoringType: "MANUAL", evaluatorGuide: "Nilai relevansi dan prestise klien referensi di industri sejenis" },
        ],
    },
    {
        id: "cloud",
        icon: <Cloud className="w-6 h-6" />,
        label: "Cloud Infrastructure",
        description: "Managed cloud, migrasi, hosting, CDN, managed Kubernetes",
        category: "Cloud Infrastructure",
        gradient: "from-sky-500/20 to-blue-500/10",
        fields: [
            { name: "Biaya Bulanan (per Bulan)", type: "currency", required: true, helpText: "Estimasi biaya operasional per bulan", scored: true, weight: 40, scoringType: "LOWEST_PRICE", evaluatorGuide: "Biaya bulanan terendah mendapat skor tertinggi" },
            { name: "Cloud Provider", type: "select", required: true, options: ["AWS", "Google Cloud", "Microsoft Azure", "Alibaba Cloud", "Oracle Cloud", "DigitalOcean", "On-premise Hybrid"], helpText: "Platform cloud yang ditawarkan", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Layanan Utama", type: "multi-select", required: true, options: ["Compute (VM/Container)", "Managed Kubernetes", "Object Storage", "CDN", "Managed Database", "Serverless", "AI/ML Platform"], helpText: "Komponen layanan yang disertakan", scored: true, weight: 20, scoringType: "MANUAL", evaluatorGuide: "Nilai cakupan dan kelengkapan layanan yang disertakan" },
            { name: "SLA Uptime (%)", type: "number", required: true, helpText: "Jaminan uptime dalam persen (mis. 99.9)", scored: true, weight: 30, scoringType: "HIGHEST_VALUE", evaluatorGuide: "SLA uptime lebih tinggi mendapat skor lebih tinggi" },
            { name: "Lokasi Data Center", type: "text", required: true, helpText: "Region data center dan ketersediaan multi-zone", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Proposal Teknis", type: "file", required: true, helpText: "Arsitektur dan rencana implementasi (PDF)", scored: true, weight: 10, scoringType: "MANUAL", evaluatorGuide: "Nilai kualitas arsitektur dan rencana implementasi" },
        ],
    },
    {
        id: "construction",
        icon: <Building2 className="w-6 h-6" />,
        label: "Konstruksi & Fasilitas",
        description: "Pembangunan gedung, renovasi, pengadaan furnitur kantor",
        category: "Konstruksi & Fasilitas",
        gradient: "from-amber-500/20 to-yellow-500/10",
        fields: [
            { name: "Nilai Penawaran Total", type: "currency", required: true, helpText: "Total nilai pekerjaan termasuk material dan jasa", scored: true, weight: 50, scoringType: "LOWEST_PRICE", evaluatorGuide: "Harga terendah mendapat skor tertinggi" },
            { name: "Durasi Pengerjaan (Hari Kalender)", type: "number", required: true, helpText: "Total waktu pelaksanaan pekerjaan", scored: true, weight: 15, scoringType: "LOWEST_PRICE", evaluatorGuide: "Durasi lebih singkat mendapat skor lebih tinggi" },
            { name: "Nilai Jaminan Penawaran (Bid Bond)", type: "currency", required: true, helpText: "Nilai jaminan keseriusan penawaran", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Surat Dukungan Material Utama", type: "file", required: true, helpText: "Surat dukungan dari produsen/distributor material", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Surat Referensi Pekerjaan Sejenis", type: "file", required: true, helpText: "Bukti pengalaman pekerjaan konstruksi serupa", scored: true, weight: 25, scoringType: "MANUAL", evaluatorGuide: "Nilai relevansi dan skala proyek referensi dengan pekerjaan yang ditenderkan" },
            { name: "Rencana Anggaran Biaya (RAB)", type: "file", required: true, helpText: "Breakdown rencana anggaran biaya detail (PDF)", scored: false, weight: 0, scoringType: "MANUAL", evaluatorGuide: "" },
            { name: "Jadwal Pelaksanaan (Kurva S)", type: "file", required: true, helpText: "Rencana jadwal pelaksanaan pekerjaan (PDF)", scored: true, weight: 10, scoringType: "MANUAL", evaluatorGuide: "Nilai kelengkapan dan realisme jadwal pelaksanaan" },
        ],
    },
    {
        id: "custom",
        icon: <Sparkles className="w-6 h-6" />,
        label: "Custom (Mulai Kosong)",
        description: "Rancang sendiri semua field dan penilaian dari awal",
        category: "Hardware & IT",
        gradient: "from-slate-500/20 to-slate-600/10",
        fields: [],
    },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
    { id: 1, label: "Template",  icon: <Wand2 className="w-4 h-4" /> },
    { id: 2, label: "Info Dasar",icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 3, label: "Field & Penilaian", icon: <Layers className="w-4 h-4" /> },
    { id: 4, label: "Review",    icon: <Eye className="w-4 h-4" /> },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

interface OrgOption {
    id: string;
    name: string;
    memberRole: string;
    memberStatus: string;
    verificationStatus: string;
    isVerified: boolean;
}

export default function EditTenderPage() {
    const router = useRouter();
    const params = useParams();
    const tenderId = params.id as string;
    const { data: session } = useSession();
    const [selectedOrgId, setSelectedOrgId] = useState<string>("");
    const [userOrgs, setUserOrgs] = useState<OrgOption[]>([]);
    const [orgsLoading, setOrgsLoading] = useState(true);

    const [isFetchingTender, setIsFetchingTender] = useState(true);

    useEffect(() => {
        if (!session?.user) return;
        fetch("/api/organizations/me")
            .then((r) => r.json())
            .then((data: OrgOption[]) => {
                // Only show orgs where user is officer/admin and org is approved
                const eligible = data.filter(
                    (o) =>
                        o.memberStatus === "ACTIVE" &&
                        (o.memberRole === "PROCUREMENT_OFFICER" || o.memberRole === "ORGANIZATION_ADMIN") &&
                        (o.isVerified || o.verificationStatus === "APPROVED")
                );
                setUserOrgs(eligible);
                if (eligible.length > 0) setSelectedOrgId(eligible[0].id);
            })
            .catch(() => {})
            .finally(() => setOrgsLoading(false));
    }, [session?.user]);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

    const [form, setForm] = useState<TenderFormData>({
        title: "",
        code: generateCode(),
        category: "Hardware & IT",
        description: "",
        attachments: [],
        commitDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        revealWindowHours: 48,
        fields: [],
    });

    // Fetch existing tender
    useEffect(() => {
        if (!tenderId) return;
        fetch(`/api/tenders/${tenderId}`)
            .then(res => res.json())
            .then(tender => {
                let localCommit = "";
                let revealHrs = 48;
                if (tender.commitDeadline) {
                    const d = new Date(tender.commitDeadline);
                    const offset = d.getTimezoneOffset() * 60000;
                    localCommit = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
                    if (tender.revealDeadline) {
                        const r = new Date(tender.revealDeadline);
                        revealHrs = Math.max(1, Math.round((r.getTime() - d.getTime()) / (1000 * 60 * 60)));
                    }
                }
                
                // Merge fields and criteria
                const mergedFields: BidField[] = (tender.fields || []).map((f: any) => {
                    const c = (tender.criteria || []).find((c: any) => c.name === f.name);
                    return {
                        id: f.id || generateId(),
                        name: f.name,
                        key: f.key,
                        type: f.type,
                        required: f.required,
                        options: f.options,
                        helpText: "",
                        scored: !!c,
                        weight: c ? Number(c.weight) : 0,
                        scoringType: c ? c.scoringType : "MANUAL",
                        evaluatorGuide: c ? c.description : "",
                    };
                });

                setForm({
                    title: tender.title,
                    code: tender.code || generateCode(),
                    category: tender.category,
                    description: tender.description,
                    attachments: tender.attachments || [],
                    commitDeadline: localCommit,
                    revealWindowHours: revealHrs,
                    fields: mergedFields
                });
                setSelectedOrgId(tender.organizationId);
                setStep(2); // Skip template step
            })
            .catch(console.error)
            .finally(() => setIsFetchingTender(false));
    }, [tenderId]);

    const scoredFields = form.fields.filter((f) => f.scored);
    const totalWeight = scoredFields.reduce((s, f) => s + (Number(f.weight) || 0), 0);
    const weightOk = scoredFields.length === 0 || totalWeight === 100;

    // ── Template select ──────────────────────────────────────────────────────

    const applyTemplate = (tpl: Template) => {
        const fields: BidField[] = tpl.fields.map((f) => ({
            ...f,
            id: generateId(),
            key: slugify(f.name),
        }));
        setForm((prev) => ({ ...prev, category: tpl.category, fields }));
        setStep(2);
    };

    // ── Field helpers ────────────────────────────────────────────────────────

    const addField = () => {
        setForm((prev) => ({
            ...prev,
            fields: [
                ...prev.fields,
                {
                    id: generateId(),
                    name: "",
                    key: "",
                    type: "text",
                    required: true,
                    helpText: "",
                    scored: false,
                    weight: 0,
                    scoringType: "MANUAL",
                    evaluatorGuide: "",
                },
            ],
        }));
    };

    const updateField = useCallback(<K extends keyof BidField>(idx: number, key: K, value: BidField[K]) => {
        setForm((prev) => {
            const fields = [...prev.fields];
            const field = { ...fields[idx], [key]: value };
            if (key === "name") field.key = slugify(value as string);
            // Smart default scoring type when type changes
            if (key === "type") field.scoringType = defaultScoringType(value as FieldType);
            fields[idx] = field;
            return { ...prev, fields };
        });
    }, []);

    const removeField = (id: string) => {
        setForm((prev) => ({ ...prev, fields: prev.fields.filter((f) => f.id !== id) }));
    };

    // ── Drag & drop ──────────────────────────────────────────────────────────

    const onDragStart = (idx: number) => setDraggedIdx(idx);
    const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
    const onDrop = (dropIdx: number) => {
        if (draggedIdx === null || draggedIdx === dropIdx) return;
        setForm((prev) => {
            const fields = [...prev.fields];
            const [moved] = fields.splice(draggedIdx, 1);
            fields.splice(dropIdx, 0, moved);
            return { ...prev, fields };
        });
        setDraggedIdx(null);
        setDragOverIdx(null);
    };
    const onDragEnd = () => { setDraggedIdx(null); setDragOverIdx(null); };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!selectedOrgId) {
            setErrorMessage("Pilih organisasi penyelenggara tender terlebih dahulu.");
            return;
        }
        if (scoredFields.length > 0 && !weightOk) {
            setErrorMessage("Total bobot field yang dinilai harus tepat 100%.");
            return;
        }
        setErrorMessage(null);
        setLoading(true);

        const uploadedAttachments = [...form.attachments];
        for (let i = 0; i < uploadedAttachments.length; i++) {
            const att = uploadedAttachments[i];
            if (att.file) {
                const ext = att.file.name.split('.').pop();
                const path = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                const { data, error } = await supabase.storage.from("tender-public-docs").upload(path, att.file, {
                    contentType: att.file.type || 'application/pdf',
                    upsert: false
                });
                if (error) {
                    setErrorMessage(`Gagal upload file ${att.name}: ${error.message}`);
                    setLoading(false);
                    return;
                }
                const { data: publicUrlData } = supabase.storage.from("tender-public-docs").getPublicUrl(path);
                uploadedAttachments[i] = { name: att.name, url: publicUrlData.publicUrl };
            }
        }

        try {
            const criteria = [];
            const fields = [];
            
            for (let i = 0; i < form.fields.length; i++) {
                const f = form.fields[i];
                fields.push({
                    name: f.name,
                    key: f.key || slugify(f.name),
                    type: f.type,
                    required: f.required,
                    options: f.options || undefined,
                    sortOrder: i,
                });
                
                if (f.scored && f.weight > 0) {
                    criteria.push({
                        name: f.name,
                        description: f.evaluatorGuide,
                        weight: f.weight,
                        maxScore: 100,
                        scoringType: f.scoringType,
                        sortOrder: i,
                    });
                }
            }

            const res = await fetch(`/api/tenders/${tenderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    attachments: uploadedAttachments,
                    category: form.category,
                    commitDeadline: new Date(form.commitDeadline).toISOString(),
                    revealWindowHours: form.revealWindowHours,
                    fields,
                    criteria,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                setErrorMessage(err.message || "Gagal mengupdate tender.");
                return;
            }

            setSuccessMessage("Tender berhasil diupdate!");
            setTimeout(() => window.location.href = `/tenders/${tenderId}`, 1800);
        } catch {
            setErrorMessage("Gagal terhubung ke server.");
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────

    if (isFetchingTender || orgsLoading) {
        return <div className="flex h-[400px] items-center justify-center text-sm font-medium text-[var(--text-tertiary)]">Memuat data tender...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-16">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Link
                        href="/tenders"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors mb-3"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Katalog Tender
                    </Link>
                    <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Buat Tender Baru</h1>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Setiap field bid memiliki penilaiannya sendiri — sederhana, langsung, dan bisa diotomasi.
                    </p>
                </div>
                {step === 3 && (
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            showPreview
                                ? "bg-blue-50 border-cyan-500/50 text-[var(--accent)]"
                                : "bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:border-blue-200"
                        }`}
                    >
                        <Monitor className="w-4 h-4" />
                        {showPreview ? "Sembunyikan Preview" : "Preview Form Vendor"}
                    </button>
                )}
            </div>

            {/* Step Indicator */}
            <StepIndicator current={step} />

            {/* Notifications */}
            {successMessage && (
                <div className="p-4 rounded-xl bg-[var(--accent-light)] border border-teal-200 text-[var(--accent)] text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--accent)] shrink-0" /> {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-500/30 text-red-600 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    {errorMessage}
                    <button onClick={() => setErrorMessage(null)} className="ml-auto text-red-500 hover:text-red-600">✕</button>
                </div>
            )}

            {/* Content */}
            <div className={`grid gap-6 transition-all duration-300 ${showPreview && step === 3 ? "lg:grid-cols-2" : "grid-cols-1"}`}>
                <div className="space-y-6 min-w-0">
                    {step === 1 && <StepTemplate onSelect={applyTemplate} />}
                    {step === 2 && (
                    <StepBasicInfo
                        form={form}
                        setForm={setForm}
                        userOrgs={userOrgs}
                        orgsLoading={orgsLoading}
                        selectedOrgId={selectedOrgId}
                        setSelectedOrgId={setSelectedOrgId}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )}
                    {step === 3 && (
                        <StepFieldsAndScoring
                            fields={form.fields}
                            totalWeight={totalWeight}
                            weightOk={weightOk}
                            scoredCount={scoredFields.length}
                            draggedIdx={draggedIdx}
                            dragOverIdx={dragOverIdx}
                            onAdd={addField}
                            onUpdate={updateField}
                            onRemove={removeField}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onDragEnd={onDragEnd}
                            onNext={() => setStep(4)}
                            onBack={() => setStep(2)}
                        />
                    )}
                    {step === 4 && (
                        <StepReview
                            form={form}
                            totalWeight={totalWeight}
                            weightOk={weightOk}
                            loading={loading}
                            onBack={() => setStep(3)}
                            onSubmit={handleSubmit}
                            onGoToStep={setStep}
                        />
                    )}
                </div>

                {showPreview && step === 3 && (
                    <div className="hidden lg:block">
                        <LivePreviewPanel fields={form.fields} title={form.title} />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            current > s.id ? "bg-emerald-500 border-emerald-500 text-[var(--surface)]"
                            : current === s.id ? "bg-white border-[var(--accent)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]"
                            : "bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-tertiary)]"
                        }`}>
                            {current > s.id ? <Check className="w-4 h-4" /> : s.icon}
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide uppercase transition-colors ${
                            current === s.id ? "text-[var(--accent)]" : current > s.id ? "text-emerald-600" : "text-[var(--text-tertiary)]"
                        }`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-2 mb-5 rounded-full transition-all duration-500 ${current > s.id ? "bg-emerald-500" : "bg-[var(--surface-secondary)]"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Step 1: Template ─────────────────────────────────────────────────────────

function StepTemplate({ onSelect }: { onSelect: (t: Template) => void }) {
    const [hovered, setHovered] = useState<string | null>(null);
    return (
        <div className="space-y-5">
            <div className="card p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                    <Wand2 className="w-5 h-5 text-[var(--accent)]" /> Pilih Template Tender
                </div>
                <p className="text-xs text-[var(--text-tertiary)]">
                    Template sudah dilengkapi field dan bobot penilaian yang bisa diubah sepenuhnya.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {TEMPLATES.map((tpl) => {
                    const scoredCount = tpl.fields.filter((f) => f.scored).length;
                    return (
                        <button
                            key={tpl.id}
                            type="button"
                            onClick={() => onSelect(tpl)}
                            onMouseEnter={() => setHovered(tpl.id)}
                            onMouseLeave={() => setHovered(null)}
                            className={`relative text-left p-5 rounded-xl border transition-all duration-200 bg-white ${
                                hovered === tpl.id ? "border-[var(--accent)] ring-1 ring-[var(--accent)] scale-[1.02]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
                            }`}
                        >
                            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${hovered === tpl.id ? "bg-[var(--accent-light)] text-[var(--accent)]" : "bg-[var(--surface-secondary)] text-[var(--text-tertiary)]"} transition-colors`}>
                                {tpl.icon}
                            </div>
                            <div className="font-bold text-sm text-[var(--text-primary)] mb-1">{tpl.label}</div>
                            <div className="text-xs text-[var(--text-tertiary)] leading-relaxed mb-3">{tpl.description}</div>
                            {tpl.fields.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-tertiary)] border border-[var(--border)]">{tpl.fields.length} fields</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-[var(--text-secondary)] border border-purple-500/20">{scoredCount} dinilai</span>
                                </div>
                            )}
                            <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all ${hovered === tpl.id ? "text-[var(--accent)] translate-x-0.5" : "text-slate-700"}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Step 2: Basic Info ───────────────────────────────────────────────────────

function StepBasicInfo({ form, setForm, userOrgs, orgsLoading, selectedOrgId, setSelectedOrgId, onNext, onBack }: {
    form: TenderFormData;
    setForm: React.Dispatch<React.SetStateAction<TenderFormData>>;
    userOrgs: OrgOption[];
    orgsLoading: boolean;
    selectedOrgId: string;
    setSelectedOrgId: (id: string) => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const CATEGORIES = ["Hardware & IT", "Software Development", "Cybersecurity", "Cloud Infrastructure", "Konstruksi & Fasilitas", "Konsultasi & Jasa Profesional", "Pengadaan Umum"];
    const canNext = form.title.trim().length >= 3 && !!selectedOrgId;
    return (
        <div className="space-y-5">
            <div className="card p-6 rounded-2xl space-y-5">
                <div className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3">
                    <FileSpreadsheet className="w-5 h-5 text-[var(--accent)]" /> Informasi Dasar Tender
                </div>

                {/* Org Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Organisasi Penyelenggara <span className="text-red-600">*</span></label>
                    {orgsLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-tertiary)]">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Memuat organisasi...
                        </div>
                    ) : userOrgs.length === 0 ? (
                        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-200 text-amber-600 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Tidak ada organisasi yang memenuhi syarat.</p>
                                <p className="text-amber-600/70 mt-0.5">Anda harus menjadi <strong>Procurement Officer</strong> atau <strong>Organization Admin</strong> di organisasi yang sudah diverifikasi untuk membuat tender.</p>
                            </div>
                        </div>
                    ) : (
                        <select
                            value={selectedOrgId}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60"
                        >
                            {userOrgs.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name} — {o.memberRole === "ORGANIZATION_ADMIN" ? "Admin" : "Procurement Officer"}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Judul Tender <span className="text-red-600">*</span></label>
                    <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Contoh: Pengadaan 100 Laptop untuk Kantor Pusat Tahun 2026"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">Kode Tender <span className="text-[10px] text-[var(--text-tertiary)] font-normal">(auto)</span></label>
                        <div className="relative">
                            <input type="text" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm font-mono text-[var(--accent)] focus:outline-none pr-10" />
                            <button type="button" onClick={() => setForm((p) => ({ ...p, code: generateCode() }))} title="Generate ulang" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Kategori Pengadaan</label>
                        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60">
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Deskripsi Tender</label>
                    <textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Jelaskan latar belakang kebutuhan, ruang lingkup, dan ketentuan tender..."
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500/60 resize-none" />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Lampiran (Opsional)</label>
                    <div className="space-y-2">
                        {form.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm">
                                <span className="truncate flex-1 text-[var(--text-secondary)]">{att.name}</span>
                                <button type="button" onClick={() => {
                                    const newAtt = [...form.attachments];
                                    newAtt.splice(idx, 1);
                                    setForm(p => ({ ...p, attachments: newAtt }));
                                }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        {form.attachments.length === 0 && (
                            <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-[var(--border-strong)] rounded-xl bg-[var(--surface-secondary)] text-[var(--text-tertiary)] hover:bg-[var(--surface)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer text-sm">
                                <FileUp className="w-4 h-4" />
                                <span>Pilih File PDF/DOC</span>
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setForm(p => ({ ...p, attachments: [{ name: file.name, url: "", file }] }));
                                    }
                                    e.target.value = "";
                                }} />
                            </label>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> Batas Akhir Submit Penawaran</label>
                        <input type="datetime-local" value={form.commitDeadline} onChange={(e) => setForm((p) => ({ ...p, commitDeadline: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/60" />
                        <p className="text-[11px] text-[var(--text-tertiary)]">Penawaran terenkripsi dikunci setelah waktu ini</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Durasi Reveal Window</label>
                        <div className="pt-1">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    min={0} 
                                    max={30} 
                                    placeholder="Hari"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent text-sm"
                                    value={Math.floor(form.revealWindowHours / 24)} 
                                    onChange={(e) => {
                                        const days = Number(e.target.value) || 0;
                                        const hours = Math.floor(form.revealWindowHours % 24);
                                        const minutes = Math.round((form.revealWindowHours % 1) * 60);
                                        setForm(p => ({ ...p, revealWindowHours: (days * 24) + hours + (minutes / 60) }));
                                    }} 
                                />
                                <span className="text-xs text-[var(--text-tertiary)]">Hari</span>
                                
                                <input 
                                    type="number" 
                                    min={0} 
                                    max={23} 
                                    placeholder="Jam"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent text-sm"
                                    value={Math.floor(form.revealWindowHours % 24)} 
                                    onChange={(e) => {
                                        const days = Math.floor(form.revealWindowHours / 24);
                                        const hours = Number(e.target.value) || 0;
                                        const minutes = Math.round((form.revealWindowHours % 1) * 60);
                                        setForm(p => ({ ...p, revealWindowHours: (days * 24) + hours + (minutes / 60) }));
                                    }} 
                                />
                                <span className="text-xs text-[var(--text-tertiary)]">Jam</span>
                                
                                <input 
                                    type="number" 
                                    min={0} 
                                    max={59} 
                                    placeholder="Menit"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-transparent text-sm"
                                    value={Math.round((form.revealWindowHours % 1) * 60)} 
                                    onChange={(e) => {
                                        const days = Math.floor(form.revealWindowHours / 24);
                                        const hours = Math.floor(form.revealWindowHours % 24);
                                        const minutes = Number(e.target.value) || 0;
                                        setForm(p => ({ ...p, revealWindowHours: (days * 24) + hours + (minutes / 60) }));
                                    }} 
                                />
                                <span className="text-xs text-[var(--text-tertiary)]">Menit</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-[var(--text-tertiary)]">Waktu vendor untuk decrypt dan ungkap penawaran</p>
                    </div>
                </div>
            </div>
            <StepNav onBack={onBack} onNext={onNext} nextDisabled={!canNext} nextLabel="Desain Field & Penilaian" />
        </div>
    );
}

// ─── Step 3: Fields + Scoring (Merged) ───────────────────────────────────────

function StepFieldsAndScoring({
    fields, totalWeight, weightOk, scoredCount,
    draggedIdx, dragOverIdx,
    onAdd, onUpdate, onRemove,
    onDragStart, onDragOver, onDrop, onDragEnd,
    onNext, onBack,
}: {
    fields: BidField[];
    totalWeight: number;
    weightOk: boolean;
    scoredCount: number;
    draggedIdx: number | null;
    dragOverIdx: number | null;
    onAdd: () => void;
    onUpdate: <K extends keyof BidField>(idx: number, key: K, val: BidField[K]) => void;
    onRemove: (id: string) => void;
    onDragStart: (idx: number) => void;
    onDragOver: (e: React.DragEvent, idx: number) => void;
    onDrop: (idx: number) => void;
    onDragEnd: () => void;
    onNext: () => void;
    onBack: () => void;
}) {
    const weightRemaining = 100 - totalWeight;

    return (
        <div className="space-y-5">
            {/* Header Card */}
            <div className="card p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                            <Layers className="w-5 h-5 text-[var(--accent)]" /> Field Bid & Penilaian
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                            Setiap field bisa punya penilaiannya sendiri. Drag <GripVertical className="inline w-3 h-3" /> untuk ubah urutan.
                        </p>
                    </div>
                    <button type="button" onClick={onAdd}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-50 text-[var(--accent)] text-xs font-semibold border border-blue-200 transition-colors">
                        <PlusCircle className="w-3.5 h-3.5" /> Tambah Field
                    </button>
                </div>

                {/* Weight bar — only show if there are scored fields */}
                {scoredCount > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[var(--text-tertiary)]">Total Bobot ({scoredCount} field dinilai)</span>
                            <span className={weightOk ? "text-[var(--accent)]" : totalWeight > 100 ? "text-red-600" : "text-amber-600"}>
                                {totalWeight}% / 100%
                                {weightOk && " ✓"}
                                {!weightOk && totalWeight > 0 && ` (${weightRemaining > 0 ? "+" : ""}${weightRemaining}% lagi)`}
                            </span>
                        </div>
                        <div className="h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                    weightOk ? "bg-gradient-to-r from-[var(--accent)] to-emerald-400"
                                    : totalWeight > 100 ? "bg-red-500"
                                    : "bg-gradient-to-r from-purple-500 to-teal-600"
                                }`}
                                style={{ width: `${Math.min(totalWeight, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Empty state */}
            {fields.length === 0 && (
                <div onClick={onAdd} className="card rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-200 transition-colors border-dashed">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[var(--accent)]"><PlusCircle className="w-6 h-6" /></div>
                    <p className="text-sm font-semibold text-[var(--text-secondary)]">Belum ada field</p>
                    <p className="text-xs text-[var(--text-tertiary)] text-center">Klik untuk menambah field pertama, atau kembali untuk memilih template</p>
                </div>
            )}

            {/* Field cards */}
            <div className="space-y-3">
                {fields.map((field, idx) => {
                    const meta = FIELD_TYPE_META[field.type];
                    const isDragging = draggedIdx === idx;
                    const isDragOver = dragOverIdx === idx;
                    return (
                        <div
                            key={field.id}
                            draggable
                            onDragStart={() => onDragStart(idx)}
                            onDragOver={(e) => onDragOver(e, idx)}
                            onDrop={() => onDrop(idx)}
                            onDragEnd={onDragEnd}
                            className={`card rounded-xl overflow-hidden transition-all duration-150 ${isDragging ? "opacity-40 scale-95" : isDragOver ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : ""}`}
                        >
                            {/* ── Vendor Input Section ── */}
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="pt-2.5 cursor-grab active:cursor-grabbing text-slate-700 hover:text-[var(--text-tertiary)] transition-colors">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        {/* Row 1: Name + Type + Required */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                            <div className="sm:col-span-5 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Nama Field</label>
                                                <input type="text" value={field.name} onChange={(e) => onUpdate(idx, "name", e.target.value)} placeholder="Contoh: Harga Penawaran Total"
                                                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-slate-700 focus:outline-none focus:border-[var(--accent)]" />
                                            </div>
                                            <div className="sm:col-span-4 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Tipe Input</label>
                                                <select value={field.type} onChange={(e) => onUpdate(idx, "type", e.target.value as FieldType)}
                                                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
                                                    {(Object.keys(FIELD_TYPE_META) as FieldType[]).map((t) => (
                                                        <option key={t} value={t}>{FIELD_TYPE_META[t].label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Wajib Diisi</label>
                                                <div className="flex items-center gap-2 h-[38px]">
                                                    <button type="button" onClick={() => onUpdate(idx, "required", !field.required)}
                                                        className={`relative w-10 h-5 rounded-full transition-colors ${field.required ? "bg-emerald-500" : "bg-slate-700"}`}>
                                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${field.required ? "left-5" : "left-0.5"}`} />
                                                    </button>
                                                    <span className={`text-xs font-semibold ${field.required ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"}`}>
                                                        {field.required ? "Wajib" : "Opsional"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Row 2: Help text */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Petunjuk untuk Vendor</label>
                                            <input type="text" value={field.helpText} onChange={(e) => onUpdate(idx, "helpText", e.target.value)} placeholder="Contoh: Masukkan total harga termasuk PPN 11%"
                                                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] placeholder:text-slate-700 focus:outline-none focus:border-[var(--accent)]" />
                                        </div>
                                        {/* Row 3: Options for select */}
                                        {(field.type === "select" || field.type === "multi-select") && (
                                            <OptionsChipInput options={field.options || []} onChange={(opts) => onUpdate(idx, "options", opts)} />
                                        )}
                                    </div>
                                    {/* Type badge + delete */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <button type="button" onClick={() => onRemove(field.id)} className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[10px] font-medium ${meta.color}`}>
                                            {meta.icon}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Scoring Section ── */}
                            <div className={`border-t transition-colors ${field.scored ? "border-purple-500/20 bg-purple-500/5" : "border-[var(--border)] bg-[var(--surface-secondary)]/30"}`}>
                                <div className="px-4 py-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Star className={`w-3.5 h-3.5 ${field.scored ? "text-[var(--text-secondary)]" : "text-[var(--text-tertiary)]"}`} />
                                            <span className={`text-xs font-bold ${field.scored ? "text-[var(--text-secondary)]" : "text-[var(--text-tertiary)]"}`}>
                                                Kriteria Penilaian
                                            </span>
                                            {!field.scored && <span className="text-[10px] text-[var(--text-tertiary)]">(opsional — aktifkan untuk menilai field ini)</span>}
                                        </div>
                                        {/* Toggle scored */}
                                        <button type="button" onClick={() => onUpdate(idx, "scored", !field.scored)}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${field.scored ? "bg-purple-500" : "bg-slate-700"}`}>
                                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${field.scored ? "left-5" : "left-0.5"}`} />
                                        </button>
                                    </div>

                                    {field.scored && (
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                            {/* Weight */}
                                            <div className="sm:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Bobot (%)</label>
                                                <div className="relative">
                                                    <input type="number" min={0} max={100} value={field.weight === 0 ? "" : field.weight}
                                                        onChange={(e) => onUpdate(idx, "weight", e.target.value === "" ? 0 : parseInt(e.target.value, 10))}
                                                        className="w-full px-3 py-2 pr-7 rounded-lg bg-purple-50 border border-purple-500/30 text-sm font-bold text-[var(--text-secondary)] focus:outline-none focus:border-purple-500/60" />
                                                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-500/50" />
                                                </div>
                                            </div>
                                            {/* Scoring Type */}
                                            <div className="sm:col-span-4 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Metode Scoring</label>
                                                <select value={field.scoringType} onChange={(e) => onUpdate(idx, "scoringType", e.target.value as ScoringType)}
                                                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-purple-500/20 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500/40">
                                                    {(Object.keys(SCORING_META) as ScoringType[]).map((t) => (
                                                        <option key={t} value={t}>{SCORING_META[t].label}</option>
                                                    ))}
                                                </select>
                                                <p className={`text-[10px] ${SCORING_META[field.scoringType].color}`}>
                                                    {SCORING_META[field.scoringType].desc}
                                                </p>
                                            </div>
                                            {/* Evaluator guide */}
                                            <div className="sm:col-span-5 space-y-1">
                                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Panduan Evaluator</label>
                                                <input type="text" value={field.evaluatorGuide} onChange={(e) => onUpdate(idx, "evaluatorGuide", e.target.value)} placeholder="Panduan singkat untuk evaluator..."
                                                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-purple-500/20 text-xs text-[var(--text-secondary)] placeholder:text-slate-700 focus:outline-none focus:border-purple-500/40" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <StepNav onBack={onBack} onNext={onNext} nextDisabled={fields.length === 0 || !weightOk}
                nextLabel={!weightOk ? `Total bobot: ${totalWeight}% (harus 100%)` : "Review & Publikasikan"} />
        </div>
    );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function StepReview({ form, totalWeight, weightOk, loading, onBack, onSubmit, onGoToStep }: {
    form: TenderFormData;
    totalWeight: number;
    weightOk: boolean;
    loading: boolean;
    onBack: () => void;
    onSubmit: () => void;
    onGoToStep: (s: number) => void;
}) {
    const deadline = form.commitDeadline ? new Date(form.commitDeadline) : null;
    const scoredFields = form.fields.filter((f) => f.scored);

    return (
        <div className="space-y-5">
            <div className="card p-5 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]"><Eye className="w-5 h-5 text-[var(--accent)]" /> Review & Konfirmasi</div>
                <p className="text-xs text-[var(--text-tertiary)]">Periksa kembali semua detail sebelum tender dipublikasikan.</p>
            </div>

            {/* Info */}
            <div className="card p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Informasi Tender</h3>
                    <button type="button" onClick={() => onGoToStep(2)} className="text-xs text-[var(--accent)] hover:text-[var(--accent)]">Edit</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ReviewRow label="Judul" value={form.title || "—"} />
                    <ReviewRow label="Kode" value={form.code} mono />
                    <ReviewRow label="Kategori" value={form.category} />
                    <ReviewRow label="Commit Deadline" value={deadline ? deadline.toLocaleString("id-ID") : "—"} />
                    
    <ReviewRow label="Reveal Window" value={`${Math.floor(form.revealWindowHours / 24) > 0 ? Math.floor(form.revealWindowHours / 24) + " Hari " : ""}${Math.floor(form.revealWindowHours % 24) > 0 ? Math.floor(form.revealWindowHours % 24) + " Jam " : ""}${Math.round((form.revealWindowHours % 1) * 60) > 0 ? Math.round((form.revealWindowHours % 1) * 60) + " Menit" : ""}`} />
    
                    <ReviewRow label="Deskripsi" value={form.description || "—"} full />
                </div>
            </div>

            {/* Fields + Scoring summary */}
            <div className="card p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Field Bid — {form.fields.length} field, {scoredFields.length} dinilai
                    </h3>
                    <button type="button" onClick={() => onGoToStep(3)} className="text-xs text-[var(--accent)] hover:text-[var(--accent)]">Edit</button>
                </div>
                <div className="space-y-2">
                    {form.fields.map((f, i) => {
                        const meta = FIELD_TYPE_META[f.type];
                        const sMeta = f.scored ? SCORING_META[f.scoringType] : null;
                        return (
                            <div key={f.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${f.scored ? "bg-purple-500/5 border-purple-500/15" : "bg-[var(--surface-secondary)]/60 border-[var(--border)]"}`}>
                                <span className="text-[10px] text-[var(--text-tertiary)] font-mono w-4">{i + 1}</span>
                                <span className={meta.color}>{meta.icon}</span>
                                <span className="text-sm text-[var(--text-primary)] font-medium flex-1 truncate">{f.name || <span className="text-[var(--text-tertiary)] italic">Tanpa nama</span>}</span>
                                {f.scored && sMeta ? (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`flex items-center gap-1 text-[10px] font-medium ${sMeta.color}`}>
                                            {sMeta.icon}
                                        </span>
                                        <span className="text-sm font-bold text-[var(--text-secondary)]">{f.weight}%</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-tertiary)] shrink-0">Informatif</span>
                                )}
                            </div>
                        );
                    })}
                </div>
                {scoredFields.length > 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${weightOk ? "bg-[var(--accent-light)] border border-teal-200 text-[var(--accent)]" : "bg-red-50 border border-red-200 text-red-600"}`}>
                        {weightOk ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        Total Bobot: {totalWeight}% {weightOk ? "— Valid ✓" : "— Harus tepat 100%"}
                    </div>
                )}
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-300 text-xs">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Setelah dibuat, tender berstatus <strong>DRAFT</strong> dan perlu diaktifkan ke <strong>OPEN</strong> untuk menerima penawaran vendor.</p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
                <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-secondary)] transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                </button>
                <button type="button" onClick={onSubmit} disabled={loading || !weightOk}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--text-primary)] text-white font-semibold text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Membuat Tender...</>
                    ) : (
                        <><Save className="w-4 h-4" />Publikasikan Tender</>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Live Preview Panel ───────────────────────────────────────────────────────

function LivePreviewPanel({ fields, title }: { fields: BidField[]; title: string }) {
    return (
        <div className="sticky top-4 space-y-4">
            <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Live Preview</span>
                <span className="text-xs text-[var(--text-tertiary)]">— Tampilan form vendor</span>
            </div>
            <div className="card rounded-2xl overflow-hidden border-cyan-500/20">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface)]/80 border-b border-[var(--border)]">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-700" /><div className="w-2.5 h-2.5 rounded-full bg-slate-700" /><div className="w-2.5 h-2.5 rounded-full bg-slate-700" /></div>
                    <div className="flex-1 h-5 rounded bg-[var(--surface-secondary)] text-[10px] text-[var(--text-tertiary)] flex items-center px-2">tenderseal.app/tenders/submit</div>
                </div>
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Form Penawaran</div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">{title || <span className="text-[var(--text-tertiary)] italic">Judul tender belum diisi</span>}</h3>
                    </div>
                    {fields.length === 0 ? (
                        <div className="text-center py-6 text-[var(--text-tertiary)] text-xs">Tambah field untuk melihat preview</div>
                    ) : (
                        <div className="space-y-3.5">
                            {fields.map((f) => {
                                const meta = FIELD_TYPE_META[f.type];
                                return (
                                    <div key={f.id} className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                                            <span className={meta.color}>{meta.icon}</span>
                                            {f.name || <span className="text-[var(--text-tertiary)] italic">Nama field</span>}
                                            {f.required && <span className="text-red-600">*</span>}
                                            {f.scored && <span className="ml-auto text-[10px] font-bold text-[var(--text-secondary)]">{f.weight}%</span>}
                                        </label>
                                        {f.type === "currency" && (
                                            <div className="flex items-center px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] gap-2">
                                                <span className="text-xs font-bold text-emerald-600">Rp</span>
                                                <span className="text-xs text-[var(--text-tertiary)] italic">{f.helpText || "0"}</span>
                                            </div>
                                        )}
                                        {(f.type === "text" || f.type === "number") && (
                                            <div className="px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-tertiary)] italic">{f.helpText || "Masukkan nilai..."}</div>
                                        )}
                                        {f.type === "file" && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface)] border border-dashed border-[var(--border)] text-xs text-[var(--text-tertiary)]">
                                                <FileUp className="w-3 h-3" />{f.helpText || "Upload file..."}
                                            </div>
                                        )}
                                        {(f.type === "select" || f.type === "multi-select") && (
                                            <div className="px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-tertiary)] italic">
                                                {f.options?.length ? `Pilih: ${f.options.slice(0, 3).join(", ")}${f.options.length > 3 ? "..." : ""}` : "Pilih opsi..."}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Options Chip Input ───────────────────────────────────────────────────────

function OptionsChipInput({ options, onChange }: { options: string[]; onChange: (opts: string[]) => void }) {
    const [inputVal, setInputVal] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const commit = () => {
        const trimmed = inputVal.trim();
        if (trimmed && !options.includes(trimmed)) onChange([...options, trimmed]);
        setInputVal("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); commit(); }
        else if (e.key === "Backspace" && inputVal === "" && options.length > 0) onChange(options.slice(0, -1));
    };

    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Pilihan Opsi{" "}
                <span className="text-[var(--text-tertiary)] normal-case font-normal">
                    — ketik lalu tekan <kbd className="px-1 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-tertiary)] text-[9px] font-mono">Enter</kbd> untuk menambah
                </span>
            </label>
            <div className="flex flex-wrap gap-1.5 px-2.5 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus-within:border-cyan-500/50 transition-colors min-h-[38px] cursor-text" onClick={() => inputRef.current?.focus()}>
                {options.map((opt) => (
                    <span key={opt} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 border border-blue-200 text-[var(--accent)] text-xs font-medium">
                        {opt}
                        <button type="button" onClick={(e) => { e.stopPropagation(); onChange(options.filter((o) => o !== opt)); }} className="text-cyan-500/60 hover:text-red-600 transition-colors leading-none">✕</button>
                    </span>
                ))}
                <input ref={inputRef} type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={handleKeyDown} onBlur={commit}
                    placeholder={options.length === 0 ? "Ketik opsi, tekan Enter..." : "Tambah opsi..."}
                    className="flex-1 min-w-[120px] bg-transparent text-xs text-[var(--text-secondary)] placeholder:text-slate-700 outline-none" />
            </div>
        </div>
    );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function ReviewRow({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
    return (
        <div className={full ? "col-span-full" : ""}>
            <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{label}</div>
            <div className={`text-sm text-[var(--text-primary)] ${mono ? "font-mono text-[var(--accent)]" : ""}`}>{value}</div>
        </div>
    );
}

function StepNav({ onBack, onNext, nextDisabled, nextLabel }: { onBack: () => void; onNext: () => void; nextDisabled?: boolean; nextLabel?: string }) {
    return (
        <div className="flex items-center justify-between gap-4 pt-2">
            <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-secondary)] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </button>
            <button type="button" onClick={onNext} disabled={nextDisabled}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--text-primary)] text-white font-semibold text-[13px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {nextLabel || "Lanjut"} <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
