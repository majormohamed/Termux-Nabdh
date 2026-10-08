import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { CalendarX } from "lucide-react";
import { CancelBookingButton } from "@/components/cancel-booking-button";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireAuth();
  const { type } = await searchParams;

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, ...(type ? { type: type as never } : {}) },
    include: {
      hospital: { select: { name: true } },
      doctor: { select: { fullName: true } },
      service: { select: { name: true } },
      medicalTest: { select: { name: true } },
      room: { select: { number: true } },
    },
    orderBy: { date: "desc" },
  });

  return (
    <AppShell title="حجوزاتي">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">جميع الحجوزات</h2>
        <Button asChild>
          <Link href="/bookings/new?type=APPOINTMENT">حجز جديد</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <CalendarX className="mx-auto mb-3 h-12 w-12 opacity-30" />
            لا توجد حجوزات بعد — ابدأ بالحجز من صفحة المستشفيات
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المرجع</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المستشفى</TableHead>
                <TableHead>التفاصيل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs" dir="ltr">{b.reference}</TableCell>
                  <TableCell><StatusBadge value={b.type} /></TableCell>
                  <TableCell>{b.hospital.name}</TableCell>
                  <TableCell>
                    {b.doctor?.fullName ?? b.service?.name ?? b.medicalTest?.name ?? (b.room ? `غرفة ${b.room.number}` : "—")}
                  </TableCell>
                  <TableCell>{formatDate(b.date)}</TableCell>
                  <TableCell>{b.startTime}</TableCell>
                  <TableCell><StatusBadge value={b.status} /></TableCell>
                  <TableCell>
                    {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                      <CancelBookingButton bookingId={b.id} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </AppShell>
  );
}
