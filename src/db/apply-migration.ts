import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
const client = await pool.connect();

try {
    console.log("🔄 Applying migration with safe ENUM handling...");

    // 1. Safely create ENUMs
    const enums = [
        `DO $$ BEGIN CREATE TYPE "public"."bid_status" AS ENUM('SEALED', 'REVEALED_VALID', 'REVEALED_INVALID', 'NOT_REVEALED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
        `DO $$ BEGIN CREATE TYPE "public"."blockchain_transaction_type" AS ENUM('COMMIT', 'REVEAL_ATTESTATION', 'TENDER_STATE', 'RESULT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
        `DO $$ BEGIN CREATE TYPE "public"."organization_member_role" AS ENUM('ORGANIZATION_ADMIN', 'PROCUREMENT_OFFICER', 'AUDITOR', 'MEMBER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
        `DO $$ BEGIN CREATE TYPE "public"."organization_member_status" AS ENUM('INVITED', 'ACTIVE', 'SUSPENDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
        `DO $$ BEGIN CREATE TYPE "public"."organization_type" AS ENUM('BUYER', 'VENDOR', 'BOTH'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
        `DO $$ BEGIN CREATE TYPE "public"."tender_participant_status" AS ENUM('INVITED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
        `DO $$ BEGIN CREATE TYPE "public"."tender_status" AS ENUM('DRAFT', 'OPEN', 'CLOSED', 'REVEAL', 'SCORING', 'COMPLETED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    ];

    for (const sql of enums) {
        await client.query(sql);
        console.log("  ✓ ENUM created/skipped");
    }

    // 2. Read migration file and strip CREATE TYPE lines (already handled above)
    const migrationSql = readFileSync("./drizzle/0000_abnormal_clea.sql", "utf-8");

    // Split on Drizzle's statement-breakpoint marker
    const statements = migrationSql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        // Skip CREATE TYPE statements (handled above)
        .filter((s) => !s.startsWith("CREATE TYPE"));

    let applied = 0;
    let skipped = 0;

    for (const stmt of statements) {
        try {
            await client.query(stmt);
            applied++;
            const preview = stmt.slice(0, 60).replace(/\n/g, " ");
            console.log(`  ✓ ${preview}...`);
        } catch (err: unknown) {
            const pgErr = err as { code?: string; message?: string };
            if (
                pgErr.code === "42P07" || // relation already exists
                pgErr.code === "42710" || // duplicate object (enum/type)
                pgErr.code === "42701"    // duplicate column
            ) {
                skipped++;
                console.log(`  ⚠ Skipped (already exists): ${stmt.slice(0, 50)}...`);
            } else {
                console.error(`  ✗ Failed: ${stmt.slice(0, 80)}`);
                console.error(`    Error: ${pgErr.message}`);
            }
        }
    }

    console.log(`\n✅ Migration complete — ${applied} applied, ${skipped} skipped`);
} finally {
    client.release();
    await pool.end();
}
