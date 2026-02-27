"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/toast";
import { formatDuration } from "@/lib/utils";
import {
    Plus,
    Pencil,
    Trash2,
    Download,
    Search,
    X,
    Loader2,
    Clock,
    User,
    BookOpen,
    Calendar,
    ChevronDown,
} from "lucide-react";

interface Record {
    id: number;
    studentName: string;
    courseName: string;
    classDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    createdAt: string;
}

export default function RecordsPage() {
    const { showToast } = useToast();
    const [records, setRecords] = useState<Record[]>([]);
    const [students, setStudents] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Record | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Filter states
    const [filterStudent, setFilterStudent] = useState("");
    const [filterCourse, setFilterCourse] = useState("");
    const [filterMonth, setFilterMonth] = useState("");

    // Form states
    const [formData, setFormData] = useState({
        studentName: "",
        courseName: "",
        classDate: new Date().toISOString().slice(0, 10),
        startTime: "09:00",
        endTime: "10:00",
    });

    // Autocomplete
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const [filteredStudents, setFilteredStudents] = useState<string[]>([]);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStudent) params.set("studentName", filterStudent);
            if (filterCourse) params.set("courseName", filterCourse);
            if (filterMonth) params.set("month", filterMonth);

            const res = await fetch(`/api/records?${params}`);
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch {
            showToast("获取记录失败", "error");
        } finally {
            setLoading(false);
        }
    }, [filterStudent, filterCourse, filterMonth, showToast]);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/students");
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        fetchRecords();
        fetchStudents();
    }, [fetchRecords]);

    const handleStudentInput = (value: string) => {
        setFormData((prev) => ({ ...prev, studentName: value }));
        if (value) {
            setFilteredStudents(students.filter((s) => s.includes(value)));
            setShowStudentDropdown(true);
        } else {
            setShowStudentDropdown(false);
        }
    };

    const selectStudent = (name: string) => {
        setFormData((prev) => ({ ...prev, studentName: name }));
        setShowStudentDropdown(false);
    };

    const resetForm = () => {
        setFormData({
            studentName: "",
            courseName: "",
            classDate: new Date().toISOString().slice(0, 10),
            startTime: "09:00",
            endTime: "10:00",
        });
        setEditingRecord(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingRecord ? `/api/records/${editingRecord.id}` : "/api/records";
            const method = editingRecord ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToast(editingRecord ? "记录已更新" : "记录已创建", "success");
                resetForm();
                fetchRecords();
                fetchStudents();
            } else {
                const data = await res.json();
                showToast(data.error || "操作失败", "error");
            }
        } catch {
            showToast("操作失败", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (record: Record) => {
        setFormData({
            studentName: record.studentName,
            courseName: record.courseName,
            classDate: record.classDate,
            startTime: record.startTime,
            endTime: record.endTime,
        });
        setEditingRecord(record);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/records/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("记录已删除", "success");
                setDeleteConfirm(null);
                fetchRecords();
            } else {
                showToast("删除失败", "error");
            }
        } catch {
            showToast("删除失败", "error");
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (filterStudent) params.set("studentName", filterStudent);
        if (filterCourse) params.set("courseName", filterCourse);
        if (filterMonth) params.set("month", filterMonth);
        window.open(`/api/export?${params}`, "_blank");
    };

    const clearFilters = () => {
        setFilterStudent("");
        setFilterCourse("");
        setFilterMonth("");
    };

    const hasFilters = filterStudent || filterCourse || filterMonth;

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">课程记录</h1>
                    <p className="text-sm text-muted-foreground mt-1">管理所有课程上课记录</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              bg-secondary text-secondary-foreground hover:bg-secondary/80
              transition-all duration-200 border border-border"
                    >
                        <Download className="w-4 h-4" />
                        导出 CSV
                    </button>
                    <button
                        onClick={() => {
                            if (showForm && !editingRecord) {
                                resetForm();
                            } else {
                                setEditingRecord(null);
                                setFormData({
                                    studentName: "",
                                    courseName: "",
                                    classDate: new Date().toISOString().slice(0, 10),
                                    startTime: "09:00",
                                    endTime: "10:00",
                                });
                                setShowForm(true);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              bg-primary text-primary-foreground hover:bg-primary/90
              transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                    >
                        {showForm && !editingRecord ? (
                            <>
                                <X className="w-4 h-4" />
                                取消
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                新增记录
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingRecord ? "编辑记录" : "新增课程记录"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Student Name with autocomplete */}
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <User className="w-3 h-3" />
                                    学生姓名
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.studentName}
                                    onChange={(e) => handleStudentInput(e.target.value)}
                                    onFocus={() => {
                                        if (formData.studentName && filteredStudents.length > 0) {
                                            setShowStudentDropdown(true);
                                        }
                                    }}
                                    onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                                    placeholder="输入学生姓名"
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm
                    placeholder:text-muted-foreground/50
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                    transition-all duration-200"
                                />
                                {showStudentDropdown && filteredStudents.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                                        {filteredStudents.map((name) => (
                                            <button
                                                key={name}
                                                type="button"
                                                onMouseDown={() => selectStudent(name)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                                            >
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Course Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <BookOpen className="w-3 h-3" />
                                    课程名称
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.courseName}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, courseName: e.target.value }))}
                                    placeholder="输入课程名称"
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm
                    placeholder:text-muted-foreground/50
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                    transition-all duration-200"
                                />
                            </div>

                            {/* Class Date */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    上课日期
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.classDate}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, classDate: e.target.value }))}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                    transition-all duration-200
                    [color-scheme:dark]"
                                />
                            </div>

                            {/* Start Time */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    开始时间
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.startTime}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                    transition-all duration-200
                    [color-scheme:dark]"
                                />
                            </div>

                            {/* End Time */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    结束时间
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.endTime}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                    transition-all duration-200
                    [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                  bg-primary text-primary-foreground hover:bg-primary/90
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : editingRecord ? (
                                    <Pencil className="w-4 h-4" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                {editingRecord ? "更新记录" : "添加记录"}
                            </button>
                            {editingRecord && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium
                    text-muted-foreground hover:text-foreground hover:bg-secondary
                    transition-all duration-200"
                                >
                                    取消编辑
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">筛选</span>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                            清除筛选
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                        type="text"
                        placeholder="按学生姓名筛选"
                        value={filterStudent}
                        onChange={(e) => setFilterStudent(e.target.value)}
                        className="h-9 px-3 bg-background border border-border rounded-xl text-sm
              placeholder:text-muted-foreground/50
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200"
                    />
                    <input
                        type="text"
                        placeholder="按课程名称筛选"
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                        className="h-9 px-3 bg-background border border-border rounded-xl text-sm
              placeholder:text-muted-foreground/50
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200"
                    />
                    <input
                        type="month"
                        placeholder="按月份筛选"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="h-9 px-3 bg-background border border-border rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200
              [color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-20">
                        <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">暂无课程记录</p>
                        <p className="text-muted-foreground/60 text-xs mt-1">点击"新增记录"开始添加</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">学生</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">课程</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">日期</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">时间</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">时长</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record, idx) => (
                                        <tr
                                            key={record.id}
                                            className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                                            style={{ animationDelay: `${idx * 30}ms` }}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                                                        {record.studentName[0]}
                                                    </span>
                                                    {record.studentName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-xs font-medium">
                                                    {record.courseName}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{record.classDate}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {record.startTime} - {record.endTime}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-primary font-medium">
                                                    {formatDuration(record.durationMinutes)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(record)}
                                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                                                        title="编辑"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    {deleteConfirm === record.id ? (
                                                        <div className="flex items-center gap-1 animate-fade-in">
                                                            <button
                                                                onClick={() => handleDelete(record.id)}
                                                                className="px-2 py-1 rounded-lg text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
                                                            >
                                                                确认
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-2 py-1 rounded-lg text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
                                                            >
                                                                取消
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(record.id)}
                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                            title="删除"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-border/50">
                            {records.map((record) => (
                                <div key={record.id} className="p-4 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                                                {record.studentName[0]}
                                            </span>
                                            <div>
                                                <p className="font-medium text-sm">{record.studentName}</p>
                                                <p className="text-xs text-muted-foreground">{record.courseName}</p>
                                            </div>
                                        </div>
                                        <span className="text-primary font-semibold text-sm">
                                            {formatDuration(record.durationMinutes)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{record.classDate} · {record.startTime}-{record.endTime}</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="p-1.5 rounded-lg hover:bg-secondary transition-all"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            {deleteConfirm === record.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(record.id)}
                                                        className="px-2 py-1 rounded-lg text-xs bg-destructive text-destructive-foreground"
                                                    >
                                                        确认
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-2 py-1 rounded-lg text-xs bg-secondary"
                                                    >
                                                        取消
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(record.id)}
                                                    className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Footer with count */}
                {records.length > 0 && (
                    <div className="px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
                        <span>共 {records.length} 条记录</span>
                        <span>
                            总计 {formatDuration(records.reduce((sum, r) => sum + r.durationMinutes, 0))}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function ClipboardList(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" /><path d="M12 16h4" />
            <path d="M8 11h.01" /><path d="M8 16h.01" />
        </svg>
    );
}
