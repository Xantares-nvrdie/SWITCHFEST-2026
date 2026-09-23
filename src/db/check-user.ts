import { db } from "@/db";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";

const targetEmail = "test2@gmail.com";

const foundUser = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, targetEmail),
});

if (!foundUser) {
    console.log("User not found:", targetEmail);
    process.exit(1);
}

console.log("\n=== USER ===");
console.log("ID:", foundUser.id);
console.log("Name:", foundUser.name);
console.log("Email:", foundUser.email);
console.log("Role:", foundUser.role);

const memberships = await db.query.organizationMembers.findMany({
    where: (m, { eq }) => eq(m.userId, foundUser.id),
    with: {
        organization: true,
    },
});

console.log("\n=== MEMBERSHIPS ===");
for (const m of memberships) {
    console.log(`- OrgID: ${m.organizationId}`);
    console.log(`  Org Name: ${(m as any).organization?.name}`);
    console.log(`  Role: ${m.role}`);
    console.log(`  Status: ${m.status}`);
}

process.exit(0);
