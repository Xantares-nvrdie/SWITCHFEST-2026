import { Elysia, t } from "elysia";
import { db } from "@/db";
import { organizationInvites, organizationMembers, organizations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import type { OrgRole } from "@/backend/utils/rbac";

// ─── Helper ──────────────────────────────────────────────────────────────────

function generateInviteCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars I/O/0/1
    let code = "TS-";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

// ─── Module ──────────────────────────────────────────────────────────────────

const invitesModule = new Elysia({ prefix: "/organizations", tags: ["Organizations"] })
    .use(betterAuthMiddleware)

    // ── Generate invite code (admin only) ────────────────────────────────────
    .post(
        "/:id/invites",
        async ({ params, body, user, set }) => {
            if (!user) { set.status = 401; return { message: "Unauthorized" }; }

            // Must be ORGANIZATION_ADMIN of this org
            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, params.id), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });
            if (!member || member.role !== "ORGANIZATION_ADMIN") {
                set.status = 403;
                return { message: "Only Organization Admins can generate invite codes" };
            }

            // Generate unique code
            let code = generateInviteCode();
            let attempts = 0;
            while (attempts < 5) {
                const existing = await db.query.organizationInvites.findFirst({
                    where: (i, { eq }) => eq(i.code, code),
                });
                if (!existing) break;
                code = generateInviteCode();
                attempts++;
            }

            const expiresAt = body.expiresInDays
                ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
                : null;

            const inviteId = crypto.randomUUID();
            await db.insert(organizationInvites).values({
                id: inviteId,
                organizationId: params.id,
                role: (body.role ?? "MEMBER") as OrgRole,
                code,
                maxUses: body.maxUses ?? null,
                usesCount: 0,
                expiresAt: expiresAt ?? undefined,
                isActive: true,
                createdBy: user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            set.status = 201;
            return { message: "Invite code generated", data: { id: inviteId, code, role: body.role ?? "MEMBER" } };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: t.Object({
                role: t.Optional(
                    t.Union([
                        t.Literal("ORGANIZATION_ADMIN"),
                        t.Literal("PROCUREMENT_OFFICER"),
                        t.Literal("AUDITOR"),
                        t.Literal("MEMBER"),
                    ]),
                ),
                maxUses: t.Optional(t.Number({ minimum: 1 })),
                expiresInDays: t.Optional(t.Number({ minimum: 1, maximum: 365 })),
            }),
            detail: { summary: "Generate invite code", description: "Membuat kode undangan baru untuk organisasi." },
        },
    )

    // ── List invite codes (admin only) ───────────────────────────────────────
    .get(
        "/:id/invites",
        async ({ params, user, set }) => {
            if (!user) { set.status = 401; return { message: "Unauthorized" }; }

            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, params.id), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });
            if (!member || member.role !== "ORGANIZATION_ADMIN") {
                set.status = 403;
                return { message: "Forbidden" };
            }

            const invites = await db.query.organizationInvites.findMany({
                where: (i, { eq }) => eq(i.organizationId, params.id),
                with: { createdBy: { columns: { name: true, email: true } } },
                orderBy: (i, { desc }) => [desc(i.createdAt)],
            });

            return invites;
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            detail: { summary: "List invite codes", description: "Mengambil semua kode undangan organisasi." },
        },
    )

    // ── Revoke invite code (admin only) ─────────────────────────────────────
    .patch(
        "/:id/invites/:inviteId/revoke",
        async ({ params, user, set }) => {
            if (!user) { set.status = 401; return { message: "Unauthorized" }; }

            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, params.id), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });
            if (!member || member.role !== "ORGANIZATION_ADMIN") {
                set.status = 403;
                return { message: "Forbidden" };
            }

            await db
                .update(organizationInvites)
                .set({ isActive: false, updatedAt: new Date() })
                .where(
                    and(
                        eq(organizationInvites.id, params.inviteId),
                        eq(organizationInvites.organizationId, params.id),
                    ),
                );

            return { message: "Invite code revoked" };
        },
        {
            auth: true,
            params: t.Object({ id: t.String(), inviteId: t.String() }),
            detail: { summary: "Revoke invite code", description: "Menonaktifkan kode undangan." },
        },
    )

    // ── List members (any member of the org can view) ────────────────────────
    .get(
        "/:id/members",
        async ({ params, user, set }) => {
            if (!user) { set.status = 401; return { message: "Unauthorized" }; }

            // Must be a member of the org
            const self = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, params.id), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });
            if (!self) { set.status = 403; return { message: "Forbidden" }; }

            const members = await db.query.organizationMembers.findMany({
                where: (m, { eq }) => eq(m.organizationId, params.id),
                with: { user: { columns: { id: true, name: true, email: true, image: true } } },
                orderBy: (m, { asc }) => [asc(m.createdAt)],
            });

            return members;
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            detail: { summary: "List org members", description: "Mengambil daftar anggota organisasi." },
        },
    )

    // ── Update member role/status (admin only) ───────────────────────────────
    .patch(
        "/:id/members/:memberId",
        async ({ params, body, user, set }) => {
            if (!user) { set.status = 401; return { message: "Unauthorized" }; }

            const admin = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, params.id), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });
            if (!admin || admin.role !== "ORGANIZATION_ADMIN") {
                set.status = 403;
                return { message: "Only Organization Admins can update member roles" };
            }

            // Prevent admin from changing their own role
            const target = await db.query.organizationMembers.findFirst({
                where: (m, { eq }) => eq(m.id, params.memberId),
            });
            if (target?.userId === user.id) {
                set.status = 400;
                return { message: "Cannot change your own role" };
            }

            await db
                .update(organizationMembers)
                .set({ ...body, updatedAt: new Date() })
                .where(eq(organizationMembers.id, params.memberId));

            return { message: "Member updated successfully" };
        },
        {
            auth: true,
            params: t.Object({ id: t.String(), memberId: t.String() }),
            body: t.Object({
                role: t.Optional(
                    t.Union([
                        t.Literal("ORGANIZATION_ADMIN"),
                        t.Literal("PROCUREMENT_OFFICER"),
                        t.Literal("AUDITOR"),
                        t.Literal("MEMBER"),
                    ]),
                ),
                status: t.Optional(
                    t.Union([t.Literal("ACTIVE"), t.Literal("SUSPENDED"), t.Literal("INVITED")]),
                ),
            }),
            detail: { summary: "Update member role/status", description: "Mengubah role atau status anggota." },
        },
    );

