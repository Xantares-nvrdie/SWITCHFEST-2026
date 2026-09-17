import { pgEnum } from "drizzle-orm/pg-core";

// ─── Organization ────────────────────────────────────────────────────────────
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
    "TENDER_CREATED",
    "COMMIT",
    "REVEAL",
    "TENDER_CLOSED",
    "RESULT_RECORDED",
]);
