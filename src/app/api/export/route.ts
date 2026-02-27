import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentName = searchParams.get("studentName");
        const courseName = searchParams.get("courseName");
        const month = searchParams.get("month");

        const where: Record<string, unknown> = {};
        if (studentName) where.studentName = { contains: studentName };
        if (courseName) where.courseName = { contains: courseName };
        if (month) where.classDate = { startsWith: month };

        const records = await prisma.courseRecord.findMany({
            where,
            orderBy: [{ classDate: "desc" }, { startTime: "desc" }],
        });

        // Build CSV content with BOM for Excel compatibility
        const BOM = "\uFEFF";
        const headers = ["序号", "学生姓名", "课程名称", "上课日期", "开始时间", "结束时间", "时长(分钟)", "创建时间"];
        const rows = records.map((r, i) => [
            i + 1,
            r.studentName,
            r.courseName,
            r.classDate,
            r.startTime,
            r.endTime,
            r.durationMinutes,
            new Date(r.createdAt).toLocaleString("zh-CN"),
        ]);

        const csv = BOM + [headers, ...rows].map((row) => row.join(",")).join("\n");

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="course-records-${new Date().toISOString().slice(0, 10)}.csv"`,
            },
        });
    } catch {
        return NextResponse.json({ error: "导出失败" }, { status: 500 });
    }
}
