"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { HOSPITAL_PERMISSIONS, HOSPITAL_PERMISSION_LABELS } from "@/lib/permissions";

type Hospital = {
  id: string;
  name: string;
  permissions: { permission: string; enabled: boolean }[];
};

export function PermissionsManager({ hospitals }: { hospitals: Hospital[] }) {
  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id ?? "");
  const hospital = hospitals.find((h) => h.id === hospitalId);
  const [perms, setPerms] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    hospital?.permissions.forEach((p) => (map[p.permission] = p.enabled));
    return map;
  });
  const [loading, setLoading] = useState<string | null>(null);

  function onHospitalChange(id: string) {
    setHospitalId(id);
    const h = hospitals.find((x) => x.id === id);
    const map: Record<string, boolean> = {};
    h?.permissions.forEach((p) => (map[p.permission] = p.enabled));
    setPerms(map);
  }

  async function toggle(permission: string, enabled: boolean) {
    setLoading(permission);
    const res = await fetch("/api/admin/hospital-permissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospitalId, permission, enabled }),
    });
    setLoading(null);
    if (!res.ok) {
      toast.error("فشل تحديث الصلاحية");
      return;
    }
    setPerms((prev) => ({ ...prev, [permission]: enabled }));
    toast.success("تم تحديث الصلاحية");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">اختر المستشفى ثم فعّل أو أوقف الصلاحيات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={hospitalId} onChange={(e) => onHospitalChange(e.target.value)} className="max-w-sm">
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </Select>

        {hospital && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HOSPITAL_PERMISSIONS.map((p) => {
              const enabled = perms[p] ?? true;
              return (
                <label
                  key={p}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                >
                  <span className="text-sm">{HOSPITAL_PERMISSION_LABELS[p]}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    disabled={loading === p}
                    onClick={() => toggle(p, !enabled)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? "left-0.5" : "left-[22px]"}`}
                    />
                  </button>
                </label>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
