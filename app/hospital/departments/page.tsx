import { AppShell } from "@/components/app-shell";
import { getCurrentHospital } from "@/lib/hospital-context";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyHospital } from "@/components/hospital/empty-hospital";

export const dynamic = "force-dynamic";

export default async function HospitalDepartmentsPage() {
  const { hospitalId } = await getCurrentHospital();
  if (!hospitalId) return <AppShell title="الأقسام"><EmptyHospital /></AppShell>;

  const departments = await prisma.department.findMany({
    where: { hospitalId },
    include: { _count: { select: { doctors: true, services: true } } },
  });

  return (
    <AppShell title="أقسام المستشفى">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.length === 0 && (
          <Card><CardContent className="py-10 text-center text-muted-foreground">لا توجد أقسام بعد</CardContent></Card>
        )}
        {departments.map((d) => (
          <Card key={d.id}>
            <CardContent className="pt-4">
              <div className="font-bold">{d.name}</div>
              <p className="text-sm text-muted-foreground">{d.description}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                {d._count.doctors} طبيب · {d._count.services} خدمة
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
