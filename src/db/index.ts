import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
    conn: Pool | undefined;
};

const pool = globalForDb.conn ?? new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = pool;

pool.on("error", (err: Error) => {
    console.error("Database connection error (idle client):", err.message);
});

export const db = drizzle(pool, { schema });
