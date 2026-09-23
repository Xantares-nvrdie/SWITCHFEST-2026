import { db } from "@/db";
import { organizations, user, tenders, bids } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { AdminModel } from "./model";

export abstract class AdminService {
    static async getStats() {
        const allOrgs = await db.select().from(organizations);
        const allUsers = await db.select().from(user);
        const allTenders = await db.select().from(tenders);
        const allBids = await db.select().from(bids);

        const pendingOrgs = allOrgs.filter(
            (o) => (o.verificationStatus ?? (o.isVerified ? "APPROVED" : "PENDING")) === "PENDING",
        ).length;
        const approvedOrgs = allOrgs.filter(
            (o) => (o.verificationStatus ?? (o.isVerified ? "APPROVED" : "PENDING")) === "APPROVED",
        ).length;
        const rejectedOrgs = allOrgs.filter((o) => o.verificationStatus === "REJECTED").length;

        return {
            organizations: {
                total: allOrgs.length,
                pending: pendingOrgs,
                approved: approvedOrgs,
                rejected: rejectedOrgs,
            },
            users: {
                total: allUsers.length,
                admins: allUsers.filter((u) => u.role === "admin").length,
            },
            tenders: {
                total: allTenders.length,
            },
            bids: {
                total: allBids.length,
            },
        };
    }

    static async getOrganizations(statusFilter?: "PENDING" | "APPROVED" | "REJECTED") {
        const orgList = await db.query.organizations.findMany({
            with: {
                verifier: {
                    columns: { id: true, name: true, email: true },
                },
                members: true,
            },
            orderBy: (o, { desc }) => [desc(o.createdAt)],
        });

        if (!statusFilter) return orgList;

        return orgList.filter((o) => {
            const currentStatus = o.verificationStatus ?? (o.isVerified ? "APPROVED" : "PENDING");
            return currentStatus === statusFilter;
        });
    }

    static async verifyOrganization(id: string, data: AdminModel.verifyOrgInput, verifierUserId: string) {
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

        return { id, status: data.status, isVerified: isApproved };
    }

    static async getUsers() {
        return db.query.user.findMany({
            columns: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: (u, { desc }) => [desc(u.createdAt)],
        });
    }

    static async updateUserRole(userId: string, role: "admin" | "user") {
        await db.update(user).set({ role }).where(eq(user.id, userId));
        return { userId, role };
    }
}
