import { describe, expect, it } from "bun:test";
import { app } from "@/app/api/[[...slugs]]/route";

describe("System Admin Module Unit Tests", () => {
    it("GET /api/admin/stats - should block unauthenticated access with 401", async () => {
        const req = new Request("http://localhost/api/admin/stats");
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });

    it("GET /api/admin/organizations - should block unauthenticated access with 401", async () => {
        const req = new Request("http://localhost/api/admin/organizations");
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });

    it("PATCH /api/admin/organizations/:id/verify - should block unauthorized approval with 401", async () => {
        const req = new Request("http://localhost/api/admin/organizations/org-buyer-001/verify", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status: "APPROVED",
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });

    it("GET /api/admin/users - should block unauthenticated access with 401", async () => {
        const req = new Request("http://localhost/api/admin/users");
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });

    it("PATCH /api/admin/users/:id/role - should block role update without login with 401", async () => {
        const req = new Request("http://localhost/api/admin/users/user-demo-001/role", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role: "admin",
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });
});
