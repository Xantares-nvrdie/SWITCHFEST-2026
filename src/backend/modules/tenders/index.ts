import { Elysia, t } from "elysia";
import { TenderModel } from "./model";
import { TenderService } from "./service";
import { AuditLogService } from "../audit-logs/service";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { db } from "@/db";
import { requireSystemAdmin } from "@/backend/utils/rbac";

const tendersModule = new Elysia({ prefix: "/tenders", tags: ["Tenders"] })
    .use(betterAuthMiddleware)

    .get(
        "/",
        async ({ query }) => {
            const page = query.page ? parseInt(query.page as string, 10) : 1;
            const limit = query.limit ? parseInt(query.limit as string, 10) : 20;
            return await TenderService.getAll(page, limit);
        },
        {
            query: t.Object({
                page: t.Optional(t.String()),
                limit: t.Optional(t.String())
            }),
            detail: {
                summary: "Get all tenders",
                description: "Mengambil daftar seluruh tender di sistem dengan pagination.",
            },
        },
    )

    .get(
        "/:id",
        async ({ params, set }) => {
            const data = await TenderService.getById(params.id);
            if (!data) {
                set.status = 404;
                return { message: "Tender not found" };
            }
            return data;
        },
        {
            params: t.Object({ id: t.String() }),
            detail: {
                summary: "Get tender by ID",
                description: "Mengambil detail tender beserta dynamic fields, kriteria penilaian, dan peserta.",
            },
        },
    )

    // ── Create Tender (Requires Verified BUYER/BOTH Org + Officer/Admin Role) ──
    .post(
        "/",
        async ({ body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized: Please login to create tender" };
            }

            // 1. Check organization verification status
            const org = await db.query.organizations.findFirst({
                where: (o, { eq }) => eq(o.id, body.organizationId),
            });

            if (!org) {
                set.status = 404;
                return { message: "Organization not found" };
            }

            const isApproved = org.verificationStatus === "APPROVED" || org.isVerified;
            if (!isApproved) {
                set.status = 403;
                return { message: "Forbidden: Organization must be approved by TenderSeal Admin before creating tenders" };
            }

            // 2. Check user's role in the organization (Must be PROCUREMENT_OFFICER or ORGANIZATION_ADMIN)
            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, body.organizationId), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!member || (member.role !== "PROCUREMENT_OFFICER" && member.role !== "ORGANIZATION_ADMIN")) {
                set.status = 403;
                return { message: "Forbidden: Only Procurement Officers or Organization Admins can create tenders" };
            }

            const result = await TenderService.create({
                ...body,
                createdBy: user.id,
            });

            await AuditLogService.log({
                userId: user.id,
                organizationId: body.organizationId,
                tenderId: result.id,
                action: "CREATE_TENDER",
                entityType: "tenders",
                entityId: result.id,
                description: `Procurement Officer membuat draft tender baru berjudul "${body.title}"`,
            });

            set.status = 201;
            return { message: "Tender created successfully", data: result };
        },
        {
            auth: true,
            body: TenderModel.createBody,
            detail: {
                summary: "Create a new tender",
                description: "Membuat draft tender baru (Hanya Procurement Officer / Admin dari Organisasi Terverifikasi).",
            },
        },
    )

    // ── Update Status (Requires Officer / Admin of Tender Org) ────────────────
    .patch(
        "/:id/status",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            const tender = await db.query.tenders.findFirst({
                where: (t, { eq }) => eq(t.id, params.id),
            });

            if (!tender) {
                set.status = 404;
                return { message: "Tender not found" };
            }

            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, tender.organizationId), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!member || (member.role !== "PROCUREMENT_OFFICER" && member.role !== "ORGANIZATION_ADMIN")) {
                set.status = 403;
                return { message: "Forbidden: Only Procurement Officers or Admins of this tender's organization can update status" };
            }

            await TenderService.updateStatus(params.id, body.status);
            
            await AuditLogService.log({
                userId: user.id,
                organizationId: tender.organizationId,
                tenderId: params.id,
                action: "UPDATE_TENDER_STATUS",
                entityType: "tenders",
                entityId: params.id,
                description: `Status tender diubah menjadi ${body.status}`,
            });

            return { message: `Tender status updated to ${body.status}` };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: TenderModel.updateStatusBody,
            detail: {
                summary: "Update tender status",
                description: "Mengubah alur status tender (Hanya Procurement Officer / Admin dari Organisasi Penyelenggara).",
            },
        },
    )

    // ── Add Field ─────────────────────────────────────────────────────────────
    .post(
        "/:id/fields",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            const tender = await db.query.tenders.findFirst({
                where: (t, { eq }) => eq(t.id, params.id),
            });

            if (!tender) {
                set.status = 404;
                return { message: "Tender not found" };
            }

            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, tender.organizationId), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!member || (member.role !== "PROCUREMENT_OFFICER" && member.role !== "ORGANIZATION_ADMIN")) {
                set.status = 403;
                return { message: "Forbidden: Only Procurement Officers or Admins can add dynamic fields" };
            }

            const result = await TenderService.addField(params.id, body);
            set.status = 201;
            return { message: "Dynamic tender field added successfully", data: result };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: TenderModel.addFieldBody,
            detail: {
                summary: "Add dynamic field to tender",
                description: "Menambahkan input field kustom untuk formulir penawaran vendor.",
            },
        },
    )

    // ── Add Criterion ─────────────────────────────────────────────────────────
    .post(
        "/:id/criteria",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            const tender = await db.query.tenders.findFirst({
                where: (t, { eq }) => eq(t.id, params.id),
            });

            if (!tender) {
                set.status = 404;
                return { message: "Tender not found" };
            }

            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, tender.organizationId), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!member || (member.role !== "PROCUREMENT_OFFICER" && member.role !== "ORGANIZATION_ADMIN")) {
                set.status = 403;
                return { message: "Forbidden: Only Procurement Officers or Admins can add criteria" };
            }

            const result = await TenderService.addCriterion(params.id, body);
            set.status = 201;
            return { message: "Tender evaluation criterion added successfully", data: result };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: TenderModel.addCriterionBody,
            detail: {
                summary: "Add evaluation criterion to tender",
                description: "Menambahkan kriteria dan bobot penilaian tender.",
            },
        }
    )
    // ── Finalize Tender ───────────────────────────────────────────────────────
    .post(
        "/:id/finalize",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            const tender = await db.query.tenders.findFirst({
                where: (t, { eq }) => eq(t.id, params.id),
            });

            if (!tender) {
                set.status = 404;
                return { message: "Tender not found" };
            }

            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, tender.organizationId), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!member || (member.role !== "PROCUREMENT_OFFICER" && member.role !== "ORGANIZATION_ADMIN")) {
                set.status = 403;
                return { message: "Forbidden: Only Procurement Officers or Admins can finalize the tender" };
            }

            try {
                const result = await TenderService.finalizeTender(params.id, body, user.id);
                
                // Log activity
                await AuditLogService.log({
                    userId: user.id,
                    organizationId: tender.organizationId,
                    tenderId: params.id,
                    action: "DECLARE_TENDER_WINNER",
                    entityType: "tender_results",
                    entityId: params.id,
                    description: `Procurement Officer menetapkan pemenang tender. Transaksi skor dikirim ke Smart Contract.`,
                });

                set.status = 200;
                return { message: "Tender finalized successfully (Winner set, scores recorded, smart contract transaction initiated)", data: result };
            } catch (err: any) {
                set.status = 400;
                return { message: err.message || "Failed to finalize tender" };
            }
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: TenderModel.finalizeBody,
            detail: {
                summary: "Finalize tender & Pick Winner",
                description: "Menyelesaikan tender, menyimpan semua skor, menetapkan pemenang, dan memicu transaksi pencatatan ke Smart Contract.",
            },
        }
    )

    // ── Audit Log ─────────────────────────────────────────────────────────────
    .get(
        "/:id/audit",
        async ({ params, set }) => {
            try {
                const data = await TenderService.getAuditData(params.id);
                return data;
            } catch (err: any) {
                set.status = 400;
                return { message: err.message || "Failed to fetch audit data" };
            }
        },
        {
            params: t.Object({ id: t.String() }),
            detail: {
                summary: "Get Audit Log",
                description: "Mengambil data transparan hasil akhir tender beserta jejak skor dan blockchain.",
            },
        }
    );

export default tendersModule;

