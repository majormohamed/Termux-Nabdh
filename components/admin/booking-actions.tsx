"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminBookingActions({ bookingId, status }: { bookingId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(s: string) {
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) toast.success(json.message); else toast.error(json.error);
    router.refresh();
  }

  if (status === "COMPLETED" || status === "CANCELLED" || status === "REJECTED") return null;

  return (
    <div className="flex gap-1">
      {status === "PENDING" && (
        <Button size="icon" variant="ghost" className="text-emerald-600" title="تأكيد" disabled={loading} onClick={() => setStatus("CONFIRMED")}>
          <Check className="h-4 w-4" />
        </Button>
      )}
      {status === "CONFIRMED" && (
        <Button size="icon" variant="ghost" className="text-primary" title="إكمال" disabled={loading} onClick={() => setStatus("COMPLETED")}>
          <CheckCheck className="h-4 w-4" />
        </Button>
      )}
      <Button size="icon" variant="ghost" className="text-destructive" title="إلغاء" disabled={loading} onClick={() => setStatus("CANCELLED")}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
