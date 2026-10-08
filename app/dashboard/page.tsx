import Link from "next/link";
import { CalendarCheck, BedDouble, FlaskConical, Stethoscope, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();
  const now = new Date();

  const [upcoming, past, notifications] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: user.id, date: { gte: now }, status: { in: ["PENDING", "CONFIRMED"] } },
      include: { hospital: { select: { name: true } }, doctor: { select: { fullName: true } } },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { userId: user.id, OR: [{ date: { lt: now } }, { status: { in: ["COMPLETED", "CANCELLED"] } }] },
      include: { hospital: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const actions = [
    { href: "/bookings/new?type=APPOINTMENT", icon: CalendarCheck, label: "حجز موعد" },
    { href: "/bookings/new?type=ROOM", icon: BedDouble, label: "حجز غرفة" },
    { href: "/bookings/new?type=LAB_TEST", icon: FlaskConical, label: "حجز فحص" },
    { href: "/bookings/new?type=MEDICAL_SERVICE", icon: Stethoscope, label: "حجز خدمة" },
  ];

  return (
    <AppShell title="لوحة التحكم">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">مرحبًا، {user.name} 👋</h2>
          <p className="text-muted-foreground">نتمنى لك يومًا صحيًا سعيدًا</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {actions.map((a) => (
            <Button key={a.label} asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href={a.href}>
                <a.icon className="h-6 w-6 text-primary" />
                {a.label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" /> الحجوزات القادمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">لا توجد حجوزات قادمة</p>
              )}
              {upcoming.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{b.hospital.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.doctor?.fullName ?? "—"} · {formatDate(b.date)} · {b.startTime}
                    </div>
                  </div>
                  <StatusBadge value={b.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">الحجوزات السابقة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {past.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">لا توجد حجوزات سابقة</p>
              )}
              {past.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{b.hospital.name}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(b.date)}</div>
                  </div>
                  <StatusBadge value={b.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">أحدث الإشعارات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">لا توجد إشعارات</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="rounded-lg border p-3 text-sm">
                <span className={n.isRead ? "text-muted-foreground" : "font-medium"}>{n.title}</span>
                {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
