import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import SmoothScroll from "@/components/smooth-scroll";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
    title: "TenderSeal | Cryptographic E-Procurement",
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
                className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-[var(--background)] text-[var(--text-primary)] min-h-screen antialiased selection:bg-[var(--accent)] selection:text-white`}
            >
                <SmoothScroll>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-1 w-full flex flex-col">{children}</main>
                        <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-tertiary)]">
                            <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-display font-semibold text-[var(--text-primary)]">TenderSeal</span>
                                    <span>© 2026</span>
                                </div>
                                <div className="flex items-center gap-4 text-[var(--text-tertiary)]">
                                    <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Security Protocol</span>
                                    <span>·</span>
                                    <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Audit Logs</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </SmoothScroll>
            </body>
        </html>
    );
}
