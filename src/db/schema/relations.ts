import { relations } from "drizzle-orm";
import { user, userWallets } from "./auth";
import { organizations } from "./organizations";
import { organizationMembers } from "./organization-members";
import { organizationInvites } from "./organization-invites";
import { tenders } from "./tenders";
import { tenderParticipants } from "./tender-participants";
import { tenderCriteria } from "./tender-criteria";
import { bidCrypto, bidReveals, bids, encryptedBids } from "./bids";

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
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
    members: many(organizationMembers),
    invites: many(organizationInvites),
    tenders: many(tenders),
    tenderParticipants: many(tenderParticipants),
    verifier: one(user, {
        fields: [organizations.verifiedBy],
        references: [user.id],
    }),
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

export const organizationInvitesRelations = relations(organizationInvites, ({ one }) => ({
    organization: one(organizations, {
        fields: [organizationInvites.organizationId],
        references: [organizations.id],
    }),
    createdBy: one(user, {
        fields: [organizationInvites.createdBy],
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
    creator: one(user, {
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
    crypto: one(bidCrypto, {
        fields: [bids.id],
        references: [bidCrypto.bidId],
    }),
    encryptedPayload: one(encryptedBids, {
        fields: [bids.id],
        references: [encryptedBids.bidId],
    }),
    reveal: one(bidReveals, {
        fields: [bids.id],
        references: [bidReveals.bidId],
    }),
}));

export const bidCryptoRelations = relations(bidCrypto, ({ one }) => ({
    bid: one(bids, {
        fields: [bidCrypto.bidId],
        references: [bids.id],
    }),
}));

export const encryptedBidsRelations = relations(encryptedBids, ({ one }) => ({
    bid: one(bids, {
        fields: [encryptedBids.bidId],
        references: [bids.id],
    }),
}));

export const bidRevealsRelations = relations(bidReveals, ({ one }) => ({
    bid: one(bids, {
        fields: [bidReveals.bidId],
        references: [bids.id],
    }),
}));

import { auditLogs } from "./audit-logs";
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(user, {
        fields: [auditLogs.userId],
        references: [user.id],
    }),
    organization: one(organizations, {
        fields: [auditLogs.organizationId],
        references: [organizations.id],
    }),
    tender: one(tenders, {
        fields: [auditLogs.tenderId],
        references: [tenders.id],
    }),
    bid: one(bids, {
        fields: [auditLogs.bidId],
        references: [bids.id],
    }),
}));

