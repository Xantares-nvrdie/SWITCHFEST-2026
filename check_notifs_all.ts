import { db } from "./src/db";
import { notifications } from "./src/db/schema";
import { desc } from "drizzle-orm";

async function test() {
    const notifs = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(10);
    console.log("Notifs:", notifs.map(n => n.title));
}

test().catch(console.error).finally(() => process.exit(0));
