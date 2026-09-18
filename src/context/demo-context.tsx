"use client";

import React, { createContext, useContext, useState } from "react";

export type DemoRole = "PROCUREMENT_OFFICER" | "VENDOR" | "AUDITOR";

export interface TenderItem {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    organizationName: string;
    status: "DRAFT" | "OPEN" | "CLOSED" | "REVEAL" | "SCORING" | "COMPLETED";
    commitDeadline: string;
    revealWindowHours: number;
    participantCount: number;
    sealedBidsCount: number;
}

const initialMockTenders: TenderItem[] = [
    {
        id: "tnd-demo-001",
        code: "TND-2026-001",
        title: "Pengadaan 100 Laptop High Performance Workstation",
        description:
            "Pengadaan laptop workstation spesifikasi tinggi untuk tim software engineering & AI graphics design.",
        category: "Hardware",
        organizationName: "PT Global Tech Indonesia",
        status: "OPEN",
        commitDeadline: "2026-09-20T15:00:00Z",
        revealWindowHours: 48,
        participantCount: 5,
        sealedBidsCount: 3,
    },
    {
        id: "tnd-demo-002",
        code: "TND-2026-002",
        title: "Jasa Pembuatan & Development Platform E-Procurement Blockchain",
        description:
            "Pengadaan jasa konsultan dan software house untuk pembangunan platform tender digital terenkripsi.",
        category: "Software Development",
        organizationName: "Dinas Komunikasi & Informatika",
        status: "REVEAL",
        commitDeadline: "2026-09-15T12:00:00Z",
        revealWindowHours: 24,
        participantCount: 4,
        sealedBidsCount: 4,
    },
    {
        id: "tnd-demo-003",
        code: "TND-2026-003",
        title: "Pengadaan Lisensi Software Antivirus & Cyber Security Enterprise",
        description:
            "Pembelian 500 lisensi software perlindungan endpoints & cloud firewalls untuk infrastruktur instansi.",
        category: "Cybersecurity",
        organizationName: "PT Bank Nusa Mandiri",
        status: "SCORING",
        commitDeadline: "2026-09-10T17:00:00Z",
        revealWindowHours: 48,
        participantCount: 3,
        sealedBidsCount: 3,
    },
    {
        id: "tnd-demo-004",
        code: "TND-2026-004",
        title: "Pemeliharaan & Audit Rutin Cloud Infrastructure AWS/GCP",
        description: "Jasa audit keamanan, pemeliharaan server Kubernetes, dan optimasi biaya cloud infrastruktur.",
        category: "Cloud Infrastructure",
        organizationName: "PT Logistik Nusantara",
        status: "COMPLETED",
        commitDeadline: "2026-08-30T10:00:00Z",
        revealWindowHours: 48,
        participantCount: 6,
        sealedBidsCount: 6,
    },
];

interface DemoContextType {
    activeRole: DemoRole;
    setActiveRole: (role: DemoRole) => void;
    activeOrgId: string;
    setActiveOrgId: (id: string) => void;
    activeUserId: string;
    vendorSecret: string;
    setVendorSecret: (secret: string) => void;
    tenders: TenderItem[];
    addTender: (tender: TenderItem) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
    const [activeRole, setActiveRole] = useState<DemoRole>("PROCUREMENT_OFFICER");
    const [activeOrgId, setActiveOrgId] = useState<string>("org-buyer-001");
    const [activeUserId] = useState<string>("user-demo-001");
    const [vendorSecret, setVendorSecret] = useState<string>("VendorSecretPIN123!");
    const [tenders, setTenders] = useState<TenderItem[]>(initialMockTenders);

    const addTender = (newTender: TenderItem) => {
        setTenders((prev) => [newTender, ...prev]);
    };

    return (
        <DemoContext.Provider
            value={{
                activeRole,
                setActiveRole,
                activeOrgId,
                setActiveOrgId,
                activeUserId,
                vendorSecret,
                setVendorSecret,
                tenders,
                addTender,
            }}
        >
            {children}
        </DemoContext.Provider>
    );
}

export function useDemo() {
    const context = useContext(DemoContext);
    if (!context) {
        throw new Error("useDemo must be used within a DemoProvider");
    }
    return context;
}
