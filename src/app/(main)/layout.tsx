"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ToastProvider } from "@/components/toast";
import {
    BookOpen,
    ClipboardList,
    BarChart3,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import Link from "next/link";

const navItems = [
    { href: "/", label: "课程记录", icon: ClipboardList },
    { href: "/dashboard", label: "数据统计", icon: BarChart3 },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    return (
        <ToastProvider>
            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <BookOpen className="w-4.5 h-4.5 text-primary" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight hidden sm:block">
                                课时记录
                            </span>
                        </div>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop logout */}
                        <div className="hidden md:flex items-center">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground
                  hover:text-foreground hover:bg-secondary transition-all duration-200"
                            >
                                <LogOut className="w-4 h-4" />
                                退出
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl animate-fade-in">
                            <div className="px-4 py-3 space-y-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${isActive
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground
                    hover:text-foreground hover:bg-secondary transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    退出登录
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                {/* Main content */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {children}
                </main>
            </div>
        </ToastProvider>
    );
}
