import { AppShell } from "@/components/app-shell";
import { getCurrentHospital } from "@/lib/hospital-context";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyHospital } from "@/components/hospital/empty-hospital";
import { Stethoscope } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HospitalDoctorsPage() {
  const { hospitalId } = await getCurrentHospital();
  if (!hospitalId) return <AppShell title="الأطباء"><EmptyHospital /></AppShell>;

  const doctors = await prisma.doctor.findMany({
    where: { hospitalId },
    include: { department: { select: { name: true } }, _count: { select: { bookings: true } } },
    orderBy: { fullName: "asc" },
  });

  return (
    <AppShell title="أطباء المستشفى">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.length === 0 && (
          <Card><CardContent className="py-10 text-center text-muted-foreground">لا يوجد أطباء بعد</CardContent></Card>
        )}
        {doctors.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex items-center gap-3 pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-bold">{d.fullName}</div>
                <div className="text-sm text-muted-foreground">{d.specialty} · {d.department?.name}</div>
                <div className="text-xs text-muted-foreground">{d._count.bookings} حجز</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
