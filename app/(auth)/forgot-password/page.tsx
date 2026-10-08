"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const email = new FormData(e.currentTarget).get("email") as string;
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    setLoading(false);
    toast.success(json.message ?? "تم");
    if (json.resetUrl) setDevUrl(json.resetUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>استعادة كلمة المرور</CardTitle>
          <CardDescription>أدخل بريدك وسنرسل لك رابط إعادة التعيين</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input name="email" type="email" dir="ltr" required />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال الرابط"}
            </Button>
          </form>
          {devUrl && (
            <p className="mt-3 rounded bg-muted p-2 text-xs" dir="ltr">
              DEV: <Link className="text-primary underline" href={devUrl}>{devUrl}</Link>
            </p>
          )}
          <p className="mt-4 text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">العودة لتسجيل الدخول</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
