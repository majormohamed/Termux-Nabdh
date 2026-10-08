import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  await requireRole("SUPER_ADMIN");
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AppShell title="سجل العمليات (Audit Logs)">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>العملية</TableHead>
              <TableHead>الكيان</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>الوقت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">لا توجد سجلات</TableCell>
              </TableRow>
            )}
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.user?.fullName ?? "نظام"}</TableCell>
                <TableCell className="font-mono text-xs" dir="ltr">{l.action}</TableCell>
                <TableCell>
                  {l.entity ?? "—"} {l.entityId ? <span className="text-xs text-muted-foreground">({l.entityId.slice(0, 8)}…)</span> : ""}
                </TableCell>
                <TableCell dir="ltr" className="text-xs">{l.ipAddress ?? "—"}</TableCell>
                <TableCell className="text-xs">{formatDateTime(l.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}
