import { db } from "./src/db";
import { bids, organizationMembers, tenders } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function test() {
    console.log("Checking tenders");
    const tender = await db.query.tenders.findFirst();
    if (!tender) {
        console.log("No tender");
        return;
    }
    
    console.log("Tender:", tender.id);
    
    const query = await db.select({ userId: organizationMembers.userId })
                        .from(bids)
                        .innerJoin(organizationMembers, eq(bids.organizationId, organizationMembers.organizationId))
                        .where(eq(bids.tenderId, tender.id));
                        
    console.log("Query Result:", query);
}

test().catch(console.error).finally(() => process.exit(0));
