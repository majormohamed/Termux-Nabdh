import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const sessionUser = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { roles: { include: { role: true } } },
  });

  if (!user) return null;

  return (
    <AppShell title="الملف الشخصي">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {user.fullName}
            <StatusBadge value={user.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">البريد: </span><span dir="ltr">{user.email}</span></div>
          <div><span className="text-muted-foreground">الهاتف: </span><span dir="ltr">{user.phone ?? "—"}</span></div>
          <div><span className="text-muted-foreground">تاريخ الميلاد: </span>{formatDate(user.birthDate)}</div>
          <div><span className="text-muted-foreground">الجنس: </span>{user.gender === "MALE" ? "ذكر" : user.gender === "FEMALE" ? "أنثى" : "—"}</div>
          <div className="sm:col-span-2"><span className="text-muted-foreground">العنوان: </span>{user.address ?? "—"}</div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">الأدوار: </span>
            {user.roles.map((r) => r.role.name).join("، ")}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
