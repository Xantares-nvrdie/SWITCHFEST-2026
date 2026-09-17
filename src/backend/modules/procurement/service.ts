import { db } from "@/db";
import { bidScores, blockchainTransactions, documents, tenderCriteria, tenderResults } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ProcurementModel } from "./model";

export abstract class ProcurementService {
    static async scoreBid(data: ProcurementModel.scoreBidInput) {
        const criterion = await db.query.tenderCriteria.findFirst({
            where: (c, { eq }) => eq(c.id, data.criterionId),
        });

        if (!criterion) {
            throw new Error("Criterion not found");
        }

        const weightNumber = Number(criterion.weight);
        const weightedScore = (data.rawScore * weightNumber) / 100;
        const scoreId = crypto.randomUUID();
        const now = new Date();

        await db.insert(bidScores).values({
            id: scoreId,
            bidId: data.bidId,
            criterionId: data.criterionId,
            rawScore: data.rawScore.toFixed(2),
            weightedScore: weightedScore.toFixed(2),
            notes: data.notes,
            scoredBy: data.scoredBy,
            createdAt: now,
            updatedAt: now,
        });

        return { id: scoreId, weightedScore };
    }

    static async recordResult(tenderId: string, data: ProcurementModel.recordResultInput) {
        const resultId = crypto.randomUUID();
        const now = new Date();

        await db.insert(tenderResults).values({
            id: resultId,
            tenderId,
            winningBidId: data.winningBidId,
            finalScore: data.finalScore.toFixed(2),
            decisionNotes: data.decisionNotes,
            decidedBy: data.decidedBy,
            decidedAt: now,
            blockchainTxHash: data.blockchainTxHash,
            createdAt: now,
        });

        return { id: resultId };
    }

    static async getResult(tenderId: string) {
        return db.query.tenderResults.findFirst({
            where: (tr, { eq }) => eq(tr.tenderId, tenderId),
            with: {
                tender: true,
                winningBid: {
                    with: {
                        organization: true,
                    },
                },
            },
        });
    }

    static async uploadDocument(data: ProcurementModel.uploadDocumentInput) {
        const docId = crypto.randomUUID();

        await db.insert(documents).values({
            id: docId,
            bidId: data.bidId,
            fileName: data.fileName,
            mimeType: data.mimeType,
            fileSize: data.fileSize,
            storageProvider: data.storageProvider,
            storageKey: data.storageKey,
            fileHash: data.fileHash,
            isEncrypted: data.isEncrypted ?? true,
            uploadedAt: new Date(),
        });

        return { id: docId };
    }

    static async recordBlockchainTx(data: ProcurementModel.recordBlockchainTxInput) {
        const txId = crypto.randomUUID();

        await db.insert(blockchainTransactions).values({
            id: txId,
            tenderId: data.tenderId,
            bidId: data.bidId,
            transactionType: data.transactionType,
            txHash: data.txHash,
            chainId: data.chainId,
            contractAddress: data.contractAddress,
            walletAddress: data.walletAddress,
            blockNumber: data.blockNumber,
            blockTimestamp: data.blockTimestamp ? new Date(data.blockTimestamp) : null,
            metadata: data.metadata,
            createdAt: new Date(),
        });

        return { id: txId };
    }
}
