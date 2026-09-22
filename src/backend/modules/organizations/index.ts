import { Elysia, t } from "elysia";
import { OrganizationModel } from "./model";
import { OrganizationService } from "./service";
import betterAuthMiddleware from "@/backend/utils/better-auth/middleware";
import { db } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

const organizationsModule = new Elysia({ prefix: "/organizations", tags: ["Organizations"] })
    .use(betterAuthMiddleware)

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

    // Get organizations that the current logged-in user belongs to
    .get(
        "/me",
        async ({ user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            const memberships = await db.query.organizationMembers.findMany({
                where: (m, { eq }) => eq(m.userId, user.id),
                with: { organization: true },
            });

            return memberships.map((m) => ({
                ...m.organization,
                memberRole: m.role,
                memberStatus: m.status,
            }));
        },
        {
            auth: true,
            detail: {
                summary: "Get my organizations",
                description: "Mengambil daftar organisasi yang diikuti oleh user yang sedang login.",
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
        async ({ body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const result = await OrganizationService.create(body, user.id);
            set.status = 201;
            return { message: "Organization created successfully", data: result };
        },
        {
            auth: true,
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

    .patch(
        "/:id/verify",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            await OrganizationService.verify(params.id, body, user.id);
            return { message: `Organization ${body.status.toLowerCase()} successfully` };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: OrganizationModel.verifyBody,
            detail: {
                summary: "Verify/Approve organization",
                description: "Menyetujui (Approve) atau Menolak (Reject) verifikasi organisasi oleh Admin TenderSeal.",
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
