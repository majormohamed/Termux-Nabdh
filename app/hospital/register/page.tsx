"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { hospitalRegisterSchema, type HospitalRegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HospitalRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HospitalRegisterInput>({ resolver: zodResolver(hospitalRegisterSchema) });

  async function onSubmit(data: HospitalRegisterInput) {
    setLoading(true);
    const res = await fetch("/api/hospitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(json.error ?? "حدث خطأ");
      return;
    }
    setDone(true);
    toast.success(json.message);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <Building2 className="mx-auto mb-4 h-14 w-14 text-primary" />
            <h2 className="mb-2 text-xl font-bold">تم استلام طلبك بنجاح</h2>
            <p className="mb-6 text-muted-foreground">
              سيقوم فريق نبض بمراجعة بيانات ومستندات المستشفى، وسيصلك إشعار بالنتيجة.
            </p>
            <Button asChild><Link href="/">العودة للرئيسية</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const field = (name: keyof HospitalRegisterInput, label: string, dir?: "ltr") => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input dir={dir} {...register(name)} />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40 p-4 py-10">
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">تسجيل مستشفى في نبض</CardTitle>
          <CardDescription>أكمل البيانات التالية وسيراجع طلبك المدير العام</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* بيانات المستشفى */}
            <section>
              <h3 className="mb-4 border-b pb-2 font-bold">بيانات المستشفى</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field("name", "اسم المستشفى *")}
                {field("tradeName", "الاسم التجاري")}
                <div className="space-y-2">
                  <Label>نوع المستشفى *</Label>
                  <Select {...register("type")}>
                    <option value="GENERAL">عام</option>
                    <option value="SPECIALIZED">تخصصي</option>
                    <option value="CLINIC">عيادة</option>
                    <option value="MEDICAL_CENTER">مركز طبي</option>
                  </Select>
                </div>
                {field("licenseNumber", "رقم الترخيص *", "ltr")}
                <div className="space-y-2">
                  <Label>تاريخ الترخيص *</Label>
                  <Input type="date" dir="ltr" {...register("licenseDate")} />
                  {errors.licenseDate && <p className="text-xs text-destructive">{errors.licenseDate.message}</p>}
                </div>
                {field("country", "الدولة *")}
                {field("city", "المدينة *")}
                {field("address", "العنوان *")}
                {field("phone", "الهاتف *", "ltr")}
                {field("email", "البريد الإلكتروني *", "ltr")}
                {field("website", "الموقع الإلكتروني", "ltr")}
                {field("logoUrl", "رابط الشعار", "ltr")}
                <div className="space-y-2 sm:col-span-2">
                  <Label>وصف المستشفى</Label>
                  <Textarea {...register("description")} rows={3} />
                </div>
              </div>
            </section>

            {/* بيانات المسؤول */}
            <section>
              <h3 className="mb-4 border-b pb-2 font-bold">بيانات المسؤول</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field("contactName", "اسم المسؤول *")}
                {field("contactJobTitle", "وظيفة المسؤول *")}
                {field("contactPhone", "هاتف المسؤول *", "ltr")}
                {field("contactEmail", "بريد المسؤول *", "ltr")}
                {field("contactNationalId", "رقم الهوية *", "ltr")}
              </div>
            </section>

            {/* المستندات */}
            <section>
              <h3 className="mb-4 border-b pb-2 font-bold">المستندات (روابط بعد الرفع)</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field("licenseDocUrl", "مستند الترخيص", "ltr")}
                {field("commercialRecordUrl", "السجل التجاري", "ltr")}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                ارفع المستندات إلى التخزين المُعد في STORAGE_URL ثم ضع الروابط هنا.
              </p>
            </section>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال طلب التسجيل"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
