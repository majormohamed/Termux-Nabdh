"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: fd.get("password"),
        confirmPassword: fd.get("confirmPassword"),
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(json.error ?? "حدث خطأ");
      return;
    }
    toast.success(json.message);
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>كلمة المرور الجديدة</Label>
        <Input name="password" type="password" dir="ltr" required minLength={8} />
      </div>
      <div className="space-y-2">
        <Label>تأكيد كلمة المرور</Label>
        <Input name="confirmPassword" type="password" dir="ltr" required minLength={8} />
      </div>
      <Button className="w-full" disabled={loading || !token}>
        {loading ? "جاري الحفظ..." : "تغيير كلمة المرور"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription>اختر كلمة مرور جديدة لحسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <ResetForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
