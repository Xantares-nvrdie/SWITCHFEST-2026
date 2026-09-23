"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
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
    AlertCircle,
} from "lucide-react";

interface TenderData {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    status: string;
    commitDeadline: string;
    revealDeadline: string;
    organization: { id: string; name: string };
    creator: { id: string; name: string; email: string };
    fields: any[];
    criteria: any[];
    participants: any[];
    bids?: any[];
}

interface OrgOption {
    id: string;
    name: string;
    memberRole: string;
    memberStatus: string;
    verificationStatus: string;
    isVerified: boolean;
}

export default function TenderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const tenderId = params?.id as string;
    const { data: session } = useSession();

    const [tender, setTender] = useState<TenderData | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Vendor Organization Selection
    const [userOrgs, setUserOrgs] = useState<OrgOption[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>("");

    // Active Tab state
    const [activeTab, setActiveTab] = useState<"overview" | "encrypt" | "reveal" | "scoring" | "audit">("overview");

    // Dynamic Form Input Values State
    const [formData, setFormData] = useState<Record<string, string>>({});
    
    // Secret Key for Encryption/Decryption
    const [vendorSecret, setVendorSecret] = useState<string>("");

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
    const [submittingBid, setSubmittingBid] = useState(false);
    const [submittedSealed, setSubmittedSealed] = useState(false);

    // Reveal Workbench State
    const [revealSecret, setRevealSecret] = useState("");
    const [revealing, setRevealing] = useState(false);
    const [revealResult, setRevealResult] = useState<{
        isValid: boolean;
        decryptedPayload: unknown;
        message: string;
    } | null>(null);

    // Fetch Tender Data and Organizations
    useEffect(() => {
        if (!tenderId) return;
        
        Promise.all([
            fetch(`/api/tenders/${tenderId}`).then((r) => r.json()),
            session?.user ? fetch("/api/organizations/me").then((r) => r.json()) : Promise.resolve([])
        ])
        .then(([tenderData, orgsData]) => {
            if (tenderData.id) {
                setTender(tenderData);
                // Initialize form data with empty strings based on required criteria/fields
                const initialForm: Record<string, string> = {};
                tenderData.fields?.forEach((f: any) => {
                    initialForm[f.key] = "";
                });
                setFormData(initialForm);
                
                // If user has already submitted a bid for this tender, we should probably mark it
                // We'll check this when they select an org
            }
            
            if (Array.isArray(orgsData)) {
                // Filter valid vendor orgs
                const eligible = orgsData.filter(
                    (o: any) =>
                        o.memberStatus === "ACTIVE" &&
                        (o.memberRole === "PROCUREMENT_OFFICER" || o.memberRole === "ORGANIZATION_ADMIN") &&
                        (o.isVerified || o.verificationStatus === "APPROVED")
                );
                setUserOrgs(eligible);
                if (eligible.length > 0) setSelectedOrgId(eligible[0].id);
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [tenderId, session?.user]);

    // Check if current user is the tender creator
    const isCreator = session?.user?.id === tender?.creator?.id;

    // Execute Client-Side Encryption
    const handleRunEncryption = async () => {
        if (!vendorSecret || vendorSecret.length < 6) {
            alert("Secret Key / PIN harus minimal 6 karakter.");
            return;
        }
        if (!selectedOrgId) {
            alert("Pilih organisasi vendor terlebih dahulu.");
            return;
        }

        setEncrypting(true);
        try {
            const kdfSalt = generateSalt(16);
            const bidSalt = generateSalt(16);

            // 1. Derive KDF Key from Secret
            const { key } = await deriveKdfKey(vendorSecret, kdfSalt);

            // 2. Encrypt Payload using AES-GCM 256-bit
            const { ciphertextHex, ivHex, payloadHash } = await encryptBidPayload(formData, key);

            // 3. Compute Commitment Hash
            const commitmentHash = await calculateCommitmentHash(tenderId, selectedOrgId, formData, bidSalt);

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
            alert("Gagal melakukan enkripsi");
        } finally {
            setEncrypting(false);
        }
    };
    
    // Submit Bid to Backend
    const handleSubmitBid = async () => {
        if (!encryptionResult || !selectedOrgId) return;
        setSubmittingBid(true);
        try {
            const res = await fetch(`/api/bids/tender/${tenderId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId: selectedOrgId,
                    commitmentHash: encryptionResult.commitmentHash,
                    encryptedPayload: encryptionResult.ciphertextHex,
                    kdfSalt: encryptionResult.kdfSalt,
                    encryptionIv: encryptionResult.ivHex,
                    bidSalt: encryptionResult.bidSalt,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmittedSealed(true);
            } else {
                alert(data.message || "Gagal submit bid");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingBid(false);
        }
    };

    // Execute Client-Side Reveal Decryption & Verification
    const handleRunReveal = async () => {
        if (!revealSecret || revealSecret.length < 6) {
            alert("Secret PIN tidak valid.");
            return;
        }
        setRevealing(true);
        try {
            // First we need to fetch the bid details for this user's org
            if (!selectedOrgId) {
                alert("Pilih organisasi terlebih dahulu.");
                return;
            }
            const bidsRes = await fetch(`/api/bids/tender/${tenderId}`);
            const bids = await bidsRes.json();
            const myBid = bids.find((b: any) => b.organizationId === selectedOrgId);
            
            if (!myBid || !myBid.crypto || !myBid.encryptedPayload) {
                setRevealResult({ isValid: false, decryptedPayload: null, message: "Tidak ada data enkripsi bid ditemukan untuk organisasi Anda."});
                return;
            }

            // 1. Re-derive KDF Key
            const { key } = await deriveKdfKey(revealSecret, myBid.crypto.kdfSalt);

            // 2. Decrypt Ciphertext in Browser
            const decryptedPayload = await decryptBidPayload(
                myBid.encryptedPayload.ciphertext,
                myBid.crypto.encryptionIv,
                key,
            );

            // 3. Re-calculate Commitment Hash
            const computedHash = await calculateCommitmentHash(
                tenderId,
                selectedOrgId,
                decryptedPayload,
                myBid.crypto.bidSalt,
            );

            const isValid = computedHash === myBid.commitmentHash;

            if (isValid) {
                // Submit to backend
                const revealRes = await fetch(`/api/bids/${myBid.id}/reveal`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        revealedPayload: decryptedPayload,
                        bidSalt: myBid.crypto.bidSalt
                    }),
                });
                const revealData = await revealRes.json();
                
                if (revealRes.ok) {
                    setRevealResult({
                        isValid: true,
                        decryptedPayload,
                        message: "Sukses! Bid berhasil di-reveal dan disubmit ke server.",
                    });
                } else {
                    setRevealResult({
                        isValid: false,
                        decryptedPayload: null,
                        message: revealData.message || "Gagal submit ke server saat reveal.",
                    });
                }
            } else {
                setRevealResult({
                    isValid: false,
                    decryptedPayload: null,
                    message: "INVALID! Secret/PIN salah atau data penawaran telah diubah!",
                });
            }
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

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading tender data...</div>;
    }
    
    if (!tender) {
        return <div className="p-8 text-center text-red-400">Tender not found.</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <Link href="/tenders" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Katalog Tender
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                                {tender.code}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tender.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                {tender.status}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                            {tender.title}
                        </h1>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" /> {tender.organization?.name} • {tender.category}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Commit Deadline:</span>
                        <span className="text-xs font-bold text-amber-400 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            {new Date(tender.commitDeadline).toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-px overflow-x-auto">
                <button onClick={() => setActiveTab("overview")} className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === "overview" ? "border-emerald-400 text-emerald-400 bg-slate-900/60" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                    <Layers className="w-4 h-4" /> Detail Tender
                </button>
                <button onClick={() => setActiveTab("encrypt")} className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === "encrypt" ? "border-cyan-400 text-cyan-400 bg-slate-900/60" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                    <Lock className="w-4 h-4" /> Submit Bid (Encrypt)
                </button>
                <button onClick={() => setActiveTab("reveal")} className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === "reveal" ? "border-purple-400 text-purple-400 bg-slate-900/60" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                    <KeyRound className="w-4 h-4" /> Commit-Reveal
                </button>
                {(isCreator || tender.status === 'SCORING' || tender.status === 'COMPLETED') && (
                    <button onClick={() => setActiveTab("scoring")} className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === "scoring" ? "border-amber-400 text-amber-400 bg-slate-900/60" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                        <Award className="w-4 h-4" /> Scoring Engine
                    </button>
                )}
                <button onClick={() => setActiveTab("audit")} className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === "audit" ? "border-indigo-400 text-indigo-400 bg-slate-900/60" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                    <History className="w-4 h-4" /> Audit Log
                </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {tender.description}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FileCode2 className="w-5 h-5 text-emerald-400" /> Kebutuhan Data Bid
                            </h3>
                            <div className="space-y-3">
                                {tender.fields?.map((f: any) => (
                                    <div key={f.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                        <div className="flex justify-between items-start">
                                            <span className="font-semibold text-slate-200">{f.name}</span>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">{f.key}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Tipe: {f.type} {f.required ? "(Wajib)" : "(Opsional)"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-400" /> Kriteria Penilaian
                            </h3>
                            <div className="space-y-3">
                                {tender.criteria?.map((c: any) => (
                                    <div key={c.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 flex justify-between items-center">
                                        <div>
                                            <span className="font-semibold text-slate-200 block">{c.name}</span>
                                            <span className="text-xs text-slate-400 block">{c.description}</span>
                                        </div>
                                        <span className="font-bold text-emerald-400">{c.weight}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ENCRYPT (Submit Bid) */}
            {activeTab === "encrypt" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Input Form */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <Lock className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white leading-tight">Data Penawaran (Bid)</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Isi data sesuai kriteria tender. Data akan dienkripsi di browser.</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Vendor Org Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Pilih Organisasi Vendor Anda</label>
                                    {userOrgs.length === 0 ? (
                                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Anda tidak tergabung di organisasi VENDOR yang diverifikasi.
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedOrgId}
                                            onChange={(e) => setSelectedOrgId(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                        >
                                            {userOrgs.map(o => (
                                                <option key={o.id} value={o.id}>{o.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                
                                <hr className="border-slate-800" />

                                {tender.fields?.map((f: any) => (
                                    <div key={f.key} className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">{f.name} {f.required && <span className="text-red-400">*</span>}</label>
                                        {f.type === 'TEXTAREA' ? (
                                            <textarea
                                                value={formData[f.key] || ""}
                                                onChange={(e) => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                                rows={3}
                                            />
                                        ) : (
                                            <input
                                                type={f.type === 'NUMBER' || f.type === 'CURRENCY' ? 'number' : 'text'}
                                                value={formData[f.key] || ""}
                                                onChange={(e) => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                            />
                                        )}
                                    </div>
                                ))}

                                <hr className="border-slate-800" />
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-cyan-400">Secret Key / PIN Enkripsi <span className="text-red-400">*</span></label>
                                    <p className="text-[11px] text-slate-500">Kunci ini tidak akan dikirim ke server. Gunakan kunci yang kuat dan INGAT kunci ini untuk fase Reveal.</p>
                                    <input
                                        type="password"
                                        value={vendorSecret}
                                        onChange={(e) => setVendorSecret(e.target.value)}
                                        placeholder="Masukkan Secret PIN (min. 6 karakter)"
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-900/50 text-sm text-cyan-300 focus:outline-none focus:border-cyan-400 transition-colors"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleRunEncryption}
                                disabled={encrypting || userOrgs.length === 0}
                                className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {encrypting ? <span className="animate-pulse">Menghitung KDF & Enkripsi AES-GCM...</span> : <><Lock className="w-4 h-4" /> Enkripsi & Generate Commitment</>}
                            </button>
                        </div>
                    </div>

                    {/* Right: Ciphertext & Submit */}
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                            <h3 className="text-base font-bold text-white mb-4">Hasil Enkripsi (Siap Dikirim)</h3>
                            
                            {!encryptionResult ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                                    <Cpu className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-sm">Klik "Enkripsi & Generate Commitment" terlebih dahulu</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-slate-400">Ciphertext (Encrypted Payload)</span>
                                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">AES-GCM 256</span>
                                        </div>
                                        <p className="text-xs font-mono text-slate-300 break-all bg-slate-900 p-3 rounded-lg border border-slate-800/50 max-h-32 overflow-y-auto">
                                            {encryptionResult.ciphertextHex}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-slate-400">Commitment Hash</span>
                                            <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/50">SHA-256</span>
                                        </div>
                                        <p className="text-xs font-mono text-emerald-400 break-all bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/30">
                                            {encryptionResult.commitmentHash}
                                        </p>
                                    </div>
                                    
                                    {!submittedSealed ? (
                                        <button
                                            onClick={handleSubmitBid}
                                            disabled={submittingBid}
                                            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2"
                                        >
                                            {submittingBid ? "Mengirim ke Blockchain/DB..." : <><UploadCloud className="w-5 h-5" /> Submit Sealed Bid</>}
                                        </button>
                                    ) : (
                                        <div className="w-full py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> Sealed Bid Berhasil Disubmit!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* TAB 3: REVEAL */}
            {activeTab === "reveal" && (
                <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <KeyRound className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white leading-tight">Fase Reveal & Dekripsi</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Masukkan Secret PIN yang digunakan saat submit untuk membuka bid.</p>
                        </div>
                    </div>
                    <div className="max-w-md mx-auto space-y-4 py-8">
                        <input
                            type="password"
                            value={revealSecret}
                            onChange={(e) => setRevealSecret(e.target.value)}
                            placeholder="Secret PIN"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-purple-900/50 text-sm text-purple-300 focus:outline-none focus:border-purple-500 transition-colors text-center font-mono"
                        />
                        <button
                            onClick={handleRunReveal}
                            disabled={revealing}
                            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {revealing ? "Proses Verifikasi..." : <><KeyRound className="w-4 h-4" /> Proses Dekripsi & Reveal</>}
                        </button>
                        
                        {revealResult && (
                            <div className={`mt-4 p-4 rounded-xl text-sm font-semibold flex flex-col gap-2 ${revealResult.isValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                                <div className="flex items-center gap-2">
                                    {revealResult.isValid ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    {revealResult.message}
                                </div>
                                {revealResult.isValid && !!revealResult.decryptedPayload && (
                                    <pre className="text-[10px] bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-300">
                                        {JSON.stringify(revealResult.decryptedPayload, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* TAB 4: SCORING (placeholder) */}
            {activeTab === "scoring" && (
                <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                     <p className="text-slate-400 text-center py-12">Scoring engine akan merender bids di sini. (Akan diimplementasikan pada fase berikutnya)</p>
                </div>
            )}
            
            {/* TAB 5: AUDIT (placeholder) */}
            {activeTab === "audit" && (
                <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                     <p className="text-slate-400 text-center py-12">Log audit akan dirender di sini. (Akan diimplementasikan pada fase berikutnya)</p>
                </div>
            )}
        </div>
    );
}
