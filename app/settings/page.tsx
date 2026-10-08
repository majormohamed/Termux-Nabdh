import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAuth();

  return (
    <AppShell title="الإعدادات">
      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">الأمان</CardTitle>
            <CardDescription>إدارة كلمة المرور وحسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/forgot-password">تغيير كلمة المرور</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">التفضيلات</CardTitle>
            <CardDescription>اللغة والإشعارات (قريبًا: الإنجليزية)</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            الواجهة الحالية: العربية (RTL). دعم الإنجليزية قيد التطوير.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
