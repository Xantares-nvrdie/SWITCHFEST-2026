import { t } from "elysia";

export namespace ProcurementModel {
    export const scoreBidBody = t.Object({
        bidId: t.String(),
        criterionId: t.String(),
        rawScore: t.Number({ minimum: 0 }),
        notes: t.Optional(t.String()),
        scoredBy: t.String(),
    });

    export const recordResultBody = t.Object({
        winningBidId: t.String(),
        finalScore: t.Number(),
        decisionNotes: t.Optional(t.String()),
        decidedBy: t.String(),
        blockchainTxHash: t.Optional(t.String()),
    });

    export const uploadDocumentBody = t.Object({
        bidId: t.String(),
        fileName: t.String(),
        mimeType: t.String(),
        fileSize: t.Optional(t.Number()),
        storageProvider: t.String({ default: "S3" }),
        storageKey: t.String(),
        fileHash: t.String(),
        isEncrypted: t.Optional(t.Boolean({ default: true })),
    });

    export const recordBlockchainTxBody = t.Object({
        tenderId: t.String(),
        bidId: t.Optional(t.String()),
        transactionType: t.Union([
            t.Literal("COMMIT"),
            t.Literal("REVEAL_ATTESTATION"),
            t.Literal("TENDER_STATE"),
            t.Literal("RESULT"),
        ]),
        txHash: t.String(),
        chainId: t.Number(),
        contractAddress: t.String(),
        walletAddress: t.Optional(t.String()),
        blockNumber: t.Optional(t.Number()),
        blockTimestamp: t.Optional(t.String()),
        metadata: t.Optional(t.Any()),
    });

    export type scoreBidInput = typeof scoreBidBody.static;
    export type recordResultInput = typeof recordResultBody.static;
    export type uploadDocumentInput = typeof uploadDocumentBody.static;
    export type recordBlockchainTxInput = typeof recordBlockchainTxBody.static;
}
