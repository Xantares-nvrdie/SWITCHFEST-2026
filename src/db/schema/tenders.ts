import { index, integer, jsonb, pgTable, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenderStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { user } from "./auth";

export const tenders = pgTable(
    "tenders",
    {
        id: text("id").primaryKey(),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "restrict" }),
        createdBy: text("created_by")
            .notNull()
            .references(() => user.id, { onDelete: "restrict" }),
        code: varchar("code", { length: 50 }).notNull().unique(),
        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        attachments: jsonb("attachments").default([]).notNull(),
        category: varchar("category", { length: 100 }),
        status: tenderStatusEnum("status").default("DRAFT").notNull(),
        commitDeadline: timestamp("commit_deadline", { withTimezone: true }).notNull(),
        // Durasi reveal window dalam jam, default 48 jam
        revealWindowHours: real("reveal_window_hours").default(48).notNull(),
        // Dihitung dari commit_deadline + reveal_window_hours saat tender ditutup
        revealDeadline: timestamp("reveal_deadline", { withTimezone: true }),
        openedAt: timestamp("opened_at", { withTimezone: true }),
        closedAt: timestamp("closed_at", { withTimezone: true }),
        completedAt: timestamp("completed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => [
        index("idx_tenders_created_at").on(t.createdAt),
        index("idx_tenders_open_commit_deadline").on(t.status, t.commitDeadline),
        index("idx_tenders_reveal_deadline").on(t.status, t.revealDeadline),
    ],
);
