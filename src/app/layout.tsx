import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "课时记录系统",
    description: "个人课程打卡与记录管理系统",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
