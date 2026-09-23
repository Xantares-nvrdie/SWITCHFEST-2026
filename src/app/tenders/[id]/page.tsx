"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { ethers } from "ethers";
import TenderSealABI from "@/lib/TenderSealABI.json";
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
    RefreshCw
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
    const [formData, setFormData] = useState<Record<string, any>>({});
    
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

    const [allBids, setAllBids] = useState<any[]>([]);
    const [manualScores, setManualScores] = useState<Record<string, Record<string, number>>>({});
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [auditData, setAuditData] = useState<any>(null);
    const [loadingAuditData, setLoadingAuditData] = useState(false);

    // Load draft scores from localStorage
    useEffect(() => {
        if (!tenderId) return;
        const saved = localStorage.getItem(`tenderseal_draft_scores_${tenderId}`);
        if (saved) {
            try {
                setManualScores(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse draft scores");
            }
        }
    }, [tenderId]);

    // Save draft scores to localStorage whenever it changes
    useEffect(() => {
        if (tenderId && Object.keys(manualScores).length > 0) {
            localStorage.setItem(`tenderseal_draft_scores_${tenderId}`, JSON.stringify(manualScores));
        }
    }, [manualScores, tenderId]);

    const handleManualScoreChange = (bidId: string, criteriaId: string, val: string, maxScore: number) => {
        let num = Number(val);
        if (num > maxScore) num = maxScore;
        if (num < 0) num = 0;
        
        setManualScores(prev => ({
            ...prev,
            [bidId]: {
                ...(prev[bidId] || {}),
                [criteriaId]: num
            }
        }));
    };

    // Fetch Tender Data and Organizations
    useEffect(() => {
        if (!tenderId) return;
        
        Promise.all([
            fetch(`/api/tenders/${tenderId}`).then((r) => r.json()),
            session?.user ? fetch("/api/organizations/me").then((r) => r.json()) : Promise.resolve([]),
            fetch(`/api/bids/tender/${tenderId}`).then((r) => r.json()),
        ])
        .then(([tenderData, orgsData, bidsData]) => {
            if (Array.isArray(bidsData)) {
                setAllBids(bidsData);
            }
            if (tenderData.id) {
                setTender(tenderData);

                if (tenderData.status === "COMPLETED") {
                    setLoadingAuditData(true);
                    fetch(`/api/tenders/${tenderId}/audit`)
                        .then(r => r.json())
                        .then(data => setAuditData(data))
                        .catch(err => console.error("Failed to load audit data:", err))
                        .finally(() => setLoadingAuditData(false));
                }

                // Initialize form data with empty strings based on required criteria/fields
                const initialForm: Record<string, any> = {};
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

    const handleDownloadEncryptedFile = async (payloadStr: string) => {
        try {
            const data = JSON.parse(payloadStr);
            if (!data._isEncryptedFile) return;

            const res = await fetch(data.url);
            const encryptedBuffer = await res.arrayBuffer();

            // Import key
            const keyBuffer = new Uint8Array(data.key.match(/.{1,2}/g)!.map((byte: any) => parseInt(byte, 16)));
            const cryptoKey = await crypto.subtle.importKey(
                "raw",
                keyBuffer,
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );

            const ivBuffer = new Uint8Array(data.iv.match(/.{1,2}/g)!.map((byte: any) => parseInt(byte, 16)));
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: ivBuffer },
                cryptoKey,
                encryptedBuffer
            );

            const blob = new Blob([decryptedBuffer], { type: data.mimeType || "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            a.download = data.fileName || "document";
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert("Gagal mendekripsi file! File mungkin korup.");
        }
    };

    // Execute Encryption and Submit Bid
    const handleSubmitBid = async () => {
        if (!vendorSecret || vendorSecret.length < 6) {
            alert("Secret Key / PIN harus minimal 6 karakter.");
            return;
        }
        if (!selectedOrgId) {
            alert("Pilih organisasi vendor terlebih dahulu.");
            return;
        }

        setSubmittingBid(true);
        try {
            // A. Run Client-Side Encryption
            const processedFormData = { ...formData };
            
            // 1. Process files: Encrypt & Upload to Supabase
            for (const [key, value] of Object.entries(processedFormData)) {
                if (value instanceof File) {
                    const fileKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
                    const exportedFileKey = await crypto.subtle.exportKey("raw", fileKey);
                    const fileKeyHex = Array.from(new Uint8Array(exportedFileKey)).map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    const fileIv = crypto.getRandomValues(new Uint8Array(12));
                    const fileIvHex = Array.from(fileIv).map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    const arrayBuffer = await value.arrayBuffer();
                    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: fileIv }, fileKey, arrayBuffer);
                    
                    const path = `bids/${tenderId}/${crypto.randomUUID()}_${value.name}.enc`;
                    const { data, error } = await supabase.storage.from('tender-documents').upload(path, ciphertext, {
                        contentType: 'application/octet-stream'
                    });
                    if (error) throw error;
                    
                    const { data: publicUrlData } = supabase.storage.from('tender-documents').getPublicUrl(path);
                    
                    processedFormData[key] = JSON.stringify({
                        _isEncryptedFile: true,
                        url: publicUrlData.publicUrl,
                        key: fileKeyHex,
                        iv: fileIvHex,
                        fileName: value.name,
                        mimeType: value.type
                    });
                }
            }

            const kdfSalt = generateSalt(16);
            const bidSalt = generateSalt(16);
            const { key: vendorKey } = await deriveKdfKey(vendorSecret, kdfSalt);
            const { ciphertextHex, ivHex, payloadHash } = await encryptBidPayload(processedFormData, vendorKey);
            const commitmentHash = await calculateCommitmentHash(tenderId, selectedOrgId, processedFormData, bidSalt);

            // B. Web3 Smart Contract Commit
            // @ts-ignore
            if (!window.ethereum) {
                alert("Please install MetaMask to submit a bid.");
                setSubmittingBid(false);
                return;
            }
            
            // @ts-ignore
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // @ts-ignore
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", TenderSealABI, signer);
            
            const scTx = await contract.commitBid(tenderId, selectedOrgId, commitmentHash);
            await scTx.wait();

            // C. Submit to Backend
            const res = await fetch(`/api/bids/tender/${tenderId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId: selectedOrgId,
                    commitmentHash: commitmentHash,
                    encryptedPayload: ciphertextHex,
                    kdfSalt: kdfSalt,
                    encryptionIv: ivHex,
                    bidSalt: bidSalt,
                }),
            });
            let data;
            try {
                data = await res.json();
            } catch (e) {
                const text = await res.text();
                throw new Error("Server error: " + text);
            }
            if (res.ok) {
                setSubmittedSealed(true);
            } else {
                alert(data.message || "Gagal submit bid");
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Terjadi kesalahan saat menghubungi server");
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
                myBid.encryptedPayload.encryptedPayload,
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
        } catch (err: any) {
            console.error("Reveal Error:", err);
            setRevealResult({
                isValid: false,
                decryptedPayload: null,
                message: "INVALID! Gagal dekripsi — " + (err.message || "Secret/PIN salah!"),
            });
        } finally {
            setRevealing(false);
        }
    };

    const handleFinalizeWinner = async () => {
        if (!scoredBids || scoredBids.length === 0) {
            alert("Belum ada bid yang valid untuk dinilai.");
            return;
        }

        const winner = scoredBids[0]; // Already sorted by totalScore descending
        if (winner.totalScore === 0) {
            alert("Harap lengkapi perhitungan skor terlebih dahulu.");
            return;
        }

        if (!confirm(`Anda yakin ingin menetapkan ${winner.organization.name} sebagai pemenang dengan skor ${winner.totalScore.toFixed(2)}?\n\nTindakan ini akan mengunci hasil ke dalam Smart Contract dan tidak bisa dibatalkan!`)) {
            return;
        }

        setIsFinalizing(true);
        try {
            const payload = {
                winningBidId: winner.id,
                finalScore: winner.totalScore,
                bids: scoredBids.map((b: any) => ({
                    bidId: b.id,
                    totalScore: b.totalScore,
                    criteriaScores: b.criteriaScores.map((cs: any) => ({
                        criterionId: cs.criteriaId,
                        rawScore: cs.rawScore,
                        weightedScore: cs.weightedScore
                    }))
                }))
            };

            const res = await fetch(`/api/tenders/${tenderId}/finalize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message || "Tender berhasil diselesaikan!");
                window.location.reload();
            } else {
                alert(data.message || "Gagal memproses finalisasi tender.");
            }
        } catch (err: any) {
            alert("Terjadi kesalahan jaringan: " + err.message);
        } finally {
            setIsFinalizing(false);
        }
    };

    // --- Scoring Engine Logic ---
    const scoredBids = useMemo(() => {
        const validBids = allBids.filter(b => b.status === "REVEALED_VALID");
        if (!validBids.length || !tender?.criteria) return [];

        return validBids.map(bid => {
            let totalScore = 0;
            const payload = bid.reveal?.revealedPayload || {};
            
            const criteriaScores = tender.criteria!.map((c: any) => {
                let score = 0;
                
                // Match criteria to the correct field key
                const relatedField = tender.fields?.find((f: any) => f.name === c.name);
                // Simple slugify just in case it doesn't match
                const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
                const fieldKey = relatedField?.key || slugify(c.name);
                
                const valStr = String(payload[fieldKey] || "0").replace(/[^0-9.-]+/g, "");
                const val = Number(valStr);

                if (c.scoringType === "MANUAL") {
                    score = manualScores[bid.id]?.[c.id] || 0;
                    score = Math.min(Math.max(score, 0), Number(c.maxScore));
                } else if (c.scoringType === "LOWEST_PRICE") {
                    const allVals = validBids.map(b => {
                        const bPayload = b.reveal?.revealedPayload || {};
                        const vStr = String(bPayload[fieldKey] || "0").replace(/[^0-9.-]+/g, "");
                        return Number(vStr);
                    }).filter(v => v > 0);
                    const minVal = allVals.length ? Math.min(...allVals) : 0;
                    if (val > 0 && minVal > 0) {
                        score = (minVal / val) * Number(c.maxScore);
                    }
                } else if (c.scoringType === "HIGHEST_VALUE") {
                    const allVals = validBids.map(b => {
                        const bPayload = b.reveal?.revealedPayload || {};
                        const vStr = String(bPayload[fieldKey] || "0").replace(/[^0-9.-]+/g, "");
                        return Number(vStr);
                    }).filter(v => v > 0);
                    const maxVal = allVals.length ? Math.max(...allVals) : 0;
                    if (val > 0 && maxVal > 0) {
                        score = (val / maxVal) * Number(c.maxScore);
                    }
                }

                // Bobot proporsional (e.g., 40.00 = 40%)
                const weightedScore = score * (Number(c.weight) / 100);
                totalScore += weightedScore;

                return {
                    criteriaId: c.id,
                    rawScore: score,
                    weightedScore
                };
            });

            return {
                ...bid,
                totalScore,
                criteriaScores
            };
        }).sort((a, b) => b.totalScore - a.totalScore); // Ranking highest first
    }, [allBids, tender, manualScores]);

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
                        
                        {isCreator && tender.status === 'DRAFT' && (
                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    onClick={async () => {
                                        if (!confirm("Anda yakin ingin mempublikasikan Tender ini ke Blockchain? Aksi ini tidak dapat dibatalkan!")) return;
                                        try {
                                            const res = await fetch(`/api/tenders/${tender.id}/status`, {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ status: "OPEN" })
                                            });
                                            if (res.ok) {
                                                alert("Tender berhasil dibuka dan didaftarkan ke Blockchain!");
                                                window.location.reload();
                                            } else {
                                                const err = await res.json();
                                                alert(err.message || "Gagal mengubah status tender");
                                            }
                                        } catch (e: any) {
                                            alert("Error jaringan: " + e.message);
                                        }
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-4 h-4" /> Publikasikan ke Blockchain (Set OPEN)
                                </button>
                                <span className="text-[10px] text-slate-500 max-w-xs">Setelah dipublikasikan, tender tidak dapat diubah dan vendor dapat mulai mengirim Sealed Bid.</span>
                            </div>
                        )}
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
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <Lock className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white leading-tight">Data Penawaran (Bid)</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Isi data sesuai kriteria tender. Data akan otomatis dienkripsi sebelum dikirim.</p>
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
                                    {f.type.toLowerCase() === 'textarea' ? (
                                        <textarea
                                            value={formData[f.key] || ""}
                                            onChange={(e) => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                            rows={3}
                                        />
                                    ) : f.type.toLowerCase() === 'file' ? (
                                        <div>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.png"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 20 * 1024 * 1024) {
                                                            alert("Maaf, ukuran file maksimal 20MB.");
                                                            e.target.value = '';
                                                            return;
                                                        }
                                                        setFormData(p => ({ ...p, [f.key]: file }));
                                                    } else {
                                                        setFormData(p => ({ ...p, [f.key]: "" }));
                                                    }
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
                                            />
                                            {formData[f.key] && formData[f.key] instanceof File && (
                                                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> File siap dienkripsi & diunggah secara Zero-Knowledge
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <input
                                            type={f.type.toLowerCase() === 'number' || f.type.toLowerCase() === 'currency' ? 'text' : 'text'}
                                            inputMode={f.type.toLowerCase() === 'number' || f.type.toLowerCase() === 'currency' ? 'numeric' : 'text'}
                                            value={formData[f.key] || ""}
                                            onChange={(e) => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                                            placeholder={f.type.toLowerCase() === 'currency' ? 'Hanya masukkan angka (contoh: 15000000)' : ''}
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
                        
                        {!submittedSealed ? (
                            <button
                                onClick={handleSubmitBid}
                                disabled={submittingBid || userOrgs.length === 0}
                                className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingBid ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Mengenkripsi & Mengirim ke Blockchain...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-5 h-5" /> 
                                        Enkripsi Otomatis & Submit Sealed Bid
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="mt-6 w-full py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> Sealed Bid Berhasil Disubmit ke Blockchain!
                            </div>
                        )}
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
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-400" /> Scoring Engine (Hybrid)
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">Bandingkan dan beri nilai penawaran yang sudah terenkripsi & diverifikasi.</p>
                            </div>
                            <button 
                                onClick={handleFinalizeWinner}
                                disabled={isFinalizing || tender.status === 'COMPLETED'}
                                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-900/50 flex items-center justify-center gap-2">
                                {isFinalizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} 
                                {tender.status === 'COMPLETED' ? 'Tender Selesai' : 'Finalize Pemenang (On-Chain)'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scoredBids.map((bid: any) => {
                                const payload = bid.reveal?.revealedPayload || {};
                                return (
                                    <div key={bid.id} className={`bg-slate-900 border ${bid.totalScore > 0 ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800'} rounded-xl overflow-hidden flex flex-col transition-all duration-300`}>
                                        <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                                            <span className="font-bold text-slate-200">{bid.organization?.name}</span>
                                            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">
                                                REVEALED_VALID
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-4 flex-1">
                                            {tender.fields?.map((f: any) => (
                                                <div key={f.key} className="space-y-1">
                                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{f.name}</span>
                                                    {f.type.toLowerCase() === 'file' ? (
                                                        <div>
                                                            {payload[f.key] ? (
                                                                payload[f.key].includes("_isEncryptedFile") ? (
                                                                    <button onClick={() => handleDownloadEncryptedFile(payload[f.key])} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                                                        <Lock className="w-3.5 h-3.5" /> Buka Kriptografi & Unduh
                                                                    </button>
                                                                ) : (
                                                                    <a href={payload[f.key]} download={`${f.name}-${bid.organization?.name}`} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                                                        <UploadCloud className="w-3.5 h-3.5" /> Unduh Lampiran
                                                                    </a>
                                                                )
                                                            ) : (
                                                                <span className="text-xs text-slate-500">Tidak ada file</span>
                                                            )}
                                                        </div>
                                                    ) : f.type.toLowerCase() === 'currency' ? (
                                                        <p className="text-sm font-bold text-slate-200">Rp {Number(payload[f.key] || 0).toLocaleString('id-ID')}</p>
                                                    ) : (
                                                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{payload[f.key] || "-"}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 border-t border-slate-800 bg-slate-950">
                                            <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Kalkulasi Skor</h4>
                                            <div className="space-y-3">
                                                {tender.criteria?.map((c: any) => {
                                                    const isManual = c.scoringType === 'MANUAL';
                                                    const criteriaScore = bid.criteriaScores?.find((s: any) => s.criteriaId === c.id);
                                                    return (
                                                        <div key={c.id} className="flex justify-between items-center group">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-slate-400">{c.name}</span>
                                                                <span className="text-[10px] text-slate-500">Bobot: {c.weight}% {criteriaScore ? `(Nilai: ${criteriaScore.weightedScore.toFixed(2)})` : ''}</span>
                                                            </div>
                                                            {isManual ? (
                                                                <input 
                                                                    type="number" 
                                                                    value={manualScores[bid.id]?.[c.id] || ''}
                                                                    onChange={(e) => handleManualScoreChange(bid.id, c.id, e.target.value, Number(c.maxScore))}
                                                                    placeholder={`Max ${c.maxScore}`} 
                                                                    className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-700 text-amber-400 text-xs rounded-md text-right focus:border-amber-500 focus:bg-slate-800 outline-none transition-colors" 
                                                                />
                                                            ) : (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">Auto</span>
                                                                    <span className="text-[10px] text-amber-500 mt-1 font-mono">Skor: {criteriaScore?.rawScore.toFixed(1) || '0.0'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                                                <span className="text-sm font-bold text-white">Total Skor</span>
                                                <span className={`text-2xl font-extrabold ${bid.totalScore > 80 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'text-slate-300'}`}>
                                                    {bid.totalScore.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {allBids.filter(b => b.status === "REVEALED_VALID").length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="font-semibold text-slate-400">Belum Ada Penawaran Terbuka</p>
                                    <p className="text-xs mt-1">Vendor harus melakukan Commit-Reveal terlebih dahulu agar bisa dinilai.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* TAB 5: AUDIT */}
            {activeTab === "audit" && (
                <div className="space-y-6">
                    {tender.status !== "COMPLETED" ? (
                        <div className="glass-panel p-6 rounded-2xl border-slate-800/80">
                            <p className="text-slate-400 text-center py-12 flex flex-col items-center justify-center">
                                <Lock className="w-12 h-12 text-slate-500/50 mb-4" />
                                Transparansi / Log Audit belum tersedia.<br/>
                                <span className="text-sm mt-2">Data ini hanya akan dibuka ke publik setelah tender berstatus COMPLETED.</span>
                            </p>
                        </div>
                    ) : loadingAuditData ? (
                        <div className="glass-panel p-6 rounded-2xl border-slate-800/80 flex items-center justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : auditData ? (
                        <div className="space-y-6">
                            {/* Winner Card */}
                            <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                                        <Award className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-emerald-400 font-bold text-sm tracking-wider uppercase mb-1">Pemenang Tender</h3>
                                        <p className="text-2xl font-bold text-white mb-2">
                                            {auditData.bids.find((b: any) => b.id === auditData.result?.winningBidId)?.organization?.name || "Unknown"}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-xs font-mono">
                                            <span className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-300">
                                                Skor Akhir: <span className="font-bold text-white">{Number(auditData.result?.finalScore).toFixed(2)}</span>
                                            </span>
                                            <span className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                                                <Layers className="w-3 h-3" /> TxHash: <span className="text-slate-400 truncate max-w-[200px]">{auditData.transaction?.txHash}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transparent Bids Breakdown */}
                            <h3 className="text-lg font-bold text-white mb-4 mt-8 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-cyan-400" /> Transparansi Proposal & Penilaian
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                {auditData.bids.map((bid: any) => {
                                    const payload = bid.reveal?.revealedPayload || {};
                                    const scoresForBid = auditData.scores.filter((s: any) => s.bidId === bid.id);
                                    const isWinner = auditData.result?.winningBidId === bid.id;
                                    
                                    return (
                                        <div key={bid.id} className={`bg-slate-900/50 border ${isWinner ? 'border-emerald-500/30' : 'border-slate-800'} rounded-xl overflow-hidden`}>
                                            <div className={`p-4 border-b ${isWinner ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-slate-800/30 border-slate-800'} flex justify-between items-center`}>
                                                <div>
                                                    <span className="font-bold text-slate-200 text-lg">{bid.organization?.name}</span>
                                                    {isWinner && <span className="ml-3 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md uppercase">Pemenang</span>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-slate-500 block mb-1">Total Skor</span>
                                                    <span className={`text-xl font-bold ${isWinner ? 'text-emerald-400' : 'text-white'}`}>
                                                        {scoresForBid.reduce((acc: number, curr: any) => acc + Number(curr.weightedScore), 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Left: Original Proposal */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-800">Proposal Penawaran (Asli)</h4>
                                                    <div className="space-y-3">
                                                        {tender.fields?.map((f: any) => (
                                                            <div key={f.key} className="bg-slate-900 rounded-lg p-3 border border-slate-800/50">
                                                                <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">{f.name}</span>
                                                                {f.type.toLowerCase() === 'file' ? (
                                                                    payload[f.key] ? (
                                                                        payload[f.key].includes("_isEncryptedFile") ? (
                                                                            <button onClick={() => handleDownloadEncryptedFile(payload[f.key])} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                                                                <Lock className="w-4 h-4" /> Buka Kriptografi & Unduh
                                                                            </button>
                                                                        ) : (
                                                                            <a href={payload[f.key]} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                                                                <FileCode2 className="w-4 h-4" /> Lihat Dokumen
                                                                            </a>
                                                                        )
                                                                    ) : <span className="text-sm text-slate-500">-</span>
                                                                ) : f.type.toLowerCase() === 'currency' ? (
                                                                    <span className="text-sm font-bold text-white">Rp {Number(payload[f.key] || 0).toLocaleString('id-ID')}</span>
                                                                ) : (
                                                                    <span className="text-sm text-slate-300">{payload[f.key] || '-'}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {/* Right: Score Breakdown */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-800">Rincian Penilaian Panitia</h4>
                                                    <div className="space-y-3">
                                                        {tender.criteria?.map((c: any) => {
                                                            const sc = scoresForBid.find((s: any) => s.criterionId === c.id);
                                                            return (
                                                                <div key={c.id} className="bg-slate-900 rounded-lg p-3 border border-slate-800/50 flex justify-between items-center">
                                                                    <div>
                                                                        <span className="text-xs font-bold text-slate-300 block">{c.name} <span className="text-slate-500 font-normal">({c.weight}%)</span></span>
                                                                        <span className="text-[10px] text-slate-500">Nilai Mentah: {sc ? Number(sc.rawScore).toFixed(1) : '0'}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-sm font-bold text-amber-400">{sc ? Number(sc.weightedScore).toFixed(2) : '0.00'}</span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel p-6 rounded-2xl border-slate-800/80 text-center">
                            <p className="text-slate-400">Gagal memuat data audit.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
