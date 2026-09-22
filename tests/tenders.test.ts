import { describe, expect, it } from "bun:test";
import { app } from "@/app/api/[[...slugs]]/route";

describe("Tenders Module Unit Tests", () => {
    it("GET /api/tenders - should return list of tenders with 200 status", async () => {
        const req = new Request("http://localhost/api/tenders");
        const res = await app.handle(req);
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
    });

    it("GET /api/tenders/:id - should return 404 for non-existent tender ID", async () => {
        const req = new Request("http://localhost/api/tenders/non-existent-tender-999");
        const res = await app.handle(req);
        expect(res.status).toBe(404);

        const body = await res.json();
        expect(body.message).toBe("Tender not found");
    });

    it("POST /api/tenders - should block unauthenticated tender creation with 401", async () => {
        const req = new Request("http://localhost/api/tenders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                organizationId: "org-buyer-001",
                code: "TND-UNAUTH-01",
                title: "Unauthenticated Test Tender",
                description: "Test description",
                category: "IT",
                commitDeadline: new Date(Date.now() + 86400000).toISOString(),
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });

    it("PATCH /api/tenders/:id/status - should block status update without login with 401", async () => {
        const req = new Request("http://localhost/api/tenders/tnd-demo-001/status", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "OPEN" }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });

    it("POST /api/tenders/:id/fields - should block field addition without login with 401", async () => {
        const req = new Request("http://localhost/api/tenders/tnd-demo-001/fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Harga Satuan",
                key: "unit_price",
                type: "number",
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });


    it("POST /api/tenders/:id/criteria - should block criteria addition without login with 401", async () => {
        const req = new Request("http://localhost/api/tenders/tnd-demo-001/criteria", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Harga Penawaran",
                weight: 40,
                scoringType: "AUTOMATIC",
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });
});
