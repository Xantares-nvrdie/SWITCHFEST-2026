import { relations } from "drizzle-orm";
import { user, userWallets } from "./auth";
import { organizations } from "./organizations";
import { organizationMembers } from "./organization-members";
import { organizationInvites } from "./organization-invites";
import { tenders } from "./tenders";
import { tenderParticipants } from "./tender-participants";
import { tenderCriteria } from "./tender-criteria";
import { bids } from "./bids";

// ─── User Relations ───────────────────────────────────────────────────────────
export const userRelations = relations(user, ({ many }) => ({
    wallets: many(userWallets),
    memberships: many(organizationMembers),
    tenders: many(tenders),
}));

export const userWalletsRelations = relations(userWallets, ({ one }) => ({
    user: one(user, { fields: [userWallets.userId], references: [user.id] }),
}));

// ─── Organization Relations ───────────────────────────────────────────────────
export const organizationsRelations = relations(organizations, ({ many }) => ({
    members: many(organizationMembers),
    tenders: many(tenders),
    tenderParticipants: many(tenderParticipants),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
    organization: one(organizations, {
        fields: [organizationMembers.organizationId],
        references: [organizations.id],
    }),
    user: one(user, {
        fields: [organizationMembers.userId],
        references: [user.id],
    }),
}));

// ─── Tender Relations ─────────────────────────────────────────────────────────
export const tendersRelations = relations(tenders, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [tenders.organizationId],
        references: [organizations.id],
    }),
    createdBy: one(user, {
        fields: [tenders.createdBy],
        references: [user.id],
    }),
    participants: many(tenderParticipants),
    criteria: many(tenderCriteria),
    bids: many(bids),
}));

export const tenderParticipantsRelations = relations(tenderParticipants, ({ one }) => ({
    tender: one(tenders, {
        fields: [tenderParticipants.tenderId],
        references: [tenders.id],
    }),
    organization: one(organizations, {
        fields: [tenderParticipants.organizationId],
        references: [organizations.id],
    }),
}));

export const tenderCriteriaRelations = relations(tenderCriteria, ({ one }) => ({
    tender: one(tenders, {
        fields: [tenderCriteria.tenderId],
        references: [tenders.id],
    }),
}));

// ─── Bid Relations ────────────────────────────────────────────────────────────
export const bidsRelations = relations(bids, ({ one }) => ({
    tender: one(tenders, {
        fields: [bids.tenderId],
        references: [tenders.id],
    }),
    organization: one(organizations, {
        fields: [bids.organizationId],
        references: [organizations.id],
    }),
}));
