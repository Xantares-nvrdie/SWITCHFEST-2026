import type { Metadata } from "next";
import { Inter, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import SmoothScroll from "@/components/smooth-scroll";
import GlobalFooter from "@/components/global-footer";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
        <html lang="id" className={cn("scroll-smooth", "font-sans", geist.variable)} suppressHydrationWarning>
            <body
                className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-[var(--background)] text-[var(--text-primary)] min-h-screen antialiased selection:bg-[var(--accent)] selection:text-white`}
            >
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <SmoothScroll>
                        <div className="flex flex-col min-h-screen">
                            <Navbar />
                            <main className="flex-1 w-full flex flex-col">{children}</main>
                            <GlobalFooter />
                        </div>
                    </SmoothScroll>
                </ThemeProvider>
            </body>
        </html>
    );
}
