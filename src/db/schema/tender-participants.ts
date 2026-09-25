import { boolean, integer, jsonb, pgTable, text, timestamp, unique, varchar, index } from "drizzle-orm/pg-core";
import { tenderParticipantStatusEnum } from "./enums";
import { tenders } from "./tenders";
import { organizations } from "./organizations";

export const tenderParticipants = pgTable(
    "tender_participants",
    {
        id: text("id").primaryKey(),
        tenderId: text("tender_id")
            .notNull()
            .references(() => tenders.id, { onDelete: "cascade" }),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "restrict" }),
        status: tenderParticipantStatusEnum("status").default("INVITED").notNull(),
        invitedAt: timestamp("invited_at", { withTimezone: true }),
        acceptedAt: timestamp("accepted_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => [
        // Satu organisasi tidak boleh terdaftar dua kali pada tender yang sama
        unique("uq_tender_participants_tender_org").on(t.tenderId, t.organizationId),
        index("idx_tender_parts_tender_id").on(t.tenderId),
        index("idx_tender_parts_org_id").on(t.organizationId),
    ],
);

export const tenderFields = pgTable(
    "tender_fields",
    {
        id: text("id").primaryKey(),
        tenderId: text("tender_id")
            .notNull()
            .references(() => tenders.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 150 }).notNull(),
        // Key unik per tender untuk mapping ke JSON bid
        key: varchar("key", { length: 100 }).notNull(),
        // text | number | currency | date | select | multiselect | file | dll.
        type: varchar("type", { length: 30 }).notNull(),
        required: boolean("required").default(false).notNull(),
        options: jsonb("options"),
        validationRules: jsonb("validation_rules"),
        sortOrder: integer("sort_order").default(0).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => [
        // Satu tender tidak boleh punya dua field dengan key yang sama
        unique("uq_tender_fields_tender_key").on(t.tenderId, t.key),
    ],
);
