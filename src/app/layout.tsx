import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "TenderSeal — Secure Sealed Tendering Platform",
    description:
        "Client-side AES-GCM Encryption, Commit-Reveal Scheme, Smart Contract & full Audit Trail for trusted digital procurement. SDG 16 & SDG 9.",
    keywords: ["tender", "procurement", "blockchain", "encryption", "commit-reveal", "smart contract"],
    openGraph: {
        title: "TenderSeal — Secure Sealed Tendering",
        description: "Zero-knowledge sealed procurement with cryptographic audit trail.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" className="dark">
            <body className={`${inter.variable} font-sans min-h-screen antialiased`}>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 max-w-7xl w-full mx-auto px-5 py-8">
                        {children}
                    </main>
                    <footer
                        className="py-5 mt-4"
                        style={{ borderTop: "1px solid rgba(99,115,138,.1)" }}
                    >
                        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs" style={{ color: "#484f58" }}>
                                © 2026 TenderSeal · Secure Sealed Procurement
                            </p>
                            <div className="flex items-center gap-4" style={{ color: "#484f58", fontSize: 11 }}>
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: "#3fb950" }}
                                    />
                                    SDG 16 · Peace & Justice
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: "#58a6ff" }}
                                    />
                                    SDG 9 · Innovation
                                </span>
                            </div>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
