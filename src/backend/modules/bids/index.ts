import { Elysia, t } from "elysia";
import { BidModel } from "./model";
import { BidService } from "./service";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { db } from "@/db";

const bidsModule = new Elysia({ prefix: "/bids", tags: ["Bids"] })
    .use(betterAuthMiddleware)

    .get(
        "/me",
        async ({ user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            return await BidService.getBidsForUser(user.id);
        },
        {
            auth: true,
            detail: {
                summary: "Get user bids",
                description: "Mengambil daftar seluruh bid yang pernah disubmit oleh organisasi tempat user bernaung.",
            },
        },
    )

    .get(
        "/tender/:tenderId",
        async ({ params }) => {
            return await BidService.getByTenderId(params.tenderId);
        },
        {
            params: t.Object({ tenderId: t.String() }),
            detail: {
                summary: "Get bids for tender",
                description: "Mengambil daftar bid peserta pada suatu tender (hanya metadata/status).",
            },
        },
    )

    .get(
        "/:id",
        async ({ params, set }) => {
            const data = await BidService.getById(params.id);
            if (!data) {
                set.status = 404;
                return { message: "Bid not found" };
            }
            return data;
        },
        {
            params: t.Object({ id: t.String() }),
            detail: {
                summary: "Get bid by ID",
                description: "Mengambil detail metadata bid, crypto salt/IV, dan status verifikasi.",
            },
        },
    )

    // ── Submit Sealed Bid (Requires Verified VENDOR Org & OPEN Tender Deadline) ──
    .post(
        "/tender/:tenderId",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized: Please login to submit a bid" };
            }

            // 1. Check tender existence & deadline
            const tender = await db.query.tenders.findFirst({
                where: (t, { eq }) => eq(t.id, params.tenderId),
            });

            if (!tender) {
                set.status = 404;
                return { message: "Tender not found" };
            }

            if (tender.status !== "OPEN" && tender.status !== "DRAFT") {
                set.status = 400;
                return { message: `Cannot submit bid: Tender status is currently ${tender.status}` };
            }

            if (tender.commitDeadline && new Date() > new Date(tender.commitDeadline)) {
                set.status = 400;
                return { message: "Bidding deadline has expired for this tender" };
            }

            // 2. Check vendor organization verification status
            const org = await db.query.organizations.findFirst({
                where: (o, { eq }) => eq(o.id, body.organizationId),
            });

            if (!org) {
                set.status = 404;
                return { message: "Vendor organization not found" };
            }

            const isApproved = org.verificationStatus === "APPROVED" || org.isVerified;
            if (!isApproved) {
                set.status = 403;
                return { message: "Forbidden: Vendor organization must be approved by TenderSeal Admin before submitting bids" };
            }

            // 3. Check user membership in vendor organization
            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, body.organizationId), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!member) {
                set.status = 403;
                return { message: "Forbidden: You are not an active member of the submitting vendor organization" };
            }

            try {
                const result = await BidService.submitSealed(params.tenderId, body);
                set.status = 201;
                return { message: "Sealed bid submitted successfully", data: result };
            } catch (error: any) {
                set.status = 500;
                
                // Extract inner cause from DrizzleError if available
                const cause = error.cause || error;
                const causeMsg = cause.message || "";
                const causeCode = cause.code || "";
                
                // If it's a unique constraint violation
                if (causeMsg.includes("duplicate key") || causeCode === "23505" || causeMsg.includes("uq_bids_tender_org")) {
                    set.status = 400;
                    return { message: "Organisasi Anda sudah pernah mensubmit bid untuk tender ini." };
                }
                console.error("Bid submission error:", error);
                
                // Return full error trace to frontend for debugging
                return { 
                    message: "Database Error: " + causeMsg, 
                    detail: causeCode 
                };
            }
        },
        {
            auth: true,
            params: t.Object({ tenderId: t.String() }),
            body: BidModel.submitSealedBody,
            detail: {
                summary: "Submit sealed bid",
                description: "Mengirimkan penawaran terenkripsi (AES-GCM) dan commitment hash sebelum deadline (Hanya Vendor Terverifikasi).",
            },
        },
    )

    // ── Submit Reveal ─────────────────────────────────────────────────────────
    .post(
        "/:id/reveal",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized: Please login to reveal bid" };
            }

            const existingBid = await db.query.bids.findFirst({
                where: (b, { eq }) => eq(b.id, params.id),
                with: { tender: true },
            });

            if (!existingBid) {
                set.status = 404;
                return { message: "Bid not found" };
            }

            const result = await BidService.submitReveal(params.id, {
                ...body,
                verifiedBy: user.id,
            });

            return { message: "Reveal processed", data: result };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: BidModel.submitRevealBody,
            detail: {
                summary: "Submit reveal payload",
                description: "Mengirimkan dekripsi payload setelah deadline untuk verifikasi commitment hash.",
            },
        },
    );

export default bidsModule;
