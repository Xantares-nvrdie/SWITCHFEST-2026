import { Elysia, t } from "elysia";
import { AuditLogModel } from "./model";
import { AuditLogService } from "./service";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { requireSystemAdmin } from "@/backend/utils/rbac";

const auditLogsModule = new Elysia({ prefix: "/audit-logs", tags: ["Audit Logs"] })
    .use(betterAuthMiddleware)
    .get(
        "/",
        async () => {
            return await AuditLogService.getAll();
        },
        {
            detail: {
                summary: "Get all audit logs",
                description: "Mengambil seluruh riwayat log audit aktivitas sistem (Public).",
            },
        },
    )

    .get(
        "/tender/:tenderId",
        async ({ params }) => {
            return await AuditLogService.getByTenderId(params.tenderId);
        },
        {
            auth: true,
            beforeHandle: [requireSystemAdmin],
            params: t.Object({ tenderId: t.String() }),
            detail: {
                summary: "Get audit logs by tender ID",
                description: "Mengambil riwayat log audit khusus untuk tender tertentu.",
            },
        },
    )

    .post(
        "/",
        async ({ body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const result = await AuditLogService.log(body);
            set.status = 201;
            return { message: "Audit log recorded successfully", data: result };
        },
        {
            auth: true,
            body: AuditLogModel.createBody,
            detail: {
                summary: "Record audit log event",
                description: "Mencatat event aktivitas baru ke audit trail.",
            },
        },
    );

export default auditLogsModule;
