import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { BellOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireAuth();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AppShell title="الإشعارات">
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BellOff className="mx-auto mb-3 h-12 w-12 opacity-30" />
            لا توجد إشعارات
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.isRead ? "opacity-70" : ""}>
              <CardContent className="flex items-start justify-between gap-4 pt-4">
                <div>
                  <div className={n.isRead ? "" : "font-bold"}>{n.title}</div>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
