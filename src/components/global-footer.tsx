"use client";

import { usePathname } from "next/navigation";

export default function GlobalFooter() {
    const pathname = usePathname();

    return (
        <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-tertiary)]">
            <div className="max-w-[1920px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-[var(--text-primary)]">TenderSeal</span>
                    <span>© {new Date().getFullYear()}</span>
                </div>
                {pathname !== "/" && (
                    <div className="flex items-center gap-4 text-[var(--text-tertiary)]">
                        <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                            Jangan lupa bahagia
                        </span>
                        <span>·</span>
                        <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                            Indonesia lebih baik
                        </span>
                    </div>
                )}
            </div>
        </footer>
    );
}
