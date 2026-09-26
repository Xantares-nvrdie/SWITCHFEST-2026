import { ethers } from "ethers";
import TenderSealABI from "./TenderSealABI.json";

// CONTRACT_ADDRESS: gunakan tanpa prefix NEXT_PUBLIC_ agar terbaca di server-side (API/backend)
export const CONTRACT_ADDRESS =
    process.env.CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x8e0dce737aC922f30bc2fc30d9930657029b6553";
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Backend provider & relayer wallet
export const provider = new ethers.JsonRpcProvider(RPC_URL);
export const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

// Contract instance connected to Relayer
export const contract = new ethers.Contract(CONTRACT_ADDRESS, TenderSealABI, relayerWallet);
