import Link from "next/link";
import {
  HeartPulse,
  Search,
  CalendarCheck,
  BedDouble,
  FlaskConical,
  Stethoscope,
  Building2,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [hospitals, doctors, bookings] = await Promise.all([
      prisma.hospital.count({ where: { status: "ACTIVE" } }),
      prisma.doctor.count(),
      prisma.booking.count(),
    ]);
    return { hospitals, doctors, bookings };
  } catch {
    return { hospitals: 0, doctors: 0, bookings: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <HeartPulse className="h-7 w-7" />
            نبض
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/hospitals" className="hover:text-primary">المستشفيات</Link>
            <Link href="/#services" className="hover:text-primary">الخدمات</Link>
            <Link href="/#how" className="hover:text-primary">كيف يعمل</Link>
          </nav>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild>
              <Link href="/register">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16 md:py-24">
        <div className="container text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
            <span className="text-primary">نبض</span> — رعاية أقرب، حجز أسهل
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            احجز موعدك، غرفتك، أو فحصك الطبي في أفضل المستشفيات — بضغطة واحدة، دون انتظار.
          </p>

          {/* Search */}
          <form action="/hospitals" className="mx-auto flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="search" placeholder="ابحث عن مستشفى، طبيب، خدمة، أو فحص..." className="h-12 pr-10" />
            </div>
            <Button size="lg" className="h-12">بحث</Button>
          </form>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">خدماتنا</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CalendarCheck, title: "حجز المواعيد", desc: "احجز موعدك مع الطبيب المناسب في الوقت المناسب" },
            { icon: BedDouble, title: "حجز الغرف", desc: "غرف إقامة بمستويات مختلفة مع معرفة السعر مسبقًا" },
            { icon: FlaskConical, title: "الفحوصات المخبرية", desc: "احجز تحاليل وفحوصات الأشعة دون زيارة مسبقة" },
            { icon: Stethoscope, title: "الخدمات الطبية", desc: "خدمات متنوعة من استشارات إلى برامج متابعة" },
          ].map((s) => (
            <Card key={s.title} className="text-center transition-shadow hover:shadow-lg">
              <CardContent className="pt-6">
                <s.icon className="mx-auto mb-3 h-10 w-10 text-primary" />
                <h3 className="mb-2 font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">كيف يعمل نبض؟</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { n: "١", title: "أنشئ حسابك", desc: "سجّل بياناتك في دقيقة، وبعد موافقة الإدارة يصبح حسابك جاهزًا" },
              { n: "٢", title: "اختر المستشفى والخدمة", desc: "تصفّح المستشفيات والأقسام والأطباء واختر ما يناسبك" },
              { n: "٣", title: "أكّد حجزك", desc: "اختر التاريخ والوقت، واستلم إشعارًا بالتأكيد فورًا" },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="mb-2 font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="container py-16">
        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          {[
            { icon: Building2, value: stats.hospitals, label: "مستشفى شريك" },
            { icon: Stethoscope, value: stats.doctors, label: "طبيب" },
            { icon: CalendarCheck, value: stats.bookings, label: "حجز منجز" },
            { icon: Star, value: "4.5", label: "متوسط التقييم" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <s.icon className="mx-auto mb-2 h-6 w-6 text-accent" />
                <div className="text-3xl font-extrabold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y bg-card py-10">
        <div className="container flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> بياناتك محمية ومشفّرة</span>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> تأكيد فوري للحجوزات</span>
          <span className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" /> مستشفيات معتمدة ومراجعة</span>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">هل أنت مستشفى أو مركز طبي؟</h2>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          انضم إلى نبض وأدر حجوزاتك وخدماتك وغرفك من لوحة تحكم واحدة.
        </p>
        <div className="flex justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/hospital/register">سجّل مستشفاك <ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">حساب مريض</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <span className="flex items-center gap-2 font-bold text-primary">
            <HeartPulse className="h-5 w-5" /> نبض
          </span>
          <span>رعاية أقرب، حجز أسهل — جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
