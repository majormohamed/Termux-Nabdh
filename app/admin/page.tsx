import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { BookingsChart } from "@/components/admin/bookings-chart";
import { formatDate } from "@/lib/utils";
import {
  Users,
  UserCheck,
  ClipboardList,
  Building2,
  CalendarCheck,
  CalendarClock,
  BedDouble,
  Hourglass,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireRole("SUPER_ADMIN");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalUsers,
    activeUsers,
    pendingAccounts,
    totalHospitals,
    pendingHospitals,
    todayBookings,
    upcomingBookings,
    availableRooms,
    recentBookings,
    bookingsByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.accountRequest.count({ where: { status: "PENDING" } }),
    prisma.hospital.count(),
    prisma.hospital.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { date: { gte: today, lt: tomorrow } } }),
    prisma.booking.count({ where: { date: { gte: tomorrow }, status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.room.count({ where: { status: "AVAILABLE" } }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true } },
        hospital: { select: { name: true } },
      },
    }),
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT TO_CHAR(date, 'YYYY-MM-DD') as day, COUNT(*)::bigint as count
      FROM "Booking"
      WHERE date >= NOW() - INTERVAL '14 days'
      GROUP BY day ORDER BY day
    `.catch(() => []),
  ]);

  const cards = [
    { label: "إجمالي المستخدمين", value: totalUsers, icon: Users, href: "/admin/users" },
    { label: "المستخدمون النشطون", value: activeUsers, icon: UserCheck, href: "/admin/users" },
    { label: "طلبات الحسابات", value: pendingAccounts, icon: ClipboardList, href: "/admin/account-requests" },
    { label: "إجمالي المستشفيات", value: totalHospitals, icon: Building2, href: "/admin/hospitals" },
    { label: "مستشفيات قيد المراجعة", value: pendingHospitals, icon: Hourglass, href: "/admin/hospital-requests" },
    { label: "حجوزات اليوم", value: todayBookings, icon: CalendarCheck, href: "/admin/bookings" },
    { label: "الحجوزات القادمة", value: upcomingBookings, icon: CalendarClock, href: "/admin/bookings" },
    { label: "الغرف المتاحة", value: availableRooms, icon: BedDouble, href: "/admin/hospitals" },
  ];

  return (
    <AppShell title="لوحة تحكم المدير العام">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((c) => (
            <Link key={c.label} href={c.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between pt-5">
                  <div>
                    <div className="text-2xl font-extrabold text-primary">{c.value}</div>
                    <div className="text-xs text-muted-foreground">{c.label}</div>
                  </div>
                  <c.icon className="h-8 w-8 text-muted-foreground/40" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الحجوزات آخر 14 يومًا</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingsChart data={bookingsByDay.map((d) => ({ day: d.day, count: Number(d.count) }))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">أحدث الحجوزات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentBookings.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">لا توجد حجوزات</p>
              )}
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <span className="font-medium">{b.user.fullName}</span>
                    <span className="text-muted-foreground"> — {b.hospital.name}</span>
                    <div className="text-xs text-muted-foreground">{formatDate(b.date)} · {b.startTime}</div>
                  </div>
                  <StatusBadge value={b.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
