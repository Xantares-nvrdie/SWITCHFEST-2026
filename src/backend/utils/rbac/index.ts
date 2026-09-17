import { db } from "@/db";
import { organizationMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Elysia, status } from "elysia";
import betterAuthMiddleware from "../better-auth/middleware";

export type OrgRole = "ORGANIZATION_ADMIN" | "PROCUREMENT_OFFICER" | "AUDITOR" | "MEMBER";

export const rbacMiddleware = new Elysia({ name: "rbac" }).use(betterAuthMiddleware).macro({
    requireOrgRole: (allowedRoles: OrgRole[]) => ({
        async resolve({ request: { headers }, params, body, set }) {
            const session = await betterAuthMiddleware.decorator;
            // Get organizationId from params or body if provided
            const orgId =
                (params as Record<string, string>)?.id ||
                (params as Record<string, string>)?.organizationId ||
                (body as Record<string, string>)?.organizationId;

            if (!orgId) {
                set.status = 400;
                return { message: "Organization ID is required for role verification" };
            }

            // Query organization member role
            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) => and(eq(m.organizationId, orgId), eq(m.status, "ACTIVE")),
            });

            if (!member || !allowedRoles.includes(member.role as OrgRole)) {
                set.status = 403;
                return { message: "Forbidden: You do not have the required organization permission" };
            }

            return {
                orgMember: member,
            };
        },
    }),
});

/**
 * Helper utility to verify if a user has specific role in an organization
 */
export async function checkUserOrgRole(userId: string, organizationId: string, allowedRoles: OrgRole[]) {
    const member = await db.query.organizationMembers.findFirst({
        where: (m, { eq, and }) =>
            and(eq(m.userId, userId), eq(m.organizationId, organizationId), eq(m.status, "ACTIVE")),
    });

    if (!member) return false;
    return allowedRoles.includes(member.role as OrgRole);
}
