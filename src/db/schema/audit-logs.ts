import { inet, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { organizations } from "./organizations";
import { tenders } from "./tenders";
import { bids } from "./bids";

export const auditLogs = pgTable("audit_logs", {
    id: text("id").primaryKey(),
    // Semua FK nullable: event bisa dari system (tanpa user/org/tender/bid)
    organizationId: text("organization_id").references(() => organizations.id, {
        onDelete: "set null",
    }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    tenderId: text("tender_id").references(() => tenders.id, {
        onDelete: "set null",
    }),
    bidId: text("bid_id").references(() => bids.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: text("entity_id"),
    description: text("description"),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
