import { jsonb, pgTable, text, timestamp, unique, index } from "drizzle-orm/pg-core";
import { bidStatusEnum } from "./enums";
import { tenders } from "./tenders";
import { organizations } from "./organizations";
import { user } from "./auth";

// Metadata dan lifecycle bid — BUKAN plaintext bid (README §12.3)
export const bids = pgTable(
    "bids",
    {
        id: text("id").primaryKey(),
        tenderId: text("tender_id")
            .notNull()
            .references(() => tenders.id, { onDelete: "restrict" }),
        organizationId: text("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "restrict" }),
        // Hash(tender_id + vendor_id + bid_data + bid_salt) — dicatat juga on-chain
        commitmentHash: text("commitment_hash").notNull(),
        status: bidStatusEnum("status").default("SEALED").notNull(),
        // Waktu vendor submit — wajib ada saat bid di-submit
        submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull(),
        revealedAt: timestamp("revealed_at", { withTimezone: true }),
        verifiedAt: timestamp("verified_at", { withTimezone: true }),
        // Keterangan hasil verifikasi commitment
        verificationMessage: text("verification_message"),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (t) => [
        // Satu vendor hanya boleh submit satu bid per tender
        unique("uq_bids_tender_org").on(t.tenderId, t.organizationId),
        index("idx_bids_tender_id").on(t.tenderId),
        index("idx_bids_org_id").on(t.organizationId),
    ],
);

// Tabel bid_reveals — Menyimpan payload bid yang sudah di-reveal & terverifikasi (README §11.1 & §12.3)
export const bidReveals = pgTable("bid_reveals", {
    id: text("id").primaryKey(),
    bidId: text("bid_id")
        .notNull()
        .unique()
        .references(() => bids.id, { onDelete: "cascade" }),
    revealedPayload: jsonb("revealed_payload").notNull(),
    revealHash: text("reveal_hash").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).defaultNow().notNull(),
    verifiedBy: text("verified_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Metadata kriptografi — TIDAK menyimpan PIN/secret/key plaintext
export const bidCrypto = pgTable("bid_crypto", {
    id: text("id").primaryKey(),
    bidId: text("bid_id")
        .notNull()
        .unique()
        .references(() => bids.id, { onDelete: "cascade" }),
    // KDF
    kdfAlgorithm: text("kdf_algorithm").default("Argon2id").notNull(),
    kdfSalt: text("kdf_salt").notNull(), // bukan secret; dibutuhkan untuk recovery
    // Encryption
    encryptionAlgorithm: text("encryption_algorithm").notNull(), // e.g. "AES-GCM"
    encryptionIv: text("encryption_iv").notNull(), // IV / nonce; bukan secret
    // Commitment
    bidSalt: text("bid_salt").notNull(), // salt untuk commitment hash
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// Payload bid terenkripsi — server tidak pernah simpan plaintext bid sebelum reveal
export const encryptedBids = pgTable("encrypted_bids", {
    id: text("id").primaryKey(),
    bidId: text("bid_id")
        .notNull()
        .unique()
        .references(() => bids.id, { onDelete: "cascade" }),
    // Nullable: bisa null jika payload disimpan di object storage
    encryptedPayload: text("encrypted_payload"),
    // "POSTGRESQL" | "S3" | "IPFS" dll.
    storageProvider: text("storage_provider").default("POSTGRESQL").notNull(),
    storageKey: text("storage_key"),
    payloadHash: text("payload_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
