import { db } from "@/db";
import { tenderCriteria, tenderFields, tenders } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { TenderModel } from "./model";

export abstract class TenderService {
    static async create(data: TenderModel.createInput & { createdBy: string }) {

        const tenderId = crypto.randomUUID();
        const now = new Date();
        const commitDeadlineDate = new Date(data.commitDeadline);
        const revealWindowHours = data.revealWindowHours ?? 48;
        const revealDeadlineDate = new Date(commitDeadlineDate.getTime() + revealWindowHours * 60 * 60 * 1000);

        await db.insert(tenders).values({
            id: tenderId,
            organizationId: data.organizationId,
            createdBy: data.createdBy,
            code: data.code,
            title: data.title,
            description: data.description,
            category: data.category,
            status: "DRAFT",
            commitDeadline: commitDeadlineDate,
            revealWindowHours,
            revealDeadline: revealDeadlineDate,
            createdAt: now,
            updatedAt: now,
        });

        return { id: tenderId };
    }

    static async getAll() {
        return db.select().from(tenders);
    }

    static async getById(id: string) {
        const tender = await db.query.tenders.findFirst({
            where: (t, { eq }) => eq(t.id, id),
            with: {
                organization: true,
                creator: true,
            },
        });

        if (!tender) return null;

        const fields = await db.query.tenderFields.findMany({
            where: (f, { eq }) => eq(f.tenderId, id),
        });

        const criteria = await db.query.tenderCriteria.findMany({
            where: (c, { eq }) => eq(c.tenderId, id),
        });

        const participants = await db.query.tenderParticipants.findMany({
            where: (p, { eq }) => eq(p.tenderId, id),
            with: {
                organization: true,
            },
        });

        return {
            ...tender,
            fields,
            criteria,
            participants,
        };
    }

    static async updateStatus(id: string, status: TenderModel.updateStatusInput["status"]) {
        const now = new Date();
        const updatePayload: Record<string, unknown> = {
            status,
            updatedAt: now,
        };

        if (status === "OPEN") {
            updatePayload.openedAt = now;
        } else if (status === "CLOSED") {
            updatePayload.closedAt = now;
        } else if (status === "COMPLETED") {
            updatePayload.completedAt = now;
        }

        await db.update(tenders).set(updatePayload).where(eq(tenders.id, id));
    }

    static async addField(tenderId: string, data: TenderModel.addFieldInput) {
        const fieldId = crypto.randomUUID();
        await db.insert(tenderFields).values({
            id: fieldId,
            tenderId,
            name: data.name,
            key: data.key,
            type: data.type,
            required: data.required ?? true,
            options: data.options,
            validationRules: data.validationRules,
            sortOrder: data.sortOrder ?? 0,
            createdAt: new Date(),
        });

        return { id: fieldId };
    }

    static async addCriterion(tenderId: string, data: TenderModel.addCriterionInput) {
        const criterionId = crypto.randomUUID();
        const now = new Date();

        await db.insert(tenderCriteria).values({
            id: criterionId,
            tenderId,
            name: data.name,
            description: data.description,
            weight: data.weight.toString(),
            scoringType: data.scoringType ?? "MANUAL",
            maxScore: (data.maxScore ?? 100).toString(),
            sortOrder: data.sortOrder ?? 0,
            createdAt: now,
            updatedAt: now,
        });

        return { id: criterionId };
    }
}
