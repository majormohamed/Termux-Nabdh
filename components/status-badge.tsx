import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  PENDING: { label: "قيد المراجعة", variant: "warning" },
  ACTIVE: { label: "نشط", variant: "success" },
  APPROVED: { label: "مقبول", variant: "success" },
  CONFIRMED: { label: "مؤكد", variant: "success" },
  COMPLETED: { label: "مكتمل", variant: "secondary" },
  REJECTED: { label: "مرفوض", variant: "destructive" },
  CANCELLED: { label: "ملغي", variant: "outline" },
  SUSPENDED: { label: "موقوف", variant: "destructive" },
  CHANGES_REQUESTED: { label: "مطلوب تعديل", variant: "warning" },
  AVAILABLE: { label: "متاحة", variant: "success" },
  RESERVED: { label: "محجوزة", variant: "warning" },
  OCCUPIED: { label: "مشغولة", variant: "default" },
  MAINTENANCE: { label: "صيانة", variant: "outline" },
  APPOINTMENT: { label: "موعد", variant: "default" },
  ROOM: { label: "غرفة", variant: "secondary" },
  LAB_TEST: { label: "فحص مختبر", variant: "secondary" },
  RADIOLOGY: { label: "أشعة", variant: "secondary" },
  MEDICAL_SERVICE: { label: "خدمة طبية", variant: "secondary" },
  GENERAL: { label: "عام", variant: "default" },
  SPECIALIZED: { label: "تخصصي", variant: "secondary" },
  CLINIC: { label: "عيادة", variant: "outline" },
  MEDICAL_CENTER: { label: "مركز طبي", variant: "secondary" },
};

export function StatusBadge({ value }: { value: string }) {
  const s = statusMap[value] ?? { label: value, variant: "outline" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
