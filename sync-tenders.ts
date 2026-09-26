import { ethers } from "ethers";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./src/db/schema";
import abi from "./src/lib/TenderSealABI.json";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function main() {
    const rpc = process.env.RPC_URL;
    const pk = process.env.RELAYER_PRIVATE_KEY;
    const address = process.env.CONTRACT_ADDRESS;
    const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

    if (!rpc || !pk || !address || !dbUrl) throw new Error("Missing env vars");

    // Own isolated pool so it doesn't compete with dev server
    const pool = new Pool({ connectionString: dbUrl, max: 1 });
    const db = drizzle(pool, { schema });

    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(pk, provider);
    const contract = new ethers.Contract(address, abi, wallet);

    const allTenders = await db.query.tenders.findMany();

    for (const tender of allTenders) {
        if (!tender.commitDeadline) continue;
        const deadline = Math.floor(new Date(tender.commitDeadline).getTime() / 1000);
        const tieBreakHash = (tender as any).tieBreakPolicyHash || ethers.ZeroHash;

        try {
            console.log(`Creating ${tender.id} on chain...`);
            const tx = await contract.createTender(tender.id, deadline, tieBreakHash);
            await tx.wait();
            console.log(`✓ Created ${tender.id}`);
        } catch (e: any) {
            console.log(`✗ Failed ${tender.id}:`, e.reason || e.shortMessage || e.message);
        }
    }

    await pool.end();
    console.log("Done.");
}

main().catch(console.error);
