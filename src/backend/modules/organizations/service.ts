import { db } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { OrganizationModel } from "./model";

export abstract class OrganizationService {
    static async create(data: OrganizationModel.createInput, creatorUserId: string) {
        const orgId = crypto.randomUUID();
        const now = new Date();

        await db.transaction(async (tx) => {
            await tx.insert(organizations).values({
                id: orgId,
                name: data.name,
                type: data.type ?? "BOTH",
                legalName: data.legalName,
                registrationNumber: data.registrationNumber,
                email: data.email,
                phone: data.phone,
                address: data.address,
                walletAddress: data.walletAddress,
                createdAt: now,
                updatedAt: now,
            });

            // Creator becomes ORGANIZATION_ADMIN
            await tx.insert(organizationMembers).values({
                id: crypto.randomUUID(),
                organizationId: orgId,
                userId: creatorUserId,
                role: "ORGANIZATION_ADMIN",
                status: "ACTIVE",
                joinedAt: now,
                createdAt: now,
                updatedAt: now,
            });
        });

        return { id: orgId };
    }

    static async getAll() {
        return db.select().from(organizations);
    }

    static async getById(id: string) {
        const org = await db.query.organizations.findFirst({
            where: (o, { eq }) => eq(o.id, id),
        });

        if (!org) return null;

        const members = await db.query.organizationMembers.findMany({
            where: (m, { eq }) => eq(m.organizationId, id),
            with: {
                user: true,
            },
        });

        return { ...org, members };
    }

    static async update(id: string, data: OrganizationModel.updateInput) {
        await db
            .update(organizations)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(organizations.id, id));
    }

    static async verify(id: string, data: OrganizationModel.verifyInput, verifierUserId: string) {
        const now = new Date();
        const isApproved = data.status === "APPROVED";

        await db
            .update(organizations)
            .set({
                verificationStatus: data.status,
                isVerified: isApproved,
                verifiedAt: now,
                verifiedBy: verifierUserId,
                rejectionReason: isApproved ? null : (data.rejectionReason ?? null),
                updatedAt: now,
            })
            .where(eq(organizations.id, id));
    }


    static async addMember(organizationId: string, data: OrganizationModel.addMemberInput) {
        const memberId = crypto.randomUUID();
        const now = new Date();

        await db.insert(organizationMembers).values({
            id: memberId,
            organizationId,
            userId: data.userId,
            role: data.role,
            status: data.status ?? "ACTIVE",
            joinedAt: now,
            createdAt: now,
            updatedAt: now,
        });

        return { id: memberId };
    }

    static async updateMember(memberId: string, data: OrganizationModel.updateMemberInput) {
        await db
            .update(organizationMembers)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(organizationMembers.id, memberId));
    }
}
