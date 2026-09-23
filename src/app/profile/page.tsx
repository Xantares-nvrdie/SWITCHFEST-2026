"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Save, User, Link as LinkIcon, Trash2, Loader2, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [walletAddress, setWalletAddress] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setImage(session.user.image || "");
            
            // Fetch wallet address
            fetch("/api/profile/wallet")
                .then((r) => r.json())
                .then((data) => {
                    if (data.walletAddress) {
                        setWalletAddress(data.walletAddress);
                    }
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [session]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--text-tertiary)]" />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center text-[var(--text-secondary)]">
                Harap masuk untuk melihat profil Anda.
            </div>
        );
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update auth data
            await authClient.updateUser({
                name,
                image: image || undefined,
            });

            // Update wallet data
            await fetch("/api/profile/wallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress }),
            });

            // Trigger hard reload to refresh navbar session context
            window.location.reload();
        } catch (e) {
            console.error("Failed to save profile", e);
            alert("Gagal menyimpan profil.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await authClient.deleteUser();
            router.push("/login");
        } catch (e) {
            console.error("Failed to delete account", e);
            alert("Gagal menghapus akun.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 space-y-8 animate-fade-in">
            <div className="space-y-1">
                <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
                    Profil Saya
                </h1>
                <p className="text-[15px] text-[var(--text-secondary)]">
                    Kelola informasi pribadi dan identitas Web3 Anda.
                </p>
            </div>

            <div className="card p-6 md:p-8 space-y-8">
                {/* Avatar Preview Section */}
                <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--surface-secondary)] border-2 border-[var(--border)] flex items-center justify-center shrink-0">
                        {image ? (
                            <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-[var(--text-tertiary)] uppercase">
                                {name.substring(0, 2) || "U"}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-[17px] text-[var(--text-primary)]">Avatar</h3>
                        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                            Foto akan muncul di log audit dan diskusi.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-[var(--text-primary)]">Email (Tidak bisa diubah)</label>
                        <input
                            type="text"
                            value={session.user.email}
                            disabled
                            className="w-full px-3 py-2.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[14px] text-[var(--text-secondary)] cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-[var(--text-primary)]">Nama Tampilan</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-tertiary)]" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[14px] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all outline-none"
                                placeholder="Nama Anda"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-[var(--text-primary)]">URL Gambar Profil (Opsional)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-tertiary)]" />
                            <input
                                type="text"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[14px] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all outline-none"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-[var(--border)]" />

                <div className="grid gap-6">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-[17px] text-[var(--text-primary)]">Koneksi Blockchain</h3>
                        <p className="text-[13px] text-[var(--text-secondary)]">Tautkan alamat EVM untuk berinteraksi dengan Smart Contract.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-[var(--text-primary)]">EVM Wallet Address (Opsional)</label>
                        <input
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[14px] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] font-mono transition-all outline-none"
                            placeholder="0x..."
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !name}
                        className="px-6 py-2.5 bg-[var(--accent)] text-white text-[14px] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Simpan Perubahan
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card border-red-200 p-6 md:p-8 space-y-6">
                <div className="space-y-1">
                    <h3 className="font-semibold text-[17px] text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Zona Bahaya
                    </h3>
                    <p className="text-[13px] text-[var(--text-secondary)]">
                        Tindakan di area ini tidak dapat dibatalkan.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[14px] font-medium text-[var(--text-primary)]">Hapus Akun Permanen</p>
                        <p className="text-[13px] text-[var(--text-secondary)]">
                            Semua data Anda, termasuk riwayat tender, akan dihapus.
                        </p>
                    </div>
                    {showDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-[var(--border)] rounded-lg text-[13px] hover:bg-[var(--surface-secondary)]"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-[13px] hover:bg-red-700 flex items-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Ya, Hapus!
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-[13px] font-medium hover:bg-red-50 transition-colors"
                        >
                            Hapus Akun
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
