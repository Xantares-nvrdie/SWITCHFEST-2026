import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import SmoothScroll from "@/components/smooth-scroll";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "TenderSeal",
    description:
        "Platform pengadaan digital terenkripsi dengan Commit-Reveal Scheme dan Smart Contract Audit Trail.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" className="scroll-smooth">
            <body
                className={`${inter.variable} font-sans bg-[var(--background)] text-[var(--text-primary)] min-h-screen antialiased selection:bg-teal-100 selection:text-teal-900`}
            >
                <SmoothScroll>
                    <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</main>
                            <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--text-tertiary)]">
                                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <p>© 2026 TenderSeal</p>
                                    <div className="flex items-center gap-3 text-[var(--text-tertiary)]">
                                        <span>SDG 16</span>
                                        <span>·</span>
                                        <span>SDG 9</span>
                                    </div>
                                </div>
                            </footer>
                        </div>
                </SmoothScroll>
            </body>
        </html>
    );
}
