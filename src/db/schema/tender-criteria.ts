import { decimal, index, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenders } from "./tenders";

export const tenderCriteria = pgTable(
    "tender_criteria",
    {
        id: text("id").primaryKey(),
        tenderId: text("tender_id")
            .notNull()
            .references(() => tenders.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 150 }).notNull(),
        description: text("description"),
        // Bobot dalam persen, contoh: 50.00 = 50%
        weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
        // "MANUAL" | "LOWEST_PRICE" | dll.
        scoringType: varchar("scoring_type", { length: 30 }).default("MANUAL").notNull(),
        maxScore: decimal("max_score", { precision: 10, scale: 2 }).default("100"),
        sortOrder: integer("sort_order").default(0).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => [index("idx_tender_criteria_tender_id").on(t.tenderId)],
);
