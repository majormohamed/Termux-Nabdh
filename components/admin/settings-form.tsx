"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SystemSettingsForm({ settings }: { settings: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>({
    site_name: settings.site_name ?? "نبض",
    support_email: settings.support_email ?? "",
    booking_cancel_hours: settings.booking_cancel_hours ?? "24",
  });
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (res.ok) toast.success("تم حفظ الإعدادات"); else toast.error("فشل الحفظ");
  }

  const labels: Record<string, string> = {
    site_name: "اسم المنصة",
    support_email: "بريد الدعم",
    booking_cancel_hours: "مهلة الإلغاء (ساعة)",
  };

  return (
    <div className="space-y-4">
      {Object.entries(values).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <Label>{labels[key] ?? key}</Label>
          <Input value={value} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
        </div>
      ))}
      <Button onClick={save} disabled={loading}>
        {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </Button>
    </div>
  );
}
