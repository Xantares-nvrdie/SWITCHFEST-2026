import { Elysia, t } from "elysia";
import { ProcurementModel } from "./model";
import { ProcurementService } from "./service";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";

const procurementModule = new Elysia({ prefix: "/procurement", tags: ["Procurement"] })
    .use(betterAuthMiddleware)
    .post(
        "/scores",
        async ({ body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const result = await ProcurementService.scoreBid(body);
            set.status = 201;
            return { message: "Bid scored successfully", data: result };
        },
        {
            auth: true,
            body: ProcurementModel.scoreBidBody,
            detail: {
                summary: "Score bid criterion",
                description: "Procurement officer/evaluator menilai kriteria penawaran vendor.",
            },
        },
    )

    .post(
        "/tenders/:tenderId/results",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const result = await ProcurementService.recordResult(params.tenderId, body);
            set.status = 201;
            return { message: "Tender result recorded successfully", data: result };
        },
        {
            auth: true,
            params: t.Object({ tenderId: t.String() }),
            body: ProcurementModel.recordResultBody,
            detail: {
                summary: "Record tender winner & result",
                description: "Menetapkan pemenang tender dan mencatat skor akhir serta keputusan.",
            },
        },
    )

    .get(
        "/tenders/:tenderId/results",
        async ({ params, set }) => {
            const data = await ProcurementService.getResult(params.tenderId);
            if (!data) {
                set.status = 404;
                return { message: "Tender result not published yet" };
            }
            return data;
        },
        {
            params: t.Object({ tenderId: t.String() }),
            detail: {
                summary: "Get tender result",
                description: "Mengambil data pemenang dan hasil akhir keputusan tender.",
            },
        },
    )

    .post(
        "/documents",
        async ({ body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const result = await ProcurementService.uploadDocument(body);
            set.status = 201;
            return { message: "Document metadata stored successfully", data: result };
        },
        {
            auth: true,
            body: ProcurementModel.uploadDocumentBody,
            detail: {
                summary: "Record document metadata",
                description: "Menyimpan metadata & file hash proposal vendor (S3/IPFS/Local).",
            },
        },
    )

    .post(
        "/blockchain-tx",
        async ({ body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const result = await ProcurementService.recordBlockchainTx(body);
            set.status = 201;
            return { message: "Blockchain transaction recorded successfully", data: result };
        },
        {
            auth: true,
            body: ProcurementModel.recordBlockchainTxBody,
            detail: {
                summary: "Record blockchain transaction",
                description: "Mencatat tx_hash transaksi COMMIT / REVEAL_ATTESTATION on-chain.",
            },
        },
    );

export default procurementModule;
