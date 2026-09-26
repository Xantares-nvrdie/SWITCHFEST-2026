import { boolean, pgTable, text, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const notifications = pgTable(
    "notifications",
    {
        id: varchar("id", { length: 255 }).notNull().primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 255 }).notNull(),
        message: text("message").notNull(),
        type: varchar("type", { length: 50 }).notNull(), // e.g., 'INFO', 'SUCCESS', 'WARNING'
        link: varchar("link", { length: 255 }), // Optional link to redirect when clicked
        isRead: boolean("is_read").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => ({
        userReadIdx: index("idx_notifications_user_is_read").on(t.userId, t.isRead),
        userCreatedAtIdx: index("idx_notifications_user_created_at").on(t.userId, t.createdAt),
    }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(user, {
        fields: [notifications.userId],
        references: [user.id],
    }),
}));
