"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Sparkles } from "lucide-react";

export default function HomeFooter() {
    return (
        <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 mt-10 mb-8">
            <div className="relative w-full rounded-[40px] overflow-hidden border border-[var(--border)] bg-[var(--surface-secondary)]/30 backdrop-blur-3xl shadow-2xl group">
                
                {/* Organic Glowing Orbs (Fluid/Not Rigid) */}
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-1000" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--accent)]/5 blur-[150px] rounded-full pointer-events-none" />

                {/* Grid Pattern overlay for tech feel */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                
                <div className="relative z-10 px-6 py-20 md:py-32 flex flex-col items-center text-center">
                    
                    {/* Floating Pill Badge */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 shadow-xl"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100">
                            Masa Depan E-Procurement
                        </span>
                    </motion.div>
                    
                    {/* Fluid Typography */}
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-[40px] sm:text-[56px] md:text-[80px] font-bold tracking-tighter text-white leading-[1.05] mb-8 max-w-5xl"
                    >
                        Hentikan Praktik Curang. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 via-teal-200 to-blue-400">
                            Mulai Pengadaan Terpercaya.
                        </span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-[18px] md:text-[22px] text-emerald-50/60 max-w-2xl mb-14 leading-relaxed font-light"
                    >
                        Amankan triliunan aset perusahaan dengan jejak audit blockchain yang tidak dapat dimutasi dan diintervensi oleh siapa pun.
                    </motion.p>

                    {/* Smooth Pill Buttons */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-5"
                    >
                        <Link href="/setup-organization" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-[15px] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                            Mulai Implementasi <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/tenders" className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-[15px] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            Eksplorasi Sistem <Shield className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
