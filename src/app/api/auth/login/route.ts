import { NextResponse } from "next/server";
import { verifyPassword, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (!password) {
            return NextResponse.json({ error: "请输入密码" }, { status: 400 });
        }

        if (!verifyPassword(password)) {
            return NextResponse.json({ error: "密码错误" }, { status: 401 });
        }

        await setAuthCookie();
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "登录失败" }, { status: 500 });
    }
}
