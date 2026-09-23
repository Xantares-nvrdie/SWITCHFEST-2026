import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "TenderSeal — Authentication",
    description: "Login or create your TenderSeal account to access secure sealed tendering.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.05]"
                    style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full opacity-[0.04]"
                    style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
                />
            </div>

            {/* Grid overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {children}
        </div>
    );
}
