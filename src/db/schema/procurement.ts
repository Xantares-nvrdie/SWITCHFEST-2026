import { bigint, boolean, decimal, jsonb, pgTable, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { blockchainTransactionTypeEnum } from "./enums";
import { bids } from "./bids";
import { tenders } from "./tenders";
import { user } from "./auth";
import { tenderCriteria } from "./tender-criteria";
import { organizations } from "./organizations";

export const documents = pgTable("documents", {
    id: text("id").primaryKey(),
    bidId: text("bid_id")
        .notNull()
        .references(() => bids.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }),
    // "S3" | "IPFS" | "LOCAL" dll.
    storageProvider: varchar("storage_provider", { length: 50 }).notNull(),
    storageKey: text("storage_key").notNull(),
    fileHash: text("file_hash").notNull(),
    // File dokumen juga dienkripsi di client-side sebelum upload
    isEncrypted: boolean("is_encrypted").default(true).notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
});

export const blockchainTransactions = pgTable("blockchain_transactions", {
    id: text("id").primaryKey(),
    tenderId: text("tender_id")
        .notNull()
        .references(() => tenders.id, { onDelete: "restrict" }),
    // Nullable: beberapa transaksi bersifat level tender (TENDER_STATE)
    bidId: text("bid_id").references(() => bids.id, { onDelete: "set null" }),
    transactionType: blockchainTransactionTypeEnum("transaction_type").notNull(),
    txHash: varchar("tx_hash", { length: 100 }).notNull().unique(),
    chainId: bigint("chain_id", { mode: "number" }).notNull(),
    contractAddress: varchar("contract_address", { length: 100 }).notNull(),
    walletAddress: varchar("wallet_address", { length: 100 }),
    blockNumber: bigint("block_number", { mode: "number" }),
    blockTimestamp: timestamp("block_timestamp", { withTimezone: true }),
    // Data event tambahan
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bidScores = pgTable(
    "bid_scores",
    {
        id: text("id").primaryKey(),
        bidId: text("bid_id")
            .notNull()
            .references(() => bids.id, { onDelete: "cascade" }),
        criterionId: text("criterion_id")
            .notNull()
            .references(() => tenderCriteria.id, { onDelete: "restrict" }),
        rawScore: decimal("raw_score", { precision: 10, scale: 2 }).notNull(),
        weightedScore: decimal("weighted_score", { precision: 10, scale: 2 }).notNull(),
        notes: text("notes"),
        scoredBy: text("scored_by")
            .notNull()
            .references(() => user.id, { onDelete: "restrict" }),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => [
        // Satu bid tidak boleh punya dua score untuk kriteria yang sama
        unique("uq_bid_scores_bid_criterion").on(t.bidId, t.criterionId),
    ],
);

export const tenderResults = pgTable("tender_results", {
    id: text("id").primaryKey(),
    tenderId: text("tender_id")
        .notNull()
        .unique()
        .references(() => tenders.id, { onDelete: "restrict" }),
    winningBidId: text("winning_bid_id")
        .references(() => bids.id, { onDelete: "restrict" }),
    finalScore: decimal("final_score", { precision: 10, scale: 2 }),
    decisionNotes: text("decision_notes"),
    decidedBy: text("decided_by")
        .notNull()
        .references(() => user.id, { onDelete: "restrict" }),
    decidedAt: timestamp("decided_at", { withTimezone: true }).defaultNow().notNull(),
    blockchainTxHash: varchar("blockchain_tx_hash", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
