import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/schema/index.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        // Direct connection (port 5432) untuk Drizzle Kit
        // Supabase pooler (port 6543) tidak support DDL statements (CREATE TABLE, dll.)
        url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
    },
});
