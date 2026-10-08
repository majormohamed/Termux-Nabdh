import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { AdminBookingActions } from "@/components/admin/booking-actions";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await requireRole("SUPER_ADMIN");
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { fullName: true } },
      hospital: { select: { name: true } },
      doctor: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AppShell title="إدارة الحجوزات">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المرجع</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>المستشفى</TableHead>
              <TableHead>النوع</TableHead>
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
                <TableCell>{b.hospital.name}</TableCell>
                <TableCell><StatusBadge value={b.type} /></TableCell>
                <TableCell>{formatDate(b.date)} · {b.startTime}</TableCell>
                <TableCell><StatusBadge value={b.status} /></TableCell>
                <TableCell>
                  <AdminBookingActions bookingId={b.id} status={b.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
