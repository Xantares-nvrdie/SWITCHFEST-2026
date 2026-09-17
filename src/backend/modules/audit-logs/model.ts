import { t } from "elysia";

export namespace AuditLogModel {
    export const createBody = t.Object({
        userId: t.Optional(t.String()),
        organizationId: t.Optional(t.String()),
        tenderId: t.Optional(t.String()),
        bidId: t.Optional(t.String()),
        action: t.String(),
        entityType: t.String(),
        entityId: t.String(),
        description: t.Optional(t.String()),
        metadata: t.Optional(t.Any()),
        ipAddress: t.Optional(t.String()),
        userAgent: t.Optional(t.String()),
    });

    export type createInput = typeof createBody.static;
}
