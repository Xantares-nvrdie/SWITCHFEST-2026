import { NextRequest, NextResponse } from "next/server";

// Route yang memerlukan login
const PROTECTED_ROUTES = ["/tenders/create", "/organizations", "/audit"];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Lewati asset statis & API
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/favicon")
    ) {
        return NextResponse.next();
    }

    // Cek apakah route ini terlindungi
    const isProtected = PROTECTED_ROUTES.some(
        (r) => pathname === r || pathname.startsWith(r + "/")
    );

    if (!isProtected) return NextResponse.next();

    // Cek sesi better-auth cookie
    const sessionToken =
        req.cookies.get("better-auth.session_token")?.value ||
        req.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionToken) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
