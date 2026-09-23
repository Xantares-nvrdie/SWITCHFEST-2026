import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Starting TenderSeal database seeding...");

    const adminEmail = "admin@tenderseal.com";
    const adminPassword = "AdminPassword123!";
    const adminName = "TenderSeal System Admin";

    try {
        // Check if admin user exists
        let adminUser = await db.query.user.findFirst({
            where: (u, { eq }) => eq(u.email, adminEmail),
        });

        if (!adminUser) {
            console.log(`Creating System Admin user: ${adminEmail}...`);
            const created = await auth.api.signUpEmail({
                body: {
                    email: adminEmail,
                    password: adminPassword,
                    name: adminName,
                },
            });

            if (created?.user) {
                adminUser = created.user as unknown as typeof adminUser;
                console.log(`✅ Admin account created with ID: ${created.user.id}`);
            }

        } else {
            console.log(`Admin user ${adminEmail} already exists.`);
        }

        // Ensure user.role is set to 'admin'
        if (adminUser) {
            await db
                .update(user)
                .set({ role: "admin", emailVerified: true })
                .where(eq(user.id, adminUser.id));
            console.log(`✅ System Admin role ('admin') enforced for ${adminEmail}!`);
        }

        // Also seed demo Officer & Vendor if needed
        const officerEmail = "officer@globaltech.co.id";
        let officerUser = await db.query.user.findFirst({
            where: (u, { eq }) => eq(u.email, officerEmail),
        });
        if (!officerUser) {
            console.log(`Creating Demo Officer: ${officerEmail}...`);
            await auth.api.signUpEmail({
                body: {
                    email: officerEmail,
                    password: "OfficerPassword123!",
                    name: "Budi Santoso (Officer)",
                },
            });
            console.log(`✅ Officer account created: ${officerEmail}`);
        }

        console.log("\n🎉 Seeding completed successfully!");
        console.log("==========================================");
        console.log("👑 System Admin Credentials:");
        console.log(`   Email:    ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log("==========================================");
    } catch (err) {
        console.error("❌ Error during seeding:", err);
        process.exit(1);
    }
}

seed()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
