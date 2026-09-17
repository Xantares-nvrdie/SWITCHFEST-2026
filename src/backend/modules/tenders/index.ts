import { Elysia, t } from "elysia";
import { TenderModel } from "./model";
import { TenderService } from "./service";

const tendersModule = new Elysia({ prefix: "/tenders", tags: ["Tenders"] })
    .get(
        "/",
        async () => {
            return await TenderService.getAll();
        },
        {
            detail: {
                summary: "Get all tenders",
                description: "Mengambil daftar seluruh tender di sistem.",
            },
        },
    )

    .get(
        "/:id",
        async ({ params, set }) => {
            const data = await TenderService.getById(params.id);
            if (!data) {
                set.status = 404;
                return { message: "Tender not found" };
            }
            return data;
        },
        {
            params: t.Object({ id: t.String() }),
            detail: {
                summary: "Get tender by ID",
                description: "Mengambil detail tender beserta dynamic fields, kriteria penilaian, dan peserta.",
            },
        },
    )

    .post(
        "/",
        async ({ body, set }) => {
            const result = await TenderService.create(body);
            set.status = 201;
            return { message: "Tender created successfully", data: result };
        },
        {
            body: TenderModel.createBody,
            detail: {
                summary: "Create a new tender",
                description: "Membuat draft tender baru beserta penentuan batas waktu commit & reveal.",
            },
        },
    )

    .patch(
        "/:id/status",
        async ({ params, body }) => {
            await TenderService.updateStatus(params.id, body.status);
            return { message: `Tender status updated to ${body.status}` };
        },
        {
            params: t.Object({ id: t.String() }),
            body: TenderModel.updateStatusBody,
            detail: {
                summary: "Update tender status",
                description: "Mengubah alur status tender (DRAFT -> OPEN -> CLOSED -> REVEAL -> SCORING -> COMPLETED).",
            },
        },
    )

    .post(
        "/:id/fields",
        async ({ params, body, set }) => {
            const result = await TenderService.addField(params.id, body);
            set.status = 201;
            return { message: "Dynamic tender field added successfully", data: result };
        },
        {
            params: t.Object({ id: t.String() }),
            body: TenderModel.addFieldBody,
            detail: {
                summary: "Add dynamic field to tender",
                description: "Menambahkan input field kustom untuk formulir penawaran vendor.",
            },
        },
    )

    .post(
        "/:id/criteria",
        async ({ params, body, set }) => {
            const result = await TenderService.addCriterion(params.id, body);
            set.status = 201;
            return { message: "Tender evaluation criterion added successfully", data: result };
        },
        {
            params: t.Object({ id: t.String() }),
            body: TenderModel.addCriterionBody,
            detail: {
                summary: "Add evaluation criterion to tender",
                description: "Menambahkan kriteria dan bobot penilaian tender.",
            },
        },
    );

export default tendersModule;
