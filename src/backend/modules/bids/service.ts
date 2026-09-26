import { createHash } from "node:crypto";
import { db } from "@/db";
import { bidCrypto, bidReveals, bids, encryptedBids } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { BidModel } from "./model";
import { contract } from "@/lib/web3";
import { NotificationService } from "../notifications/service";

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

        const tender = await db.query.tenders.findFirst({
            where: (t, { eq }) => eq(t.id, tenderId)
        });

        if (!tender) {
            throw new Error("Tender not found");
        }

        if (tender.status !== "OPEN") {
            throw new Error(`Cannot submit bid: Tender is currently ${tender.status}, not OPEN.`);
        }

        if (tender.commitDeadline && now > tender.commitDeadline) {
            throw new Error("Tender submission deadline has passed");
        }

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

        // Submit to blockchain via Relayer (Gasless for user) - Fire and forget
        contract.commitBid(tenderId, data.organizationId, data.commitmentHash)
            .then((tx: any) => tx.wait())
            .catch((error: any) => console.error("Relayer failed to commit bid to blockchain:", error));

        try {
            const members = await db.query.organizationMembers.findMany({
                where: (m, { eq, and }) => and(eq(m.organizationId, data.organizationId), eq(m.status, "ACTIVE"))
            });
            const tenderInfo = await db.query.tenders.findFirst({ where: (t, { eq }) => eq(t.id, tenderId) });
            
            const notificationsPayload = members.map(member => ({
                userId: member.userId,
                title: "Penawaran Terkirim",
                message: `Dokumen penawaran Anda untuk tender ${tenderInfo?.code} berhasil dikirim secara enkripsi.`,
                type: "SUCCESS" as const,
                link: `/tenders/${tenderId}`
            }));
            
            await NotificationService.createMany(notificationsPayload);
        } catch (err) {
            console.error("Failed to send bid notification", err);
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

        if (existingBid.status === "REVEALED_VALID" || existingBid.status === "REVEALED_INVALID") {
            throw new Error("Penawaran ini sudah di-reveal sebelumnya.");
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
            // Attest reveal on Smart Contract (Relayer signs this) - Fire and forget
            db.query.bids.findFirst({ where: (b, { eq }) => eq(b.id, bidId) })
                .then((bidRecord: any) => {
                    if (bidRecord) {
                        return contract.attestReveal(bidRecord.tenderId, bidRecord.organizationId);
                    }
                })
                .then((tx: any) => tx && tx.wait())
                .catch((err: any) => console.error("Failed to attest reveal on smart contract:", err));
                
            // Send notification to Panitia (Creator) that a vendor has revealed
            try {
                const tenderInfo = await db.query.tenders.findFirst({
                    where: (t, { eq }) => eq(t.id, existingBid.tenderId)
                });
                const orgInfo = await db.query.organizations.findFirst({
                    where: (o, { eq }) => eq(o.id, existingBid.organizationId)
                });
                
                if (tenderInfo && tenderInfo.createdBy && orgInfo) {
                    await NotificationService.create({
                        userId: tenderInfo.createdBy,
                        title: "Dekripsi (Reveal) Berhasil!",
                        message: `Vendor ${orgInfo.name} telah berhasil mendekripsi penawaran mereka untuk tender "${tenderInfo.title}". Commitment Hash tervalidasi.`,
                        type: "SUCCESS",
                        link: `/tenders/${tenderInfo.id}`
                    });
                }
            } catch (err) {
                console.error("Failed to send reveal notification to panitia:", err);
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
