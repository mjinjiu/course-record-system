import { cookies } from "next/headers";
import { createHash } from "crypto";

const AUTH_COOKIE_NAME = "course-record-auth";

function getSessionToken(): string {
    const secret = process.env.AUTH_SECRET || "default-secret";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    return createHash("sha256").update(`${secret}:${password}`).digest("hex");
}

export async function setAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, getSessionToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

export async function removeAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    return token === getSessionToken();
}

export function verifyPassword(password: string): boolean {
    return password === (process.env.ADMIN_PASSWORD || "admin123");
}
