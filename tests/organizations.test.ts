import { describe, expect, it } from "bun:test";
import { app } from "@/app/api/[[...slugs]]/route";
import { db } from "@/db";
import { organizations, organizationMembers, user } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("Organizations Module Unit Tests", () => {
    it("GET /api/organizations - should return list of organizations with 200 status", async () => {
        const req = new Request("http://localhost/api/organizations");
        const res = await app.handle(req);
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
    });

    it("GET /api/organizations/:id - should return 404 for non-existent org ID", async () => {
        const req = new Request("http://localhost/api/organizations/non-existent-id-999");
        const res = await app.handle(req);
        expect(res.status).toBe(404);

        const body = await res.json();
        expect(body.message).toBe("Organization not found");
    });

    it("POST /api/organizations - should return 401 for unauthenticated request", async () => {
        const req = new Request("http://localhost/api/organizations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Unauthenticated Org Test",
                type: "BUYER",
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });

    it("PATCH /api/organizations/:id - should return 401 for unauthenticated profile update", async () => {
        const req = new Request("http://localhost/api/organizations/org-buyer-001", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Hacked Org Name",
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });
});
