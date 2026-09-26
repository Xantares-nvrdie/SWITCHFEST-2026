import { Elysia, t } from "elysia";
import { NotificationService } from "./service";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";

export const notificationsModule = new Elysia({ prefix: "/notifications" })
    .use(betterAuthMiddleware)
    .get(
        "/",
        async ({ user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            return await NotificationService.getUserNotifications(user.id);
        },
        {
            auth: true,
            detail: {
                summary: "Get my notifications",
                description: "Get all notifications for the current logged-in user",
            },
        },
    )
    .get(
        "/unread-count",
        async ({ user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            return { count: await NotificationService.getUnreadCount(user.id) };
        },
        {
            auth: true,
            detail: {
                summary: "Get unread notification count",
                description: "Get the current user's unread notification count.",
            },
        },
    )
    .post(
        "/:id/read",
        async ({ params, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            return await NotificationService.markAsRead(params.id, user.id);
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            detail: {
                summary: "Mark notification as read",
                description: "Mark a specific notification as read",
            },
        },
    )
    .post(
        "/read-all",
        async ({ user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            return await NotificationService.markAllAsRead(user.id);
        },
        {
            auth: true,
            detail: {
                summary: "Mark all notifications as read",
                description: "Mark all notifications for the current user as read",
            },
        },
    );

export default notificationsModule;
