import { db } from "./src/db";
import { bids, organizationMembers, tenders } from "./src/db/schema";
import { eq, desc } from "drizzle-orm";

async function test() {
    const latestTenders = await db.select().from(tenders).orderBy(desc(tenders.createdAt)).limit(3);
    for (const tender of latestTenders) {
        console.log(`\nTender: ${tender.id} | Title: ${tender.title} | Status: ${tender.status}`);
        
        const tenderBids = await db.select().from(bids).where(eq(bids.tenderId, tender.id));
        console.log(`Bids count: ${tenderBids.length}`);
        
        const query = await db.select({ userId: organizationMembers.userId })
                            .from(bids)
                            .innerJoin(organizationMembers, eq(bids.organizationId, organizationMembers.organizationId))
                            .where(eq(bids.tenderId, tender.id));
        console.log(`Members to notify:`, query);
    }
}

test().catch(console.error).finally(() => process.exit(0));
