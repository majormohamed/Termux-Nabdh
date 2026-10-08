import { AppShell } from "@/components/app-shell";
import { getCurrentHospital } from "@/lib/hospital-context";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyHospital } from "@/components/hospital/empty-hospital";

export const dynamic = "force-dynamic";

export default async function HospitalServicesPage() {
  const { hospitalId } = await getCurrentHospital();
  if (!hospitalId) return <AppShell title="الخدمات"><EmptyHospital /></AppShell>;

  const services = await prisma.service.findMany({
    where: { hospitalId },
    include: { department: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell title="خدمات المستشفى">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الخدمة</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>المدة</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">لا توجد خدمات</TableCell></TableRow>
            )}
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.department?.name ?? "—"}</TableCell>
                <TableCell>{s.price ? `${s.price} ر.س` : "—"}</TableCell>
                <TableCell>{s.durationMin ? `${s.durationMin} د` : "—"}</TableCell>
                <TableCell>
                  {s.isActive ? <Badge variant="success">نشطة</Badge> : <Badge variant="outline">موقوفة</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
