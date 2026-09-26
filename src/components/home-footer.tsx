"use client";

import Link from "next/link";

export default function HomeFooter() {
    return (
        <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] pt-16 md:pt-24 pb-8 mt-16 relative z-10">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
                    
                    {/* Left: Giant Logo */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <h2 className="font-display text-[64px] md:text-[100px] lg:text-[120px] font-bold text-[var(--text-primary)] leading-[0.9] tracking-tighter">
                            Tender<br/>Seal.
                        </h2>
                        <div className="mt-16 text-[13px] text-[var(--text-tertiary)] font-medium">
                            &copy; {new Date().getFullYear()} TenderSeal
                        </div>
                    </div>

                    {/* Right: Columns */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12">
                        
                        {/* Col 1 */}
                        <div>
                            <h3 className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-6">Sitemap</h3>
                            <ul className="flex flex-col gap-4 text-[14px] text-[var(--text-secondary)] font-medium">
                                <li><Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Beranda</Link></li>
                                <li><Link href="/tenders" className="hover:text-[var(--text-primary)] transition-colors">Tender</Link></li>
                                <li><Link href="/organizations" className="hover:text-[var(--text-primary)] transition-colors">Organisasi</Link></li>
                                <li><Link href="/audit" className="hover:text-[var(--text-primary)] transition-colors">Jejak Audit</Link></li>
                                <li><Link href="/support" className="hover:text-[var(--text-primary)] transition-colors">Pusat Bantuan</Link></li>
                            </ul>
                        </div>

                        {/* Col 2 */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <h3 className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Kontak</h3>
                                <p className="text-[14px] text-[var(--text-secondary)] font-medium leading-relaxed">
                                    Sudirman Central Business District<br/>
                                    Jakarta 12190<br/>
                                    Indonesia
                                </p>
                            </div>
                            <div>
                                <h3 className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Telepon</h3>
                                <p className="text-[14px] text-[var(--text-secondary)] font-medium">+62 811 0000 000</p>
                            </div>
                            <div>
                                <h3 className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Email</h3>
                                <p className="text-[14px] text-[var(--text-secondary)] font-medium">hello@tenderseal.com</p>
                            </div>
                        </div>

                        {/* Col 3 */}
                        <div>
                            <h3 className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Tentang Kami</h3>
                            <p className="text-[14px] text-[var(--text-secondary)] font-medium leading-relaxed mb-8">
                                Mengamankan setiap proses pengadaan Anda. Sistem dengan keamanan kriptografis dan transparansi blockchain. Kami siap membantu pertanyaan teknis Anda!
                            </p>
                            <h3 className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Sosial Media</h3>
                            <div className="flex flex-col gap-3 text-[14px] font-medium text-[var(--text-secondary)]">
                                <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">LinkedIn</Link>
                                <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">Instagram</Link>
                                <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">YouTube</Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
}
