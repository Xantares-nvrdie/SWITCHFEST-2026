"use client";

import React, { createContext, useContext, useState } from "react";

export type DemoRole = "PROCUREMENT_OFFICER" | "VENDOR" | "AUDITOR";

interface DemoContextType {
    activeRole: DemoRole;
    setActiveRole: (role: DemoRole) => void;
    activeOrgId: string;
    setActiveOrgId: (id: string) => void;
    activeUserId: string;
    vendorSecret: string;
    setVendorSecret: (secret: string) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
    const [activeRole, setActiveRole] = useState<DemoRole>("PROCUREMENT_OFFICER");
    const [activeOrgId, setActiveOrgId] = useState<string>("org-buyer-001");
    const [activeUserId] = useState<string>("user-demo-001");
    const [vendorSecret, setVendorSecret] = useState<string>("VendorSecretPIN123!");

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
