import Link from "next/link";
import { Building2, MapPin, Star, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function HospitalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; city?: string; type?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim();

  const hospitals = await prisma.hospital.findMany({
    where: {
      status: "ACTIVE",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
              { doctors: { some: { fullName: { contains: search, mode: "insensitive" } } } },
              { services: { some: { name: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
      ...(params.city ? { city: params.city } : {}),
      ...(params.type ? { type: params.type as never } : {}),
    },
    include: { _count: { select: { doctors: true, services: true } } },
    orderBy: { rating: "desc" },
  });

  const cities = await prisma.hospital.findMany({
    where: { status: "ACTIVE", city: { not: null } },
    select: { city: true },
    distinct: ["city"],
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">المستشفيات</h1>

        {/* بحث وفلاتر */}
        <form className="mb-8 grid grid-cols-1 gap-3 rounded-xl border bg-card p-4 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="search" defaultValue={search} placeholder="اسم المستشفى، طبيب، أو خدمة..." className="pr-10" />
          </div>
          <Select name="city" defaultValue={params.city ?? ""}>
            <option value="">كل المدن</option>
            {cities.map((c) => (
              <option key={c.city} value={c.city ?? ""}>{c.city}</option>
            ))}
          </Select>
          <Select name="type" defaultValue={params.type ?? ""}>
            <option value="">كل الأنواع</option>
            <option value="GENERAL">عام</option>
            <option value="SPECIALIZED">تخصصي</option>
            <option value="CLINIC">عيادة</option>
            <option value="MEDICAL_CENTER">مركز طبي</option>
          </Select>
          <Button type="submit" className="sm:col-span-4">تطبيق الفلاتر</Button>
        </form>

        {hospitals.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Building2 className="mx-auto mb-3 h-12 w-12 opacity-30" />
            لا توجد مستشفيات مطابقة للبحث
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((h) => (
            <Link key={h.id} href={`/hospitals/${h.id}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <StatusBadge value={h.type} />
                  </div>
                  <h3 className="mb-1 text-lg font-bold">{h.name}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{h.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {h.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {h.rating}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {h._count.doctors} طبيب · {h._count.services} خدمة
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
