import { AppShell } from "@/components/app-shell";
import { getCurrentHospital } from "@/lib/hospital-context";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyHospital } from "@/components/hospital/empty-hospital";

export const dynamic = "force-dynamic";

export default async function HospitalRoomsPage() {
  const { hospitalId } = await getCurrentHospital();
  if (!hospitalId) return <AppShell title="الغرف"><EmptyHospital /></AppShell>;

  const rooms = await prisma.room.findMany({ where: { hospitalId }, orderBy: { number: "asc" } });

  return (
    <AppShell title="غرف المستشفى">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الغرفة</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الطابق</TableHead>
              <TableHead>السعة</TableHead>
              <TableHead>السعر/اليوم</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">لا توجد غرف</TableCell></TableRow>
            )}
            {rooms.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.number}</TableCell>
                <TableCell>{r.type ?? "—"}</TableCell>
                <TableCell>{r.floor ?? "—"}</TableCell>
                <TableCell>{r.capacity}</TableCell>
                <TableCell>{r.pricePerDay ? `${r.pricePerDay} ر.س` : "—"}</TableCell>
                <TableCell><StatusBadge value={r.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
