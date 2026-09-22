import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { user } from "./auth";
import { organizationMemberRoleEnum } from "./enums";

/**
 * Invite codes untuk bergabung ke organisasi.
 * Admin generate code → share ke calon member → member join via code.
 */
export const organizationInvites = pgTable("organization_invites", {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    // Role yang akan di-assign ke user yang memakai kode ini
    role: organizationMemberRoleEnum("role").notNull().default("MEMBER"),
    // Kode unik pendek yang di-share (contoh: TSEAL-X7K2M)
    code: varchar("code", { length: 20 }).notNull().unique(),
    // Optional: batasi jumlah pemakaian (null = unlimited)
    maxUses: integer("max_uses"),
    usesCount: integer("uses_count").default(0).notNull(),
    // Optional: kadaluarsa (null = tidak kadaluarsa)
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
