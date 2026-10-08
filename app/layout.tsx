import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "نبض | Nabd",
  description: "نظام متكامل لإدارة المستشفيات والخدمات الطبية والحجوزات",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
