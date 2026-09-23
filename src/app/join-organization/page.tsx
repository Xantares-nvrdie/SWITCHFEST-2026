"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
    Key,
    ArrowRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Building2,
} from "lucide-react";
import Link from "next/link";

export default function JoinOrganizationPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ orgName: string; role: string } | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/invites/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim().toUpperCase() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message ?? "Gagal bergabung dengan organisasi.");
                setIsLoading(false);
                return;
            }

            setSuccess({ orgName: data.data.organizationName, role: data.data.role });
            setTimeout(() => {
                router.push("/organizations");
                router.refresh();
            }, 2000);
        } catch {
            setError("Kesalahan jaringan. Periksa koneksi Anda.");
            setIsLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all";

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="card p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                            <Key className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">Gabung Organisasi</h1>
                            <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                                Masukkan kode undangan dari Admin organisasi Anda
                            </p>
                        </div>
                    </div>

                    {/* Success state */}
                    {success ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-[var(--text-primary)] font-semibold text-[16px]">{success.orgName}</p>
                                <p className="text-[var(--text-secondary)] text-[13px] mt-1">
                                    Bergabung sebagai <span className="font-semibold text-[var(--accent)]">{success.role.replace("_", " ")}</span>
                                </p>
                            </div>
                            <p className="text-[12px] text-[var(--text-tertiary)]">Mengarahkan...</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[13px] bg-red-50 border border-red-100 text-red-700">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleJoin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="invite-code" className="block text-[13px] font-medium text-[var(--text-secondary)]">
                                        Kode Undangan
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                                        <input
                                            id="invite-code"
                                            type="text"
                                            required
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                                            placeholder="TS-XXXXXX"
                                            className={`${inputClass} font-mono font-bold tracking-widest text-blue-700 uppercase`}
                                        />
                                    </div>
                                </div>

                                <button
                                    id="join-org-submit"
                                    type="submit"
                                    disabled={isLoading || !code.trim()}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--text-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Gabung Organisasi
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-[var(--border)]" />
                                <span className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wide">atau</span>
                                <div className="flex-1 h-px bg-[var(--border)]" />
                            </div>

                            <p className="text-center text-[13px] text-[var(--text-secondary)]">
                                Tidak punya kode undangan?{" "}
                                <Link href="/setup-organization"
                                    className="font-semibold text-blue-600 hover:underline">
                                    Buat organisasi baru
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
