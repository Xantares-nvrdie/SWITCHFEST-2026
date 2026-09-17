import Elysia from "elysia";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";

const baseRoute = new Elysia({
    prefix: "/base",
})

    .use(betterAuthMiddleware)

    .get("/", () => {
        return "Hello!";
    })

    .get(
        "/auth",
        ({ user, status }) => {
            if (!user) {
                return status(403, "Unauthenticated!");
            }

            return `Welcome, ${user.name}`;
        },
        {
            auth: true,
        },
    );

export default baseRoute;
