import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requireRole("SUPER_ADMIN");

  const byStatus = await prisma.booking.groupBy({ by: ["status"], _count: true });
  const byType = await prisma.booking.groupBy({ by: ["type"], _count: true });
  const topHospitals = await prisma.hospital.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { bookings: { _count: "desc" } },
    take: 10,
  });

  return (
    <AppShell title="التقارير">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">الحجوزات حسب الحالة</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byStatus.map((s) => (
              <div key={s.status} className="flex justify-between rounded-lg border p-3 text-sm">
                <span>{s.status}</span>
                <span className="font-bold">{s._count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">الحجوزات حسب النوع</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byType.map((t) => (
              <div key={t.type} className="flex justify-between rounded-lg border p-3 text-sm">
                <span>{t.type}</span>
                <span className="font-bold">{t._count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">أكثر المستشفيات حجزًا</CardTitle></CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستشفى</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>عدد الحجوزات</TableHead>
                <TableHead>التقييم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topHospitals.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell>{h.city}</TableCell>
                  <TableCell>{h._count.bookings}</TableCell>
                  <TableCell>{h.rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}
