import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import baseRoute from "@/backend/modules/base";
import betterAuthView from "@/backend/utils/better-auth";
import { AuthDocs } from "@/backend/utils/better-auth/docs";

const authDocs = await AuthDocs();

export const app = new Elysia({ prefix: "/api" })
    .use(
        openapi({
            path: "/labs",
            references: fromTypes("route.ts"),
            documentation: {
                info: {
                    title: "Zendriva Starter Kit",
                    version: "alpha 0.0.1",
                    description: "Automatically generated documentation and testing for easier development.",
                },
                paths: authDocs.paths as unknown as Record<string, never>,
                tags: [],
            },
            scalar: {
                defaultModelExpandDepth: -1,
                operationsSorter: "method",
            },
        }),
    )

    /* AUTH */
    .all("/auth/*", betterAuthView, { detail: { hide: true } })

    .use(baseRoute);

export type app = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;
