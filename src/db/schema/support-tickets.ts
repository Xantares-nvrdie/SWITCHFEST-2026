import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const supportTickets = pgTable("support_tickets", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // Optional for guests
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    category: text("category").notNull(),
    message: text("message").notNull(),
    status: text("status", { enum: ["OPEN", "IN_PROGRESS", "CLOSED"] })
        .default("OPEN")
        .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
