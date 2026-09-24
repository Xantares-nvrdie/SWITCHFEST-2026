import { createHash } from "node:crypto";
import { db } from "@/db";
import { bidCrypto, bidReveals, bids, encryptedBids } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { BidModel } from "./model";
import { contract } from "@/lib/web3";

export abstract class BidService {
    static async getBidsForUser(userId: string) {
        const userOrgs = await db.query.organizationMembers.findMany({
            where: (m, { eq, and }) => and(eq(m.userId, userId), eq(m.status, "ACTIVE")),
            columns: { organizationId: true }
        });
        
        const orgIds = userOrgs.map(o => o.organizationId);
        if (orgIds.length === 0) return [];
        
        return db.query.bids.findMany({
            where: (b, { inArray }) => inArray(b.organizationId, orgIds),
            with: {
                tender: true,
                organization: true,
            },
            orderBy: (b, { desc }) => [desc(b.createdAt)]
        });
    }

    static async getByTenderId(tenderId: string) {
        return db.query.bids.findMany({
            where: (b, { eq }) => eq(b.tenderId, tenderId),
            with: {
                organization: true,
                crypto: true,
                encryptedPayload: true,
                reveal: true,
            },
        });
    }

    static async getById(bidId: string) {
        return db.query.bids.findFirst({
            where: (b, { eq }) => eq(b.id, bidId),
            with: {
                organization: true,
                tender: true,
                crypto: true,
                encryptedPayload: true,
                reveal: true,
            },
        });
    }

    static async submitSealed(tenderId: string, data: BidModel.submitSealedInput) {
        const bidId = crypto.randomUUID();
        const cryptoId = crypto.randomUUID();
        const encryptedBidId = crypto.randomUUID();
        const now = new Date();

        // Calculate payload hash using node:crypto
        const payloadHash = createHash("sha256").update(data.encryptedPayload).digest("hex");

        await db.transaction(async (tx) => {
            // 1. Insert bids metadata (SEALED)
            await tx.insert(bids).values({
                id: bidId,
                tenderId,
                organizationId: data.organizationId,
                commitmentHash: data.commitmentHash,
                status: "SEALED",
                submittedAt: now,
                createdAt: now,
                updatedAt: now,
            });

            // 2. Insert bid_crypto (KDF & IV metadata - NO secrets stored)
            await tx.insert(bidCrypto).values({
                id: cryptoId,
                bidId,
                kdfAlgorithm: data.kdfAlgorithm ?? "Argon2id",
                kdfSalt: data.kdfSalt,
                encryptionAlgorithm: data.encryptionAlgorithm ?? "AES-GCM",
                encryptionIv: data.encryptionIv,
                bidSalt: data.bidSalt,
                createdAt: now,
                updatedAt: now,
            });

            // 3. Insert encrypted_bids payload
            await tx.insert(encryptedBids).values({
                id: encryptedBidId,
                bidId,
                encryptedPayload: data.encryptedPayload,
                storageProvider: data.storageProvider ?? "POSTGRESQL",
                storageKey: data.storageKey,
                payloadHash,
                createdAt: now,
                updatedAt: now,
            });
        });

        try {
            // Submit to blockchain via Relayer (Gasless for user)
            const tx = await contract.commitBid(tenderId, data.organizationId, data.commitmentHash);
            await tx.wait();
        } catch (error) {
            console.error("Relayer failed to commit bid to blockchain:", error);
            // We might want to revert or flag the bid, but for now we just log it
        }

        return { id: bidId, commitmentHash: data.commitmentHash };
    }

    static async submitReveal(bidId: string, data: BidModel.submitRevealInput) {
        const existingBid = await db.query.bids.findFirst({
            where: (b, { eq }) => eq(b.id, bidId),
            with: { crypto: true },
        });

        if (!existingBid) {
            throw new Error("Bid not found");
        }

        const now = new Date();
        const payloadJsonString = JSON.stringify(data.revealedPayload);

        // Re-calculate commitment hash: Hash(tender_id + vendor_org + bid_payload + bid_salt)
        const computedHash = createHash("sha256")
            .update(`${existingBid.tenderId}:${existingBid.organizationId}:${payloadJsonString}:${data.bidSalt}`)
            .digest("hex");

        const isValid = computedHash === existingBid.commitmentHash;
        const status = isValid ? "REVEALED_VALID" : "REVEALED_INVALID";
        const message = isValid ? "Commitment hash matched" : "Commitment hash mismatch! Payload was modified.";

        await db.transaction(async (tx) => {
            // Update bids status
            await tx
                .update(bids)
                .set({
                    status,
                    revealedAt: now,
                    verifiedAt: now,
                    verificationMessage: message,
                    updatedAt: now,
                })
                .where(eq(bids.id, bidId));

            if (isValid) {
                // Save verified reveal payload for scoring engine
                const revealHash = createHash("sha256").update(payloadJsonString).digest("hex");

                await tx.insert(bidReveals).values({
                    id: crypto.randomUUID(),
                    bidId,
                    revealedPayload: data.revealedPayload,
                    revealHash,
                    verifiedAt: now,
                    verifiedBy: data.verifiedBy,
                    createdAt: now,
                });
            }
        });

        if (isValid) {
            // Attest reveal on Smart Contract (Relayer signs this)
            try {
                // Find tenderId for this bid
                const bidRecord = await db.query.bids.findFirst({ where: (b, { eq }) => eq(b.id, bidId) });
                if (bidRecord) {
                    const tx = await contract.attestReveal(bidRecord.tenderId, bidRecord.organizationId);
                    await tx.wait();
                }
            } catch (err) {
                console.error("Failed to attest reveal on smart contract:", err);
            }
        }

        return {
            bidId,
            status,
            isValid,
            message,
        };
    }
}
