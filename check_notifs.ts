import { db } from "./src/db";
import { notifications } from "./src/db/schema";
import { desc, like } from "drizzle-orm";

async function test() {
    const notifs = await db.select().from(notifications).where(like(notifications.title, "%Reveal Dimulai%")).orderBy(desc(notifications.createdAt)).limit(10);
    console.log("Notifs sent:", notifs);
}

test().catch(console.error).finally(() => process.exit(0));
