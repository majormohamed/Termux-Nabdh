import { AppShell } from "@/components/app-shell";
import { getCurrentHospital } from "@/lib/hospital-context";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyHospital } from "@/components/hospital/empty-hospital";

export const dynamic = "force-dynamic";

export default async function HospitalTestsPage() {
  const { hospitalId } = await getCurrentHospital();
  if (!hospitalId) return <AppShell title="الفحوصات"><EmptyHospital /></AppShell>;

  const tests = await prisma.medicalTest.findMany({ where: { hospitalId }, orderBy: { name: "asc" } });

  return (
    <AppShell title="فحوصات المستشفى">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الفحص</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length === 0 && (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">لا توجد فحوصات</TableCell></TableRow>
            )}
            {tests.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.category === "LAB" ? "مختبر" : t.category === "RADIOLOGY" ? "أشعة" : "—"}</TableCell>
                <TableCell>{t.price ? `${t.price} ر.س` : "—"}</TableCell>
                <TableCell>
                  {t.isActive ? <Badge variant="success">نشط</Badge> : <Badge variant="outline">موقوف</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
