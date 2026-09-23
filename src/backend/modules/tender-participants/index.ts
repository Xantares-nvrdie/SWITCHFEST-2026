import { Elysia, t } from "elysia";
import { TenderParticipantModel } from "./model";
import { TenderParticipantService } from "./service";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";

const tenderParticipantsModule = new Elysia({
    prefix: "/tenders/:id/participants",
    tags: ["Tender Participants"],
}).use(betterAuthMiddleware)
    .get(
        "/",
        async ({ params }) => {
            return await TenderParticipantService.getByTenderId(params.id);
        },
        {
            params: t.Object({ id: t.String() }),
            detail: {
                summary: "Get participants for tender",
                description: "Mengambil daftar organisasi vendor yang mendaftar/diundang pada tender ini.",
            },
        },
    )

    .post(
        "/",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const result = await TenderParticipantService.invite(params.id, body);
            set.status = 201;
            return { message: "Vendor organization invited successfully", data: result };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: TenderParticipantModel.inviteBody,
            detail: {
                summary: "Invite vendor organization",
                description: "Mengundang atau mengonfirmasi pendaftaran organisasi vendor ke suatu tender.",
            },
        },
    )

    .patch(
        "/:participantId/status",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            await TenderParticipantService.updateStatus(params.participantId, body.status);
            return { message: "Participant status updated successfully" };
        },
        {
            auth: true,
            params: t.Object({ id: t.String(), participantId: t.String() }),
            body: TenderParticipantModel.updateStatusBody,
            detail: {
                summary: "Update participant status",
                description: "Menerima (ACCEPTED) atau menolak (REJECTED/WITHDRAWN) partisipasi tender.",
            },
        },
    );

export default tenderParticipantsModule;
