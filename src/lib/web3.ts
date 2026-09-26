import { ethers } from "ethers";
import TenderSealABI from "./TenderSealABI.json";

// CONTRACT_ADDRESS: gunakan tanpa prefix NEXT_PUBLIC_ agar terbaca di server-side (API/backend)
export const CONTRACT_ADDRESS =
    process.env.CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x8e0dce737aC922f30bc2fc30d9930657029b6553";

const PRIMARY_RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const FALLBACK_RPCS = [
    "https://rpc.sepolia.org",
    "https://sepolia.drpc.org",
    "https://1rpc.io/sepolia",
];

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Backend provider & relayer wallet — using FallbackProvider for resilience
function buildProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(PRIMARY_RPC, undefined, {
        staticNetwork: true,
    });
}

export let provider = buildProvider();
export let relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
export let contract = new ethers.Contract(CONTRACT_ADDRESS, TenderSealABI, relayerWallet);

/**
 * Menjalankan transaksi smart contract dengan retry + fallback RPC.
 * Mencoba primary RPC terlebih dahulu, lalu fallback jika gagal koneksi.
 */
export async function sendContractTx<T>(
    fn: (c: ethers.Contract) => Promise<T>,
    maxRetries = 3,
): Promise<T> {
    const rpcs = [PRIMARY_RPC, ...FALLBACK_RPCS];
    let lastError: Error | null = null;

    for (const rpcUrl of rpcs) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const p = new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true });
                const w = new ethers.Wallet(RELAYER_PRIVATE_KEY, p);
                const c = new ethers.Contract(CONTRACT_ADDRESS, TenderSealABI, w);
                return await fn(c);
            } catch (err: any) {
                lastError = err;
                const isRetryable =
                    err.code === "ECONNRESET" ||
                    err.code === "ETIMEDOUT" ||
                    err.code === "ECONNREFUSED" ||
                    err.code === "UND_ERR_CONNECT_TIMEOUT" ||
                    err.code === "SERVER_ERROR" ||
                    err.message?.includes("failed to detect network") ||
                    err.message?.includes("ECONNRESET") ||
                    err.message?.includes("rate limit");

                if (!isRetryable) throw err;

                const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
                console.warn(
                    `[web3] RPC ${rpcUrl} attempt ${attempt}/${maxRetries} failed: ${err.code || err.message}. ` +
                    `Retrying in ${backoffMs}ms...`,
                );
                await new Promise((r) => setTimeout(r, backoffMs));
            }
        }
        console.warn(`[web3] All retries exhausted for ${rpcUrl}, trying next RPC...`);
    }

    throw lastError || new Error("All RPC endpoints failed");
}
