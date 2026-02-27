import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const records = await prisma.courseRecord.findMany({
            select: { studentName: true },
            distinct: ["studentName"],
            orderBy: { studentName: "asc" },
        });

        const students = records.map((r) => r.studentName);
        return NextResponse.json(students);
    } catch {
        return NextResponse.json({ error: "获取学生列表失败" }, { status: 500 });
    }
}
