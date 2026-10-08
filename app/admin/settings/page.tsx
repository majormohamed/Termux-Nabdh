import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemSettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireRole("SUPER_ADMIN");
  const settings = await prisma.systemSetting.findMany();

  return (
    <AppShell title="إعدادات النظام">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">الإعدادات العامة</CardTitle>
        </CardHeader>
        <CardContent>
          <SystemSettingsForm
            settings={Object.fromEntries(settings.map((s) => [s.key, s.value]))}
          />
        </CardContent>
      </Card>
    </AppShell>
  );
}
