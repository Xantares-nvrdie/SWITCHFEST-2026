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

            const memberships = await db
                .select({
                    organization: organizations,
                    memberRole: organizationMembers.role,
                    memberStatus: organizationMembers.status,
                })
                .from(organizationMembers)
                .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
                .where(eq(organizationMembers.userId, user.id));

            return memberships.map((m) => ({
                ...m.organization,
                memberRole: m.memberRole,
                memberStatus: m.memberStatus,
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
            try {
                const result = await OrganizationService.create(body, user.id);
                set.status = 201;
                return { message: "Organization created successfully", data: result };
            } catch (error: any) {
                set.status = 400;
                return { message: error.message || "Failed to create organization" };
            }
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
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            // Check if user is ORGANIZATION_ADMIN of this organization
            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, params.id), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!member || member.role !== "ORGANIZATION_ADMIN") {
                set.status = 403;
                return { message: "Forbidden: Only Organization Admins can update organization profile" };
            }

            await OrganizationService.update(params.id, body);
            return { message: "Organization updated successfully" };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: OrganizationModel.updateBody,
            detail: {
                summary: "Update organization details",
                description: "Memperbarui informasi profil organisasi (Hanya Admin Organisasi).",
            },
        },
    )

    .post(
        "/:id/members",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            const member = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, params.id), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!member || member.role !== "ORGANIZATION_ADMIN") {
                set.status = 403;
                return { message: "Forbidden: Only Organization Admins can add members" };
            }

            const result = await OrganizationService.addMember(params.id, body);
            set.status = 201;
            return { message: "Member added successfully", data: result };
        },
        {
            auth: true,
            params: t.Object({ id: t.String() }),
            body: OrganizationModel.addMemberBody,
            detail: {
                summary: "Add member to organization",
                description: "Menambahkan anggota baru ke organisasi dengan role tertentu (Hanya Admin Organisasi).",
            },
        },
    )

    .patch(
        "/:id/members/:memberId",
        async ({ params, body, user, set }) => {
            if (!user) {
                set.status = 401;
                return { message: "Unauthorized" };
            }

            const admin = await db.query.organizationMembers.findFirst({
                where: (m, { eq, and }) =>
                    and(eq(m.organizationId, params.id), eq(m.userId, user.id), eq(m.status, "ACTIVE")),
            });

            if (!admin || admin.role !== "ORGANIZATION_ADMIN") {
                set.status = 403;
                return { message: "Forbidden: Only Organization Admins can update member role/status" };
            }

            await OrganizationService.updateMember(params.memberId, body);
            return { message: "Organization member updated successfully" };
        },
        {
            auth: true,
            params: t.Object({ id: t.String(), memberId: t.String() }),
            body: OrganizationModel.updateMemberBody,
            detail: {
                summary: "Update organization member",
                description: "Memperbarui role atau status keanggotaan seseorang dalam organisasi (Hanya Admin Organisasi).",
            },
        },
    );


export default organizationsModule;
