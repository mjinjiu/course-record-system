import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDuration } from "@/lib/utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentName = searchParams.get("studentName");
        const courseName = searchParams.get("courseName");
        const month = searchParams.get("month"); // YYYY-MM

        const where: Record<string, unknown> = {};
        if (studentName) where.studentName = { contains: studentName };
        if (courseName) where.courseName = { contains: courseName };
        if (month) where.classDate = { startsWith: month };

        const records = await prisma.courseRecord.findMany({
            where,
            orderBy: [{ classDate: "desc" }, { startTime: "desc" }],
        });

        return NextResponse.json(records);
    } catch {
        return NextResponse.json({ error: "获取记录失败" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentName, courseName, classDate, startTime, endTime } = body;

        if (!studentName || !courseName || !classDate || !startTime || !endTime) {
            return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 });
        }

        const durationMinutes = calculateDuration(startTime, endTime);
        if (durationMinutes <= 0) {
            return NextResponse.json({ error: "结束时间必须晚于开始时间" }, { status: 400 });
        }

        const record = await prisma.courseRecord.create({
            data: {
                studentName,
                courseName,
                classDate,
                startTime,
                endTime,
                durationMinutes,
            },
        });

        return NextResponse.json(record, { status: 201 });
    } catch {
        return NextResponse.json({ error: "创建记录失败" }, { status: 500 });
    }
}