// ── Join via invite code (separate prefix) ────────────────────────────────────
export const joinViaInviteModule = new Elysia({ prefix: "/invites", tags: ["Organizations"] })
    .use(betterAuthMiddleware)
    .post(
        "/join",
        async ({ body, user, set }) => {
            if (!user) { set.status = 401; return { message: "Unauthorized" }; }

            const code = body.code.toUpperCase().trim();

            const invite = await db.query.organizationInvites.findFirst({
                where: (i, { eq }) => eq(i.code, code),
                with: { organization: true },
            });

            if (!invite || !invite.isActive) {
                set.status = 404;
                return { message: "Invalid or expired invite code" };
            }

            if (invite.expiresAt && new Date() > invite.expiresAt) {
                set.status = 400;
                return { message: "This invite code has expired" };
            }

            if (invite.maxUses !== null && invite.usesCount >= invite.maxUses) {
                set.status = 400;
                return { message: "This invite code has reached its maximum uses" };
            }

            // Check if already a member
            const existing = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, invite.organizationId), eq(m.userId, user.id)),
            });
            if (existing) {
                set.status = 409;
                return { message: "You are already a member of this organization" };
            }

            const now = new Date();

            // Add member + increment uses_count in a transaction
            await db.transaction(async (tx) => {
                await tx.insert(organizationMembers).values({
                    id: crypto.randomUUID(),
                    organizationId: invite.organizationId,
                    userId: user.id,
                    role: invite.role,
                    status: "ACTIVE",
                    joinedAt: now,
                    createdAt: now,
                    updatedAt: now,
                });

                await tx
                    .update(organizationInvites)
                    .set({ usesCount: invite.usesCount + 1, updatedAt: now })
                    .where(eq(organizationInvites.id, invite.id));
            });

            return {
                message: `Joined ${invite.organization.name} as ${invite.role}`,
                data: {
                    organizationId: invite.organizationId,
                    organizationName: invite.organization.name,
                    role: invite.role,
                },
            };
        },
        {
            auth: true,
            body: t.Object({ code: t.String({ minLength: 5 }) }),
            detail: { summary: "Join organization via invite code", description: "Bergabung ke organisasi menggunakan kode undangan." },
        },
    );

export default invitesModule;
