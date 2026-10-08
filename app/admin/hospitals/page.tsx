import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHospitalsPage() {
  await requireRole("SUPER_ADMIN");
  const hospitals = await prisma.hospital.findMany({
    include: { _count: { select: { doctors: true, rooms: true, bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell title="إدارة المستشفيات">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>أطباء</TableHead>
              <TableHead>غرف</TableHead>
              <TableHead>حجوزات</TableHead>
              <TableHead>التسجيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hospitals.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">
                  <Link href={`/hospitals/${h.id}`} className="hover:text-primary hover:underline">{h.name}</Link>
                </TableCell>
                <TableCell><StatusBadge value={h.type} /></TableCell>
                <TableCell>{h.city}</TableCell>
                <TableCell><StatusBadge value={h.status} /></TableCell>
                <TableCell>{h._count.doctors}</TableCell>
                <TableCell>{h._count.rooms}</TableCell>
                <TableCell>{h._count.bookings}</TableCell>
                <TableCell>{formatDate(h.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
