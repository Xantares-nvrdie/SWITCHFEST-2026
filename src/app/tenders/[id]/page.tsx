"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
    calculateCommitmentHash,
    decryptBidPayload,
    deriveKdfKey,
    encryptBidPayload,
    generateSalt,
} from "@/lib/crypto";
import {
    connectMetaMask,
    formatWalletAddress,
    signCommitmentOnChain,
} from "@/lib/web3";
import {
    ShieldCheck, Lock, KeyRound, FileCode2, CheckCircle2, XCircle,
    Building2, Layers, Award, History, ArrowLeft, Cpu, Eye, Check,
    Wallet, Copy, ExternalLink, Trophy, Loader2, Inbox, AlertCircle,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────── */
interface TenderField { id: string; name: string; key: string; type: string; required: boolean; }
interface TenderCriterion { id: string; name: string; weight: string; description?: string | null; }
interface TenderData {
    id: string; code: string; title: string; description: string | null;
    category: string | null; status: string; organizationId: string;
    commitDeadline: string; revealWindowHours: number;
    organization?: { name: string } | null;
    fields: TenderField[];
    criteria: TenderCriterion[];
    participants: Array<{ id: string; organizationId: string; organization?: { name: string } | null }>;
}

/* ─── Tab config ───────────────────────────────────────────────── */
type TabId = "overview" | "encrypt" | "reveal" | "scoring" | "audit";
const TABS: { id: TabId; label: string; icon: React.ElementType; activeClass: string }[] = [
    { id: "overview", label: "Detail Tender",          icon: Layers,   activeClass: "active"         },
    { id: "encrypt",  label: "Encrypt & Submit Bid",   icon: Lock,     activeClass: "active-cyan"    },
    { id: "reveal",   label: "Commit-Reveal Verify",   icon: KeyRound, activeClass: "active-purple"  },
    { id: "scoring",  label: "Scoring & Pemenang",     icon: Award,    activeClass: "active-amber"   },
    { id: "audit",    label: "Audit & Blockchain Log", icon: History,  activeClass: "active-indigo"  },
];

const STATUS_CONFIG: Record<string, { badge: string; dot: string; label: string }> = {
    DRAFT:     { badge: "badge-slate",   dot: "bg-[#484f58]", label: "Draft"     },
    OPEN:      { badge: "badge-emerald", dot: "bg-[#3fb950]", label: "Open"      },
    CLOSED:    { badge: "badge-amber",   dot: "bg-[#e3b341]", label: "Closed"    },
    REVEAL:    { badge: "badge-cyan",    dot: "bg-[#58a6ff]", label: "Reveal"    },
    SCORING:   { badge: "badge-purple",  dot: "bg-[#bc8cff]", label: "Scoring"   },
    COMPLETED: { badge: "badge-slate",   dot: "bg-[#3fb950]", label: "Completed" },
    CANCELLED: { badge: "badge-red",     dot: "bg-[#f85149]", label: "Cancelled" },
};

/* ─── Helper ───────────────────────────────────────────────────── */
function CodeDisplay({ label, value, accent = "#8b949e" }: { label: string; value: string; accent?: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-label">{label}</span>
                <button
                    onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: copied ? "#3fb950" : "#484f58" }}
                >
                    <Copy style={{ width: 11, height: 11 }} />
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
            <div className="code-block" style={{ color: accent }}>{value}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════ */
export default function TenderDetailPage() {
    const params   = useParams();
    const tenderId = (params?.id as string) ?? "";
    const { data: session } = useSession();

    // Data
    const [tender, setTender]   = useState<TenderData | null>(null);
    const [tLoading, setTLoading] = useState(true);
    const [tError, setTError]   = useState<string | null>(null);

    // Wallet
    const [walletAddress, setWalletAddress]   = useState("");
    const [walletConnected, setWalletConnected] = useState(false);
    const [signingOnChain, setSigningOnChain] = useState(false);
    const [onChainTxHash, setOnChainTxHash]   = useState<string | null>(null);

    // Tabs
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    // Form — filled dynamically from tender fields
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [vendorSecret, setVendorSecret] = useState("");

    // Encryption
    const [encrypting, setEncrypting]   = useState(false);
    const [encResult, setEncResult]     = useState<{
        kdfSalt: string; bidSalt: string; ivHex: string;
        ciphertextHex: string; commitmentHash: string; payloadHash: string;
    } | null>(null);
    const [submitting, setSubmitting]   = useState(false);
    const [submittedSealed, setSubmittedSealed] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Reveal
    const [revealSecret, setRevealSecret]   = useState("");
    const [revealing, setRevealing]         = useState(false);
    const [revealResult, setRevealResult]   = useState<{    isValid: boolean; decryptedPayload: Record<string, unknown> | null; message: string } | null>(null);

    // Audit logs from API
    const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; description?: string | null; createdAt: string }>>([]);

    /* ─── Fetch tender from API ───────────────────────────────── */
    useEffect(() => {
        if (!tenderId) return;
        async function fetchTender() {
            setTLoading(true);
            try {
                const res = await fetch(`/api/tenders/${tenderId}`);
                if (!res.ok) { setTError(res.status === 404 ? "Tender tidak ditemukan." : `Error ${res.status}`); return; }
                const data: TenderData = await res.json();
                setTender(data);
                // Pre-fill form with empty values for each field
                const init: Record<string, string> = {};
                (data.fields ?? []).forEach((f) => { init[f.key] = ""; });
                setFormData(init);
            } catch (e) {
                setTError("Gagal memuat data tender.");
                console.error(e);
            } finally {
                setTLoading(false);
            }
        }
        fetchTender();
    }, [tenderId]);

    /* ─── Fetch tender audit logs ─────────────────────────────── */
    useEffect(() => {
        if (!tenderId) return;
        fetch(`/api/audit-logs/tender/${tenderId}`)
            .then((r) => r.ok ? r.json() : [])
            .then((data) => setAuditLogs(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, [tenderId]);

    /* ─── Handlers ───────────────────────────────────────────── */
    const handleEncrypt = async () => {
        if (!vendorSecret) return;
        setEncrypting(true);
        try {
            const kdfSalt = generateSalt(16);
            const bidSalt = generateSalt(16);
            const { key }  = await deriveKdfKey(vendorSecret, kdfSalt);
            const { ciphertextHex, ivHex, payloadHash } = await encryptBidPayload(formData, key);
            const commitmentHash = await calculateCommitmentHash(tenderId, session?.user?.id ?? "anonymous", formData, bidSalt);
            setEncResult({ kdfSalt, bidSalt, ivHex, ciphertextHex, commitmentHash, payloadHash });
        } catch (e) { console.error(e); }
        finally { setEncrypting(false); }
    };

    const handleSubmitSealed = async () => {
        if (!encResult || !session?.user?.id) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const body = {
                vendorUserId:   session.user.id,
                commitmentHash: encResult.commitmentHash,
                ciphertextHex:  encResult.ciphertextHex,
                kdfSalt:        encResult.kdfSalt,
                ivHex:          encResult.ivHex,
                payloadHash:    encResult.payloadHash,
                walletAddress:  walletAddress || undefined,
            };
            const res = await fetch(`/api/bids/tender/${tenderId}`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message ?? `HTTP ${res.status}`);
            }
            setSubmittedSealed(true);
        } catch (e: unknown) {
            setSubmitError(e instanceof Error ? e.message : "Gagal submit bid.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReveal = async () => {
        if (!encResult || !revealSecret) return;
        setRevealing(true);
        try {
            const { key } = await deriveKdfKey(revealSecret, encResult.kdfSalt);
            const decryptedPayload = await decryptBidPayload(encResult.ciphertextHex, encResult.ivHex, key);
            const computedHash = await calculateCommitmentHash(tenderId, session?.user?.id ?? "anonymous", decryptedPayload as Record<string, string>, encResult.bidSalt);
            const isValid = computedHash === encResult.commitmentHash;
            setRevealResult({
                isValid,
                decryptedPayload: decryptedPayload as Record<string, unknown>,
                message: isValid
                    ? "VALID — Commitment hash cocok 100% dengan data yang di-commit sebelum deadline."
                    : "INVALID — Secret/PIN salah atau data penawaran telah dimanipulasi!",
            });
        } catch {
            setRevealResult({ isValid: false, decryptedPayload: null, message: "INVALID — Gagal dekripsi. Secret/PIN salah." });
        } finally {
            setRevealing(false);
        }
    };

    const handleConnectMetaMask = async () => {
        try {
            const addr = await connectMetaMask();
            setWalletAddress(addr);
            setWalletConnected(true);
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Gagal terhubung ke MetaMask.");
        }
    };

    const handleSignOnChain = async () => {
        if (!encResult) return;
        setSigningOnChain(true);
        try {
            const res = await signCommitmentOnChain(tenderId, encResult.commitmentHash, walletAddress);
            setOnChainTxHash(res.txHash);
            setSubmittedSealed(true);
        } catch (e) { console.error(e); }
        finally { setSigningOnChain(false); }
    };

    /* ─── Loading / Error ─────────────────────────────────────── */
    if (tLoading) {
        return (
            <div className="flex items-center justify-center py-32 gap-3" style={{ color: "#484f58" }}>
                <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
                <span className="text-sm">Memuat data tender...</span>
            </div>
        );
    }

    if (tError || !tender) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                <AlertCircle style={{ width: 36, height: 36, color: "#f85149" }} />
                <p className="text-sm font-medium" style={{ color: "#e6edf3" }}>{tError ?? "Tender tidak ditemukan."}</p>
                <Link href="/tenders" className="btn btn-ghost btn-sm">← Kembali ke Daftar Tender</Link>
            </div>
        );
    }

    const sc = STATUS_CONFIG[tender.status] ?? STATUS_CONFIG.DRAFT;
    const deadline = new Date(tender.commitDeadline).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const isPast   = new Date(tender.commitDeadline) < new Date();

    /* ─── Render ──────────────────────────────────────────────── */
    return (
        <div className="space-y-6 pb-6 animate-fade-up">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <Link href="/tenders" className="flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: "#7d8590" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#e6edf3")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#7d8590")}
                >
                    <ArrowLeft style={{ width: 13, height: 13 }} />
                    Tender
                </Link>
                <span style={{ color: "#484f58", fontSize: 12 }}>/</span>
                <span className="tag-mono">{tender.code}</span>
            </div>

            {/* Tender Header */}
            <div className="p-6 rounded-xl space-y-4" style={{ background: "#0d1117", border: "1px solid rgba(99,115,138,.14)" }}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <span className={`badge ${sc.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {sc.label}
                            </span>
                            <span className="tag-mono">{tender.code}</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight" style={{ color: "#e6edf3" }}>{tender.title}</h1>
                        <p className="text-xs flex items-center gap-2" style={{ color: "#7d8590" }}>
                            <Building2 style={{ width: 12, height: 12 }} />
                            {tender.organization?.name ?? tender.organizationId ?? "Organisasi"}
                            {tender.category && <><span style={{ color: "#484f58" }}>·</span>{tender.category}</>}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* MetaMask */}
                        <button
                            onClick={handleConnectMetaMask}
                            className="btn btn-ghost btn-sm"
                            style={{
                                color: walletConnected ? "#e3b341" : "#7d8590",
                                background: walletConnected ? "rgba(227,179,65,.08)" : undefined,
                                borderColor: walletConnected ? "rgba(227,179,65,.3)" : undefined,
                            }}
                        >
                            <Wallet style={{ width: 13, height: 13, color: "#e3b341" }} />
                            {walletConnected ? formatWalletAddress(walletAddress) : "Hubungkan MetaMask"}
                        </button>

                        {/* Deadline */}
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{
                                background: isPast ? "rgba(99,115,138,.08)" : "rgba(227,179,65,.08)",
                                border: `1px solid ${isPast ? "rgba(99,115,138,.2)" : "rgba(227,179,65,.2)"}`,
                                color: isPast ? "#484f58" : "#e3b341",
                            }}
                        >
                            {isPast ? "Deadline Berakhir" : `Deadline: ${deadline}`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tab-list">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isAct = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-item ${isAct ? tab.activeClass : ""}`}>
                            <Icon style={{ width: 14, height: 14 }} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ══ TAB 1 — OVERVIEW ══ */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
                    <div className="lg:col-span-2 space-y-5">
                        {tender.description && (
                            <div className="surface p-5 space-y-3">
                                <h3 className="text-sm font-semibold" style={{ color: "#e6edf3" }}>Deskripsi Tender</h3>
                                <p className="text-sm leading-relaxed" style={{ color: "#7d8590" }}>{tender.description}</p>
                            </div>
                        )}

                        <div className="surface p-5 space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#e6edf3" }}>
                                <FileCode2 style={{ width: 14, height: 14, color: "#58a6ff" }} />
                                Dynamic Bid Fields ({tender.fields.length} aspek)
                            </h3>
                            {tender.fields.length === 0 ? (
                                <p className="text-xs" style={{ color: "#484f58" }}>Belum ada field yang didefinisikan.</p>
                            ) : (
                                <div className="space-y-2">
                                    {tender.fields.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "#06090f", border: "1px solid rgba(99,115,138,.1)" }}>
                                            <div className="flex items-center gap-2.5">
                                                {f.required && <span style={{ color: "#f85149", fontSize: 11, fontWeight: 700 }}>*</span>}
                                                <span className="text-sm font-medium" style={{ color: "#e6edf3" }}>{f.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="tag-mono">{f.key}</span>
                                                <span className="badge badge-cyan" style={{ fontSize: 10 }}>{f.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right — Criteria */}
                    <div className="space-y-5">
                        <div className="surface p-5 space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#e6edf3" }}>
                                <Award style={{ width: 14, height: 14, color: "#e3b341" }} />
                                Kriteria Penilaian
                            </h3>
                            {tender.criteria.length === 0 ? (
                                <p className="text-xs" style={{ color: "#484f58" }}>Belum ada kriteria penilaian.</p>
                            ) : (
                                <div className="space-y-3">
                                    {tender.criteria.map((c) => (
                                        <div key={c.id} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span style={{ color: "#8b949e" }}>{c.name}</span>
                                                <span className="font-bold tabular-nums" style={{ color: "#bc8cff" }}>{c.weight}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${Math.min(Number(c.weight), 100)}%`, background: "linear-gradient(90deg, #6e40c9, #bc8cff)" }} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between text-xs pt-1 font-bold" style={{ borderTop: "1px solid rgba(99,115,138,.12)", color: "#e6edf3" }}>
                                        <span>Total Bobot</span>
                                        <span style={{ color: tender.criteria.reduce((s, c) => s + Number(c.weight), 0) === 100 ? "#3fb950" : "#f85149" }}>
                                            {tender.criteria.reduce((s, c) => s + Number(c.weight), 0)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="surface p-5 space-y-3">
                            <h3 className="text-sm font-semibold" style={{ color: "#e6edf3" }}>Info Tender</h3>
                            {[
                                { label: "Reveal Window",  val: `${tender.revealWindowHours} jam` },
                                { label: "Peserta",        val: `${tender.participants.length} vendor` },
                                { label: "Status",         val: tender.status },
                            ].map(({ label, val }) => (
                                <div key={label} className="flex items-center justify-between text-xs">
                                    <span style={{ color: "#7d8590" }}>{label}</span>
                                    <span className="font-semibold" style={{ color: "#e6edf3" }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ TAB 2 — ENCRYPT & SUBMIT ══ */}
            {activeTab === "encrypt" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
                    <div className="surface p-5 space-y-5">
                        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#e6edf3", borderBottom: "1px solid rgba(99,115,138,.1)", paddingBottom: 12 }}>
                            <Lock style={{ width: 14, height: 14, color: "#58a6ff" }} />
                            Step 1 — Isi Penawaran Vendor
                        </h3>
                        <div>
                            <label className="form-label">Secret/PIN Enkripsi <span style={{ color: "#f85149" }}>*</span></label>
                            <input type="password" placeholder="PIN rahasia Anda (tidak dikirim ke server)" value={vendorSecret} onChange={(e) => setVendorSecret(e.target.value)} className="form-input" />
                            <p className="text-xs mt-1.5" style={{ color: "#484f58" }}>PIN digunakan sebagai KDF key untuk AES-GCM. Server tidak pernah melihat PIN ini.</p>
                        </div>

                        {tender.fields.length > 0 ? (
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold" style={{ color: "#7d8590" }}>Data Penawaran</h4>
                                {tender.fields.map((f) => (
                                    <div key={f.key}>
                                        <label className="form-label">
                                            {f.name}
                                            {f.required && <span style={{ color: "#f85149" }}> *</span>}
                                            <span className="tag-mono ml-2">{f.type}</span>
                                        </label>
                                        <input
                                            type={f.type === "number" || f.type === "currency" ? "number" : "text"}
                                            placeholder={f.type === "currency" ? "mis. 1150000000" : f.type === "number" ? "mis. 3" : `Isi ${f.name}...`}
                                            value={formData[f.key] ?? ""}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                            className="form-input"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs" style={{ color: "#484f58" }}>Tender ini belum mendefinisikan field penawaran.</p>
                        )}

                        <button onClick={handleEncrypt} disabled={encrypting || !vendorSecret} className="btn btn-primary w-full">
                            {encrypting ? (
                                <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />Mengenkripsi...</>
                            ) : (
                                <><Lock style={{ width: 14, height: 14 }} />Enkripsi Data (AES-GCM 256-bit)</>
                            )}
                        </button>
                    </div>

                    {/* Results */}
                    {encResult ? (
                        <div className="surface p-5 space-y-5">
                            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#e6edf3", borderBottom: "1px solid rgba(99,115,138,.1)", paddingBottom: 12 }}>
                                <ShieldCheck style={{ width: 14, height: 14, color: "#3fb950" }} />
                                Step 2 — Hasil Enkripsi
                            </h3>
                            <CodeDisplay label="Commitment Hash (SHA-256)" value={encResult.commitmentHash} accent="#3fb950" />
                            <CodeDisplay label="Ciphertext (AES-GCM 256-bit)" value={encResult.ciphertextHex.slice(0, 80) + "..."} accent="#58a6ff" />
                            <CodeDisplay label="KDF Salt (Argon2id)" value={encResult.kdfSalt} accent="#bc8cff" />
                            <CodeDisplay label="IV Hex" value={encResult.ivHex} />

                            {submitError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: "rgba(248,81,73,.08)", border: "1px solid rgba(248,81,73,.2)", color: "#f85149" }}>
                                    <AlertCircle style={{ width: 12, height: 12 }} />
                                    {submitError}
                                </div>
                            )}

                            {submittedSealed ? (
                                <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium" style={{ background: "rgba(63,185,80,.08)", border: "1px solid rgba(63,185,80,.22)", color: "#3fb950" }}>
                                    <CheckCircle2 style={{ width: 16, height: 16 }} />
                                    Sealed bid berhasil di-submit ke database!
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <button onClick={handleSubmitSealed} disabled={submitting || !session} className="btn btn-primary w-full">
                                        {submitting ? (
                                            <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />Mengirim ke DB...</>
                                        ) : (
                                            <><Check style={{ width: 14, height: 14 }} />Submit Sealed Bid ke Database</>
                                        )}
                                    </button>
                                    {walletConnected && (
                                        <button onClick={handleSignOnChain} disabled={signingOnChain} className="btn btn-ghost w-full" style={{ fontSize: 12 }}>
                                            {signingOnChain ? "Menunggu Konfirmasi MetaMask..." : "Sign On-Chain via MetaMask"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {onChainTxHash && (
                                <div className="space-y-1.5">
                                    <span className="text-label">On-Chain Transaction Hash</span>
                                    <div className="code-block flex items-center justify-between gap-2">
                                        <span style={{ color: "#e3b341" }}>{onChainTxHash}</span>
                                        <ExternalLink style={{ width: 12, height: 12, color: "#484f58", flexShrink: 0 }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="surface p-5 flex flex-col items-center justify-center gap-3 text-center" style={{ minHeight: 200 }}>
                            <Lock style={{ width: 28, height: 28, color: "#484f58", opacity: 0.4 }} />
                            <p className="text-xs" style={{ color: "#484f58" }}>Isi form di sebelah kiri dan klik Enkripsi untuk melihat hasil kriptografi di sini.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ══ TAB 3 — COMMIT-REVEAL VERIFY ══ */}
            {activeTab === "reveal" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
                    <div className="surface p-5 space-y-5">
                        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#e6edf3", borderBottom: "1px solid rgba(99,115,138,.1)", paddingBottom: 12 }}>
                            <KeyRound style={{ width: 14, height: 14, color: "#bc8cff" }} />
                            Commit-Reveal Verification
                        </h3>

                        {!encResult ? (
                            <div className="p-4 rounded-xl text-xs text-center" style={{ background: "rgba(227,179,65,.06)", border: "1px solid rgba(227,179,65,.18)", color: "#e3b341" }}>
                                Lakukan enkripsi di Tab "Encrypt & Submit Bid" terlebih dahulu.
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="form-label">Secret/PIN untuk Reveal</label>
                                    <input
                                        type="password"
                                        placeholder="Masukkan PIN yang sama saat enkripsi..."
                                        value={revealSecret}
                                        onChange={(e) => setRevealSecret(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <button onClick={handleReveal} disabled={revealing || !revealSecret} className="btn btn-primary w-full" style={{ background: "linear-gradient(135deg, #6e40c9, #9c5ff0)" }}>
                                    {revealing ? (
                                        <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />Memverifikasi...</>
                                    ) : (
                                        <><Eye style={{ width: 14, height: 14 }} />Decrypt & Verify Commitment Hash</>
                                    )}
                                </button>
                                <CodeDisplay label="Commitment Hash yang di-commit" value={encResult.commitmentHash} accent="#bc8cff" />
                            </>
                        )}
                    </div>

                    {revealResult && (
                        <div className="surface p-5 space-y-5">
                            <h3 className="text-sm font-semibold" style={{ color: "#e6edf3", borderBottom: "1px solid rgba(99,115,138,.1)", paddingBottom: 12 }}>Hasil Verifikasi</h3>
                            <div
                                className="flex items-start gap-3 p-4 rounded-xl"
                                style={{
                                    background: revealResult.isValid ? "rgba(63,185,80,.07)" : "rgba(248,81,73,.07)",
                                    border: `1px solid ${revealResult.isValid ? "rgba(63,185,80,.25)" : "rgba(248,81,73,.25)"}`,
                                }}
                            >
                                {revealResult.isValid
                                    ? <CheckCircle2 style={{ width: 20, height: 20, color: "#3fb950", flexShrink: 0 }} />
                                    : <XCircle style={{ width: 20, height: 20, color: "#f85149", flexShrink: 0 }} />}
                                <div>
                                    <p className="text-sm font-bold" style={{ color: revealResult.isValid ? "#3fb950" : "#f85149" }}>
                                        {revealResult.isValid ? "VALID — Integritas Terjamin" : "INVALID — Manipulasi Terdeteksi"}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: "#7d8590" }}>{revealResult.message}</p>
                                </div>
                            </div>

                            {revealResult.decryptedPayload && (
                                <div>
                                    <span className="text-label">Decrypted Payload</span>
                                    <div className="code-block mt-1.5" style={{ color: "#3fb950", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                                        {JSON.stringify(revealResult.decryptedPayload, null, 2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ══ TAB 4 — SCORING ══ */}
            {activeTab === "scoring" && (
                <div className="surface p-5 space-y-5 animate-fade-in">
                    <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#e6edf3", borderBottom: "1px solid rgba(99,115,138,.1)", paddingBottom: 12 }}>
                        <Award style={{ width: 14, height: 14, color: "#e3b341" }} />
                        Scoring & Penetapan Pemenang
                    </h3>
                    {tender.participants.length === 0 ? (
                        <div className="text-center py-12" style={{ color: "#484f58" }}>
                            <Inbox style={{ width: 28, height: 28, margin: "0 auto 10px", opacity: 0.4 }} />
                            <p className="text-sm">Belum ada vendor yang berpartisipasi dalam tender ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tender.participants.map((p, idx) => (
                                <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-lg" style={{ background: "#06090f", border: "1px solid rgba(99,115,138,.1)" }}>
                                    <span className="text-sm font-bold tabular-nums" style={{ color: "#484f58", width: 20 }}>#{idx + 1}</span>
                                    <span className="text-sm font-medium flex-1" style={{ color: "#e6edf3" }}>{p.organization?.name ?? `Vendor ${p.organizationId.slice(0, 8)}...`}</span>
                                    <span className="badge badge-slate text-xs">Terdaftar</span>
                                </div>
                            ))}
                            <p className="text-xs text-center" style={{ color: "#484f58" }}>
                                Scoring otomatis akan tersedia setelah fase Reveal selesai dan semua bid terverifikasi.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ══ TAB 5 — AUDIT ══ */}
            {activeTab === "audit" && (
                <div className="surface p-5 space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between" style={{ borderBottom: "1px solid rgba(99,115,138,.1)", paddingBottom: 12 }}>
                        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#e6edf3" }}>
                            <History style={{ width: 14, height: 14, color: "#818cf8" }} />
                            Audit Trail — Tender {tender.code}
                        </h3>
                        <span className="badge badge-slate">{auditLogs.length} event</span>
                    </div>

                    {auditLogs.length === 0 ? (
                        <div className="text-center py-10" style={{ color: "#484f58" }}>
                            <History style={{ width: 28, height: 28, margin: "0 auto 10px", opacity: 0.4 }} />
                            <p className="text-sm">Belum ada aktivitas yang tercatat untuk tender ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {auditLogs.map((log, idx) => (
                                <div key={log.id} className="flex gap-4 py-3.5" style={{ borderBottom: idx < auditLogs.length - 1 ? "1px solid rgba(99,115,138,.08)" : "none" }}>
                                    <div className="flex flex-col items-center pt-1 shrink-0">
                                        <div className="w-2 h-2 rounded-full" style={{ background: "#58a6ff" }} />
                                        {idx < auditLogs.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: "rgba(99,115,138,.12)", minHeight: 20 }} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-mono font-semibold" style={{ color: "#58a6ff" }}>{log.action}</span>
                                            <span className="text-xs font-mono" style={{ color: "#484f58" }}>
                                                {new Date(log.createdAt).toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                        {log.description && <p className="text-xs mt-0.5" style={{ color: "#7d8590" }}>{log.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Blockchain integrity note */}
                    <div className="flex items-center gap-2 p-3 rounded-xl text-xs" style={{ background: "rgba(63,185,80,.05)", border: "1px solid rgba(63,185,80,.12)", color: "#484f58" }}>
                        <ShieldCheck style={{ width: 12, height: 12, color: "#3fb950" }} />
                        Commitment hash on-chain dapat diverifikasi secara independen via Smart Contract yang di-deploy di blockchain.
                    </div>
                </div>
            )}
        </div>
    );
}
