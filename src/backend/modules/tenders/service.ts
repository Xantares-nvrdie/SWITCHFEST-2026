import { db } from "@/db";
import { tenderCriteria, tenderFields, tenders, bidScores, tenderResults, blockchainTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { TenderModel } from "./model";
import { contract } from "@/lib/web3";

export abstract class TenderService {
    static async create(data: TenderModel.createInput & { createdBy: string }) {

        const tenderId = crypto.randomUUID();
        const now = new Date();
        const commitDeadlineDate = new Date(data.commitDeadline);
        const revealWindowHours = data.revealWindowHours ?? 48;
        const revealDeadlineDate = new Date(commitDeadlineDate.getTime() + revealWindowHours * 60 * 60 * 1000);

        await db.insert(tenders).values({
            id: tenderId,
            organizationId: data.organizationId,
            createdBy: data.createdBy,
            code: data.code,
            title: data.title,
            description: data.description,
            category: data.category,
            status: "DRAFT",
            commitDeadline: commitDeadlineDate,
            revealWindowHours,
            revealDeadline: revealDeadlineDate,
            createdAt: now,
            updatedAt: now,
        });

        return { id: tenderId };
    }

    static async getAll() {
        return db.query.tenders.findMany({
            with: {
                organization: true,
                participants: true,
                bids: true,
            },
            orderBy: (tenders, { desc }) => [desc(tenders.createdAt)],
        });
    }

    static async getById(id: string) {
        const tender = await db.query.tenders.findFirst({
            where: (t, { eq }) => eq(t.id, id),
            with: {
                organization: true,
                creator: true,
            },
        });

        if (!tender) return null;

        const fields = await db.query.tenderFields.findMany({
            where: (f, { eq }) => eq(f.tenderId, id),
        });

        const criteria = await db.query.tenderCriteria.findMany({
            where: (c, { eq }) => eq(c.tenderId, id),
        });

        const participants = await db.query.tenderParticipants.findMany({
            where: (p, { eq }) => eq(p.tenderId, id),
            with: {
                organization: true,
            },
        });

        return {
            ...tender,
            fields,
            criteria,
            participants,
        };
    }

    static async updateStatus(id: string, status: TenderModel.updateStatusInput["status"]) {
        const now = new Date();
        const updatePayload: Record<string, unknown> = {
            status,
            updatedAt: now,
        };

        if (status === "OPEN") {
            updatePayload.openedAt = now;
            // Create tender on Smart Contract
            const tender = await db.query.tenders.findFirst({ where: (t, { eq }) => eq(t.id, id) });
            if (tender && tender.commitDeadline) {
                try {
                    const tx = await contract.createTender(id, Math.floor(tender.commitDeadline.getTime() / 1000));
                    await tx.wait();
                } catch (err) {
                    console.error("Failed to create tender on smart contract:", err);
                }
            }
        } else if (status === "CLOSED") {
            updatePayload.closedAt = now;
        } else if (status === "COMPLETED") {
            updatePayload.completedAt = now;
        }

        await db.update(tenders).set(updatePayload).where(eq(tenders.id, id));
    }

    static async addField(tenderId: string, data: TenderModel.addFieldInput) {
        const fieldId = crypto.randomUUID();
        await db.insert(tenderFields).values({
            id: fieldId,
            tenderId,
            name: data.name,
            key: data.key,
            type: data.type,
            required: data.required ?? true,
            options: data.options,
            validationRules: data.validationRules,
            sortOrder: data.sortOrder ?? 0,
            createdAt: new Date(),
        });

        return { id: fieldId };
    }

    static async addCriterion(tenderId: string, data: TenderModel.addCriterionInput) {
        const criterionId = crypto.randomUUID();
        const now = new Date();

        await db.insert(tenderCriteria).values({
            id: criterionId,
            tenderId,
            name: data.name,
            description: data.description,
            weight: data.weight.toString(),
            scoringType: data.scoringType ?? "MANUAL",
            maxScore: (data.maxScore ?? 100).toString(),
            sortOrder: data.sortOrder ?? 0,
            createdAt: now,
            updatedAt: now,
        });

        return { id: criterionId };
    }
    static async finalizeTender(tenderId: string, payload: TenderModel.finalizeInput, userId: string) {
        const tender = await db.query.tenders.findFirst({
            where: (t, { eq }) => eq(t.id, tenderId),
        });

        if (!tender) throw new Error("Tender not found");
        if (tender.status !== "CLOSED") {
            throw new Error("Tender can only be finalized if its status is CLOSED");
        }

        const now = new Date();

        // 1. Transaction to save all scores, results, and mock blockchain
        await db.transaction(async (tx) => {
            // A. Save Scores for each bid
            for (const bid of payload.bids) {
                for (const score of bid.criteriaScores) {
                    await tx.insert(bidScores).values({
                        id: crypto.randomUUID(),
                        bidId: bid.bidId,
                        criterionId: score.criterionId,
                        rawScore: score.rawScore.toString(),
                        weightedScore: score.weightedScore.toString(),
                        scoredBy: userId,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }

            // B. Send Final Result to Smart Contract
            let txHash = `0xmocktxhash${crypto.randomUUID().replace(/-/g, "")}`;
            try {
                const winningBid = await db.query.bids.findFirst({ where: (b, { eq }) => eq(b.id, payload.winningBidId) });
                if (winningBid) {
                    const scTx = await contract.finalizeTender(tenderId, winningBid.organizationId, payload.finalScore.toString());
                    const receipt = await scTx.wait();
                    txHash = receipt.hash;
                }
            } catch (err) {
                console.error("Failed to finalize tender on smart contract:", err);
            }

            await tx.insert(tenderResults).values({
                id: crypto.randomUUID(),
                tenderId,
                winningBidId: payload.winningBidId,
                finalScore: payload.finalScore.toString(),
                decidedBy: userId,
                decidedAt: now,
                blockchainTxHash: txHash,
                createdAt: now,
            });

            // C. Blockchain Transaction Record
            await tx.insert(blockchainTransactions).values({
                id: crypto.randomUUID(),
                tenderId,
                bidId: payload.winningBidId,
                transactionType: "RESULT",
                txHash: txHash,
                chainId: 31337,
                contractAddress: await contract.getAddress(),
                blockNumber: 0,
                blockTimestamp: now,
                metadata: {
                    action: "finalize",
                    winningBidId: payload.winningBidId,
                    finalScore: payload.finalScore
                },
                createdAt: now,
            });

            // D. Update Tender Status
            await tx.update(tenders).set({
                status: "COMPLETED",
                completedAt: now,
                updatedAt: now,
            }).where(eq(tenders.id, tenderId));
        });

        return { success: true };
    }

    static async getAuditData(tenderId: string) {
        const tender = await db.query.tenders.findFirst({
            where: (t, { eq }) => eq(t.id, tenderId),
        });

        if (!tender || tender.status !== "COMPLETED") {
            throw new Error("Tender is not completed yet or not found");
        }

        const result = await db.query.tenderResults.findFirst({
            where: (tr, { eq }) => eq(tr.tenderId, tenderId),
        });

        const tx = await db.query.blockchainTransactions.findFirst({
            where: (t, { eq }) => eq(t.tenderId, tenderId),
        });

        // Fetch scores manually
        const allBids = await db.query.bids.findMany({
            where: (b, { eq }) => eq(b.tenderId, tenderId),
            with: {
                organization: true,
                reveal: true,
            }
        });

        const bidIds = allBids.map(b => b.id);
        
        let allScores = [];
        if (bidIds.length > 0) {
            // Using raw select for IN clause workaround if inArray is not imported
            // We can just query all and filter, or fetch one by one
            for (const bId of bidIds) {
                const scores = await db.query.bidScores.findMany({
                    where: (s, { eq }) => eq(s.bidId, bId)
                });
                allScores.push(...scores);
            }
        }

        return {
            tender,
            result,
            transaction: tx,
            bids: allBids,
            scores: allScores
        };
    }
}
