import { t } from "elysia";

export namespace BidModel {
    export const submitSealedBody = t.Object({
        organizationId: t.String(),
        commitmentHash: t.String({ description: "Hash(tender_id + vendor_org + bid_payload + bid_salt)" }),
        // Crypto & Encrypted payload
        encryptedPayload: t.String({ description: "Ciphertext AES-GCM encrypted in browser" }),
        kdfAlgorithm: t.Optional(t.String({ default: "Argon2id" })),
        kdfSalt: t.String({ description: "Salt for Argon2id KDF" }),
        encryptionAlgorithm: t.Optional(t.String({ default: "AES-GCM" })),
        encryptionIv: t.String({ description: "Initialization Vector IV for AES-GCM" }),
        bidSalt: t.String({ description: "Salt used in commitment hash" }),
        storageProvider: t.Optional(t.String({ default: "POSTGRESQL" })),
        storageKey: t.Optional(t.String()),
    });

    export const submitRevealBody = t.Object({
        revealedPayload: t.Any({ description: "Decrypted JSON bid payload" }),
        bidSalt: t.String({ description: "Salt submitted during commit phase" }),
        verifiedBy: t.Optional(t.String()),
    });

    export type submitSealedInput = typeof submitSealedBody.static;
    export type submitRevealInput = typeof submitRevealBody.static;
}
