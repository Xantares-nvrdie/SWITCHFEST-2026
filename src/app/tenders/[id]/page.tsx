"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemo } from "@/context/demo-context";
import {
    calculateCommitmentHash,
    decryptBidPayload,
    deriveKdfKey,
    encryptBidPayload,
    generateSalt,
} from "@/lib/crypto";
import {
    ShieldCheck,
    Lock,
    KeyRound,
    FileCode2,
    CheckCircle2,
    XCircle,
    Clock,
    Building2,
    Layers,
    Award,
    History,
    Sparkles,
    ArrowLeft,
    Cpu,
    UploadCloud,
    Eye,
    Save,
    Check,
} from "lucide-react";

export default function TenderDetailPage() {
    const params = useParams();
    const tenderId = (params?.id as string) || "tnd-demo-001";
    const { activeRole, vendorSecret, setVendorSecret } = useDemo();

    // Active Tab state
    const [activeTab, setActiveTab] = useState<"overview" | "encrypt" | "reveal" | "scoring" | "audit">("overview");

    // Dynamic Form Input Values State
    const [formData, setFormData] = useState<Record<string, string>>({
        harga_total: "1150000000",
        spesifikasi: "Intel i9 14900HX, 32GB DDR5, 1TB NVMe, RTX 4080 12GB",
        garansi_tahun: "3",
    });

    // Encryption Workbench State
    const [encrypting, setEncrypting] = useState(false);
    const [encryptionResult, setEncryptionResult] = useState<{
        kdfSalt: string;
        bidSalt: string;
        ivHex: string;
        ciphertextHex: string;
        commitmentHash: string;
        payloadHash: string;
    } | null>(null);
    const [submittedSealed, setSubmittedSealed] = useState(false);

    // Reveal Workbench State
    const [revealSecret, setRevealSecret] = useState(vendorSecret);
    const [revealing, setRevealing] = useState(false);
    const [revealResult, setRevealResult] = useState<{
        isValid: boolean;
        decryptedPayload: unknown;
        message: string;
    } | null>(null);

    // Officer Scoring State
    const [scores, setScores] = useState<Record<string, number>>({
        "Vendor A": 88,
        "Vendor B": 92,
        "Vendor C": 85,
    });
    const [winnerSelected, setWinnerSelected] = useState<string | null>("Vendor B");

    // Execute Client-Side Encryption
    const handleRunEncryption = async () => {
        setEncrypting(true);
        try {
            const kdfSalt = generateSalt(16);
            const bidSalt = generateSalt(16);

            // 1. Derive KDF Key from Secret
            const { key } = await deriveKdfKey(vendorSecret, kdfSalt);

            // 2. Encrypt Payload using AES-GCM 256-bit
            const { ciphertextHex, ivHex, payloadHash } = await encryptBidPayload(formData, key);

            // 3. Compute Commitment Hash: Hash(tenderId + ":" + vendorOrgId + ":" + payload + ":" + bidSalt)
            const commitmentHash = await calculateCommitmentHash(tenderId, "org-vendor-001", formData, bidSalt);

            setEncryptionResult({
                kdfSalt,
                bidSalt,
                ivHex,
                ciphertextHex,
                commitmentHash,
                payloadHash,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setEncrypting(false);
        }
    };

    // Execute Client-Side Reveal Decryption & Verification
    const handleRunReveal = async () => {
        if (!encryptionResult) return;
        setRevealing(true);
        try {
            // 1. Re-derive KDF Key
            const { key } = await deriveKdfKey(revealSecret, encryptionResult.kdfSalt);

            // 2. Decrypt Ciphertext in Browser
            const decryptedPayload = await decryptBidPayload(
                encryptionResult.ciphertextHex,
                encryptionResult.ivHex,
                key,
            );

            // 3. Re-calculate Commitment Hash
            const computedHash = await calculateCommitmentHash(
                tenderId,
                "org-vendor-001",
                decryptedPayload,
                encryptionResult.bidSalt,
            );

            const isValid = computedHash === encryptionResult.commitmentHash;

            setRevealResult({
                isValid,
                decryptedPayload,
                message: isValid
                    ? "VALID! Commitment hash cocok 100% dengan data yang di-commit sebelum deadline."
                    : "INVALID! Secret/PIN salah atau data penawaran telah diubah!",
            });
        } catch (_err) {
            setRevealResult({
                isValid: false,
                decryptedPayload: null,
                message: "INVALID! Gagal dekripsi — Secret/PIN salah!",
            });
        } finally {
            setRevealing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <Link
                    href="/tenders"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Katalog Tender
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                                {tenderId.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                                OPEN
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                            Pengadaan 100 Laptop High Performance Workstation
                        </h1>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" /> PT Global Tech Indonesia • Hardware & IT
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Commit Deadline:</span>
                        <span className="text-xs font-bold text-amber-400 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            18 Sep 2026, 15:00 WIB
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-px overflow-x-auto">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "overview"
                            ? "border-emerald-400 text-emerald-400 bg-slate-900/60"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <Layers className="w-4 h-4" /> Detail Tender
                </button>

                <button
                    onClick={() => setActiveTab("encrypt")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "encrypt"
                            ? "border-cyan-400 text-cyan-400 bg-slate-900/60"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <Lock className="w-4 h-4" /> Client AES-GCM Encrypt (Submit Bid)
                </button>

                <button
                    onClick={() => setActiveTab("reveal")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "reveal"
                            ? "border-purple-400 text-purple-400 bg-slate-900/60"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <KeyRound className="w-4 h-4" /> Commit-Reveal Verification
                </button>

                <button
                    onClick={() => setActiveTab("scoring")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "scoring"
                            ? "border-amber-400 text-amber-400 bg-slate-900/60"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <Award className="w-4 h-4" /> Scoring Engine & Winner
                </button>

                <button
                    onClick={() => setActiveTab("audit")}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "audit"
                            ? "border-indigo-400 text-indigo-400 bg-slate-900/60"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <History className="w-4 h-4" /> Audit Log & On-Chain Log
                </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                            <h3 className="text-base font-bold text-white">Deskripsi Kebutuhan Tender</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Pengadaan 100 unit laptop workstation kelas enterprise untuk pengembang sistem software
                                dan desain grafis AI. Penawaran yang dikirimkan oleh vendor akan dienkripsi secara penuh
                                di sisi client menggunakan standar AES-GCM 256-bit dan ditandai dengan cryptographic
                                commitment hash sebelum batas waktu penutupan tender.
                            </p>
                        </div>

                        {/* Dynamic Fields List Required */}
                        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <FileCode2 className="w-4 h-4 text-cyan-400" />
                                Form Penawaran Dinamis (Dynamic Bid Fields)
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { name: "Harga Total Penawaran", key: "harga_total", type: "Currency (Rp)" },
                                    { name: "Spesifikasi RAM & Processor", key: "spesifikasi", type: "Text String" },
                                    { name: "Garansi Resmi (Tahun)", key: "garansi_tahun", type: "Number" },
                                    {
                                        name: "Proposal Dokumen Penawaran",
                                        key: "proposal_pdf",
                                        type: "File PDF (Encrypted)",
                                    },
                                ].map((field) => (
                                    <div
                                        key={field.key}
                                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                                    >
                                        <span className="font-semibold text-slate-200">{field.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-cyan-400">{field.key}</span>
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                                                {field.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                Kriteria & Bobot Penilaian
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: "Harga Total", weight: 50 },
                                    { name: "Spesifikasi Teknis", weight: 30 },
                                    { name: "Garansi & Layanan", weight: 20 },
                                ].map((c) => (
                                    <div key={c.name} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-300 font-medium">{c.name}</span>
                                            <span className="font-bold text-purple-400">{c.weight}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                                style={{ width: `${c.weight}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CLIENT ENCRYPTION WORKBENCH */}
            {activeTab === "encrypt" && (
                <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                        <span>
                            <strong>Client-Side Encryption Workbench:</strong> Mengenkripsi data penawaran secara lokal
                            di browser kamu sebelum dikirim ke backend. Server tidak pernah menerima plaintext
                            penawaran.
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Dynamic Form Fill */}
                        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Lock className="w-4 h-4 text-cyan-400" /> Form Isian Penawaran Vendor
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Harga Total (Rp)</label>
                                    <input
                                        type="number"
                                        value={formData.harga_total}
                                        onChange={(e) => setFormData({ ...formData, harga_total: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500/60"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">
                                        Spesifikasi RAM & Processor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.spesifikasi}
                                        onChange={(e) => setFormData({ ...formData, spesifikasi: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500/60"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">
                                        Vendor Passphrase / PIN Secret (KDF Input)
                                    </label>
                                    <input
                                        type="password"
                                        value={vendorSecret}
                                        onChange={(e) => setVendorSecret(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/60"
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        PIN/Secret ini digunakan untuk derivasi AES Key di browser via Argon2id/PBKDF2
                                    </p>
                                </div>

                                <button
                                    onClick={handleRunEncryption}
                                    disabled={encrypting}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {encrypting
                                        ? "Mengenkripsi di Client..."
                                        : "Jalankan Client AES-GCM Encrypt & Compute Commitment"}
                                </button>
                            </div>
                        </div>

                        {/* Encryption Output Inspector */}
                        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4 font-mono text-xs">
                            <h3 className="text-base font-sans font-bold text-white flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-emerald-400" /> Output Kriptografi Client
                            </h3>

                            {encryptionResult ? (
                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                        <span className="text-[11px] text-slate-500 font-sans block">
                                            Argon2id KDF Salt:
                                        </span>
                                        <span className="text-cyan-400 break-all">{encryptionResult.kdfSalt}</span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                        <span className="text-[11px] text-slate-500 font-sans block">
                                            AES-GCM Initialization Vector (IV):
                                        </span>
                                        <span className="text-purple-400 break-all">{encryptionResult.ivHex}</span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                        <span className="text-[11px] text-slate-500 font-sans block">
                                            Encrypted Ciphertext (Dikirim ke Server):
                                        </span>
                                        <span className="text-slate-300 break-all max-h-20 overflow-y-auto block">
                                            {encryptionResult.ciphertextHex}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                                        <span className="text-[11px] text-emerald-400 font-sans font-bold block">
                                            SHA-256 Commitment Hash (On-Chain):
                                        </span>
                                        <span className="text-emerald-300 break-all font-bold">
                                            {encryptionResult.commitmentHash}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setSubmittedSealed(true)}
                                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        {submittedSealed
                                            ? "Sealed Bid Terkirim ke Server & On-Chain!"
                                            : "Kirim Sealed Bid ke Server"}
                                    </button>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 font-sans text-xs border border-dashed border-slate-800 rounded-xl">
                                    Isi form dan klik tombol di sebelah kiri untuk melihat hasil enkripsi & commitment
                                    hash.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: COMMIT-REVEAL VERIFICATION */}
            {activeTab === "reveal" && (
                <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 flex items-center gap-3">
                        <KeyRound className="w-5 h-5 text-purple-400 shrink-0" />
                        <span>
                            <strong>Commit-Reveal Verification Workbench:</strong> Setelah deadline tercapai, vendor
                            memasukkan kembali secret/PIN untuk melakukan dekripsi di browser. Hash hasil dekripsi
                            diverifikasi ulang dengan Commitment Hash di Smart Contract.
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-purple-400" /> Dekripsi Penawaran di Browser
                            </h3>

                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-slate-300">
                                    Masukkan Secret / PIN Vendor untuk Dekripsi
                                </label>
                                <input
                                    type="password"
                                    value={revealSecret}
                                    onChange={(e) => setRevealSecret(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-purple-400 focus:outline-none"
                                />

                                <button
                                    onClick={handleRunReveal}
                                    disabled={revealing || !encryptionResult}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs hover:opacity-95 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Eye className="w-4 h-4" />
                                    {revealing ? "Verifikasi & Dekripsi..." : "Jalankan Decrypt & Verify Commitment"}
                                </button>
                            </div>
                        </div>

                        {/* Reveal Verification Result */}
                        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                Status Verifikasi Commitment Hash
                            </h3>

                            {revealResult ? (
                                <div className="space-y-4">
                                    <div
                                        className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                                            revealResult.isValid
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                                : "bg-red-500/10 border-red-500/30 text-red-300"
                                        }`}
                                    >
                                        {revealResult.isValid ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                        )}
                                        <span>{revealResult.message}</span>
                                    </div>

                                    {revealResult.isValid && (
                                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                                            <span className="text-xs font-bold text-slate-300 block">
                                                Hasil Dekripsi Plaintext Bid (Dikirim ke Scoring Engine):
                                            </span>
                                            <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-3 rounded-lg overflow-x-auto">
                                                {JSON.stringify(revealResult.decryptedPayload, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                                    Lakukan Client Encrypt terlebih dahulu di Tab 2, lalu klik Verifikasi di sini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: SCORING ENGINE & WINNER */}
            {activeTab === "scoring" && (
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                            <h3 className="text-base font-bold text-white">Scoring Engine & Penetapan Pemenang</h3>
                            <p className="text-xs text-slate-400">
                                Penilaian otomatis berdasarkan kriteria & bobot terverifikasi
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                vendor: "Vendor A (PT Tech Solusindo)",
                                score: 88,
                                status: "REVEALED_VALID",
                                total: "Rp 1.250.000.000",
                            },
                            {
                                vendor: "Vendor B (CV Utama Karya)",
                                score: 94,
                                status: "REVEALED_VALID",
                                total: "Rp 1.150.000.000",
                            },
                            {
                                vendor: "Vendor C (PT Media Cipta)",
                                score: 82,
                                status: "REVEALED_VALID",
                                total: "Rp 1.180.000.000",
                            },
                        ].map((v) => (
                            <div
                                key={v.vendor}
                                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                                    winnerSelected === v.vendor
                                        ? "bg-emerald-500/10 border-emerald-500/40"
                                        : "bg-slate-900 border-slate-800"
                                }`}
                            >
                                <div className="space-y-1">
                                    <span className="font-bold text-white text-sm block">{v.vendor}</span>
                                    <span className="text-slate-400">Penawaran: {v.total}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 block">Nilai Akhir</span>
                                        <span className="text-lg font-bold text-emerald-400">{v.score} / 100</span>
                                    </div>

                                    <button
                                        onClick={() => setWinnerSelected(v.vendor)}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                                            winnerSelected === v.vendor
                                                ? "bg-emerald-500 text-slate-950"
                                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        {winnerSelected === v.vendor ? "Pemenang Ditetapkan ✓" : "Pilih Pemenang"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: AUDIT LOG & BLOCKCHAIN LOG */}
            {activeTab === "audit" && (
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-400" /> Log Transaksi Blockchain & Audit Trail
                    </h3>

                    <div className="space-y-3 font-mono text-xs">
                        {[
                            {
                                type: "COMMIT",
                                hash: "0x8f2a9b4c1d6e7f3a8b2c4d6e8f0a2b4c6d8e0f2a",
                                sender: "0x71C...39A2",
                                time: "17 Sep 2026, 16:30:12",
                            },
                            {
                                type: "REVEAL_ATTESTATION",
                                hash: "0x3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f",
                                sender: "Relayer System",
                                time: "17 Sep 2026, 17:01:45",
                            },
                            {
                                type: "RESULT",
                                hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
                                sender: "0x71C...39A2",
                                time: "17 Sep 2026, 17:10:00",
                            },
                        ].map((tx) => (
                            <div
                                key={tx.hash}
                                className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                            >
                                <div className="flex justify-between text-slate-400 font-sans">
                                    <span className="font-bold text-emerald-400">{tx.type}</span>
                                    <span>{tx.time}</span>
                                </div>
                                <span className="text-slate-300 block truncate">Tx Hash: {tx.hash}</span>
                                <span className="text-slate-500 text-[11px] block">Sender Wallet: {tx.sender}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
