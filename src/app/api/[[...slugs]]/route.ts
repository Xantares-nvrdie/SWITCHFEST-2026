import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import baseRoute from "@/backend/modules/base";
import organizationsModule from "@/backend/modules/organizations";
import invitesModule, { joinViaInviteModule } from "@/backend/modules/organizations/invites";
import adminModule from "@/backend/modules/admin";
import tendersModule from "@/backend/modules/tenders";
import tenderParticipantsModule from "@/backend/modules/tender-participants";
import bidsModule from "@/backend/modules/bids";
import procurementModule from "@/backend/modules/procurement";
import auditLogsModule from "@/backend/modules/audit-logs";
import notificationsModule from "@/backend/modules/notifications";
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
                    title: "TenderSeal API Specification",
                    version: "v1.0.0",
                    description: "Secure Sealed Tendering API powered by Elysia, Drizzle ORM, and Better Auth.",
                },
                paths: authDocs.paths as unknown as Record<string, never>,
                tags: [
                    { name: "System Admin", description: "Platform control, stats & organization approvals" },
                    { name: "Organizations", description: "Multi-organization management & members" },
                    { name: "Tenders", description: "Tender creation, dynamic fields & evaluation criteria" },
                    { name: "Tender Participants", description: "Vendor participation & invitations" },
                    { name: "Bids", description: "Client-side encrypted sealed bidding & reveal verification" },
                    { name: "Procurement", description: "Scoring engine, winner results & blockchain logs" },
                    { name: "Audit Logs", description: "System & audit trail tracking" },
                    { name: "Notifications", description: "User notifications & inbox" },
                ],
            },
            scalar: {
                defaultModelExpandDepth: -1,
                operationsSorter: "method",
            },
        }),
    )

    /* AUTH */
    .all("/auth/*", betterAuthView, { detail: { hide: true } })

    /* FEATURE MODULES */
    .use(baseRoute)
    .use(organizationsModule)
    .use(invitesModule)
    .use(joinViaInviteModule)
    .use(adminModule)
    .use(tendersModule)
    .use(tenderParticipantsModule)
    .use(bidsModule)
    .use(procurementModule)
    .use(auditLogsModule)
    .use(notificationsModule);


export type app = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;
