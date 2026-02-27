import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month"); // YYYY-MM

        const where: Record<string, unknown> = {};
        if (month) where.classDate = { startsWith: month };

        const records = await prisma.courseRecord.findMany({
            where,
            orderBy: [{ classDate: "asc" }, { startTime: "asc" }],
        });

        // Total hours for month
        const totalMinutes = records.reduce((sum, r) => sum + r.durationMinutes, 0);

        // By student
        const byStudent: Record<string, number> = {};
        records.forEach((r) => {
            byStudent[r.studentName] = (byStudent[r.studentName] || 0) + r.durationMinutes;
        });

        // By course
        const byCourse: Record<string, number> = {};
        records.forEach((r) => {
            byCourse[r.courseName] = (byCourse[r.courseName] || 0) + r.durationMinutes;
        });

        // Total record count
        const totalRecords = records.length;

        // Unique students count
        const uniqueStudents = new Set(records.map((r) => r.studentName)).size;

        // By day — group records per day
        const byDay: Record<string, typeof records> = {};
        records.forEach((r) => {
            if (!byDay[r.classDate]) byDay[r.classDate] = [];
            byDay[r.classDate].push(r);
        });

        return NextResponse.json({
            totalMinutes,
            totalRecords,
            uniqueStudents,
            byStudent: Object.entries(byStudent)
                .map(([name, minutes]) => ({ name, minutes }))
                .sort((a, b) => b.minutes - a.minutes),
            byCourse: Object.entries(byCourse)
                .map(([name, minutes]) => ({ name, minutes }))
                .sort((a, b) => b.minutes - a.minutes),
            byDay: Object.entries(byDay)
                .map(([date, dayRecords]) => ({
                    date,
                    totalMinutes: dayRecords.reduce((s, r) => s + r.durationMinutes, 0),
                    records: dayRecords,
                }))
                .sort((a, b) => a.date.localeCompare(b.date)),
        });
    } catch {
        return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
    }
}
