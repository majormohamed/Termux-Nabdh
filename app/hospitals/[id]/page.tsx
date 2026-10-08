import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, Phone, Mail, Globe, Clock, Star, BedDouble } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HospitalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hospital = await prisma.hospital.findUnique({
    where: { id },
    include: {
      departments: true,
      doctors: { include: { department: { select: { name: true } } } },
      services: { where: { isActive: true } },
      medicalTests: { where: { isActive: true } },
      rooms: true,
      reviews: { include: { user: { select: { fullName: true } } }, take: 5, orderBy: { createdAt: "desc" } },
    },
  });

  if (!hospital || hospital.status !== "ACTIVE") notFound();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        {/* الرأس */}
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{hospital.name}</h1>
                <StatusBadge value={hospital.type} />
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {hospital.rating}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">{hospital.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {hospital.city}، {hospital.address}</span>
                {hospital.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> <span dir="ltr">{hospital.phone}</span></span>}
                {hospital.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {hospital.email}</span>}
                {hospital.website && <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {hospital.website}</span>}
                {hospital.workingHours && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {hospital.workingHours}</span>}
              </div>
            </div>
            <Button asChild size="lg">
              <Link href={`/bookings/new?hospitalId=${hospital.id}&type=APPOINTMENT`}>احجز الآن</Link>
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="departments">
          <TabsList className="flex-wrap">
            <TabsTrigger value="departments">الأقسام ({hospital.departments.length})</TabsTrigger>
            <TabsTrigger value="doctors">الأطباء ({hospital.doctors.length})</TabsTrigger>
            <TabsTrigger value="services">الخدمات ({hospital.services.length})</TabsTrigger>
            <TabsTrigger value="tests">الفحوصات ({hospital.medicalTests.length})</TabsTrigger>
            <TabsTrigger value="rooms">الغرف ({hospital.rooms.length})</TabsTrigger>
            <TabsTrigger value="reviews">التقييمات</TabsTrigger>
          </TabsList>

          <TabsContent value="departments">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hospital.departments.map((d) => (
                <Card key={d.id}>
                  <CardContent className="pt-4">
                    <h3 className="font-bold">{d.name}</h3>
                    <p className="text-sm text-muted-foreground">{d.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="doctors">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hospital.doctors.map((d) => (
                <Card key={d.id}>
                  <CardContent className="flex items-center justify-between pt-4">
                    <div>
                      <h3 className="font-bold">{d.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {d.specialty} · {d.department?.name}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/bookings/new?hospitalId=${hospital.id}&doctorId=${d.id}&type=APPOINTMENT`}>حجز</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hospital.services.map((s) => (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between pt-4">
                    <div>
                      <h3 className="font-bold">{s.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {s.price ? `${s.price} ر.س` : ""} {s.durationMin ? `· ${s.durationMin} دقيقة` : ""}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/bookings/new?hospitalId=${hospital.id}&serviceId=${s.id}&type=MEDICAL_SERVICE`}>حجز</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tests">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hospital.medicalTests.map((t) => (
                <Card key={t.id}>
                  <CardContent className="flex items-center justify-between pt-4">
                    <div>
                      <h3 className="font-bold">{t.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t.category === "LAB" ? "مختبر" : "أشعة"} {t.price ? `· ${t.price} ر.س` : ""}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/bookings/new?hospitalId=${hospital.id}&testId=${t.id}&type=${t.category === "LAB" ? "LAB_TEST" : "RADIOLOGY"}`}>
                        حجز
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rooms">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {hospital.rooms.map((r) => (
                <Card key={r.id}>
                  <CardContent className="pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold">
                        <BedDouble className="h-4 w-4" /> غرفة {r.number}
                      </span>
                      <StatusBadge value={r.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {r.type} · طابق {r.floor} · سعة {r.capacity}
                    </p>
                    {r.pricePerDay && <p className="mt-1 text-sm font-medium">{r.pricePerDay} ر.س / يوم</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            {hospital.reviews.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">لا توجد تقييمات بعد</p>
            ) : (
              <div className="space-y-3">
                {hospital.reviews.map((r) => (
                  <Card key={r.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {r.user.fullName}
                        <span className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {r.rating}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {r.comment}
                      <div className="mt-1 text-xs">{formatDate(r.createdAt)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
