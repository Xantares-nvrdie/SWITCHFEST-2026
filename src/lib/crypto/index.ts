/**
 * Client-Side Cryptography Helper for TenderSeal
 * Implements PBKDF2/KDF Key Derivation, AES-GCM Client Encryption/Decryption,
 * and SHA-256 Commitment Hash Generation via Web Crypto API.
 */

const subtle = globalThis.crypto.subtle;

/**
 * Generate random hex salt
 */
export function generateSalt(byteLength = 16): string {
    const array = new Uint8Array(byteLength);
    globalThis.crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Convert Hex String to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Number.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

/**
 * Convert Uint8Array to Hex String
 */
export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Derive 256-bit AES-GCM key from vendor secret (PIN/Password) and KDF salt
 */
export async function deriveKdfKey(
    secret: string,
    kdfSaltHex: string,
    iterations = 100_000,
): Promise<{ key: CryptoKey; rawHex: string }> {
    const enc = new TextEncoder();
    const secretBuffer = enc.encode(secret);
    const saltBytes = hexToBytes(kdfSaltHex);

    // Import secret as raw key material for KDF
    const masterKey = await subtle.importKey("raw", secretBuffer, { name: "PBKDF2" }, false, ["deriveKey"]);

    // Derive 256-bit AES-GCM Key
    const key = await subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: saltBytes.buffer as ArrayBuffer,
            iterations,
            hash: "SHA-256",
        },
        masterKey,
        { name: "AES-GCM", length: 256 },
        true, // exportable for raw hex
        ["encrypt", "decrypt"],
    );

    const exported = new Uint8Array(await subtle.exportKey("raw", key));
    const rawHex = bytesToHex(exported);

    return { key, rawHex };
}

/**
 * Encrypt bid payload object using AES-GCM 256-bit key
 */
export async function encryptBidPayload(
    payload: unknown,
    key: CryptoKey,
): Promise<{ ciphertextHex: string; ivHex: string; payloadHash: string }> {
    const jsonString = JSON.stringify(payload);
    const enc = new TextEncoder();
    const dataBuffer = enc.encode(jsonString);

    // 12-byte random IV for AES-GCM
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv.buffer as ArrayBuffer,
        },
        key,
        dataBuffer,
    );

    const ciphertextHex = bytesToHex(new Uint8Array(encryptedBuffer));
    const ivHex = bytesToHex(iv);

    // Compute SHA-256 payload hash
    const hashBuffer = await subtle.digest("SHA-256", dataBuffer);
    const payloadHash = bytesToHex(new Uint8Array(hashBuffer));

    return { ciphertextHex, ivHex, payloadHash };
}

/**
 * Decrypt AES-GCM ciphertext back into JSON payload object
 */
export async function decryptBidPayload<T = unknown>(ciphertextHex: string, ivHex: string, key: CryptoKey): Promise<T> {
    const ciphertextBytes = hexToBytes(ciphertextHex);
    const ivBytes = hexToBytes(ivHex);

    const decryptedBuffer = await subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivBytes.buffer as ArrayBuffer,
        },
        key,
        ciphertextBytes.buffer as ArrayBuffer,
    );

    const dec = new TextDecoder();
    const jsonString = dec.decode(decryptedBuffer);
    return JSON.parse(jsonString) as T;
}

/**
 * Calculate Commitment Hash for Commit-Reveal Scheme:
 * Hash(tenderId + ":" + vendorOrgId + ":" + payloadJsonString + ":" + bidSalt)
 */
export async function calculateCommitmentHash(
    tenderId: string,
    vendorOrgId: string,
    payload: unknown,
    bidSaltHex: string,
): Promise<string> {
    const payloadJsonString = JSON.stringify(payload);
    const rawString = `${tenderId}:${vendorOrgId}:${payloadJsonString}:${bidSaltHex}`;

    const enc = new TextEncoder();
    const dataBuffer = enc.encode(rawString);

    const hashBuffer = await subtle.digest("SHA-256", dataBuffer);
    return bytesToHex(new Uint8Array(hashBuffer));
}
