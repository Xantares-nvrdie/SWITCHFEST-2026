import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuditLogModel } from "./model";

export abstract class AuditLogService {
    static async log(data: AuditLogModel.createInput) {
        const logId = crypto.randomUUID();

        await db.insert(auditLogs).values({
            id: logId,
            userId: data.userId,
            organizationId: data.organizationId,
            tenderId: data.tenderId,
            bidId: data.bidId,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            description: data.description,
            metadata: data.metadata,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            createdAt: new Date(),
        });

        return { id: logId };
    }

    static async getAll() {
        return db.select().from(auditLogs);
    }

    static async getByTenderId(tenderId: string) {
        return db.query.auditLogs.findMany({
            where: (al, { eq }) => eq(al.tenderId, tenderId),
            with: {
                user: true,
                organization: true,
            },
        });
    }
}
