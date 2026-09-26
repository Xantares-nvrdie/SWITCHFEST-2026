import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { organizationMemberRoleEnum, organizationMemberStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { user } from "./auth";

export const organizationMembers = pgTable(
    "organization_members",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        role: organizationMemberRoleEnum("role").notNull(),
        status: organizationMemberStatusEnum("status").default("INVITED").notNull(),
        joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => [
        index("idx_org_members_user_id").on(t.userId),
        index("idx_org_members_org_user_status").on(t.organizationId, t.userId, t.status),
    ],
);
