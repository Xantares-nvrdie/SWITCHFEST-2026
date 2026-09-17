import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }),
    registrationNumber: varchar("registration_number", { length: 100 }).unique(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    address: text("address"),
    walletAddress: varchar("wallet_address", { length: 100 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
