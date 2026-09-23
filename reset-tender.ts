import { db } from "./src/db";
import { tenders, tenderResults, bidScores, blockchainTransactions } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
    const tender = await db.query.tenders.findFirst();
    if (!tender) {
        console.log("No tender found");
        process.exit(1);
    }
    const tenderId = tender.id;
    console.log("Resetting tender:", tenderId);

    await db.delete(tenderResults).where(eq(tenderResults.tenderId, tenderId));
    await db.delete(blockchainTransactions).where(eq(blockchainTransactions.tenderId, tenderId));
    
    const bids = await db.query.bids.findMany({ where: (b, { eq }) => eq(b.tenderId, tenderId) });
    for (const bid of bids) {
        await db.delete(bidScores).where(eq(bidScores.bidId, bid.id));
    }

    await db.update(tenders).set({ status: "CLOSED", completedAt: null }).where(eq(tenders.id, tenderId));
    console.log("Tender reset successfully!");
    process.exit(0);
}
run();
