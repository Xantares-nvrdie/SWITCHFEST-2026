import { Elysia, t } from "elysia";
import { OrganizationModel } from "./model";
import { OrganizationService } from "./service";

const organizationsModule = new Elysia({ prefix: "/organizations", tags: ["Organizations"] })
    .get(
        "/",
        async () => {
            return await OrganizationService.getAll();
        },
        {
            detail: {
                summary: "Get all organizations",
                description: "Mengambil daftar seluruh organisasi yang terdaftar di TenderSeal.",
            },
        },
    )

    .get(
        "/by-user/:userId",
        async ({ params }) => {
            return await OrganizationService.getByUserId(params.userId);
        },
        {
            params: t.Object({ userId: t.String() }),
            detail: {
                summary: "Get organizations by user ID",
                description: "Mengambil daftar organisasi yang diikuti oleh user tertentu berdasarkan keanggotaan.",
            },
        },
    )

    .get(
        "/:id",
        async ({ params, set }) => {
            const data = await OrganizationService.getById(params.id);
            if (!data) {
                set.status = 404;
                return { message: "Organization not found" };
            }
            return data;
        },
        {
            params: t.Object({ id: t.String() }),
            detail: {
                summary: "Get organization by ID",
                description: "Mengambil data detail organisasi dan anggotanya berdasarkan ID.",
            },
        },
    )

    .post(
        "/",
        async ({ body, set, request }) => {
            // Extract user from better-auth session cookie
            const cookieHeader = request.headers.get("cookie") ?? "";
            const sessionToken = cookieHeader
                .split(";")
                .map((c) => c.trim())
                .find((c) => c.startsWith("better-auth.session_token="))
                ?.split("=")[1];

            const creatorId = sessionToken ?? "system-user";
            const result = await OrganizationService.create(body, creatorId);
            set.status = 201;
            return { message: "Organization created successfully", data: result };
        },
        {
            body: OrganizationModel.createBody,
            detail: {
                summary: "Create a new organization",
                description: "Mendaftarkan organisasi baru dan menetapkan pembuat sebagai Admin Organisasi.",
            },
        },
    )

    .patch(
        "/:id",
        async ({ params, body }) => {
            await OrganizationService.update(params.id, body);
            return { message: "Organization updated successfully" };
        },
        {
            params: t.Object({ id: t.String() }),
            body: OrganizationModel.updateBody,
            detail: {
                summary: "Update organization details",
                description: "Memperbarui informasi profil atau status aktif organisasi.",
            },
        },
    )

    .post(
        "/:id/members",
        async ({ params, body, set }) => {
            const result = await OrganizationService.addMember(params.id, body);
            set.status = 201;
            return { message: "Member added successfully", data: result };
        },
        {
            params: t.Object({ id: t.String() }),
            body: OrganizationModel.addMemberBody,
            detail: {
                summary: "Add member to organization",
                description: "Menambahkan anggota baru ke organisasi dengan role tertentu.",
            },
        },
    )

    .patch(
        "/:id/members/:memberId",
        async ({ params, body }) => {
            await OrganizationService.updateMember(params.memberId, body);
            return { message: "Organization member updated successfully" };
        },
        {
            params: t.Object({ id: t.String(), memberId: t.String() }),
            body: OrganizationModel.updateMemberBody,
            detail: {
                summary: "Update organization member",
                description: "Memperbarui role atau status keanggotaan seseorang dalam organisasi.",
            },
        },
    );

export default organizationsModule;
