import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { hospitalHasPermission } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { CalendarCheck, CalendarClock, Stethoscope, BedDouble, FlaskConical, FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HospitalDashboard() {
  const user = await requireAuth();

  let hospitalId: string | null = null;
  if (user.roles.includes("SUPER_ADMIN")) {
    const h = await prisma.hospital.findFirst({ where: { status: "ACTIVE" } });
    hospitalId = h?.id ?? null;
  } else {
    const link = await prisma.hospitalUser.findFirst({ where: { userId: user.id } });
    hospitalId = link?.hospitalId ?? null;
  }

  if (!hospitalId) {
    return (
      <AppShell title="لوحة المستشفى">
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            حسابك غير مرتبط بأي مستشفى بعد. إن كنت مالك مستشفى،{" "}
            <Link href="/hospital/register" className="text-primary underline">سجّل مستشفاك</Link>{" "}
            أو تواصل مع الإدارة لربط حسابك.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
  if (!hospital) redirect("/dashboard");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayBookings, upcomingBookings, doctors, rooms, services, tests, todayList] =
    await Promise.all([
      prisma.booking.count({ where: { hospitalId, date: { gte: today, lt: tomorrow } } }),
      prisma.booking.count({
        where: { hospitalId, date: { gte: tomorrow }, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.doctor.count({ where: { hospitalId } }),
      prisma.room.count({ where: { hospitalId } }),
      prisma.service.count({ where: { hospitalId, isActive: true } }),
      prisma.medicalTest.count({ where: { hospitalId, isActive: true } }),
      prisma.booking.findMany({
        where: { hospitalId, date: { gte: today, lt: tomorrow } },
        include: { user: { select: { fullName: true } }, doctor: { select: { fullName: true } } },
        orderBy: { startTime: "asc" },
      }),
    ]);

  const [canDoctors, canRooms, canLab, canRadiology, canServices, canAppointments] =
    await Promise.all([
      hospitalHasPermission(hospitalId, "MANAGE_DOCTORS"),
      hospitalHasPermission(hospitalId, "MANAGE_ROOMS"),
      hospitalHasPermission(hospitalId, "MANAGE_LAB"),
      hospitalHasPermission(hospitalId, "MANAGE_RADIOLOGY"),
      hospitalHasPermission(hospitalId, "MANAGE_SERVICES"),
      hospitalHasPermission(hospitalId, "MANAGE_APPOINTMENTS"),
    ]);

  const cards = [
    { label: "حجوزات اليوم", value: todayBookings, icon: CalendarCheck, show: canAppointments },
    { label: "الحجوزات القادمة", value: upcomingBookings, icon: CalendarClock, show: canAppointments },
    { label: "الأطباء", value: doctors, icon: Stethoscope, show: canDoctors },
    { label: "الغرف", value: rooms, icon: BedDouble, show: canRooms },
    { label: "الخدمات", value: services, icon: FileText, show: canServices },
    { label: "الفحوصات", value: tests, icon: FlaskConical, show: canLab || canRadiology },
  ].filter((c) => c.show);

  return (
    <AppShell title={`لوحة المستشفى — ${hospital.name}`}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardContent className="flex items-center justify-between pt-5">
                <div>
                  <div className="text-2xl font-extrabold text-primary">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
                <c.icon className="h-8 w-8 text-muted-foreground/40" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">جدول اليوم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayList.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">لا توجد حجوزات اليوم</p>
            )}
            {todayList.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <span className="font-medium">{b.user.fullName}</span>
                  {b.doctor && <span className="text-muted-foreground"> — {b.doctor.fullName}</span>}
                  <div className="text-xs text-muted-foreground">{formatDate(b.date)} · {b.startTime}</div>
                </div>
                <StatusBadge value={b.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
