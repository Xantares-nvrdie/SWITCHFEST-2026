import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/context/demo-context";
import Navbar from "@/components/navbar";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "TenderSeal — Secure Sealed Tendering Platform",
    description:
        "Client-side Encryption, Commit-Reveal, Smart Contract & Audit Trail for Trusted Digital Procurement (SDG 16 & SDG 9).",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${inter.variable} font-sans bg-[#090d16] text-slate-100 min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-200`}
            >
                <DemoProvider>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
                        <footer className="border-t border-slate-800/60 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
                            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p>© 2026 TenderSeal — Secure Sealed Tendering Platform</p>
                                <div className="flex items-center gap-4 text-slate-400 font-medium">
                                    <span>SDG 16 (Peace, Justice & Strong Institutions)</span>
                                    <span>•</span>
                                    <span>SDG 9 (Innovation & Infrastructure)</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </DemoProvider>
            </body>
        </html>
    );
}
