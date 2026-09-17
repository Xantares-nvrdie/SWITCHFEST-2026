import { Elysia, t } from "elysia";
import { AuditLogModel } from "./model";
import { AuditLogService } from "./service";

const auditLogsModule = new Elysia({ prefix: "/audit-logs", tags: ["Audit Logs"] })
    .get(
        "/",
        async () => {
            return await AuditLogService.getAll();
        },
        {
            detail: {
                summary: "Get all audit logs",
                description: "Mengambil seluruh riwayat log audit aktivitas sistem.",
            },
        },
    )

    .get(
        "/tender/:tenderId",
        async ({ params }) => {
            return await AuditLogService.getByTenderId(params.tenderId);
        },
        {
            params: t.Object({ tenderId: t.String() }),
            detail: {
                summary: "Get audit logs by tender ID",
                description: "Mengambil riwayat log audit khusus untuk tender tertentu.",
            },
        },
    )

    .post(
        "/",
        async ({ body, set }) => {
            const result = await AuditLogService.log(body);
            set.status = 201;
            return { message: "Audit log recorded successfully", data: result };
        },
        {
            body: AuditLogModel.createBody,
            detail: {
                summary: "Record audit log event",
                description: "Mencatat event aktivitas baru ke audit trail.",
            },
        },
    );

export default auditLogsModule;
