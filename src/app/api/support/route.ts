import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, email, category, message } = body;

        if (!fullName || !email || !category || !message) {
            return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
        }

        // Try to get session to link ticket to user if logged in
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Insert ticket into DB
        await db.insert(supportTickets).values({
            userId: session?.user?.id || null,
            fullName,
            email,
            category,
            message,
            status: "OPEN",
        });

        return NextResponse.json({ success: true, message: "Tiket berhasil dikirim" }, { status: 201 });
    } catch (error) {
        console.error("Support API Error:", error);
        return NextResponse.json({ error: "Gagal mengirim tiket bantuan" }, { status: 500 });
    }
}
