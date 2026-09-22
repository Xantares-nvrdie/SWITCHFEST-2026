import { describe, expect, it } from "bun:test";
import { app } from "@/app/api/[[...slugs]]/route";

describe("Bids Module Unit Tests", () => {
    it("GET /api/bids/tender/:tenderId - should return list of bids for valid tenderId", async () => {
        const req = new Request("http://localhost/api/bids/tender/tnd-demo-001");
        const res = await app.handle(req);
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
    });

    it("GET /api/bids/:id - should return 404 for non-existent bid ID", async () => {
        const req = new Request("http://localhost/api/bids/non-existent-bid-999");
        const res = await app.handle(req);
        expect(res.status).toBe(404);

        const body = await res.json();
        expect(body.message).toBe("Bid not found");
    });

    it("POST /api/bids/tender/:tenderId - should block unauthenticated sealed bid submission with 401", async () => {
        const req = new Request("http://localhost/api/bids/tender/tnd-demo-001", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                organizationId: "org-vendor-001",
                commitmentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                encryptedPayload: "U2FsdGVkX1+v2h...",
                kdfSalt: "random-salt",
                encryptionIv: "random-iv",
                bidSalt: "random-bid-salt",
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });

    it("POST /api/bids/:id/reveal - should block reveal submission without login with 401", async () => {
        const req = new Request("http://localhost/api/bids/bid-demo-001/reveal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                revealedPayload: { price: 50000000 },
                bidSalt: "random-bid-salt",
            }),
        });
        const res = await app.handle(req);
        expect(res.status).toBe(401);
    });
});
