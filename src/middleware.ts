import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow login page and auth API routes
    if (
        pathname === "/login" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon")
    ) {
        return NextResponse.next();
    }

    // Check for auth cookie
    const authCookie = request.cookies.get("course-record-auth");
    if (!authCookie) {
        // Redirect to login for page requests
        if (!pathname.startsWith("/api/")) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        // Return 401 for API requests
        return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
