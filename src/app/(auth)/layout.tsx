import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login — TenderSeal",
    description: "Masuk ke platform pengadaan digital TenderSeal yang aman dan terenkripsi.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
