import { t } from "elysia";

export namespace OrganizationModel {
    export const createBody = t.Object({
        name: t.String({ minLength: 2 }),
        type: t.Optional(t.Union([t.Literal("BUYER"), t.Literal("VENDOR"), t.Literal("BOTH")])),
        legalName: t.Optional(t.String()),
        registrationNumber: t.Optional(t.String()),
        email: t.Optional(t.String({ format: "email" })),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
        walletAddress: t.Optional(t.String()),
    });

    export const updateBody = t.Object({
        name: t.Optional(t.String({ minLength: 2 })),
        type: t.Optional(t.Union([t.Literal("BUYER"), t.Literal("VENDOR"), t.Literal("BOTH")])),
        legalName: t.Optional(t.String()),
        registrationNumber: t.Optional(t.String()),
        email: t.Optional(t.String({ format: "email" })),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
        walletAddress: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
    });

    export const addMemberBody = t.Object({
        userId: t.String(),
        role: t.Union([
            t.Literal("ORGANIZATION_ADMIN"),
            t.Literal("PROCUREMENT_OFFICER"),
            t.Literal("AUDITOR"),
            t.Literal("MEMBER"),
        ]),
        status: t.Optional(t.Union([t.Literal("INVITED"), t.Literal("ACTIVE"), t.Literal("SUSPENDED")])),
    });

    export const updateMemberBody = t.Object({
        role: t.Optional(
            t.Union([
                t.Literal("ORGANIZATION_ADMIN"),
                t.Literal("PROCUREMENT_OFFICER"),
                t.Literal("AUDITOR"),
                t.Literal("MEMBER"),
            ]),
        ),
        status: t.Optional(t.Union([t.Literal("INVITED"), t.Literal("ACTIVE"), t.Literal("SUSPENDED")])),
    });

    export type createInput = typeof createBody.static;
    export type updateInput = typeof updateBody.static;
    export type addMemberInput = typeof addMemberBody.static;
    export type updateMemberInput = typeof updateMemberBody.static;
}
