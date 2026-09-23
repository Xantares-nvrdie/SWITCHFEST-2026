import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "TenderSeal",
    description: "Masuk atau buat akun TenderSeal untuk mengakses pengadaan digital terenkripsi.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            {children}
        </div>
    );
}
