import { Elysia, t } from "elysia";
import { BidModel } from "./model";
import { BidService } from "./service";

const bidsModule = new Elysia({ prefix: "/bids", tags: ["Bids"] })
    .get(
        "/tender/:tenderId",
        async ({ params }) => {
            return await BidService.getByTenderId(params.tenderId);
        },
        {
            params: t.Object({ tenderId: t.String() }),
            detail: {
                summary: "Get bids for tender",
                description: "Mengambil daftar bid peserta pada suatu tender (hanya metadata/status).",
            },
        },
    )

    .get(
        "/:id",
        async ({ params, set }) => {
            const data = await BidService.getById(params.id);
            if (!data) {
                set.status = 404;
                return { message: "Bid not found" };
            }
            return data;
        },
        {
            params: t.Object({ id: t.String() }),
            detail: {
                summary: "Get bid by ID",
                description: "Mengambil detail metadata bid, crypto salt/IV, dan status verifikasi.",
            },
        },
    )

    .post(
        "/tender/:tenderId",
        async ({ params, body, set }) => {
            const result = await BidService.submitSealed(params.tenderId, body);
            set.status = 201;
            return { message: "Sealed bid submitted successfully", data: result };
        },
        {
            params: t.Object({ tenderId: t.String() }),
            body: BidModel.submitSealedBody,
            detail: {
                summary: "Submit sealed bid",
                description: "Mengirimkan penawaran terenkripsi (AES-GCM) dan commitment hash sebelum deadline.",
            },
        },
    )

    .post(
        "/:id/reveal",
        async ({ params, body }) => {
            const result = await BidService.submitReveal(params.id, body);
            return { message: "Reveal processed", data: result };
        },
        {
            params: t.Object({ id: t.String() }),
            body: BidModel.submitRevealBody,
            detail: {
                summary: "Submit reveal payload",
                description: "Mengirimkan dekripsi payload setelah deadline untuk verifikasi commitment hash.",
            },
        },
    );

export default bidsModule;
