"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatDuration } from "@/lib/utils";
import {
    Clock,
    Users,
    BookOpen,
    BarChart3,
    TrendingUp,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Calendar,
    X,
    User,
} from "lucide-react";

interface DayRecord {
    id: number;
    studentName: string;
    courseName: string;
    classDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
}

interface DayData {
    date: string;
    totalMinutes: number;
    records: DayRecord[];
}

interface StatsData {
    totalMinutes: number;
    totalRecords: number;
    uniqueStudents: number;
    byStudent: { name: string; minutes: number }[];
    byCourse: { name: string; minutes: number }[];
    byDay: DayData[];
}

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export default function DashboardPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/stats?month=${selectedMonth}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        fetchStats();
        setSelectedDay(null);
    }, [fetchStats]);

    const navigateMonth = (direction: -1 | 1) => {
        const [year, month] = selectedMonth.split("-").map(Number);
        const date = new Date(year, month - 1 + direction, 1);
        setSelectedMonth(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        );
    };

    const monthLabel = (() => {
        const [year, month] = selectedMonth.split("-").map(Number);
        return `${year}年${month}月`;
    })();

    // Build a lookup: date -> DayData
    const dayMap = useMemo(() => {
        const map: Record<string, DayData> = {};
        stats?.byDay.forEach((d) => {
            map[d.date] = d;
        });
        return map;
    }, [stats]);

    // Build calendar grid for the month
    const calendarDays = useMemo(() => {
        const [year, month] = selectedMonth.split("-").map(Number);
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const totalDays = lastDay.getDate();
        const startWeekday = firstDay.getDay(); // 0=Sunday

        const days: { day: number; dateStr: string }[] = [];
        // Leading blanks
        for (let i = 0; i < startWeekday; i++) {
            days.push({ day: 0, dateStr: "" });
        }
        // Actual days
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            days.push({ day: d, dateStr });
        }
        return days;
    }, [selectedMonth]);

    // Today string for highlighting
    const todayStr = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }, []);

    const selectedDayData = selectedDay ? dayMap[selectedDay] : null;

    const getBarWidth = (value: number, max: number) => {
        if (max === 0) return 0;
        return Math.max((value / max) * 100, 4);
    };

    // Intensity coloring for day cells
    const getDayIntensity = (minutes: number): string => {
        if (minutes === 0) return "";
        if (minutes <= 60) return "bg-primary/10 border-primary/20";
        if (minutes <= 120) return "bg-primary/20 border-primary/30";
        return "bg-primary/30 border-primary/40";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">数据统计</h1>
                    <p className="text-sm text-muted-foreground mt-1">课时数据概览与分析</p>
                </div>

                {/* Month selector */}
                <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium min-w-[6rem] text-center">
                        {monthLabel}
                    </span>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : stats ? (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">总课时</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {(stats.totalMinutes / 60).toFixed(1)}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">小时</span>
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalMinutes} 分钟 · {stats.totalRecords} 节课
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "100ms" }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">学生人数</p>
                                    <p className="text-2xl font-bold text-success">
                                        {stats.uniqueStudents}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">人</span>
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">本月活跃学生</p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">上课天数</p>
                                    <p className="text-2xl font-bold text-warning">
                                        {stats.byDay.length}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">天</span>
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">本月共 {stats.totalRecords} 节课</p>
                        </div>
                    </div>

                    {/* Calendar + Detail split view */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Calendar grid — takes 3 cols on desktop */}
                        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5 animate-fade-in">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">每日课程总览</h3>
                                <span className="text-xs text-muted-foreground ml-auto">点击日期查看详情</span>
                            </div>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {WEEKDAY_LABELS.map((label) => (
                                    <div key={label} className="text-center text-xs font-medium text-muted-foreground py-2">
                                        {label}
                                    </div>
                                ))}
                            </div>

                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((cell, idx) => {
                                    if (cell.day === 0) {
                                        return <div key={`blank-${idx}`} className="aspect-square" />;
                                    }

                                    const dayData = dayMap[cell.dateStr];
                                    const hasCourses = !!dayData;
                                    const isToday = cell.dateStr === todayStr;
                                    const isSelected = cell.dateStr === selectedDay;
                                    const intensity = hasCourses ? getDayIntensity(dayData.totalMinutes) : "";

                                    return (
                                        <button
                                            key={cell.dateStr}
                                            onClick={() => setSelectedDay(isSelected ? null : cell.dateStr)}
                                            className={`
                        relative aspect-square rounded-xl border transition-all duration-200 p-1
                        flex flex-col items-center justify-start gap-0.5
                        ${isSelected
                                                    ? "border-primary bg-primary/15 ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                                                    : hasCourses
                                                        ? `${intensity} hover:border-primary/40 hover:shadow-md`
                                                        : "border-transparent hover:border-border hover:bg-muted/30"
                                                }
                        ${isToday && !isSelected ? "ring-1 ring-primary/40" : ""}
                      `}
                                        >
                                            {/* Day number */}
                                            <span className={`text-xs font-medium leading-none mt-1
                        ${isToday ? "text-primary" : hasCourses ? "text-foreground" : "text-muted-foreground/60"}
                      `}>
                                                {cell.day}
                                            </span>

                                            {/* Course pills (mobile: just dot, desktop: mini text) */}
                                            {hasCourses && (
                                                <>
                                                    {/* Desktop: show summary */}
                                                    <div className="hidden sm:flex flex-col items-center gap-0.5 w-full overflow-hidden mt-0.5">
                                                        <span className="text-[10px] font-semibold text-primary leading-none">
                                                            {formatDuration(dayData.totalMinutes)}
                                                        </span>
                                                        {dayData.records.slice(0, 2).map((r, i) => (
                                                            <span
                                                                key={i}
                                                                className="text-[9px] text-muted-foreground leading-tight truncate w-full text-center"
                                                                title={`${r.studentName} · ${r.courseName}`}
                                                            >
                                                                {r.studentName}
                                                            </span>
                                                        ))}
                                                        {dayData.records.length > 2 && (
                                                            <span className="text-[9px] text-muted-foreground/50">
                                                                +{dayData.records.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Mobile: dot indicator */}
                                                    <div className="sm:hidden flex gap-0.5 mt-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        {dayData.records.length > 1 && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Day detail panel — takes 2 cols on desktop */}
                        <div className="lg:col-span-2">
                            {selectedDay && selectedDayData ? (
                                <div className="bg-card border border-border rounded-2xl overflow-hidden animate-fade-in sticky top-24">
                                    {/* Detail header */}
                                    <div className="px-5 py-4 border-b border-border bg-primary/5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold">
                                                {(() => {
                                                    const [, , d] = selectedDay.split("-").map(Number);
                                                    const date = new Date(selectedDay);
                                                    const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
                                                    return `${d}日 ${weekday}`;
                                                })()}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {selectedDayData.records.length} 节课 ·{" "}
                                                <span className="text-primary font-medium">
                                                    {formatDuration(selectedDayData.totalMinutes)}
                                                </span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDay(null)}
                                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Records list */}
                                    <div className="divide-y divide-border/50 max-h-[420px] overflow-y-auto">
                                        {selectedDayData.records.map((record) => (
                                            <div key={record.id} className="px-5 py-3.5 hover:bg-muted/20 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                                                        {record.studentName[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-medium truncate">
                                                                {record.studentName}
                                                            </span>
                                                            <span className="text-xs font-semibold text-primary shrink-0">
                                                                {formatDuration(record.durationMinutes)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-secondary text-[10px] font-medium">
                                                                {record.courseName}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                {record.startTime} – {record.endTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : selectedDay && !selectedDayData ? (
                                <div className="bg-card border border-border rounded-2xl p-8 text-center animate-fade-in sticky top-24">
                                    <Calendar className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        {(() => {
                                            const [, , d] = selectedDay.split("-").map(Number);
                                            return `${d}日`;
                                        })()}{" "}
                                        暂无课程记录
                                    </p>
                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors"
                                    >
                                        关闭
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-card border border-border rounded-2xl p-8 text-center sticky top-24">
                                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                        <ChevronLeft className="w-5 h-5 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">选择左侧日历中的日期</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">查看当天课程详细信息</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Charts grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* By Student */}
                        <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
                            <div className="flex items-center gap-2 mb-5">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">按学生统计</h3>
                            </div>
                            {stats.byStudent.length === 0 ? (
                                <p className="text-sm text-muted-foreground/60 text-center py-8">暂无数据</p>
                            ) : (
                                <div className="space-y-3">
                                    {stats.byStudent.map((item, idx) => {
                                        const maxMinutes = stats.byStudent[0]?.minutes || 1;
                                        return (
                                            <div key={item.name} className="animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                                                            {item.name[0]}
                                                        </span>
                                                        <span className="text-sm font-medium">{item.name}</span>
                                                    </div>
                                                    <span className="text-sm text-primary font-medium">
                                                        {formatDuration(item.minutes)}
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                                                        style={{ width: `${getBarWidth(item.minutes, maxMinutes)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* By Course */}
                        <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
                            <div className="flex items-center gap-2 mb-5">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">按课程统计</h3>
                            </div>
                            {stats.byCourse.length === 0 ? (
                                <p className="text-sm text-muted-foreground/60 text-center py-8">暂无数据</p>
                            ) : (
                                <div className="space-y-3">
                                    {stats.byCourse.map((item, idx) => {
                                        const maxMinutes = stats.byCourse[0]?.minutes || 1;
                                        const colors = [
                                            "from-emerald-500 to-emerald-500/60",
                                            "from-amber-500 to-amber-500/60",
                                            "from-rose-500 to-rose-500/60",
                                            "from-cyan-500 to-cyan-500/60",
                                            "from-violet-500 to-violet-500/60",
                                        ];
                                        return (
                                            <div key={item.name} className="animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-xs">
                                                            {item.name}
                                                        </span>
                                                    </span>
                                                    <span className="text-sm text-muted-foreground font-medium">
                                                        {formatDuration(item.minutes)}
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                                                        style={{ width: `${getBarWidth(item.minutes, maxMinutes)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-20">
                    <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">无法加载统计数据</p>
                </div>
            )}
        </div>
    );
}
