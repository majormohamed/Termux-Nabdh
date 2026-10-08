"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Building2,
  CalendarCheck,
  Stethoscope,
  FlaskConical,
  BedDouble,
  Bell,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  KeyRound,
  FileText,
  ScrollText,
  Menu,
  X,
  HeartPulse,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Item = { href: string; label: string; icon: React.ElementType };

const userItems: Item[] = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  { href: "/hospitals", label: "المستشفيات", icon: Building2 },
  { href: "/bookings", label: "الحجوزات", icon: CalendarCheck },
  { href: "/bookings?type=APPOINTMENT", label: "المواعيد", icon: Stethoscope },
  { href: "/bookings?type=LAB_TEST", label: "الفحوصات", icon: FlaskConical },
  { href: "/bookings/new?type=ROOM", label: "الغرف", icon: BedDouble },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
  { href: "/profile", label: "الملف الشخصي", icon: User },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

const adminItems: Item[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/account-requests", label: "طلبات الحسابات", icon: UserCheck },
  { href: "/admin/hospitals", label: "المستشفيات", icon: Building2 },
  { href: "/admin/hospital-requests", label: "طلبات المستشفيات", icon: ClipboardList },
  { href: "/admin/hospital-permissions", label: "صلاحيات المستشفيات", icon: KeyRound },
  { href: "/admin/bookings", label: "الحجوزات", icon: CalendarCheck },
  { href: "/admin/reports", label: "التقارير", icon: FileText },
  { href: "/admin/audit-logs", label: "سجل العمليات", icon: ScrollText },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

const hospitalItems: Item[] = [
  { href: "/hospital", label: "لوحة المستشفى", icon: LayoutDashboard },
  { href: "/hospital/bookings", label: "الحجوزات", icon: CalendarCheck },
  { href: "/hospital/doctors", label: "الأطباء", icon: Stethoscope },
  { href: "/hospital/departments", label: "الأقسام", icon: ClipboardList },
  { href: "/hospital/services", label: "الخدمات", icon: FileText },
  { href: "/hospital/rooms", label: "الغرف", icon: BedDouble },
  { href: "/hospital/tests", label: "الفحوصات", icon: FlaskConical },
];

export function Sidebar({ roles }: { roles: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = roles.includes("SUPER_ADMIN");
  const isHospitalStaff = roles.some((r) =>
    ["HOSPITAL_ADMIN", "RECEPTIONIST", "DOCTOR", "LAB_STAFF", "RADIOLOGY_STAFF", "ACCOUNTANT"].includes(r)
  );

  const items = isAdmin ? adminItems : isHospitalStaff ? hospitalItems : userItems;

  const nav = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-4 py-5 text-xl font-bold text-primary">
        <HeartPulse className="h-7 w-7" />
        نبض
      </Link>
      <nav className="flex-1 space-y-1 px-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/");
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* زر القائمة للجوال */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed right-4 top-4 z-50 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="القائمة"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar للجوال */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-64 border-l bg-card">{nav}</aside>
        </div>
      )}

      {/* Sidebar لسطح المكتب */}
      <aside className="fixed right-0 top-0 z-30 hidden h-screen w-64 border-l bg-card md:block">
        {nav}
      </aside>
    </>
  );
}
