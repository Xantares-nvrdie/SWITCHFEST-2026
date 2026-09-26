"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Phone, Send, Clock, AlertCircle, Loader2 } from "lucide-react";

export default function SupportPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get("fullName"),
            email: formData.get("email"),
            category: formData.get("category"),
            message: formData.get("message"),
        };

        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Gagal mengirim tiket");
            }
            
            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 pt-4 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="font-display text-[40px] font-bold text-[var(--text-primary)] tracking-tight">Support Center</h1>
                <p className="text-[16px] text-[var(--text-secondary)] mt-1 max-w-2xl">
                    Tim kami siap membantu Anda menyelesaikan masalah teknis, kendala verifikasi, atau jika Anda lupa PIN.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bento-card p-8">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                            <Send className="w-5 h-5 text-[var(--accent)]" /> Kirim Tiket Bantuan
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {success && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
                                    Tiket bantuan Anda berhasil dikirim! Tim kami akan membalas melalui email Anda secepatnya.
                                </div>
                            )}
                            {errorMsg && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-[var(--text-secondary)]">Nama Lengkap</label>
                                    <input name="fullName" required type="text" placeholder="Masukkan nama Anda" className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-[var(--text-secondary)]">Alamat Email</label>
                                    <input name="email" required type="email" placeholder="email@organisasi.com" className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-medium text-[var(--text-secondary)]">Kategori Kendala</label>
                                <select name="category" required className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer appearance-none">
                                    <option>Sistem error</option>
                                    <option>Lupa PIN / Tidak bisa buka penawaran</option>
                                    <option>Verifikasi organisasi belum diproses</option>
                                    <option>Laporan bug keamanan</option>
                                    <option>Pertanyaan lainnya</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-medium text-[var(--text-secondary)]">Pesan Detail</label>
                                <textarea name="message" required rows={5} placeholder="Jelaskan kendala Anda secara rinci..." className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"></textarea>
                            </div>

                            <div className="pt-2">
                                <button disabled={loading} type="submit" className="w-full md:w-auto px-8 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--background)] font-bold text-[14px] shadow-md shadow-[var(--border)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                                    {loading ? "Mengirim..." : "Kirim Tiket"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Column */}
                <div className="space-y-6">
                    <div className="bento-card p-6 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent)]/10 blur-[40px] rounded-full group-hover:bg-[var(--accent)]/20 transition-all pointer-events-none" />
                        
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2 relative z-10">
                            <MessageSquare className="w-5 h-5 text-[var(--accent)]" /> Kontak Langsung
                        </h3>

                        <div className="space-y-4 relative z-10">
                            <a href="#" className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface)] transition-colors group/link">
                                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/30 shrink-0">
                                    <Mail className="w-5 h-5 text-[var(--accent)]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Email Support</p>
                                    <p className="text-[14px] font-semibold text-[var(--text-primary)] group-hover/link:text-[var(--accent)] transition-colors">support@tenderseal.id</p>
                                </div>
                            </a>

                            <a href="#" className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface)] transition-colors group/link">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/30 shrink-0">
                                    <Phone className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">WhatsApp Enterprise</p>
                                    <p className="text-[14px] font-semibold text-[var(--text-primary)] group-hover/link:text-blue-500 transition-colors">+62 811 2233 4455</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="bento-card p-6 border-[var(--border)]">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[var(--text-secondary)]" /> Jam Operasional
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[13px]">
                                <span className="text-[var(--text-secondary)] font-medium">Senin - Jumat</span>
                                <span className="text-[var(--text-primary)] font-bold font-mono">08:00 - 17:00</span>
                            </div>
                            <div className="flex items-center justify-between text-[13px] pt-3 border-t border-[var(--border-light)]">
                                <span className="text-[var(--text-secondary)] font-medium">Sabtu - Minggu</span>
                                <span className="text-[var(--text-tertiary)] font-bold opacity-50 tracking-wider">TUTUP</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[12px] flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="leading-relaxed font-medium">
                            Jika Anda lupa PIN, Anda perlu melampirkan surat permohonan reset PIN yang dicap resmi oleh organisasi Anda.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
