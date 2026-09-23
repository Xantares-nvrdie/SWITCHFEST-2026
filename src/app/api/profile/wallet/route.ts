import { NextResponse } from "next/server";
import { db } from "@/db";
import { userWallets } from "@/db/schema/auth";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const wallet = await db.query.userWallets.findFirst({
            where: eq(userWallets.userId, session.user.id),
        });

        return NextResponse.json({ walletAddress: wallet?.walletAddress || "" });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { walletAddress } = body;

        // Cek apakah sudah ada wallet
        const existing = await db.query.userWallets.findFirst({
            where: eq(userWallets.userId, session.user.id),
        });

        if (existing) {
            if (walletAddress) {
                // Update
                await db.update(userWallets).set({ walletAddress }).where(eq(userWallets.userId, session.user.id));
            } else {
                // Hapus jika dikosongkan
                await db.delete(userWallets).where(eq(userWallets.userId, session.user.id));
            }
        } else if (walletAddress) {
            // Insert
            await db.insert(userWallets).values({
                id: crypto.randomUUID(),
                userId: session.user.id,
                walletAddress,
                isPrimary: true,
            });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
