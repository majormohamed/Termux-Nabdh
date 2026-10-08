"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function cancel() {
    if (!confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) return;
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED", cancelReason: "إلغاء من المستخدم" }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(json.error ?? "حدث خطأ");
      return;
    }
    toast.success("تم إلغاء الحجز");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-destructive" onClick={cancel} disabled={loading}>
      إلغاء
    </Button>
  );
}
