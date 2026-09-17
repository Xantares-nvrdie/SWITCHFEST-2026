import { t } from "elysia";

export namespace TenderParticipantModel {
    export const inviteBody = t.Object({
        organizationId: t.String(),
    });

    export const updateStatusBody = t.Object({
        status: t.Union([t.Literal("INVITED"), t.Literal("ACCEPTED"), t.Literal("REJECTED"), t.Literal("WITHDRAWN")]),
    });

    export type inviteInput = typeof inviteBody.static;
    export type updateStatusInput = typeof updateStatusBody.static;
}
