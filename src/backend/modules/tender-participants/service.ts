import { db } from "@/db";
import { tenderParticipants } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { TenderParticipantModel } from "./model";

export abstract class TenderParticipantService {
    static async getByTenderId(tenderId: string) {
        return db.query.tenderParticipants.findMany({
            where: (tp, { eq }) => eq(tp.tenderId, tenderId),
            with: {
                organization: true,
            },
        });
    }

    static async invite(tenderId: string, data: TenderParticipantModel.inviteInput) {
        const participantId = crypto.randomUUID();
        const now = new Date();

        await db.insert(tenderParticipants).values({
            id: participantId,
            tenderId,
            organizationId: data.organizationId,
            status: "INVITED",
            invitedAt: now,
            createdAt: now,
            updatedAt: now,
        });

        return { id: participantId };
    }

    static async updateStatus(participantId: string, status: TenderParticipantModel.updateStatusInput["status"]) {
        const now = new Date();
        const updatePayload: Record<string, unknown> = {
            status,
            updatedAt: now,
        };

        if (status === "ACCEPTED") {
            updatePayload.acceptedAt = now;
        }

        await db.update(tenderParticipants).set(updatePayload).where(eq(tenderParticipants.id, participantId));
    }
}
