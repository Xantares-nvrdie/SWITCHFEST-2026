import { db } from "@/db";
import { notifications } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

export class NotificationService {
    static async getUserNotifications(userId: string) {
        return await db.query.notifications.findMany({
            where: (n, { eq }) => eq(n.userId, userId),
            orderBy: [desc(notifications.createdAt)],
            limit: 50,
        });
    }

    static async markAsRead(notificationId: string, userId: string) {
        await db.update(notifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(notifications.id, notificationId),
                    eq(notifications.userId, userId)
                )
            );
        return { success: true };
    }

    static async markAllAsRead(userId: string) {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));
        return { success: true };
    }

    static async create(data: { userId: string, title: string, message: string, type: "INFO" | "SUCCESS" | "WARNING", link?: string }) {
        const id = crypto.randomUUID();
        await db.insert(notifications).values({
            id,
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link,
            createdAt: new Date(),
        });
        return { id };
    }
}
