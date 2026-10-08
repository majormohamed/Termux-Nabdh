"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Hospital = { id: string; name: string };
type HospitalDetail = {
  departments: { id: string; name: string }[];
  doctors: { id: string; fullName: string; departmentId?: string | null }[];
  services: { id: string; name: string; price?: number | null }[];
  medicalTests: { id: string; name: string; category?: string | null }[];
  rooms: { id: string; number: string; type?: string | null; status: string }[];
};

const typeLabels: Record<string, string> = {
  APPOINTMENT: "موعد مع طبيب",
  ROOM: "حجز غرفة",
  LAB_TEST: "فحص مختبر",
  RADIOLOGY: "فحص أشعة",
  MEDICAL_SERVICE: "خدمة طبية",
};

function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();

  const [type, setType] = useState(params.get("type") ?? "APPOINTMENT");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState(params.get("hospitalId") ?? "");
  const [detail, setDetail] = useState<HospitalDetail | null>(null);
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState(params.get("doctorId") ?? "");
  const [serviceId, setServiceId] = useState(params.get("serviceId") ?? "");
  const [testId, setTestId] = useState(params.get("testId") ?? "");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/hospitals")
      .then((r) => r.json())
      .then((d) => setHospitals(d.hospitals ?? []));
  }, []);

  useEffect(() => {
    if (!hospitalId) {
      setDetail(null);
      return;
    }
    fetch(`/api/hospitals/${hospitalId}`)
      .then((r) => r.json())
      .then((d) => setDetail(d.hospital ?? null));
  }, [hospitalId]);

  const filteredDoctors =
    detail?.doctors.filter((d) => !departmentId || d.departmentId === departmentId) ?? [];

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        hospitalId,
        doctorId: doctorId || undefined,
        serviceId: serviceId || undefined,
        medicalTestId: testId || undefined,
        roomId: roomId || undefined,
        date,
        startTime: time,
        notes: notes || undefined,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(json.error ?? "حدث خطأ");
      return;
    }
    toast.success(json.message ?? "تم إنشاء الحجز");
    router.push("/bookings");
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" /> حجز جديد — {typeLabels[type]}
        </CardTitle>
        <CardDescription>اتبع الخطوات: المستشفى ← التفاصيل ← التاريخ والوقت ← التأكيد</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>نوع الحجز</Label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label>المستشفى *</Label>
          <Select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
            <option value="">اختر المستشفى</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </Select>
        </div>

        {detail && type === "APPOINTMENT" && (
          <>
            <div className="space-y-2">
              <Label>القسم</Label>
              <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">كل الأقسام</option>
                {detail.departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الطبيب *</Label>
              <Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">اختر الطبيب</option>
                {filteredDoctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </Select>
            </div>
          </>
        )}

        {detail && (type === "LAB_TEST" || type === "RADIOLOGY") && (
          <div className="space-y-2">
            <Label>الفحص *</Label>
            <Select value={testId} onChange={(e) => setTestId(e.target.value)}>
              <option value="">اختر الفحص</option>
              {detail.medicalTests
                .filter((t) => (type === "LAB_TEST" ? t.category === "LAB" : t.category !== "LAB"))
                .map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </Select>
          </div>
        )}

        {detail && type === "MEDICAL_SERVICE" && (
          <div className="space-y-2">
            <Label>الخدمة *</Label>
            <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">اختر الخدمة</option>
              {detail.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.price ? `— ${s.price} ر.س` : ""}
                </option>
              ))}
            </Select>
          </div>
        )}

        {detail && type === "ROOM" && (
          <div className="space-y-2">
            <Label>الغرفة *</Label>
            <Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              <option value="">اختر الغرفة</option>
              {detail.rooms
                .filter((r) => r.status === "AVAILABLE")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    غرفة {r.number} — {r.type}
                  </option>
                ))}
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>التاريخ *</Label>
            <Input type="date" dir="ltr" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>الوقت *</Label>
            <Input type="time" dir="ltr" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>ملاحظات</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <Button className="w-full" size="lg" onClick={submit} disabled={loading || !hospitalId || !date || !time}>
          {loading ? "جاري الحجز..." : "تأكيد الحجز"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function NewBookingPage() {
  return (
    <div className="min-h-screen bg-muted/40 p-4 py-10">
      <Suspense>
        <BookingWizard />
      </Suspense>
    </div>
  );
}
