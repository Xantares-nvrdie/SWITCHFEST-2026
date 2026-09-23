import { t } from "elysia";

export namespace AdminModel {
    export const verifyOrgBody = t.Object({
        status: t.Union([t.Literal("APPROVED"), t.Literal("REJECTED")]),
        rejectionReason: t.Optional(t.String()),
    });

    export const updateUserRoleBody = t.Object({
        role: t.Union([t.Literal("admin"), t.Literal("user")]),
    });

    export type verifyOrgInput = typeof verifyOrgBody.static;
    export type updateUserRoleInput = typeof updateUserRoleBody.static;
}
