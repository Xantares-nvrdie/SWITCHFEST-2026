import { Elysia, t } from "elysia";
import { AdminModel } from "./model";
import { AdminService } from "./service";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { requireSystemAdmin } from "@/backend/utils/rbac";

const adminModule = new Elysia({ prefix: "/admin", tags: ["System Admin"] })
    .use(betterAuthMiddleware)

    // ── Get System Stats ─────────────────────────────────────────────────────
    .get(
        "/stats",
        async () => {
            return await AdminService.getStats();
        },
        {
            auth: true,
            beforeHandle: [requireSystemAdmin],
            detail: {
                summary: "Get platform statistics",
                description: "Mengambil statistik pengguna, organisasi, tender, dan bid platform TenderSeal.",
            },
        },
    )

    // ── Get Organizations for Review ──────────────────────────────────────────
    .get(
        "/organizations",
        async ({ query }) => {
            const status = query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined;
            return await AdminService.getOrganizations(status);
        },
        {
            auth: true,
            beforeHandle: [requireSystemAdmin],
            query: t.Object({
                status: t.Optional(t.Union([t.Literal("PENDING"), t.Literal("APPROVED"), t.Literal("REJECTED")])),
            }),
            detail: {
                summary: "List organizations for approval review",
                description: "Mengambil daftar seluruh organisasi beserta status verifikasinya.",
            },
        },
    )

    // ── Verify / Approve / Reject Organization ────────────────────────────────
    .patch(
        "/organizations/:id/verify",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            const result = await AdminService.verifyOrganization(params.id, body, user.id);
            return {
                message: `Organization ${body.status.toLowerCase()} successfully`,
                data: result,
            };
        },
        {
            auth: true,
            beforeHandle: [requireSystemAdmin],
            params: t.Object({ id: t.String() }),
            body: AdminModel.verifyOrgBody,
            detail: {
                summary: "Approve or Reject organization registration",
                description: "Menyetujui (Approve) atau Menolak (Reject) pendaftaran organisasi oleh System Admin.",
            },
        },
    )

    // ── Get All Platform Users ───────────────────────────────────────────────
    .get(
        "/users",
        async () => {
            return await AdminService.getUsers();
        },
        {
            auth: true,
            beforeHandle: [requireSystemAdmin],
            detail: {
                summary: "List system users",
                description: "Mengambil daftar seluruh pengguna platform TenderSeal.",
            },
        },
    )

    // ── Update System User Role ──────────────────────────────────────────────
    .patch(
        "/users/:id/role",
        async ({ params, body }) => {
            const result = await AdminService.updateUserRole(params.id, body.role);
            return {
                message: `User role updated to ${body.role}`,
                data: result,
            };
        },
        {
            auth: true,
            beforeHandle: [requireSystemAdmin],
            params: t.Object({ id: t.String() }),
            body: AdminModel.updateUserRoleBody,
            detail: {
                summary: "Update user system role",
                description: "Mengubah role sistem pengguna menjadi 'admin' atau 'user'.",
            },
        },
    );

export default adminModule;
