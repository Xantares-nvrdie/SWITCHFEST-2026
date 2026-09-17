import { t } from "elysia";

export namespace TenderModel {
    export const createBody = t.Object({
        organizationId: t.String(),
        createdBy: t.String(),
        code: t.String({ minLength: 3 }),
        title: t.String({ minLength: 3 }),
        description: t.Optional(t.String()),
        category: t.Optional(t.String()),
        commitDeadline: t.String({ description: "ISO 8601 Timestamp string" }),
        revealWindowHours: t.Optional(t.Number({ default: 48 })),
    });

    export const updateStatusBody = t.Object({
        status: t.Union([
            t.Literal("DRAFT"),
            t.Literal("OPEN"),
            t.Literal("CLOSED"),
            t.Literal("REVEAL"),
            t.Literal("SCORING"),
            t.Literal("COMPLETED"),
            t.Literal("CANCELLED"),
        ]),
    });

    export const addFieldBody = t.Object({
        name: t.String(),
        key: t.String(),
        type: t.Union([
            t.Literal("text"),
            t.Literal("number"),
            t.Literal("currency"),
            t.Literal("file"),
            t.Literal("select"),
            t.Literal("multi-select"),
        ]),
        required: t.Optional(t.Boolean({ default: true })),
        options: t.Optional(t.Any()),
        validationRules: t.Optional(t.Any()),
        sortOrder: t.Optional(t.Number({ default: 0 })),
    });

    export const addCriterionBody = t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        weight: t.Number({ minimum: 0, maximum: 100 }),
        scoringType: t.Optional(t.String({ default: "MANUAL" })),
        maxScore: t.Optional(t.Number({ default: 100 })),
        sortOrder: t.Optional(t.Number({ default: 0 })),
    });

    export type createInput = typeof createBody.static;
    export type updateStatusInput = typeof updateStatusBody.static;
    export type addFieldInput = typeof addFieldBody.static;
    export type addCriterionInput = typeof addCriterionBody.static;
}
