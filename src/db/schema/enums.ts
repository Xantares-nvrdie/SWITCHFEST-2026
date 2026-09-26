import { pgEnum } from "drizzle-orm/pg-core";

// ─── Organization ────────────────────────────────────────────────────────────
export const organizationTypeEnum = pgEnum("organization_type", ["BUYER", "VENDOR", "BOTH"]);
export const organizationVerificationStatusEnum = pgEnum("organization_verification_status", [
    "PENDING",
    "APPROVED",
    "REJECTED",
]);

export const organizationMemberRoleEnum = pgEnum("organization_member_role", [
    "ORGANIZATION_ADMIN",
    "PROCUREMENT_OFFICER",
    "AUDITOR",
    "MEMBER",
]);

export const organizationMemberStatusEnum = pgEnum("organization_member_status", ["INVITED", "ACTIVE", "SUSPENDED"]);

// ─── Tender ──────────────────────────────────────────────────────────────────
export const tenderStatusEnum = pgEnum("tender_status", [
    "DRAFT",
    "OPEN",
    "CLOSED",
    "REVEAL",
    "SCORING",
    "TIED",
    "COMPLETED",
    "CANCELLED",
]);

export const tenderParticipantStatusEnum = pgEnum("tender_participant_status", [
    "INVITED",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
]);

// ─── Bid ─────────────────────────────────────────────────────────────────────
export const bidStatusEnum = pgEnum("bid_status", ["SEALED", "REVEALED_VALID", "REVEALED_INVALID", "NOT_REVEALED"]);

// ─── Blockchain ───────────────────────────────────────────────────────────────
export const blockchainTransactionTypeEnum = pgEnum("blockchain_transaction_type", [
    "COMMIT",
    "REVEAL_ATTESTATION",
    "TENDER_STATE",
    "RESULT",
]);
