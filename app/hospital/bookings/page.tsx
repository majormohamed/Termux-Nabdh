import { AppShell } from "@/components/app-shell";
import { getCurrentHospital } from "@/lib/hospital-context";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyHospital } from "@/components/hospital/empty-hospital";
import { AdminBookingActions } from "@/components/admin/booking-actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HospitalBookingsPage() {
  const { hospitalId } = await getCurrentHospital();

  if (!hospitalId) return <AppShell title="حجوزات المستشفى"><EmptyHospital /></AppShell>;

  const bookings = await prisma.booking.findMany({
    where: { hospitalId },
    include: {
      user: { select: { fullName: true, phone: true } },
      doctor: { select: { fullName: true } },
      service: { select: { name: true } },
      medicalTest: { select: { name: true } },
      room: { select: { number: true } },
    },
    orderBy: { date: "desc" },
    take: 100,
  });

  return (
    <AppShell title="حجوزات المستشفى">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المرجع</TableHead>
              <TableHead>المريض</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>التفاصيل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">لا توجد حجوزات</TableCell>
              </TableRow>
            )}
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs" dir="ltr">{b.reference}</TableCell>
                <TableCell>{b.user.fullName}</TableCell>
                <TableCell><StatusBadge value={b.type} /></TableCell>
                <TableCell>
                  {b.doctor?.fullName ?? b.service?.name ?? b.medicalTest?.name ?? (b.room ? `غرفة ${b.room.number}` : "—")}
                </TableCell>
                <TableCell>{formatDate(b.date)} · {b.startTime}</TableCell>
                <TableCell><StatusBadge value={b.status} /></TableCell>
                <TableCell><AdminBookingActions bookingId={b.id} status={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
