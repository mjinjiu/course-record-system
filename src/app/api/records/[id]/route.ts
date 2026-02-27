import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDuration } from "@/lib/utils";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { studentName, courseName, classDate, startTime, endTime } = body;

        if (!studentName || !courseName || !classDate || !startTime || !endTime) {
            return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 });
        }

        const durationMinutes = calculateDuration(startTime, endTime);
        if (durationMinutes <= 0) {
            return NextResponse.json({ error: "结束时间必须晚于开始时间" }, { status: 400 });
        }

        const record = await prisma.courseRecord.update({
            where: { id: parseInt(id) },
            data: {
                studentName,
                courseName,
                classDate,
                startTime,
                endTime,
                durationMinutes,
            },
        });

        return NextResponse.json(record);
    } catch {
        return NextResponse.json({ error: "更新记录失败" }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.courseRecord.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "删除记录失败" }, { status: 500 });
    }
}
