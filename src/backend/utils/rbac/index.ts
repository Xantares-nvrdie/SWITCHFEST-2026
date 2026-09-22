import { db } from "@/db";
import { auth } from "@/auth";
import type { Context } from "elysia";

export type OrgRole = "ORGANIZATION_ADMIN" | "PROCUREMENT_OFFICER" | "AUDITOR" | "MEMBER";

// ─── Base Auth Guard ─────────────────────────────────────────────────────────

/**
 * Requires a valid session. Use as first guard in beforeHandle chain.
 * Returns 401 if no session found.
 */
export const requireAuth = async ({ request, set }: Context) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        set.status = 401;
        return { message: "Unauthorized: Please login to continue" };
    }
    // Attach to context for downstream guards
    (request as Record<string, unknown>).__session = session;
};

// ─── Org-scoped Role Guards ──────────────────────────────────────────────────

/**
 * Factory: creates a beforeHandle guard that checks the user's role
 * within the organization resolved from params.organizationId, params.id,
 * or body.organizationId (in that priority order).
 *
 * Usage:
 *   .post("/tenders", handler, { beforeHandle: [requireAuth, procurementOnly] })
 */
export const requireOrgRole =
    (allowedRoles: OrgRole[]) =>
    async ({ request, params, body, set }: Context) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            set.status = 401;
            return { message: "Unauthorized" };
        }

        const orgId =
            (params as Record<string, string>)?.organizationId ||
            (params as Record<string, string>)?.id ||
            (body as Record<string, string>)?.organizationId;

        if (!orgId) {
            set.status = 400;
            return { message: "Organization ID is required for role verification" };
        }

        const member = await db.query.organizationMembers.findFirst({
            where: (m, { eq, and }) =>
                and(
                    eq(m.userId, session.user.id),
                    eq(m.organizationId, orgId),
                    eq(m.status, "ACTIVE"),
                ),
        });

        if (!member || !allowedRoles.includes(member.role as OrgRole)) {
            set.status = 403;
            return { message: "Forbidden: You do not have the required organization permission" };
        }
    };

// ─── Convenience Shortcuts ───────────────────────────────────────────────────

/** Only ORGANIZATION_ADMIN of the target org */
export const orgAdminOnly = requireOrgRole(["ORGANIZATION_ADMIN"]);

/** Only PROCUREMENT_OFFICER of the target org */
export const procurementOnly = requireOrgRole(["PROCUREMENT_OFFICER"]);

/** Only AUDITOR of the target org */
export const auditorOnly = requireOrgRole(["AUDITOR"]);

/** ORGANIZATION_ADMIN or PROCUREMENT_OFFICER */
export const procurementOrAdmin = requireOrgRole(["ORGANIZATION_ADMIN", "PROCUREMENT_OFFICER"]);

/** Any active member of the org (all roles) */
export const anyOrgMember = requireOrgRole(["ORGANIZATION_ADMIN", "PROCUREMENT_OFFICER", "AUDITOR", "MEMBER"]);

// ─── Helper Utility ──────────────────────────────────────────────────────────

/**
 * Programmatic check: returns true if the user has one of the allowed roles
 * in the given organization. Useful inside service/handler logic.
 */
export async function checkUserOrgRole(userId: string, organizationId: string, allowedRoles: OrgRole[]) {
    const member = await db.query.organizationMembers.findFirst({
        where: (m, { eq, and }) =>
            and(eq(m.userId, userId), eq(m.organizationId, organizationId), eq(m.status, "ACTIVE")),
    });

    if (!member) return false;
    return allowedRoles.includes(member.role as OrgRole);
}

