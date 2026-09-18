import "dotenv/config";
import { db } from "@/db";
import {
    auditLogs,
    bidCrypto,
    bidReveals,
    bids,
    encryptedBids,
    organizationMembers,
    organizations,
    tenderCriteria,
    tenderFields,
    tenderParticipants,
    tenders,
    user,
} from "@/db/schema";

async function main() {
    console.log("🌱 Starting TenderSeal database seeding...");

    // 1. Seed Users
    console.log("-> Seeding Users...");
    const usersData = [
        {
            id: "user-demo-001",
            name: "Budi Procurement Officer",
            email: "officer@globaltech.co.id",
            emailVerified: true,
        },
        {
            id: "user-demo-002",
            name: "Andi Vendor Representative",
            email: "vendor@techsolusindo.com",
            emailVerified: true,
        },
        {
            id: "user-demo-003",
            name: "Siti Independent Auditor",
            email: "auditor@tenderseal.id",
            emailVerified: true,
        },
    ];

    for (const u of usersData) {
        await db.insert(user).values(u).onConflictDoNothing();
    }

    // 2. Seed Organizations
    console.log("-> Seeding Organizations...");
    const orgsData = [
        {
            id: "org-buyer-001",
            name: "PT Global Tech Indonesia",
            type: "BUYER" as const,
            legalName: "PT Global Tech Indonesia Tbk",
            registrationNumber: "REG-BUYER-2026-001",
            email: "procurement@globaltech.co.id",
            phone: "+62 21 555 1234",
            address: "Sudirman Central Business District, Jakarta Selatan",
            isVerified: true,
        },
        {
            id: "org-vendor-001",
            name: "PT Tech Solusindo Utama",
            type: "VENDOR" as const,
            legalName: "PT Tech Solusindo Utama",
            registrationNumber: "REG-VENDOR-2026-001",
            email: "tender@techsolusindo.com",
            phone: "+62 21 555 8888",
            address: "Kuningan Center Block A-12, Jakarta Selatan",
            isVerified: true,
        },
        {
            id: "org-vendor-002",
            name: "CV Utama Karya Hardware",
            type: "VENDOR" as const,
            legalName: "CV Utama Karya Hardware",
            registrationNumber: "REG-VENDOR-2026-002",
            email: "sales@utamakarya.co.id",
            phone: "+62 31 888 7777",
            address: "Rungkut Industrial Estate, Surabaya",
            isVerified: true,
        },
    ];

    for (const org of orgsData) {
        await db.insert(organizations).values(org).onConflictDoNothing();
    }

    // 3. Seed Organization Members
    console.log("-> Seeding Organization Members...");
    const membersData = [
        {
            id: "mem-001",
            organizationId: "org-buyer-001",
            userId: "user-demo-001",
            role: "PROCUREMENT_OFFICER" as const,
            status: "ACTIVE" as const,
        },
        {
            id: "mem-002",
            organizationId: "org-vendor-001",
            userId: "user-demo-002",
            role: "MEMBER" as const,
            status: "ACTIVE" as const,
        },
        {
            id: "mem-003",
            organizationId: "org-buyer-001",
            userId: "user-demo-003",
            role: "AUDITOR" as const,
            status: "ACTIVE" as const,
        },
    ];

    for (const m of membersData) {
        await db.insert(organizationMembers).values(m).onConflictDoNothing();
    }

    // 4. Seed Tenders
    console.log("-> Seeding Tenders...");
    const tendersData = [
        {
            id: "tnd-demo-001",
            organizationId: "org-buyer-001",
            createdBy: "user-demo-001",
            code: "TND-2026-001",
            title: "Pengadaan 100 Laptop High Performance Workstation",
            description:
                "Pengadaan laptop workstation spesifikasi tinggi untuk tim software engineering & AI graphics design.",
            category: "Hardware & IT",
            status: "OPEN" as const,
            commitDeadline: new Date("2026-09-20T15:00:00Z"),
            revealWindowHours: 48,
            revealDeadline: new Date("2026-09-22T15:00:00Z"),
        },
        {
            id: "tnd-demo-002",
            organizationId: "org-buyer-001",
            createdBy: "user-demo-001",
            code: "TND-2026-002",
            title: "Jasa Pembuatan & Development Platform E-Procurement Blockchain",
            description:
                "Pengadaan jasa konsultan dan software house untuk pembangunan platform tender digital terenkripsi.",
            category: "Software Development",
            status: "REVEAL" as const,
            commitDeadline: new Date("2026-09-15T12:00:00Z"),
            revealWindowHours: 24,
            revealDeadline: new Date("2026-09-16T12:00:00Z"),
        },
        {
            id: "tnd-demo-003",
            organizationId: "org-buyer-001",
            createdBy: "user-demo-001",
            code: "TND-2026-003",
            title: "Pengadaan Lisensi Software Antivirus & Cyber Security Enterprise",
            description:
                "Pembelian 500 lisensi software perlindungan endpoints & cloud firewalls untuk infrastruktur instansi.",
            category: "Cybersecurity",
            status: "SCORING" as const,
            commitDeadline: new Date("2026-09-10T17:00:00Z"),
            revealWindowHours: 48,
            revealDeadline: new Date("2026-09-12T17:00:00Z"),
        },
        {
            id: "tnd-demo-004",
            organizationId: "org-buyer-001",
            createdBy: "user-demo-001",
            code: "TND-2026-004",
            title: "Pemeliharaan & Audit Rutin Cloud Infrastructure AWS/GCP",
            description:
                "Jasa audit keamanan, pemeliharaan server Kubernetes, dan optimasi biaya cloud infrastruktur.",
            category: "Cloud Infrastructure",
            status: "COMPLETED" as const,
            commitDeadline: new Date("2026-08-30T10:00:00Z"),
            revealWindowHours: 48,
            revealDeadline: new Date("2026-09-01T10:00:00Z"),
        },
    ];

    for (const t of tendersData) {
        await db.insert(tenders).values(t).onConflictDoNothing();
    }

    // 5. Seed Dynamic Tender Fields (for tnd-demo-001)
    console.log("-> Seeding Tender Fields...");
    const fieldsData = [
        {
            id: "f-001",
            tenderId: "tnd-demo-001",
            name: "Harga Total Penawaran (Rp)",
            key: "harga_total",
            type: "currency",
            required: true,
            sortOrder: 0,
        },
        {
            id: "f-002",
            tenderId: "tnd-demo-001",
            name: "Spesifikasi RAM & Processor",
            key: "spesifikasi",
            type: "text",
            required: true,
            sortOrder: 1,
        },
        {
            id: "f-003",
            tenderId: "tnd-demo-001",
            name: "Garansi Resmi (Tahun)",
            key: "garansi_tahun",
            type: "number",
            required: true,
            sortOrder: 2,
        },
        {
            id: "f-004",
            tenderId: "tnd-demo-001",
            name: "Proposal Penawaran PDF",
            key: "proposal_pdf",
            type: "file",
            required: true,
            sortOrder: 3,
        },
    ];

    for (const f of fieldsData) {
        await db.insert(tenderFields).values(f).onConflictDoNothing();
    }

    // 6. Seed Evaluation Criteria (for tnd-demo-001)
    console.log("-> Seeding Tender Criteria...");
    const criteriaData = [
        {
            id: "c-001",
            tenderId: "tnd-demo-001",
            name: "Harga Penawaran",
            description: "Penilaian aspek komersial dan efisiensi harga penawaran vendor.",
            weight: "50.00",
            scoringType: "MANUAL",
            maxScore: "100.00",
            sortOrder: 0,
        },
        {
            id: "c-002",
            tenderId: "tnd-demo-001",
            name: "Spesifikasi Teknis",
            description: "Kesesuaian spesifikasi workstation laptop dengan standar kebutuhan IT.",
            weight: "25.00",
            scoringType: "MANUAL",
            maxScore: "100.00",
            sortOrder: 1,
        },
        {
            id: "c-003",
            tenderId: "tnd-demo-001",
            name: "Garansi & Layanan Purna Jual",
            description: "Durasi garansi dan ketersediaan service center di Indonesia.",
            weight: "15.00",
            scoringType: "MANUAL",
            maxScore: "100.00",
            sortOrder: 2,
        },
        {
            id: "c-004",
            tenderId: "tnd-demo-001",
            name: "Kelengkapan Dokumen Proposal",
            description: "Pemeriksaan kelengkapan proposal penawaran PDF.",
            weight: "10.00",
            scoringType: "MANUAL",
            maxScore: "100.00",
            sortOrder: 3,
        },
    ];

    for (const c of criteriaData) {
        await db.insert(tenderCriteria).values(c).onConflictDoNothing();
    }

    // 7. Seed Tender Participants
    console.log("-> Seeding Tender Participants...");
    const participantsData = [
        {
            id: "tp-001",
            tenderId: "tnd-demo-001",
            organizationId: "org-vendor-001",
            status: "ACCEPTED" as const,
            acceptedAt: new Date("2026-09-16T10:00:00Z"),
        },
        {
            id: "tp-002",
            tenderId: "tnd-demo-001",
            organizationId: "org-vendor-002",
            status: "ACCEPTED" as const,
            acceptedAt: new Date("2026-09-16T11:00:00Z"),
        },
    ];

    for (const tp of participantsData) {
        await db.insert(tenderParticipants).values(tp).onConflictDoNothing();
    }

    // 8. Seed Sample Sealed Bid
    console.log("-> Seeding Sample Sealed Bid...");
    const bidId = "bid-demo-001";
    const sampleCommitmentHash = "0x8f2a9b4c1d6e7f3a8b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a";

    await db.insert(bids).values({
        id: bidId,
        tenderId: "tnd-demo-001",
        organizationId: "org-vendor-001",
        commitmentHash: sampleCommitmentHash,
        status: "SEALED" as const,
        submittedAt: new Date("2026-09-17T16:30:12Z"),
    }).onConflictDoNothing();

    await db.insert(bidCrypto).values({
        id: "crypto-demo-001",
        bidId: bidId,
        kdfAlgorithm: "Argon2id",
        kdfSalt: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
        encryptionAlgorithm: "AES-GCM-256",
        encryptionIv: "0102030405060708090a0b0c",
        bidSalt: "fe12dc34ba569874fe12dc34ba569874",
    }).onConflictDoNothing();

    await db.insert(encryptedBids).values({
        id: "enc-demo-001",
        bidId: bidId,
        encryptedPayload: "a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
        storageProvider: "POSTGRESQL",
        payloadHash: "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
    }).onConflictDoNothing();

    // 9. Seed Audit Logs
    console.log("-> Seeding Audit Logs...");
    const logsData = [
        {
            id: "log-001",
            userId: "user-demo-001",
            organizationId: "org-buyer-001",
            action: "CREATE_TENDER",
            entityType: "tenders",
            entityId: "tnd-demo-001",
            description: "Procurement Officer publikasi tender TND-2026-001 Pengadaan 100 Laptop Workstation",
            ipAddress: "36.85.12.90",
            createdAt: new Date("2026-09-16T09:00:00Z"),
        },
        {
            id: "log-002",
            userId: "user-demo-002",
            organizationId: "org-vendor-001",
            action: "SUBMIT_SEALED_BID",
            entityType: "bids",
            entityId: bidId,
            description: "Vendor PT Tech Solusindo Utama submit sealed bid terenkripsi AES-GCM + commitment hash",
            ipAddress: "182.253.44.12",
            createdAt: new Date("2026-09-17T16:30:12Z"),
        },
    ];

    for (const log of logsData) {
        await db.insert(auditLogs).values(log).onConflictDoNothing();
    }

    console.log("✅ TenderSeal database seeding completed successfully!");
}

main().catch((err) => {
    console.error("❌ Error during database seeding:", err);
    process.exit(1);
});
